import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Search, FileText, Menu, X, Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const NavLink = ({ href, icon: Icon, label }: { href: string; icon: React.ComponentType<{ className?: string }>; label: string }) => {
    const location = useLocation()
    const isActive = location.pathname === href

    return (
        <Link
            to={href}
            className={cn(
                "group flex items-center gap-1.5 text-sm transition-all whitespace-nowrap px-4 py-2 rounded-full",
                isActive ? "text-emerald-600 bg-emerald-50/80 font-bold shadow-sm border border-emerald-100/50" : "font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            )}
        >
            <Icon className={cn("w-4 h-4", isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600")} />
            <span>{label}</span>
        </Link>
    )
}

const MobileThemeToggle = () => {
    const [isDark, setIsDark] = useState(false)

    useEffect(() => setIsDark(document.documentElement.classList.contains('dark')), [])

    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark')
        setIsDark(!isDark)
    }

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-emerald-600"
            aria-label="Toggle theme"
        >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
    )
}

export function NotchNavbar({ className, logo, rightActions, role }: { className?: string, logo?: React.ReactNode, rightActions?: React.ReactNode, role?: string }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const strokeColor = "stroke-slate-200"

    return (
        <>
            <header className={cn("fixed top-0 inset-x-0 z-50 h-[72px] flex px-0 drop-shadow-sm", className)}>

                <div className="flex-1 h-12 bg-white z-20 relative min-w-0 border-b border-slate-100">
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                        <line x1="0" y1="47.5" x2="100%" y2="47.5" className={strokeColor} strokeWidth={1} />
                    </svg>
                </div>

                <div className="flex h-[72px] relative z-10 w-full max-w-[650px] lg:max-w-[760px] shrink-0 -ml-px">

                    <div className="w-[50px] h-full relative shrink-0">
                        <div className="absolute inset-0 bg-white" style={{ clipPath: "path('M0 0 H50 V72 C25 72 25 48 0 48 Z')" }} />
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 50 72">
                            <path d="M0 47.5 C25 47.5 25 71.5 50 71.5" fill="none" className={strokeColor} strokeWidth={1} />
                        </svg>
                    </div>

                    <div className="flex-1 h-full relative min-w-0 -ml-px">
                        <div className="absolute inset-0 bg-white">
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                                <line x1="0" y1="71.5" x2="100%" y2="71.5" className={strokeColor} strokeWidth={1} />
                            </svg>
                        </div>

                        <div className="relative w-full h-full flex items-center justify-between px-2 sm:px-4 pt-3 pb-1">

                            {/* Đã dọn dẹp: CHỈ GIỮ LẠI VIỆC LÀM & HỒ SƠ CV */}
                            <div className="flex-1 flex justify-start pl-0 md:pl-2">
                                <nav className="hidden md:flex items-center gap-0 lg:gap-2">
                                    {role === "student" && (
                                        <>
                                            <NavLink href="/jobs" icon={Search} label="Việc làm" />
                                            <NavLink href="/cv" icon={FileText} label="Hồ sơ CV" />
                                        </>
                                    )}
                                </nav>
                                <button
                                    className="md:hidden p-2 text-slate-500 hover:text-slate-900 transition-colors"
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                >
                                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                                </button>
                            </div>

                            <div className="flex-shrink-0 mx-2 sm:mx-4 flex justify-center z-30">
                                {logo}
                            </div>

                            <div className="flex-1 flex justify-end items-center pr-1 md:pr-3">
                                <div className="flex items-center gap-2 sm:gap-4">
                                    <MobileThemeToggle />
                                    {rightActions}
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="w-[50px] h-full relative shrink-0 -ml-px">
                        <div className="absolute inset-0 bg-white" style={{ clipPath: "path('M0 0 H50 V48 C25 48 25 72 0 72 Z')" }} />
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 50 72">
                            <path d="M0 71.5 C25 71.5 25 47.5 50 47.5" fill="none" className={strokeColor} strokeWidth={1} />
                        </svg>
                    </div>

                </div>

                <div className="flex-1 h-12 bg-white z-20 relative min-w-0 -ml-px border-b border-slate-100">
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
                        className="fixed inset-x-0 top-[72px] z-40 bg-white border-b border-slate-100 p-4 md:hidden shadow-md rounded-b-2xl"
                    >
                        <nav className="flex flex-col gap-1">
                            <Link to="/jobs" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 font-bold text-slate-800" onClick={() => setIsMobileMenuOpen(false)}>
                                <Search className="w-5 h-5 text-slate-400" /> Việc làm sự kiện
                            </Link>
                            <Link to="/cv" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 font-bold text-slate-800" onClick={() => setIsMobileMenuOpen(false)}>
                                <FileText className="w-5 h-5 text-slate-400" /> Hồ sơ CV của tôi
                            </Link>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}