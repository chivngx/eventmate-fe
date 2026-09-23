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
          stroke="#005DDC"
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
  )}&background=005DDC&color=fff&size=120`

  return (
    <div
      className={
        className ||
        "bg-white border border-[#EDEDED] border-solid flex flex-col sm:flex-row gap-[16px] items-start p-[16px] relative rounded-[16px] w-full"
      }
      data-node-id="5875:27796"
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

      {/* Khung ảnh đại diện 120x120 (Figma: Frame 2147225468) */}
      <div className="relative shrink-0 size-[120px]">
        <div
          onClick={handleTriggerFileInput}
          className="size-[120px] rounded-[16px] border border-[#222222] border-dashed relative overflow-hidden bg-slate-100 cursor-pointer group"
          title="Nhấn để đổi ảnh đại diện"
        >
          <img
            src={avatarUrl || fallbackAvatar}
            alt={displayName}
            className="size-full object-cover pointer-events-none rounded-[16px]"
          />

          {/* Lớp phủ trạng thái đang tải ảnh lên kèm spinner (Figma: state="Uploading") */}
          {isUploading && (
            <div
              className="absolute inset-0 backdrop-blur-[0.75px] bg-[rgba(0,0,0,0.65)] border border-[#515151] border-dashed rounded-[16px] flex items-center justify-center z-10"
              data-node-id="3988:55505"
            >
              <SpinnerLoading className="size-[48px]" />
            </div>
          )}
        </div>

        {/* Nút chỉnh sửa góc dưới bên phải (Figma: Frame 2147225445) */}
        {!isUploading && (
          <button
            type="button"
            onClick={handleTriggerFileInput}
            className="absolute -bottom-1 -right-1 size-[28px] bg-[#222222] hover:bg-black text-white transition-colors flex items-center justify-center rounded-full border-2 border-white cursor-pointer shadow-xs z-10"
            title="Đổi ảnh đại diện"
            aria-label="Đổi ảnh đại diện"
            data-node-id="3988:55586"
          >
            <EditIcon className="size-[14px]" />
          </button>
        )}
      </div>

      {/* Thông tin hồ sơ và các nút thao tác (Figma: Frame 2147225379) */}
      <div className="flex flex-1 flex-col gap-[16px] items-start p-[16px] sm:p-0 relative w-full min-w-0">
        {/* Thông tin người dùng (Figma: Frame 2147225281) */}
        <div className="flex flex-col items-start relative shrink-0 w-full min-w-0">
          <div className="flex flex-col gap-[4px] items-start relative shrink-0 w-full min-w-0">
            <h2
              className="font-medium text-[#004EB7] text-[16px] leading-normal font-['Inter'] truncate max-w-full"
              dir="auto"
              data-node-id="3988:55578"
            >
              {displayName}
            </h2>
            <div
              className="flex items-center gap-1.5 text-[#515151] text-[14px] font-normal leading-normal flex-wrap"
              data-node-id="3988:55579"
            >
              <span className="truncate max-w-[220px]">
                {jobTitle?.trim() || "Nhân sự sự kiện"}
              </span>
              {university?.trim() && (
                <>
                  <span className="text-[#a5a5a5] select-none">•</span>
                  <span className="truncate max-w-[260px]">{university.trim()}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Các nút thao tác (Figma: Frame 2147225099) */}
        <div className="flex gap-[12px] items-center relative shrink-0 w-full flex-wrap">
          <button
            type="button"
            onClick={onViewResume}
            className="h-[34px] px-[18px] bg-[#005DDC] hover:bg-[#004EB7] text-white text-[14px] font-medium rounded-[8px] flex items-center justify-center transition-colors cursor-pointer whitespace-nowrap shadow-xs"
            data-node-id="3988:55584"
          >
            Xem hồ sơ
          </button>
        </div>
      </div>
    </div>
  )
}
