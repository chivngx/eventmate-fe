"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  User,
  CalendarDays,
  MessageSquare,
  Settings,
  PlusCircle,
  Briefcase,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Users,
  Sparkles,
  ChevronDown,
} from "lucide-react"
import { isOrganizerRole, cn } from "@/lib/utils"

export interface JobseekerProfileDropdownProps {
  avatarUrl?: string
  fullName?: string
  email?: string
  role?: string
  isEmployer?: boolean
  navigate: (path: string) => void
  handleLogout: () => Promise<void>
  triggerClassName?: string
  isHeroUnscrolled?: boolean
}

export default function JobseekerProfileDropdown({
  avatarUrl,
  fullName,
  email,
  role,
  isEmployer,
  navigate,
  handleLogout,
  triggerClassName,
  isHeroUnscrolled = false,
}: JobseekerProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isAdmin = role === "admin"
  const isOrg = !isAdmin && Boolean(isEmployer || isOrganizerRole(role))
  const roleName = isAdmin ? "Quản trị viên" : isOrg ? "Nhà tuyển dụng" : "Ứng viên"
  const displayName = fullName || email?.split("@")[0] || roleName
  const initial = displayName ? displayName.charAt(0).toUpperCase() : "U"

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("pointerdown", handleClickOutside)
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      {/* Trigger Button - Figma Component 19 style */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-[44px] pl-1.5 pr-3 rounded-full flex items-center gap-1.5 transition-all cursor-pointer outline-none shrink-0",
          isHeroUnscrolled
            ? "bg-white text-gray-700 shadow-xs hover:bg-gray-100 border-none"
            : "border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-xs",
          triggerClassName
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={displayName}
      >
        <div className="relative size-[34px] rounded-full overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              referrerPolicy="no-referrer"
              className="size-full rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
          ) : (
            <span className="text-xs font-bold text-slate-700 select-none">
              {initial}
            </span>
          )}
          {/* Green Online Dot */}
          <span
            className="absolute bottom-0 right-0 size-[8px] rounded-full bg-[#10b981] ring-1.5 ring-white"
            aria-hidden="true"
          />
        </div>
        <ChevronDown
          className={cn(
            "size-4 transition-transform duration-200",
            isOpen && "rotate-180",
            isHeroUnscrolled ? "text-white/80" : "text-gray-500"
          )}
        />
      </button>

      {/* Dropdown Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-[calc(100%+10px)] z-50 w-[260px] bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col p-1.5"
          >
            {/* User Identity Header */}
            <div className="px-3.5 py-3 mb-1 border-b border-slate-100/90 bg-slate-50/50 rounded-xl">
              <p className="font-semibold text-[14.5px] text-slate-900 truncate">
                {displayName}
              </p>
              {email && (
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {email}
                </p>
              )}
              <div className="mt-2">
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200/70">
                    <ShieldCheck className="size-3.5" />
                    Quản trị viên
                  </span>
                ) : isOrg ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200">
                    <Briefcase className="size-3.5" />
                    Nhà tuyển dụng / BTC
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                    <User className="size-3.5" />
                    Ứng viên
                  </span>
                )}
              </div>
            </div>

            {/* Menu Items by Role */}
            <div className="flex flex-col gap-0.5 py-1">
              {isAdmin ? (
                /* Admin Menu */
                <>
                  <div className="px-3 py-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                    Quản trị hệ thống
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      navigate("/admin")
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer text-left w-full"
                  >
                    <LayoutDashboard className="size-4 text-purple-600 shrink-0" />
                    <span>Trang quản trị (Admin)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      navigate("/admin")
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer text-left w-full"
                  >
                    <CheckCircle2 className="size-4 text-slate-500 shrink-0" />
                    <span>Kiểm duyệt sự kiện</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      navigate("/admin")
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer text-left w-full"
                  >
                    <Users className="size-4 text-slate-500 shrink-0" />
                    <span>Quản lý người dùng</span>
                  </button>

                  <div className="my-1 h-px bg-slate-100" />
                  <div className="px-3 py-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                    Tiện ích
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      navigate("/chat")
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer text-left w-full"
                  >
                    <MessageSquare className="size-4 text-slate-500 shrink-0" />
                    <span>Tin nhắn</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      navigate("/account")
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer text-left w-full"
                  >
                    <Settings className="size-4 text-slate-500 shrink-0" />
                    <span>Cài đặt tài khoản</span>
                  </button>
                </>
              ) : isOrg ? (
                /* Organizer Menu */
                <>
                  <div className="px-3 py-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                    Quản lý tuyển dụng
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      navigate("/dashboard")
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer text-left w-full"
                  >
                    <LayoutDashboard className="size-4 text-zinc-900 shrink-0" />
                    <span>Bảng điều khiển</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      navigate("/post-job")
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer text-left w-full"
                  >
                    <PlusCircle className="size-4 text-emerald-600 shrink-0" />
                    <span>Đăng tin tuyển dụng</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      navigate("/manage-events")
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer text-left w-full"
                  >
                    <Briefcase className="size-4 text-slate-500 shrink-0" />
                    <span>Quản lý sự kiện</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      navigate("/pricing")
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer text-left w-full"
                  >
                    <Sparkles className="size-4 text-amber-500 shrink-0" />
                    <span>Bảng giá & Dịch vụ VIP</span>
                  </button>

                  <div className="my-1 h-px bg-slate-100" />
                  <div className="px-3 py-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                    Tương tác & Cá nhân
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      navigate("/chat")
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer text-left w-full"
                  >
                    <MessageSquare className="size-4 text-slate-500 shrink-0" />
                    <span>Tin nhắn ứng viên</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      navigate("/account")
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer text-left w-full"
                  >
                    <Settings className="size-4 text-slate-500 shrink-0" />
                    <span>Cài đặt tài khoản</span>
                  </button>
                </>
              ) : (
                /* Student Menu */
                <>
                  <div className="px-3 py-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                    Không gian cá nhân
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      navigate("/dashboard")
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer text-left w-full"
                  >
                    <LayoutDashboard className="size-4 text-zinc-900 shrink-0" />
                    <span>Bảng điều khiển</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      navigate("/profile")
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer text-left w-full"
                  >
                    <User className="size-4 text-slate-500 shrink-0" />
                    <span>Hồ sơ năng lực (CV)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      navigate("/my-events")
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer text-left w-full"
                  >
                    <CalendarDays className="size-4 text-slate-500 shrink-0" />
                    <span>Sự kiện đã tham gia</span>
                  </button>

                  <div className="my-1 h-px bg-slate-100" />
                  <div className="px-3 py-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                    Kết nối & Tài khoản
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      navigate("/chat")
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer text-left w-full"
                  >
                    <MessageSquare className="size-4 text-slate-500 shrink-0" />
                    <span>Tin nhắn</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      navigate("/account")
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer text-left w-full"
                  >
                    <Settings className="size-4 text-slate-500 shrink-0" />
                    <span>Cài đặt tài khoản</span>
                  </button>
                </>
              )}

              {/* Divider */}
              <div className="my-1 h-px bg-slate-100" />

              {/* Log out */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  handleLogout()
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left w-full"
              >
                <LogOut className="size-4 text-rose-600 shrink-0" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}