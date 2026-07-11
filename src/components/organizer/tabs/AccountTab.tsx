"use client"

import { Button } from "@/components/ui/button"

/**
 * AccountTab — organizer account settings (profile info + password change).
 *
 * Extracted from OrgDashboard.tsx (Phase 2 Task 4) to reduce file size.
 * All state lives in the parent; this component is purely presentational + calls handlers.
 */

export interface ProfileData {
  fullName: string
  phone: string
  email: string
  mst: string
  website: string
  scale: string
  address: string
  bio: string
  avatarUrl: string
  companyImages: string
}

export interface PasswordState {
  newPassword: string
  confirmPassword: string
}

interface AccountTabProps {
  // Sub-tab toggle
  activeSubTab: "info" | "password"
  setActiveSubTab: (tab: "info" | "password") => void
  // Profile form
  profileData: ProfileData
  setProfileData: (data: ProfileData) => void
  handleUpdateProfile: (e: React.FormEvent) => void
  isUpdatingProfile: boolean
  // Logo upload
  handleUploadLogo: (file: File) => void
  uploadingAvatar: boolean
  // Company images
  handleUploadCompanyImage: (file: File) => void
  handleDeleteCompanyImage: (idx: number) => void
  uploadingCompanyImage: boolean
  // Password change
  passwordState: PasswordState
  setPasswordState: (state: PasswordState) => void
  handleChangePassword: (e: React.FormEvent) => void
  isUpdatingPassword: boolean
}

