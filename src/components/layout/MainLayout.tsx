"use client"

import { useEffect, useState } from"react"
import { useRouter } from"next/navigation"
import Link from"next/link"
import { supabase } from"@/lib/supabase"
import { useUser } from"@/components/providers/AuthProvider"
import { NotchNavbar } from"@/components/layout/notch-navbar"
import { Button } from"@/components/ui/button"
import AuthModal from"@/components/auth/AuthModal"
import { useToast } from"@/components/ui/ToastProvider"
import NotificationDropdown from"./NotificationDropdown"
import UserProfileDropdown from"./UserProfileDropdown"
import { MessageSquare } from"lucide-react"
import FloatingChat from"@/components/chat/FloatingChat"
import Footer from"./Footer"

export default function MainLayout({ children, role }: { children: React.ReactNode, role?: string }) {
 const router = useRouter()
 const navigate = (path: string) => router.push(path)
 const { showToast } = useToast()
 // 🔒 P1.1: auth + profile từ context (thay 31 getUser() calls + localStorage cache)
 const { user, profile, loading: loadingAuth } = useUser()

 // Derive display values from context. `role` prop is kept as a backward-
 // compat override for pages not yet migrated to useUser().
 const fullName = profile?.full_name ||""
 const email = user?.email ||""
 const avatarUrl = profile?.avatar_url ||""
 const userRole = role || profile?.role ||"guest"

 const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode:"login" |"register" }>({
 isOpen: false,
 mode:"login"
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

 // Open auth modal from anywhere via CustomEvent (kept for backward compat
 // with notch-navbar / EventCard / useStudentDashboard).
 useEffect(() => {
 const handleOpenAuth = (e: Event) => {
 const customEvent = e as CustomEvent
 setAuthModal({
 isOpen: true,
 mode: customEvent.detail?.mode ||"login"
 })
 }
 window.addEventListener("open-auth-modal", handleOpenAuth)
 return () => window.removeEventListener("open-auth-modal", handleOpenAuth)
 }, [])

 // Fetch notifications + subscribe to realtime INSERTs for the current user.
 // Depends on user.id (from context) — re-subscribes when user changes.
 useEffect(() => {
 if (!user) {
 setNotifications([])
 return
 }
 let channel: any

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

 channel = supabase
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
 title: newNotif.title ||"Thông báo mới",
 message: newNotif.message ||"",
 type:"info"
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
 // onAuthStateChange in AuthProvider clears user/profile state.
 // Navigate away from private pages; reload others to flush UI state.
 const privatePaths = ["/settings","/my-jobs","/dashboard","/chat","/cv","/saved"]
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

 const rightActions = loadingAuth ? null : user ? (
 <div className="flex items-center gap-2 sm:gap-4">
 <NotificationDropdown
 notifications={notifications}
 unreadCount={unreadCount}
 markAsRead={markAsRead}
 />
 <Link
 href="/chat"
 aria-label="Trò chuyện"
 className="p-2 sm:p-2.5 rounded-full hover:bg-slate-50 transition-colors text-slate-400 hover:text-emerald-600 relative flex items-center justify-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
 title="Trò chuyện"
 >
 <MessageSquare className="w-5 h-5" />
 </Link>
 <UserProfileDropdown
 avatarUrl={avatarUrl}
 fullName={fullName}
 role={role || profile?.role}
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
 onClick={() => setAuthModal({ isOpen: true, mode:"login" })}
 >
 Đăng nhập
 </Button>
 <Button
 className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-4 h-8 sm:h-9 text-xs sm:text-sm font-bold shadow-sm transition-all whitespace-nowrap shrink-0"
 onClick={() => setAuthModal({ isOpen: true, mode:"register" })}
 >
 Đăng ký
 </Button>
 </div>
 )

 return (
 <div className="min-h-screen bg-[#f4f5f5] font-sans selection:bg-emerald-200 text-slate-900 transition-colors duration-200">
 <NotchNavbar
 logo={<span className="font-black text-xl tracking-tight text-slate-900 cursor-pointer" onClick={() => navigate('/')}>Event<span className="text-emerald-600">Mate</span></span>}
 rightActions={rightActions}
 role={role || profile?.role ||"guest"}
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
