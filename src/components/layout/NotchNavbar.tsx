"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { EventMateLogo } from "@/components/common/EventMateLogo"
import { NavSearchIcon, NavLogInIcon } from "./JoblinIcons"

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
  const [isScrolled, setIsScrolled] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const isGuest = role === "guest" || (!role && !rightActions)

  // Track window scroll to detect when navbar touches top edge
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15)
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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

  // Active state checkers
  const isFindJobActive = pathname?.startsWith("/events") || pathname?.startsWith("/jobs")
  const isCompanyActive = pathname?.startsWith("/companies")
  const isEmployerHomeActive = pathname === "/for-employers"
  const isDashboardActive =
    pathname === "/dashboard" || pathname?.startsWith("/dashboard?")
  const isManageEventsActive = pathname?.startsWith("/manage-events")
  const isPricingActive = pathname?.startsWith("/pricing")
  const isBlogActive = pathname?.startsWith("/blog")

  const isFloating = variant === "floating"

  const navLinkClass = (isActive: boolean) =>
    cn(
      "h-[36px] px-3.5 rounded-full flex items-center justify-center font-['Inter',sans-serif] text-[14.5px] font-medium transition-all whitespace-nowrap cursor-pointer select-none",
      isActive
        ? "bg-slate-100 text-[#222222] font-semibold shadow-2xs"
        : "text-[#555555] hover:text-[#222222] hover:bg-slate-50"
    )

  return (
    <>
      <header
        className={cn(
          isFloating && !isScrolled ? "sticky top-2 z-50" : "sticky top-0 z-50",
          "w-full transition-all duration-300 ease-in-out",
          isFloating
            ? isScrolled
              ? "bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-xs pt-0 px-0"
              : "bg-transparent border-b border-transparent shadow-none pt-2.5 sm:pt-3 px-4 sm:px-6 lg:px-8"
            : "bg-white border-b border-slate-200/80",
          className
        )}
      >
        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            isFloating
              ? isScrolled
                ? "mx-auto max-w-7xl w-full bg-transparent rounded-none px-4 sm:px-6 lg:px-8 border-transparent shadow-none"
                : "mx-auto w-fit bg-white/90 backdrop-blur-xl rounded-full px-4 sm:px-6 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)]"
              : "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          )}
          data-name={isEmployer ? "Header-employer" : "Header-jobseeker"}
        >
          <div className="flex h-[60px] sm:h-[64px] items-center justify-between gap-2 sm:gap-4">
            {/* Left: Brand Logo */}
            <div className="flex items-center shrink-0">
              {logo ? (
                logo
              ) : (
                <Link
                  href={isEmployer ? "/for-employers" : "/"}
                  className="flex items-center h-[38px] px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 rounded-lg transition-transform hover:opacity-90 active:scale-95"
                  aria-label="EventMate Home"
                >
                  <EventMateLogo iconSize={32} />
                </Link>
              )}
            </div>

            {/* Center: Menu Navigation */}
            <nav className="hidden lg:flex items-center justify-center gap-1 shrink-0">
              {isEmployer ? (
                /* Role: Organizer */
                <>
                  <Link href="/dashboard" className={navLinkClass(isDashboardActive)}>
                    Bảng điều khiển
                  </Link>
                  <Link href="/manage-events" className={navLinkClass(isManageEventsActive)}>
                    Quản lý sự kiện
                  </Link>
                  <Link href="/for-employers" className={navLinkClass(isEmployerHomeActive)}>
                    Tìm ứng viên
                  </Link>
                  <Link href="/pricing" className={navLinkClass(isPricingActive)}>
                    Bảng giá
                  </Link>
                </>
              ) : !isGuest ? (
                /* Role: Student (Logged in) */
                <>
                  <Link href="/events" className={navLinkClass(isFindJobActive)}>
                    Việc làm
                  </Link>
                  <Link href="/companies" className={navLinkClass(isCompanyActive)}>
                    Ban tổ chức
                  </Link>
                  <Link href="/blog" className={navLinkClass(isBlogActive)}>
                    Cẩm nang
                  </Link>
                </>
              ) : (
                /* Role: Guest (Not logged in) */
                <>
                  <Link href="/events" className={navLinkClass(isFindJobActive)}>
                    Việc làm
                  </Link>
                  <Link href="/companies" className={navLinkClass(isCompanyActive)}>
                    Ban tổ chức
                  </Link>
                  <Link href="/blog" className={navLinkClass(isBlogActive)}>
                    Cẩm nang
                  </Link>
                </>
              )}
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
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
                      className="overflow-hidden mr-1.5"
                    >
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={isEmployer ? "Tìm ứng viên..." : "Tìm sự kiện..."}
                        className="w-full h-[36px] px-3.5 text-[13px] border border-slate-200 rounded-full focus:outline-none focus:border-black/40 focus:ring-2 focus:ring-black/5"
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
                  className="size-[38px] flex items-center justify-center rounded-full hover:bg-slate-100 text-[#222222] transition-colors cursor-pointer"
                  title={isEmployer ? "Tìm kiếm ứng viên" : "Tìm kiếm sự kiện"}
                  aria-label="Tìm kiếm"
                >
                  <NavSearchIcon className="size-[20px]" />
                </button>
              </div>

              {/* Authenticated rightActions vs Guest Controls */}
              {rightActions ? (
                rightActions
              ) : (
                <div className="hidden sm:flex items-center gap-1.5">
                  {/* Switcher */}
                  <Link
                    href={isEmployer ? "/?view=jobseeker" : "/for-employers"}
                    className="h-[36px] px-3 rounded-full flex items-center justify-center text-[#555555] hover:text-[#222222] hover:bg-slate-100/70 font-medium text-[14px] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {isEmployer ? "Dành cho ứng viên" : "Dành cho nhà tuyển dụng"}
                  </Link>

                  <div className="h-4 w-px bg-slate-200 mx-1 shrink-0" />

                  {/* Log In */}
                  <Link
                    href={isEmployer ? "/login?role=organizer" : "/login"}
                    className="h-[36px] px-3.5 rounded-full flex items-center justify-center text-[#222222] hover:bg-slate-100 font-medium text-[14.5px] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Đăng nhập
                  </Link>

                  {/* Sign Up */}
                  <Link
                    href={isEmployer ? "/register?role=organizer" : "/register"}
                    className="h-[36px] px-4 rounded-full flex items-center justify-center bg-[#222222] hover:bg-black text-white font-medium text-[14.5px] transition-all shadow-xs active:scale-[0.97] whitespace-nowrap cursor-pointer"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle Button */}
              <button
                className="lg:hidden p-2 text-[#222222] hover:bg-slate-100 rounded-full transition-colors ml-0.5 cursor-pointer"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
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
              "lg:hidden z-50 bg-white/95 backdrop-blur-xl shadow-xl overflow-y-auto transition-all duration-300",
              isFloating && !isScrolled
                ? "mt-2 mx-auto max-w-[1240px] w-full rounded-[20px] border border-slate-200/80 shadow-[0_12px_36px_rgba(0,0,0,0.08)] max-h-[calc(100vh-100px)]"
                : "fixed inset-x-0 top-[64px] border-b border-slate-200/80 max-h-[calc(100vh-64px)]"
            )}
          >
            <nav className="p-4 flex flex-col gap-1.5">
              {isEmployer ? (
                <>
                  <Link
                    href="/dashboard"
                    className={cn(
                      "p-3 rounded-xl font-medium text-sm transition-colors",
                      isDashboardActive ? "bg-slate-100 text-[#222222] font-semibold" : "text-[#555555] hover:bg-slate-50 hover:text-[#222222]"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Bảng điều khiển
                  </Link>
                  <Link
                    href="/manage-events"
                    className={cn(
                      "p-3 rounded-xl font-medium text-sm transition-colors",
                      isManageEventsActive ? "bg-slate-100 text-[#222222] font-semibold" : "text-[#555555] hover:bg-slate-50 hover:text-[#222222]"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Quản lý sự kiện
                  </Link>
                  <Link
                    href="/for-employers"
                    className={cn(
                      "p-3 rounded-xl font-medium text-sm transition-colors",
                      isEmployerHomeActive ? "bg-slate-100 text-[#222222] font-semibold" : "text-[#555555] hover:bg-slate-50 hover:text-[#222222]"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Tìm ứng viên
                  </Link>
                  <Link
                    href="/pricing"
                    className={cn(
                      "p-3 rounded-xl font-medium text-sm transition-colors",
                      isPricingActive ? "bg-slate-100 text-[#222222] font-semibold" : "text-[#555555] hover:bg-slate-50 hover:text-[#222222]"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Bảng giá
                  </Link>
                </>
              ) : !isGuest ? (
                <>
                  <Link
                    href="/events"
                    className={cn(
                      "p-3 rounded-xl font-medium text-sm transition-colors",
                      isFindJobActive ? "bg-slate-100 text-[#222222] font-semibold" : "text-[#555555] hover:bg-slate-50 hover:text-[#222222]"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Việc làm
                  </Link>
                  <Link
                    href="/companies"
                    className={cn(
                      "p-3 rounded-xl font-medium text-sm transition-colors",
                      isCompanyActive ? "bg-slate-100 text-[#222222] font-semibold" : "text-[#555555] hover:bg-slate-50 hover:text-[#222222]"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Ban tổ chức
                  </Link>
                  <Link
                    href="/blog"
                    className={cn(
                      "p-3 rounded-xl font-medium text-sm transition-colors",
                      isBlogActive ? "bg-slate-100 text-[#222222] font-semibold" : "text-[#555555] hover:bg-slate-50 hover:text-[#222222]"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Cẩm nang
                  </Link>
                  <Link
                    href="/dashboard"
                    className={cn(
                      "p-3 rounded-xl font-medium text-sm transition-colors",
                      isDashboardActive ? "bg-slate-100 text-[#222222] font-semibold" : "text-[#555555] hover:bg-slate-50 hover:text-[#222222]"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Bảng điều khiển
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/events"
                    className={cn(
                      "p-3 rounded-xl font-medium text-sm transition-colors",
                      isFindJobActive ? "bg-slate-100 text-[#222222] font-semibold" : "text-[#555555] hover:bg-slate-50 hover:text-[#222222]"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Việc làm
                  </Link>
                  <Link
                    href="/companies"
                    className={cn(
                      "p-3 rounded-xl font-medium text-sm transition-colors",
                      isCompanyActive ? "bg-slate-100 text-[#222222] font-semibold" : "text-[#555555] hover:bg-slate-50 hover:text-[#222222]"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Ban tổ chức
                  </Link>
                  <Link
                    href="/blog"
                    className={cn(
                      "p-3 rounded-xl font-medium text-sm transition-colors",
                      isBlogActive ? "bg-slate-100 text-[#222222] font-semibold" : "text-[#555555] hover:bg-slate-50 hover:text-[#222222]"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Cẩm nang
                  </Link>
                </>
              )}

              <div className="my-2 h-px bg-slate-100" />
              <Link
                href={isEmployer ? "/?view=jobseeker" : "/for-employers"}
                className="p-3 rounded-xl font-medium text-sm text-[#757575] hover:text-[#222222] hover:bg-slate-50 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {isEmployer ? "Dành cho Người tìm việc" : "Dành cho Nhà tuyển dụng"}
              </Link>

              {isGuest ? (
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href={isEmployer ? "/register?role=organizer" : "/register"}
                    className="text-white flex items-center justify-center gap-2 h-[42px] rounded-full bg-[#222222] hover:bg-black font-medium text-sm transition-all shadow-xs active:scale-[0.97]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <NavLogInIcon className="size-4.5 text-white" />
                    <span>Đăng ký</span>
                  </Link>
                  <Link
                    href={isEmployer ? "/login?role=organizer" : "/login"}
                    className="h-[42px] flex items-center justify-center rounded-full border border-slate-200 text-[#222222] font-medium text-sm hover:bg-slate-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                </div>
              ) : (
                <div className="pt-2 flex flex-col gap-1">
                  <Link
                    href="/profile"
                    className="p-3 rounded-xl font-medium text-sm text-[#555555] hover:text-[#222222] hover:bg-slate-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Hồ sơ cá nhân
                  </Link>
                  <Link
                    href="/chat"
                    className="p-3 rounded-xl font-medium text-sm text-[#555555] hover:text-[#222222] hover:bg-slate-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Tin nhắn
                  </Link>
                  <button
                    type="button"
                    className="p-3 rounded-xl font-medium text-sm text-left text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
