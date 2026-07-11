"use client"

import { Bell } from"lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from"@/components/ui/dropdown-menu"

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
 <DropdownMenuTrigger className="relative p-2 text-slate-400 hover:text-emerald-600 transition-colors outline-none">
 <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
 {unreadCount > 0 && (
 <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
 )}
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-80 mt-2 rounded-2xl p-0 shadow-md border-slate-100 bg-white overflow-hidden text-slate-900">
 <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
 <h4 className="font-bold text-slate-900">Thông báo</h4>
 {unreadCount > 0 && (
 <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
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
 className={`p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors ${
 !n.is_read ? 'bg-emerald-50/30' : 'bg-white'
 }`}
 >
 <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2">
 {!n.is_read && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>}
 {n.title}
 </h5>
 <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
 {n.message}
 </p>
 <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
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
