import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { NotchNavbar } from "@/components/layout/notch-navbar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, LogOut, Briefcase, ChevronDown, ChevronUp, Mail, Shield, Crown, FileText, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import AuthModal from "@/components/auth/AuthModal"
import { useToast } from "@/components/ui/ToastProvider"

export default function MainLayout({ children, role }: { children: React.ReactNode, role?: string }) {
    const navigate = useNavigate()
    const { showToast } = useToast()

    // Khởi tạo trạng thái đồng bộ từ cache để tránh giật lag hay mất avatar khi vừa chuyển tab
    const getCachedProfile = () => {
        const cached = localStorage.getItem("em_user_profile")
        if (cached) {
            try {
                return JSON.parse(cached)
            } catch (e) {
                return null
            }
        }
        return null
    }

    const cached = getCachedProfile()

    const [user, setUser] = useState<any>(() => {
        return cached ? { email: cached.email } : null
    })
    const [loadingAuth, setLoadingAuth] = useState(() => {
        return cached ? false : true
    })
    const [fullName, setFullName] = useState(cached?.fullName || "")
    const [email, setEmail] = useState(cached?.email || "")
    const [avatarUrl, setAvatarUrl] = useState(cached?.avatarUrl || "")

    const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: "login" | "register" }>({
        isOpen: false,
        mode: "login"
    })

    // STATE THÔNG BÁO
    const [notifications, setNotifications] = useState<any[]>([])
    const unreadCount = notifications.filter(n => !n.is_read).length

    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        jobSearch: true,
        cvManage: true,
        emailConfig: false,
        personalSecurity: false,
        upgrade: false,
    })

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }))
    }

    useEffect(() => {
        const handleOpenAuth = (e: Event) => {
            const customEvent = e as CustomEvent
            setAuthModal({
                isOpen: true,
                mode: customEvent.detail?.mode || "login"
            })
        }
        window.addEventListener("open-auth-modal", handleOpenAuth)
        return () => window.removeEventListener("open-auth-modal", handleOpenAuth)
    }, [])

    useEffect(() => {
        let channel: any; // Biến lưu trữ kênh đăng ký Real-time để cleanup khi unmount

        const fetchProfileAndSetupRealtime = async () => {
            // Lấy session từ cache cục bộ (nhanh hơn getUser rất nhiều)
            const { data: { session } } = await supabase.auth.getSession()
            let currentUser = session?.user || null

            if (!currentUser) {
                const { data: { user } } = await supabase.auth.getUser()
                currentUser = user
            }

            setUser(currentUser)
            if (currentUser) {
                setEmail(currentUser.email || "")
                const { data } = await supabase.from("profiles").select("*").eq("id", currentUser.id).maybeSingle()
                if (data) {
                    const updatedFullName = data.full_name || ""
                    const updatedAvatarUrl = data.avatar_url || ""
                    setFullName(updatedFullName)
                    setAvatarUrl(updatedAvatarUrl)

                    // Lưu lại cache mới nhất
                    localStorage.setItem("em_user_profile", JSON.stringify({
                        fullName: updatedFullName,
                        avatarUrl: updatedAvatarUrl,
                        email: currentUser.email || ""
                    }))
                }

                // 1. Tải 10 thông báo mới nhất từ Database khi vừa nạp trang
                const { data: notifs } = await supabase
                    .from("notifications")
                    .select("*")
                    .eq("user_id", currentUser.id)
                    .order("created_at", { ascending: false })
                    .limit(10)
                if (notifs) setNotifications(notifs)

                // 2. [MỚI] Cài đặt kênh kết nối Real-time lắng nghe sự kiện INSERT vào bảng notifications của riêng user này
                channel = supabase
                    .channel(`user-realtime-notifications-${currentUser.id}-${Math.random().toString(36).substring(7)}`)
                    .on(
                        'postgres_changes',
                        {
                            event: 'INSERT',
                            schema: 'public',
                            table: 'notifications',
                            filter: `user_id=eq.${currentUser.id}`
                        },
                        (payload) => {
                            const newNotif = payload.new
                            setNotifications(prev => [newNotif, ...prev].slice(0, 10))
                            showToast({
                                title: newNotif.title || "Thông báo mới",
                                message: newNotif.message || "",
                                type: "info"
                            })
                        }
                    )
                    .subscribe()
            } else {
                localStorage.removeItem("em_user_profile")
            }
            setLoadingAuth(false)
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
        localStorage.removeItem("em_user_profile")
        await supabase.auth.signOut()

        const privatePaths = ["/settings", "/my-jobs", "/dashboard"]
        const isPrivate = privatePaths.some(path => window.location.pathname.startsWith(path))

        if (isPrivate) {
            navigate("/")
        } else {
            window.location.reload()
        }
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

    const rightActions = loadingAuth ? null : user ? (
        <div className="flex items-center gap-2 sm:gap-4">

            {/* DROPDOWN THÔNG BÁO TỰ ĐỘNG CẬP NHẬT REAL-TIME */}
            <DropdownMenu onOpenChange={(open) => { if (open) markAsRead() }}>
                <DropdownMenuTrigger className="relative p-2 text-slate-400 hover:text-emerald-600 transition-colors outline-none">
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
                    )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 mt-2 rounded-2xl p-0 shadow-xl border-slate-100 dark:border-slate-855 bg-white dark:bg-slate-900 overflow-hidden text-slate-900 dark:text-slate-100">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-center">
                        <h4 className="font-bold text-slate-900 dark:text-slate-100">Thông báo</h4>
                        {unreadCount > 0 && <span className="text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-full">{unreadCount} mới</span>}
                    </div>
                    <div className="max-h-[350px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">Bạn chưa có thông báo nào.</div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className={`p-4 border-b border-slate-50 dark:border-slate-850 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${!n.is_read ? 'bg-emerald-50/30 dark:bg-emerald-950/15' : 'bg-white dark:bg-slate-900'}`}>
                                    <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        {!n.is_read && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>}
                                        {n.title}
                                    </h5>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">{n.message}</p>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-2 uppercase tracking-wider">{new Date(n.created_at).toLocaleString('vi-VN')}</p>
                                </div>
                            ))
                        )}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* DROPDOWN AVATAR ĐIỀU HƯỚNG CHUYÊN BIỆT */}
            <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shrink-0">
                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10 cursor-pointer border-2 border-white dark:border-slate-800 shadow-sm transition-transform hover:scale-105">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="bg-emerald-50 text-emerald-600 font-bold text-sm">
                            {getInitial(fullName)}
                        </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[320px] max-h-[85vh] overflow-y-auto mt-2 rounded-2xl p-4 shadow-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 text-slate-900 dark:text-slate-100">
                    {/* Header */}
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <Avatar className="h-12 w-12 rounded-full border border-slate-100 shrink-0">
                            <AvatarImage src={avatarUrl} />
                            <AvatarFallback className="bg-emerald-50 text-emerald-600 font-bold text-lg">
                                {getInitial(fullName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-slate-800 truncate" title={fullName}>{fullName}</p>
                            <p className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                                {role === 'organizer' ? "Nhà tuyển dụng" : "Tài khoản học sinh"}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 truncate">
                                {user?.id ? `ID ${user.id.substring(0, 7).toUpperCase()}` : "ID 123456"} <span className="text-slate-300">|</span> {email}
                            </p>
                        </div>
                    </div>

                    {/* Accordion Menu */}
                    {role === 'organizer' ? (
                        <div className="space-y-3.5">
                            {/* 1. Quản lý tuyển dụng */}
                            <div className="space-y-1">
                                <button
                                    type="button"
                                    onClick={() => toggleSection("jobSearch")}
                                    className="w-full flex items-center justify-between py-1 text-slate-700 hover:text-[#00b14f] transition-colors"
                                >
                                    <div className="flex items-center gap-2.5 font-bold text-xs">
                                        <Briefcase className="w-4 h-4 text-slate-500" />
                                        <span>Quản lý tuyển dụng</span>
                                    </div>
                                    {expandedSections.jobSearch ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                                </button>
                                {expandedSections.jobSearch && (
                                    <div className="pl-6.5 flex flex-col gap-2 pt-1 pb-2">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/dashboard')}
                                            className="text-left text-xs font-semibold text-slate-500 hover:text-[#00b14f] transition-colors"
                                        >
                                            Danh sách tin tuyển dụng
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/dashboard')}
                                            className="text-left text-xs font-semibold text-slate-500 hover:text-[#00b14f] transition-colors"
                                        >
                                            Quản lý hồ sơ ứng viên
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* 2. Hồ sơ doanh nghiệp */}
                            <div className="space-y-1">
                                <button
                                    type="button"
                                    onClick={() => toggleSection("cvManage")}
                                    className="w-full flex items-center justify-between py-1 text-slate-700 hover:text-[#00b14f] transition-colors"
                                >
                                    <div className="flex items-center gap-2.5 font-bold text-xs">
                                        <Building2 className="w-4 h-4 text-slate-500" />
                                        <span>Hồ sơ doanh nghiệp</span>
                                    </div>
                                    {expandedSections.cvManage ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                                </button>
                                {expandedSections.cvManage && (
                                    <div className="pl-6.5 flex flex-col gap-2 pt-1 pb-2">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/settings')}
                                            className="text-left text-xs font-semibold text-slate-500 hover:text-[#00b14f] transition-colors"
                                        >
                                            Thông tin doanh nghiệp
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/settings')}
                                            className="text-left text-xs font-semibold text-slate-500 hover:text-[#00b14f] transition-colors"
                                        >
                                            Cài đặt tài khoản
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* 3. Cài đặt & Bảo mật */}
                            <div className="space-y-1">
                                <button
                                    type="button"
                                    onClick={() => toggleSection("personalSecurity")}
                                    className="w-full flex items-center justify-between py-1 text-slate-700 hover:text-[#00b14f] transition-colors"
                                >
                                    <div className="flex items-center gap-2.5 font-bold text-xs">
                                        <Shield className="w-4 h-4 text-slate-500" />
                                        <span>Cài đặt & Bảo mật</span>
                                    </div>
                                    {expandedSections.personalSecurity ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                                </button>
                                {expandedSections.personalSecurity && (
                                    <div className="pl-6.5 flex flex-col gap-2 pt-1 pb-2">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/settings')}
                                            className="text-left text-xs font-semibold text-slate-500 hover:text-[#00b14f] transition-colors"
                                        >
                                            Cài đặt cá nhân
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/settings')}
                                            className="text-left text-xs font-semibold text-slate-500 hover:text-[#00b14f] transition-colors"
                                        >
                                            Đổi mật khẩu
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* 4. Dịch vụ & Nâng cấp */}
                            <div className="space-y-1">
                                <button
                                    type="button"
                                    onClick={() => toggleSection("upgrade")}
                                    className="w-full flex items-center justify-between py-1 text-slate-700 hover:text-[#00b14f] transition-colors"
                                >
                                    <div className="flex items-center gap-2.5 font-bold text-xs">
                                        <Crown className="w-4 h-4 text-slate-500" />
                                        <span>Dịch vụ & Nâng cấp</span>
                                    </div>
                                    {expandedSections.upgrade ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                                </button>
                                {expandedSections.upgrade && (
                                    <div className="pl-6.5 flex flex-col gap-2 pt-1 pb-2">
                                        <button
                                            type="button"
                                            onClick={() => alert("Chức năng mua gói VIP Tuyển dụng đang được phát triển!")}
                                            className="text-left text-xs font-semibold text-slate-500 hover:text-[#00b14f] transition-colors"
                                        >
                                            Đăng ký gói VIP tuyển dụng
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3.5">
                            {/* 1. Quản lý tìm việc */}
                            <div className="space-y-1">
                                <button
                                    type="button"
                                    onClick={() => toggleSection("jobSearch")}
                                    className="w-full flex items-center justify-between py-1 text-slate-700 hover:text-[#00b14f] transition-colors"
                                >
                                    <div className="flex items-center gap-2.5 font-bold text-xs">
                                        <Briefcase className="w-4 h-4 text-slate-500" />
                                        <span>Quản lý tìm việc</span>
                                    </div>
                                    {expandedSections.jobSearch ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                                </button>
                                {expandedSections.jobSearch && (
                                    <div className="pl-6.5 flex flex-col gap-2 pt-1 pb-2">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/?filter=saved')}
                                            className="text-left text-xs font-semibold text-slate-500 hover:text-[#00b14f] transition-colors"
                                        >
                                            Việc làm đã lưu
                                        </button>
                                        {role === 'student' && (
                                            <button
                                                type="button"
                                                onClick={() => navigate('/my-jobs')}
                                                className="text-left text-xs font-semibold text-slate-500 hover:text-[#00b14f] transition-colors"
                                            >
                                                Việc làm đã ứng tuyển
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => navigate('/')}
                                            className="text-left text-xs font-semibold text-slate-500 hover:text-[#00b14f] transition-colors"
                                        >
                                            Việc làm phù hợp với bạn
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* 2. Quản lý CV */}
                            <div className="space-y-1">
                                <button
                                    type="button"
                                    onClick={() => toggleSection("cvManage")}
                                    className="w-full flex items-center justify-between py-1 text-slate-700 hover:text-[#00b14f] transition-colors"
                                >
                                    <div className="flex items-center gap-2.5 font-bold text-xs">
                                        <FileText className="w-4 h-4 text-slate-500" />
                                        <span>Quản lý hồ sơ & CV</span>
                                    </div>
                                    {expandedSections.cvManage ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                                </button>
                                {expandedSections.cvManage && (
                                    <div className="pl-6.5 flex flex-col gap-2 pt-1 pb-2">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/settings')}
                                            className="text-left text-xs font-semibold text-slate-500 hover:text-[#00b14f] transition-colors"
                                        >
                                            Thông tin hồ sơ của tôi
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/settings')}
                                            className="text-left text-xs font-semibold text-slate-500 hover:text-[#00b14f] transition-colors"
                                        >
                                            Mẫu CV cá nhân
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* 3. Cài đặt email & thông báo */}
                            <div className="space-y-1">
                                <button
                                    type="button"
                                    onClick={() => toggleSection("emailConfig")}
                                    className="w-full flex items-center justify-between py-1 text-slate-700 hover:text-[#00b14f] transition-colors"
                                >
                                    <div className="flex items-center gap-2.5 font-bold text-xs">
                                        <Mail className="w-4 h-4 text-slate-500" />
                                        <span>Cài đặt email & thông báo</span>
                                    </div>
                                    {expandedSections.emailConfig ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                                </button>
                                {expandedSections.emailConfig && (
                                    <div className="pl-6.5 flex flex-col gap-2 pt-1 pb-2">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/settings')}
                                            className="text-left text-xs font-semibold text-slate-500 hover:text-[#00b14f] transition-colors"
                                        >
                                            Cài đặt thông báo việc làm
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/settings')}
                                            className="text-left text-xs font-semibold text-slate-500 hover:text-[#00b14f] transition-colors"
                                        >
                                            Cài đặt nhận email
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* 4. Cá nhân & Bảo mật */}
                            <div className="space-y-1">
                                <button
                                    type="button"
                                    onClick={() => toggleSection("personalSecurity")}
                                    className="w-full flex items-center justify-between py-1 text-slate-700 hover:text-[#00b14f] transition-colors"
                                >
                                    <div className="flex items-center gap-2.5 font-bold text-xs">
                                        <Shield className="w-4 h-4 text-slate-500" />
                                        <span>Cá nhân & Bảo mật</span>
                                    </div>
                                    {expandedSections.personalSecurity ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                                </button>
                                {expandedSections.personalSecurity && (
                                    <div className="pl-6.5 flex flex-col gap-2 pt-1 pb-2">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/settings')}
                                            className="text-left text-xs font-semibold text-slate-500 hover:text-[#00b14f] transition-colors"
                                        >
                                            Cài đặt thông tin cá nhân
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/settings')}
                                            className="text-left text-xs font-semibold text-slate-500 hover:text-[#00b14f] transition-colors"
                                        >
                                            Đổi mật khẩu tài khoản
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* 5. Nâng cấp tài khoản */}
                            <div className="space-y-1">
                                <button
                                    type="button"
                                    onClick={() => toggleSection("upgrade")}
                                    className="w-full flex items-center justify-between py-1 text-slate-700 hover:text-[#00b14f] transition-colors"
                                >
                                    <div className="flex items-center gap-2.5 font-bold text-xs">
                                        <Crown className="w-4 h-4 text-slate-500" />
                                        <span>Nâng cấp tài khoản</span>
                                    </div>
                                    {expandedSections.upgrade ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                                </button>
                                {expandedSections.upgrade && (
                                    <div className="pl-6.5 flex flex-col gap-2 pt-1 pb-2">
                                        <button
                                            type="button"
                                            onClick={() => alert("Chức năng nâng cấp tài khoản VIP đang phát triển!")}
                                            className="text-left text-xs font-semibold text-slate-500 hover:text-[#00b14f] transition-colors"
                                        >
                                            Nâng cấp tài khoản VIP
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Bottom Logout Button */}
                    <div className="border-t border-slate-100 pt-3">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full py-2.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-600 font-bold text-xs flex items-center justify-center gap-2 border border-slate-100 hover:border-rose-100 transition-all active:scale-[0.98]"
                        >
                            <LogOut className="w-4 h-4" />
                            Đăng xuất
                        </button>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    ) : (
        <div className="flex items-center gap-1 sm:gap-2">
            <Button
                variant="ghost"
                className="text-xs sm:text-sm font-bold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-full px-3 py-1.5 h-8 sm:h-9 whitespace-nowrap"
                onClick={() => setAuthModal({ isOpen: true, mode: "login" })}
            >
                Đăng nhập
            </Button>
            <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-4 h-8 sm:h-9 text-xs sm:text-sm font-bold shadow-sm transition-all whitespace-nowrap shrink-0"
                onClick={() => setAuthModal({ isOpen: true, mode: "register" })}
            >
                Đăng ký
            </Button>
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-emerald-200 text-slate-900 dark:text-slate-100 transition-colors duration-200">
            <NotchNavbar
                logo={<span className="font-black text-xl tracking-tight text-slate-900 dark:text-slate-100 cursor-pointer" onClick={() => navigate('/')}>Event<span className="text-emerald-600">Mate</span></span>}
                rightActions={rightActions}
                role={role}
            />
            <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {children}
            </main>

            <AuthModal
                isOpen={authModal.isOpen}
                initialMode={authModal.mode}
                onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    )
}