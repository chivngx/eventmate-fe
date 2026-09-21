"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/components/providers/AuthProvider"
import { useToast } from "@/components/providers/ToastProvider"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { SkeletonGenericPage } from "@/components/ui/skeleton"
import { Bell, CheckCheck, Clock, Trash2, Calendar, Sparkles, AlertCircle } from "lucide-react"

export default function NotificationsView({ embedded = false }: { embedded?: boolean } = {}) {
  const router = useRouter()
  const { showToast } = useToast()
  const { user, profile, role, loading: authLoading } = useUser()

  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<any[]>([])
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [searchQuery, setSearchQuery] = useState("")

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

  const filteredList = notifications.filter((n) => {
    if (filter === "unread" && n.is_read) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        n.title?.toLowerCase().includes(q) ||
        n.message?.toLowerCase().includes(q)
      )
    }
    return true
  })

  const unreadCount = notifications.filter((n) => !n.is_read).length
  const userRole = (role === "organizer" || profile?.role === "organizer") ? "organizer" : "student"
  const fullName = profile?.full_name || user?.user_metadata?.full_name || ""
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || ""

  if (loading || authLoading) {
    if (embedded) {
      return (
        <div className="flex h-[400px] w-full items-center justify-center">
          <div className="size-6 border-2 border-[#005DDC] border-t-transparent rounded-full animate-spin mr-3" />
          <span className="text-sm text-slate-500">Đang tải thông báo...</span>
        </div>
      )
    }
    return <SkeletonGenericPage />
  }

  const notifContent = (
    <div className="max-w-[960px] w-full space-y-6">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-[16px] border border-[#ededed] dark:border-zinc-800 shadow-xs">
          {/* Tabs / Filters */}
          <div className="flex items-center gap-2 p-1 bg-[#f5f5f5] dark:bg-zinc-800 rounded-[10px]">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-1.5 rounded-[8px] text-xs font-semibold transition-all cursor-pointer ${
                filter === "all"
                  ? "bg-white dark:bg-zinc-700 text-[#005ddc] shadow-xs"
                  : "text-[#757575] hover:text-[#222] dark:hover:text-white"
              }`}
            >
              Tất cả ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-1.5 rounded-[8px] text-xs font-semibold transition-all cursor-pointer ${
                filter === "unread"
                  ? "bg-white dark:bg-zinc-700 text-[#005ddc] shadow-xs"
                  : "text-[#757575] hover:text-[#222] dark:hover:text-white"
              }`}
            >
              Chưa đọc ({unreadCount})
            </button>
          </div>

          {/* Mark all as read button */}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#005ddc] hover:underline cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Đánh dấu tất cả đã đọc</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-zinc-900 rounded-[16px] border border-[#ededed] dark:border-zinc-800 shadow-xs overflow-hidden divide-y divide-[#ededed] dark:divide-zinc-800">
          {filteredList.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="size-12 rounded-full bg-blue-50 dark:bg-zinc-800 flex items-center justify-center text-[#005ddc] mb-3">
                <Bell className="size-6" />
              </div>
              <h3 className="text-base font-semibold text-[#222] dark:text-white">
                {filter === "unread" ? "Không có thông báo chưa đọc" : "Chưa có thông báo nào"}
              </h3>
              <p className="text-xs text-[#757575] mt-1 max-w-[340px]">
                {filter === "unread"
                  ? "Bạn đã đọc hết tất cả thông báo gần đây."
                  : "Khi có kết quả duyệt hồ sơ, lời mời sự kiện hoặc lịch phỏng vấn, thông báo sẽ xuất hiện tại đây."}
              </p>
            </div>
          ) : (
            filteredList.map((notif) => (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && markAsRead(notif.id)}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors cursor-pointer hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 ${
                  !notif.is_read ? "bg-blue-50/30 dark:bg-blue-950/20" : "bg-white dark:bg-zinc-900"
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div
                    className={`size-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      !notif.is_read
                        ? "bg-[#005ddc] text-white shadow-xs"
                        : "bg-slate-100 dark:bg-zinc-800 text-slate-500"
                    }`}
                  >
                    <Bell className="size-4" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-[#222] dark:text-white truncate">
                        {notif.title || "Thông báo từ EventMate"}
                      </h4>
                      {!notif.is_read && (
                        <span className="size-2 rounded-full bg-[#005ddc] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[#555] dark:text-zinc-300 leading-relaxed break-words">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-[#888] pt-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(notif.created_at).toLocaleString("vi-VN")}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNotification(notif.id)
                    }}
                    title="Xóa thông báo"
                    className="p-1.5 rounded-lg text-[#999] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
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
      subtitle="Cập nhật tiến độ ứng tuyển và thông tin mới nhất từ Ban tổ chức"
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
