"use client"

import { useState } from"react"
import Link from"next/link"
import { usePathname } from"next/navigation"
import { Search, FileText, Menu, X, ChevronDown, Bookmark, Briefcase, Building2, MessageSquare } from"lucide-react"
import { cn } from"@/lib/utils"
import { motion, AnimatePresence } from"framer-motion"
import { useJobPositions, useEventCategories } from"@/hooks/use-lookups"

const NavLink = ({ href, icon: Icon, label, onClick }: { href: string; icon: React.ComponentType<{ className?: string }>; label: string; onClick?: (e: React.MouseEvent) => void }) => {
 const pathname = usePathname()
 const isActive = href ==="/" ? pathname ==="/" : pathname.startsWith(href)

 return (
 <Link
 href={href}
 onClick={onClick}
 className={cn("group flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors",
 isActive
 ?"text-primary bg-accent"
 :"text-slate-600 hover:text-slate-900 hover:bg-slate-100"
 )}
 >
 <Icon className={cn("w-4 h-4", isActive ?"text-primary" :"text-slate-400 group-hover:text-slate-600")} />
 <span>{label}</span>
 </Link>
 )
}

const RecruiterMenu = () => (
 <div className="flex items-center gap-1">
 <NavLink href="/" icon={Briefcase} label="Bảng điều khiển" />
 </div>
)

const JobsMegaMenu = ({ role }: { role?: string }) => {
 const handleProtectedLink = (e: React.MouseEvent) => {
 if (role === 'guest') {
 e.preventDefault()
 window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode:"login" } }))
 }
 }

 const { data: positions = [] } = useJobPositions()
 const { data: categories = [] } = useEventCategories()

 return (
 <div className="group relative">
 <button className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
 <span>Việc làm</span>
 <ChevronDown className="w-4 h-4 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
 </button>

 {/* Dropdown: full-width on mobile, fixed width on desktop */}
 <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-[min(90vw,28rem)] sm:w-[min(600px,28rem)] lg:w-[44rem] z-50 translate-y-1 group-hover:translate-y-0">
 <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
 {/* Section: Quản lý việc làm */}
 <div className="space-y-3">
 <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quản lý việc làm</h4>
 <div className="space-y-1">
 <Link href="/" className="flex items-center gap-2.5 text-sm text-slate-700 hover:text-primary hover:bg-accent rounded-lg p-2 transition-colors">
 <Search className="w-4 h-4 text-slate-400" /> Tìm việc sự kiện
 </Link>
 <Link href="/saved" onClick={handleProtectedLink} className="flex items-center gap-2.5 text-sm text-slate-700 hover:text-primary hover:bg-accent rounded-lg p-2 transition-colors">
 <Bookmark className="w-4 h-4 text-slate-400" /> Việc đã lưu
 </Link>
 <Link href="/my-jobs" onClick={handleProtectedLink} className="flex items-center gap-2.5 text-sm text-slate-700 hover:text-primary hover:bg-accent rounded-lg p-2 transition-colors">
 <Briefcase className="w-4 h-4 text-slate-400" /> Việc đã ứng tuyển
 </Link>
 </div>
 <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-2">Ban tổ chức</h4>
 <Link href="/companies" className="flex items-center gap-2.5 text-sm text-slate-700 hover:text-primary hover:bg-accent rounded-lg p-2 transition-colors">
 <Building2 className="w-4 h-4 text-slate-400" /> Danh sách BTC
 </Link>
 </div>

 {/* Section: Theo vị trí */}
 <div className="space-y-3 sm:border-l sm:border-slate-100 sm:pl-5">
 <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Theo vị trí</h4>
 <div className="space-y-1">
 {positions.map(item => (
 <Link key={item.slug} href={`/positions/${item.slug}`} className="block text-sm text-slate-600 hover:text-primary rounded-lg p-1.5 hover:bg-accent transition-colors">
 {item.name}
 </Link>
 ))}
 </div>
 </div>

 {/* Section: Theo sự kiện */}
 <div className="space-y-3 sm:border-l sm:border-slate-100 sm:pl-5 hidden lg:block">
 <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Theo sự kiện</h4>
 <div className="space-y-1">
 {categories.map(item => (
 <Link key={item.slug} href={`/events/${item.slug}`} className="block text-sm text-slate-600 hover:text-primary rounded-lg p-1.5 hover:bg-accent transition-colors">
 {item.name}
 </Link>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 )
}

export function NotchNavbar({ className, logo, rightActions, role }: { className?: string, logo?: React.ReactNode, rightActions?: React.ReactNode, role?: string }) {
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

 return (
 <>
 <header className={cn("sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-slate-200", className)}>
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <div className="flex h-16 items-center justify-between gap-4">
 {/* Left: logo + desktop nav */}
 <div className="flex items-center gap-6 min-w-0">
 {logo}
 <nav className="hidden md:flex items-center gap-1">
 {role === 'organizer' || role === 'recruiter' ? (
 <RecruiterMenu />
 ) : (
 <>
 <JobsMegaMenu role={role} />
 <NavLink
 href="/cv"
 icon={FileText}
 label="Hồ sơ CV"
 onClick={(e) => {
 if (role === 'guest') {
 e.preventDefault()
 window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode:"login" } }))
 }
 }}
 />
 </>
 )}
 </nav>
 </div>

 {/* Right: actions + mobile toggle */}
 <div className="flex items-center gap-2">
 {rightActions}
 <button
 className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
 aria-label={isMobileMenuOpen ?"Đóng menu" :"Mở menu"}
 aria-expanded={isMobileMenuOpen}
 >
 {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
 </button>
 </div>
 </div>
 </div>
 </header>

 {/* Mobile drawer */}
 <AnimatePresence>
 {isMobileMenuOpen && (
 <motion.div
 initial={{ opacity: 0, y: -8 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -8 }}
 className="md:hidden fixed inset-x-0 top-16 z-40 bg-white border-b border-slate-200 shadow-lg"
 >
 <nav className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
 <Link href="/" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 font-medium text-slate-800" onClick={() => setIsMobileMenuOpen(false)}>
 <Search className="w-5 h-5 text-slate-400" /> Tìm việc sự kiện
 </Link>
 <Link
 href="/cv"
 className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 font-medium text-slate-800"
 onClick={(e) => {
 setIsMobileMenuOpen(false)
 if (role === 'guest') {
 e.preventDefault()
 window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode:"login" } }))
 }
 }}
 >
 <FileText className="w-5 h-5 text-slate-400" /> Hồ sơ CV
 </Link>
 <Link
 href="/companies"
 className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 font-medium text-slate-800"
 onClick={() => setIsMobileMenuOpen(false)}
 >
 <Building2 className="w-5 h-5 text-slate-400" /> Ban tổ chức
 </Link>
 <Link
 href="/chat"
 className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 font-medium text-slate-800"
 onClick={(e) => {
 setIsMobileMenuOpen(false)
 if (role === 'guest') {
 e.preventDefault()
 window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode:"login" } }))
 }
 }}
 >
 <MessageSquare className="w-5 h-5 text-slate-400" /> Trò chuyện
 </Link>
 </nav>
 </motion.div>
 )}
 </AnimatePresence>
 </>
 )
}
