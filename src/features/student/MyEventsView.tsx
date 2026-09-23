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
  Calendar,
  Clock,
  MapPin,
  Banknote,
  Bookmark,
  Trash2,
  Building2,
  Inbox,
  Video,
  ArrowRight,
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
        const jobs = bookmarksData.map(b => ({
          ...b.events,
          bookmarkId: b.id,
        })).filter(Boolean)
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

  const handleRemoveBookmark = async (eventId: string) => {
    if (!user) return
    const { error } = await supabase
      .from("event_bookmarks")
      .delete()
      .eq("student_id", user.id)
      .eq("event_id", eventId)

    if (!error) {
      setSavedJobs((prev) => prev.filter((j) => j.id !== eventId))
      showToast({
        title: "Đã bỏ lưu",
        message: "Sự kiện đã được xóa khỏi danh sách đã lưu.",
        type: "info",
      })
    }
  }

  // Filtered & Sorted Applications
  const filteredApplications = useMemo(() => {
    let list = applications.filter(app => {
      const status = app.status || "pending"
      if (statusFilter === "all") return true
      if (statusFilter === "applied") return status === "pending"
      if (statusFilter === "checked") return status === "pending"
      if (statusFilter === "accepted") return status === "approved"
      if (statusFilter === "rejected") return status === "rejected"
      if (statusFilter === "interviewed") return app.attendance_status === "completed" || interviews.some(i => i.events?.id === app.events?.id)
      return true
    })

    if (sortOrder === "oldest") {
      list = [...list].sort((a, b) => new Date(a.applied_at).getTime() - new Date(b.applied_at).getTime())
    } else {
      list = [...list].sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime())
    }

    return list
  }, [applications, statusFilter, interviews, sortOrder])

  const fullName = profile?.full_name || "Nhân sự Sự kiện"
  const avatarUrl = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=27272a&color=fff`

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
        <div className="flex h-80 w-full items-center justify-center">
          <div className="size-6 border-2 border-zinc-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin mr-3" />
          <span className="text-sm text-zinc-500">Đang tải hoạt động...</span>
        </div>
      )
    }
    return <SkeletonGenericPage />
  }

  const eventsContent = (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-16 font-['Inter',sans-serif]">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Hoạt động & Ứng tuyển
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Theo dõi tiến độ xét duyệt đơn ứng tuyển, lời mời phỏng vấn và các sự kiện đã lưu
          </p>
        </div>

        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-white text-xs font-medium transition-colors shrink-0 shadow-xs self-start sm:self-auto"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Tìm việc sự kiện mới</span>
        </Link>
      </div>

      {/* 2. Main Navigation Tabs & Sub-Filter Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs space-y-6">
        <ActivityHeaderFilters
          activeTab={activeTab}
          onTabChange={setActiveTab}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          counts={{
            apply_status: applications.length,
            offered_job: interviews.length,
            saved_job: savedJobs.length,
            followed_company: followedCompanies.length,
          }}
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
                  formatSalary={formatSalary}
                />
              ))
            ) : (
              <div className="py-16 px-4 flex flex-col items-center justify-center text-center gap-3 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-850/50">
                <div className="size-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                  <Inbox className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Chưa có đơn ứng tuyển nào phù hợp
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
                    {statusFilter !== "all"
                      ? "Không tìm thấy đơn ứng tuyển nào ở trạng thái này. Hãy thử chọn bộ lọc khác."
                      : "Bạn chưa nộp hồ sơ vào sự kiện nào. Hãy khám phá các sự kiện đang tuyển để nộp đơn ngay!"}
                  </p>
                </div>
                {statusFilter === "all" && (
                  <Link
                    href="/events"
                    className="mt-2 h-8 px-3.5 rounded-lg bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Khám phá việc làm sự kiện</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* 4. TAB 2: OFFERED JOB (Interviews / Work Offers) */}
        {activeTab === "offered_job" && (
          <div className="space-y-4">
            {interviews.length > 0 ? (
              interviews.map((inv) => (
                <div
                  key={inv.id}
                  className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold text-[11px] border border-purple-200 dark:border-purple-800/60">
                        Lịch phỏng vấn / Thử việc
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {inv.scheduled_at ? new Date(inv.scheduled_at).toLocaleString("vi-VN") : ""}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      {inv.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Sự kiện: <span className="font-medium text-zinc-700 dark:text-zinc-300">{inv.events?.title}</span>
                    </p>
                  </div>

                  {inv.meeting_link && (
                    <a
                      href={inv.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 px-4 rounded-lg bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-white text-xs font-medium flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Vào phòng họp trực tuyến</span>
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div className="py-16 px-4 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-850/50 space-y-2">
                <div className="size-12 rounded-full bg-zinc-100 dark:bg-zinc-800 mx-auto flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Chưa có lịch phỏng vấn nào
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                  Khi Ban tổ chức sắp xếp lịch phỏng vấn hoặc lời mời nhận việc, thông tin sẽ được gửi tới bạn tại đây.
                </p>
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
                const orgAvatar = job.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(orgName)}&background=27272a&color=fff`
                const wardName = job.danang_wards?.name || job.location || "Đà Nẵng"
                const deadlineDisplay = job.application_deadline
                  ? new Date(job.application_deadline).toLocaleDateString("vi-VN")
                  : null

                return (
                  <div
                    key={job.id}
                    className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="size-12 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 shrink-0">
                        <img
                          src={orgAvatar}
                          alt={orgName}
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(orgName)}&background=27272a&color=fff&size=48`
                          }}
                          className="size-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <Link
                          href={`/events/${job.id}`}
                          className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 truncate block"
                        >
                          {job.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">{orgName}</span>
                          <span>•</span>
                          <span>{job.position_type || "Nhân sự sự kiện"}</span>
                          <span>•</span>
                          <span>{wardName}</span>
                          {deadlineDisplay && (
                            <>
                              <span>•</span>
                              <span className="text-rose-600 dark:text-rose-400">Hạn: {deadlineDisplay}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRemoveBookmark(job.id)}
                        className="size-8 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Bỏ lưu sự kiện"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <Link
                        href={`/events/${job.id}`}
                        className="h-8 px-3.5 rounded-lg bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-white text-xs font-medium flex items-center gap-1 shrink-0 transition-colors shadow-xs"
                      >
                        <span>Ứng tuyển ngay</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="py-16 px-4 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-850/50 space-y-2">
                <div className="size-12 rounded-full bg-zinc-100 dark:bg-zinc-800 mx-auto flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                  <Bookmark className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Chưa có sự kiện nào được lưu
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                  Bạn có thể lưu các sự kiện yêu thích để xem lại và ứng tuyển sau bất cứ lúc nào.
                </p>
                <Link
                  href="/events"
                  className="inline-flex items-center gap-1.5 pt-2 text-xs font-medium text-zinc-900 dark:text-zinc-100 hover:underline"
                >
                  <span>Khám phá danh sách sự kiện</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* 6. TAB 4: FOLLOWED COMPANY */}
        {activeTab === "followed_company" && (
          <div className="space-y-4">
            {followedCompanies.length === 0 ? (
              <div className="py-16 px-4 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-850/50 space-y-2">
                <div className="size-12 rounded-full bg-zinc-100 dark:bg-zinc-800 mx-auto flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Chưa theo dõi đơn vị tổ chức nào
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                  Theo dõi các CLB và Ban tổ chức uy tín để nhận thông báo cơ hội việc làm sự kiện sớm nhất.
                </p>
                <Link
                  href="/events"
                  className="inline-flex items-center gap-1.5 pt-2 text-xs font-medium text-zinc-900 dark:text-zinc-100 hover:underline"
                >
                  <span>Xem các đơn vị tổ chức tiêu biểu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {followedCompanies.map((comp) => {
                  const targetUrl = comp.slug ? `/companies/${comp.slug}` : `/companies/${comp.id}`
                  return (
                    <div
                      key={comp.id}
                      className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <Avatar className="size-12 rounded-xl border border-zinc-200 dark:border-zinc-700 shrink-0">
                          <AvatarImage src={comp.avatar_url} className="object-cover" />
                          <AvatarFallback className="rounded-xl bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-700 dark:text-zinc-300">
                            {comp.full_name?.charAt(0).toUpperCase() || "O"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 space-y-1">
                          <Link
                            href={targetUrl}
                            className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate block"
                          >
                            {comp.full_name}
                          </Link>
                          {comp.address && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {comp.address}
                            </p>
                          )}
                          {comp.bio && (
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed pt-0.5">
                              {comp.bio}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800 gap-2">
                        <Link
                          href={targetUrl}
                          className="text-xs font-medium text-zinc-900 dark:text-zinc-100 hover:underline inline-flex items-center gap-1"
                        >
                          <span>Xem trang đơn vị</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleUnfollowCompany(comp.id)}
                          className="px-2.5 py-1 rounded-md text-xs font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
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
      </div>

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
