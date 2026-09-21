"use client"

import { useUser } from "@/components/providers/AuthProvider"
import PostJobView from "@/features/organizer/PostJobView"
import { SkeletonGenericPage } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function PostJobPage() {
  const { user, role, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else if (role !== "organizer") {
        router.replace("/dashboard")
      }
    }
  }, [user, role, loading, router])

  if (loading) return <SkeletonGenericPage />
  if (!user || role !== "organizer") return <SkeletonGenericPage />

  return <PostJobView />
}

