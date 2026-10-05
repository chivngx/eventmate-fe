"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CalendarDays,
  Briefcase,
  CheckCircle2,
  Users,
  Sparkles,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import {
  CategoryIcon,
  UserIcon,
  MessageIcon,
  SettingIcon,
  LogoutIcon,
  EditIcon,
} from "@/components/icons"
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

  const MenuItem = ({ icon: Icon, label, onClick, badge, danger = false }: any) => (
    <button
      type="button"
      onClick={() => {
        setIsOpen(false)
        onClick()
      }}
      className={cn(
        "group flex items-center justify-between px-3 py-2.5 rounded-[12px] text-[14px] font-medium transition-colors cursor-pointer text-left w-full",
        danger 
          ? "text-rose-600 hover:bg-rose-50/80" 
          : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon 
          className={cn(
            "size-5 shrink-0 transition-colors",
            danger ? "text-rose-500 group-hover:text-rose-600" : "text-slate-400 group-hover:text-slate-600"
          )} 
        />
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide text-white bg-rose-500 rounded-full">
            {badge}
          </span>
        )}
        <ChevronRight className={cn("size-4", danger ? "text-rose-300" : "text-slate-300 group-hover:text-slate-400")} />
      </div>
    </button>
  )

  const MenuGroup = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-4 last:mb-0">
      <div className="px-1 mb-2 text-[13px] font-semibold text-slate-500">
        {title}
      </div>
      <div className="bg-white rounded-[16px] border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-1 flex flex-col gap-0.5">
        {children}
      </div>
    </div>
  )

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-[40px] pl-1.5 pr-2.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer outline-none shrink-0 bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50 shadow-sm",
          triggerClassName
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={displayName}
      >
        <div className="relative size-[30px] rounded-full overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center border border-black/5">
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
            <span className="text-xs font-semibold text-slate-600 select-none">
              {initial}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "size-3.5 opacity-60 transition-transform duration-300",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 8, scale: 0.96, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-[320px] bg-[#f8fafc] border border-slate-200/80 rounded-[24px] shadow-[0_16px_40px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="overflow-y-auto px-4 py-5 scrollbar-hide">
              {/* Centered Identity Header */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative group cursor-pointer mb-3" onClick={() => { setIsOpen(false); navigate("/account"); }}>
                  <div className="size-[68px] rounded-full overflow-hidden bg-white border-2 border-white shadow-sm flex items-center justify-center">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        referrerPolicy="no-referrer"
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-slate-400">
                        {initial}
                      </span>
                    )}
                  </div>
                  {/* Edit Pencil Badge */}
                  <div className="absolute bottom-0 right-0 bg-slate-800 text-white p-1.5 rounded-full ring-2 ring-[#f8fafc] shadow-sm group-hover:bg-slate-700 transition-colors">
                    <EditIcon className="size-3" />
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="font-bold text-[17px] text-slate-900 leading-tight">
                    {displayName}
                  </h3>
                </div>
              </div>

              {/* Primary Action (Organizer) */}
              {isOrg && (
                <div className="bg-white rounded-[16px] border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-4 mb-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13.5px] font-medium text-slate-600">Tuyển dụng nhanh</span>
                    <Sparkles className="size-4 text-amber-500" />
                  </div>
                  <button
                    onClick={() => { setIsOpen(false); navigate("/post-job"); }}
                    className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
                  >
                    Đăng tin ngay
                  </button>
                </div>
              )}

              {/* Menu Groups */}
              {isAdmin ? (
                <>
                  <MenuGroup title="Hệ thống">
                    <MenuItem icon={CategoryIcon} label="Trang quản trị (Admin)" onClick={() => navigate("/admin")} />
                    <MenuItem icon={CheckCircle2} label="Kiểm duyệt sự kiện" onClick={() => navigate("/admin")} badge="Mới" />
                    <MenuItem icon={Users} label="Quản lý người dùng" onClick={() => navigate("/admin")} />
                  </MenuGroup>
                  <MenuGroup title="Cá nhân">
                    <MenuItem icon={MessageIcon} label="Tin nhắn" onClick={() => navigate("/chat")} />
                    <MenuItem icon={SettingIcon} label="Cài đặt tài khoản" onClick={() => navigate("/account")} />
                    <MenuItem icon={LogoutIcon} label="Đăng xuất" onClick={handleLogout} danger={true} />
                  </MenuGroup>
                </>
              ) : isOrg ? (
                <>
                  <MenuGroup title="Tiện ích">
                    <MenuItem icon={CategoryIcon} label="Bảng điều khiển" onClick={() => navigate("/dashboard")} />
                    <MenuItem icon={Briefcase} label="Quản lý sự kiện" onClick={() => navigate("/manage-events")} />
                    <MenuItem icon={MessageIcon} label="Tin nhắn ứng viên" onClick={() => navigate("/chat")} />
                  </MenuGroup>
                  <MenuGroup title="Dịch vụ trả phí">
                    <MenuItem icon={Sparkles} label="Bảng giá & Dịch vụ VIP" onClick={() => navigate("/pricing")} badge="Mới" />
                  </MenuGroup>
                  <MenuGroup title="Tài khoản">
                    <MenuItem icon={SettingIcon} label="Cài đặt tài khoản" onClick={() => navigate("/account")} />
                    <MenuItem icon={LogoutIcon} label="Đăng xuất" onClick={handleLogout} danger={true} />
                  </MenuGroup>
                </>
              ) : (
                <>
                  <MenuGroup title="Tiện ích">
                    <MenuItem icon={CategoryIcon} label="Bảng điều khiển" onClick={() => navigate("/dashboard")} />
                    <MenuItem icon={UserIcon} label="Hồ sơ năng lực (CV)" onClick={() => navigate("/profile")} />
                    <MenuItem icon={CalendarDays} label="Sự kiện đã tham gia" onClick={() => navigate("/my-events")} />
                    <MenuItem icon={MessageIcon} label="Tin nhắn" onClick={() => navigate("/chat")} />
                  </MenuGroup>
                  <MenuGroup title="Tài khoản">
                    <MenuItem icon={SettingIcon} label="Cài đặt tài khoản" onClick={() => navigate("/account")} />
                    <MenuItem icon={LogoutIcon} label="Đăng xuất" onClick={handleLogout} danger={true} />
                  </MenuGroup>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}