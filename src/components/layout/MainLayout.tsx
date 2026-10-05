"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/components/providers/AuthProvider"
import { NotchNavbar } from "@/components/layout/NotchNavbar"
import { useToast } from "@/components/providers/ToastProvider"
import NotificationDropdown from "./NotificationDropdown"
import JobseekerProfileDropdown from "./JobseekerProfileDropdown"
import FloatingChat from "@/features/chat/components/FloatingChat"
import Footer from "./Footer"
import { cn, isOrganizerRole } from "@/lib/utils"
import { Plus, ShieldCheck, MessageSquare } from "lucide-react"

export default function MainLayout({
    children,
    role,
    fullWidth = false,
    className,
    footerClassName,
}: {
    children: React.ReactNode | ((props: { navbar: React.ReactNode }) => React.ReactNode)
    role?: string
    fullWidth?: boolean
    className?: string
    footerClassName?: string
}) {
    const router = useRouter()
    const pathname = usePathname()
    const navigate = (path: string) => router.push(path)
    const { showToast } = useToast()
    
    const { user, profile, loading: loadingAuth } = useUser()

    const fullName = profile?.full_name || ""
    const email = user?.email || ""
    const avatarUrl = profile?.avatar_url || ""
    const userRole = role || profile?.role || "guest"
    const isAdmin = userRole === "admin" || profile?.role === "admin"

    // Detect if current page/context is for Employer / Organizer
    const isEmployerContext =
        !isAdmin &&
        (isOrganizerRole(role) ||
        isOrganizerRole(profile?.role) ||
        pathname?.startsWith("/organizer") ||
        (pathname?.startsWith("/pricing") && profile?.role !== "student"))

    const [isGuestMode, setIsGuestMode] = useState(false)
    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search)
            if (params.get("guest") === "1" || params.get("mode") === "guest") {
                setIsGuestMode(true)
            }
        }
    }, [])

    const effectiveUser = isGuestMode ? null : user
    const [notifications, setNotifications] = useState<any[]>([])
    const unreadCount = notifications.filter(n => !n.is_read).length

    // Fetch notifications + subscribe to realtime INSERTs for the current user.
    useEffect(() => {
        if (!user) {
            setNotifications([])
            return
        }
        const fetchNotifs = async () => {
            const { data: notifs } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(10)
            if (notifs) setNotifications(notifs)
        }
        fetchNotifs()

        const channel = supabase
            .channel(`user-realtime-notifications-${user.id}-${Math.random().toString(36).substring(7)}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
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

        return () => {
            if (channel) supabase.removeChannel(channel)
        }
    }, [user, showToast])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        const privatePaths = ["/account", "/my-events", "/dashboard", "/chat", "/profile", "/post-job", "/notifications", "/saved"]
        const isPrivate = privatePaths.some(path => window.location.pathname.startsWith(path))
        if (isPrivate) {
            navigate("/")
        } else {
            window.location.reload()
        }
    }

    const markAsRead = async () => {
        if (unreadCount === 0 || !user) return
        await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false)
        setNotifications(notifications.map(n => ({ ...n, is_read: true })))
    }

    useEffect(() => {
        const handleNotificationsRead = (e: Event) => {
            const detail = (e as CustomEvent).detail
            if (detail?.all) {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            } else if (detail?.id) {
                if (detail.deleted) {
                    setNotifications(prev => prev.filter(n => n.id !== detail.id))
                } else {
                    setNotifications(prev => prev.map(n => n.id === detail.id ? ({ ...n, is_read: true }) : n))
                }
            }
        }
        window.addEventListener("notifications-read", handleNotificationsRead)
        return () => window.removeEventListener("notifications-read", handleNotificationsRead)
    }, [])

    useEffect(() => {
        const handleTriggerLogout = () => {
            handleLogout()
        }
        window.addEventListener("trigger-logout", handleTriggerLogout)
        return () => window.removeEventListener("trigger-logout", handleTriggerLogout)
    }, [])

    const rightActions = loadingAuth ? null : effectiveUser ? (
        <div className="flex items-center gap-1 sm:gap-2">
            {/* Quick Action CTA for Roles */}
            {isAdmin ? (
                <button
                    type="button"
                    onClick={() => navigate("/admin")}
                    className="hidden sm:inline-flex items-center gap-1.5 h-[36px] px-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium text-[13px] shadow-xs active:scale-[0.97] transition-all cursor-pointer"
                    title="Quản trị hệ thống"
                >
                    <ShieldCheck className="size-3.5" />
                    <span>Admin Portal</span>
                </button>
            ) : isEmployerContext ? (
                <button
                    type="button"
                    onClick={() => navigate("/post-job")}
                    className="hidden sm:inline-flex items-center gap-1.5 h-[36px] px-3.5 rounded-full bg-zinc-900 hover:bg-black text-white font-semibold text-[13px] shadow-xs hover:shadow-sm active:scale-[0.97] transition-all cursor-pointer"
                    title="Đăng tin tuyển dụng mới"
                >
                    <Plus className="size-3.5" />
                    <span>Đăng tin</span>
                </button>
            ) : null}

            {/* Direct Chat / Messages Shortcut */}
            <button
                type="button"
                onClick={() => navigate("/chat")}
                className="relative size-[38px] rounded-full flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Tin nhắn"
                aria-label="Tin nhắn"
            >
                <MessageSquare className="size-[19px]" />
            </button>

            {/* Notification Dropdown */}
            <NotificationDropdown
                notifications={notifications}
                unreadCount={unreadCount}
                markAsRead={markAsRead}
            />

            {/* Profile Dropdown */}
            <JobseekerProfileDropdown
                avatarUrl={avatarUrl}
                fullName={fullName}
                email={email}
                role={userRole}
                isEmployer={isEmployerContext}
                navigate={navigate}
                handleLogout={handleLogout}
            />
        </div>
    ) : undefined

    const isHomePage = pathname === "/"
    const isEventsPage = pathname === "/events"
    const isBlogPage = pathname === "/blog"
    const hasHeroNavbar = isHomePage || isEventsPage || isBlogPage
    const hasHeroHeader = isHomePage || isEventsPage || isBlogPage
    const isRenderProp = typeof children === "function"

    const navbarElement = (
        <NotchNavbar
            role={effectiveUser ? userRole : "guest"}
            isEmployer={isEmployerContext}
            isHeroNavbar={hasHeroNavbar}
            notifications={notifications}
            unreadCount={unreadCount}
            markAsRead={markAsRead}
            avatarUrl={avatarUrl}
            fullName={fullName}
            email={email}
            handleLogout={handleLogout}
            user={effectiveUser}
        />
    )

    return (
        <div className={cn("min-h-screen flex flex-col bg-background text-foreground", (isHomePage || isEventsPage || isBlogPage) && "bg-[#F2F6FC]", className)}>
            {navbarElement}
            <main
                className={cn(
                    "flex-1 w-full",
                    !hasHeroHeader && !fullWidth ? "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6" : ""
                )}
            >
                {isRenderProp
                    ? (children as (props: { navbar?: React.ReactNode }) => React.ReactNode)({ navbar: null })
                    : children}
            </main>

            <Footer className={cn(isHomePage ? "pt-6" : undefined, footerClassName)} />

            <FloatingChat user={user} role={userRole} />
        </div>
    )
}
