"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Menu,
  Heart,
  Briefcase,
  CalendarDays,
  Sparkles,
  LayoutDashboard,
  Plus,
  ArrowRight,
  BookOpen,
  LogIn,
  UserPlus,
  LogOut,
  User,
  MessageCircle,
  ChevronDown,
} from "lucide-react"
import { cn, isOrganizerRole } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { EventMateLogoIcon } from "@/components/common/EventMateLogo"
import NotificationDropdown from "./NotificationDropdown"
import JobseekerProfileDropdown from "./JobseekerProfileDropdown"
import { useAuthModal } from "@/components/providers/AuthModalProvider"

export interface NotchNavbarProps {
  className?: string
  variant?: "standard" | "floating"
  logo?: React.ReactNode
  rightActions?: React.ReactNode
  role?: string
  isEmployer?: boolean
  isHeroNavbar?: boolean
  notifications?: any[]
  unreadCount?: number
  markAsRead?: () => Promise<void>
  avatarUrl?: string
  fullName?: string
  email?: string
  handleLogout?: () => Promise<void>
  user?: any
}

export function NotchNavbar({
  className,
  logo,
  rightActions,
  role,
  isEmployer = false,
  isHeroNavbar = false,
  notifications = [],
  unreadCount = 0,
  markAsRead = async () => { },
  avatarUrl,
  fullName,
  email,
  handleLogout = async () => { },
  user,
}: NotchNavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { openLogin, openRegister } = useAuthModal()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const isGuest = role === "guest" || (!role && !user && !rightActions)
  const isAdmin = !isGuest && role === "admin"
  const isOrg = !isGuest && !isAdmin && Boolean(isEmployer || isOrganizerRole(role))
  const isStudent = !isGuest && !isAdmin && !isOrg

  // Track window scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Auto-close mobile menu when resizing back to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Active state checkers
  const isAdminActive = pathname?.startsWith("/admin")
  const isFindJobActive = pathname?.startsWith("/events") || pathname?.startsWith("/jobs")
  const isMyEventsActive = pathname?.startsWith("/my-events")
  const isBlogActive = pathname?.startsWith("/blog")
  const isDashboardActive = pathname === "/dashboard" || pathname?.startsWith("/dashboard?")
  const isManageEventsActive = pathname?.startsWith("/manage-events")
  const isPricingActive = pathname?.startsWith("/pricing")

  const getNavLinkClass = (isActive: boolean) =>
    cn(
      "text-[14px] font-medium transition-all px-3.5 py-1.5 rounded-lg whitespace-nowrap",
      isActive
        ? "text-slate-950 font-semibold bg-slate-100/90 shadow-2xs"
        : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
    )

  const handleSavedClick = () => {
    if (isGuest) {
      window.dispatchEvent(
        new CustomEvent("open-auth-modal", {
          detail: { message: "Vui lòng đăng nhập để xem danh sách việc làm đã lưu" },
        })
      )
    } else {
      router.push("/my-events?tab=saved")
    }
  }

  const handleContactClick = () => {
    window.dispatchEvent(new CustomEvent("open-floating-chat"))
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full h-[68px] select-none transition-all duration-200",
          isScrolled
            ? "bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-2xs text-gray-900"
            : "bg-white border-b border-gray-100/90 text-gray-900",
          className
        )}
      >
        <div className="max-w-[1240px] mx-auto w-full h-full px-4 sm:px-6 xl:px-8 flex items-center justify-between gap-4">
          {/* Left: Hamburger (☰) + Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Hamburger Button (Mobile / Tablet only) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="size-9 rounded-lg flex lg:hidden items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/70 transition-colors cursor-pointer"
              aria-label="Menu"
              title="Menu"
            >
              <Menu className="size-5" />
            </button>

            {/* Logo */}
            {logo ? (
              logo
            ) : (
              <Link
                href={isAdmin ? "/admin" : "/"}
                className="flex items-center gap-2.5 h-10 px-1 focus:outline-none transition-transform hover:opacity-90 active:scale-98"
                aria-label="EventMate Home"
              >
                <EventMateLogoIcon size={30} variant="mint" className="rounded-lg shadow-2xs" />
                <span className="font-bold text-xl tracking-tight text-slate-900 hidden sm:inline font-heading">
                  EventMate
                </span>
              </Link>
            )}
          </div>

          {/* Center: Nav Links */}
          <nav className="hidden lg:flex items-center justify-center gap-1 xl:gap-2">
            {isOrg ? (
              <>
                <Link
                  href="/dashboard"
                  className={getNavLinkClass(Boolean(isDashboardActive))}
                >
                  Bảng điều khiển
                </Link>
                <Link
                  href="/dashboard/manage-events"
                  className={getNavLinkClass(Boolean(isManageEventsActive))}
                >
                  Quản lý sự kiện
                </Link>
                <Link
                  href="/pricing"
                  className={getNavLinkClass(Boolean(isPricingActive))}
                >
                  Bảng giá
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/events"
                  className={getNavLinkClass(Boolean(isFindJobActive))}
                >
                  Việc làm
                </Link>
                {isStudent ? (
                  <Link
                    href="/my-events"
                    className={getNavLinkClass(Boolean(isMyEventsActive))}
                  >
                    Sự kiện của tôi
                  </Link>
                ) : (
                  <Link
                    href="/pricing"
                    className={getNavLinkClass(Boolean(isPricingActive))}
                  >
                    Bảng giá
                  </Link>
                )}
                <Link
                  href="/blog"
                  className={getNavLinkClass(Boolean(isBlogActive))}
                >
                  Cẩm nang
                </Link>
              </>
            )}
          </nav>

          {/* Right: Actions (Heart, Bell, Quản lý tin / Đăng nhập, Đăng tuyển, Profile) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Heart / Tin đã lưu icon (Chỉ hiện khi đã đăng nhập với vai trò Student) */}
            {isStudent && (
              <button
                type="button"
                onClick={handleSavedClick}
                className="size-9 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer"
                title="Tin đã lưu"
                aria-label="Tin đã lưu"
              >
                <Heart className="size-4.5" />
              </button>
            )}

            {/* Notification Bell (Chỉ hiện khi đã đăng nhập) */}
            {!isGuest && (
              <NotificationDropdown
                notifications={notifications}
                unreadCount={unreadCount}
                markAsRead={markAsRead}
                triggerClassName="size-9 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center transition-colors cursor-pointer"
              />
            )}

            {/* Middle Action: "Đăng nhập" (for guest) or "Quản lý tin" (for user) */}
            {isGuest ? (
              <button
                type="button"
                onClick={() => openLogin({ role: isEmployer ? "organizer" : "student" })}
                className="h-9 px-4 rounded-lg flex items-center justify-center font-medium text-[13.5px] border border-gray-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                Đăng nhập
              </button>
            ) : isOrg ? (
              <Link
                href="/dashboard/manage-events"
                className="hidden sm:flex h-9 px-4 rounded-lg items-center justify-center font-medium text-[13.5px] border border-gray-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                Quản lý tin
              </Link>
            ) : null}

            {/* Primary Action Button: "Đăng tuyển" (Hidden for Student) */}
            {!isStudent && (
              isGuest ? (
                <button
                  type="button"
                  onClick={() => openRegister({ role: "organizer" })}
                  className="h-9 px-4.5 rounded-lg flex items-center justify-center gap-1.5 font-semibold text-[13.5px] bg-gradient-to-r from-[#0D9488] to-[#14B8A6] hover:from-[#0F766E] hover:to-[#0D9488] text-white shadow-sm shadow-teal-500/20 active:scale-98 transition-all whitespace-nowrap cursor-pointer"
                >
                  <span>Đăng tuyển</span>
                  <ArrowRight className="size-3.5" />
                </button>
              ) : (
                <Link
                  href="/dashboard/post-job"
                  className="h-9 px-4.5 rounded-lg flex items-center justify-center gap-1.5 font-semibold text-[13.5px] bg-gradient-to-r from-[#0D9488] to-[#14B8A6] hover:from-[#0F766E] hover:to-[#0D9488] text-white shadow-sm shadow-teal-500/20 active:scale-98 transition-all whitespace-nowrap cursor-pointer"
                >
                  <span>Đăng tuyển</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              )
            )}

            {/* Profile Avatar Dropdown (only when logged in) */}
            {!isGuest && (
              <JobseekerProfileDropdown
                avatarUrl={avatarUrl}
                fullName={fullName}
                email={email}
                role={role}
                isEmployer={isOrg}
                navigate={(path) => router.push(path)}
                handleLogout={handleLogout}
                triggerClassName="rounded-lg h-9 pl-1 pr-2 border-slate-200/80"
              />
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-3 sm:inset-x-6 top-[72px] z-50 max-w-[1240px] mx-auto bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.12)] overflow-hidden max-h-[calc(100vh-96px)] overflow-y-auto"
          >
            <div className="p-4 sm:p-5 flex flex-col gap-3">
              {/* Mobile Role Banner / Status */}
              <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <EventMateLogoIcon size={24} variant="mint" />
                  <span className="font-semibold text-sm text-slate-800">EventMate</span>
                </div>
                {isAdmin ? (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200/60">
                    Quản trị viên
                  </span>
                ) : isOrg ? (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200">
                    Nhà tuyển dụng
                  </span>
                ) : !isGuest ? (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-50 text-teal-800 border border-teal-200/60">
                    Ứng viên
                  </span>
                ) : null}
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-1">
                {isAdmin ? (
                  <>
                    <Link
                      href="/admin"
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg font-medium text-sm transition-colors",
                        isAdminActive ? "bg-slate-900 text-white font-semibold" : "text-slate-700 hover:bg-slate-100"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="size-4 shrink-0 text-purple-500" />
                      <span>Quản trị hệ thống</span>
                    </Link>
                    <Link
                      href="/events"
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg font-medium text-sm transition-colors",
                        isFindJobActive ? "bg-slate-900 text-white font-semibold" : "text-slate-700 hover:bg-slate-100"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Briefcase className="size-4 shrink-0" />
                      <span>Việc làm</span>
                    </Link>
                    <Link
                      href="/blog"
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg font-medium text-sm transition-colors",
                        isBlogActive ? "bg-slate-900 text-white font-semibold" : "text-slate-700 hover:bg-slate-100"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <BookOpen className="size-4 shrink-0" />
                      <span>Cẩm nang</span>
                    </Link>
                  </>
                ) : isOrg ? (
                  <>
                    <Link
                      href="/dashboard"
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg font-medium text-sm transition-colors",
                        isDashboardActive ? "bg-slate-900 text-white font-semibold" : "text-slate-700 hover:bg-slate-100"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="size-4 shrink-0 text-zinc-900" />
                      <span>Bảng điều khiển</span>
                    </Link>
                    <Link
                      href="/dashboard/post-job"
                      className="flex items-center gap-3 p-3 rounded-lg font-medium text-sm text-teal-800 bg-teal-50/60 hover:bg-teal-50 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Plus className="size-4 shrink-0 text-[#0D9488]" />
                      <span>Đăng tin tuyển dụng mới</span>
                    </Link>
                    <Link
                      href="/dashboard/manage-events"
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg font-medium text-sm transition-colors",
                        isManageEventsActive ? "bg-slate-900 text-white font-semibold" : "text-slate-700 hover:bg-slate-100"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Briefcase className="size-4 shrink-0" />
                      <span>Quản lý sự kiện</span>
                    </Link>
                    <Link
                      href="/pricing"
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg font-medium text-sm transition-colors",
                        isPricingActive ? "bg-slate-900 text-white font-semibold" : "text-slate-700 hover:bg-slate-100"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Sparkles className="size-4 shrink-0 text-teal-400" />
                      <span>Bảng giá & Dịch vụ VIP</span>
                    </Link>
                  </>
                ) : isStudent ? (
                  <>
                    <Link
                      href="/events"
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg font-medium text-sm transition-colors",
                        isFindJobActive ? "bg-slate-900 text-white font-semibold" : "text-slate-700 hover:bg-slate-100"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Briefcase className="size-4 shrink-0" />
                      <span>Việc làm sự kiện</span>
                    </Link>
                    <Link
                      href="/my-events"
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg font-medium text-sm transition-colors",
                        isMyEventsActive ? "bg-slate-900 text-white font-semibold" : "text-slate-700 hover:bg-slate-100"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <CalendarDays className="size-4 shrink-0 text-[#0D9488]" />
                      <span>Sự kiện của tôi</span>
                    </Link>
                    <Link
                      href="/blog"
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg font-medium text-sm transition-colors",
                        isBlogActive ? "bg-slate-900 text-white font-semibold" : "text-slate-700 hover:bg-slate-100"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <BookOpen className="size-4 shrink-0" />
                      <span>Cẩm nang</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/events"
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg font-medium text-sm transition-colors",
                        isFindJobActive ? "bg-slate-900 text-white font-semibold" : "text-slate-700 hover:bg-slate-100"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Briefcase className="size-4 shrink-0" />
                      <span>Việc làm sự kiện</span>
                    </Link>
                    <Link
                      href="/blog"
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg font-medium text-sm transition-colors",
                        isBlogActive ? "bg-slate-900 text-white font-semibold" : "text-slate-700 hover:bg-slate-100"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <BookOpen className="size-4 shrink-0" />
                      <span>Cẩm nang</span>
                    </Link>
                    <Link
                      href="/pricing"
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg font-medium text-sm transition-colors",
                        isPricingActive ? "bg-slate-900 text-white font-semibold" : "text-slate-700 hover:bg-slate-100"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Sparkles className="size-4 shrink-0 text-teal-400" />
                      <span>Bảng giá dịch vụ</span>
                    </Link>
                  </>
                )}
              </nav>

              {/* Bottom Auth Section */}
              {isGuest ? (
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    className="text-white flex items-center justify-center gap-2 h-10 rounded-lg bg-gradient-to-r from-[#0D9488] to-[#14B8A6] hover:from-[#0F766E] hover:to-[#0D9488] font-medium text-sm transition-all shadow-sm shadow-teal-500/20 active:scale-[0.98] cursor-pointer"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      openRegister({ role: isEmployer ? "organizer" : "student" })
                    }}
                  >
                    <UserPlus className="size-4" />
                    <span>Đăng ký tài khoản</span>
                  </button>
                  <button
                    type="button"
                    className="h-10 flex items-center justify-center gap-2 rounded-lg border border-slate-200 text-slate-800 font-medium text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      openLogin({ role: isEmployer ? "organizer" : "student" })
                    }}
                  >
                    <LogIn className="size-4" />
                    <span>Đăng nhập</span>
                  </button>
                </div>
              ) : (
                <div className="pt-2 flex flex-col gap-1">
                  {isOrg && (
                    <Link
                      href="/dashboard"
                      className="p-3 rounded-lg font-medium text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Bảng điều khiển cá nhân
                    </Link>
                  )}
                  <Link
                    href={isOrg ? "/dashboard/chat" : "/chat"}
                    className="p-3 rounded-lg font-medium text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Tin nhắn trực tiếp
                  </Link>
                  <Link
                    href={isOrg ? "/dashboard/account" : "/account"}
                    className="p-3 rounded-lg font-medium text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Cài đặt tài khoản
                  </Link>
                  <button
                    type="button"
                    className="flex items-center gap-2 p-3 rounded-lg font-medium text-sm text-left text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer w-full"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      handleLogout()
                    }}
                  >
                    <LogOut className="size-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default NotchNavbar
