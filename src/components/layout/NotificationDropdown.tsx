"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BellIcon } from "@/components/icons"
import { 
    BellOff, 
    CheckCheck, 
    ArrowRight, 
    ChevronRight,
    CheckCircle2,
    Calendar,
    XCircle,
    UserPlus,
    MessageSquare,
    Bell,
    Briefcase
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from "@/components/providers/AuthProvider"
import { supabase } from "@/lib/supabase"
import { getNotificationDestination, getDestinationLabel } from "@/lib/notification-routes"

interface NotificationDropdownProps {
    notifications: any[]
    unreadCount: number
    markAsRead: () => Promise<void>
    triggerClassName?: string
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

function stripEmojis(text: string) {
    if (!text) return text
    return text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").trim()
}

function getNotificationVisuals(notif: any, isOrganizer: boolean) {
    const fullText = `${notif.title || ""} ${notif.message || ""}`.toLowerCase()
    const type = (notif.type || "").toLowerCase()

    if (fullText.includes("trúng tuyển") || fullText.includes("điểm danh") || fullText.includes("hoàn thành") || fullText.includes("xuất sắc") || type.includes("success") || fullText.includes("chấp nhận")) {
        return { icon: CheckCircle2, color: "text-[#10B981]" }
    }
    if (fullText.includes("từ chối") || fullText.includes("hủy") || type.includes("reject")) {
        return { icon: XCircle, color: "text-[#EF4444]" }
    }
    if (type.includes("apply") || type.includes("candidate") || fullText.includes("ứng tuyển") || fullText.includes("hồ sơ") || fullText.includes("tuyển dụng")) {
        return { icon: isOrganizer ? UserPlus : Briefcase, color: "text-slate-600" }
    }
    if (type.includes("chat") || fullText.includes("tin nhắn")) {
        return { icon: MessageSquare, color: "text-slate-600" }
    }
    if (type.includes("event") || type.includes("job") || fullText.includes("sự kiện") || fullText.includes("ca làm")) {
        return { icon: Calendar, color: "text-slate-600" }
    }

    return { icon: Bell, color: "text-slate-600" }
}

export default function NotificationDropdown({
    notifications,
    unreadCount,
    markAsRead,
    triggerClassName,
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
                className={cn(
                    "size-[40px] flex items-center justify-center rounded-full transition-colors cursor-pointer outline-none relative",
                    triggerClassName || "hover:bg-slate-100 text-[#222222]"
                )}
                aria-label="Thông báo"
                title="Thông báo"
            >
                <BellIcon className="size-[20px]" />
                {unreadCount > 0 && (
                    <span className="absolute top-[8px] right-[8px] size-[9px] bg-[#FF5722] rounded-full ring-2 ring-white" />
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                sideOffset={10}
                style={{ maxHeight: 'var(--radix-dropdown-menu-content-available-height, 85vh)' }}
                className="w-[380px] bg-white border border-slate-200/80 rounded-2xl shadow-xl p-0 z-50 flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 shrink-0 bg-white z-10">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-[15px] text-slate-900">Thông báo</span>
                        {unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 text-[11px] font-semibold rounded bg-[#FF5722] text-white">
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
                            className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                            <CheckCheck className="size-4" />
                            <span>Đã đọc hết</span>
                        </button>
                    )}
                </div>

                {/* Notification List / Empty State */}
                <div className="overflow-y-auto flex-1 min-h-[300px] max-h-[460px] p-2 flex flex-col gap-0.5 custom-scrollbar bg-slate-50/30">
                    {notifications.length === 0 ? (
                        <div className="py-16 px-4 text-center flex flex-col items-center justify-center h-full">
                            <div className="size-14 rounded-full border border-slate-200 bg-white text-slate-300 flex items-center justify-center mb-4 shadow-sm">
                                <BellOff className="size-6" />
                            </div>
                            <p className="font-semibold text-[15px] text-slate-900">
                                Chưa có thông báo nào
                            </p>
                            <p className="text-[13px] text-slate-500 mt-1.5 max-w-[240px] leading-relaxed">
                                Khi có cập nhật mới, thông báo sẽ được hiển thị tại đây.
                            </p>
                        </div>
                    ) : (
                        notifications.map((n) => {
                            const isUnread = !n.is_read
                            const dest = getNotificationDestination(n, isOrganizer)
                            const destLabel = getDestinationLabel(dest)

                            const titleClean = stripEmojis(n.title)
                            const messageClean = stripEmojis(n.message)
                            const { icon: Icon, color } = getNotificationVisuals(n, isOrganizer)

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
                                        "group flex items-start gap-3.5 p-3 rounded-xl transition-all cursor-pointer text-left select-none relative bg-white",
                                        isUnread
                                            ? "hover:bg-slate-50 shadow-sm ring-1 ring-slate-100"
                                            : "opacity-80 hover:opacity-100 hover:bg-slate-50 border border-transparent"
                                    )}
                                >
                                    {/* Left Icon Container */}
                                    <div className="pt-0.5 shrink-0">
                                        <div className={cn("size-9 rounded-full flex items-center justify-center border border-slate-200 bg-white shadow-sm", color)}>
                                            <Icon className="size-4" strokeWidth={2} />
                                        </div>
                                    </div>

                                    {/* Content Container */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h5 className={cn(
                                                "text-[14px] leading-tight line-clamp-2 transition-colors pr-2",
                                                isUnread ? "font-semibold text-slate-900" : "font-medium text-slate-700 group-hover:text-slate-900"
                                            )}>
                                                {titleClean}
                                            </h5>
                                            {isUnread && (
                                                <span className="size-2 rounded-full bg-[#FF5722] shrink-0 mt-1" />
                                            )}
                                        </div>
                                        
                                        {messageClean && (
                                            <p className="text-[13px] text-slate-500 mt-1 leading-snug line-clamp-2">
                                                {messageClean}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-[12px] font-medium text-slate-400">
                                                {formatNotificationTime(n.created_at)}
                                            </span>
                                            
                                            {/* Micro-interaction for "Xem chi tiết" */}
                                            <div className="flex items-center gap-1 text-[12px] font-medium text-slate-500 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                <span>{destLabel}</span>
                                                <ChevronRight className="size-3" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Footer: Link to all notifications */}
                <div className="p-2 border-t border-slate-100 bg-white shrink-0 z-10">
                    <button
                        type="button"
                        onClick={() => {
                            setOpen(false)
                            router.push("/notifications")
                        }}
                        className="w-full py-2 px-3 text-center text-[13px] font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                        <span>Xem tất cả thông báo</span>
                        <ArrowRight className="size-3.5" />
                    </button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}


