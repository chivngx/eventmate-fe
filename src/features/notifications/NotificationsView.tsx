"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/components/providers/AuthProvider"
import { useToast } from "@/components/providers/ToastProvider"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { SkeletonGenericPage } from "@/components/ui/skeleton"
import {
  Bell,
  BellOff,
  CheckCheck,
  Check,
  Trash2,
  CalendarDays,
  Briefcase,
  UserCheck,
  MessageSquare,
  Search,
  ArrowRight,
  Filter,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getNotificationDestination, getDestinationLabel } from "@/lib/notification-routes"

function stripEmojis(text: string) {
  if (!text) return text
  // Remove emojis and trim extra spaces
  return text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').replace(/\s+/g, ' ').trim()
}

function formatNotificationTime(dateStr: string) {
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return "Vừa xong"
    if (diffMins < 60) return `${diffMins} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    if (diffDays === 1) return "Hôm qua"
    if (diffDays < 7) return `${diffDays} ngày trước`
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
  } catch {
    return ""
  }
}

function getNotificationCategory(notif: any): "application" | "event" | "message" | "system" {
  if (notif.type) {
    const t = notif.type.toLowerCase()
    if (t.includes("apply") || t.includes("application") || t.includes("candidate")) return "application"
    if (t.includes("event") || t.includes("schedule") || t.includes("job")) return "event"
    if (t.includes("chat") || t.includes("message")) return "message"
  }
  const text = `${notif.title || ""} ${notif.message || ""}`.toLowerCase()
  if (text.includes("ứng tuyển") || text.includes("hồ sơ") || text.includes("ứng viên") || text.includes("tuyển dụng")) {
    return "application"
  }
  if (text.includes("sự kiện") || text.includes("ca làm") || text.includes("lịch trình") || text.includes("check-in")) {
    return "event"
  }
  if (text.includes("tin nhắn") || text.includes("chat")) {
    return "message"
  }
  return "system"
}

export default function NotificationsView({ embedded = false }: { embedded?: boolean } = {}) {
  const router = useRouter()
  const { showToast } = useToast()
  const { user, profile, role, loading: authLoading } = useUser()

  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<any[]>([])
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [categoryFilter, setCategoryFilter] = useState<"all" | "application" | "event" | "system">("all")
  const [searchQuery, setSearchQuery] = useState("")

  const isOrganizer = role === "organizer" || profile?.role === "organizer"
  const userRole = isOrganizer ? "organizer" : "student"
  const fullName = profile?.full_name || user?.user_metadata?.full_name || ""
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || ""

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push("/?auth=login&redirect=/notifications")
      return
    }

    const fetchNotifications = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (!error && data) {
        setNotifications(data)
      }
      setLoading(false)
    }

    fetchNotifications()

    // Realtime subscription
    const channel = supabase
      .channel(`notifications-page-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, authLoading, router])

  const markAllAsRead = async () => {
    if (!user) return
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false)

    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("notifications-read", { detail: { all: true } }))
      }
      showToast({
        title: "Đã đánh dấu đã đọc",
        message: "Tất cả thông báo đã được chuyển thành đã đọc.",
        type: "success",
      })
    }
  }

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("notifications-read", { detail: { id } }))
      }
    }
  }

  const deleteNotification = async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id)

    if (!error) {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("notifications-read", { detail: { id, deleted: true } }))
      }
      showToast({
        title: "Đã xóa",
        message: "Thông báo đã được xóa thành công.",
        type: "info",
      })
    }
  }

  const filteredList = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === "unread" && n.is_read) return false

      if (categoryFilter !== "all") {
        const cat = getNotificationCategory(n)
        if (cat !== categoryFilter) return false
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          n.title?.toLowerCase().includes(q) ||
          n.message?.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [notifications, filter, categoryFilter, searchQuery])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  if (loading || authLoading) {
    if (embedded) {
      return (
        <div className="flex h-[400px] w-full items-center justify-center">
          <div className="size-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mr-3" />
          <span className="text-sm text-zinc-500">Đang tải thông báo...</span>
        </div>
      )
    }
    return <SkeletonGenericPage />
  }

  const notifContent = (
    <div className="w-full space-y-8 font-['Inter',sans-serif] pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Thông báo
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-xl leading-relaxed">
            Quản lý và theo dõi toàn bộ thông báo về sự kiện, đơn ứng tuyển và hệ thống.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
          >
            <CheckCheck className="size-4 text-zinc-500" />
            <span>Đánh dấu tất cả đã đọc</span>
          </button>
        )}
      </div>

      {/* 2. Free-standing Filter Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Segmented Control */}
          <div className="flex items-center p-1 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={cn(
                "px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer",
                filter === "all"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              Tất cả ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={cn(
                "px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center gap-2",
                filter === "unread"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <span>Chưa đọc</span>
              {unreadCount > 0 && (
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-bold",
                  filter === "unread" 
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                )}>
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm thông báo..."
              className="w-full h-11 pl-11 pr-4 text-sm bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 focus:border-zinc-400 dark:focus:border-zinc-500 transition-all placeholder:text-zinc-400 shadow-sm"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <div className="flex items-center gap-1.5 px-3 py-1.5 border-r border-zinc-300 dark:border-zinc-700 mr-2 shrink-0 text-zinc-400">
            <Filter className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Lọc:</span>
          </div>
          
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap cursor-pointer shrink-0 border",
              categoryFilter === "all"
                ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900 shadow-sm"
                : "bg-white border-zinc-200/80 text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
            )}
          >
            Tất cả danh mục
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("application")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 shrink-0 border",
              categoryFilter === "application"
                ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900 shadow-sm"
                : "bg-white border-zinc-200/80 text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
            )}
          >
            <Briefcase className="size-4" />
            <span>{isOrganizer ? "Ứng viên & Tuyển dụng" : "Đơn ứng tuyển"}</span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("event")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 shrink-0 border",
              categoryFilter === "event"
                ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900 shadow-sm"
                : "bg-white border-zinc-200/80 text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
            )}
          >
            <CalendarDays className="size-4" />
            <span>Sự kiện</span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("system")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 shrink-0 border",
              categoryFilter === "system"
                ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900 shadow-sm"
                : "bg-white border-zinc-200/80 text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
            )}
          >
            <Bell className="size-4" />
            <span>Hệ thống</span>
          </button>
        </div>
      </div>

      {/* 3. Notifications List */}
      <div className="space-y-4">
        {filteredList.length === 0 ? (
          <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white/40 dark:bg-zinc-900/40 p-16 text-center flex flex-col items-center justify-center">
            <div className="size-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mb-4">
              <BellOff className="size-8" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {searchQuery.trim() || categoryFilter !== "all"
                ? "Không tìm thấy thông báo phù hợp"
                : filter === "unread"
                  ? "Không có thông báo chưa đọc"
                  : "Chưa có thông báo nào"}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-[400px] leading-relaxed">
              {searchQuery.trim() || categoryFilter !== "all"
                ? "Hãy thử tìm với từ khóa khác hoặc chuyển danh mục hiển thị."
                : filter === "unread"
                  ? "Bạn đã đọc hết tất cả thông báo gần đây. Thật tuyệt vời!"
                  : isOrganizer
                    ? "Khi có ứng viên mới, cập nhật sự kiện hoặc báo cáo tuyển dụng, thông báo sẽ hiển thị tại đây."
                    : "Khi có kết quả duyệt hồ sơ, lời mời sự kiện hoặc lịch trình mới, thông báo sẽ hiển thị tại đây."}
            </p>
          </div>
        ) : (
          filteredList.map((notif) => {
            const isUnread = !notif.is_read
            const category = getNotificationCategory(notif)
            const dest = getNotificationDestination(notif, isOrganizer)
            const destLabel = getDestinationLabel(dest)
            const hasNavDestination = dest && dest !== "/notifications"

            // Icon Component and Colors by Category
            let IconComponent = Bell
            let iconBgColor = "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
            let dotColor = "bg-zinc-900 dark:bg-zinc-100"

            if (category === "application") {
              IconComponent = isOrganizer ? UserCheck : Briefcase
              iconBgColor = "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
              dotColor = "bg-blue-500"
            } else if (category === "event") {
              IconComponent = CalendarDays
              iconBgColor = "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
              dotColor = "bg-emerald-500"
            } else if (category === "message") {
              IconComponent = MessageSquare
              iconBgColor = "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400"
              dotColor = "bg-purple-500"
            }

            const cleanTitle = stripEmojis(notif.title || "Thông báo từ EventMate")
            const cleanMessage = stripEmojis(notif.message || "")

            const handleCardClick = async () => {
              if (isUnread) {
                await markAsRead(notif.id)
              }
              if (hasNavDestination) {
                router.push(dest)
              }
            }

            return (
              <div
                key={notif.id}
                onClick={handleCardClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    handleCardClick()
                  }
                }}
                className={cn(
                  "relative p-5 sm:p-6 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-start gap-5 sm:gap-6 group select-none overflow-hidden",
                  isUnread
                    ? "bg-white dark:bg-zinc-900 border-zinc-200/90 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-md shadow-sm"
                    : "bg-white dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm"
                )}
              >
                {/* Unread Accent Bar on the very left edge */}
                {isUnread && (
                  <div className={cn("absolute left-0 top-0 bottom-0 w-1", dotColor)} />
                )}

                {/* Left: Big Icon Container */}
                <div
                  className={cn(
                    "size-12 sm:size-14 rounded-2xl flex items-center justify-center shrink-0 border border-transparent transition-colors",
                    isUnread
                      ? "shadow-sm bg-white dark:bg-zinc-800 ring-1 ring-zinc-200/60 dark:ring-zinc-700" 
                      : iconBgColor,
                    isUnread ? iconBgColor.split(" ")[2] : "" // Reuse the text color if unread
                  )}
                >
                  <IconComponent className="size-6 sm:size-7 stroke-[1.5]" />
                </div>

                {/* Center: Main Content */}
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row gap-4 w-full">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2.5">
                      <h4 className="text-base sm:text-[17px] font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition-colors truncate">
                        {cleanTitle}
                      </h4>
                      {isUnread && (
                        <span className={cn("size-2.5 rounded-full shrink-0 shadow-sm", dotColor)} />
                      )}
                    </div>

                    <p className="text-[14px] sm:text-[15px] text-zinc-500 dark:text-zinc-400 leading-relaxed break-words line-clamp-2">
                      {cleanMessage}
                    </p>

                    {/* Target Destination Hint as a Button */}
                    {hasNavDestination && (
                      <div className="pt-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm font-semibold text-zinc-700 dark:text-zinc-300 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
                          <span>{destLabel}</span>
                          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right: Time & Actions */}
                  <div className="shrink-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto mt-2 sm:mt-0 gap-3">
                    {/* Time */}
                    <span className="text-[13px] sm:text-sm text-zinc-400 dark:text-zinc-500 font-medium whitespace-nowrap">
                      {formatNotificationTime(notif.created_at)}
                    </span>

                    {/* Actions container (Visible on hover for desktop, always visible on mobile) */}
                    <div className="flex items-center gap-1.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      {isUnread && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead(notif.id)
                          }}
                          title="Đánh dấu đã đọc"
                          className="p-2 sm:p-2.5 rounded-xl text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <Check className="size-4.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notif.id)
                        }}
                        title="Xóa thông báo"
                        className="p-2 sm:p-2.5 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        <Trash2 className="size-4.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )

  if (embedded) {
    return <div className="w-full">{notifContent}</div>
  }

  return (
    <DashboardLayout
      role={userRole}
      activeTab="notification"
      activeItem="notification"
      title="Thông báo"
      subtitle="Quản lý và theo dõi toàn bộ thông báo về sự kiện, đơn ứng tuyển và hệ thống"
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      unreadCount={unreadCount}
      avatarUrl={avatarUrl}
      userProfile={{
        fullName,
        avatarUrl,
        email: profile?.email || user?.email || "",
      }}
    >
      {notifContent}
    </DashboardLayout>
  )
}
