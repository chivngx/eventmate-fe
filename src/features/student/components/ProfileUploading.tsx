"use client"

import React, { useRef } from "react"

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

/**
 * EditIcon matching Figma node 3988:55587
 */
export function EditIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || "size-4"}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.1667 10V12C13.1667 13.612 12.2787 14.5 10.6667 14.5H4C2.388 14.5 1.5 13.612 1.5 12V5.33333C1.5 3.72133 2.388 2.83333 4 2.83333H6C6.276 2.83333 6.5 3.05733 6.5 3.33333C6.5 3.60933 6.276 3.83333 6 3.83333H4C2.94867 3.83333 2.5 4.282 2.5 5.33333V12C2.5 13.0513 2.94867 13.5 4 13.5H10.6667C11.718 13.5 12.1667 13.0513 12.1667 12V10C12.1667 9.724 12.3907 9.5 12.6667 9.5C12.9427 9.5 13.1667 9.724 13.1667 10ZM14.5 4.03733C14.4993 4.42867 14.3467 4.796 14.0693 5.072L8.09399 11.0207C7.99999 11.114 7.87333 11.1667 7.74133 11.1667H5.33333C5.05733 11.1667 4.83333 10.9427 4.83333 10.6667V8.25934C4.83333 8.12734 4.88533 7.99999 4.97933 7.90666L10.928 1.93066C11.2034 1.65333 11.5713 1.50067 11.9626 1.5C11.9633 1.5 11.964 1.5 11.9647 1.5C12.3553 1.5 12.7227 1.652 12.9993 1.92867L14.072 3.00134C14.348 3.27801 14.5007 3.646 14.5 4.03733ZM11.7447 5.97534L10.0247 4.25533L5.83333 8.466V10.1673H7.53467L11.7447 5.97534ZM13.5 4.03599C13.5 3.91199 13.452 3.79534 13.3647 3.70801L12.292 2.63534C12.2047 2.548 12.088 2.5 11.9647 2.5H11.964C11.84 2.5 11.724 2.54867 11.6367 2.63601L10.7307 3.546L12.454 5.26933L13.364 4.36334C13.4513 4.27668 13.4993 4.15999 13.5 4.03599Z"
        fill="#EDEDED"
      />
    </svg>
  )
}

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
            className="absolute -bottom-1 -right-1 size-[24px] bg-[#515151] hover:bg-[#333333] transition-colors flex items-center justify-center rounded-[8px] cursor-pointer shadow-xs z-10"
            title="Đổi ảnh đại diện"
            aria-label="Đổi ảnh đại diện"
            data-node-id="3988:55586"
          >
            <EditIcon className="size-[16px]" />
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
