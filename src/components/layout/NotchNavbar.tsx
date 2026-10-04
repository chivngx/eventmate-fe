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

  // When on Hero page and not yet scrolled, match hero's orange color (#FB7328)
  const isHeroUnscrolled = Boolean(isHeroNavbar && !isScrolled)

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
      "font-bold text-[15.5px] transition-colors whitespace-nowrap",
      isHeroUnscrolled
        ? isActive
          ? "text-white font-extrabold"
          : "text-white/80 hover:text-white"
        : isActive
          ? "text-[#FB7328] font-extrabold"
          : "text-gray-700 hover:text-gray-900"
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
          "sticky top-0 z-50 w-full h-[68px] transition-colors duration-200 select-none",
          isHeroUnscrolled
            ? "bg-[#FB7328] border-b border-transparent text-white"
            : "bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs text-gray-900",
          className
        )}
      >
        <div className="max-w-[1200px] mx-auto w-full h-full px-4 xl:px-0 flex items-center justify-between gap-4">
          {/* Left: Hamburger (☰) + Logo + Price Badge */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Hamburger Button (Mobile / Tablet only) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "size-11 rounded-full flex lg:hidden items-center justify-center transition-all cursor-pointer",
                isHeroUnscrolled
                  ? "bg-white text-gray-700 shadow-xs hover:bg-gray-100"
                  : "text-gray-700 hover:bg-gray-100"
              )}
              aria-label="Menu"
              title="Menu"
            >
              <Menu className="size-5.5" />
            </button>

            {/* Logo */}
            {logo ? (
              logo
            ) : isHeroUnscrolled ? (
              /* When unscrolled: Logo inside white pill capsule */
              <Link
                href={isAdmin ? "/admin" : "/"}
                className="bg-white rounded-full h-11 px-4 flex items-center justify-center gap-2 shadow-xs hover:opacity-95 transition-opacity"
                aria-label="EventMate Home"
              >
                <EventMateLogoIcon size={28} variant="orange" />
                <span className="font-extrabold text-[17px] tracking-tight text-gray-900">
                  EventMate
                </span>
              </Link>
            ) : (
              /* When scrolled: Logo directly on white background */
              <Link
                href={isAdmin ? "/admin" : "/"}
                className="flex items-center gap-2 h-11 px-1 focus:outline-none transition-transform hover:opacity-90 active:scale-95"
                aria-label="EventMate Home"
              >
                <EventMateLogoIcon size={30} variant="orange" />
                <span className="font-extrabold text-xl tracking-tight text-gray-900 hidden sm:inline">
                  EventMate
                </span>
              </Link>
            )}
          </div>

          {/* Center: Nav Links */}
          <div className="hidden lg:flex items-center justify-center gap-6 xl:gap-8">
            {isOrg ? (
              <>
                <Link
                  href="/dashboard"
                  className={getNavLinkClass(Boolean(isDashboardActive))}
                >
                  Bảng điều khiển
                </Link>
                <Link
                  href="/manage-events"
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
          </div>

          {/* Right: Actions (Heart, Bell, Liên hệ, Quản lý tin / Đăng nhập, Đăng tuyển, Profile) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Heart / Tin đã lưu icon (Chỉ hiện khi đã đăng nhập với vai trò Student) */}
            {isStudent && (
              <button
                type="button"
                onClick={handleSavedClick}
                className={cn(
                  "size-11 rounded-full flex items-center justify-center transition-all cursor-pointer",
                  isHeroUnscrolled
                    ? "bg-white text-gray-700 shadow-xs hover:bg-gray-100"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                title="Tin đã lưu"
                aria-label="Tin đã lưu"
              >
                <Heart className="size-[22px]" />
              </button>
            )}

            {/* Notification Bell (Chỉ hiện khi đã đăng nhập) */}
            {!isGuest && (
              <NotificationDropdown
                notifications={notifications}
                unreadCount={unreadCount}
                markAsRead={markAsRead}
                triggerClassName={
                  isHeroUnscrolled
                    ? "size-11 bg-white text-gray-700 shadow-xs hover:bg-gray-100"
                    : "size-11 text-gray-700 hover:bg-gray-100"
                }
              />
            )}

            {/* Middle Action: "Đăng nhập" (for guest) or "Quản lý tin" (for user) */}
            {isGuest ? (
              <button
                type="button"
                onClick={() => openLogin({ role: isEmployer ? "organizer" : "student" })}
                className={cn(
                  "h-11 px-5 rounded-full flex items-center justify-center font-semibold text-[15px] transition-all whitespace-nowrap cursor-pointer",
                  isHeroUnscrolled
                    ? "bg-white text-gray-800 shadow-xs hover:bg-gray-100"
                    : "border border-gray-200 text-gray-800 hover:bg-gray-50 shadow-xs"
                )}
              >
                Đăng nhập
              </button>
            ) : isOrg ? (
              <Link
                href="/manage-events"
                className={cn(
                  "hidden sm:flex h-11 px-5 rounded-full items-center justify-center font-semibold text-[15px] transition-all whitespace-nowrap cursor-pointer",
                  isHeroUnscrolled
                    ? "bg-white text-gray-800 shadow-xs hover:bg-gray-100"
                    : "border border-gray-200 text-gray-800 hover:bg-gray-50 shadow-xs"
                )}
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
                  className={cn(
                    "h-11 px-5.5 rounded-full flex items-center justify-center font-bold text-[15px] transition-all shadow-xs active:scale-95 whitespace-nowrap cursor-pointer",
                    isHeroUnscrolled
                      ? "bg-[#222222] hover:bg-black text-white"
                      : "bg-[#FB7328] hover:bg-[#ea5d15] text-white"
                  )}
                >
                  Đăng tuyển
                </button>
              ) : (
                <Link
                  href="/post-job"
                  className={cn(
                    "h-11 px-5.5 rounded-full flex items-center justify-center font-bold text-[15px] transition-all shadow-xs active:scale-95 whitespace-nowrap cursor-pointer",
                    isHeroUnscrolled
                      ? "bg-[#222222] hover:bg-black text-white"
                      : "bg-[#FB7328] hover:bg-[#ea5d15] text-white"
                  )}
                >
                  Đăng tuyển
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
                isHeroUnscrolled={isHeroUnscrolled}
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
                  <EventMateLogoIcon size={24} variant="orange" />
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
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
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
                        "flex items-center gap-3 p-3 rounded-xl font-medium text-sm transition-colors",
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
                        "flex items-center gap-3 p-3 rounded-xl font-medium text-sm transition-colors",
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
                        "flex items-center gap-3 p-3 rounded-xl font-medium text-sm transition-colors",
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
                        "flex items-center gap-3 p-3 rounded-xl font-medium text-sm transition-colors",
                        isDashboardActive ? "bg-slate-900 text-white font-semibold" : "text-slate-700 hover:bg-slate-100"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="size-4 shrink-0 text-zinc-900" />
                      <span>Bảng điều khiển</span>
                    </Link>
                    <Link
                      href="/post-job"
                      className="flex items-center gap-3 p-3 rounded-xl font-medium text-sm text-emerald-700 bg-emerald-50/60 hover:bg-emerald-50 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Plus className="size-4 shrink-0 text-emerald-600" />
                      <span>Đăng tin tuyển dụng mới</span>
                    </Link>
                    <Link
                      href="/manage-events"
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl font-medium text-sm transition-colors",
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
                        "flex items-center gap-3 p-3 rounded-xl font-medium text-sm transition-colors",
                        isPricingActive ? "bg-slate-900 text-white font-semibold" : "text-slate-700 hover:bg-slate-100"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Sparkles className="size-4 shrink-0 text-amber-500" />
                      <span>Bảng giá & Dịch vụ VIP</span>
                    </Link>
                  </>
                ) : isStudent ? (
                  <>
                    <Link
                      href="/events"
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl font-medium text-sm transition-colors",
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
                        "flex items-center gap-3 p-3 rounded-xl font-medium text-sm transition-colors",
                        isMyEventsActive ? "bg-slate-900 text-white font-semibold" : "text-slate-700 hover:bg-slate-100"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <CalendarDays className="size-4 shrink-0 text-emerald-600" />
                      <span>Sự kiện của tôi</span>
                    </Link>
                    <Link
                      href="/blog"
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl font-medium text-sm transition-colors",
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
                        "flex items-center gap-3 p-3 rounded-xl font-medium text-sm transition-colors",
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
                        "flex items-center gap-3 p-3 rounded-xl font-medium text-sm transition-colors",
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
                        "flex items-center gap-3 p-3 rounded-xl font-medium text-sm transition-colors",
                        isPricingActive ? "bg-slate-900 text-white font-semibold" : "text-slate-700 hover:bg-slate-100"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Sparkles className="size-4 shrink-0 text-amber-500" />
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
                    className="text-white flex items-center justify-center gap-2 h-[42px] rounded-full bg-[#1877F2] hover:bg-[#1366D6] font-medium text-sm transition-all shadow-xs active:scale-[0.98] cursor-pointer"
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
                    className="h-[42px] flex items-center justify-center gap-2 rounded-full border border-slate-200 text-slate-800 font-medium text-sm hover:bg-slate-50 transition-colors cursor-pointer"
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
                  <Link
                    href="/dashboard"
                    className="p-3 rounded-xl font-medium text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Bảng điều khiển cá nhân
                  </Link>
                  <Link
                    href="/chat"
                    className="p-3 rounded-xl font-medium text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Tin nhắn trực tiếp
                  </Link>
                  <Link
                    href="/account"
                    className="p-3 rounded-xl font-medium text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Cài đặt tài khoản
                  </Link>
                  <button
                    type="button"
                    className="flex items-center gap-2 p-3 rounded-xl font-medium text-sm text-left text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer w-full"
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
