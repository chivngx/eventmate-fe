"use client"

import { useUser } from "@/components/providers/AuthProvider"
import OrgDashboardView from "@/features/organizer/OrgDashboardView"
import { SkeletonGenericPage } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardPage() {
  const { user, role, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/?auth=login&redirect=/dashboard")
    } else if (!loading && user && role !== "organizer" && role !== "employer" && role !== "admin") {
      router.push("/account")
    }
  }, [user, loading, role, router])

  if (loading || !user) return <SkeletonGenericPage />

  if (role === "organizer" || role === "employer" || role === "admin") {
    return <OrgDashboardView />
  }

  return <SkeletonGenericPage />
}