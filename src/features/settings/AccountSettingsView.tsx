"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Navigate } from "@/lib/router"
import { cn } from "@/lib/utils"
import MainLayout from "@/components/layout/MainLayout"
import { SkeletonGenericPage } from "@/components/ui/skeleton"
import StudentEkycModal from "./components/StudentEkycModal"
import { useAccountSettings } from "./hooks/useAccountSettings"
import { useUser } from "@/components/providers/AuthProvider"
import {
  Building2,
  User,
  Lock,
  Mail,
  Phone,
  Camera,
  Check,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Globe,
  MapPin,
  ExternalLink,
  Sparkles,
  KeyRound,
  FileText,
  Clock,
  Settings
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
  const [isEkycModalOpen, setIsEkycModalOpen] = useState(false)
  const { refreshProfile } = useUser()

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
    kycStatus,
    kycData,
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
    gender,
    setGender,
    birthYear,
    setBirthYear,
    university,
    setUniversity,
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
  if (!role) return <Navigate to="/?auth=login&redirect=/settings" replace />

  const isOrg = role === "organizer" || role === "employer"

  const content = (
    <div className="w-full font-['Inter',sans-serif] pb-24">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-zinc-200 dark:border-zinc-800">
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
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 self-start sm:self-auto shadow-sm">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span>{isOrg ? "Ban tổ chức / Doanh nghiệp" : "Sinh viên / Tình nguyện viên"}</span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className={cn("grid gap-8 items-start", isOrg ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1 max-w-3xl mx-auto w-full")}>
        {/* LEFT COLUMN (Sticky Sidebar) */}
        {isOrg && (
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          {/* Profile Summary Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            {/* Background Pattern / Tint (Subtle) */}
            <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-zinc-100 to-transparent dark:from-zinc-800/50" />
            
            {/* Avatar / Logo */}
            <div className="relative group size-24 rounded-full overflow-hidden border-4 border-white dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4 shadow-sm z-10">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || (isOrg ? "Organizer" : "User"))}&background=27272a&color=fff&size=96`
                  }}
                  className="size-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-zinc-400">
                  {fullName ? fullName.charAt(0).toUpperCase() : (isOrg ? <Building2 className="size-10" /> : <User className="size-10" />)}
                </span>
              )}

              <label
                htmlFor="avatar-upload-file"
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-all duration-200 gap-1"
                title="Thay đổi ảnh/logo"
              >
                <Camera className="size-5" />
                <span className="text-[10px] font-medium uppercase tracking-wider">{isOrg ? "Đổi logo" : "Đổi ảnh"}</span>
              </label>

              <input
                type="file"
                id="avatar-upload-file"
                accept="image/*"
                disabled={uploadingAvatar}
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (file) await handleUploadAvatar(file)
                }}
                className="hidden"
              />
            </div>

            {/* Name & Identifier */}
            <h2 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 truncate w-full px-2 z-10">
              {fullName || (isOrg ? "Chưa đặt tên đơn vị" : "Người dùng sự kiện")}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 z-10">
              {isOrg ? (mst ? `MST: ${mst}` : "Chưa cập nhật MST") : email}
            </p>

            {/* Badges */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 z-10">
              {isVerified || kycStatus === "approved" ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Đã xác thực CCCD</span>
                </span>
              ) : kycStatus === "pending" ? (
                <button
                  type="button"
                  onClick={() => setIsEkycModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 px-3 py-1 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
                >
                  <Clock className="size-3.5 text-amber-600 animate-spin" />
                  <span>Chờ Admin duyệt eKYC</span>
                </button>
              ) : kycStatus === "rejected" ? (
                <button
                  type="button"
                  onClick={() => setIsEkycModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 px-3 py-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors cursor-pointer"
                >
                  <AlertCircle className="size-3.5 text-red-600" />
                  <span>eKYC bị từ chối (Làm lại)</span>
                </button>
              ) : !isOrg ? (
                <button 
                  type="button"
                  onClick={() => setIsEkycModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 px-3 py-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors active:scale-95 cursor-pointer"
                >
                  <ShieldCheck className="size-3.5" />
                  <span>Xác thực ngay (eKYC)</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 rounded-full">
                  Chưa xác minh
                </span>
              )}
              
              {!isOrg && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/50 px-2.5 py-1 rounded-full">
                  <Sparkles className="size-3.5 text-amber-500" />
                  <span>Uy tín: {reliabilityScore}</span>
                </span>
              )}
            </div>


          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-1.5">
            <button
              onClick={() => setActiveTab("info")}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm transition-all duration-200 text-left font-medium border border-transparent outline-none focus-visible:ring-2 focus-visible:ring-zinc-900",
                activeTab === "info"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm border-zinc-200/80 dark:border-zinc-800"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              {isOrg ? <Building2 className="size-4.5" /> : <Settings className="size-4.5" />}
              <span>{isOrg ? "Thông tin Đơn vị & Liên hệ" : "Hồ sơ & Cài đặt chung"}</span>
            </button>

            <button
              onClick={() => setActiveTab("password")}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm transition-all duration-200 text-left font-medium border border-transparent outline-none focus-visible:ring-2 focus-visible:ring-zinc-900",
                activeTab === "password"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm border-zinc-200/80 dark:border-zinc-800"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <KeyRound className="size-4.5" />
              <span>Mật khẩu & Bảo mật</span>
            </button>
          </nav>

          {/* Organizer Quota Widget */}
          {isOrg && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Sparkles className="size-4" />
                  </div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    Gói dịch vụ
                  </h4>
                </div>
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700">
                  Cơ bản
                </span>
              </div>
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Nâng cấp gói tài trợ để tăng hiển thị tin tuyển dụng và tiếp cận nhân sự.
              </p>
              <Link
                href="/pricing"
                className="w-full h-9 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Xem gói tài trợ</span>
                <ExternalLink className="size-3.5 text-zinc-400" />
              </Link>
            </div>
          )}
        </div>
        )}

        {/* RIGHT COLUMN (Content Area) */}
        <div className={cn("space-y-6", isOrg ? "lg:col-span-8" : "w-full")}>
          {/* Status Alert Banner */}
          {message && (
            <div
              role="alert"
              className={cn(
                "p-4 rounded-xl text-sm font-medium border flex items-center gap-3 transition-all",
                message.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800/60 dark:text-emerald-300"
                  : "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-800/60 dark:text-rose-300"
              )}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="size-5 shrink-0 text-rose-600 dark:text-rose-400" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {(activeTab === "info" || !isOrg) && (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              
              {/* ORGANIZER FORM BLOCKS */}
              {isOrg ? (
                <>
                  {/* Brand Info Box */}
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="size-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <Building2 className="size-4 text-zinc-600 dark:text-zinc-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
                          Thông tin Thương hiệu
                        </h3>
                        <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
                          Hiển thị công khai trên trang sự kiện và hồ sơ tuyển dụng.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="org-name" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200 mb-1.5">
                          Tên Đơn vị / CLB <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="org-name"
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="VD: CLB Sự kiện Bách Khoa"
                          className="h-11 w-full px-4 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="org-mst" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200 mb-1.5">
                          Mã số thuế / Mã định danh CLB
                        </label>
                        <input
                          id="org-mst"
                          type="text"
                          value={mst}
                          onChange={(e) => setMst(e.target.value)}
                          placeholder="VD: 0401xxxxxx"
                          className="h-11 w-full px-4 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="org-bio" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200 mb-1.5">
                        Mô tả giới thiệu
                      </label>
                      <textarea
                        id="org-bio"
                        rows={4}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Giới thiệu sơ lược về mục tiêu, giá trị cốt lõi..."
                        className="w-full p-4 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all resize-y leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Contact Info Box */}
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="size-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <MapPin className="size-4 text-zinc-600 dark:text-zinc-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
                          Liên hệ & Địa điểm
                        </h3>
                        <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
                          Kênh liên lạc chính thức để kết nối.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="org-phone" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200 mb-1.5">
                          Số điện thoại liên hệ <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="size-4.5 text-zinc-400 absolute left-3.5 top-3.5" />
                          <input
                            id="org-phone"
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="0905 xxx xxx"
                            className="h-11 w-full pl-10 pr-4 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="org-email" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200 mb-1.5">
                          Email tài khoản (chỉ đọc)
                        </label>
                        <div className="relative">
                          <Mail className="size-4.5 text-zinc-400 absolute left-3.5 top-3.5" />
                          <input
                            id="org-email"
                            type="email"
                            disabled
                            value={email}
                            className="h-11 w-full pl-10 pr-4 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="org-website" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200 mb-1.5">
                          Website hoặc Fanpage
                        </label>
                        <div className="relative">
                          <Globe className="size-4.5 text-zinc-400 absolute left-3.5 top-3.5" />
                          <input
                            id="org-website"
                            type="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="https://facebook.com/..."
                            className="h-11 w-full pl-10 pr-4 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="org-address" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200 mb-1.5">
                          Địa chỉ hoạt động
                        </label>
                        <div className="relative">
                          <MapPin className="size-4.5 text-zinc-400 absolute left-3.5 top-3.5" />
                          <input
                            id="org-address"
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="VD: 54 Nguyễn Lương Bằng, Đà Nẵng"
                            className="h-11 w-full pl-10 pr-4 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="org-map-embed" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200 mb-1.5">
                        Link nhúng Google Maps (Tùy chọn)
                      </label>
                      <input
                        id="org-map-embed"
                        type="text"
                        value={mapEmbedUrl}
                        onChange={(e) => setMapEmbedUrl(e.target.value)}
                        placeholder='Dán mã iframe...'
                        className="h-11 w-full px-4 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* STUDENT SYSTEM BLOCKS */
                <>
                  {/* Account Security Box */}
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="size-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <ShieldCheck className="size-4 text-zinc-600 dark:text-zinc-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
                          Trạng thái & Định danh
                        </h3>
                        <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
                          Tài khoản đăng nhập và xác thực danh tính.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200 mb-1.5">
                          Email đăng nhập (Chỉ đọc)
                        </label>
                        <div className="relative">
                          <Mail className="size-4.5 text-zinc-400 absolute left-3.5 top-3.5" />
                          <input
                            type="email"
                            disabled
                            value={email}
                            className="h-11 w-full pl-10 pr-4 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200 mb-1.5">
                          Trạng thái xác thực (eKYC)
                        </label>
                        <div className="h-11 flex items-center">
                          {isVerified || kycStatus === "approved" ? (
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-3 py-1.5 rounded-full">
                              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                              <span>Đã xác thực CCCD</span>
                            </span>
                          ) : kycStatus === "pending" ? (
                            <button
                              type="button"
                              onClick={() => setIsEkycModalOpen(true)}
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 px-4 py-1.5 rounded-full hover:bg-amber-100 transition-colors cursor-pointer"
                            >
                              <Clock className="size-4 text-amber-600" />
                              <span>Đang chờ Admin duyệt</span>
                            </button>
                          ) : kycStatus === "rejected" ? (
                            <button
                              type="button"
                              onClick={() => setIsEkycModalOpen(true)}
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 px-4 py-1.5 rounded-full hover:bg-red-100 transition-colors cursor-pointer"
                            >
                              <AlertCircle className="size-4 text-red-600" />
                              <span>Bị từ chối (Nhấn để làm lại)</span>
                            </button>
                          ) : (
                            <button 
                              type="button"
                              onClick={() => setIsEkycModalOpen(true)}
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 px-4 py-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors active:scale-95 cursor-pointer"
                            >
                              <AlertCircle className="size-4" />
                              <span>Xác thực ngay</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Privacy Toggles Box */}
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="size-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <Eye className="size-4 text-zinc-600 dark:text-zinc-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
                          Quyền riêng tư & Cơ hội việc làm
                        </h3>
                        <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
                          Kiểm soát cách Nhà tuyển dụng tìm kiếm và liên hệ với bạn.
                        </p>
                      </div>
                    </div>

                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800 pt-2">
                      <div className="py-5 flex items-center justify-between gap-6 first:pt-0">
                        <div className="space-y-1 pr-6">
                          <label htmlFor="toggle-seeking" className="text-sm font-semibold text-zinc-900 dark:text-zinc-200 cursor-pointer block">
                            Sẵn sàng nhận việc sự kiện
                          </label>
                          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            Cho phép Ban tổ chức tìm thấy hồ sơ của bạn và gửi lời mời tham gia sự kiện.
                          </p>
                        </div>
                        <ToggleSwitch id="toggle-seeking" checked={isSeekingJob} onChange={handleToggleSeekingJob} />
                      </div>

                      <div className="py-5 flex items-center justify-between gap-6">
                        <div className="space-y-1 pr-6">
                          <label htmlFor="toggle-phone" className="text-sm font-semibold text-zinc-900 dark:text-zinc-200 cursor-pointer block">
                            Chia sẻ số điện thoại khi trúng tuyển
                          </label>
                          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            BTC có thể liên hệ trực tiếp qua SĐT/Zalo sau khi duyệt hồ sơ.
                          </p>
                        </div>
                        <ToggleSwitch id="toggle-phone" checked={showPhoneToOrganizer} onChange={handleToggleShowPhone} />
                      </div>

                      <div className="py-5 flex items-center justify-between gap-6 last:pb-0">
                        <div className="space-y-1 pr-6">
                          <label htmlFor="toggle-email-notif" className="text-sm font-semibold text-zinc-900 dark:text-zinc-200 cursor-pointer block">
                            Nhận email thông báo sự kiện mới
                          </label>
                          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            Nhận thông báo khi có việc làm phù hợp với khu vực của bạn.
                          </p>
                        </div>
                        <ToggleSwitch id="toggle-email-notif" checked={emailNotifications} onChange={handleToggleEmailNotif} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button Block */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="h-11 px-6 rounded-xl bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {updating ? (
                    "Đang lưu..."
                  ) : (
                    <>
                      <Check className="size-4.5" />
                      <span>Lưu thay đổi</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {(activeTab === "password" || !isOrg) && (
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6 w-full">
                <div className="flex items-center gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="size-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <Lock className="size-4 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
                      {hasPassword ? "Đổi mật khẩu" : "Tạo mật khẩu"}
                    </h3>
                    <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
                      {hasPassword
                        ? "Mật khẩu nên chứa tối thiểu 6 ký tự."
                        : "Tạo mật khẩu để đăng nhập trực tiếp bằng email."}
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  {hasPassword && (
                    <div>
                      <label htmlFor="current-password" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200 mb-1.5">
                        Mật khẩu hiện tại
                      </label>
                      <div className="relative">
                        <input
                          id="current-password"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Nhập mật khẩu hiện tại..."
                          className="h-11 w-full pl-4 pr-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                        >
                          {showCurrentPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="new-password" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200 mb-1.5">
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
                        className="h-11 w-full pl-4 pr-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200 mb-1.5">
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
                        className="h-11 w-full pl-4 pr-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={updating}
                    className="h-11 px-6 rounded-xl bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {updating ? (
                      "Đang xử lý..."
                    ) : (
                      <>
                        <Lock className="size-4.5" />
                        <span>{hasPassword ? "Cập nhật mật khẩu" : "Lưu mật khẩu mới"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
      
      {/* Student eKYC Modal */}
      {!isOrg && (
        <StudentEkycModal 
          isOpen={isEkycModalOpen} 
          onClose={() => setIsEkycModalOpen(false)} 
          onSuccess={() => {
            if (refreshProfile) refreshProfile()
          }}
          currentKycStatus={kycStatus}
          rejectionReason={kycData?.rejection_reason}
        />
      )}
    </div>
  )

  if (embedded) {
    return content
  }

  return <MainLayout role={role ?? undefined}>{content}</MainLayout>
}
