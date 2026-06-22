import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
    LayoutDashboard,
    FileText,
    Users,
    Sparkles,
    BarChart3,
    ShoppingBag,
    MessageSquare,
    User,
    LogOut,
    ChevronLeft,
    Menu,
    Lock,
    Crown
} from "lucide-react"

interface OrgLayoutProps {
    children: React.ReactNode
    activeTab: string
    setActiveTab: (tab: string) => void
    isPremium: boolean
    userProfile: { fullName: string; avatarUrl: string; email: string } | null
    onLogout: () => void
}

export default function OrgLayout({
    children,
    activeTab,
    setActiveTab,
    isPremium,
    userProfile,
    onLogout
}: OrgLayoutProps) {
    const navigate = useNavigate()
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

    const menuItems = [
        { id: "feed", name: "Bảng tin", icon: LayoutDashboard },
        { id: "events", name: "Tin tuyển dụng", icon: FileText },
        { id: "candidates", name: "Quản lý CV", icon: Users },
        { id: "recommended", name: "CV đề xuất", icon: Sparkles, isPremiumLocked: !isPremium },
        { id: "reports", name: "Báo cáo tuyển dụng", icon: BarChart3, isPremiumLocked: !isPremium },
        { id: "services", name: "Mua dịch vụ", icon: ShoppingBag },
        { id: "chat", name: "Chat", icon: MessageSquare },
        { id: "account", name: "Tài khoản", icon: User }
    ]

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex text-slate-900 dark:text-slate-100 transition-colors duration-200">

            {/* BACKGROUND BACKDROP FOR MOBILE SIDEBAR */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
                />
            )}

            {/* LEFT SIDEBAR */}
            <aside
                className={`fixed lg:sticky top-0 bottom-0 left-0 bg-white text-slate-700 border-r border-slate-200/80 transition-all duration-300 z-40 flex flex-col shrink-0 h-screen
          ${isSidebarOpen ? "w-64 translate-x-0" : "w-20 lg:w-20 -translate-x-full lg:translate-x-0"}
        `}
            >
                {/* LOGO AREA */}
                <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
                    {(isSidebarOpen) ? (
                        <span
                            onClick={() => navigate('/')}
                            className="font-black text-lg tracking-tight text-slate-900 cursor-pointer flex items-center gap-1.5"
                        >
                            Event<span className="text-emerald-600">Mate</span>
                            <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase">Recruiter</span>
                        </span>
                    ) : (
                        <span
                            onClick={() => navigate('/')}
                            className="font-black text-xl text-emerald-600 cursor-pointer mx-auto"
                        >
                            EM
                        </span>
                    )}

                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="hidden lg:flex p-1.5 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors"
                    >
                        <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${!isSidebarOpen ? "rotate-180" : ""}`} />
                    </button>
                </div>

                {/* PROFILE WIDGET */}
                <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="relative shrink-0">
                        <img
                            src={userProfile?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=40&h=40&q=80"}
                            alt="Avatar"
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                        />
                        {isPremium && (
                            <span className="absolute -top-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full border border-white shadow">
                                <Crown className="w-3 h-3 fill-current text-white" />
                            </span>
                        )}
                    </div>
                    {(isSidebarOpen) && (
                        <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-black text-slate-800 truncate">{userProfile?.fullName || "Nhà tuyển dụng"}</h4>
                            <div className="flex items-center gap-1 mt-0.5">
                                {isPremium ? (
                                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5 border border-emerald-100">
                                        <Crown className="w-2.5 h-2.5" /> VIP
                                    </span>
                                ) : (
                                    <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.2 rounded">
                                        Thường
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* SIDEBAR NAVIGATION ITEMS */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        const isActive = activeTab === item.id
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id)
                                    // On mobile, close sidebar on tap
                                    if (window.innerWidth < 1024) {
                                        setIsSidebarOpen(false)
                                    }
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all group
                  ${isActive
                                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-650/20"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    }
                `}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`} />
                                    {(isSidebarOpen) && <span>{item.name}</span>}
                                </div>
                                {item.isPremiumLocked && (isSidebarOpen) && (
                                    <Lock className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500" />
                                )}
                            </button>
                        )
                    })}
                </nav>

                {/* FOOTER ACTIONS */}
                <div className="p-3 border-t border-slate-100 space-y-1">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                        <LogOut className="w-5 h-5 shrink-0" />
                        {(isSidebarOpen) && <span>Đăng xuất</span>}
                    </button>
                </div>
            </aside>

            {/* RIGHT SIDE MAIN CONTAINER */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
                {/* HEADER BAR */}
                <header className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 px-6 flex items-center justify-between shrink-0 z-20">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 lg:hidden"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 hidden sm:block">
                            {menuItems.find(i => i.id === activeTab)?.name || "Bảng quản trị"}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Quick status message */}
                        {isPremium ? (
                            <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 rounded-xl px-3 py-1 text-xs font-bold flex items-center gap-1.5">
                                <Crown className="w-3.5 h-3.5 fill-current" /> Tài khoản VIP Tuyển dụng
                            </div>
                        ) : (
                            <button
                                onClick={() => setActiveTab("services")}
                                className="bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 border border-amber-200 dark:border-amber-900/50 rounded-xl px-3 py-1 text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
                            >
                                👑 Lên VIP Tuyển dụng
                            </button>
                        )}
                    </div>
                </header>

                {/* CONTAINER CONTENT */}
                <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
                    {children}
                </main>
            </div>

        </div>
    )
}
