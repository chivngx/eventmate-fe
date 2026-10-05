"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/components/providers/AuthProvider"
import { SkeletonGenericPage } from "@/components/ui/skeleton"
import ProfileCompletionHero from "./components/dashboard/ProfileCompletionHero"
import StudentUpcomingShifts from "./components/dashboard/StudentUpcomingShifts"
import SavedJobsWidget from "./components/dashboard/SavedJobsWidget"
import { ApplicationStatusDonut } from "./components/dashboard/ApplicationStatusDonut"
import { RecentMessagesWidget } from "./components/dashboard/RecentMessagesWidget"
import { getStudentProfileCompletion } from "@/lib/profile-completion"

export default function JobSeekerDashboard() {
  const router = useRouter()
  const { user, profile, role, loading: authLoading } = useUser()

  const [loading, setLoading] = useState(true)

  // Database Data States
  const [savedJobs, setSavedJobs] = useState<any[]>([])
  const [applicationStats, setApplicationStats] = useState({
    total: 0,
    underReview: 0,
    accepted: 0,
    rejected: 0,
  })
  const [upcomingShifts, setUpcomingShifts] = useState<any[]>([])
  const [recentChats, setRecentChats] = useState<any[]>([])

  // Calculate real profile completion (Thống nhất 100% với Profile Page)
  const cvPercent = useMemo(() => {
    if (!profile && !user) return 0
    return getStudentProfileCompletion(user, profile).percent
  }, [user, profile])

  // Load Dashboard Data from Supabase
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push("/?auth=login&redirect=/dashboard")
      return
    }
    if (role === "organizer" || profile?.role === "organizer") {
      router.replace("/dashboard")
      return
    }

    const fetchDashboardData = async () => {
      setLoading(true)

      // 1. Fetch Applications count, statuses, and event details
      const { data: appsData } = await supabase
        .from("applications")
        .select(`
          id,
          status,
          applied_at,
          events (
            id,
            title,
            location,
            event_date,
            salary_amount,
            salary_type,
            position_type,
            danang_wards (name),
            organizer:organizer_id (id, full_name, avatar_url)
          )
        `)
        .eq("student_id", user.id)
        .order("applied_at", { ascending: false })

      if (appsData) {
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

        // Approved event shifts
        const approvedShifts = appsData.filter(a => a.status === "approved" && a.events)
        setUpcomingShifts(approvedShifts)
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

      setLoading(false)
    }

    fetchDashboardData()
  }, [user, authLoading, router, role, profile?.role])

  const fullName = profile?.full_name || "Nhân sự Sự kiện"
  const avatarUrl = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=18181B&color=fff`

  // Calculation for Donut Chart Percentages
  const totalApps = applicationStats.total || 0
  const reviewPct = totalApps > 0 ? (applicationStats.underReview / totalApps) * 100 : 0
  const acceptPct = totalApps > 0 ? (applicationStats.accepted / totalApps) * 100 : 0
  const rejectPct = totalApps > 0 ? (applicationStats.rejected / totalApps) * 100 : 0

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
          />

          <StudentUpcomingShifts shifts={upcomingShifts} />

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
