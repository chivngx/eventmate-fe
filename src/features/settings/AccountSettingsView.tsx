"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Navigate } from "@/lib/router"
import { cn } from "@/lib/utils"
import MainLayout from "@/components/layout/MainLayout"
import { SkeletonGenericPage } from "@/components/ui/skeleton"
import { useAccountSettings } from "./hooks/useAccountSettings"
import {
  Building2,
  User,
  Upload,
  Shield,
  Lock,
  Mail,
  Phone,
  Camera,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  ChevronDown,
  Info,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ArrowRight,
  Bell,
  Eye as EyeIcon,
  Sliders,
  CheckCircle,
  ShieldCheck,
} from "lucide-react"

function ToggleSwitch({
  id,
  checked,
  onChange,
  disabled,
}: {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-[#005DDC] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-[#005DDC]" : "bg-slate-200 dark:bg-zinc-700"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  )
}

export default function AccountSettingsView({ embedded = false }: { embedded?: boolean }) {
  const {
    role,
    loading,
    updating,
    message,
    fullName,
    setFullName,
    email,
    phone,
    setPhone,
    university,
    bio,
    setBio,
    avatarUrl,
    mst,
    setMst,
    website,
    setWebsite,
    address,
    setAddress,
    mapEmbedUrl,
    setMapEmbedUrl,
    reliabilityScore,
    isVerified,
    cvPercent,
    isSeekingJob,
    setIsSeekingJob,
    emailNotifications,
    setEmailNotifications,
    showPhoneToOrganizer,
    setShowPhoneToOrganizer,
    uploadingAvatar,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    hasPassword,
    handleUploadAvatar,
    handleUpdateProfile,
    handleToggleSeekingJob,
    handleToggleShowPhone,
    handleToggleEmailNotif,
    handleUpdatePassword,
  } = useAccountSettings()

  const [activeTab, setActiveTab] = useState<"info" | "password">("info")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  if (loading) return <SkeletonGenericPage />
  if (!role) return <Navigate to="/login" replace />

  const isOrg = role === "organizer" || role === "employer"

  const content = (
    <div className="w-full max-w-[1360px] mx-auto space-y-6 pb-12 animate-in fade-in duration-300 font-['Inter',sans-serif]">
      {/* Top Compact Segmented Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex items-center bg-[#ededed] dark:bg-zinc-800 p-1 rounded-[8px] gap-1 self-start">
          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={cn(
              "px-4 sm:px-5 py-2 rounded-[6px] text-[14px] font-medium transition-all cursor-pointer flex items-center gap-2",
              activeTab === "info"
                ? "bg-white dark:bg-zinc-900 text-[#222222] dark:text-zinc-100 font-semibold shadow-xs"
                : "text-[#757575] hover:text-[#222222] dark:hover:text-zinc-200"
            )}
          >
            {isOrg ? <Building2 className="w-4 h-4 stroke-[2]" /> : <Sliders className="w-4 h-4 stroke-[2]" />}
            <span>{isOrg ? "Thông tin Đơn vị / CLB" : "Cài đặt tài khoản & Quyền riêng tư"}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("password")}
            className={cn(
              "px-4 sm:px-5 py-2 rounded-[6px] text-[14px] font-medium transition-all cursor-pointer flex items-center gap-2",
              activeTab === "password"
                ? "bg-white dark:bg-zinc-900 text-[#222222] dark:text-zinc-100 font-semibold shadow-xs"
                : "text-[#757575] hover:text-[#222222] dark:hover:text-zinc-200"
            )}
          >
            <Shield className="w-4 h-4 stroke-[2]" />
            <span>Mật khẩu & Bảo mật</span>
          </button>
        </div>

        {/* User Identity Pill */}
        <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-white dark:bg-zinc-900 border border-[#ededed] dark:border-zinc-800 text-[13px] text-[#757575]">
          <span className="size-2 rounded-full bg-[#009E00]" />
          <span className="font-medium text-[#222222] dark:text-zinc-200">
            {isOrg ? "Ban tổ chức / CLB" : "Tình nguyện viên / Sinh viên"}
          </span>
        </div>
      </div>

      {/* Alert message if any */}
      {message && (
        <div
          role="alert"
          className={cn(
            "p-4 rounded-[8px] text-[14px] font-medium border flex items-center gap-3 transition-all",
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
              : "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300"
          )}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* =========================================================================
          TAB 1: SETTINGS / PROFILE INFORMATION
         ========================================================================= */}
      {activeTab === "info" && (
        <>
          {/* -------------------------------------------------------------------
              STUDENT VIEW: Account Hub & Privacy Settings (No duplication with /profile)
             ------------------------------------------------------------------- */}
          {!isOrg ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: Profile Summary Card + Link to /profile (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* 1. Profile Summary Card with CTA to /profile */}
                <div className="bg-white dark:bg-zinc-900 border border-[#ededed] dark:border-zinc-800 rounded-[16px] p-6 shadow-xs flex flex-col gap-5 relative overflow-hidden">
                  <div className="flex items-center justify-between pb-3 border-b border-[#ededed] dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-[#005DDC] stroke-[2]" />
                      <h3 className="text-[17px] font-semibold text-[#222222] dark:text-zinc-100">
                        Hồ sơ năng lực & CV ứng tuyển
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-1 rounded-full font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Điểm uy tín: {reliabilityScore}/100</span>
                      </div>
                      <span className="text-[12px] font-medium text-[#009e00] bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Đang hoạt động</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    {/* Avatar with Quick Upload */}
                    <div className="relative group size-24 rounded-full overflow-hidden border-2 border-[#ededed] dark:border-zinc-700 bg-[#f9f9f9] dark:bg-zinc-800 shrink-0">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={fullName}
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || "User")}&background=005DDC&color=fff&size=96`
                          }}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center font-bold text-2xl text-[#005DDC]">
                          {fullName ? fullName.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
                        </div>
                      )}
                      <label
                        htmlFor="student-avatar-upload"
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-all duration-200"
                        title="Thay đổi ảnh đại diện"
                      >
                        <Camera className="w-5 h-5" />
                      </label>
                      <input
                        type="file"
                        id="student-avatar-upload"
                        accept="image/*"
                        disabled={uploadingAvatar}
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) await handleUploadAvatar(file)
                        }}
                        className="hidden"
                      />
                    </div>

                    {/* Quick Specs & Info */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <h4 className="text-[18px] font-semibold text-[#222222] dark:text-zinc-100 truncate">
                        {fullName || "Nhân sự Sự kiện"}
                      </h4>
                      <p className="text-[13px] text-[#757575] flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-[#a5a5a5]" />
                        <span>{email}</span>
                      </p>
                      {phone && (
                        <p className="text-[13px] text-[#757575] flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-[#a5a5a5]" />
                          <span>{phone}</span>
                        </p>
                      )}
                      {university && (
                        <p className="text-[13px] text-[#757575] flex items-center gap-2 truncate">
                          <GraduationCap className="w-3.5 h-3.5 text-[#a5a5a5]" />
                          <span>{university}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Profile Completion Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="font-medium text-[#515151] dark:text-zinc-300">Tiến độ hoàn thiện CV</span>
                      <span className="font-semibold text-[#005DDC]">{cvPercent}%</span>
                    </div>
                    <div className="w-full bg-[#ededed] dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#005DDC] h-full rounded-full transition-all duration-500"
                        style={{ width: `${cvPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Direct Link CTA to /profile */}
                  <div className="pt-3 border-t border-[#ededed] dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <p className="text-[12px] text-[#757575] leading-relaxed">
                      Chỉnh sửa thông tin chi tiết, kinh nghiệm sự kiện, học vấn, ngoại ngữ và file CV PDF tại trang Hồ sơ.
                    </p>
                    <Link
                      href="/profile"
                      className="h-10 px-5 rounded-[8px] bg-[#005DDC] hover:bg-[#004eb7] text-white text-[13px] font-medium flex items-center gap-1.5 transition-colors shrink-0 shadow-xs group"
                    >
                      <span>Quản lý Hồ sơ & CV</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>

                {/* 2. Account Information Card */}
                <div className="bg-white dark:bg-zinc-900 border border-[#ededed] dark:border-zinc-800 rounded-[16px] p-6 shadow-xs flex flex-col gap-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#ededed] dark:border-zinc-800">
                    <ShieldCheck className="w-5 h-5 text-[#222222] dark:text-zinc-100 stroke-[1.75]" />
                    <h3 className="text-[16px] font-semibold text-[#222222] dark:text-zinc-100">
                      Thông tin tài khoản & Xác thực
                    </h3>
                  </div>

                  <div className="space-y-3.5">
                    {/* Email */}
                    <div className="flex items-center justify-between p-3.5 rounded-[10px] bg-[#f9f9f9] dark:bg-zinc-800/40 border border-[#ededed] dark:border-zinc-800">
                      <div className="space-y-0.5">
                        <p className="text-[14px] font-medium text-[#222222] dark:text-zinc-200">Email đăng nhập</p>
                        <p className="text-[13px] text-[#757575]">{email}</p>
                      </div>
                      <span className="text-[12px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                        Đã xác minh
                      </span>
                    </div>

                    {/* Số điện thoại (Zalo liên hệ) */}
                    <div className="flex items-center justify-between p-3.5 rounded-[10px] bg-[#f9f9f9] dark:bg-zinc-800/40 border border-[#ededed] dark:border-zinc-800">
                      <div className="space-y-0.5">
                        <p className="text-[14px] font-medium text-[#222222] dark:text-zinc-200">Số điện thoại (Zalo nhận việc)</p>
                        <p className="text-[13px] text-[#757575]">{phone || "Chưa cập nhật SĐT"}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="text-[13px] font-medium text-[#005DDC] hover:underline cursor-pointer"
                      >
                        {phone ? "Thay đổi" : "Cập nhật"}
                      </Link>
                    </div>

                    {/* Trạng thái sinh viên */}
                    <div className="flex items-center justify-between p-3.5 rounded-[10px] bg-[#f9f9f9] dark:bg-zinc-800/40 border border-[#ededed] dark:border-zinc-800">
                      <div className="space-y-0.5">
                        <p className="text-[14px] font-medium text-[#222222] dark:text-zinc-200">Xác thực Sinh viên / TNV</p>
                        <p className="text-[13px] text-[#757575]">
                          {isVerified
                            ? "Đã liên kết và xác minh thẻ sinh viên"
                            : "Tài khoản thành viên tiêu chuẩn"}
                        </p>
                      </div>
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[12px] font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Đã xác thực
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-600 bg-slate-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full border border-slate-200">
                          Thành viên
                        </span>
                      )}
                    </div>

                    {/* Phương thức đăng nhập */}
                    <div className="flex items-center justify-between p-3.5 rounded-[10px] bg-[#f9f9f9] dark:bg-zinc-800/40 border border-[#ededed] dark:border-zinc-800">
                      <div className="space-y-0.5">
                        <p className="text-[14px] font-medium text-[#222222] dark:text-zinc-200">Phương thức đăng nhập</p>
                        <p className="text-[13px] text-[#757575]">
                          {hasPassword ? "Email & Mật khẩu" : "Google OAuth"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("password")}
                        className="text-[13px] font-medium text-[#005DDC] hover:underline cursor-pointer"
                      >
                        {hasPassword ? "Đổi mật khẩu" : "Tạo mật khẩu"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Privacy & Notification Settings (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="bg-white dark:bg-zinc-900 border border-[#ededed] dark:border-zinc-800 rounded-[16px] p-6 shadow-xs flex flex-col gap-6">
                  {/* Section: Job Seeking & Privacy */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#ededed] dark:border-zinc-800">
                      <EyeIcon className="w-5 h-5 text-[#222222] dark:text-zinc-100 stroke-[1.75]" />
                      <div>
                        <h3 className="text-[16px] font-semibold text-[#222222] dark:text-zinc-100">
                          Quyền riêng tư & Tìm việc
                        </h3>
                        <p className="text-[12px] text-[#757575] mt-0.5">
                          Kiểm soát khả năng hiển thị hồ sơ với Nhà tuyển dụng
                        </p>
                      </div>
                    </div>

                    {/* Toggle 1: Seeking job */}
                    <div className="flex items-center justify-between gap-4 p-3 rounded-[10px] hover:bg-[#f9f9f9] dark:hover:bg-zinc-800/40 transition-colors">
                      <div className="space-y-1">
                        <label
                          htmlFor="toggle-seeking"
                          className="text-[14px] font-medium text-[#222222] dark:text-zinc-200 cursor-pointer block"
                        >
                          Bật trạng thái tìm việc sự kiện
                        </label>
                        <p className="text-[12px] text-[#757575] leading-relaxed">
                          Cho phép Ban tổ chức tìm thấy hồ sơ của bạn và gửi lời mời làm việc trực tiếp.
                        </p>
                      </div>
                      <ToggleSwitch
                        id="toggle-seeking"
                        checked={isSeekingJob}
                        onChange={handleToggleSeekingJob}
                      />
                    </div>

                    {/* Toggle 2: Show phone to organizer */}
                    <div className="flex items-center justify-between gap-4 p-3 rounded-[10px] hover:bg-[#f9f9f9] dark:hover:bg-zinc-800/40 transition-colors">
                      <div className="space-y-1">
                        <label
                          htmlFor="toggle-phone"
                          className="text-[14px] font-medium text-[#222222] dark:text-zinc-200 cursor-pointer block"
                        >
                          Chia sẻ SĐT (Zalo) khi trúng tuyển
                        </label>
                        <p className="text-[12px] text-[#757575] leading-relaxed">
                          Ban tổ chức sau khi duyệt đơn có thể kết nối Zalo để thêm bạn vào nhóm điều phối.
                        </p>
                      </div>
                      <ToggleSwitch
                        id="toggle-phone"
                        checked={showPhoneToOrganizer}
                        onChange={handleToggleShowPhone}
                      />
                    </div>
                  </div>

                  {/* Section: Notification Preferences */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#ededed] dark:border-zinc-800">
                      <Bell className="w-5 h-5 text-[#222222] dark:text-zinc-100 stroke-[1.75]" />
                      <div>
                        <h3 className="text-[16px] font-semibold text-[#222222] dark:text-zinc-100">
                          Tùy chọn Thông báo
                        </h3>
                        <p className="text-[12px] text-[#757575] mt-0.5">
                          Tùy chỉnh các kênh nhận thông báo từ hệ thống
                        </p>
                      </div>
                    </div>

                    {/* Toggle 3: Email notifications */}
                    <div className="flex items-center justify-between gap-4 p-3 rounded-[10px] hover:bg-[#f9f9f9] dark:hover:bg-zinc-800/40 transition-colors">
                      <div className="space-y-1">
                        <label
                          htmlFor="toggle-email-notif"
                          className="text-[14px] font-medium text-[#222222] dark:text-zinc-200 cursor-pointer block"
                        >
                          Nhận email việc làm sự kiện mới
                        </label>
                        <p className="text-[12px] text-[#757575] leading-relaxed">
                          Gửi gợi ý các sự kiện mới đăng tuyển phù hợp với trường ĐH và khu vực Đà Nẵng.
                        </p>
                      </div>
                      <ToggleSwitch
                        id="toggle-email-notif"
                        checked={emailNotifications}
                        onChange={handleToggleEmailNotif}
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* -------------------------------------------------------------------
                ORGANIZER VIEW: Full Organization Profile Management Form
               ------------------------------------------------------------------- */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: Logo (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Logo Card */}
                <div className="bg-white dark:bg-zinc-900 border border-[#ededed] dark:border-zinc-800 rounded-[12px] p-5 sm:p-6 shadow-none flex flex-col gap-5 items-center text-center">
                  <div className="w-full flex items-center gap-2 pb-1 border-b border-[#ededed] dark:border-zinc-800 text-left">
                    <Camera className="w-5 h-5 text-[#222222] dark:text-zinc-100 stroke-[1.75]" />
                    <h3 className="text-[16px] font-semibold text-[#222222] dark:text-zinc-100">
                      Logo Đơn vị / CLB
                    </h3>
                  </div>

                  <div className="relative group size-32 rounded-[12px] overflow-hidden border border-[#cbcbcb] dark:border-zinc-700 bg-[#f9f9f9] dark:bg-zinc-800 flex items-center justify-center">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={fullName}
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || "Organizer")}&background=222222&color=fff&size=120`
                        }}
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-[#757575]">
                        {fullName ? fullName.charAt(0).toUpperCase() : <Building2 className="w-10 h-10" />}
                      </span>
                    )}

                    <label
                      htmlFor="org-avatar-upload-file"
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-all duration-200 gap-1"
                    >
                      <Camera className="w-6 h-6" />
                      <span className="text-[12px] font-medium">Thay đổi</span>
                    </label>

                    <input
                      type="file"
                      id="org-avatar-upload-file"
                      accept="image/*"
                      disabled={uploadingAvatar}
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) await handleUploadAvatar(file)
                      }}
                      className="hidden"
                    />
                  </div>

                  <div className="flex flex-col items-center gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => document.getElementById("org-avatar-upload-file")?.click()}
                      disabled={uploadingAvatar}
                      className="h-[40px] px-4 rounded-[8px] border border-[#cbcbcb] dark:border-zinc-700 hover:bg-[#ededed]/60 dark:hover:bg-zinc-800 text-[13px] font-medium text-[#222222] dark:text-zinc-200 transition-colors flex items-center justify-center gap-2 w-full cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-[#757575]" />
                      <span>{uploadingAvatar ? "Đang tải lên..." : "Tải logo mới"}</span>
                    </button>
                    <p className="text-[12px] text-[#757575]">
                      Tỉ lệ 1:1, định dạng JPG/PNG. Tối đa 2MB.
                    </p>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Organizer Main Form (8 cols) */}
              <div className="lg:col-span-8">
                <form
                  onSubmit={handleUpdateProfile}
                  className="bg-white dark:bg-zinc-900 border border-[#ededed] dark:border-zinc-800 rounded-[12px] p-5 sm:p-7 shadow-none flex flex-col gap-6"
                >
                  <div className="flex items-center gap-2 pb-2 border-b border-[#ededed] dark:border-zinc-800">
                    <Briefcase className="w-5 h-5 text-[#222222] dark:text-zinc-100 stroke-[1.75]" />
                    <div>
                      <h2 className="text-[17px] font-semibold text-[#222222] dark:text-zinc-100 leading-tight">
                        Hồ sơ Đơn vị / CLB Tổ chức sự kiện
                      </h2>
                      <p className="text-[12px] text-[#757575] mt-0.5">
                        Cập nhật hồ sơ đầy đủ giúp gia tăng độ uy tín với ứng viên sự kiện
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">
                    {/* Row 1: Tên đơn vị + Mã định danh */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative w-full">
                        <div className="border border-[#cbcbcb] dark:border-zinc-700 rounded-[8px] h-[48px] px-4 flex items-center w-full bg-transparent focus-within:border-[#222222] dark:focus-within:border-zinc-300 transition">
                          <input
                            id="org-name"
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="VD: CLB Sự kiện Bách Khoa / Danang Live Events"
                            className="w-full bg-transparent border-none text-[15px] font-normal text-[#222222] dark:text-zinc-100 placeholder-[#a5a5a5] focus:outline-none focus:ring-0 p-0"
                          />
                        </div>
                        <label
                          htmlFor="org-name"
                          className="absolute -top-[10px] left-3 bg-white dark:bg-zinc-900 px-1.5 text-[13px] font-medium text-[#222222] dark:text-zinc-300 leading-none flex items-center gap-0.5 z-10"
                        >
                          Tên Đơn vị / CLB <span className="text-red-500">*</span>
                        </label>
                      </div>

                      <div className="relative w-full">
                        <div className="border border-[#cbcbcb] dark:border-zinc-700 rounded-[8px] h-[48px] px-4 flex items-center w-full bg-transparent focus-within:border-[#222222] dark:focus-within:border-zinc-300 transition">
                          <input
                            id="org-mst"
                            type="text"
                            value={mst}
                            onChange={(e) => setMst(e.target.value)}
                            placeholder="Mã định danh CLB hoặc MST (nếu có)..."
                            className="w-full bg-transparent border-none text-[15px] font-normal text-[#222222] dark:text-zinc-100 placeholder-[#a5a5a5] focus:outline-none focus:ring-0 p-0"
                          />
                        </div>
                        <label
                          htmlFor="org-mst"
                          className="absolute -top-[10px] left-3 bg-white dark:bg-zinc-900 px-1.5 text-[13px] font-medium text-[#222222] dark:text-zinc-300 leading-none z-10"
                        >
                          Mã số thuế / Mã định danh CLB
                        </label>
                      </div>
                    </div>

                    {/* Row 2: Số điện thoại + Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative w-full">
                        <div className="border border-[#cbcbcb] dark:border-zinc-700 rounded-[8px] h-[48px] px-4 flex items-center w-full bg-transparent focus-within:border-[#222222] dark:focus-within:border-zinc-300 transition">
                          <input
                            id="org-phone"
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="0905 xxx xxx"
                            className="w-full bg-transparent border-none text-[15px] font-normal text-[#222222] dark:text-zinc-100 placeholder-[#a5a5a5] focus:outline-none focus:ring-0 p-0"
                          />
                        </div>
                        <label
                          htmlFor="org-phone"
                          className="absolute -top-[10px] left-3 bg-white dark:bg-zinc-900 px-1.5 text-[13px] font-medium text-[#222222] dark:text-zinc-300 leading-none flex items-center gap-0.5 z-10"
                        >
                          Số điện thoại liên hệ <span className="text-red-500">*</span>
                        </label>
                      </div>

                      <div className="relative w-full">
                        <div className="border border-[#ededed] dark:border-zinc-800 rounded-[8px] h-[48px] px-4 flex items-center w-full bg-[#f9f9f9] dark:bg-zinc-800/60 cursor-not-allowed">
                          <input
                            id="org-email"
                            type="email"
                            disabled
                            value={email}
                            className="w-full bg-transparent border-none text-[15px] font-normal text-[#757575] focus:outline-none focus:ring-0 p-0 cursor-not-allowed"
                          />
                        </div>
                        <label
                          htmlFor="org-email"
                          className="absolute -top-[10px] left-3 bg-white dark:bg-zinc-900 px-1.5 text-[13px] font-medium text-[#757575] leading-none z-10"
                        >
                          Email tài khoản (không thể sửa)
                        </label>
                      </div>
                    </div>

                    {/* Row 3: Website/Fanpage */}
                    <div className="relative w-full">
                      <div className="border border-[#cbcbcb] dark:border-zinc-700 rounded-[8px] h-[48px] px-4 flex items-center w-full bg-transparent focus-within:border-[#222222] dark:focus-within:border-zinc-300 transition">
                        <input
                          id="org-website"
                          type="url"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://facebook.com/clb..."
                          className="w-full bg-transparent border-none text-[15px] font-normal text-[#222222] dark:text-zinc-100 placeholder-[#a5a5a5] focus:outline-none focus:ring-0 p-0"
                        />
                      </div>
                      <label
                        htmlFor="org-website"
                        className="absolute -top-[10px] left-3 bg-white dark:bg-zinc-900 px-1.5 text-[13px] font-medium text-[#222222] dark:text-zinc-300 leading-none z-10"
                      >
                        Website / Fanpage Facebook
                      </label>
                    </div>

                    {/* Row 4: Address */}
                    <div className="relative w-full">
                      <div className="border border-[#cbcbcb] dark:border-zinc-700 rounded-[8px] h-[48px] px-4 flex items-center w-full bg-transparent focus-within:border-[#222222] dark:focus-within:border-zinc-300 transition">
                        <input
                          id="org-address"
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="VD: 54 Nguyễn Lương Bằng, P. Hoà Khánh Bắc, Q. Liên Chiểu, Đà Nẵng"
                          className="w-full bg-transparent border-none text-[15px] font-normal text-[#222222] dark:text-zinc-100 placeholder-[#a5a5a5] focus:outline-none focus:ring-0 p-0"
                        />
                      </div>
                      <label
                        htmlFor="org-address"
                        className="absolute -top-[10px] left-3 bg-white dark:bg-zinc-900 px-1.5 text-[13px] font-medium text-[#222222] dark:text-zinc-300 leading-none z-10"
                      >
                        Địa chỉ hoạt động / Văn phòng tại Đà Nẵng
                      </label>
                    </div>

                    {/* Row 4.5: Google Maps Embed URL */}
                    <div className="relative w-full space-y-1.5">
                      <div className="border border-[#cbcbcb] dark:border-zinc-700 rounded-[8px] h-[48px] px-4 flex items-center w-full bg-transparent focus-within:border-[#222222] dark:focus-within:border-zinc-300 transition">
                        <input
                          id="org-map-embed"
                          type="text"
                          value={mapEmbedUrl}
                          onChange={(e) => setMapEmbedUrl(e.target.value)}
                          placeholder='Dán mã iframe hoặc link (VD: <iframe src="https://www.google.com/maps/embed?..."...)'
                          className="w-full bg-transparent border-none text-[14px] font-normal text-[#222222] dark:text-zinc-100 placeholder-[#a5a5a5] focus:outline-none focus:ring-0 p-0"
                        />
                      </div>
                      <label
                        htmlFor="org-map-embed"
                        className="absolute -top-[10px] left-3 bg-white dark:bg-zinc-900 px-1.5 text-[13px] font-medium text-[#222222] dark:text-zinc-300 leading-none z-10"
                      >
                        Link nhúng Google Maps (Tùy chọn)
                      </label>
                      <p className="text-[12px] text-[#757575] pl-1">
                        💡 Hướng dẫn: Mở Google Maps &gt; Chọn địa điểm &gt; Bấm Chia sẻ &gt; Nhúng bản đồ &gt; Sao chép mã HTML rồi dán vào đây.
                      </p>
                    </div>

                    {/* Row 5: Bio */}
                    <div className="relative w-full">
                      <div className="border border-[#cbcbcb] dark:border-zinc-700 rounded-[8px] p-4 flex w-full bg-transparent focus-within:border-[#222222] dark:focus-within:border-zinc-300 transition">
                        <textarea
                          id="org-bio"
                          rows={4}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Giới thiệu sơ lược về mục tiêu, các sự kiện tiêu biểu và giá trị cốt lõi của Đơn vị / CLB..."
                          className="w-full bg-transparent border-none text-[15px] font-normal text-[#222222] dark:text-zinc-100 placeholder-[#a5a5a5] focus:outline-none focus:ring-0 p-0 resize-y"
                        />
                      </div>
                      <label
                        htmlFor="org-bio"
                        className="absolute -top-[10px] left-3 bg-white dark:bg-zinc-900 px-1.5 text-[13px] font-medium text-[#222222] dark:text-zinc-300 leading-none z-10"
                      >
                        Mô tả giới thiệu Đơn vị / CLB
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-[#ededed] dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-[12px] text-[#757575] flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-[#222222] dark:text-zinc-400" />
                      Dữ liệu được lưu trữ bảo mật trên hệ thống EventMate
                    </span>

                    <button
                      type="submit"
                      disabled={updating}
                      className="h-[46px] px-8 rounded-[8px] text-white font-medium text-[14px] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 bg-[#222222] hover:bg-black dark:bg-white dark:text-[#222222] dark:hover:bg-zinc-200"
                    >
                      {updating ? (
                        "Đang lưu..."
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Lưu thay đổi</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}
        </>
      )}

      {/* =========================================================================
          TAB 2: PASSWORD & SECURITY (Shared for both Student & Organizer)
         ========================================================================= */}
      {activeTab === "password" && (
        <div className="max-w-[640px]">
          <form
            onSubmit={handleUpdatePassword}
            className="bg-white dark:bg-zinc-900 border border-[#ededed] dark:border-zinc-800 rounded-[16px] p-5 sm:p-7 shadow-xs flex flex-col gap-6"
          >
            <div className="flex items-center gap-2 pb-2 border-b border-[#ededed] dark:border-zinc-800">
              <Lock className="w-5 h-5 text-[#222222] dark:text-zinc-100 stroke-[1.75]" />
              <div>
                <h3 className="text-[17px] font-semibold text-[#222222] dark:text-zinc-100 leading-tight">
                  {hasPassword ? "Đổi mật khẩu tài khoản" : "Tạo mật khẩu đăng nhập"}
                </h3>
                <p className="text-[12px] text-[#757575] mt-0.5">
                  {hasPassword
                    ? "Bảo vệ tài khoản với mật khẩu mạnh gồm chữ hoa, chữ thường và số"
                    : "Tài khoản hiện đang đăng nhập qua Google. Bạn có thể đặt mật khẩu để đăng nhập trực tiếp"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {/* Current Password (if email auth) */}
              {hasPassword && (
                <div className="relative w-full">
                  <div
                    className={cn(
                      "border border-[#cbcbcb] dark:border-zinc-700 rounded-[8px] h-[48px] px-4 flex items-center justify-between w-full bg-transparent transition",
                      isOrg ? "focus-within:border-[#222222] dark:focus-within:border-zinc-300" : "focus-within:border-[#005DDC]"
                    )}
                  >
                    <input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Nhập mật khẩu hiện tại..."
                      className="w-full bg-transparent border-none text-[15px] font-normal text-[#222222] dark:text-zinc-100 placeholder-[#a5a5a5] focus:outline-none focus:ring-0 p-0"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="text-[#757575] hover:text-[#222222] dark:hover:text-zinc-200 cursor-pointer p-1"
                      aria-label={showCurrentPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <label
                    htmlFor="current-password"
                    className="absolute -top-[10px] left-3 bg-white dark:bg-zinc-900 px-1.5 text-[13px] font-medium text-[#222222] dark:text-zinc-300 leading-none z-10"
                  >
                    Mật khẩu hiện tại
                  </label>
                </div>
              )}

              {/* New Password */}
              <div className="relative w-full">
                <div
                  className={cn(
                    "border border-[#cbcbcb] dark:border-zinc-700 rounded-[8px] h-[48px] px-4 flex items-center justify-between w-full bg-transparent transition",
                    isOrg ? "focus-within:border-[#222222] dark:focus-within:border-zinc-300" : "focus-within:border-[#005DDC]"
                  )}
                >
                  <input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự..."
                    className="w-full bg-transparent border-none text-[15px] font-normal text-[#222222] dark:text-zinc-100 placeholder-[#a5a5a5] focus:outline-none focus:ring-0 p-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-[#757575] hover:text-[#222222] dark:hover:text-zinc-200 cursor-pointer p-1"
                    aria-label={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <label
                  htmlFor="new-password"
                  className="absolute -top-[10px] left-3 bg-white dark:bg-zinc-900 px-1.5 text-[13px] font-medium text-[#222222] dark:text-zinc-300 leading-none flex items-center gap-0.5 z-10"
                >
                  {hasPassword ? "Mật khẩu mới" : "Tạo mật khẩu mới"} <span className="text-red-500">*</span>
                </label>
              </div>

              {/* Confirm New Password */}
              <div className="relative w-full">
                <div
                  className={cn(
                    "border border-[#cbcbcb] dark:border-zinc-700 rounded-[8px] h-[48px] px-4 flex items-center justify-between w-full bg-transparent transition",
                    isOrg ? "focus-within:border-[#222222] dark:focus-within:border-zinc-300" : "focus-within:border-[#005DDC]"
                  )}
                >
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới..."
                    className="w-full bg-transparent border-none text-[15px] font-normal text-[#222222] dark:text-zinc-100 placeholder-[#a5a5a5] focus:outline-none focus:ring-0 p-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-[#757575] hover:text-[#222222] dark:hover:text-zinc-200 cursor-pointer p-1"
                    aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <label
                  htmlFor="confirm-password"
                  className="absolute -top-[10px] left-3 bg-white dark:bg-zinc-900 px-1.5 text-[13px] font-medium text-[#222222] dark:text-zinc-300 leading-none flex items-center gap-0.5 z-10"
                >
                  Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-[#ededed] dark:border-zinc-800 flex justify-end">
              <button
                type="submit"
                disabled={updating}
                className={cn(
                  "h-[46px] px-8 rounded-[8px] text-white font-medium text-[14px] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50",
                  isOrg
                    ? "bg-[#222222] hover:bg-black dark:bg-white dark:text-[#222222] dark:hover:bg-zinc-200"
                    : "bg-[#005DDC] hover:bg-[#004bb3]"
                )}
              >
                {updating ? (
                  "Đang xử lý..."
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>{hasPassword ? "Cập nhật mật khẩu" : "Lưu mật khẩu mới"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )

  if (embedded) {
    return content
  }

  return <MainLayout role={role ?? undefined}>{content}</MainLayout>
}
