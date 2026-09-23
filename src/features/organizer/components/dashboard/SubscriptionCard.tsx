"use client"

import React from "react"
import { CreditCard, Clock, Sparkles } from "lucide-react"

interface SubscriptionCardProps {
  planName?: string
  interval?: string
  joinDate?: string
  postsLeft?: number
  totalPosts?: number
  daysLeft?: number | null
  isAutoRenewal?: boolean
  isPremium?: boolean
  singleEventCredits?: number
  onManage?: () => void
  onUpgrade?: () => void
}

export default function SubscriptionCard({
  planName = "Gói Khởi Đầu",
  interval = "Miễn phí",
  joinDate = "Thành viên EventMate",
  postsLeft = 1,
  totalPosts = 1,
  daysLeft = null,
  isAutoRenewal = false,
  isPremium = false,
  singleEventCredits = 0,
  onManage,
  onUpgrade
}: SubscriptionCardProps) {
  // Calculate percentage for progress ring
  const percent = totalPosts > 0 ? Math.min(100, Math.max(0, (postsLeft / totalPosts) * 100)) : 100
  const radius = 38
  const stroke = 11
  const normalizedRadius = radius - stroke / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (percent / 100) * circumference

  const displayName = isPremium
    ? "Gói Doanh Nghiệp VIP"
    : singleEventCredits > 0
    ? "Gói Sự Kiện Nhanh"
    : planName

  const displayInterval = isPremium
    ? "499.000đ / tháng"
    : singleEventCredits > 0
    ? `Còn ${singleEventCredits} lượt Sự Kiện Nhanh`
    : `${interval} (${totalPosts} tin/tháng)`

  return (
    <div className="bg-white dark:bg-zinc-900 border border-[#ededed] dark:border-zinc-800 rounded-[16px] p-4 flex flex-col gap-4 shadow-none">
      {/* Top section: Info + Progress Ring */}
      <div className="flex items-center justify-between gap-3">
        {/* Left Column: Details */}
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <p className="text-[12px] font-normal text-[#515151] dark:text-zinc-400 leading-normal truncate">
            {joinDate}
          </p>

          <div className="flex flex-col">
            <h4 className="text-[16px] font-semibold text-[#222222] dark:text-zinc-100 leading-tight">
              {displayName}
            </h4>
            <p className="text-[14px] font-normal text-[#757575] dark:text-zinc-400 leading-tight mt-0.5">
              {displayInterval}
            </p>
          </div>

          <div className="flex flex-col gap-1 pt-1">
            {isAutoRenewal && (
              <div className="flex items-center gap-1.5 text-[12px] text-[#353535] dark:text-zinc-300">
                <CreditCard className="w-3.5 h-3.5 text-[#515151] dark:text-zinc-400 shrink-0" />
                <span className="truncate">Tự động gia hạn</span>
              </div>
            )}
            {singleEventCredits > 0 && !isPremium && (
              <div className="flex items-center gap-1.5 text-[12px] text-amber-600 dark:text-amber-400 font-medium">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>{singleEventCredits} lượt Sự Kiện Nhanh</span>
              </div>
            )}
            {daysLeft !== null && daysLeft !== undefined && (
              <div className="flex items-center gap-1.5 text-[12px] text-emerald-600 dark:text-emerald-400 font-medium">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>Còn {daysLeft} ngày VIP</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Donut Progress Ring */}
        <div className="relative flex items-center justify-center w-[92px] h-[92px] shrink-0">
          <svg height="92" width="92" className="transform -rotate-90">
            {/* Background ring */}
            <circle
              stroke="currentColor"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx="46"
              cy="46"
              className="text-[#ededed] dark:text-zinc-800"
            />
            {/* Active progress segment */}
            <circle
              stroke="currentColor"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={`${circumference} ${circumference}`}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx="46"
              cy="46"
              className="text-[#353535] dark:text-zinc-200 transition-all duration-500 ease-in-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-[13px] font-semibold text-[#222222] dark:text-zinc-100 leading-tight">
              {postsLeft} tin
            </span>
            <span className="text-[10px] text-[#515151] dark:text-zinc-400 leading-tight">
              Còn lại
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <button
        type="button"
        onClick={onManage || onUpgrade}
        className="w-full h-9 rounded-[8px] border border-[#282828] dark:border-zinc-400 text-[#282828] dark:text-zinc-100 hover:bg-[#282828] hover:text-white dark:hover:bg-zinc-100 dark:hover:text-[#282828] text-[14px] font-medium transition flex items-center justify-center cursor-pointer"
      >
        {isPremium ? "Quản lý gói dịch vụ" : "Nâng cấp gói VIP"}
      </button>
    </div>
  )
}
