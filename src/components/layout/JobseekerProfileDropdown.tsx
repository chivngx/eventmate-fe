"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { NavAngleIcon, NavDropdownArrow } from "./JoblinIcons"
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
  const displayName = fullName || email?.split("@")[0] || (isOrg ? "Nhà tuyển dụng" : "Kathryn Murphy")
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
      {/* Trigger Button (Figma ProfileJobseekerDropdown) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-[8px] py-1 px-1 sm:px-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#005DDC]"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={displayName}
      >
        {/* Avatar with online dot */}
        <div className="relative size-[40px] rounded-full border border-[#cbcbcb] shrink-0 bg-slate-100 flex items-center justify-center overflow-visible">
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
          {/* Green Online Dot (#009E00 in Figma) */}
          <span
            className="absolute bottom-0 right-0 size-[8px] rounded-full bg-[#009E00] ring-2 ring-white"
            aria-hidden="true"
          />
        </div>

        {/* User Name */}
        <p className="hidden sm:block font-['Inter'] font-normal text-[16px] text-[#222222] whitespace-nowrap leading-[1.6] max-w-[140px] truncate">
          {displayName}
        </p>

        {/* Angle Chevron Icon */}
        <NavAngleIcon isOpen={isOpen} className="size-[24px] text-[#222222] shrink-0" />
      </button>

      {/* Dropdown Popover */}
      <AnimatePresence>
        {isOpen && (
          <div className="absolute right-0 top-[calc(100%+20px)] z-50">
            {/* Top Pointer Arrow */}
            <div className="absolute -top-[12px] right-[20px] pointer-events-none z-10">
              <NavDropdownArrow className="w-[18px] h-[15px]" />
            </div>

            {/* Dropdown Card */}
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="w-[217px] bg-white border border-[#cbcbcb] rounded-[8px] shadow-xl overflow-hidden flex flex-col"
            >
              {isOrg ? (
                <>
                  {/* Org 1. Bảng điều khiển */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      navigate("/dashboard")
                    }}
                    className="h-[50px] px-[16px] flex items-center border-b border-[#cbcbcb] text-[15px] font-['Inter'] font-medium text-[#222222] hover:bg-slate-50 transition-colors cursor-pointer text-left w-full"
                  >
                    Bảng điều khiển
                  </button>

                  {/* Org 2. Đăng tin tuyển dụng */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      navigate("/post-job")
                    }}
                    className="h-[50px] px-[16px] flex items-center border-b border-[#cbcbcb] text-[15px] font-['Inter'] font-medium text-[#222222] hover:bg-slate-50 transition-colors cursor-pointer text-left w-full"
                  >
                    Đăng tin tuyển dụng
                  </button>

                  {/* Org 3. Quản lý tuyển dụng */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      navigate("/manage-events")
                    }}
                    className="h-[50px] px-[16px] flex items-center border-b border-[#cbcbcb] text-[15px] font-['Inter'] font-medium text-[#222222] hover:bg-slate-50 transition-colors cursor-pointer text-left w-full"
                  >
                    Quản lý tuyển dụng
                  </button>

                  {/* Org 4. Tin nhắn */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      navigate("/chat")
                    }}
                    className="h-[50px] px-[16px] flex items-center border-b border-[#cbcbcb] text-[15px] font-['Inter'] font-medium text-[#222222] hover:bg-slate-50 transition-colors cursor-pointer text-left w-full"
                  >
                    Tin nhắn
                  </button>

                  {/* Org 5. Cài đặt */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      navigate("/account")
                    }}
                    className="h-[50px] px-[16px] flex items-center border-b border-[#cbcbcb] text-[15px] font-['Inter'] font-medium text-[#222222] hover:bg-slate-50 transition-colors cursor-pointer text-left w-full"
                  >
                    Cài đặt tài khoản
                  </button>
                </>
              ) : (
                <>
                  {/* Student 1. Dashboard */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      navigate("/dashboard")
                    }}
                    className="h-[50px] px-[16px] flex items-center border-b border-[#cbcbcb] text-[15px] font-['Inter'] font-medium text-[#222222] hover:bg-slate-50 transition-colors cursor-pointer text-left w-full"
                  >
                    Bảng điều khiển
                  </button>

                  {/* Student 2. My resume */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      navigate("/profile")
                    }}
                    className="h-[50px] px-[16px] flex items-center border-b border-[#cbcbcb] text-[15px] font-['Inter'] font-medium text-[#222222] hover:bg-slate-50 transition-colors cursor-pointer text-left w-full"
                  >
                    Hồ sơ của tôi
                  </button>

                  {/* Student 3. My Events / Hoạt động */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      navigate("/my-events")
                    }}
                    className="h-[50px] px-[16px] flex items-center border-b border-[#cbcbcb] text-[15px] font-['Inter'] font-medium text-[#222222] hover:bg-slate-50 transition-colors cursor-pointer text-left w-full"
                  >
                    Sự kiện đã tham gia
                  </button>

                  {/* Student 4. Message */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      navigate("/chat")
                    }}
                    className="h-[50px] px-[16px] flex items-center border-b border-[#cbcbcb] text-[15px] font-['Inter'] font-medium text-[#222222] hover:bg-slate-50 transition-colors cursor-pointer text-left w-full"
                  >
                    Tin nhắn
                  </button>

                  {/* Student 5. Settings */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      navigate("/account")
                    }}
                    className="h-[50px] px-[16px] flex items-center border-b border-[#cbcbcb] text-[15px] font-['Inter'] font-medium text-[#222222] hover:bg-slate-50 transition-colors cursor-pointer text-left w-full"
                  >
                    Cài đặt tài khoản
                  </button>
                </>
              )}

              {/* Log out */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  handleLogout()
                }}
                className="h-[50px] px-[16px] flex items-center text-[15px] font-['Inter'] font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left w-full"
              >
                Đăng xuất
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
