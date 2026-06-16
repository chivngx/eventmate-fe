import { ReactNode, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Bell, LogOut, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuGroup,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { NotchNavbar } from "@/components/ui/notch-navbar"

// Dữ liệu mẫu đã được Việt hóa cho hợp ngữ cảnh EventMate
const notifications = [
    {
        id: "1",
        user: "BTC Tech Expo",
        avatar: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=96&h=96&dpr=2&q=80",
        initials: "TE",
        action: "đã gửi phản hồi về",
        target: "Hồ sơ ứng tuyển của bạn",
        time: "2 phút trước",
        unread: false,
    },
    {
        id: "2",
        user: "CLB Truyền thông",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&dpr=2&q=80",
        initials: "TT",
        action: "vừa đăng sự kiện",
        target: "Lễ hội Mùa xuân",
        time: "1 giờ trước",
        unread: true,
    },
    {
        id: "3",
        user: "Hệ thống",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&dpr=2&q=80",
        initials: "HT",
        action: "nhắc nhở bạn hoàn thiện",
        target: "Kỹ năng trong CV",
        time: "3 giờ trước",
        unread: false,
    },
]

export default function MainLayout({ children, role }: { children: ReactNode, role: string }) {
    const navigate = useNavigate()
    const [email, setEmail] = useState<string>("Đang tải...")
    const [fullName, setFullName] = useState<string>("Người dùng")
    const [avatarUrl, setAvatarUrl] = useState<string>("")

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setEmail(user.email || "Chưa cập nhật email")
                const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
                if (profile) {
                    setFullName(profile.full_name || (role === "student" ? "Tài khoản Ứng viên" : "Tài khoản BTC"))
                    setAvatarUrl(profile.avatar_url || "")
                }
            }
        }
        fetchUserData()
    }, [role])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate("/login")
    }

    const getInitial = (name: string) => name ? name.charAt(0).toUpperCase() : "U"

    const Logo = (
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white font-black text-lg transition-transform group-hover:scale-105 shadow-sm">
                e.
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
                Event<span className="text-emerald-500">Mate</span>
            </span>
        </div>
    )

    const RightActions = (
        <>
            {/* DROPDOWN THÔNG BÁO */}
            <DropdownMenu>
                {/* Đã gỡ asChild và gỡ thẻ Button. Gộp trực tiếp CSS vào Trigger */}
                <DropdownMenuTrigger className="relative flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full h-10 w-10 outline-none focus:ring-2 focus:ring-emerald-500 transition-colors">
                    <Bell className="h-5 w-5" aria-hidden="true" />
                    <Badge
                        variant="destructive"
                        className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center p-0 text-[10px] text-white rounded-full border-2 border-white bg-rose-500"
                    >
                        8
                    </Badge>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-80 rounded-2xl p-2 shadow-xl border-slate-100 bg-white" align="end" sideOffset={8}>
                    <DropdownMenuGroup>
                        <DropdownMenuLabel className="flex items-center justify-between px-2 py-2">
                            <span className="text-base font-extrabold text-slate-900">Thông báo</span>
                            <button className="text-emerald-600 text-xs font-semibold underline-offset-2 hover:underline">
                                Đánh dấu đã đọc
                            </button>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-100" />
                        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
                            {notifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className="flex items-start gap-3 py-3 px-2 rounded-xl cursor-pointer hover:bg-slate-50 focus:bg-slate-50 transition-colors"
                                >
                                    <Avatar className="mt-0.5 size-10 shrink-0 border border-slate-100 shadow-sm">
                                        <AvatarImage src={notification.avatar} alt={notification.user} />
                                        <AvatarFallback className="font-bold text-slate-600 bg-slate-100">{notification.initials}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-1 flex-col gap-1">
                                        <p className="leading-tight text-sm text-slate-600">
                                            <span className="font-bold text-slate-900">{notification.user}</span>{" "}
                                            {notification.action}{" "}
                                            <span className="font-bold text-slate-900">{notification.target}</span>
                                        </p>
                                        <span className="text-xs font-medium text-slate-400">
                                            {notification.time}
                                        </span>
                                    </div>
                                    {/* Chấm xanh báo chưa đọc */}
                                    {notification.unread && (
                                        <span className="bg-emerald-500 mt-2 size-2.5 shrink-0 rounded-full shadow-sm" />
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator className="bg-slate-100" />
                        <DropdownMenuItem className="justify-center py-2.5 font-bold text-emerald-600 cursor-pointer hover:bg-emerald-50 focus:bg-emerald-50 rounded-xl">
                            Xem tất cả thông báo
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* DROPDOWN AVATAR (Đã lược bớt các mục thừa) */}
            <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                    <Avatar className="h-10 w-10 cursor-pointer border-2 border-white shadow-sm transition-transform hover:scale-105">
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

                    {/* Nút cài đặt cá nhân */}
                    <DropdownMenuItem
                        className="cursor-pointer rounded-xl py-2.5 font-medium text-slate-700 hover:bg-slate-50"
                        onClick={() => navigate('/settings')}
                    >
                        <User className="mr-2 h-4 w-4 text-slate-400" /> Cài đặt tài khoản
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-slate-100" />
                    <DropdownMenuItem className="cursor-pointer rounded-xl py-2.5 text-rose-600 focus:bg-rose-50 focus:text-rose-600 font-bold" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
            <NotchNavbar logo={Logo} rightActions={RightActions} role={role} />
            <main className="mx-auto max-w-7xl px-4 pb-8 pt-[96px] sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    )
}