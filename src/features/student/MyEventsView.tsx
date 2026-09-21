"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { getUserFacingMessage } from "@/lib/error"
import { useUser } from "@/components/providers/AuthProvider"
import { useToast } from "@/components/providers/ToastProvider"
import { SkeletonGenericPage } from "@/components/ui/skeleton"
import ReviewModal from "@/features/event/components/ReviewModal"
import CertificateModal from "./components/CertificateModal"
import ActivityHeaderFilters, { MainTab, StatusFilter, SortOrder } from "./components/ActivityHeaderFilters"
import ApplicationCard from "./components/ApplicationCard"
import DashboardLayout from "@/components/layout/DashboardLayout"
import {
  Search,
  ExternalLink,
  Send,
} from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function MyEvents({ 
  embedded = false, 
  initialTab = "apply_status" 
}: { 
  embedded?: boolean
  initialTab?: MainTab 
} = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  const { user, profile, role, loading: authLoading } = useUser()

  const getInitialTab = (): MainTab => {
    const queryTab = searchParams?.get("subtab") || searchParams?.get("tab")
    if (queryTab === "saved_job" || queryTab === "saved") return "saved_job"
    if (queryTab === "offered_job" || queryTab === "offered") return "offered_job"
    if (queryTab === "followed_company" || queryTab === "followed") return "followed_company"
    if (queryTab === "apply_status" || queryTab === "applied") return "apply_status"
    return initialTab
  }

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<MainTab>(getInitialTab)

  useEffect(() => {
    const queryTab = searchParams?.get("subtab") || searchParams?.get("tab")
    if (queryTab === "saved_job" || queryTab === "saved") {
      setActiveTab("saved_job")
    } else if (queryTab === "offered_job" || queryTab === "offered") {
      setActiveTab("offered_job")
    } else if (queryTab === "followed_company" || queryTab === "followed") {
      setActiveTab("followed_company")
    } else if (queryTab === "apply_status" || queryTab === "applied") {
      setActiveTab("apply_status")
    } else if (initialTab) {
      setActiveTab(initialTab)
    }
  }, [searchParams, initialTab])

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest")
  const [searchQuery, setSearchQuery] = useState("")

  // Expanded card state
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})

  // Database Data States
  const [applications, setApplications] = useState<any[]>([])
  const [interviews, setInterviews] = useState<any[]>([])
  const [savedJobs, setSavedJobs] = useState<any[]>([])
  const [followedCompanies, setFollowedCompanies] = useState<any[]>([])

  // Modal States
  const [reviewingEvent, setReviewingEvent] = useState<{ eventId: string; organizerId: string; organizerName: string } | null>(null)
  const [viewingCertificate, setViewingCertificate] = useState<{ studentName: string; eventTitle: string; position: string; eventDate: string; organizerName: string } | null>(null)

  // Toggle card expansion
  const toggleExpand = (id: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id]
    }))
  }

  // Load Real Data from Supabase DB
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push("/login")
      return
    }
    if (role === "organizer" || profile?.role === "organizer") {
      router.replace("/dashboard")
      return
    }

    const fetchActivityData = async () => {
      setLoading(true)

      // 1. Fetch Applications with Events & Organizers
      const { data: appsData, error: appsError } = await supabase
        .from("applications")
        .select(`
          id, 
          status, 
          applied_at,
          student_note,
          attendance_status,
          events (
            id, title, location, status, position_type, category, benefits, event_date, end_date,
            start_time, end_time, salary_amount, salary_type, payment_method, zalo_group_link,
            application_deadline, ward_id, slug, organizer_id,
            danang_wards (name),
            profiles:organizer_id (id, full_name, avatar_url, university)
          )
        `)
        .eq("student_id", user.id)
        .order("applied_at", { ascending: false })

      if (appsError) {
        showToast({ title: "Lỗi", message: getUserFacingMessage(appsError, "Không thể tải danh sách đơn ứng tuyển."), type: "error" })
      } else if (appsData) {
        setApplications(appsData)
        // Default expand first card
        if (appsData.length > 0 && appsData[0].id) {
          setExpandedCards({ [appsData[0].id]: true })
        }
      }

      // 2. Fetch Interviews (Offered Job)
      const { data: intData } = await supabase
        .from("interviews")
        .select(`
          id,
          title,
          scheduled_at,
          meeting_link,
          status,
          events (
            id, title, location,
            profiles:organizer_id (id, full_name, avatar_url, university)
          )
        `)
        .eq("student_id", user.id)
        .order("scheduled_at", { ascending: false })

      if (intData) {
        setInterviews(intData)
      }

      // 3. Fetch Saved Jobs
      const { data: bookmarksData } = await supabase
        .from("event_bookmarks")
        .select(`
          id,
          created_at,
          events (
            id,
            title,
            position_type,
            salary_amount,
            salary_type,
            location,
            application_deadline,
            event_date,
            danang_wards (name),
            profiles:organizer_id (id, full_name, avatar_url, university)
          )
        `)
        .eq("student_id", user.id)
        .order("created_at", { ascending: false })

      if (bookmarksData) {
        const jobs = bookmarksData.map(b => b.events).filter(Boolean)
        setSavedJobs(jobs)
      }

      // 4. Fetch Followed Companies
      const { data: followsData } = await supabase
        .from("company_follows")
        .select(`
          id,
          created_at,
          organizer:profiles!company_follows_organizer_id_fkey (
            id,
            full_name,
            avatar_url,
            bio,
            address,
            slug,
            reliability_score,
            scale,
            website
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (followsData) {
        const orgs = followsData.map((f: any) => ({ ...f.organizer, followId: f.id })).filter(Boolean)
        setFollowedCompanies(orgs)
      }

      setLoading(false)
    }

    fetchActivityData()
  }, [user, authLoading, router, role, profile?.role, showToast])

  const handleUnfollowCompany = async (organizerId: string) => {
    if (!user) return
    const { error } = await supabase
      .from("company_follows")
      .delete()
      .eq("user_id", user.id)
      .eq("organizer_id", organizerId)

    if (!error) {
      setFollowedCompanies((prev) => prev.filter((c) => c.id !== organizerId))
      showToast({
        title: "Đã hủy theo dõi",
        message: "Bạn đã hủy theo dõi đơn vị tổ chức này.",
        type: "info",
      })
    }
  }

  // Filtered Applications
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const status = app.status || "pending"
      if (statusFilter === "all") return true
      if (statusFilter === "applied") return status === "pending"
      if (statusFilter === "checked") return status === "pending" // viewed/checked
      if (statusFilter === "accepted") return status === "approved"
      if (statusFilter === "rejected") return status === "rejected"
      if (statusFilter === "interviewed") return app.attendance_status === "completed" || interviews.some(i => i.events?.id === app.events?.id)
      return true
    })
  }, [applications, statusFilter, interviews])

  const fullName = profile?.full_name || "Nhân sự Sự kiện"
  const avatarUrl = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=005DDC&color=fff`

  const formatSalary = (amount: number | null, type: string | null) => {
    if (!amount) return "Thù lao thỏa thuận"
    const formatted = amount.toLocaleString("vi-VN") + "đ"
    switch (type) {
      case "per_hour": return `${formatted}/giờ`
      case "per_shift": return `${formatted}/ca`
      case "per_event": return `${formatted}/sự kiện`
      case "volunteer": return "Tình nguyện viên"
      default: return formatted
    }
  }

  if (loading) {
    if (embedded) {
      return (
        <div className="flex h-[400px] w-full items-center justify-center">
          <div className="size-6 border-2 border-[#005DDC] border-t-transparent rounded-full animate-spin mr-3" />
          <span className="text-sm text-slate-500">Đang tải hoạt động...</span>
        </div>
      )
    }
    return <SkeletonGenericPage />
  }

  const eventsContent = (
    <div className="w-full flex flex-col gap-6">

        {/* MAIN ACTIVITY CONTAINER CARD (Figma Frame 2147225433, node 6447:50551) */}
        <main className="w-full bg-white rounded-[16px] pt-[16px] px-[16px] pb-[32px] flex flex-col gap-[32px]" data-node-id="6447:50551">

            {/* 1. Main Navigation Tabs & Sub-Filter Bar (Figma Node 6447:50552) */}
            <ActivityHeaderFilters
              activeTab={activeTab}
              onTabChange={setActiveTab}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
            />

            {/* 3. TAB 1: APPLY STATUS CONTENT */}
            {activeTab === "apply_status" && (
              <div className="space-y-4">
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((app) => (
                    <ApplicationCard
                      key={app.id}
                      application={app}
                      isExpanded={expandedCards[app.id] !== false}
                      onToggleExpand={() => toggleExpand(app.id)}
                      onViewCertificate={setViewingCertificate}
                      onReview={setReviewingEvent}
                      studentFullName={fullName}
                    />
                  ))
                ) : (
                  <div className="py-16 flex flex-col items-center justify-center text-center gap-3 border border-dashed border-[#cbcbcb] rounded-[12px]">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#005ddc]">
                      <Send className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[16px] font-medium text-[#282828]">
                        Chưa có đơn ứng tuyển nào theo bộ lọc
                      </p>
                      <p className="text-xs text-[#757575] mt-1 max-w-[320px]">
                        Hãy khám phá các chiến dịch sự kiện hấp dẫn trên EventMate để nộp hồ sơ ngay.
                      </p>
                    </div>
                    <Link
                      href="/events"
                      className="mt-2 h-9 px-4 rounded-[8px] bg-[#005ddc] hover:bg-[#004eb7] text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Khám phá việc làm sự kiện</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* 4. TAB 2: OFFERED JOB (Interviews) */}
            {activeTab === "offered_job" && (
              <div className="space-y-4">
                {interviews.length > 0 ? (
                  interviews.map((inv) => (
                    <div key={inv.id} className="p-5 rounded-[12px] bg-white border border-[#ededed] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold text-[11px]">
                            Lịch phỏng vấn / Thử việc
                          </span>
                          <span className="text-xs text-[#757575]">
                            {inv.scheduled_at ? new Date(inv.scheduled_at).toLocaleString("vi-VN") : ""}
                          </span>
                        </div>
                        <h4 className="text-[16px] font-semibold text-[#222]">{inv.title}</h4>
                        <p className="text-xs text-[#757575]">Sự kiện: {inv.events?.title}</p>
                      </div>

                      {inv.meeting_link && (
                        <a
                          href={inv.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-9 px-4 rounded-[8px] bg-[#005ddc] hover:bg-[#004eb7] text-white text-xs font-medium flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Vào phòng họp trực tuyến</span>
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-16 text-center border border-dashed border-[#cbcbcb] rounded-[12px] space-y-2">
                    <p className="text-[15px] font-medium text-[#757575]">Chưa có lời mời phỏng vấn nào</p>
                    <p className="text-xs text-[#a5a5a5]">Khi nhà tuyển dụng gửi lịch phỏng vấn, thông tin sẽ xuất hiện tại đây.</p>
                  </div>
                )}
              </div>
            )}

            {/* 5. TAB 3: SAVED JOB */}
            {activeTab === "saved_job" && (
              <div className="space-y-3">
                {savedJobs.length > 0 ? (
                  savedJobs.map((job) => {
                    const orgName = job.profiles?.full_name || job.profiles?.university || "Ban Tổ Chức"
                    const orgAvatar = job.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(orgName)}&background=005DDC&color=fff`
                    const wardName = job.danang_wards?.name || job.location || "Đà Nẵng"

                    return (
                      <div key={job.id} className="p-4 rounded-[12px] bg-white border border-[#ededed] shadow-2xs flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-[#ededed] shrink-0">
                            <img src={orgAvatar} alt={orgName} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <Link href={`/events/${job.id}`} className="text-[15px] font-semibold text-[#222] hover:text-[#005ddc] truncate block">
                              {job.title}
                            </Link>
                            <p className="text-xs text-[#757575] mt-0.5 truncate">
                              {orgName} • {job.position_type} • {wardName}
                            </p>
                          </div>
                        </div>

                        <Link
                          href={`/events/${job.id}`}
                          className="h-8 px-3 rounded-[6px] bg-[#005ddc] text-white hover:bg-[#004eb7] text-xs font-medium flex items-center gap-1 shrink-0"
                        >
                          Ứng tuyển ngay
                        </Link>
                      </div>
                    )
                  })
                ) : (
                  <div className="py-16 text-center border border-dashed border-[#cbcbcb] rounded-[12px] space-y-2">
                    <p className="text-[15px] font-medium text-[#757575]">Chưa có việc làm sự kiện nào được lưu</p>
                    <Link href="/events" className="inline-block text-xs font-medium text-[#005ddc] hover:underline">
                      Xem danh sách sự kiện đang tuyển
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* 6. TAB 4: FOLLOWED COMPANY */}
            {activeTab === "followed_company" && (
              <div className="space-y-4">
                {followedCompanies.length === 0 ? (
                  <div className="py-16 text-center border border-dashed border-[#cbcbcb] rounded-[12px] space-y-2">
                    <p className="text-[15px] font-medium text-[#757575]">Chưa theo dõi đơn vị tổ chức nào</p>
                    <p className="text-xs text-[#a5a5a5]">Theo dõi các nhà tổ chức sự kiện uy tín để nhận thông báo tuyển dụng sớm nhất.</p>
                    <Link href="/events" className="inline-block text-xs font-medium text-[#005ddc] hover:underline pt-1">
                      Khám phá danh sách sự kiện & ban tổ chức
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {followedCompanies.map((comp) => {
                      const targetUrl = comp.slug ? `/companies/${comp.slug}` : `/companies/${comp.id}`
                      return (
                        <div
                          key={comp.id}
                          className="p-4 rounded-[12px] border border-[#ededed] bg-white hover:border-slate-300 transition-all flex flex-col justify-between gap-4"
                        >
                          <div className="flex items-start gap-3.5 min-w-0">
                            <Avatar className="size-12 rounded-[8px] border border-slate-200 shrink-0">
                              <AvatarImage src={comp.avatar_url} className="object-cover" />
                              <AvatarFallback className="rounded-[8px] bg-slate-100 font-bold text-slate-700">
                                {comp.full_name?.charAt(0).toUpperCase() || "O"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0 space-y-1">
                              <Link
                                href={targetUrl}
                                className="font-semibold text-[15px] text-[#222222] hover:text-[#005DDC] transition-colors truncate block"
                              >
                                {comp.full_name}
                              </Link>
                              {comp.address && (
                                <p className="text-[12px] text-[#757575] truncate">{comp.address}</p>
                              )}
                              {comp.bio && (
                                <p className="text-[12px] text-[#515151] line-clamp-2 leading-relaxed">
                                  {comp.bio}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-[#f4f4f4] gap-2">
                            <Link
                              href={targetUrl}
                              className="text-[12px] font-medium text-[#005DDC] hover:underline"
                            >
                              Xem trang tổ chức →
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleUnfollowCompany(comp.id)}
                              className="px-3 py-1 rounded-[6px] text-xs font-medium border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                            >
                              Bỏ theo dõi
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

          </main>

        {/* Review Modal */}
        {reviewingEvent && user && (
          <ReviewModal
            isOpen={!!reviewingEvent}
            onClose={() => setReviewingEvent(null)}
            eventId={reviewingEvent.eventId}
            reviewerId={user.id}
            revieweeId={reviewingEvent.organizerId}
            revieweeName={reviewingEvent.organizerName}
          />
        )}

        {/* Certificate Modal */}
        {viewingCertificate && (
          <CertificateModal
            isOpen={!!viewingCertificate}
            onClose={() => setViewingCertificate(null)}
            studentName={viewingCertificate.studentName}
            eventTitle={viewingCertificate.eventTitle}
            position={viewingCertificate.position}
            eventDate={viewingCertificate.eventDate}
            organizerName={viewingCertificate.organizerName}
          />
        )}
      </div>
  )

  if (embedded) {
    return (
      <div className="w-full">
        {eventsContent}
        {reviewingEvent && user && (
          <ReviewModal
            isOpen={!!reviewingEvent}
            onClose={() => setReviewingEvent(null)}
            eventId={reviewingEvent.eventId}
            reviewerId={user.id}
            revieweeId={reviewingEvent.organizerId}
            revieweeName={reviewingEvent.organizerName}
          />
        )}
      </div>
    )
  }

  return (
    <DashboardLayout
      role="student"
      activeTab="activity"
      activeItem="activity"
      title="Hoạt động sự kiện"
      subtitle="Cập nhật thông tin đầy đủ giúp bạn nhận được cơ hội sự kiện phù hợp nhất"
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      avatarUrl={avatarUrl}
      userProfile={{
        fullName: profile?.full_name || "Nhân sự Sự kiện",
        avatarUrl,
        email: profile?.email || user?.email || "",
      }}
    >
      {eventsContent}
      {reviewingEvent && user && (
        <ReviewModal
          isOpen={!!reviewingEvent}
          onClose={() => setReviewingEvent(null)}
          eventId={reviewingEvent.eventId}
          reviewerId={user.id}
          revieweeId={reviewingEvent.organizerId}
          revieweeName={reviewingEvent.organizerName}
        />
      )}
    </DashboardLayout>
  )
}
