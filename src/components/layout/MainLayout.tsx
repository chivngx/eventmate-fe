import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { NotchNavbar } from "@/components/layout/notch-navbar"
import { Button } from "@/components/ui/button"
import AuthModal from "@/components/auth/AuthModal"
import { useToast } from "@/components/ui/ToastProvider"
import NotificationDropdown from "./NotificationDropdown"
import UserProfileDropdown from "./UserProfileDropdown"
import { MessageSquare } from "lucide-react"
import FloatingChat from "@/components/chat/FloatingChat"
import Footer from "./Footer"

export default function MainLayout({ children, role }: { children: React.ReactNode, role?: string }) {
    const navigate = useNavigate()
    const { showToast } = useToast()

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
    const [userRole, setUserRole] = useState(role || cached?.role || "student")

    const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: "login" | "register" }>({
        isOpen: false,
        mode: "login"
    })

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
                    const updatedRole = data.role || "student"
                    setFullName(updatedFullName)
                    setAvatarUrl(updatedAvatarUrl)
                    setUserRole(updatedRole)

                    // Lưu lại cache mới nhất
                    localStorage.setItem("em_user_profile", JSON.stringify({
                        fullName: updatedFullName,
                        avatarUrl: updatedAvatarUrl,
                        email: currentUser.email || "",
                        role: updatedRole
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
            <NotificationDropdown
                notifications={notifications}
                unreadCount={unreadCount}
                markAsRead={markAsRead}
            />
            <Link
                to="/chat"
                className="p-2 sm:p-2.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-emerald-600 relative flex items-center justify-center shrink-0"
                title="Trò chuyện"
            >
                <MessageSquare className="w-5 h-5" />
            </Link>
            <UserProfileDropdown
                avatarUrl={avatarUrl}
                fullName={fullName}
                role={role}
                user={user}
                email={email}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
                navigate={navigate}
                handleLogout={handleLogout}
            />
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
        <div className="min-h-screen bg-[#f4f5f5] dark:bg-slate-950 font-sans selection:bg-emerald-200 text-slate-900 dark:text-slate-100 transition-colors duration-200">
            <NotchNavbar
                logo={<span className="font-black text-xl tracking-tight text-slate-900 dark:text-slate-100 cursor-pointer" onClick={() => navigate('/')}>Event<span className="text-emerald-600">Mate</span></span>}
                rightActions={rightActions}
                role={role}
            />
            <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {children}
            </main>

            <Footer />

            <AuthModal
                isOpen={authModal.isOpen}
                initialMode={authModal.mode}
                onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))}
            />

            <FloatingChat user={user} role={userRole} />
        </div>
    )
}