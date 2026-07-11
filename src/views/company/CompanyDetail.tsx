"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "@/lib/router"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/components/providers/AuthProvider"
import MainLayout from "@/components/layout/MainLayout"
import { Link as LinkIcon, Users, MapPin, Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Copy, Bookmark, FileText, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SkeletonCompanyDetail } from "@/components/ui/Skeleton"

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // 🔒 P1.1: user + role từ context (thay getUser() + profiles.select lặp)
  const { user, role, loading: authLoading } = useUser()

  const [company, setCompany] = useState<any>(null)
  const [companyEvents, setCompanyEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isFollowed, setIsFollowed] = useState(false)
  const [activeTab, setActiveTab] = useState<"about" | "jobs">("about")

  // States for Trang chủ
  const [isIntroExpanded, setIsIntroExpanded] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [jobSearchTerm, setJobSearchTerm] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")

  // Floating banner trigger
  const [showFloatingBanner, setShowFloatingBanner] = useState(false)

  // Bookmarks state for job cards inside company details
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (authLoading) return
    const fetchCompanyDetails = async () => {
      setLoading(true)
      if (user) {
        // Fetch student bookmarks to show on job cards
        const { data: bookmarks } = await supabase
          .from("event_bookmarks")
          .select("event_id")
          .eq("student_id", user.id)
        if (bookmarks) {
          const bmMap: Record<string, boolean> = {}
          bookmarks.forEach(bm => { bmMap[bm.event_id] = true })
          setBookmarkedJobs(bmMap)
        }
      }

      // Fetch company profile details
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || "")
      let profileQuery = supabase.from("profiles").select("*")
      if (isUuid) {
        profileQuery = profileQuery.eq("id", id)
      } else {
        profileQuery = profileQuery.eq("slug", id)
      }
      const { data: profileData } = await profileQuery.maybeSingle()

      if (profileData) {
        setCompany(profileData)

        // Tự động chuyển hướng URL từ ID dạng UUID sang dạng Slug SEO thân thiện
        if (isUuid && profileData.slug) {
          navigate(`/companies/${profileData.slug}`, { replace: true })
        }

        // Fetch events/jobs posted by this company
        const { data: eventsData } = await supabase
          .from("events")
          .select("*, danang_wards(name)")
          .eq("organizer_id", profileData.id)
          .order("created_at", { ascending: false })

        if (eventsData) {
          setCompanyEvents(eventsData)
        }
      }

      setLoading(false)
    }

    fetchCompanyDetails()
  }, [id, user, authLoading])

  // Scroll listener for floating follow banner
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 280) {
        setShowFloatingBanner(true)
      } else {
        setShowFloatingBanner(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (loading) {
    return <SkeletonCompanyDetail />
  }

  if (!company) {
    return (
      <MainLayout role="guest">
        <div className="max-w-5xl mx-auto px-4 text-center py-20">
          <h2 className="text-2xl font-bold text-foreground">Không tìm thấy công ty</h2>
          <p className="text-slate-500 mt-2">Công ty này có thể đã ngừng hoạt động hoặc không tồn tại.</p>
          <Button onClick={() => navigate(-1)} className="mt-4 rounded-lg bg-foreground text-white hover:bg-foreground/90">Quay lại</Button>
        </div>
      </MainLayout>
    )
  }

  const galleryImages = company.company_images
    ? company.company_images.split(',').filter(Boolean)
    : [
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&h=350&q=80",
      "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=600&h=350&q=80",
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&h=350&q=80"
    ]

  const toggleBookmark = async (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode: "login" } }))
      return
    }

    const isCurrentlyBookmarked = !!bookmarkedJobs[eventId]
    if (isCurrentlyBookmarked) {
      const { error } = await supabase
        .from("event_bookmarks")
        .delete()
        .eq("student_id", user.id)
        .eq("event_id", eventId)
      if (!error) setBookmarkedJobs(prev => ({ ...prev, [eventId]: false }))
    } else {
      const { error } = await supabase
        .from("event_bookmarks")
        .insert([{ student_id: user.id, event_id: eventId }])
      if (!error) setBookmarkedJobs(prev => ({ ...prev, [eventId]: true }))
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    alert("Đã sao chép liên kết chia sẻ công ty thành công!")
  }

  const filteredJobs = companyEvents.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(jobSearchTerm.toLowerCase())
    const matchesLocation = selectedLocation ? (job.danang_wards?.name || "").includes(selectedLocation) : true
    return matchesSearch && matchesLocation
  })

  const locationsList = Array.from(new Set(companyEvents.map(job => job.danang_wards?.name).filter(Boolean))) as string[]

  // Reusable job row — EventCard-style: logo + title + meta + bookmark
  const renderJobRow = (job: any) => (
    <div
      key={job.id}
      onClick={() => navigate(`/jobs/${job.slug || job.id}`)}
      className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex items-start justify-between gap-3 cursor-pointer group bg-white"
    >
      <div className="flex gap-3 min-w-0">
        <div className="w-12 h-12 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
          <Avatar className="h-full w-full rounded-lg">
            <AvatarImage src={company.avatar_url} className="object-cover" />
            <AvatarFallback className="rounded-lg bg-slate-100 text-slate-600 text-base font-bold">
              {company.full_name?.charAt(0).toUpperCase() || "O"}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="space-y-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground group-hover:text-slate-900 transition-colors leading-snug line-clamp-1">
            {job.title}
          </h3>
          <p className="text-xs text-slate-500 font-medium truncate">{company.full_name}</p>
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
              <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
              <span className="truncate">
                {job.danang_wards?.name ? `P. ${job.danang_wards.name}` : (job.location || "Đà Nẵng")}
              </span>
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between gap-2 shrink-0">
        <span className="text-sm font-semibold text-slate-600">{job.benefits || "Thỏa thuận"}</span>
        <button
          onClick={(e) => toggleBookmark(job.id, e)}
          aria-label="Lưu sự kiện"
          aria-pressed={!!bookmarkedJobs[job.id]}
          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${bookmarkedJobs[job.id]
            ? "bg-slate-100 border-slate-200 text-slate-600"
            : "bg-white border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300"
            }`}
        >
          <Bookmark className={`w-4 h-4 ${bookmarkedJobs[job.id] ? "fill-current text-slate-600" : ""}`} />
        </button>
      </div>
    </div>
  )

  const renderSearchBar = () => (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="flex-1 flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus-within:border-slate-400 transition-colors">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Tên công việc, vị trí tuyển nhân sự..."
          value={jobSearchTerm}
          onChange={(e) => setJobSearchTerm(e.target.value)}
          className="bg-transparent text-sm text-foreground outline-none w-full font-medium"
        />
      </div>
      <select
        value={selectedLocation}
        onChange={(e) => setSelectedLocation(e.target.value)}
        className="border border-slate-200 rounded-lg px-3 py-2 bg-white text-sm font-medium text-slate-600 focus:outline-none focus:border-slate-400"
      >
        <option value="">Tất cả khu vực</option>
        {locationsList.map(loc => (
          <option key={loc} value={loc}>{loc}</option>
        ))}
      </select>
    </div>
  )

  return (
    <MainLayout role={role || "guest"}>
      <div className="max-w-5xl mx-auto px-4 pt-1 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* HEADER CARD — logo + name + meta + follow button */}
        <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
              <Avatar className="h-full w-full rounded-lg">
                <AvatarImage src={company.avatar_url} className="object-cover" />
                <AvatarFallback className="rounded-lg bg-slate-100 text-slate-600 text-2xl font-bold">
                  {company.full_name?.charAt(0).toUpperCase() || "O"}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
                {company.full_name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-slate-500">
                <a
                  href={company.website || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors min-w-0"
                >
                  <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate max-w-xs">{company.website || "Chưa cập nhật website"}</span>
                </a>
                {company.scale && (
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {company.scale}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {isFollowed ? "3" : "2"} người theo dõi
                </span>
              </div>
            </div>

            <Button
              onClick={() => setIsFollowed(!isFollowed)}
              className={`shrink-0 rounded-lg font-semibold h-10 px-5 transition-all active:scale-95 ${
                isFollowed
                  ? "bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200"
                  : "bg-primary hover:bg-primary/90 text-white border border-primary"
              }`}
            >
              {isFollowed ? (
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Đang theo dõi
                </span>
              ) : (
                "+ Theo dõi công ty"
              )}
            </Button>
          </div>

          {/* TAB STRIP */}
          <nav className="flex gap-1 mt-5 pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveTab("about")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeTab === "about"
                  ? "bg-slate-100 text-slate-600"
                  : "text-slate-500 hover:text-foreground hover:bg-slate-50"
              }`}
            >
              Trang chủ
            </button>
            <button
              onClick={() => setActiveTab("jobs")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 ${
                activeTab === "jobs"
                  ? "bg-slate-100 text-slate-600"
                  : "text-slate-500 hover:text-foreground hover:bg-slate-50"
              }`}
            >
              Sự kiện
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                activeTab === "jobs" ? "bg-slate-200 text-slate-700" : "bg-slate-100 text-slate-500"
              }`}>
                {companyEvents.length}
              </span>
            </button>
          </nav>
        </section>

        {/* TAB CONTENT */}
        {activeTab === "about" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">

            {/* LEFT — 2/3: bio + gallery + latest jobs */}
            <div className="lg:col-span-2 space-y-5">

              {/* Bio */}
              <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
                <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-slate-300 rounded-full"></span>
                  Giới thiệu công ty
                </h2>
                <div className="relative">
                  <p className={`text-sm text-slate-600 leading-relaxed whitespace-pre-wrap transition-all duration-300 ${isIntroExpanded ? "" : "line-clamp-4"}`}>
                    {company.bio || `${company.full_name} là đối tác chiến dịch tuyển nhân sự và quản lý nhân sự tình nguyện chuyên biệt, hỗ trợ tổ chức và vận hành các sự kiện cộng đồng chất lượng cao tại khu vực miền Trung nói chung và thành phố Đà Nẵng nói riêng. Chúng tôi liên kết chặt chẽ với các câu lạc bộ sinh viên, các tổ chức giáo dục để mang đến lực lượng tình nguyện viên trẻ trung, năng động và giàu kinh nghiệm nhất.`}
                  </p>
                  <button
                    onClick={() => setIsIntroExpanded(!isIntroExpanded)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900/80 mt-2 inline-flex items-center gap-1"
                  >
                    {isIntroExpanded ? (
                      <>Thu gọn <ChevronUp className="w-3.5 h-3.5" /></>
                    ) : (
                      <>Xem thêm <ChevronDown className="w-3.5 h-3.5" /></>
                    )}
                  </button>
                </div>
              </section>

              {/* Gallery */}
              <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <span className="w-1 h-5 bg-slate-300 rounded-full"></span>
                    Hình ảnh hoạt động
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentImageIndex === 0}
                      className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-400 disabled:opacity-30 disabled:hover:text-slate-500 disabled:hover:border-slate-200 transition-all"
                      aria-label="Ảnh trước"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(prev => Math.min(galleryImages.length - 1, prev + 1))}
                      disabled={currentImageIndex === galleryImages.length - 1}
                      className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-400 disabled:opacity-30 disabled:hover:text-slate-500 disabled:hover:border-slate-200 transition-all"
                      aria-label="Ảnh sau"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {galleryImages.map((imgUrl: string, idx: number) => (
                    <div
                      key={imgUrl + idx}
                      className={`relative aspect-[4/3] rounded-lg overflow-hidden group border ${
                        idx === currentImageIndex ? "border-slate-400 ring-2 ring-slate-200" : "border-slate-200"
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Company Gallery ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Latest jobs preview */}
              <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span className="w-1 h-5 bg-slate-300 rounded-full"></span>
                  Tuyển nhân sự mới nhất
                </h2>

                {renderSearchBar()}

                {filteredJobs.length === 0 ? (
                  <p className="py-10 text-center text-slate-500 text-sm">
                    Hiện tại không tìm thấy sự kiện nào phù hợp.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredJobs.slice(0, 4).map(renderJobRow)}
                  </div>
                )}

                {companyEvents.length > 4 && (
                  <button
                    onClick={() => setActiveTab("jobs")}
                    className="w-full text-center text-sm font-semibold text-slate-600 hover:text-slate-900/80 py-2 transition-colors"
                  >
                    Xem tất cả {companyEvents.length} sự kiện →
                  </button>
                )}
              </section>
            </div>

            {/* RIGHT — 1/3: info + location + share */}
            <aside className="space-y-5">

              {/* Thông tin chung */}
              <section className="bg-white border border-slate-200 rounded-2xl p-5">
                <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-slate-300 rounded-full"></span>
                  Thông tin chung
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">Mã số thuế</p>
                      <p className="text-sm font-semibold text-foreground truncate">{company.mst || "Chưa cập nhật"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">Quy mô</p>
                      <p className="text-sm font-semibold text-foreground truncate">{company.scale || "Chưa cập nhật"}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Location — clean placeholder (no mock Google Maps image) */}
              <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span className="w-1 h-5 bg-slate-300 rounded-full"></span>
                  Địa điểm công ty
                </h2>
                <p className="text-sm text-slate-600 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{company.address || "Chưa cập nhật địa chỉ"}</span>
                </p>
                <div className="aspect-[4/3] rounded-lg border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-2 p-4">
                  <MapPin className="w-8 h-8 text-slate-400" />
                  <p className="text-xs text-slate-400 font-medium text-center">Bản đồ chưa khả dụng</p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address || company.full_name)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-slate-600 hover:underline"
                  >
                    Mở trong Google Maps →
                  </a>
                </div>
              </section>

              {/* Share */}
              <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span className="w-1 h-5 bg-slate-300 rounded-full"></span>
                  Chia sẻ công ty
                </h2>
                <div>
                  <p className="text-xs text-slate-500 mb-1.5">Sao chép đường dẫn</p>
                  <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-2 bg-slate-50">
                    <input
                      type="text"
                      readOnly
                      value={typeof window !== "undefined" ? window.location.href : ""}
                      className="bg-transparent text-xs text-slate-500 font-medium select-all outline-none w-full truncate"
                    />
                    <button
                      onClick={handleCopyLink}
                      aria-label="Sao chép liên kết"
                      className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-all shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">Chia sẻ qua mạng xã hội</p>
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors" aria-label="Facebook">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                    </button>
                    <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors" aria-label="X">
                      <span className="font-bold text-sm">𝕏</span>
                    </button>
                    <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors" aria-label="LinkedIn">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect x="2" y="9" width="4" height="12" />
                        <circle cx="4" cy="4" r="2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        ) : (
          /* JOBS TAB — filters sidebar + jobs list (responsive) */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mt-5">

            {/* FILTERS SIDEBAR */}
            <aside className="space-y-5">
              <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span className="w-1 h-5 bg-slate-300 rounded-full"></span>
                  Bộ lọc
                </h3>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Khu vực</p>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-foreground">
                      <input
                        type="radio"
                        name="location-filter"
                        checked={selectedLocation === ""}
                        onChange={() => setSelectedLocation("")}
                        className="text-slate-600 focus:ring-slate-400"
                      />
                      <span>Tất cả khu vực ({companyEvents.length})</span>
                    </label>
                    {locationsList.map(loc => {
                      const count = companyEvents.filter(j => j.danang_wards?.name === loc).length
                      return (
                        <label key={loc} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-foreground">
                          <input
                            type="radio"
                            name="location-filter"
                            checked={selectedLocation === loc}
                            onChange={() => setSelectedLocation(loc)}
                            className="text-slate-600 focus:ring-slate-400"
                          />
                          <span className="truncate">{loc}</span>
                          <span className="text-xs text-slate-400 ml-auto">({count})</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </section>
            </aside>

            {/* JOBS LIST */}
            <div className="lg:col-span-3 space-y-4">
              <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <span className="w-1 h-5 bg-slate-300 rounded-full"></span>
                    Tuyển nhân sự tại {company.full_name}
                  </h2>
                  <span className="text-xs text-slate-500 font-medium shrink-0">
                    {filteredJobs.length} sự kiện
                  </span>
                </div>

                {renderSearchBar()}

                {filteredJobs.length === 0 ? (
                  <p className="py-16 text-center text-slate-500 text-sm">
                    Không tìm thấy sự kiện nào phù hợp.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredJobs.map(renderJobRow)}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* Floating follow banner */}
        {showFloatingBanner && (
          <div className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-full sm:max-w-md bg-white border border-slate-200 rounded-2xl p-3 shadow-md z-50 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-300 border-t-4 border-t-slate-300">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                <Avatar className="h-full w-full rounded-lg">
                  <AvatarImage src={company.avatar_url} className="object-cover" />
                  <AvatarFallback className="rounded-lg bg-slate-100 text-slate-600 text-base font-bold">
                    {company.full_name?.charAt(0).toUpperCase() || "O"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Theo dõi để nhận sự kiện mới từ</p>
                <p className="text-sm font-semibold text-foreground truncate" title={company.full_name}>{company.full_name}</p>
              </div>
            </div>
            <Button
              onClick={() => setIsFollowed(!isFollowed)}
              className="rounded-lg font-semibold h-9 px-4 text-xs transition-all shrink-0 bg-primary hover:bg-primary/90 text-white border border-primary"
            >
              {isFollowed ? "✓ Đang theo dõi" : "+ Theo dõi"}
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
