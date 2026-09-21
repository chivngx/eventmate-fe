"use client"

import React, { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useUser } from "@/components/providers/AuthProvider"
import { SkeletonGenericPage } from "@/components/ui/skeleton"
import DashboardLayout from "@/components/layout/DashboardLayout"

export default function AppDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, role, loading } = useUser()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !user) {
    return <SkeletonGenericPage />
  }

  const isOrganizer = role === "organizer"
  let activeTab = isOrganizer ? "feed" : "dashboard"

  if (pathname?.startsWith("/dashboard")) {
    activeTab = isOrganizer ? "feed" : "dashboard"
  } else if (pathname?.startsWith("/profile") || pathname?.startsWith("/cv")) {
    activeTab = "resume"
  } else if (pathname?.startsWith("/notifications")) {
    activeTab = isOrganizer ? "notifications" : "notification"
  } else if (pathname?.startsWith("/chat")) {
    activeTab = isOrganizer ? "chat" : "message"
  } else if (pathname?.startsWith("/account") || pathname?.startsWith("/settings")) {
    activeTab = isOrganizer ? "account" : "settings"
  } else if (pathname?.startsWith("/manage-events")) {
    activeTab = "events"
  } else if (pathname?.startsWith("/my-events")) {
    activeTab = "activity"
  } else if (pathname?.startsWith("/post-job")) {
    activeTab = "post-job"
  }

  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url
  const fullName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || ""

  return (
    <DashboardLayout
      role={isOrganizer ? "organizer" : "student"}
      activeTab={activeTab}
      activeItem={activeTab}
      avatarUrl={avatarUrl}
      userProfile={{
        fullName,
        avatarUrl,
        email: user.email,
      }}
    >
      {children}
    </DashboardLayout>
  )
}
