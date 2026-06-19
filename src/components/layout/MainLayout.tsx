import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { NotchNavbar } from "@/components/ui/notch-navbar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, LogOut, User, Briefcase, Building2 } from "lucide-react"

export default function MainLayout({ children, role }: { children: React.ReactNode, role?: string }) {
    const navigate = useNavigate()
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [avatarUrl, setAvatarUrl] = useState("")

    // STATE THÔNG BÁO
    const [notifications, setNotifications] = useState<any[]>([])
    const unreadCount = notifications.filter(n => !n.is_read).length

    useEffect(() => {
        let channel: any; // Biến lưu trữ kênh đăng ký Real-time để cleanup khi unmount

        const fetchProfileAndSetupRealtime = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setEmail(user.email || "")
                const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
                if (data) {
                    setFullName(data.full_name || "")
                    setAvatarUrl(data.avatar_url || "")
                }

                // 1. Tải 10 thông báo mới nhất từ Database khi vừa nạp trang
                const { data: notifs } = await supabase
                    .from("notifications")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(10)
                if (notifs) setNotifications(notifs)

                // 2. [MỚI] Cài đặt kênh kết nối Real-time lắng nghe sự kiện INSERT vào bảng notifications của riêng user này
                channel = supabase
                    .channel(`user-realtime-notifications-${user.id}`)
                    .on(
                        'postgres_changes',
                        {
                            event: 'INSERT',
                            schema: 'public',
                            table: 'notifications',
                            filter: `user_id=eq.${user.id}` // Chỉ nhận thông báo gửi đích danh cho mình
                        },
                        (payload) => {
                            // Khi có dòng dữ liệu thông báo mới được kích hoạt từ DB, tự động đẩy lên đầu mảng state
                            setNotifications(prev => [payload.new, ...prev].slice(0, 10))
                        }
                    )
                    .subscribe()
            }
        }

        fetchProfileAndSetupRealtime()

        // Cleanup: Hủy lắng nghe kênh truyền khi người dùng chuyển trang hoặc đăng xuất
        return () => {
            if (channel) {
                supabase.removeChannel(channel)
            }
        }
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate("/login")
    }

    const getInitial = (name: string) => name ? name.charAt(0).toUpperCase() : "U"

    // Hàm đánh dấu toàn bộ thông báo hiện tại đã đọc
    const markAsRead = async () => {
        if (unreadCount === 0) return
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false)
            setNotifications(notifications.map(n => ({ ...n, is_read: true })))
        }
    }

    const rightActions = (
        <div className="flex items-center gap-2 sm:gap-4">

            {/* DROPDOWN THÔNG BÁO TỰ ĐỘNG CẬP NHẬT REAL-TIME */}
            <DropdownMenu onOpenChange={(open) => { if (open) markAsRead() }}>
                <DropdownMenuTrigger className="relative p-2 text-slate-400 hover:text-emerald-600 transition-colors outline-none">
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
                    )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 mt-2 rounded-2xl p-0 shadow-xl border-slate-100 bg-white overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <h4 className="font-bold text-slate-900">Thông báo</h4>
                        {unreadCount > 0 && <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{unreadCount} mới</span>}
                    </div>
                    <div className="max-h-[350px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm font-medium">Bạn chưa có thông báo nào.</div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className={`p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors ${!n.is_read ? 'bg-emerald-50/30' : 'bg-white'}`}>
                                    <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        {!n.is_read && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>}
                                        {n.title}
                                    </h5>
                                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{n.message}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">{new Date(n.created_at).toLocaleString('vi-VN')}</p>
                                </div>
                            ))
                        )}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* DROPDOWN AVATAR ĐIỀU HƯỚNG CHUYÊN BIỆT */}
            <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shrink-0">
                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10 cursor-pointer border-2 border-white shadow-sm transition-transform hover:scale-105">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="bg-emerald-50 text-emerald-600 font-bold text-sm">
                            {getInitial(fullName)}
                        </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 mt-2 rounded-2xl p-2 shadow-xl border-slate-100 bg-white">
                    <div className="px-3 py-3 mb-1 bg-slate-50/50 rounded-xl overflow-hidden border border-slate-100">
                        <p className="text-sm font-bold text-slate-900 truncate" title={fullName}>{fullName}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate" title={email}>{email}</p>
                    </div>

                    <DropdownMenuSeparator className="bg-slate-100" />

                    {role === 'student' && (
                        <DropdownMenuItem className="cursor-pointer rounded-xl py-2.5 font-medium text-slate-700 hover:bg-slate-50" onClick={() => navigate('/my-jobs')}>
                            <Briefcase className="mr-2 h-4 w-4 text-emerald-500" /> Việc làm đã ứng tuyển
                        </DropdownMenuItem>
                    )}

                    {role === 'organizer' && (
                        <DropdownMenuItem className="cursor-pointer rounded-xl py-2.5 font-medium text-slate-700 hover:bg-slate-50" onClick={() => navigate('/dashboard')}>
                            <Building2 className="mr-2 h-4 w-4 text-blue-500" /> Quản lý sự kiện
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem className="cursor-pointer rounded-xl py-2.5 font-medium text-slate-700 hover:bg-slate-50" onClick={() => navigate('/settings')}>
                        <User className="mr-2 h-4 w-4 text-slate-400" /> Cài đặt tài khoản
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-slate-100" />

                    <DropdownMenuItem className="cursor-pointer rounded-xl py-2.5 text-rose-600 focus:bg-rose-50 focus:text-rose-600 font-bold" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-200">
            <NotchNavbar
                logo={<span className="font-black text-xl tracking-tight text-slate-900 cursor-pointer" onClick={() => navigate('/')}>Event<span className="text-emerald-600">Mate</span></span>}
                rightActions={rightActions}
                role={role}
            />
            <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    )
}