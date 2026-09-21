"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { NavBellIcon } from "./JoblinIcons"

interface NotificationDropdownProps {
    notifications: any[]
    unreadCount: number
    markAsRead: () => Promise<void>
}

export default function NotificationDropdown({
    notifications,
    unreadCount,
    markAsRead
}: NotificationDropdownProps) {
    return (
        <DropdownMenu onOpenChange={(open) => { if (open) markAsRead() }}>
            <DropdownMenuTrigger
                className="size-[40px] sm:size-[44px] flex items-center justify-center rounded-full hover:bg-slate-100 text-[#282828] transition-colors cursor-pointer outline-none relative"
                aria-label="Thông báo"
                title="Thông báo"
            >
                <NavBellIcon className="size-[24px]" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={18} className="w-80 rounded-2xl p-0 shadow-lg border-slate-100 bg-white overflow-hidden text-slate-900 z-50">
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h4 className="font-bold text-slate-900">Thông báo</h4>
                    {unreadCount > 0 && (
                        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            {unreadCount} mới
                        </span>
                    )}
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm font-medium">
                            Bạn chưa có thông báo nào.
                        </div>
                    ) : (
                        notifications.map(n => (
                            <div
                                key={n.id}
                                className={`p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors ${!n.is_read ? 'bg-slate-100/30' : 'bg-white'
                                    }`}
                            >
                                <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>}
                                    {n.title}
                                </h5>
                                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                                    {n.message}
                                </p>
                                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wider">
                                    {new Date(n.created_at).toLocaleString('vi-VN')}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
