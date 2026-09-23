"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { NavBellIcon } from "./JoblinIcons"
import { BellOff, CheckCheck, ArrowRight, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from "@/components/providers/AuthProvider"
import { supabase } from "@/lib/supabase"
import { getNotificationDestination, getDestinationLabel } from "@/lib/notification-routes"

interface NotificationDropdownProps {
    notifications: any[]
    unreadCount: number
    markAsRead: () => Promise<void>
}

function formatNotificationTime(dateStr: string) {
    try {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMinutes = Math.floor(diffMs / (1000 * 60))
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffMinutes < 1) return "Vừa xong"
        if (diffMinutes < 60) return `${diffMinutes} phút trước`
        if (diffHours < 24) return `${diffHours} giờ trước`
        if (diffDays === 1) return "Hôm qua"
        if (diffDays < 7) return `${diffDays} ngày trước`
        return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    } catch {
        return ""
    }
}

export default function NotificationDropdown({
    notifications,
    unreadCount,
    markAsRead
}: NotificationDropdownProps) {
    const router = useRouter()
    const { role, profile } = useUser()
    const [open, setOpen] = useState(false)

    const isOrganizer = role === "organizer" || profile?.role === "organizer"

    const handleNotificationClick = async (n: any) => {
        setOpen(false)
        if (!n.is_read) {
            await supabase.from("notifications").update({ is_read: true }).eq("id", n.id)
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("notifications-read", { detail: { id: n.id } }))
            }
        }
        const dest = getNotificationDestination(n, isOrganizer)
        router.push(dest)
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger
                className="size-[40px] flex items-center justify-center rounded-full hover:bg-slate-100 text-[#222222] transition-colors cursor-pointer outline-none relative"
                aria-label="Thông báo"
                title="Thông báo"
            >
                <NavBellIcon className="size-[20px]" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 size-2 bg-blue-600 rounded-full ring-2 ring-white" />
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                sideOffset={10}
                className="w-[360px] bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] p-1.5 z-50 text-slate-900 overflow-hidden"
            >
                {/* Header */}
                <div className="px-3.5 py-2.5 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-base text-slate-900">Thông báo</span>
                        {unreadCount > 0 && (
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200/60">
                                {unreadCount} mới
                            </span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault()
                                markAsRead()
                            }}
                            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                            <CheckCheck className="size-4" />
                            <span>Đã đọc tất cả</span>
                        </button>
                    )}
                </div>

                {/* Notification List / Empty State */}
                <div className="max-h-[380px] overflow-y-auto p-1 flex flex-col gap-1">
                    {notifications.length === 0 ? (
                        <div className="py-10 px-4 text-center flex flex-col items-center justify-center">
                            <div className="size-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                                <BellOff className="size-6" />
                            </div>
                            <p className="font-medium text-sm text-slate-800">
                                Chưa có thông báo nào
                            </p>
                            <p className="text-xs text-slate-500 mt-1 max-w-[260px] leading-relaxed">
                                Khi có cập nhật về sự kiện, đơn ứng tuyển hoặc tin nhắn, thông báo sẽ hiển thị tại đây.
                            </p>
                        </div>
                    ) : (
                        notifications.map((n) => {
                            const isUnread = !n.is_read
                            const dest = getNotificationDestination(n, isOrganizer)
                            const destLabel = getDestinationLabel(dest)

                            return (
                                <div
                                    key={n.id}
                                    onClick={() => handleNotificationClick(n)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault()
                                            handleNotificationClick(n)
                                        }
                                    }}
                                    className={cn(
                                        "p-3 rounded-xl transition-all cursor-pointer text-left group/item select-none",
                                        isUnread
                                            ? "bg-slate-50/90 hover:bg-slate-100/90 border border-slate-200/60"
                                            : "hover:bg-slate-50/80 border border-transparent"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <h5 className="text-[14px] font-semibold text-slate-900 leading-snug group-hover/item:text-blue-600 transition-colors">
                                            {n.title}
                                        </h5>
                                        {isUnread && (
                                            <span className="size-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                                        )}
                                    </div>
                                    {n.message && (
                                        <p className="text-[13px] text-slate-600 mt-1 leading-relaxed line-clamp-2">
                                            {n.message}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-slate-100/80">
                                        <span className="text-xs text-slate-400 font-normal">
                                            {formatNotificationTime(n.created_at)}
                                        </span>
                                        <span className="text-xs font-medium text-slate-500 group-hover/item:text-blue-600 flex items-center gap-1 transition-colors">
                                            <span>{destLabel}</span>
                                            <ChevronRight className="size-3.5 group-hover/item:translate-x-0.5 transition-transform" />
                                        </span>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Footer: Link to all notifications */}
                <div className="p-1.5 border-t border-slate-100 bg-slate-50/50">
                    <button
                        type="button"
                        onClick={() => {
                            setOpen(false)
                            router.push("/notifications")
                        }}
                        className="w-full py-2.5 px-3 text-center text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-white rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-transparent hover:border-slate-200/60 hover:shadow-2xs"
                    >
                        <span>Xem tất cả thông báo</span>
                        <ArrowRight className="size-4 text-slate-500" />
                    </button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

