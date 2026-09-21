"use client"

import { useEffect, useState, isValidElement, cloneElement } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/components/providers/AuthProvider"
import { NotchNavbar } from "@/components/layout/NotchNavbar"
import { useToast } from "@/components/providers/ToastProvider"
import NotificationDropdown from "./NotificationDropdown"
import JobseekerProfileDropdown from "./JobseekerProfileDropdown"
import FloatingChat from "@/features/chat/components/FloatingChat"
import Footer from "./Footer"
import AuthPromptModal from "@/features/auth/components/AuthPromptModal"
import { isOrganizerRole } from "@/lib/auth-constants"
import { cn } from "@/lib/utils"

export default function MainLayout({
    children,
    role,
    fullWidth = false,
    className,
}: {
    children: React.ReactNode | ((props: { navbar: React.ReactNode }) => React.ReactNode)
    role?: string
    fullWidth?: boolean
    className?: string
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

    // Detect if current page/context is for Employer / Organizer
    const isEmployerContext =
        isOrganizerRole(role) ||
        isOrganizerRole(profile?.role) ||
        pathname?.startsWith("/for-employers") ||
        pathname?.startsWith("/organizer")

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

    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const [authModalMessage, setAuthModalMessage] = useState<string | undefined>()
    const [authModalRedirect, setAuthModalRedirect] = useState<string | undefined>()

    // Open auth prompt modal from anywhere via CustomEvent
    useEffect(() => {
        const handleOpenAuth = (e: Event) => {
            const customEvent = e as CustomEvent
            if (customEvent.detail?.directNavigate) {
                const targetRedirect = customEvent.detail?.redirect ? `&redirect=${encodeURIComponent(customEvent.detail.redirect)}` : ''
                if (customEvent.detail?.mode === "register") {
                    navigate(isEmployerContext ? `/register?role=organizer${targetRedirect}` : `/register${targetRedirect}`)
                } else if (customEvent.detail?.mode === "forgot") {
                    navigate(isEmployerContext ? `/reset-password?role=organizer${targetRedirect}` : `/reset-password${targetRedirect}`)
                } else {
                    navigate(isEmployerContext ? `/login?role=organizer${targetRedirect}` : `/login${targetRedirect}`)
                }
            } else {
                setAuthModalMessage(customEvent.detail?.message)
                setAuthModalRedirect(customEvent.detail?.redirect)
                setIsAuthModalOpen(true)
            }
        }
        window.addEventListener("open-auth-modal", handleOpenAuth)
        return () => window.removeEventListener("open-auth-modal", handleOpenAuth)
    }, [isEmployerContext])

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
            navigate(isEmployerContext ? "/for-employers" : "/")
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
        const handleTriggerLogout = () => {
            handleLogout()
        }
        window.addEventListener("trigger-logout", handleTriggerLogout)
        return () => window.removeEventListener("trigger-logout", handleTriggerLogout)
    }, [])

    const rightActions = loadingAuth ? null : effectiveUser ? (
        isEmployerContext ? (
            <div className="flex items-center gap-2 sm:gap-4">
                <NotificationDropdown
                    notifications={notifications}
                    unreadCount={unreadCount}
                    markAsRead={markAsRead}
                />
                <JobseekerProfileDropdown
                    avatarUrl={avatarUrl}
                    fullName={fullName}
                    email={email}
                    role={userRole}
                    isEmployer={true}
                    navigate={navigate}
                    handleLogout={handleLogout}
                />
            </div>
        ) : (
            <div className="flex items-center gap-1 sm:gap-2">
                <NotificationDropdown
                    notifications={notifications}
                    unreadCount={unreadCount}
                    markAsRead={markAsRead}
                />
                <JobseekerProfileDropdown
                    avatarUrl={avatarUrl}
                    fullName={fullName}
                    email={email}
                    role={userRole}
                    isEmployer={false}
                    navigate={navigate}
                    handleLogout={handleLogout}
                />
            </div>
        )
    ) : undefined


    const isHomePage = pathname === "/" && !isEmployerContext
    const isEmployerLanding = pathname === "/for-employers"
    const hasHeroHeader = isHomePage || isEmployerLanding
    const isRenderProp = typeof children === "function"

    const navbarElement = (
        <NotchNavbar
            variant="floating"
            rightActions={rightActions}
            role={effectiveUser ? (role || profile?.role || "student") : "guest"}
            isEmployer={isEmployerContext}
        />
    )

    return (
        <div className={cn("min-h-screen flex flex-col bg-background text-foreground", className)}>
            {navbarElement}
            <main
                className={cn(
                    "flex-1 w-full",
                    hasHeroHeader ? "-mt-[92px] sm:-mt-[96px]" : "",
                    !hasHeroHeader && !fullWidth ? "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6" : ""
                )}
            >
                {isRenderProp
                    ? (children as (props: { navbar?: React.ReactNode }) => React.ReactNode)({ navbar: null })
                    : children}
            </main>

            <Footer />

            <FloatingChat user={user} role={userRole} />
            <AuthPromptModal
                isOpen={isAuthModalOpen}
                onClose={() => {
                    setIsAuthModalOpen(false)
                    setAuthModalRedirect(undefined)
                }}
                customMessage={authModalMessage}
                redirectPath={authModalRedirect || pathname || undefined}
                role={isEmployerContext ? "organizer" : "student"}
            />
        </div>
    )
}
