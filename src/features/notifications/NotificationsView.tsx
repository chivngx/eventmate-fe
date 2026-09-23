"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
  ExternalLink,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getNotificationDestination, getDestinationLabel } from "@/lib/notification-routes"

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
  if (text.includes("ứng tuyển") || text.includes("hồ sơ") || text.includes("ứng viên") || text.includes("tuyển dụng") || text.includes("phỏng vấn")) {
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
      router.push("/login")
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
          <div className="size-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mr-3" />
          <span className="text-sm text-slate-500">Đang tải thông báo...</span>
        </div>
      )
    }
    return <SkeletonGenericPage />
  }

  const notifContent = (
    <div className="max-w-[960px] w-full mx-auto space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Thông báo
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý và theo dõi toàn bộ thông báo về sự kiện, đơn ứng tuyển và hệ thống.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200/80 rounded-xl transition-all shadow-2xs cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <CheckCheck className="size-4 text-slate-500" />
            <span>Đánh dấu tất cả đã đọc</span>
          </button>
        )}
      </div>

      {/* 2. Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs space-y-3">
        {/* Row 1: Status Tabs & Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
                filter === "all"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Tất cả ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5",
                filter === "unread"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <span>Chưa đọc</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-800">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm thông báo..."
              className="w-full h-10 pl-10 pr-3.5 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-slate-400 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Row 2: Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer",
              categoryFilter === "all"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            Tất cả danh mục
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("application")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5",
              categoryFilter === "application"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <Briefcase className="size-4" />
            <span>{isOrganizer ? "Ứng viên & Tuyển dụng" : "Đơn ứng tuyển"}</span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("event")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5",
              categoryFilter === "event"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <CalendarDays className="size-4" />
            <span>Sự kiện</span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("system")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5",
              categoryFilter === "system"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <Bell className="size-4" />
            <span>Hệ thống</span>
          </button>
        </div>
      </div>

      {/* 3. Notifications List */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-2xl bg-white/60 p-12 text-center flex flex-col items-center justify-center">
            <div className="size-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
              <BellOff className="size-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">
              {searchQuery.trim() || categoryFilter !== "all"
                ? "Không tìm thấy thông báo phù hợp"
                : filter === "unread"
                ? "Không có thông báo chưa đọc"
                : "Chưa có thông báo nào"}
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-[360px] leading-relaxed">
              {searchQuery.trim() || categoryFilter !== "all"
                ? "Hãy thử tìm với từ khóa khác hoặc chuyển danh mục hiển thị."
                : filter === "unread"
                ? "Bạn đã đọc hết tất cả thông báo gần đây."
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

            // Category Icon
            let IconComponent = Bell
            if (category === "application") {
              IconComponent = isOrganizer ? UserCheck : Briefcase
            } else if (category === "event") {
              IconComponent = CalendarDays
            } else if (category === "message") {
              IconComponent = MessageSquare
            }

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
                  "p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 group select-none",
                  isUnread
                    ? "bg-slate-50/70 border-slate-200/90 hover:border-slate-300 hover:bg-slate-100/70 shadow-2xs"
                    : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-2xs"
                )}
              >
                {/* Left: Icon & Content */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div
                    className={cn(
                      "size-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border transition-colors",
                      isUnread
                        ? "bg-white border-slate-200 text-slate-900 shadow-2xs"
                        : "bg-slate-100 border-transparent text-slate-500"
                    )}
                  >
                    <IconComponent className="size-5" />
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[15px] font-semibold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug truncate">
                        {notif.title || "Thông báo từ EventMate"}
                      </h4>
                      {isUnread && (
                        <span className="size-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed break-words">
                      {notif.message}
                    </p>

                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-xs text-slate-400 font-normal">
                        {formatNotificationTime(notif.created_at)}
                      </span>

                      {/* Target Destination Hint */}
                      {hasNavDestination && (
                        <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-slate-500 group-hover:text-blue-600 transition-colors">
                          <span>{destLabel}</span>
                          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="shrink-0 flex items-center gap-1.5">
                  {isUnread && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        markAsRead(notif.id)
                      }}
                      title="Đánh dấu đã đọc"
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                    >
                      <Check className="size-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNotification(notif.id)
                    }}
                    title="Xóa thông báo"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                  </button>
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
