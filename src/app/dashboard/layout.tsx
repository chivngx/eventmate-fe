"use client"

import React, { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { useUser } from "@/components/providers/AuthProvider"
import { SkeletonGenericPage } from "@/components/ui/skeleton"
import DashboardLayout from "@/components/layout/DashboardLayout"
import MainLayout from "@/components/layout/MainLayout"

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
      router.push(`/?auth=login&redirect=${encodeURIComponent(pathname || "/")}`)
    }
  }, [user, loading, router, pathname])

  if (loading || !user) {
    return <SkeletonGenericPage />
  }

  const isOrganizer = role === "organizer" || role === "employer"
  
  if (!isOrganizer) {
    if (typeof window !== "undefined") router.replace("/")
    return null
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