export default function AccountTab({
  activeSubTab,
  setActiveSubTab,
  profileData,
  setProfileData,
  handleUpdateProfile,
  isUpdatingProfile,
  handleUploadLogo,
  uploadingAvatar,
  handleUploadCompanyImage,
  handleDeleteCompanyImage,
  uploadingCompanyImage,
  passwordState,
  setPasswordState,
  handleChangePassword,
  isUpdatingPassword,
}: AccountTabProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl max-w-md mx-auto shadow-sm">
        <button
          onClick={() => setActiveSubTab("info")}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-black transition-all ${activeSubTab === "info"
            ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-sm"
            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
        >
          Thông tin công ty/CLB
        </button>
        <button
          onClick={() => setActiveSubTab("password")}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-black transition-all ${activeSubTab === "password"
            ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-sm"
            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
        >
          Đổi mật khẩu
        </button>
      </div>

      {activeSubTab === "info" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột trái: Upload Logo và hình ảnh doanh nghiệp */}
          <div className="lg:col-span-1 space-y-6">
            {/* LOGO UPLOAD CARD */}
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800/80 rounded-[2rem] p-6 text-center shadow-sm flex flex-col items-center">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Logo Công ty / CLB</h3>
              <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-md group">
                <img
                  src={profileData.avatarUrl || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=150&h=150&q=80"}
                  alt="Company Logo"
                  className="w-full h-full object-cover"
                />
                <label
                  htmlFor="logo-upload"
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-all duration-200"
                >
                  <span className="text-xs font-black">Thay đổi Logo</span>
                </label>
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUploadLogo(file)
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => document.getElementById("logo-upload")?.click()}
                className="mt-4 px-4 py-2 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border dark:border-slate-850 rounded-xl text-xs font-black transition-all"
              >
                {uploadingAvatar ? "Đang tải lên..." : "Tải ảnh mới"}
              </button>
              <p className="text-[10px] text-slate-400 mt-2 font-semibold">Khuyến nghị: Tỉ lệ 1:1, tối đa 2MB.</p>
            </div>

            {/* COMPANY IMAGES GALLERY & UPLOAD */}
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800/80 rounded-[2rem] p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hình ảnh hoạt động</h3>
              <div className="grid grid-cols-2 gap-3">
                {profileData.companyImages ? (
                  profileData.companyImages.split(',').filter(Boolean).map((imgUrl, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-100 dark:border-slate-850 group">
                      <img src={imgUrl} alt={`Company image ${idx + 1}`} loading="lazy" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleDeleteCompanyImage(idx)}
                        aria-label={`Xóa ảnh ${idx + 1}`}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all shadow-sm"
                      >
                        <span className="text-[10px] font-bold block px-1">Xóa</span>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-6 text-slate-400 text-xs font-semibold">Chưa có hình ảnh nào.</div>
                )}
              </div>
              <input
                type="file"
                id="company-image-upload"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleUploadCompanyImage(file)
                }}
              />
              <button
                type="button"
                onClick={() => document.getElementById("company-image-upload")?.click()}
                className="w-full py-2.5 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 text-slate-500 hover:text-emerald-600"
              >
                {uploadingCompanyImage ? "Đang tải ảnh..." : "Thêm ảnh hoạt động"}
              </button>
            </div>
          </div>

          {/* Cột phải: Form thông tin chi tiết */}
          <div className="lg:col-span-2">
            <form onSubmit={handleUpdateProfile} className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 sm:p-8 space-y-6 shadow-sm">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">Thông tin công ty/CLB</h2>
                <p className="text-slate-400 text-xs font-semibold mt-0.5">Cập nhật và hoàn thiện hồ sơ tuyển dụng của bạn.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tên công ty / CLB</label>
                  <input type="text" required value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 focus:bg-white text-sm font-bold transition-all focus:border-emerald-500"
                    placeholder="Tên đầy đủ của công ty..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mã số thuế (MST)</label>
                  <input type="text" value={profileData.mst}
                    onChange={(e) => setProfileData({ ...profileData, mst: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 focus:bg-white text-sm font-bold transition-all focus:border-emerald-500"
                    placeholder="Mã số thuế..." />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Số điện thoại liên hệ</label>
                  <input type="tel" required value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 focus:bg-white text-sm font-bold transition-all focus:border-emerald-500"
                    placeholder="Số điện thoại..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email liên hệ</label>
                  <input type="email" disabled value={profileData.email}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm font-bold cursor-not-allowed" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Website</label>
                  <input type="url" value={profileData.website}
                    onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 focus:bg-white text-sm font-bold transition-all focus:border-emerald-500"
                    placeholder="https://example.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quy mô (số nhân viên)</label>
                  <select value={profileData.scale}
                    onChange={(e) => setProfileData({ ...profileData, scale: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 focus:bg-white text-sm font-bold transition-all focus:border-emerald-500">
                    <option value="">Chọn quy mô...</option>
                    <option value="1-9 nhân viên">1-9 nhân viên</option>
                    <option value="10-24 nhân viên">10-24 nhân viên</option>
                    <option value="25-99 nhân viên">25-99 nhân viên</option>
                    <option value="100-499 nhân viên">100-499 nhân viên</option>
                    <option value="500+ nhân viên">500+ nhân viên</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Địa chỉ</label>
                <input type="text" value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 focus:bg-white text-sm font-bold transition-all focus:border-emerald-500"
                  placeholder="Địa chỉ công ty..." />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mô tả công ty / CLB</label>
                <textarea value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  rows={4}
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 focus:bg-white text-sm font-bold transition-all focus:border-emerald-500"
                  placeholder="Giới thiệu chung về công ty hoặc câu lạc bộ..." />
              </div>

              <Button type="submit" disabled={isUpdatingProfile} className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black h-12 shadow-md">
                {isUpdatingProfile ? "Đang lưu thay đổi..." : "Lưu thay đổi"}
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <form onSubmit={handleChangePassword} className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">Đổi mật khẩu</h2>
            <p className="text-slate-400 text-xs font-semibold mt-0.5">Đặt lại mật khẩu bảo mật mới.</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mật khẩu mới</label>
            <input type="password" required value={passwordState.newPassword}
              onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 focus:bg-white text-sm font-bold transition-all focus:border-emerald-500"
              placeholder="Tối thiểu 6 ký tự..." />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Xác nhận mật khẩu mới</label>
            <input type="password" required value={passwordState.confirmPassword}
              onChange={(e) => setPasswordState({ ...passwordState, confirmPassword: e.target.value })}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 focus:bg-white text-sm font-bold transition-all focus:border-emerald-500"
              placeholder="Xác nhận lại mật khẩu..." />
          </div>
          <Button type="submit" disabled={isUpdatingPassword} className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black h-12 shadow-md">
            {isUpdatingPassword ? "Đang đổi mật khẩu..." : "Xác nhận đổi mật khẩu"}
          </Button>
        </form>
      )}
    </div>
  )
}
