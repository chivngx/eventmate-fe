"use client"

import { useUser } from "@/components/providers/AuthProvider"
import MyEventsView from "@/features/student/MyEventsView"
import { SkeletonGenericPage } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function MyEventsPage() {
  const { user, role, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user && role === "organizer") {
      router.replace("/manage-events")
    }
  }, [user, role, loading, router])

  if (loading || !user) return <SkeletonGenericPage />
  if (role === "organizer") return <SkeletonGenericPage />

  return <MyEventsView embedded={true} />
}
