"use client"

import React, { useRef } from "react"
import { EditIcon } from "@/components/icons"

export interface ProfileUploadingProps {
  className?: string
  state?: "Uploading" | "Uploaded"
  fullName?: string
  jobTitle?: string
  university?: string
  avatarUrl?: string | null
  onAvatarUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void | Promise<void>
  onViewResume?: () => void
}

/**
 * Custom SpinnerLoading component matching Figma node 3988:55511
 */
export function SpinnerLoading({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-12"}>
      <svg
        className="size-full animate-spin"
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="28"
          cy="28"
          r="24"
          stroke="#9EC7FF"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="90 150"
          className="opacity-90"
        />
        <circle
          cx="28"
          cy="28"
          r="24"
          stroke="#18181B"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="40 160"
          className="opacity-100"
        />
      </svg>
    </div>
  )
}

export { EditIcon }

/**
 * ProfileUploading component implemented from Figma node 5875:27796
 * Hỗ trợ giao diện tiếng Việt và dữ liệu thực tế từ hồ sơ người dùng
 */
export default function ProfileUploading({
  className,
  state = "Uploaded",
  fullName,
  jobTitle,
  university,
  avatarUrl,
  onAvatarUpload,
  onViewResume
}: ProfileUploadingProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isUploading = state === "Uploading"

  const handleTriggerFileInput = () => {
    if (isUploading) return
    fileInputRef.current?.click()
  }

  const displayName = fullName?.trim() || "Chưa cập nhật họ tên"
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    fullName?.trim() || "EventMate"
  )}&background=18181B&color=fff&size=120`

  return (
    <div
      className={
        className ||
        "flex flex-col items-center justify-center text-center gap-4 py-8 w-full"
      }
      data-state={state}
    >
      {/* Input tệp ẩn để tải lên ảnh đại diện */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onAvatarUpload}
        className="hidden"
        aria-label="Tải lên ảnh đại diện"
      />

      {/* Khung ảnh đại diện tròn */}
      <div className="relative shrink-0 size-[120px] mb-2">
        <div
          onClick={handleTriggerFileInput}
          className="size-[120px] rounded-full border border-slate-200 relative overflow-hidden bg-slate-100 cursor-pointer group shadow-sm transition-transform hover:scale-105"
          title="Nhấn để đổi ảnh đại diện"
        >
          <img
            src={avatarUrl || fallbackAvatar}
            alt={displayName}
            className="size-full object-cover pointer-events-none rounded-full"
          />

          {/* Lớp phủ trạng thái đang tải ảnh lên kèm spinner */}
          {isUploading && (
            <div
              className="absolute inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-10"
            >
              <SpinnerLoading className="size-[40px]" />
            </div>
          )}
        </div>

        {/* Nút chỉnh sửa góc dưới bên phải */}
        {!isUploading && (
          <button
            type="button"
            onClick={handleTriggerFileInput}
            className="absolute bottom-0 right-0 size-8 bg-zinc-900 hover:bg-black text-white transition-colors flex items-center justify-center rounded-full border-2 border-white cursor-pointer shadow-md z-10"
            title="Đổi ảnh đại diện"
            aria-label="Đổi ảnh đại diện"
          >
            <EditIcon className="size-4" />
          </button>
        )}
      </div>

      {/* Thông tin hồ sơ */}
      <div className="flex flex-col items-center gap-1 w-full max-w-[400px]">
        <h2
          className="font-bold text-zinc-900 text-2xl truncate w-full"
          dir="auto"
        >
          {displayName}
        </h2>
        <div
          className="flex items-center justify-center gap-2 text-slate-500 text-sm flex-wrap w-full"
        >
          <span className="truncate max-w-[220px]">
            {jobTitle?.trim() || "Nhân sự sự kiện"}
          </span>
          {university?.trim() && (
            <>
              <span className="text-slate-300 select-none">•</span>
              <span className="truncate max-w-[260px]">{university.trim()}</span>
            </>
          )}
        </div>
      </div>

      {/* Các nút thao tác */}
      <div className="mt-2">
        <button
          type="button"
          onClick={onViewResume}
          className="h-10 px-6 bg-white hover:bg-slate-50 text-zinc-900 text-sm font-medium rounded-full flex items-center justify-center transition-colors cursor-pointer border border-slate-200 shadow-sm"
        >
          Xem hồ sơ CV
        </button>
      </div>
    </div>
  )
}
