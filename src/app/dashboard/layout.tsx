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

  const isOrganizer = role === "organizer" || role === "employer"

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push(`/?auth=login&redirect=${encodeURIComponent(pathname || "/")}`)
      return
    }

    if (!isOrganizer) {
      router.replace("/")
    }
  }, [user, loading, isOrganizer, router, pathname])

  if (loading || !user || !isOrganizer) {
    return <SkeletonGenericPage />
  }

  let activeTab = "feed"

  if (pathname?.startsWith("/dashboard")) {
    activeTab = "feed"
  } else if (pathname?.startsWith("/notifications")) {
    activeTab = "notifications"
  } else if (pathname?.startsWith("/chat")) {
    activeTab = "chat"
  } else if (pathname?.startsWith("/account") || pathname?.startsWith("/settings")) {
    activeTab = "account"
  } else if (pathname?.startsWith("/manage-events")) {
    activeTab = "events"
  } else if (pathname?.startsWith("/post-job")) {
    activeTab = "post-job"
  }

  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url
  const fullName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || ""

  return (
    <DashboardLayout
      role="organizer"
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
