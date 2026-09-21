"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/components/providers/AuthProvider"
import { SkeletonGenericPage } from "@/components/ui/skeleton"
import ProfileCompletionHero from "./components/dashboard/ProfileCompletionHero"
import StudentJobStatisticsChart from "./components/dashboard/StudentJobStatisticsChart"
import SavedJobsWidget from "./components/dashboard/SavedJobsWidget"
import { ApplicationStatusDonut } from "./components/dashboard/ApplicationStatusDonut"
import { RecentMessagesWidget } from "./components/dashboard/RecentMessagesWidget"
import { getStudentProfileCompletion } from "@/lib/profile-completion"

export default function JobSeekerDashboard() {
  const router = useRouter()
  const { user, profile, role, loading: authLoading } = useUser()

  const [loading, setLoading] = useState(true)
  const [timePeriod, setTimePeriod] = useState<"week" | "month" | "year">("week")

  // Database Data States
  const [savedJobs, setSavedJobs] = useState<any[]>([])
  const [applicationStats, setApplicationStats] = useState({
    total: 0,
    underReview: 0,
    accepted: 0,
    rejected: 0,
  })
  const [recentChats, setRecentChats] = useState<any[]>([])
  const [profileViewsCount, setProfileViewsCount] = useState(0)
  const [profileLikesCount, setProfileLikesCount] = useState(0)
  const [rawApplications, setRawApplications] = useState<any[]>([])
  const [recentViews, setRecentViews] = useState<any[]>([])

  // Calculate real profile completion (Thống nhất 100% với Profile Page)
  const cvPercent = useMemo(() => {
    if (!profile && !user) return 0
    return getStudentProfileCompletion(user, profile).percent
  }, [user, profile])

  // Load Dashboard Data from Supabase
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

    const fetchDashboardData = async () => {
      setLoading(true)

      // 1. Fetch Applications count & statuses
      const { data: appsData } = await supabase
        .from("applications")
        .select("id, status, applied_at")
        .eq("student_id", user.id)

      if (appsData) {
        setRawApplications(appsData)
        const total = appsData.length
        const underReview = appsData.filter(a => a.status === "pending" || !a.status).length
        const accepted = appsData.filter(a => a.status === "approved").length
        const rejected = appsData.filter(a => a.status === "rejected").length

        setApplicationStats({
          total,
          underReview,
          accepted,
          rejected,
        })
      }

      // 2. Fetch Saved Jobs (Bookmarked events with event & organizer details)
      const { data: bookmarksData } = await supabase
        .from("event_bookmarks")
        .select(`
          id,
          created_at,
          events (
            id,
            title,
            location,
            event_date,
            application_deadline,
            salary_amount,
            salary_type,
            benefits,
            position_type,
            danang_wards (name),
            organizer:organizer_id (id, full_name, avatar_url, university)
          )
        `)
        .eq("student_id", user.id)

      if (bookmarksData) {
        const jobs = bookmarksData
          .map(b => b.events)
          .filter(Boolean)
        setSavedJobs(jobs)
      }

      // 3. Fetch Recent Chats / Messages
      const { data: chatsData } = await supabase
        .from("chats")
        .select(`
          id,
          created_at,
          events (title),
          organizer:organizer_id (id, full_name, avatar_url),
          messages (id, content, created_at, sender_id)
        `)
        .eq("student_id", user.id)
        .order("created_at", { ascending: false })
        .limit(4)

      if (chatsData) {
        setRecentChats(chatsData)
      }

      // 4. Fetch Real Profile Views & Profile Likes count
      const [viewsRes, likesRes] = await Promise.all([
        supabase
          .from("profile_views")
          .select("id, viewed_at")
          .eq("student_id", user.id),
        supabase
          .from("profile_likes")
          .select("id", { count: "exact", head: true })
          .eq("student_id", user.id),
      ])

      if (viewsRes.data) {
        setRecentViews(viewsRes.data)
        setProfileViewsCount(viewsRes.data.length)
      }
      if (likesRes.count !== null && likesRes.count !== undefined) {
        setProfileLikesCount(likesRes.count)
      }

      setLoading(false)
    }

    fetchDashboardData()
  }, [user, authLoading, router, role, profile?.role])

  const fullName = profile?.full_name || "Nhân sự Sự kiện"
  const avatarUrl = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=005DDC&color=fff`

  // Calculation for Donut Chart Percentages
  const totalApps = applicationStats.total || 0
  const reviewPct = totalApps > 0 ? (applicationStats.underReview / totalApps) * 100 : 0
  const acceptPct = totalApps > 0 ? (applicationStats.accepted / totalApps) * 100 : 0
  const rejectPct = totalApps > 0 ? (applicationStats.rejected / totalApps) * 100 : 0

  // Dynamic Activity Chart Metrics based on timePeriod ("week" | "month" | "year")
  const { chartData, periodViewsCount, periodAppsCount, periodLabel, viewsGrowthPct, appsGrowthPct } = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() // 0-indexed

    if (timePeriod === "week") {
      // 7 rolling days
      const result: { label: string; dateStr: string; views: number; apps: number }[] = []
      const dayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]

      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(now.getDate() - i)
        const dateStr = d.toISOString().split("T")[0]
        const dayName = dayLabels[d.getDay()]

        const dayViews = recentViews.filter(v => v.viewed_at?.startsWith(dateStr)).length
        const dayApps = rawApplications.filter(a => a.applied_at?.startsWith(dateStr)).length

        result.push({
          label: dayName,
          dateStr,
          views: dayViews,
          apps: dayApps,
        })
      }

      const totalViews = result.reduce((sum, r) => sum + r.views, 0)
      const totalApps = result.reduce((sum, r) => sum + r.apps, 0)

      let prevViews = 0
      let prevApps = 0
      for (let i = 13; i >= 7; i--) {
        const d = new Date()
        d.setDate(now.getDate() - i)
        const dateStr = d.toISOString().split("T")[0]
        prevViews += recentViews.filter(v => v.viewed_at?.startsWith(dateStr)).length
        prevApps += rawApplications.filter(a => a.applied_at?.startsWith(dateStr)).length
      }

      const vGrowth = prevViews === 0 ? (totalViews > 0 ? 100 : 0) : Math.round(((totalViews - prevViews) / prevViews) * 100)
      const aGrowth = prevApps === 0 ? (totalApps > 0 ? 100 : 0) : Math.round(((totalApps - prevApps) / prevApps) * 100)

      return {
        chartData: result,
        periodViewsCount: totalViews,
        periodAppsCount: totalApps,
        periodLabel: "Tuần này",
        viewsGrowthPct: vGrowth,
        appsGrowthPct: aGrowth,
      }
    }

    if (timePeriod === "month") {
      // Current Month split into 4-5 weeks
      const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

      const weeks = [
        { label: "Tuần 1", start: 1, end: 7 },
        { label: "Tuần 2", start: 8, end: 14 },
        { label: "Tuần 3", start: 15, end: 21 },
        { label: "Tuần 4", start: 22, end: 28 },
        { label: "Tuần 5", start: 29, end: daysInMonth },
      ].filter(w => w.start <= daysInMonth)

      const result = weeks.map(w => {
        let wViews = 0
        let wApps = 0
        for (let d = w.start; d <= Math.min(w.end, daysInMonth); d++) {
          const dateStr = `${monthPrefix}-${String(d).padStart(2, "0")}`
          wViews += recentViews.filter(v => v.viewed_at?.startsWith(dateStr)).length
          wApps += rawApplications.filter(a => a.applied_at?.startsWith(dateStr)).length
        }
        return {
          label: w.label,
          dateStr: `${monthPrefix}-${String(w.start).padStart(2, "0")}`,
          views: wViews,
          apps: wApps,
        }
      })

      const totalViews = recentViews.filter(v => v.viewed_at?.startsWith(monthPrefix)).length
      const totalApps = rawApplications.filter(a => a.applied_at?.startsWith(monthPrefix)).length

      const prevM = currentMonth === 0 ? 12 : currentMonth
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear
      const prevPrefix = `${prevY}-${String(prevM).padStart(2, "0")}`
      const prevViews = recentViews.filter(v => v.viewed_at?.startsWith(prevPrefix)).length
      const prevApps = rawApplications.filter(a => a.applied_at?.startsWith(prevPrefix)).length

      const vGrowth = prevViews === 0 ? (totalViews > 0 ? 100 : 0) : Math.round(((totalViews - prevViews) / prevViews) * 100)
      const aGrowth = prevApps === 0 ? (totalApps > 0 ? 100 : 0) : Math.round(((totalApps - prevApps) / prevApps) * 100)

      return {
        chartData: result,
        periodViewsCount: totalViews,
        periodAppsCount: totalApps,
        periodLabel: "Tháng này",
        viewsGrowthPct: vGrowth,
        appsGrowthPct: aGrowth,
      }
    }

    // timePeriod === "year" (12 months)
    const yearPrefix = `${currentYear}`
    const result: { label: string; dateStr: string; views: number; apps: number }[] = []
    for (let m = 1; m <= 12; m++) {
      const mPrefix = `${yearPrefix}-${String(m).padStart(2, "0")}`
      const mViews = recentViews.filter(v => v.viewed_at?.startsWith(mPrefix)).length
      const mApps = rawApplications.filter(a => a.applied_at?.startsWith(mPrefix)).length
      result.push({
        label: `T${m}`,
        dateStr: mPrefix,
        views: mViews,
        apps: mApps,
      })
    }

    const totalViews = recentViews.filter(v => v.viewed_at?.startsWith(yearPrefix)).length
    const totalApps = rawApplications.filter(a => a.applied_at?.startsWith(yearPrefix)).length

    const prevYearPrefix = `${currentYear - 1}`
    const prevViews = recentViews.filter(v => v.viewed_at?.startsWith(prevYearPrefix)).length
    const prevApps = rawApplications.filter(a => a.applied_at?.startsWith(prevYearPrefix)).length

    const vGrowth = prevViews === 0 ? (totalViews > 0 ? 100 : 0) : Math.round(((totalViews - prevViews) / prevViews) * 100)
    const aGrowth = prevApps === 0 ? (totalApps > 0 ? 100 : 0) : Math.round(((totalApps - prevApps) / prevApps) * 100)

    return {
      chartData: result,
      periodViewsCount: totalViews,
      periodAppsCount: totalApps,
      periodLabel: "Năm nay",
      viewsGrowthPct: vGrowth,
      appsGrowthPct: aGrowth,
    }
  }, [timePeriod, recentViews, rawApplications])

  const dateRangeLabel = useMemo(() => {
    const now = new Date()
    if (timePeriod === "week") {
      const start = new Date()
      start.setDate(now.getDate() - 6)
      const format = (d: Date) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`
      return `Hiển thị thống kê từ ${format(start)} - ${format(now)}/${now.getFullYear()}`
    }
    if (timePeriod === "month") {
      return `Hiển thị thống kê trong Tháng ${now.getMonth() + 1}/${now.getFullYear()}`
    }
    return `Hiển thị thống kê trong Năm ${now.getFullYear()}`
  }, [timePeriod])

  if (loading) return <SkeletonGenericPage />

  return (
    <div className="w-full">
      {/* MAIN TWO-COLUMN CONTENT GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full">
        {/* CENTER COLUMN: Main Dashboard Cards (8 of 12 columns) */}
        <main className="xl:col-span-8 flex flex-col gap-6 w-full min-w-0">
          <ProfileCompletionHero
            fullName={fullName}
            avatarUrl={avatarUrl}
            cvPercent={cvPercent}
            profileViewsCount={profileViewsCount}
            profileLikesCount={profileLikesCount}
          />

          <StudentJobStatisticsChart
            timePeriod={timePeriod}
            setTimePeriod={setTimePeriod}
            chartData={chartData}
            dateRangeLabel={dateRangeLabel}
            periodViewsCount={periodViewsCount}
            periodAppsCount={periodAppsCount}
            periodLabel={periodLabel}
            viewsGrowthPct={viewsGrowthPct}
            appsGrowthPct={appsGrowthPct}
          />

          <SavedJobsWidget savedJobs={savedJobs} />
        </main>

        {/* RIGHT COLUMN: Donut Chart Status + Messages Widget (4 of 12 columns) */}
        <aside className="xl:col-span-4 flex flex-col gap-6 w-full min-w-0 self-start">
          <ApplicationStatusDonut
            applicationStats={applicationStats}
            reviewPct={reviewPct}
            acceptPct={acceptPct}
            rejectPct={rejectPct}
          />

          <RecentMessagesWidget recentChats={recentChats} />
        </aside>
      </div>
    </div>
  )
}
