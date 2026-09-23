"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/components/providers/AuthProvider"
import { useToast } from "@/components/providers/ToastProvider"
import { supabase } from "@/lib/supabase"
import { getUserFacingMessage } from "@/lib/error"

import EmployerStatsCards from "./components/dashboard/EmployerStatsCards"
import JobStatisticsChart from "./components/dashboard/JobStatisticsChart"
import ScheduleWidget, { InterviewItem } from "./components/dashboard/ScheduleWidget"
import SubscriptionCard from "./components/dashboard/SubscriptionCard"
import RecentlyPostedJobsTable from "./components/dashboard/RecentlyPostedJobsTable"
import { SkeletonGenericPage } from "@/components/ui/skeleton"

export default function OrgDashboard() {
  const router = useRouter()
  const { showToast } = useToast()
  const { user, profile, isPremium, singleEventCredits, loading: authLoading } = useUser()

  const [events, setEvents] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [activeChats, setActiveChats] = useState<any[]>([])
  const [interviews, setInterviews] = useState<InterviewItem[]>([])
  const [feedStats, setFeedStats] = useState<{ approvalRate: number; weeklyApps: number[] }>({
    approvalRate: 0,
    weeklyApps: [0, 0, 0, 0],
  })

  // 1. Fetch Organizer Events
  const fetchMyEvents = async () => {
    if (!user) return
    setFetching(true)

    const { data, error } = await supabase
      .from("events")
      .select("*, applications(id, status, applied_at)")
      .eq("organizer_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setEvents(data)

      // Calculate feed stats from applications
      const allApps = data.flatMap((ev: any) => ev.applications || [])
      if (allApps.length > 0) {
        const approved = allApps.filter((a: any) => a.status === "approved").length
        const rate = Math.round((approved / allApps.length) * 100)

        const now = Date.now()
        const weekMs = 7 * 24 * 60 * 60 * 1000
        const weekly = [0, 0, 0, 0]
        allApps.forEach((a: any) => {
          if (a.applied_at) {
            const applied = new Date(a.applied_at).getTime()
            const weeksAgo = Math.floor((now - applied) / weekMs)
            if (weeksAgo >= 0 && weeksAgo < 4) weekly[3 - weeksAgo]++
          }
        })

        setFeedStats({ approvalRate: rate, weeklyApps: weekly })
      }
    }
    setFetching(false)
  }

  // 2. Fetch Active Chats Count
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push("/login")
      return
    }

    fetchMyEvents()

    const fetchChats = async () => {
      const { data } = await supabase
        .from("chats")
        .select("id")
        .eq("organizer_id", user.id)

      if (data) setActiveChats(data)
    }

    const fetchInterviews = async () => {
      const { data, error } = await supabase
        .from("interviews")
        .select(`
          id,
          title,
          scheduled_at,
          meeting_link,
          status,
          student:profiles!interviews_student_id_fkey(id, full_name, avatar_url),
          event:events!interviews_event_id_fkey(id, title)
        `)
        .eq("organizer_id", user.id)
        .order("scheduled_at", { ascending: true })

      if (!error && data) {
        const mapped: InterviewItem[] = data.map((inv: any) => ({
          id: inv.id,
          name: inv.student?.full_name || "Ứng viên",
          role: inv.event?.title || inv.title || "Phỏng vấn sự kiện",
          time: new Date(inv.scheduled_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          meetLink: inv.meeting_link || undefined
        }))
        setInterviews(mapped)
      }
    }

    fetchChats()
    fetchInterviews()
  }, [user, authLoading])

  const handleDeleteEvent = async (id: string) => {
    const isConfirmed = window.confirm(
      "🚨 BẠN CÓ CHẮC CHẮN MUỐN XÓA SỰ KIỆN NÀY?\nToàn bộ đơn đăng ký của sinh viên cũng sẽ bị xóa vĩnh viễn!"
    )
    if (!isConfirmed) return

    const { error } = await supabase
      .from("events")
      .update({ deleted_at: new Date().toISOString(), status: "closed" })
      .eq("id", id)
    if (error) {
      showToast({
        title: "Lỗi",
        message: getUserFacingMessage(error, "Không thể xóa sự kiện."),
        type: "error",
      })
    } else {
      showToast({
        title: "Thành công",
        message: "Đã xóa sự kiện thành công!",
        type: "success",
      })
      fetchMyEvents()
    }
  }

  const handleNavigate = (tab: string) => {
    if (tab === "post-job") router.push("/post-job")
    else if (tab === "events") router.push("/manage-events")
    else if (tab === "chat") router.push("/chat")
    else if (tab === "notifications") router.push("/notifications")
    else if (tab === "account") router.push("/account")
  }

  if (authLoading || fetching) {
    return <SkeletonGenericPage />
  }

  const activeEventsCount = events.filter(
    (ev) => ev.status !== "closed" && (!ev.event_date || new Date(ev.event_date) >= new Date())
  ).length

  // Quota & Subscription stats
  const maxQuota = isPremium ? 5 : 1 + (singleEventCredits || 0)
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime()
  const eventsThisMonthCount = events.filter((ev) => {
    if (!ev.created_at) return false
    // Chỉ các tin thuộc gói VIP (enterprise/standard) mới trừ vào hạn mức 5 tin
    // Tin đăng thuộc gói Free hoặc các tin khác tuyệt đối không trừ vào hạn mức VIP
    if (isPremium && ev.plan_tier !== "enterprise" && ev.plan_tier !== "standard") return false
    if (!isPremium && ev.plan_tier !== "free") return false
    return new Date(ev.created_at).getTime() >= startOfMonth
  }).length
  const postsLeft = Math.max(0, maxQuota - eventsThisMonthCount)
  const daysLeft = profile?.premium_until
    ? Math.max(0, Math.ceil((new Date(profile.premium_until).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  return (
    <div className="space-y-6">
      {/* Top Row: 2-Column Responsive Layout matching Figma */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols in 12-col grid) */}
        <div className="lg:col-span-8 space-y-6">
          <EmployerStatsCards
            candidatesCount={events.reduce(
              (acc, ev) => acc + (ev.applications?.length || 0),
              0
            )}
            messagesCount={activeChats.length}
            interviewsCount={interviews.length > 0 ? interviews.length : events.reduce(
              (acc, ev) =>
                acc + (ev.applications?.filter((a: any) => a.status === "approved").length || 0),
              0
            )}
            onNavigateTab={handleNavigate}
          />

          <JobStatisticsChart
            events={events}
            totalViews={events.reduce((acc, ev) => acc + (ev.views_count || 0), 0)}
            totalApplied={events.reduce((acc, ev) => acc + (ev.applications?.length || 0), 0)}
            totalOpened={activeEventsCount}
          />
        </div>

        {/* Right Column (4 cols in 12-col grid) */}
        <div className="lg:col-span-4 space-y-6">
          <ScheduleWidget
            interviews={interviews}
            onOpenMeet={(item) =>
              window.open(item.meetLink || "https://meet.google.com/new", "_blank")
            }
          />

          <SubscriptionCard
            isPremium={isPremium}
            singleEventCredits={singleEventCredits || 0}
            joinDate={
              user?.created_at
                ? `Tham gia từ ${new Date(user.created_at).toLocaleDateString("vi-VN")}`
                : "Thành viên EventMate"
            }
            postsLeft={postsLeft}
            totalPosts={maxQuota}
            daysLeft={daysLeft}
            onUpgrade={() => router.push("/pricing")}
            onManage={() => router.push("/pricing")}
          />
        </div>
      </div>

      {/* Bottom Row: Recently Posted Jobs Table */}
      <RecentlyPostedJobsTable
        events={events}
        onViewAll={() => router.push("/manage-events")}
        onViewApplications={(ev) => router.push(`/manage-events?eventId=${ev.id}`)}
        onEditEvent={(ev) => router.push(`/post-job?edit=${ev.id}`)}
        onDeleteEvent={(id) => handleDeleteEvent(id)}
      />
    </div>
  )
}