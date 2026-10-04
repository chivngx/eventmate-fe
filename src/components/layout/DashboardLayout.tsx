"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import MenuDashboard from "@/components/layout/MenuDashboard"
import { Menu } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

export interface DashboardLayoutProps {
  children: React.ReactNode
  role?: "organizer" | "student"
  activeTab?: string
  setActiveTab?: (tab: string) => void
  activeItem?: string
  title?: string
  subtitle?: string
  isPremium?: boolean
  userProfile?: { fullName?: string; avatarUrl?: string; email?: string } | null
  avatarUrl?: string
  unreadCount?: number
  notificationCount?: number
  messageCount?: number
  searchQuery?: string
  setSearchQuery?: (query: string) => void
  onSearchSubmit?: (query: string) => void
  onPostJobClick?: () => void
  onNotificationClick?: () => void
  onLogout?: () => void
}

export default function DashboardLayout({
  children,
  role = "organizer",
  activeTab = "feed",
  setActiveTab,
  activeItem,
  isPremium = false,
  unreadCount,
  notificationCount,
  messageCount,
  onLogout,
}: DashboardLayoutProps) {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const handleLogout = async () => {
    if (onLogout) {
      onLogout()
      return
    }
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-[#f3f5f7] dark:bg-zinc-950 flex text-[#282828] dark:text-zinc-100 font-sans antialiased">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Figma: Menu Dashboard) */}
      <div
        className={cn(
          "p-4 lg:p-6 shrink-0 lg:sticky lg:top-0 h-fit z-40 transition-all",
          isSidebarOpen ? "fixed lg:static left-0 top-0 bottom-0" : "hidden lg:block"
        )}
      >
        <MenuDashboard
          role={role}
          activeTab={activeTab}
          activeItem={activeItem || activeTab}
          setActiveTab={
            setActiveTab
              ? (tab) => {
                setActiveTab(tab)
                if (typeof window !== "undefined" && window.innerWidth < 1024) {
                  setIsSidebarOpen(false)
                }
              }
              : undefined
          }
          notificationCount={notificationCount ?? unreadCount}
          messageCount={messageCount}
          isPremium={isPremium}
          onLogout={handleLogout}
          isCollapsed={!isSidebarOpen}
          onToggleCollapse={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen bg-[#f3f5f7] dark:bg-zinc-950 p-4 lg:p-6 lg:pl-0">
        {/* Mobile Hamburger Button */}
        <div className="lg:hidden flex items-center justify-between pb-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Mở menu điều hướng"
            className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 shadow-xs cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar w-full pr-1">
          <main className="w-full pb-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
