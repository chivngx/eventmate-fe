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
} from "lucide-react"
import { isOrganizerRole } from "@/lib/auth-constants"

export interface JobseekerProfileDropdownProps {
  avatarUrl?: string
  fullName?: string
  email?: string
  role?: string
  isEmployer?: boolean
  navigate: (path: string) => void
  handleLogout: () => Promise<void>
}

export default function JobseekerProfileDropdown({
  avatarUrl,
  fullName,
  email,
  role,
  isEmployer,
  navigate,
  handleLogout,
}: JobseekerProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isOrg = Boolean(isEmployer || isOrganizerRole(role))
  const displayName = fullName || email?.split("@")[0] || (isOrg ? "Nhà tuyển dụng" : "Ứng viên")
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
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative size-[40px] rounded-full border border-[#cbcbcb] shrink-0 bg-slate-100 flex items-center justify-center overflow-visible hover:ring-2 hover:ring-black/10 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#005DDC]"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={displayName}
      >
        {/* Avatar with online dot */}
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
          <span className="text-sm font-semibold text-slate-700 select-none">
            {initial}
          </span>
        )}
        {/* Green Online Dot */}
        <span
          className="absolute bottom-0 right-0 size-[8px] rounded-full bg-[#009E00] ring-2 ring-white"
          aria-hidden="true"
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
            className="absolute right-0 top-[calc(100%+10px)] z-50 w-[240px] bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col p-1.5"
          >
            {/* User Identity Header */}
            <div className="px-3.5 py-2.5 mb-1 border-b border-slate-100">
              <p className="font-semibold text-[14px] sm:text-[15px] text-slate-900 truncate">
                {displayName}
              </p>
              {email && (
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {email}
                </p>
              )}
              <div className="mt-1.5">
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                  {isOrg ? "Nhà tuyển dụng" : "Ứng viên"}
                </span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="flex flex-col gap-0.5">
              {isOrg ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      navigate("/dashboard")
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer text-left w-full"
                  >
                    <LayoutDashboard className="size-4 text-slate-500 shrink-0" />
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
                    <PlusCircle className="size-4 text-slate-500 shrink-0" />
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
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      navigate("/dashboard")
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer text-left w-full"
                  >
                    <LayoutDashboard className="size-4 text-slate-500 shrink-0" />
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
                    <span>Hồ sơ của tôi</span>
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
