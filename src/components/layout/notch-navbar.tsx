import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Search, FileText, Menu, X, ChevronDown, Bookmark, Briefcase, Building2, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"

const NavLink = ({ href, icon: Icon, label, onClick }: { href: string; icon: React.ComponentType<{ className?: string }>; label: string; onClick?: (e: React.MouseEvent) => void }) => {
    const location = useLocation()
    const currentPathWithSearch = location.pathname + location.search
    const isActive = href.includes("?")
        ? currentPathWithSearch === href || (href.includes("tab=events") && !location.search.includes("tab="))
        : location.pathname === href

    return (
        <Link
            to={href}
            onClick={onClick}
            className={cn(
                "group flex items-center gap-1.5 text-sm transition-all whitespace-nowrap px-3 sm:px-4 py-2 rounded-full",
                isActive ? "text-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/20 font-bold shadow-sm border border-emerald-100/50 dark:border-emerald-900/30" : "font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/40"
            )}
        >
            <Icon className={cn("w-4 h-4", isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-650")} />
            <span className="hidden sm:inline-block">{label}</span>
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
            window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode: "login" } }))
        }
    }

    const [positions, setPositions] = useState<{ name: string; slug: string }[]>([])
    const [categories, setCategories] = useState<{ name: string; slug: string }[]>([])

    useEffect(() => {
        const loadDbData = async () => {
            const { data: posData } = await supabase.from('job_positions').select('name, slug').order('name', { ascending: true })
            if (posData && posData.length > 0) {
                setPositions(posData.map(p => ({ name: p.name, slug: p.slug || p.name })))
            }
            const { data: catData } = await supabase.from('event_categories').select('name, slug').order('name', { ascending: true })
            if (catData && catData.length > 0) {
                setCategories(catData.map(c => ({ name: c.name, slug: c.slug || c.name })))
            }
        }
        loadDbData()
    }, [])

    return (
        <div className="group relative">
            <button className="flex items-center gap-1.5 text-sm transition-all whitespace-nowrap px-3 sm:px-4 py-2 rounded-full font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50">
                <span className="hidden sm:inline-block">Việc làm</span>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:rotate-180 transition-transform duration-300" />
            </button>

            <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 w-[800px] z-[100] translate-y-2 group-hover:translate-y-0">
                <div className="bg-white rounded-[2rem] shadow-2xl border-2 border-slate-100 p-8 grid grid-cols-12 gap-10 relative overflow-hidden">

                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3 opacity-70"></div>

                    {/* CỘT 1: QUẢN LÝ VIỆC LÀM */}
                    <div className="col-span-4 space-y-8">
                        <div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Quản lý Việc làm</h4>
                            <div className="space-y-1">
                                <Link to="/" className="flex items-center gap-3 text-sm font-bold text-slate-700 hover:text-emerald-600 transition-colors p-2.5 -ml-2 rounded-xl hover:bg-emerald-50 group/item">
                                    <Search className="w-5 h-5 text-emerald-500 group-hover/item:scale-110 transition-transform" /> Tìm việc sự kiện
                                </Link>
                                {/* ĐÃ CẬP NHẬT: Gắn parameter ?filter=saved vào link dưới đây */}
                                <Link to="/saved" onClick={handleProtectedLink} className="flex items-center gap-3 text-sm font-bold text-slate-700 hover:text-emerald-600 transition-colors p-2.5 -ml-2 rounded-xl hover:bg-emerald-50 group/item">
                                    <Bookmark className="w-5 h-5 text-slate-400 group-hover/item:text-emerald-500 group-hover/item:scale-110 transition-all" /> Việc làm đã lưu
                                </Link>
                                <Link to="/my-jobs" onClick={handleProtectedLink} className="flex items-center gap-3 text-sm font-bold text-slate-700 hover:text-emerald-650 transition-colors p-2.5 -ml-2 rounded-xl hover:bg-emerald-50 group/item">
                                    <Briefcase className="w-5 h-5 text-slate-400 group-hover/item:text-emerald-500 group-hover/item:scale-110 transition-all" /> Việc làm đã ứng tuyển
                                </Link>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Ban Tổ Chức</h4>
                            <Link to="/companies" className="flex items-center gap-3 text-sm font-bold text-slate-700 hover:text-emerald-600 transition-colors p-2.5 -ml-2 rounded-xl hover:bg-emerald-50 group/item">
                                <Building2 className="w-5 h-5 text-slate-400 group-hover/item:text-emerald-500 group-hover/item:scale-110 transition-all" /> Danh sách Ban tổ chức
                            </Link>
                        </div>
                    </div>

                    {/* CỘT 2: THEO VỊ TRÍ */}
                    <div className="col-span-4 border-l border-slate-100 pl-6">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">Việc làm theo vị trí</h4>
                        <div className="space-y-4">
                            {positions.map(item => (
                                <Link key={item.slug} to={`/positions/${item.slug}`} className="block text-sm font-medium text-slate-600 hover:text-emerald-600 hover:translate-x-1 hover:font-bold transition-all">
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* CỘT 3: THEO LOẠI SỰ KIỆN */}
                    <div className="col-span-4 border-l border-slate-100 pl-6">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">Việc làm theo sự kiện</h4>
                        <div className="space-y-4">
                            {categories.map(item => (
                                <Link key={item.slug} to={`/events/${item.slug}`} className="block text-sm font-medium text-slate-600 hover:text-emerald-600 hover:translate-x-1 hover:font-bold transition-all">
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
    const strokeColor = "stroke-slate-200 dark:stroke-slate-800"

    return (
        <>
            <header className={cn("fixed top-0 inset-x-0 z-50 h-[72px] flex px-0 drop-shadow-sm", className)}>
                <div className="flex-1 h-12 bg-white dark:bg-slate-900 z-20 relative min-w-0 border-b border-slate-100 dark:border-slate-800/80">
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                        <line x1="0" y1="47.5" x2="100%" y2="47.5" className={strokeColor} strokeWidth={1} />
                    </svg>
                </div>

                <div className="flex h-[72px] relative z-10 w-fit max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[80vw] shrink-0 -ml-px">
                    <div className="w-[50px] h-full relative shrink-0">
                        <div className="absolute inset-0 bg-white dark:bg-slate-900" style={{ clipPath: "path('M0 0 H50 V72 C25 72 25 48 0 48 Z')" }} />
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 50 72">
                            <path d="M0 47.5 C25 47.5 25 71.5 50 71.5" fill="none" className={strokeColor} strokeWidth={1} />
                        </svg>
                    </div>

                    <div className="flex-1 h-full relative min-w-0 -ml-px">
                        <div className="absolute inset-0 bg-white dark:bg-slate-900">
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                                <line x1="0" y1="71.5" x2="100%" y2="71.5" className={strokeColor} strokeWidth={1} />
                            </svg>
                        </div>

                        <div className="relative w-full h-full flex items-center justify-between px-1 sm:px-4 pt-3 pb-1">
                            <div className="flex-1 flex justify-start pl-0 md:pl-2">
                                <nav className="hidden md:flex items-center gap-0 lg:gap-1">
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
                                                        window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode: "login" } }))
                                                    }
                                                }}
                                            />
                                        </>
                                    )}
                                </nav>
                                <button
                                    className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                >
                                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                                </button>
                            </div>

                            <div className="flex-shrink-0 mx-2 sm:mx-4 flex justify-center z-30">
                                {logo}
                            </div>

                            <div className="flex-1 flex justify-end items-center pr-1 md:pr-2">
                                <div className="flex items-center gap-1.5 sm:gap-3">
                                    {rightActions}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-[50px] h-full relative shrink-0 -ml-px">
                        <div className="absolute inset-0 bg-white dark:bg-slate-900" style={{ clipPath: "path('M0 0 H50 V48 C25 48 25 72 0 72 Z')" }} />
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 50 72">
                            <path d="M0 71.5 C25 71.5 25 47.5 50 47.5" fill="none" className={strokeColor} strokeWidth={1} />
                        </svg>
                    </div>
                </div>

                <div className="flex-1 h-12 bg-white dark:bg-slate-900 z-20 relative min-w-0 -ml-px border-b border-slate-100 dark:border-slate-800/80">
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                        <line x1="0" y1="47.5" x2="100%" y2="47.5" className={strokeColor} strokeWidth={1} />
                    </svg>
                </div>
            </header>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="fixed inset-x-0 top-[72px] z-40 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-4 md:hidden shadow-md rounded-b-2xl"
                    >
                        <nav className="flex flex-col gap-1">
                            <Link to="/" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-slate-800 dark:text-slate-200" onClick={() => setIsMobileMenuOpen(false)}>
                                <Search className="w-5 h-5 text-slate-400" /> Việc làm sự kiện
                            </Link>
                            <Link
                                to="/cv"
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-slate-800 dark:text-slate-200"
                                onClick={(e) => {
                                    setIsMobileMenuOpen(false)
                                    if (role === 'guest') {
                                        e.preventDefault()
                                        window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode: "login" } }))
                                    }
                                }}
                            >
                                <FileText className="w-5 h-5 text-slate-400" /> Hồ sơ CV của tôi
                            </Link>
                            <Link
                                to="/chat"
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-slate-800 dark:text-slate-200"
                                onClick={(e) => {
                                    setIsMobileMenuOpen(false)
                                    if (role === 'guest') {
                                        e.preventDefault()
                                        window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode: "login" } }))
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