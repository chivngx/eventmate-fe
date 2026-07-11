"use client"

import { useState } from"react"
import { useRouter } from"next/navigation"
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
} from"lucide-react"

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
 const router = useRouter()
 const navigate = (path: string) => router.push(path)
 const [isSidebarOpen, setIsSidebarOpen] = useState(true)

 const menuItems = [
 { id:"feed", name:"Bảng tin", icon: LayoutDashboard },
 { id:"events", name:"Tin tuyển dụng", icon: FileText },
 { id:"candidates", name:"Quản lý CV", icon: Users },
 { id:"recommended", name:"CV đề xuất", icon: Sparkles, isPremiumLocked: !isPremium },
 { id:"reports", name:"Báo cáo tuyển dụng", icon: BarChart3, isPremiumLocked: !isPremium },
 { id:"services", name:"Mua dịch vụ", icon: ShoppingBag },
 { id:"chat", name:"Chat", icon: MessageSquare },
 { id:"account", name:"Tài khoản", icon: User }
 ]

 return (
 <div className="min-h-screen bg-background flex text-foreground transition-colors duration-200">

 {/* BACKGROUND BACKDROP FOR MOBILE SIDEBAR */}
 {isSidebarOpen && (
 <div
 onClick={() => setIsSidebarOpen(false)}
 className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
 />
 )}

 {/* LEFT SIDEBAR */}
 <aside
 className={`fixed lg:sticky top-0 bottom-0 left-0 bg-card text-muted-foreground border-r border-border transition-all duration-300 z-40 flex flex-col shrink-0 h-screen
 ${isSidebarOpen ?"w-64 translate-x-0" :"w-20 lg:w-20 -translate-x-full lg:translate-x-0"}
 `}
 >
 {/* LOGO AREA */}
 <div className="h-16 px-6 border-b border-border flex items-center justify-between">
 {(isSidebarOpen) ? (
 <span
 onClick={() => navigate('/')}
 className="font-black text-lg tracking-tight text-foreground cursor-pointer flex items-center gap-1.5"
 >
 Event<span className="text-primary">Mate</span>
 <span className="text-[10px] bg-muted text-muted-foreground font-bold px-1.5 py-0.5 rounded uppercase">Recruiter</span>
 </span>
 ) : (
 <span
 onClick={() => navigate('/')}
 className="font-black text-xl text-primary cursor-pointer mx-auto"
 >
 EM
 </span>
 )}

 <button
 onClick={() => setIsSidebarOpen(!isSidebarOpen)}
 aria-label={isSidebarOpen ?"Thu gọn thanh bên" :"Mở rộng thanh bên"}
 className="hidden lg:flex p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
 >
 <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${!isSidebarOpen ?"rotate-180" :""}`} />
 </button>
 </div>

 {/* PROFILE WIDGET */}
 <div className="p-4 border-b border-border flex items-center gap-3">
 <div className="relative shrink-0">
 <img
 src={userProfile?.avatarUrl ||"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=40&h=40&q=80"}
 alt="Avatar"
 className="w-10 h-10 rounded-xl object-cover border border-border"
 />
 {isPremium && (
 <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground p-0.5 rounded-full border border-card shadow-sm">
 <Crown className="w-3 h-3 fill-current text-primary-foreground" />
 </span>
 )}
 </div>
 {(isSidebarOpen) && (
 <div className="min-w-0 flex-1">
 <h4 className="text-sm font-black text-foreground truncate">{userProfile?.fullName ||"Nhà tuyển dụng"}</h4>
 <div className="flex items-center gap-1 mt-0.5">
 {isPremium ? (
 <span className="text-[10px] bg-accent text-primary font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5 border border-primary/20">
 <Crown className="w-2.5 h-2.5" /> VIP
 </span>
 ) : (
 <span className="text-[10px] bg-muted text-muted-foreground font-bold px-1.5 py-0.2 rounded">
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
 className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold transition-all group
 ${isActive
 ?"bg-primary text-primary-foreground shadow-md"
 :"text-muted-foreground hover:bg-accent hover:text-foreground"
 }
 `}
 >
 <div className="flex items-center gap-3">
 <Icon className={`w-5 h-5 shrink-0 ${isActive ?"text-primary-foreground" :"text-muted-foreground group-hover:text-foreground"}`} />
 {(isSidebarOpen) && <span>{item.name}</span>}
 </div>
 {item.isPremiumLocked && (isSidebarOpen) && (
 <Lock className="w-3.5 h-3.5 text-muted-foreground group-hover:text-amber-500" />
 )}
 </button>
 )
 })}
 </nav>

 {/* FOOTER ACTIONS */}
 <div className="p-3 border-t border-border space-y-1">
 <button
 onClick={onLogout}
 className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-destructive hover:bg-destructive/10 transition-colors"
 >
 <LogOut className="w-5 h-5 shrink-0" />
 {(isSidebarOpen) && <span>Đăng xuất</span>}
 </button>
 </div>
 </aside>

 {/* RIGHT SIDE MAIN CONTAINER */}
 <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
 {/* HEADER BAR */}
 <header className="sticky top-0 bg-card border-b border-border h-16 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
 <div className="flex items-center gap-3 min-w-0">
 <button
 onClick={() => setIsSidebarOpen(!isSidebarOpen)}
 aria-label="Mở menu điều hướng"
 className="p-2 rounded-lg hover:bg-accent text-muted-foreground lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 shrink-0"
 >
 <Menu className="w-5 h-5" />
 </button>

 <h2 className="text-lg font-black text-foreground hidden sm:block truncate">
 {menuItems.find(i => i.id === activeTab)?.name ||"Bảng quản trị"}
 </h2>
 </div>

 <div className="flex items-center gap-3 shrink-0">
 {/* Quick status message */}
 {isPremium ? (
 <div className="bg-accent text-primary border border-primary/20 rounded-lg px-3 py-1 text-xs font-bold flex items-center gap-1.5">
 <Crown className="w-3.5 h-3.5 fill-current" /> Tài khoản VIP Tuyển dụng
 </div>
 ) : (
 <button
 onClick={() => setActiveTab("services")}
 className="bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 rounded-lg px-3 py-1 text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
 >
 👑 Lên VIP Tuyển dụng
 </button>
 )}
 </div>
 </header>

 {/* CONTAINER CONTENT */}
 <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
 {children}
 </main>
 </div>

 </div>
 )
}
