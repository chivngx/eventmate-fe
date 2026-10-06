"use client"

import React, { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { useUser } from "@/components/providers/AuthProvider"
import { SkeletonGenericPage } from "@/components/ui/skeleton"
import MainLayout from "@/components/layout/MainLayout"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useUser()
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

  let pageTitle = "Quản lý cá nhân"
  if (pathname?.startsWith("/account")) pageTitle = "Quản lý hồ sơ & Tài khoản"
  if (pathname?.startsWith("/my-events")) pageTitle = "Sự kiện của tôi"
  if (pathname?.startsWith("/chat")) pageTitle = "Tin nhắn"
  if (pathname?.startsWith("/profile")) pageTitle = "Hồ sơ năng lực"

  return (
    <MainLayout role="student" fullWidth={true} className="bg-[#f2f6fc]">
      <div className="min-h-[calc(100vh-64px)] w-full pt-4 pb-12">
        <div className="max-w-[1200px] mx-auto px-4 xl:px-0">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-[13px] text-slate-500 mb-4 ml-1">
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            <span className="font-medium text-slate-900">{pageTitle}</span>
          </nav>
          {/* Content */}
          {children}
        </div>
      </div>
    </MainLayout>
  )
}
