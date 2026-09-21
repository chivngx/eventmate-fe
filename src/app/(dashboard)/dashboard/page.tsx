"use client"

import { useUser } from "@/components/providers/AuthProvider"
import OrgDashboardView from "@/features/organizer/OrgDashboardView"
import StudentDashboardView from "@/features/student/StudentDashboardView"
import { SkeletonGenericPage } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardPage() {
  const { user, role, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) return <SkeletonGenericPage />

  if (!user) return <SkeletonGenericPage />

  if (role === "organizer") {
    return <OrgDashboardView />
  }

  return <StudentDashboardView />
}
