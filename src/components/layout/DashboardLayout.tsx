"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import MenuDashboard from "@/components/layout/MenuDashboard"
import { Menu } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

export interface DashboardLayoutProps {
  children: React.ReactNode
  role?: "organizer" | "student"
  activeTab?: string
  setActiveTab?: (tab: string) => void
  activeItem?: string
  title?: string
  subtitle?: string
  isPremium?: boolean
  userProfile?: { fullName?: string; avatarUrl?: string; email?: string } | null
  avatarUrl?: string
  unreadCount?: number
  notificationCount?: number
  messageCount?: number
  searchQuery?: string
  setSearchQuery?: (query: string) => void
  onSearchSubmit?: (query: string) => void
  onPostJobClick?: () => void
  onNotificationClick?: () => void
  onLogout?: () => void
}

const orgTabInfo: Record<string, { title: string; subtitle: string }> = {
  "post-job": {
    title: "Đăng tin tuyển dụng",
    subtitle: "Cập nhật thông tin chi tiết để thu hút nhân sự phù hợp nhất",
  },
  "feed": {
    title: "Bảng điều khiển",
    subtitle: "Tổng quan hiệu suất tuyển dụng và các chiến dịch sự kiện của bạn",
  },
  "dashboard": {
    title: "Bảng điều khiển",
    subtitle: "Tổng quan hiệu suất tuyển dụng và các chiến dịch sự kiện của bạn",
  },
  "events": {
    title: "Quản lý tuyển dụng",
    subtitle: "Theo dõi, quản lý và chỉnh sửa các chiến dịch tuyển dụng đang hoạt động",
  },
  "recommended": {
    title: "Ứng viên gợi ý",
    subtitle: "Ứng viên được AI gợi ý phù hợp với yêu cầu sự kiện",
  },
  "reports": {
    title: "Báo cáo tuyển dụng",
    subtitle: "Số liệu phân tích chi tiết về hiệu quả ứng tuyển",
  },
  "services": {
    title: "Gói dịch vụ & VIP",
    subtitle: "Nâng cấp tài khoản để tiếp cận nhân sự chất lượng cao",
  },
  "chat": {
    title: "Tin nhắn",
    subtitle: "Kênh trao đổi trực tiếp với ứng viên và điều phối viên",
  },
  "message": {
    title: "Tin nhắn",
    subtitle: "Kênh trao đổi trực tiếp với ứng viên và điều phối viên",
  },
  "notification": {
    title: "Thông báo",
    subtitle: "Cập nhật tiến độ ứng tuyển và thông tin mới nhất từ hệ thống",
  },
  "notifications": {
    title: "Thông báo",
    subtitle: "Cập nhật tiến độ ứng tuyển và thông tin mới nhất từ hệ thống",
  },
  "account": {
    title: "Cài đặt tài khoản",
    subtitle: "Quản lý thông tin công ty, trạng thái xác thực và bảo mật",
  },
  "settings": {
    title: "Cài đặt tài khoản",
    subtitle: "Quản lý thông tin công ty, trạng thái xác thực và bảo mật",
  },
}

