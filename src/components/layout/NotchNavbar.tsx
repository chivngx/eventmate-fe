"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { JoblinLogo, NavSearchIcon, NavBellIcon, NavLogInIcon } from "./JoblinIcons"

const protectedClick = (e: React.MouseEvent, role?: string, redirectPath?: string) => {
  if (role === "guest" || !role) {
    e.preventDefault()
    window.dispatchEvent(
      new CustomEvent("open-auth-modal", {
        detail: {
          mode: "login",
          message: "Vui lòng đăng nhập để tiếp tục.",
          redirect: redirectPath,
        },
      })
    )
  }
}

export function NotchNavbar({
  className,
  variant = "standard",
  logo,
  rightActions,
  role,
  isEmployer = false,
}: {
  className?: string
  variant?: "standard" | "floating"
  logo?: React.ReactNode
  rightActions?: React.ReactNode
  role?: string
  isEmployer?: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const isGuest = role === "guest" || (!role && !rightActions)

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false)
      }
    }
    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isSearchOpen])

  // Close search and mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false)
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/events?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push("/events")
    }
    setIsSearchOpen(false)
  }

  const handleBellClick = () => {
    window.dispatchEvent(
      new CustomEvent("open-auth-modal", {
        detail: { mode: "login", message: "Vui lòng đăng nhập để xem thông báo." },
      })
    )
  }

  // Active state checkers
  const isHomeActive = pathname === "/"
  const isFindJobActive = pathname?.startsWith("/events") || pathname?.startsWith("/jobs")
  const isCompanyActive = pathname?.startsWith("/companies")
  const isCvActive = pathname?.startsWith("/profile") || pathname?.startsWith("/cv")

  const isEmployerHomeActive = pathname === "/for-employers"
  const isPostJobActive =
    pathname?.startsWith("/post-job") ||
    (pathname === "/dashboard" && searchParams?.get("tab") === "post-job") ||
    pathname?.startsWith("/events/create")
  const isDashboardActive =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/manage-events")
  const isPricingActive = pathname?.startsWith("/pricing")

  const isFloating = variant === "floating"

  return (
    <>
      <header
        className={cn(
          isFloating
            ? "w-full relative z-40"
            : "sticky top-0 z-50 bg-white border-b border-[#cbcbcb]",
          className
        )}
      >
        <div
          className={cn(
            isFloating
              ? "mx-auto max-w-[1232px] w-full bg-white rounded-[12px] px-4 sm:px-6 shadow-[0px_0px_14px_0px_#00000008]"
              : "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          )}
          data-node-id={isEmployer ? "5875:27178" : "7182:22172"}
          data-name={isEmployer ? "Header-employer" : "Header-jobseeker"}
        >
          <div className="flex h-[80px] items-center justify-between gap-2 sm:gap-4">
            {/* Left: Brand Logo */}
            <div className="flex items-center shrink-0">
              {logo ? (
                logo
              ) : (
                <Link
                  href={isEmployer ? "/for-employers" : "/"}
                  className="flex items-center h-[40px] px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005DDC] rounded-lg transition-transform hover:opacity-90 active:scale-95"
                  aria-label="EventMate Home"
                >
                  <JoblinLogo className="w-[110px] h-[29px]" />
                </Link>
              )}
            </div>

            {/* Center: Menu Navigation */}
            <nav className="hidden lg:flex items-center justify-between gap-1 shrink-0">
              {isEmployer ? (
                <>
                  <Link
                    href="/for-employers"
                    className={cn(
                      "h-[40px] px-[14px] sm:px-[16px] py-[8px] rounded-[8px] flex items-center justify-center font-['Inter'] font-medium text-[14px] leading-[1.6] transition-colors whitespace-nowrap",
                      isEmployerHomeActive ? "text-[#005DDC]" : "text-[#222222] hover:text-[#005DDC]"
                    )}
                  >
                    Trang chủ
                  </Link>
                  <Link
                    href="/post-job"
                    onClick={(e) => protectedClick(e, role, "/post-job")}
                    className={cn(
                      "h-[40px] px-[14px] sm:px-[16px] py-[8px] rounded-[8px] flex items-center justify-center font-['Inter'] font-medium text-[14px] leading-[1.6] transition-colors whitespace-nowrap",
                      isPostJobActive ? "text-[#005DDC]" : "text-[#222222] hover:text-[#005DDC]"
                    )}
                  >
                    Đăng sự kiện
                  </Link>
                  <Link
                    href="/dashboard"
                    className={cn(
                      "h-[40px] px-[14px] sm:px-[16px] py-[8px] rounded-[8px] flex items-center justify-center font-['Inter'] font-medium text-[14px] leading-[1.6] transition-colors whitespace-nowrap",
                      isDashboardActive ? "text-[#005DDC]" : "text-[#222222] hover:text-[#005DDC]"
                    )}
                  >
                    Bảng điều khiển
                  </Link>
                  <Link
                    href="/pricing"
                    className={cn(
                      "h-[40px] px-[14px] sm:px-[16px] py-[8px] rounded-[8px] flex items-center justify-center font-['Inter'] font-medium text-[14px] leading-[1.6] transition-colors whitespace-nowrap",
                      isPricingActive ? "text-[#005DDC]" : "text-[#222222] hover:text-[#005DDC]"
                    )}
                  >
                    Bảng giá
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/"
                    className={cn(
                      "h-[40px] px-[14px] py-[8px] rounded-[8px] flex items-center justify-center font-['Inter'] font-medium text-[14px] leading-[1.6] transition-colors whitespace-nowrap",
                      isHomeActive ? "text-[#005DDC]" : "text-[#222222] hover:text-[#005DDC]"
                    )}
                  >
                    Trang chủ
                  </Link>
                  <Link
                    href="/events"
                    className={cn(
                      "h-[40px] px-[14px] py-[8px] rounded-[8px] flex items-center justify-center font-['Inter'] font-medium text-[14px] leading-[1.6] transition-colors whitespace-nowrap",
                      isFindJobActive ? "text-[#005DDC]" : "text-[#222222] hover:text-[#005DDC]"
                    )}
                  >
                    Tìm việc làm
                  </Link>
                  <Link
                    href="/companies"
                    className={cn(
                      "h-[40px] px-[14px] py-[8px] rounded-[8px] flex items-center justify-center font-['Inter'] font-medium text-[14px] leading-[1.6] transition-colors whitespace-nowrap",
                      isCompanyActive ? "text-[#005DDC]" : "text-[#222222] hover:text-[#005DDC]"
                    )}
                  >
                    Ban tổ chức
                  </Link>
                </>
              )}
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Expandable Search Container */}
              <div ref={searchContainerRef} className="relative flex items-center">
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.form
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 220, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleSearchSubmit}
                      className="overflow-hidden mr-2"
                    >
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={isEmployer ? "Tìm hồ sơ, ứng viên..." : "Tìm sự kiện..."}
                        className="w-full h-[38px] px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#005DDC]"
                      />
                    </motion.form>
                  )}
                </AnimatePresence>

                <button
                  onClick={() => {
                    if (isSearchOpen && searchQuery.trim()) {
                      handleSearchSubmit({ preventDefault: () => {} } as React.FormEvent)
                    } else {
                      setIsSearchOpen(!isSearchOpen)
                    }
                  }}
                  className="size-[40px] flex items-center justify-center rounded-full hover:bg-slate-100 text-[#222222] transition-colors cursor-pointer"
                  title={isEmployer ? "Tìm kiếm ứng viên" : "Tìm kiếm sự kiện"}
                  aria-label="Tìm kiếm"
                >
                  <NavSearchIcon className="size-[24px]" />
                </button>
              </div>

              {/* Authenticated rightActions vs Guest Controls */}
              {rightActions ? (
                rightActions
              ) : (
                <div className="hidden sm:flex items-center">
                  {/* Bell icon button */}
                  <button
                    onClick={handleBellClick}
                    className="size-[44px] sm:size-[48px] flex items-center justify-center rounded-full hover:bg-slate-100 text-[#282828] transition-colors cursor-pointer"
                    title="Thông báo"
                    aria-label="Thông báo"
                  >
                    <NavBellIcon className="size-[24px]" />
                  </button>

                  {/* Employer / Jobseeker Switcher link */}
                  <Link
                    href={isEmployer ? "/?view=jobseeker" : "/for-employers"}
                    className="h-[40px] px-[14px] sm:px-[16px] py-[8px] rounded-[8px] flex items-center justify-center text-[#222222] hover:text-[#005DDC] font-['Inter'] font-medium text-[14px] leading-[1.6] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {isEmployer ? "Người tìm việc" : "Nhà tuyển dụng"}
                  </Link>

                  {/* Vertical Divider */}
                  <div className="h-[35px] w-px bg-[#cbcbcb] mx-2 shrink-0" />

                  {/* Sign Up CTA button */}
                  <Link
                    href={isEmployer ? "/register?role=organizer" : "/register"}
                    className={cn(
                      "flex items-center gap-[8px] h-[40px] px-[16px] py-[8px] rounded-[8px] font-['Inter'] font-medium text-[15px] transition-colors cursor-pointer shadow-xs active:scale-[0.98] whitespace-nowrap ml-1",
                      isEmployer
                        ? "bg-[#222222] hover:bg-black text-white"
                        : "bg-[#005DDC] hover:bg-[#004EB7] text-white"
                    )}
                  >
                    <NavLogInIcon className="size-[22px] text-white shrink-0" />
                    <span>Đăng ký</span>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle Button */}
              <button
                className="lg:hidden p-2 text-[#222222] hover:bg-slate-100 rounded-lg transition-colors ml-1"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={cn(
              "lg:hidden z-50 bg-white shadow-lg overflow-y-auto",
              isFloating
                ? "mt-2 mx-auto max-w-[1232px] w-full rounded-[12px] shadow-[0px_0px_14px_0px_#00000008] max-h-[calc(100vh-120px)]"
                : "fixed inset-x-0 top-[80px] border-b border-[#cbcbcb] max-h-[calc(100vh-80px)]"
            )}
          >
            <nav className="p-4 flex flex-col gap-1">
              {isEmployer ? (
                <>
                  <Link
                    href="/for-employers"
                    className={cn(
                      "p-3 rounded-lg font-medium text-sm transition-colors",
                      isEmployerHomeActive ? "text-[#005DDC] bg-blue-50/50" : "text-[#222222] hover:bg-slate-50"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Trang chủ
                  </Link>
                  <Link
                    href="/post-job"
                    className={cn(
                      "p-3 rounded-lg font-medium text-sm transition-colors",
                      isPostJobActive ? "text-[#005DDC] bg-blue-50/50" : "text-[#222222] hover:bg-slate-50"
                    )}
                    onClick={(e) => {
                      setIsMobileMenuOpen(false)
                      protectedClick(e, role, "/post-job")
                    }}
                  >
                    Đăng sự kiện
                  </Link>
                  <Link
                    href="/dashboard"
                    className={cn(
                      "p-3 rounded-lg font-medium text-sm transition-colors",
                      isDashboardActive ? "text-[#005DDC] bg-blue-50/50" : "text-[#222222] hover:bg-slate-50"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Bảng điều khiển
                  </Link>
                  <Link
                    href="/for-employers#solutions"
                    className="p-3 rounded-lg font-medium text-sm text-[#222222] hover:bg-slate-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Giải pháp
                  </Link>
                  <Link
                    href="/pricing"
                    className={cn(
                      "p-3 rounded-lg font-medium text-sm transition-colors",
                      isPricingActive ? "text-[#005DDC] bg-blue-50/50" : "text-[#222222] hover:bg-slate-50"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Bảng giá
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/"
                    className={cn(
                      "p-3 rounded-lg font-medium text-sm transition-colors",
                      isHomeActive ? "text-[#005DDC] bg-blue-50/50" : "text-[#222222] hover:bg-slate-50"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Trang chủ
                  </Link>
                  <Link
                    href="/events"
                    className={cn(
                      "p-3 rounded-lg font-medium text-sm transition-colors",
                      isFindJobActive ? "text-[#005DDC] bg-blue-50/50" : "text-[#222222] hover:bg-slate-50"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Tìm việc làm
                  </Link>
                  <Link
                    href="/companies"
                    className={cn(
                      "p-3 rounded-lg font-medium text-sm transition-colors",
                      isCompanyActive ? "text-[#005DDC] bg-blue-50/50" : "text-[#222222] hover:bg-slate-50"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Ban tổ chức
                  </Link>
                  <Link
                    href="/profile"
                    className={cn(
                      "p-3 rounded-lg font-medium text-sm transition-colors",
                      isCvActive ? "text-[#005DDC] bg-blue-50/50" : "text-[#222222] hover:bg-slate-50"
                    )}
                    onClick={(e) => {
                      setIsMobileMenuOpen(false)
                      protectedClick(e, role)
                    }}
                  >
                    Hồ sơ của tôi
                  </Link>
                </>
              )}

              {(isGuest || isEmployer) && (
                <>
                  <div className="my-2 h-px bg-[#cbcbcb]" />
                  <Link
                    href={isEmployer ? "/?view=jobseeker" : "/for-employers"}
                    className="p-3 rounded-lg font-medium text-sm text-[#515151] hover:text-[#005DDC] hover:bg-slate-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {isEmployer ? "Dành cho Người tìm việc" : "Dành cho Nhà tuyển dụng"}
                  </Link>
                </>
              )}

              {isGuest ? (
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href={isEmployer ? "/register?role=organizer" : "/register"}
                    className={cn(
                      "text-white flex items-center justify-center gap-2 h-[44px] rounded-lg font-medium text-base transition-colors",
                      isEmployer
                        ? "bg-[#222222] hover:bg-black"
                        : "bg-[#005DDC] hover:bg-[#004EB7]"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <NavLogInIcon className="size-5 text-white" />
                    <span>Đăng ký</span>
                  </Link>
                  <Link
                    href={isEmployer ? "/login?role=organizer" : "/login"}
                    className="h-[44px] flex items-center justify-center rounded-lg border border-slate-200 text-[#222222] font-medium text-sm hover:bg-slate-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                </div>
              ) : (
                <div className="pt-2 flex flex-col gap-1">
                  <Link
                    href="/my-events"
                    className="p-3 rounded-lg font-medium text-sm text-[#222222] hover:bg-slate-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Bảng điều khiển
                  </Link>
                  <Link
                    href="/profile"
                    className="p-3 rounded-lg font-medium text-sm text-[#222222] hover:bg-slate-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Hồ sơ cá nhân
                  </Link>
                  <Link
                    href="/cv"
                    className="p-3 rounded-lg font-medium text-sm text-[#222222] hover:bg-slate-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Hồ sơ CV của tôi
                  </Link>
                  <Link
                    href="/chat"
                    className="p-3 rounded-lg font-medium text-sm text-[#222222] hover:bg-slate-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Tin nhắn
                  </Link>
                  <button
                    type="button"
                    className="p-3 rounded-lg font-medium text-sm text-left text-red-600 hover:bg-red-50 transition-colors"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      window.dispatchEvent(new CustomEvent("trigger-logout"))
                    }}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

