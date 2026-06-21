import { useEffect, useState } from "react"
import { useSearchParams, useNavigate, useParams } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import MainLayout from "@/components/layout/MainLayout"
import { Search, MapPin, Briefcase, Clock, ChevronLeft, ChevronRight, Building2, Heart } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const getIconComponent = (iconName: string) => {
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle
  return Icon
}

export default function JobsByEvent() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { category: categoryRouteParam } = useParams<{ category: string }>()
  const categoryParam = categoryRouteParam || searchParams.get("category") || "Lễ hội Âm nhạc"

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
      const { data: { user } } = await supabase.auth.getUser()
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
  }, [])

  const fetchEvents = async () => {
    setLoading(true)
    let catName = categoryParam
    const { data: catData } = await supabase
      .from("event_categories")
      .select("name")
      .eq("slug", categoryParam)
      .maybeSingle()
    if (catData) {
      catName = catData.name
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
    const { data: { user } } = await supabase.auth.getUser()
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

  return (
    <MainLayout>
      <div className="space-y-6 pb-12 animate-in fade-in duration-300">
        
        {/* THANH TRƯỢT DANH MỤC HƯỚNG DẪN DẠNG TOPCV */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm">
          <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest mb-4">
            Khám phá việc làm theo loại hình sự kiện
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
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
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all text-center gap-2 group ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                      : "border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900 hover:bg-slate-50/30"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-105 ${cat.color}`}>
                    <CatIcon className="w-5 h-5" />
                  </div>
                  <p className={`text-xs font-bold leading-tight ${isSelected ? "text-emerald-700 dark:text-emerald-450" : "text-slate-700 dark:text-slate-350"}`}>
                    {cat.name}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* THANH TÌM KIẾM CHI TIẾT */}
        <div className="bg-gradient-to-r from-emerald-900 to-indigo-950 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="max-w-3xl space-y-4 relative z-10">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Tìm việc làm sự kiện <span className="text-emerald-400">{categoryParam}</span> tại Đà Nẵng
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Chủ động tham gia điều hành sự kiện lớn nhỏ và nhận giấy chứng nhận từ BTC.
            </p>

            <form onSubmit={handleSearchSubmit} className="bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-lg flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Nhập tên sự kiện, công việc cần tìm..."
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  className="w-full h-11 bg-transparent text-sm font-semibold text-slate-850 dark:text-slate-100 outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="w-full md:w-56 flex items-center gap-2 px-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                <select
                  value={selectedWard}
                  onChange={e => {
                    setSelectedWard(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full h-11 bg-transparent text-sm font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
                >
                  <option value="">Tất cả Phường/Xã</option>
                  {wards.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <Button type="submit" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 h-12 shadow-sm shrink-0">
                Tìm kiếm
              </Button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* BỘ LỌC CỘT TRÁI */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-5 rounded-[2rem] shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider border-b pb-3 border-slate-100 dark:border-slate-800">
                  Lọc theo Quyền lợi
                </h3>
                <div className="space-y-3 pt-3">
                  {benefitOptions.map(benefit => (
                    <label key={benefit} className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 dark:text-slate-450 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200">
                      <input
                        type="checkbox"
                        checked={selectedBenefits.includes(benefit)}
                        onChange={() => handleBenefitChange(benefit)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>{benefit}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider border-b pb-3 border-slate-100 dark:border-slate-800">
                  Yêu cầu kinh nghiệm
                </h3>
                <div className="space-y-3 pt-3">
                  {experienceOptions.map(exp => (
                    <label key={exp} className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 dark:text-slate-450 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200">
                      <input
                        type="checkbox"
                        checked={selectedExperiences.includes(exp)}
                        onChange={() => setSelectedExperiences(prev => prev.includes(exp) ? prev.filter(e => e !== exp) : [...prev, exp])}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>{exp}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* DANH SÁCH VIỆC LÀM CỘT PHẢI */}
          <div className="lg:col-span-9 space-y-6">
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800/80 p-6 rounded-[2rem] shadow-sm">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  Kết quả tìm kiếm Loại hình sự kiện
                </h3>
                <span className="text-xs font-bold bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-500">
                  Phân trang {currentPage} / {totalPages}
                </span>
              </div>

              {loading ? (
                <div className="text-center py-20">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mx-auto"></div>
                  <p className="text-xs font-bold text-slate-400 mt-2">Đang tải dữ liệu...</p>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                  <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 font-bold text-base">Không tìm thấy sự kiện phù hợp.</p>
                  <p className="text-slate-400 text-xs mt-1">Hãy chọn danh mục khác hoặc thay đổi bộ lọc tìm kiếm.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {events.map(job => (
                    <div key={job.id} className="border-2 border-slate-50 dark:border-slate-850 hover:border-emerald-200 dark:hover:border-emerald-900 rounded-2xl p-5 hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-300 flex gap-4 bg-slate-50/10 dark:bg-slate-900/40 relative">
                      <Avatar className="h-16 w-16 border rounded-2xl shrink-0 bg-white shadow-sm">
                        <AvatarImage src={job.profiles?.avatar_url} className="object-cover rounded-2xl" />
                        <AvatarFallback className="bg-emerald-50 text-emerald-600 font-black rounded-2xl text-lg">
                          {job.profiles?.full_name?.charAt(0).toUpperCase() || <Building2 />}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex justify-between items-start gap-2">
                          <h4 
                            onClick={() => navigate(`/jobs/${job.slug || job.id}`)}
                            className="font-extrabold text-slate-900 dark:text-slate-100 text-base leading-snug truncate hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                          >
                            {job.title}
                          </h4>
                          <span className="text-emerald-600 dark:text-emerald-400 text-sm font-black shrink-0">
                            {job.benefits}
                          </span>
                        </div>

                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {job.profiles?.full_name || "Nhà tuyển dụng"}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-450 dark:text-slate-500 font-semibold pt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {job.danang_wards?.name ? `P. ${job.danang_wards.name}` : job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {job.position_type}
                          </span>
                          <span className="flex items-center gap-1 text-rose-600 dark:text-rose-455 font-bold">
                            <Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            Hạn nộp: {job.application_deadline ? new Date(job.application_deadline).toLocaleDateString("vi-VN") : "Hôm nay"}
                          </span>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-100 border-none font-bold text-[10px]">
                            Cần {job.slots_needed} vị trí
                          </Badge>

                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleToggleBookmark(job.id)}
                              variant="ghost" 
                              className="h-9 w-9 p-0 rounded-xl"
                            >
                              <Heart className={`w-4 h-4 ${bookmarkedEvents[job.id] ? "fill-rose-500 text-rose-500" : "text-slate-400"}`} />
                            </Button>
                            <Button 
                              onClick={() => navigate(`/jobs/${job.slug || job.id}`)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl h-9 px-4 shadow-sm"
                            >
                              Ứng tuyển ngay
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* PHÂN TRANG */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 pt-8">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    className="rounded-xl h-10 w-10 p-0 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    className="rounded-xl h-10 w-10 p-0 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
