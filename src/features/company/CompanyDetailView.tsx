"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "@/lib/router"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/components/providers/AuthProvider"
import { useToast } from "@/components/providers/ToastProvider"
import MainLayout from "@/components/layout/MainLayout"
import {
  Building2,
  Globe,
  Users,
  Star,
  Check,
  Search,
  ChevronRight,
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
  const [isFollowed, setIsFollowed] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
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

        // 2. Fetch real followers count
        const { count: realFollowersCount } = await supabase
          .from("company_follows")
          .select("*", { count: "exact", head: true })
          .eq("organizer_id", profileData.id)

        setFollowersCount(realFollowersCount || 0)

        // 3. Fetch reviews from students for this organizer
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

        // 4. Check if current user is following this company
        if (user) {
          const { data: followRow } = await supabase
            .from("company_follows")
            .select("id")
            .eq("user_id", user.id)
            .eq("organizer_id", profileData.id)
            .maybeSingle()

          setIsFollowed(!!followRow)
        }
      }

      setLoading(false)
    }

    fetchCompanyDetails()
  }, [id, user, authLoading])

  // Toggle follow/unfollow
  const handleToggleFollow = async () => {
    if (!user) {
      navigate("/login")
      return
    }
    if (!company || isFollowLoading) return
    setIsFollowLoading(true)

    try {
      if (isFollowed) {
        await supabase
          .from("company_follows")
          .delete()
          .eq("user_id", user.id)
          .eq("organizer_id", company.id)

        setIsFollowed(false)
        setFollowersCount((prev) => Math.max(0, prev - 1))
        showToast({
          type: "info",
          title: "Đã hủy theo dõi",
          message: `Bạn sẽ không nhận thông báo về sự kiện mới từ ${company.full_name}.`,
        })
      } else {
        await supabase.from("company_follows").insert({
          user_id: user.id,
          organizer_id: company.id,
        })

        setIsFollowed(true)
        setFollowersCount((prev) => prev + 1)
        showToast({
          type: "success",
          title: "Đang theo dõi",
          message: `Bạn sẽ nhận được thông báo khi ${company.full_name} đăng sự kiện mới!`,
        })
      }
    } catch (err) {
      console.error("Lỗi khi theo dõi đơn vị tổ chức:", err)
    } finally {
      setIsFollowLoading(false)
    }
  }



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
      <MainLayout role="guest" fullWidth={true} className="bg-[#f3f5f7]">
        <div className="w-full max-w-[1232px] mx-auto px-4 py-24 text-center">
          <div className="size-16 bg-[#f4f4f4] rounded-[16px] flex items-center justify-center mx-auto text-[#757575] mb-4">
            <Building2 className="size-8 stroke-[1.5]" />
          </div>
          <h2 className="text-[24px] font-bold text-[#222222]">
            Không tìm thấy đơn vị tổ chức
          </h2>
          <p className="text-[14px] text-[#757575] mt-2 max-w-md mx-auto">
            Hồ sơ đơn vị này có thể đã được cập nhật hoặc không tồn tại trên hệ thống EventMate.
          </p>
          <button
            onClick={() => navigate("/companies")}
            className="mt-6 h-[40px] px-5 rounded-[8px] bg-[#222222] text-white font-medium text-[14px] hover:bg-[#353535] transition cursor-pointer"
          >
            Quay lại danh sách đơn vị
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

  const tabItemClass = (isActive: boolean) =>
    `h-[44px] text-[15px] transition-all cursor-pointer flex items-center gap-1.5 border-b-2 ${
      isActive
        ? "text-[#222222] font-bold border-[#222222]"
        : "text-[#757575] hover:text-[#222222] font-medium border-transparent"
    }`

  return (
    <MainLayout role={role || "guest"} fullWidth={true} className="bg-[#f3f5f7]">
      <div className="bg-[#f3f5f7] min-h-screen pb-20 pt-6">
        <div className="w-full max-w-[1232px] mx-auto px-4 sm:px-6 lg:px-0 flex flex-col gap-6">

          {/* 1. BREADCRUMB */}
          <Breadcrumb
            items={[
              { label: "Ban tổ chức", href: "/companies" },
              { label: displayName },
            ]}
          />

          {/* 2. HEADER PROFILE HERO CARD */}
          <section className="bg-white rounded-[16px] shadow-xs overflow-hidden">
            <div className="p-6 sm:p-8 pb-3 sm:pb-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left Column: Avatar + Basic Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 min-w-0 flex-1">
                  {/* Logo Avatar */}
                  <Avatar className="size-[88px] sm:size-[104px] rounded-full shrink-0">
                    <AvatarImage src={company.avatar_url || ""} className="object-cover rounded-full" />
                    <AvatarFallback className="bg-slate-100 text-[#222222] text-3xl font-bold rounded-full">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Text Meta Info */}
                  <div className="space-y-2.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h1 className="font-['Inter'] font-bold text-[22px] sm:text-[26px] text-[#222222] leading-snug tracking-tight">
                        {displayName}
                      </h1>
                      {company.is_verified && (
                        <VerifiedBadge variant="pill" text="Đã xác thực" />
                      )}
                      {isCompanyVip && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          <Sparkles className="size-3 text-amber-500 fill-amber-500" />
                          Doanh Nghiệp VIP
                        </span>
                      )}
                    </div>

                    {/* Trust metrics bar: Link | Rating | Followers */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-[#515151]">
                      {/* Link */}
                      {company.website && (
                        <>
                          <a
                            href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-[#515151] hover:text-[#222222] transition"
                          >
                            <Globe className="size-3.5 text-[#757575] shrink-0" />
                            <span className="hover:underline underline-offset-2 truncate max-w-[220px] sm:max-w-xs">
                              {company.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                            </span>
                          </a>
                          <span className="text-[#d1d5db] select-none">|</span>
                        </>
                      )}

                      {/* Rating badge */}
                      <div className="inline-flex items-center gap-1 font-medium">
                        <Star className="size-4 text-amber-500 fill-amber-500" />
                        <span className="font-semibold text-[#222222]">
                          {reviewStats.average}
                        </span>
                        <span className="text-[#757575]">
                          ({reviewStats.count} đánh giá)
                        </span>
                      </div>

                      <span className="text-[#d1d5db] select-none">|</span>

                      {/* Followers count */}
                      <div className="inline-flex items-center gap-1.5">
                        <Users className="size-4 text-[#757575] shrink-0" />
                        <span>{followersCount} người theo dõi</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: CTA Buttons */}
                <div className="flex items-center gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#ededed]">
                  {/* Follow Button */}
                  <button
                    type="button"
                    onClick={handleToggleFollow}
                    disabled={isFollowLoading}
                    className={`h-[40px] px-5 rounded-[8px] font-medium text-[14px] transition-all cursor-pointer inline-flex items-center gap-2 shadow-xs ${
                      isFollowed
                        ? "bg-white border border-[#cbcbcb] hover:border-slate-400 text-[#222222] hover:bg-slate-50"
                        : "bg-[#005ddc] hover:bg-[#004bb3] text-white border border-transparent"
                    }`}
                  >
                    {isFollowed ? (
                      <>
                        <Check className="size-4 text-emerald-600" />
                        <span>Đang theo dõi</span>
                      </>
                    ) : (
                      <>
                        <span>+ Theo dõi</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* TAB STRIP DOCKED AT BOTTOM EDGE */}
            <div className="px-6 sm:px-8 flex items-center gap-8">
              <button
                type="button"
                onClick={() => setActiveTab("about")}
                className={tabItemClass(activeTab === "about")}
              >
                <span>Tổng quan</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("events")}
                className={tabItemClass(activeTab === "events")}
              >
                <span>Sự kiện ({companyEvents.length})</span>
              </button>
            </div>
          </section>

          {/* 4. TAB CONTENTS */}
          {activeTab === "about" ? (
            /* TAB 1: GIỚI THIỆU & ĐÁNH GIÁ */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* LEFT 2/3 COLUMN: Bio, Activity Photos, Real Reviews */}
              <div className="lg:col-span-2 space-y-6">

                {/* Section 1: Giới thiệu chung */}
                <section className="bg-white rounded-[16px] p-6 sm:p-7 shadow-xs space-y-3.5">
                  <h2 className="font-['Inter'] font-bold text-[18px] text-[#222222]">
                    Giới thiệu về đơn vị tổ chức
                  </h2>
                  <div className="text-[14px] text-[#515151] leading-relaxed whitespace-pre-wrap">
                    {company.bio ||
                      `${displayName} là đơn vị tổ chức và điều phối sự kiện uy tín tại Đà Nẵng, chuyên phụ trách các chương trình văn hóa, hội nghị quốc tế, lễ hội âm nhạc và các chiến dịch kích hoạt thương hiệu (activation). Chúng tôi xây dựng môi trường làm việc chuyên nghiệp, minh bạch và tạo điều kiện tối đa để lực lượng nhân sự trẻ, sinh viên phát triển kỹ năng thực chiến.`}
                  </div>
                </section>

                {/* Section 2: Đánh giá & Nhận xét từ nhân sự sự kiện (DỮ LIỆU TỪ BẢNG REVIEWS) */}
                <section className="bg-white rounded-[16px] p-6 sm:p-7 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ededed]">
                    <div>
                      <h2 className="font-['Inter'] font-bold text-[18px] text-[#222222]">
                        Đánh giá từ nhân sự & cộng tác viên
                      </h2>
                      <p className="text-[13px] text-[#757575] mt-0.5">
                        Nhận xét từ các bạn sinh viên đã hoàn thành ca trực tại các sự kiện của đơn vị
                      </p>
                    </div>

                    {/* Summary badge */}
                    <div className="flex items-center gap-3 bg-[#f3f5f7] px-4 py-2.5 rounded-[12px] self-start sm:self-auto">
                      <span className="font-bold text-[24px] text-[#222222] leading-none">
                        {reviewStats.average}
                      </span>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`size-3.5 ${
                                star <= Math.round(reviewStats.average)
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-slate-200 fill-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-[11px] text-[#757575]">
                          Dựa trên {reviewStats.count} lượt đánh giá
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reviews List */}
                  {reviews.length === 0 ? (
                    <div className="py-10 text-center space-y-2">
                      <div className="size-12 bg-[#f4f4f4] rounded-[12px] flex items-center justify-center mx-auto text-[#757575]">
                        <Star className="size-6 stroke-[1.5]" />
                      </div>
                      <h3 className="font-semibold text-[15px] text-[#222222]">
                        Chưa có đánh giá nào
                      </h3>
                      <p className="text-[13px] text-[#757575] max-w-sm mx-auto">
                        Đánh giá sẽ hiển thị tại đây sau khi các sự kiện kết thúc và nhân sự hoàn thành ca trực gửi phản hồi.
                      </p>
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
                            className="p-4 rounded-[12px] bg-[#f3f5f7] space-y-2.5"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="size-[40px] rounded-full">
                                  <AvatarImage src={reviewerAvatar} className="object-cover" />
                                  <AvatarFallback className="bg-slate-200 text-[#222222] font-semibold text-sm">
                                    {reviewerName.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>

                                <div>
                                  <h4 className="font-semibold text-[14px] text-[#222222]">
                                    {reviewerName}
                                  </h4>
                                  <div className="flex items-center gap-2 text-[12px] text-[#757575]">
                                    <div className="flex items-center gap-0.5">
                                      {[1, 2, 3, 4, 5].map((s) => (
                                        <Star
                                          key={s}
                                          className={`size-3 ${
                                            s <= rev.rating
                                              ? "text-amber-500 fill-amber-500"
                                              : "text-slate-300"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span>•</span>
                                    <span>
                                      {new Date(rev.created_at).toLocaleDateString("vi-VN")}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {eventName && (
                                <span className="text-[11px] bg-white text-[#515151] px-2.5 py-1 rounded-[6px] truncate max-w-[200px]">
                                  {eventName}
                                </span>
                              )}
                            </div>

                            {rev.comment && (
                              <p className="text-[13px] text-[#353535] leading-relaxed pt-1">
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

              {/* RIGHT 1/3 COLUMN: Location Map */}
              <aside className="space-y-6">
                {/* Location Map Card */}
                <LocationMapCard
                  title="Địa chỉ"
                  address={company.address}
                  searchQuery={company.address || displayName}
                  mapEmbedUrl={company.map_embed_url}
                />
              </aside>
            </div>
          ) : (
            /* TAB 2: SỰ KIỆN ĐANG TUYỂN */
            <section className="bg-white rounded-[16px] p-6 sm:p-7 shadow-xs space-y-6">
              {/* Header & Search Control Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-[#ededed]">
                <div>
                  <h2 className="font-['Inter'] font-bold text-[18px] text-[#222222]">
                    Chiến dịch sự kiện ({filteredJobs.length})
                  </h2>
                  <p className="text-[13px] text-[#757575] mt-0.5">
                    Các vị trí tuyển dụng nhân sự, CTV và tình nguyện viên do {displayName} tổ chức
                  </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* Search bar */}
                  <div className="relative w-full sm:w-[260px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#757575]" />
                    <input
                      type="text"
                      placeholder="Tìm vị trí, tên sự kiện..."
                      value={jobSearchTerm}
                      onChange={(e) => setJobSearchTerm(e.target.value)}
                      className="w-full h-[38px] pl-9 pr-3 bg-white border border-[#cbcbcb] rounded-[8px] text-[13px] text-[#222222] focus:outline-none focus:border-[#222222]"
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
                            label: `P. ${loc}`,
                          })),
                        ]}
                        placeholder="Tất cả khu vực"
                        buttonClassName="h-[38px] rounded-[8px] text-[13px] border-[#cbcbcb]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Event Cards Grid / List */}
              {filteredJobs.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="size-12 bg-[#f4f4f4] rounded-[12px] flex items-center justify-center mx-auto text-[#757575]">
                    <Calendar className="size-6 stroke-[1.5]" />
                  </div>
                  <h3 className="font-semibold text-[16px] text-[#222222]">
                    Không tìm thấy sự kiện phù hợp
                  </h3>
                  <p className="text-[13px] text-[#757575] max-w-md mx-auto">
                    {jobSearchTerm || selectedLocation
                      ? "Thử thay đổi từ khóa hoặc bộ lọc khu vực để tìm thấy sự kiện."
                      : "Hiện tại đơn vị này chưa có chiến dịch sự kiện mới. Bạn hãy bấm nút Theo dõi để nhận thông báo sớm nhất!"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      className="border-0 shadow-xs hover:shadow-md"
                    />
                  ))}
                </div>
              )}
            </section>
          )}

        </div>
      </div>
    </MainLayout>
  )
}

