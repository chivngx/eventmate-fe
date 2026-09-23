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
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ArrowRight,
  Bell,
  Sliders,
  ShieldCheck,
  Globe,
  MapPin,
  ExternalLink,
  Sparkles,
  KeyRound,
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
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-700"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-zinc-900 shadow-sm ring-0 transition duration-200 ease-in-out",
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
    isPremium,
    cvPercent,
    isSeekingJob,
    emailNotifications,
    showPhoneToOrganizer,
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
    <div className="w-full space-y-6 pb-16 font-['Inter',sans-serif]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Cài đặt tài khoản
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {isOrg
              ? "Quản lý thông tin thương hiệu đơn vị, thông tin liên hệ và bảo mật"
              : "Quản lý thông tin đăng nhập, thiết lập quyền riêng tư và thông báo"}
          </p>
        </div>

        {/* User Identity Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 self-start sm:self-auto">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span>{isOrg ? "Ban tổ chức / Doanh nghiệp" : "Sinh viên / Tình nguyện viên"}</span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setActiveTab("info")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer",
            activeTab === "info"
              ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          )}
        >
          {isOrg ? <Building2 className="w-4 h-4" /> : <Sliders className="w-4 h-4" />}
          <span>{isOrg ? "Thông tin Đơn vị & Liên hệ" : "Tài khoản & Quyền riêng tư"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("password")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer",
            activeTab === "password"
              ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          )}
        >
          <KeyRound className="w-4 h-4" />
          <span>Mật khẩu & Bảo mật</span>
        </button>
      </div>

      {/* Status Alert Banner */}
      {message && (
        <div
          role="alert"
          className={cn(
            "p-4 rounded-lg text-sm font-medium border flex items-center gap-3 transition-all",
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800/60 dark:text-emerald-300"
              : "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-800/60 dark:text-rose-300"
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
              STUDENT VIEW: Account Hub & Privacy Settings
             ------------------------------------------------------------------- */}
          {!isOrg ? (
            <div className="space-y-6">
              {/* Card 1: Profile Summary & Link to /profile */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <User className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                    <div>
                      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                        Thông tin Tài khoản & Hồ sơ ứng tuyển
                      </h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Ảnh đại diện và thông tin cơ bản liên kết với hồ sơ ứng tuyển sự kiện
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-2.5 py-1 rounded-full font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Uy tín: {reliabilityScore}/100</span>
                    </div>
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Đã xác thực
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-700">
                        Thành viên
                      </span>
                    )}
                  </div>
                </div>

                {/* Avatar Horizontal Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="relative group size-20 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 shrink-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={fullName}
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || "User")}&background=27272a&color=fff&size=80`
                        }}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center font-semibold text-xl text-zinc-700 dark:text-zinc-200">
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

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {fullName || "Nhân sự Sự kiện"}
                      </h3>
                      <button
                        type="button"
                        onClick={() => document.getElementById("student-avatar-upload")?.click()}
                        disabled={uploadingAvatar}
                        className="text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white underline cursor-pointer"
                      >
                        {uploadingAvatar ? "Đang tải lên..." : "Đổi ảnh"}
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4" />
                        {email}
                      </span>
                      {phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-4 h-4" />
                          {phone}
                        </span>
                      )}
                      {university && (
                        <span className="flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4" />
                          {university}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* CV Progress Banner & Link to /profile */}
                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 max-w-md">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">
                        Tiến độ hoàn thiện hồ sơ CV
                      </span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{cvPercent}%</span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-zinc-900 dark:bg-zinc-100 h-full rounded-full transition-all duration-500"
                        style={{ width: `${cvPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Cập nhật kỹ năng, kinh nghiệm và tải CV PDF để nâng cao cơ hội được duyệt
                    </p>
                  </div>

                  <Link
                    href="/profile"
                    className="h-9 px-4 rounded-lg bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs"
                  >
                    <span>Quản lý Hồ sơ chi tiết</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Card 2: Privacy & Job Preferences */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-6">
                <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <Eye className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                  <div>
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      Quyền riêng tư & Cơ hội việc làm
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Kiểm soát cách Nhà tuyển dụng tìm kiếm và liên hệ với bạn
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {/* Toggle 1: Seeking Job */}
                  <div className="py-4 flex items-center justify-between gap-4 first:pt-0">
                    <div className="space-y-0.5">
                      <label
                        htmlFor="toggle-seeking"
                        className="text-sm font-medium text-zinc-900 dark:text-zinc-200 cursor-pointer block"
                      >
                        Bật trạng thái sẵn sàng nhận việc sự kiện
                      </label>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Cho phép các Ban tổ chức tìm thấy hồ sơ của bạn và gửi lời mời tham gia sự kiện trực tiếp.
                      </p>
                    </div>
                    <ToggleSwitch
                      id="toggle-seeking"
                      checked={isSeekingJob}
                      onChange={handleToggleSeekingJob}
                    />
                  </div>

                  {/* Toggle 2: Show Phone */}
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <label
                        htmlFor="toggle-phone"
                        className="text-sm font-medium text-zinc-900 dark:text-zinc-200 cursor-pointer block"
                      >
                        Chia sẻ số điện thoại / Zalo khi trúng tuyển
                      </label>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Sau khi hồ sơ được duyệt, Ban tổ chức có thể kết nối Zalo để thêm bạn vào nhóm điều phối sự kiện.
                      </p>
                    </div>
                    <ToggleSwitch
                      id="toggle-phone"
                      checked={showPhoneToOrganizer}
                      onChange={handleToggleShowPhone}
                    />
                  </div>

                  {/* Toggle 3: Email Notifications */}
                  <div className="py-4 flex items-center justify-between gap-4 last:pb-0">
                    <div className="space-y-0.5">
                      <label
                        htmlFor="toggle-email-notif"
                        className="text-sm font-medium text-zinc-900 dark:text-zinc-200 cursor-pointer block"
                      >
                        Nhận email thông báo sự kiện mới
                      </label>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Nhận thông báo khi có việc làm sự kiện mới phù hợp với khu vực và trường đại học của bạn.
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
          ) : (
            /* -------------------------------------------------------------------
                ORGANIZER VIEW: Modern 2-Column Layout
               ------------------------------------------------------------------- */
            <form onSubmit={handleUpdateProfile}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LEFT COLUMN: 4 cols - Sticky Brand Card & Quick Actions */}
                <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-4">
                  {/* Brand Card */}
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 shadow-2xs space-y-4">
                    <div className="flex flex-col items-center text-center">
                      {/* Logo / Avatar */}
                      <div className="relative group size-24 rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 shrink-0 flex items-center justify-center mb-3">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={fullName}
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || "Organizer")}&background=27272a&color=fff&size=96`
                            }}
                            className="size-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl font-bold text-slate-400">
                            {fullName ? fullName.charAt(0).toUpperCase() : <Building2 className="size-10 text-slate-400" />}
                          </span>
                        )}

                        <label
                          htmlFor="org-avatar-upload-file"
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-all duration-200 gap-1"
                        >
                          <Camera className="size-5" />
                          <span className="text-xs font-medium">Đổi logo</span>
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

                      <h3 className="font-bold text-base text-slate-900 dark:text-zinc-100 truncate w-full">
                        {fullName || "Chưa đặt tên đơn vị"}
                      </h3>

                      {mst && (
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                          MST: {mst}
                        </p>
                      )}

                      <div className="mt-2.5 flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="size-3.5 text-emerald-600" />
                          <span>Đã xác thực BTC</span>
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                      <button
                        type="submit"
                        disabled={updating}
                        className="w-full h-10 rounded-xl bg-slate-900 hover:bg-black dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs disabled:opacity-50"
                      >
                        {updating ? (
                          "Đang lưu..."
                        ) : (
                          <>
                            <Check className="size-4" />
                            <span>Lưu thay đổi</span>
                          </>
                        )}
                      </button>

                      {website && (
                        <a
                          href={website.startsWith("http") ? website : `https://${website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full h-9 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <span>Xem trang web / Fanpage</span>
                          <ExternalLink className="size-3.5 text-slate-400" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Subscription & Quota Widget */}
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center justify-center">
                          <Sparkles className="size-4" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                          Gói dịch vụ
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-700">
                        Cơ bản
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                      Nâng cấp gói tài trợ để tăng độ hiển thị tin tuyển dụng và tiếp cận nhân sự chất lượng.
                    </p>

                    <Link
                      href="/pricing"
                      className="w-full h-8.5 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Xem các gói tài trợ</span>
                      <ExternalLink className="size-3.5 text-slate-400" />
                    </Link>
                  </div>
                </div>

                {/* RIGHT COLUMN: 8 cols - Grouped Form Cards */}
                <div className="lg:col-span-8 space-y-5">
                  {/* Card 1: Brand & Organization Details */}
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-2xs space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
                      <Building2 className="size-4.5 text-slate-600 dark:text-zinc-400" />
                      <div>
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-zinc-100">
                          Thông tin Đơn vị & Thương hiệu
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                          Hiển thị công khai trên trang sự kiện và hồ sơ nhà tuyển dụng
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="org-name"
                          className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1"
                        >
                          Tên Đơn vị / CLB <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="org-name"
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="VD: CLB Sự kiện Bách Khoa / Danang Live Events"
                          className="h-9.5 w-full px-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-slate-900 dark:focus:ring-zinc-100 transition-colors"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="org-mst"
                          className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1"
                        >
                          Mã số thuế / Mã định danh CLB
                        </label>
                        <input
                          id="org-mst"
                          type="text"
                          value={mst}
                          onChange={(e) => setMst(e.target.value)}
                          placeholder="VD: 0401xxxxxx hoặc CLB-DUT-2024"
                          className="h-9.5 w-full px-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-slate-900 dark:focus:ring-zinc-100 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="org-bio"
                        className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1"
                      >
                        Mô tả giới thiệu Đơn vị / CLB
                      </label>
                      <textarea
                        id="org-bio"
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Giới thiệu sơ lược về mục tiêu, các sự kiện tiêu biểu và giá trị cốt lõi của Đơn vị / CLB..."
                        className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-slate-900 dark:focus:ring-zinc-100 transition-colors resize-y leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Card 2: Contact & Location */}
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-2xs space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
                      <MapPin className="size-4.5 text-slate-600 dark:text-zinc-400" />
                      <div>
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-zinc-100">
                          Thông tin Liên hệ & Địa điểm
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                          Kênh liên lạc chính thức để ứng viên và ban quản trị kết nối
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="org-phone"
                          className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1"
                        >
                          Số điện thoại liên hệ <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="size-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            id="org-phone"
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="0905 xxx xxx"
                            className="h-9.5 w-full pl-9 pr-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-slate-900 dark:focus:ring-zinc-100 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="org-email"
                          className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1"
                        >
                          Email tài khoản (chỉ đọc)
                        </label>
                        <div className="relative">
                          <Mail className="size-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            id="org-email"
                            type="email"
                            disabled
                            value={email}
                            className="h-9.5 w-full pl-9 pr-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="org-website"
                          className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1"
                        >
                          Website hoặc Fanpage Facebook
                        </label>
                        <div className="relative">
                          <Globe className="size-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            id="org-website"
                            type="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="https://facebook.com/clb..."
                            className="h-9.5 w-full pl-9 pr-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-slate-900 dark:focus:ring-zinc-100 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="org-address"
                          className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1"
                        >
                          Địa chỉ hoạt động tại Đà Nẵng
                        </label>
                        <div className="relative">
                          <MapPin className="size-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            id="org-address"
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="VD: 54 Nguyễn Lương Bằng, Liên Chiểu"
                            className="h-9.5 w-full pl-9 pr-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-slate-900 dark:focus:ring-zinc-100 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="org-map-embed"
                        className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1"
                      >
                        Link nhúng Google Maps (Tùy chọn)
                      </label>
                      <input
                        id="org-map-embed"
                        type="text"
                        value={mapEmbedUrl}
                        onChange={(e) => setMapEmbedUrl(e.target.value)}
                        placeholder='Dán link hoặc mã iframe: <iframe src="https://www.google.com/maps/embed?..."></iframe>'
                        className="h-9.5 w-full px-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-slate-900 dark:focus:ring-zinc-100 transition-colors"
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        Hướng dẫn: Mở Google Maps &gt; Chia sẻ &gt; Nhúng bản đồ &gt; Sao chép mã iframe và dán vào đây.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </>
      )}

      {/* =========================================================================
          TAB 2: PASSWORD & SECURITY (Shared for both Student & Organizer)
         ========================================================================= */}
      {activeTab === "password" && (
        <div className="max-w-xl">
          <form
            onSubmit={handleUpdatePassword}
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-6"
          >
            <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <Lock className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {hasPassword ? "Đổi mật khẩu tài khoản" : "Tạo mật khẩu đăng nhập"}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {hasPassword
                    ? "Mật khẩu nên chứa tối thiểu 6 ký tự kết hợp chữ cái và chữ số"
                    : "Tài khoản hiện đang đăng nhập qua Google OAuth. Bạn có thể tạo mật khẩu để đăng nhập trực tiếp bằng email"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Current Password (if already has password) */}
              {hasPassword && (
                <div>
                  <label
                    htmlFor="current-password"
                    className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    Mật khẩu hiện tại
                  </label>
                  <div className="relative">
                    <input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Nhập mật khẩu hiện tại..."
                      className="h-10 w-full pl-3.5 pr-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                      aria-label={showCurrentPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* New Password */}
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
                >
                  {hasPassword ? "Mật khẩu mới" : "Tạo mật khẩu mới"} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự..."
                    className="h-10 w-full pl-3.5 pr-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                    aria-label={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
                >
                  Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới..."
                    className="h-10 w-full pl-3.5 pr-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                    aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={updating}
                className="h-10 px-6 rounded-lg bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
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
