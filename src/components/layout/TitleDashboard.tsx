"use client"

import React from "react"
import { Menu, Plus, Bell, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export interface TitleDashboardProps {
  role?: "organizer" | "student"
  title: string
  subtitle: string
  searchQuery?: string
  setSearchQuery?: (query: string) => void
  onSearchSubmit?: (query: string) => void
  onPostJobClick?: () => void
  onNotificationClick?: () => void
  unreadCount?: number
  avatarUrl?: string
  userProfile?: { fullName?: string; avatarUrl?: string; email?: string } | null
  isSidebarOpen?: boolean
  setIsSidebarOpen?: (open: boolean) => void
  className?: string
}

export default function TitleDashboard({
  role = "organizer",
  title,
  subtitle,
  searchQuery = "",
  setSearchQuery,
  onSearchSubmit,
  onPostJobClick,
  onNotificationClick,
  unreadCount = 0,
  avatarUrl,
  userProfile,
  isSidebarOpen,
  setIsSidebarOpen,
  className,
}: TitleDashboardProps) {
  const router = useRouter()
  const isOrganizer = role === "organizer"

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (onSearchSubmit) {
        onSearchSubmit(searchQuery)
      } else if (searchQuery.trim()) {
        router.push(
          isOrganizer
            ? `/dashboard?search=${encodeURIComponent(searchQuery.trim())}`
            : `/events?search=${encodeURIComponent(searchQuery.trim())}`
        )
      }
    }
  }

  const fallbackAvatar = userProfile?.fullName
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.fullName)}&background=005DDC&color=fff&size=120`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(isOrganizer ? "BTC" : "User")}&background=005DDC&color=fff&size=120`

  const finalAvatar = avatarUrl || userProfile?.avatarUrl || fallbackAvatar

  return (
    <header
      className={cn(
        "bg-[#f9f9f9] dark:bg-zinc-950 flex items-center justify-between gap-4 transition-all w-full",
        className
      )}
    >
      {/* LEFT: Title & Subtitle */}
      <div className="flex items-center gap-3 min-w-0">
        {setIsSidebarOpen && (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Mở menu điều hướng"
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 text-[#515151] dark:text-zinc-300 lg:hidden focus-visible:outline-none shrink-0 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-col gap-[2px] items-start min-w-0">
          <h1 className="font-['Inter'] font-semibold text-[24px] sm:text-[28px] text-[#282828] dark:text-white leading-[normal] tracking-normal truncate">
            {title}
          </h1>
          <p className="font-['Inter'] font-normal text-[12px] text-[#515151] dark:text-zinc-400 leading-[normal] truncate">
            {subtitle}
          </p>
        </div>
      </div>

      {/* RIGHT: Search + Post a Job (if org) + Bell + Avatar */}
      <div className="flex items-center gap-[16px] shrink-0">
        {/* 1. Search Dashboard Widget */}
        <div className="hidden md:flex relative items-center w-[200px] lg:w-[320px] h-[48px] bg-white dark:bg-zinc-900 border border-[#ededed] dark:border-zinc-700 rounded-[8px] px-[12px] transition-all focus-within:border-[#282828] dark:focus-within:border-zinc-400">
          <input
            type="text"
            placeholder={isOrganizer ? "Tìm kiếm..." : "Tìm kiếm việc làm, sự kiện..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent font-['Inter'] font-medium text-[15px] sm:text-[16px] text-[#282828] dark:text-zinc-100 placeholder-[#a5a5a5] focus:outline-none pr-2 leading-[normal]"
          />
          <button
            type="button"
            onClick={() => {
              if (onSearchSubmit) {
                onSearchSubmit(searchQuery)
              } else if (searchQuery.trim()) {
                router.push(
                  isOrganizer
                    ? `/dashboard?search=${encodeURIComponent(searchQuery.trim())}`
                    : `/events?search=${encodeURIComponent(searchQuery.trim())}`
                )
              }
            }}
            aria-label="Tìm kiếm"
            className="text-[#222222] dark:text-zinc-300 hover:opacity-80 transition-opacity cursor-pointer shrink-0"
          >
            <Search className="w-5 h-5 text-[#282828] dark:text-zinc-300" />
          </button>
        </div>

        {/* 2. + Post a Job Button (Only for Organizer role) */}
        {isOrganizer && (
          <button
            type="button"
            onClick={onPostJobClick}
            className="h-[48px] px-[16px] py-[8px] bg-white dark:bg-zinc-900 border border-[#ededed] dark:border-zinc-700 rounded-[8px] flex items-center justify-center gap-[8px] hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          >
            <Plus className="w-5 h-5 text-[#282828] dark:text-white shrink-0" />
            <span className="font-['Inter'] font-medium text-[15px] sm:text-[16px] text-[#282828] dark:text-white whitespace-nowrap leading-[normal]">
              Đăng tin
            </span>
          </button>
        )}

        {/* 3. Notification Bell with Badge */}
        <button
          type="button"
          onClick={onNotificationClick || (() => router.push("/notifications"))}
          aria-label="Thông báo"
          className="relative size-[48px] rounded-[53px] bg-transparent flex items-center justify-center text-[#282828] dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#282828]"
        >
          <Bell className="w-5 h-5 text-[#282828] dark:text-white shrink-0" />
          {unreadCount > 0 && (
            <div className="absolute top-[4px] right-[4px] min-w-[16px] h-[16px] px-[4px] bg-[#dc0000] text-white font-['Inter'] font-semibold text-[12px] rounded-[10px] flex items-center justify-center leading-[normal] shadow-xs pointer-events-none aspect-square">
              <span>{unreadCount > 99 ? "99+" : unreadCount}</span>
            </div>
          )}
        </button>

        {/* 4. Avatar (48x48px, rounded-full, borderless) */}
        <img
          src={finalAvatar}
          alt={userProfile?.fullName || "Avatar"}
          onError={(e) => {
            e.currentTarget.src = fallbackAvatar
          }}
          className="size-[48px] rounded-full object-cover shrink-0"
        />
      </div>
    </header>
  )
}