const studentTabInfo: Record<string, { title: string; subtitle: string }> = {
  "dashboard": {
    title: "Bảng điều khiển",
    subtitle: "Cập nhật thông tin đầy đủ giúp bạn nhận được cơ hội sự kiện phù hợp nhất",
  },
  "feed": {
    title: "Bảng điều khiển",
    subtitle: "Cập nhật thông tin đầy đủ giúp bạn nhận được cơ hội sự kiện phù hợp nhất",
  },
  "resume": {
    title: "Hồ sơ của tôi",
    subtitle: "Xây dựng hồ sơ năng lực và kỹ năng để ứng tuyển các sự kiện",
  },
  "cv": {
    title: "Hồ sơ của tôi",
    subtitle: "Xây dựng hồ sơ năng lực và kỹ năng để ứng tuyển các sự kiện",
  },
  "notification": {
    title: "Thông báo",
    subtitle: "Cập nhật tiến độ ứng tuyển và thông tin mới nhất từ Ban tổ chức",
  },
  "notifications": {
    title: "Thông báo",
    subtitle: "Cập nhật tiến độ ứng tuyển và thông tin mới nhất từ Ban tổ chức",
  },
  "message": {
    title: "Tin nhắn",
    subtitle: "Trò chuyện và kết nối trực tiếp với Nhà tuyển dụng sự kiện",
  },
  "chat": {
    title: "Tin nhắn",
    subtitle: "Trò chuyện và kết nối trực tiếp với Nhà tuyển dụng sự kiện",
  },
  "settings": {
    title: "Cài đặt tài khoản",
    subtitle: "Quản lý thông tin định danh cá nhân, thông số phục vụ sự kiện và bảo mật",
  },
  "account": {
    title: "Cài đặt tài khoản",
    subtitle: "Quản lý thông tin định danh cá nhân, thông số phục vụ sự kiện và bảo mật",
  },
  "activity": {
    title: "Hoạt động",
    subtitle: "Theo dõi trạng thái các sự kiện đã ứng tuyển, lưu và được mời",
  },
  "my-events": {
    title: "Hoạt động",
    subtitle: "Theo dõi trạng thái các sự kiện đã ứng tuyển, lưu và được mời",
  },
}

export default function DashboardLayout({
  children,
  role = "organizer",
  activeTab = "feed",
  setActiveTab,
  activeItem,
  title: customTitle,
  subtitle: customSubtitle,
  isPremium = false,
  userProfile,
  avatarUrl,
  unreadCount,
  notificationCount,
  messageCount,
  searchQuery = "",
  setSearchQuery,
  onSearchSubmit,
  onPostJobClick,
  onNotificationClick,
  onLogout,
}: DashboardLayoutProps) {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const isOrganizer = role === "organizer"
  const tabDict = isOrganizer ? orgTabInfo : studentTabInfo
  const currentTabKey = activeTab || activeItem || (isOrganizer ? "feed" : "dashboard")

  const defaultTabInfo = tabDict[currentTabKey] || {
    title: isOrganizer ? "Bảng điều khiển" : "Bảng điều khiển",
    subtitle: isOrganizer
      ? "Chào mừng bạn đến với Trung tâm Nhà tuyển dụng EventMate"
      : "Cập nhật thông tin đầy đủ giúp bạn nhận được cơ hội sự kiện phù hợp nhất",
  }

  const title = customTitle || defaultTabInfo.title
  const subtitle = customSubtitle || defaultTabInfo.subtitle

  const handleLogout = async () => {
    if (onLogout) {
      onLogout()
      return
    }
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-[#f3f5f7] dark:bg-zinc-950 flex text-[#282828] dark:text-zinc-100 font-sans antialiased">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Figma: Menu Dashboard) */}
      <div
        className={cn(
          "p-4 lg:p-6 shrink-0 lg:sticky lg:top-0 h-fit z-40 transition-all",
          isSidebarOpen ? "fixed lg:static left-0 top-0 bottom-0" : "hidden lg:block"
        )}
      >
        <MenuDashboard
          role={role}
          activeTab={activeTab}
          activeItem={activeItem || activeTab}
          setActiveTab={
            setActiveTab
              ? (tab) => {
                  setActiveTab(tab)
                  if (typeof window !== "undefined" && window.innerWidth < 1024) {
                    setIsSidebarOpen(false)
                  }
                }
              : undefined
          }
          notificationCount={notificationCount ?? unreadCount}
          messageCount={messageCount}
          isPremium={isPremium}
          onLogout={handleLogout}
          isCollapsed={!isSidebarOpen}
          onToggleCollapse={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen bg-[#f3f5f7] dark:bg-zinc-950 p-4 lg:p-6 lg:pl-0">
        {/* Mobile Hamburger Button */}
        <div className="lg:hidden flex items-center justify-between pb-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Mở menu điều hướng"
            className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 shadow-xs cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar w-full pr-1">
          <main className="w-full pb-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
