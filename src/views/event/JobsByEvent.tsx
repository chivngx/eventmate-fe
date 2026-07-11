"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useNavigate, useParams } from "@/lib/router"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/components/providers/AuthProvider"
import { slugify } from "@/lib/slugify"
import MainLayout from "@/components/layout/MainLayout"
import EventCard from "@/components/event/EventCard"
import { Search, Briefcase, ChevronLeft, ChevronRight } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { Button } from "@/components/ui/button"

const getIconComponent = (iconName: string) => {
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle
  return Icon
}

export default function JobsByEvent() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { category: categoryRouteParam } = useParams<{ category: string }>()
  const categoryParam = categoryRouteParam || searchParams.get("category") || "Lễ hội Âm nhạc"

  // 🔒 P1.1: user từ context (thay getUser() lặp)
  const { user, loading: authLoading } = useUser()

  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<any[]>([])
  const [wards, setWards] = useState<any[]>([])

  // Trạng thái tìm kiếm & lọc
  const [keyword, setKeyword] = useState("")
  const [selectedWard, setSelectedWard] = useState("")
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([])
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([])
  const [bookmarkedEvents, setBookmarkedEvents] = useState<Record<string, boolean>>({})

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 8

  // Danh mục sự kiện
  const [categoryOptions, setCategoryOptions] = useState<any[]>([])

  const benefitOptions = ["Cấp chứng nhận", "Có phụ cấp ăn uống", "Hỗ trợ lương cứng", "Thỏa thuận"]
  const experienceOptions = ["Không yêu cầu kinh nghiệm", "Dưới 1 năm", "1 - 2 năm", "Trên 2 năm"]

  useEffect(() => {
    if (authLoading) return
    const fetchInitialData = async () => {
      // 1. Tải danh mục Phường/Xã Đà Nẵng
      const { data: wardsData } = await supabase
        .from("danang_wards")
        .select("*")
        .order("name", { ascending: true })
      if (wardsData) setWards(wardsData)

      // 2. Tải danh mục sự kiện từ database
      const { data: catData } = await supabase
        .from("event_categories")
        .select("*")
        .order("name", { ascending: true })
      if (catData && catData.length > 0) {
        setCategoryOptions(catData.map(c => ({
          name: c.name,
          iconName: c.icon,
          color: c.color
        })))
      }

      // 3. Lấy bookmarks nếu đã đăng nhập
      if (user) {
        const { data: bookmarks } = await supabase
          .from("event_bookmarks")
          .select("event_id")
          .eq("student_id", user.id)
        if (bookmarks) {
          const map: Record<string, boolean> = {}
          bookmarks.forEach((b) => {
            map[b.event_id] = true
          })
          setBookmarkedEvents(map)
        }
      }
    }
    fetchInitialData()
  }, [user, authLoading])

  const fetchEvents = async () => {
    setLoading(true)
    let catName = categoryParam
    // 🔧 Fix: slug có thể null trong DB — fetch all + match client-side
    const { data: allCats } = await supabase.from("event_categories").select("name, slug")
    const match = (allCats || []).find((c: any) =>
      c.slug === categoryParam || (c.slug === null && slugify(c.name) === categoryParam)
    )
    if (match) {
      catName = match.name
    }

    let query = supabase
      .from("events")
      .select("*, profiles(id, full_name, avatar_url, slug), danang_wards(name)", { count: "exact" })
      .eq("category", catName)

    if (keyword) {
      query = query.ilike("title", `%${keyword}%`)
    }
    if (selectedWard) {
      query = query.eq("ward_id", Number(selectedWard))
    }
    if (selectedBenefits.length > 0) {
      query = query.in("benefits", selectedBenefits)
    }

    const from = (currentPage - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    query = query
      .order("created_at", { ascending: false })
      .range(from, to)

    const { data, count, error } = await query

    if (!error && data) {
      setEvents(data)
      if (count !== null) {
        setTotalPages(Math.ceil(count / itemsPerPage) || 1)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchEvents()
  }, [categoryParam, selectedWard, selectedBenefits, currentPage])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchEvents()
  }

  const handleToggleBookmark = async (eventId: string) => {
    if (!user) {
      window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode: "login" } }))
      return
    }

    const isBookmarked = !!bookmarkedEvents[eventId]
    if (isBookmarked) {
      const { error } = await supabase
        .from("event_bookmarks")
        .delete()
        .eq("student_id", user.id)
        .eq("event_id", eventId)
      if (!error) setBookmarkedEvents(prev => ({ ...prev, [eventId]: false }))
    } else {
      const { error } = await supabase
        .from("event_bookmarks")
        .insert([{ student_id: user.id, event_id: eventId }])
      if (!error) setBookmarkedEvents(prev => ({ ...prev, [eventId]: true }))
    }
  }

  const handleBenefitChange = (benefit: string) => {
    setSelectedBenefits(prev =>
      prev.includes(benefit) ? prev.filter(b => b !== benefit) : [...prev, benefit]
    )
    setCurrentPage(1)
  }

  const handleNavigateToJob = (jobId: string) => {
    const target = events.find(e => e.id === jobId)
    navigate(`/jobs/${target?.slug || jobId}`)
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300">

        {/* CATEGORY PILLS RAIL — horizontal scroll on small screens */}
        {categoryOptions.length > 0 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-3">
              Khám phá theo loại hình sự kiện
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {categoryOptions.map(cat => {
                const CatIcon = getIconComponent(cat.iconName)
                const isSelected = categoryParam === cat.name || categoryParam === cat.slug
                return (
                  <button
                    key={cat.name}
                    onClick={() => {
                      navigate(`/events/${cat.slug || cat.name}`)
                      setCurrentPage(1)
                    }}
                    className={`shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      isSelected
                        ? "bg-accent text-primary border-primary/30"
                        : "bg-white text-slate-600 border-slate-200 hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    <CatIcon className="w-4 h-4" />
                    {cat.name}
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* HEADER — flat card with breadcrumb + title + search */}
        <header className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 space-y-4">
          {/* Breadcrumb */}
          <nav className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
            <button onClick={() => navigate("/")} className="hover:text-primary transition-colors">Trang chủ</button>
            <ChevronRight className="w-3 h-3 shrink-0 text-slate-300" />
            <span className="text-slate-400">Việc làm theo sự kiện</span>
            <ChevronRight className="w-3 h-3 shrink-0 text-slate-300" />
            <span className="text-foreground font-medium truncate">{categoryParam}</span>
          </nav>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
              Sự kiện <span className="text-primary">{categoryParam}</span> tại Đà Nẵng
            </h1>
            <p className="text-sm text-slate-500 mt-1.5">
              Chủ động tham gia điều hành sự kiện lớn nhỏ và nhận giấy chứng nhận từ BTC.
            </p>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 focus-within:border-primary transition-colors">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Nhập tên sự kiện, công việc cần tìm..."
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                className="w-full bg-transparent text-sm text-foreground outline-none font-medium"
              />
            </div>
            <select
              value={selectedWard}
              onChange={e => {
                setSelectedWard(e.target.value)
                setCurrentPage(1)
              }}
              className="border border-slate-200 rounded-lg px-3 py-2.5 bg-white text-sm font-medium text-slate-600 focus:outline-none focus:border-primary sm:w-48"
            >
              <option value="">Tất cả Phường/Xã</option>
              {wards.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            <Button type="submit" className="rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold h-11 px-6 shrink-0">
              Tìm kiếm
            </Button>
          </form>
        </header>

        {/* GRID: filters sidebar + main list */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

          {/* FILTERS SIDEBAR */}
          <aside className="space-y-4">
            <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5 lg:sticky lg:top-4">
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-3">Quyền lợi</h3>
                <div className="flex flex-wrap gap-2">
                  {benefitOptions.map(benefit => (
                    <button
                      key={benefit}
                      type="button"
                      onClick={() => handleBenefitChange(benefit)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                        selectedBenefits.includes(benefit)
                          ? "bg-accent text-primary border-primary/30"
                          : "bg-white text-slate-600 border-slate-200 hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {benefit}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-3">Kinh nghiệm</h3>
                <div className="flex flex-wrap gap-2">
                  {experienceOptions.map(exp => (
                    <button
                      key={exp}
                      type="button"
                      onClick={() => setSelectedExperiences(prev => prev.includes(exp) ? prev.filter(e => e !== exp) : [...prev, exp])}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                        selectedExperiences.includes(exp)
                          ? "bg-accent text-primary border-primary/30"
                          : "bg-white text-slate-600 border-slate-200 hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {exp}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </aside>

          {/* MAIN LIST */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {loading ? "Đang tải..." : `${events.length} sự kiện phù hợp`}
              </p>
              <span className="text-xs text-slate-500">Trang {currentPage} / {totalPages}</span>
            </div>

            {loading ? (
              <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
                <p className="text-xs text-slate-500 mt-3">Đang tải dữ liệu...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-20 bg-white border border-dashed border-slate-300 rounded-2xl">
                <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-base font-bold text-foreground">Không tìm thấy sự kiện phù hợp.</p>
                <p className="text-slate-500 text-sm mt-1">Hãy chọn danh mục khác hoặc thay đổi bộ lọc tìm kiếm.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((job, idx) => (
                  <EventCard
                    key={job.id}
                    job={job}
                    idx={idx}
                    isBookmarked={!!bookmarkedEvents[job.id]}
                    onToggleBookmark={handleToggleBookmark}
                    onNavigateToJob={handleNavigateToJob}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 pt-4">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="rounded-lg h-10 w-10 p-0"
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-semibold text-foreground">
                  Trang {currentPage} / {totalPages}
                </span>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="rounded-lg h-10 w-10 p-0"
                  aria-label="Trang sau"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
