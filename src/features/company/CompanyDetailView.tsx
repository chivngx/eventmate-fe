"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "@/lib/router"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/components/providers/AuthProvider"
import { useToast } from "@/components/providers/ToastProvider"
import MainLayout from "@/components/layout/MainLayout"
import {
  Building2,
  Globe,
  Star,
  Search,
  Calendar,
  Sparkles,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import VerifiedBadge from "@/components/ui/verified-badge"
import LocationMapCard from "@/components/common/LocationMapCard"
import EventCard from "@/features/event/components/EventCard"
import { SkeletonCompanyDetail } from "@/components/ui/skeleton"
import Breadcrumb from "@/components/common/Breadcrumb"
import { CustomSelect } from "@/components/ui/custom-select"

interface CompanyReview {
  id: string
  rating: number
  comment: string | null
  created_at: string
  reviewer?: {
    full_name: string | null
    avatar_url: string | null
  } | null
  events?: {
    title: string | null
  } | null
}

export default function CompanyDetailView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, role, loading: authLoading } = useUser()
  const { showToast } = useToast()

  const [company, setCompany] = useState<any>(null)
  const [companyEvents, setCompanyEvents] = useState<any[]>([])
  const [reviews, setReviews] = useState<CompanyReview[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"about" | "events">("about")

  // Search & Filter state for events tab
  const [jobSearchTerm, setJobSearchTerm] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")

  useEffect(() => {
    if (authLoading) return

    const fetchCompanyDetails = async () => {
      setLoading(true)

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

        // Tự động chuyển hướng URL từ UUID sang Slug nếu có
        if (isUuid && profileData.slug) {
          navigate(`/companies/${profileData.slug}`, { replace: true })
        }

        // 1. Fetch events posted by this company
        const { data: eventsData } = await supabase
          .from("events")
          .select("*, danang_wards(name)")
          .eq("organizer_id", profileData.id)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })

        if (eventsData) {
          setCompanyEvents(eventsData)
        }

        // 2. Fetch reviews from students for this organizer
        const { data: reviewsData } = await supabase
          .from("reviews")
          .select(`
            id,
            rating,
            comment,
            created_at,
            reviewer:profiles!reviewer_id(full_name, avatar_url),
            events(title)
          `)
          .eq("reviewee_id", profileData.id)
          .order("created_at", { ascending: false })

        if (reviewsData) {
          setReviews(reviewsData as any)
        }
      }

      setLoading(false)
    }

    fetchCompanyDetails()
  }, [id, user, authLoading])



  // Calculate review metrics
  const reviewStats = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return { average: 5.0, count: 0, hasReviews: false }
    }
    const sum = reviews.reduce((acc, curr) => acc + (curr.rating || 5), 0)
    const avg = Number((sum / reviews.length).toFixed(1))
    return { average: avg, count: reviews.length, hasReviews: true }
  }, [reviews])

  // Filtered jobs in events tab
  const filteredJobs = useMemo(() => {
    return companyEvents.filter((job) => {
      const matchesSearch =
        !jobSearchTerm.trim() ||
        job.title?.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
        job.category?.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
        job.position_type?.toLowerCase().includes(jobSearchTerm.toLowerCase())

      const matchesLocation = selectedLocation
        ? (job.danang_wards?.name || "").includes(selectedLocation) ||
        (job.location || "").includes(selectedLocation)
        : true

      return matchesSearch && matchesLocation
    })
  }, [companyEvents, jobSearchTerm, selectedLocation])

  const locationsList = useMemo(() => {
    const set = new Set<string>()
    companyEvents.forEach((ev) => {
      if (ev.danang_wards?.name) set.add(ev.danang_wards.name)
    })
    return Array.from(set)
  }, [companyEvents])

  if (loading) {
    return <SkeletonCompanyDetail />
  }

  if (!company) {
    return (
      <MainLayout role="guest" fullWidth={true} className="bg-[#f2f6fc]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="size-16 bg-white rounded-2xl flex items-center justify-center mx-auto text-zinc-400 mb-6 shadow-sm ring-1 ring-zinc-200/50">
            <Building2 className="size-8 stroke-[1.5]" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Không tìm thấy đơn vị tổ chức
          </h2>
          <p className="text-[15px] text-zinc-500 mt-2 max-w-md mx-auto leading-relaxed">
            Hồ sơ đơn vị này có thể đã được cập nhật hoặc không tồn tại trên hệ thống EventMate.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-8 h-10 px-6 rounded-lg bg-zinc-900 text-white font-medium text-[14px] hover:bg-zinc-800 transition-colors cursor-pointer shadow-sm"
          >
            Về trang chủ
          </button>
        </div>
      </MainLayout>
    )
  }

  const displayName = company.full_name || "Ban tổ chức sự kiện"
  const isCompanyVip = Boolean(
    company.is_premium &&
    (!company.premium_until || new Date(company.premium_until) > new Date())
  )

  return (
    <MainLayout role={role || "guest"} fullWidth={true} className="bg-[#f2f6fc]" footerClassName="mt-6 md:mt-6">
      <div className="bg-[#f2f6fc] pb-0 pt-6">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-6">
            <Breadcrumb items={[{ label: displayName }]} />
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* LEFT COLUMN: STICKY SIDEBAR (Profile + Navigation + Map) */}
            <aside className="w-full lg:w-[360px] shrink-0 flex flex-col gap-6 lg:sticky lg:top-24">
              
              {/* Profile Card */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm ring-1 ring-zinc-200/50 flex flex-col items-center text-center">
                <Avatar className="size-[120px] rounded-full shadow-sm ring-4 ring-white mb-5">
                  <AvatarImage src={company.avatar_url || ""} className="object-cover" />
                  <AvatarFallback className="bg-zinc-100 text-zinc-800 text-4xl font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <h1 className="font-['Inter'] font-bold text-2xl text-zinc-950 leading-tight tracking-tight mb-2">
                  {displayName}
                </h1>
                
                <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                  {company.is_verified && (
                    <VerifiedBadge variant="pill" text="Đã xác thực" />
                  )}
                  {isCompanyVip && (
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200/60 shadow-sm">
                      <Sparkles className="size-3.5 text-amber-500 fill-amber-500" />
                      Doanh Nghiệp VIP
                    </span>
                  )}
                </div>

                {/* Trust & Meta Metrics */}
                <div className="w-full grid grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-50 ring-1 ring-zinc-200/50 mb-6">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Đánh giá</span>
                    <div className="flex items-center gap-1.5">
                      <Star className="size-4 text-amber-500 fill-amber-500" />
                      <span className="font-bold text-[15px] text-zinc-900">{reviewStats.average}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1 border-l border-zinc-200/80">
                    <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Sự kiện</span>
                    <span className="font-bold text-[15px] text-zinc-900">{companyEvents.length}</span>
                  </div>
                </div>

                {company.website && (
                  <a
                    href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-200 text-[14px] font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors shadow-sm"
                  >
                    <Globe className="size-4 text-zinc-400" />
                    <span className="truncate max-w-[200px]">
                      {company.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                    </span>
                  </a>
                )}
              </div>

              {/* Location Map Card */}
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-zinc-200/50 overflow-hidden hidden lg:block">
                <LocationMapCard
                  title="Trụ sở làm việc"
                  address={company.address}
                  searchQuery={company.address || displayName}
                  mapEmbedUrl={company.map_embed_url}
                  className="p-6"
                />
              </div>
            </aside>

            {/* RIGHT COLUMN: CONTENT */}
            <main className="flex-1 min-w-0 flex flex-col gap-6">
              
              {/* Show Map on Mobile only, before content */}
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-zinc-200/50 overflow-hidden lg:hidden">
                <LocationMapCard
                  title="Trụ sở làm việc"
                  address={company.address}
                  searchQuery={company.address || displayName}
                  mapEmbedUrl={company.map_embed_url}
                  className="p-6"
                />
              </div>

              {/* Segmented Control Tabs */}
              <div className="flex items-center">
                <div className="inline-flex p-1.5 bg-zinc-200/60 rounded-xl shadow-inner">
                  <button
                    onClick={() => setActiveTab("about")}
                    className={`flex items-center justify-center h-10 px-6 sm:px-8 rounded-lg text-[14px] font-semibold transition-all duration-200 ${
                      activeTab === "about"
                        ? "bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-200/80"
                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-300/50"
                    }`}
                  >
                    Tổng quan
                  </button>
                  <button
                    onClick={() => setActiveTab("events")}
                    className={`flex items-center justify-center gap-2 h-10 px-6 sm:px-8 rounded-lg text-[14px] font-semibold transition-all duration-200 ${
                      activeTab === "events"
                        ? "bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-200/80"
                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-300/50"
                    }`}
                  >
                    Chiến dịch sự kiện
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      activeTab === "events" ? "bg-zinc-100 text-zinc-900" : "bg-zinc-300/60 text-zinc-600"
                    }`}>
                      {companyEvents.length}
                    </span>
                  </button>
                </div>
              </div>

              {activeTab === "about" ? (
                /* TAB 1: GIỚI THIỆU & ĐÁNH GIÁ */
                <div className="space-y-6">
                  {/* Section 1: Giới thiệu chung */}
                  <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm ring-1 ring-zinc-200/50">
                    <h2 className="font-['Inter'] font-bold text-xl text-zinc-950 tracking-tight mb-5">
                      Giới thiệu đơn vị
                    </h2>
                    <div className="text-[15.5px] text-zinc-700 leading-loose whitespace-pre-wrap">
                      {company.bio ||
                        `${displayName} là đơn vị tổ chức và điều phối sự kiện uy tín, chuyên phụ trách các chương trình văn hóa, hội nghị quốc tế, lễ hội âm nhạc và các chiến dịch kích hoạt thương hiệu (activation).\n\nChúng tôi xây dựng môi trường làm việc chuyên nghiệp, minh bạch và tạo điều kiện tối đa để lực lượng nhân sự trẻ, sinh viên phát triển kỹ năng thực chiến.`}
                    </div>
                  </section>

                  {/* Section 2: Đánh giá */}
                  <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm ring-1 ring-zinc-200/50">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
                      <div className="space-y-1.5">
                        <h2 className="font-['Inter'] font-bold text-xl text-zinc-950 tracking-tight">
                          Đánh giá từ nhân sự
                        </h2>
                        <p className="text-[14px] text-zinc-500 leading-relaxed max-w-[400px]">
                          Nhận xét thực tế từ các bạn sinh viên đã hoàn thành ca trực tại các sự kiện do đơn vị tổ chức.
                        </p>
                      </div>

                      {/* Summary Bento box */}
                      <div className="flex items-center gap-4 bg-zinc-50 px-5 py-4 rounded-xl ring-1 ring-zinc-200/50 self-start">
                        <span className="font-bold text-4xl text-zinc-900 tracking-tighter">
                          {reviewStats.average}
                        </span>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`size-4 ${star <= Math.round(reviewStats.average)
                                    ? "text-amber-500 fill-amber-500"
                                    : "text-zinc-200 fill-zinc-200"
                                  }`}
                              />
                            ))}
                          </div>
                          <p className="text-[12px] font-medium text-zinc-500">
                            {reviewStats.count} lượt đánh giá
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Reviews List */}
                    {reviews.length === 0 ? (
                      <div className="py-12 flex flex-col items-center text-center space-y-4 bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200">
                        <div className="size-14 bg-white rounded-full shadow-sm flex items-center justify-center text-amber-500 ring-1 ring-zinc-200/50">
                          <Star className="size-6 stroke-[1.5]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[16px] text-zinc-900">
                            Chưa có đánh giá nào
                          </h3>
                          <p className="text-[14px] text-zinc-500 max-w-sm mx-auto mt-1.5 leading-relaxed">
                            Đánh giá sẽ hiển thị tại đây sau khi nhân sự hoàn thành ca trực và gửi phản hồi.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((rev) => {
                          const reviewerName = rev.reviewer?.full_name || "Nhân sự ẩn danh"
                          const reviewerAvatar = rev.reviewer?.avatar_url || ""
                          const eventName = rev.events?.title

                          return (
                            <div
                              key={rev.id}
                              className="p-5 rounded-xl bg-zinc-50 space-y-3 ring-1 ring-zinc-200/50"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3.5">
                                  <Avatar className="size-[42px] rounded-full ring-2 ring-white shadow-sm">
                                    <AvatarImage src={reviewerAvatar} className="object-cover" />
                                    <AvatarFallback className="bg-zinc-200 text-zinc-700 font-semibold text-sm">
                                      {reviewerName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>

                                  <div>
                                    <h4 className="font-semibold text-[14.5px] text-zinc-950">
                                      {reviewerName}
                                    </h4>
                                    <div className="flex items-center gap-2 text-[12px] text-zinc-500 font-medium mt-0.5">
                                      <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                          <Star
                                            key={s}
                                            className={`size-3 ${s <= rev.rating
                                                ? "text-amber-500 fill-amber-500"
                                                : "text-zinc-300"
                                              }`}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-zinc-300">•</span>
                                      <span>
                                        {new Date(rev.created_at).toLocaleDateString("vi-VN")}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {eventName && (
                                  <span className="text-[11.5px] font-medium bg-white text-zinc-600 px-2.5 py-1 rounded-md truncate max-w-[180px] shadow-sm ring-1 ring-zinc-200/50">
                                    {eventName}
                                  </span>
                                )}
                              </div>

                              {rev.comment && (
                                <p className="text-[14px] text-zinc-700 leading-relaxed pt-1.5">
                                  {rev.comment}
                                </p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </section>
                </div>
              ) : (
                /* TAB 2: SỰ KIỆN ĐANG TUYỂN */
                <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm ring-1 ring-zinc-200/50">
                  {/* Header & Search Control Bar */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-zinc-50/80 p-4 sm:p-5 rounded-xl ring-1 ring-zinc-200/50 mb-8">
                    <div className="space-y-1">
                      <h2 className="font-['Inter'] font-bold text-lg text-zinc-950 tracking-tight">
                        Chiến dịch sự kiện
                      </h2>
                      <p className="text-[13.5px] text-zinc-500 leading-relaxed">
                        Khám phá các vị trí tuyển dụng nhân sự, CTV do {displayName} tổ chức
                      </p>
                    </div>

                    {/* Filters Toolbar */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                      {/* Search bar */}
                      <div className="relative w-full sm:w-[280px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4.5 text-zinc-400" />
                        <input
                          type="text"
                          placeholder="Tìm vị trí, tên sự kiện..."
                          value={jobSearchTerm}
                          onChange={(e) => setJobSearchTerm(e.target.value)}
                          className="w-full h-10 pl-9 pr-4 bg-white border-none ring-1 ring-zinc-200/80 rounded-lg text-[14px] text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow placeholder:text-zinc-400 shadow-sm"
                        />
                      </div>

                      {/* Ward Filter */}
                      {locationsList.length > 0 && (
                        <div className="w-full sm:w-[200px] shrink-0">
                          <CustomSelect
                            value={selectedLocation}
                            onChange={(val) => setSelectedLocation(val)}
                            options={[
                              { value: "", label: "Tất cả khu vực" },
                              ...locationsList.map((loc) => ({
                                value: loc,
                                label: `Phường ${loc}`,
                              })),
                            ]}
                            placeholder="Tất cả khu vực"
                            buttonClassName="h-10 rounded-lg text-[14px] border-none ring-1 ring-zinc-200/80 shadow-sm bg-white"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Event Cards Grid / List */}
                  {filteredJobs.length === 0 ? (
                    <div className="py-20 text-center space-y-4 border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                      <div className="size-16 bg-white rounded-2xl flex items-center justify-center mx-auto text-zinc-400 shadow-sm ring-1 ring-zinc-200/50">
                        <Calendar className="size-8 stroke-[1.5]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-zinc-900 tracking-tight">
                          Không tìm thấy sự kiện phù hợp
                        </h3>
                        <p className="text-[14.5px] text-zinc-500 max-w-md mx-auto mt-2 leading-relaxed">
                          {jobSearchTerm || selectedLocation
                            ? "Thử thay đổi từ khóa hoặc bộ lọc khu vực để tìm thấy sự kiện."
                            : "Hiện tại đơn vị này chưa có chiến dịch sự kiện mới. Hãy quay lại sau nhé!"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {filteredJobs.map((job) => (
                        <EventCard
                          key={job.id}
                          job={{
                            ...job,
                            profiles: job.profiles || {
                              id: company.id,
                              full_name: displayName,
                              avatar_url: company.avatar_url,
                              slug: company.slug,
                            },
                          }}
                          className="border border-zinc-200/80 shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden"
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}
            </main>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

