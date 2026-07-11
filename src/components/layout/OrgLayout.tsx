"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
  const router = useRouter()
  const navigate = (path: string) => router.push(path)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const menuItems = [
    { id: "feed", name: "Bảng tin", icon: LayoutDashboard },
    { id: "events", name: "Sự kiện", icon: FileText },
    { id: "candidates", name: "Quản lý hồ sơ", icon: Users },
    { id: "recommended", name: "Người tham gia đề xuất", icon: Sparkles, isPremiumLocked: !isPremium },
    { id: "reports", name: "Báo cáo tuyển nhân sự", icon: BarChart3, isPremiumLocked: !isPremium },
    { id: "services", name: "Mua dịch vụ", icon: ShoppingBag },
    { id: "chat", name: "Chat", icon: MessageSquare },
    { id: "account", name: "Tài khoản", icon: User }
  ]

  return (
    <div className="min-h-screen bg-background flex text-foreground">

      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-30 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 bottom-0 left-0 bg-card text-muted-foreground border-r border-border transition-all duration-300 z-40 flex flex-col shrink-0 h-screen
        ${isSidebarOpen ? "w-64 translate-x-0" : "w-20 lg:w-20 -translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="h-16 px-4 sm:px-6 border-b border-border flex items-center justify-between gap-2">
          {isSidebarOpen ? (
            <span
              onClick={() => navigate("/")}
              className="font-semibold text-base tracking-tight text-foreground cursor-pointer flex items-center gap-1.5 min-w-0"
            >
              <span className="truncate">Event<span className="text-slate-600">Mate</span></span>
              <span className="text-xs bg-muted text-muted-foreground font-medium px-1.5 py-0.5 rounded uppercase shrink-0">
                Recruiter
              </span>
            </span>
          ) : (
            <span
              onClick={() => navigate("/")}
              className="font-semibold text-lg text-slate-600 cursor-pointer mx-auto"
            >
              EM
            </span>
          )}

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label={isSidebarOpen ? "Thu gọn thanh bên" : "Mở rộng thanh bên"}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-slate-100 text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 shrink-0"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${!isSidebarOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Profile widget */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="relative shrink-0">
            <img
              src={userProfile?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=40&h=40&q=80"}
              alt="Avatar"
              className="w-10 h-10 rounded-lg object-cover border border-border"
            />
            {isPremium && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground p-0.5 rounded-full border border-card shadow-sm">
                <Crown className="w-3 h-3 fill-current text-primary-foreground" />
              </span>
            )}
          </div>
          {isSidebarOpen && (
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-foreground truncate">
                {userProfile?.fullName || "Nhà tuyển nhân sự"}
              </h4>
              <div className="flex items-center gap-1 mt-0.5">
                {isPremium ? (
                  <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 font-medium px-1.5 py-0.5 rounded border border-slate-200">
                    <Crown className="w-3 h-3" /> VIP
                  </span>
                ) : (
                  <span className="text-xs bg-muted text-muted-foreground font-medium px-1.5 py-0.5 rounded">
                    Thường
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Nav items */}
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
                aria-current={isActive ? "page" : undefined}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group
                ${isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-5 h-5 shrink-0 ${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"}`}
                  />
                  {isSidebarOpen && <span className="truncate">{item.name}</span>}
                </div>
                {item.isPremiumLocked && isSidebarOpen && (
                  <Lock
                    className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-primary-foreground/80" : "text-muted-foreground group-hover:text-foreground"}`}
                  />
                )}
              </button>
            )
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-border space-y-1">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Topbar */}
        <header className="sticky top-0 bg-card border-b border-border h-16 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Mở menu điều hướng"
              className="p-2 rounded-lg hover:bg-slate-100 text-muted-foreground lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>

            <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">
              {menuItems.find(i => i.id === activeTab)?.name || "Bảng quản trị"}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isPremium ? (
              <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium">
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Tài khoản VIP Tuyển nhân sự</span>
                <span className="sm:hidden">VIP</span>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab("services")}
                className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 border border-slate-200 hover:bg-primary hover:text-slate-900-foreground rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
              >
                <Crown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lên VIP Tuyển nhân sự</span>
                <span className="sm:hidden">Lên VIP</span>
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
