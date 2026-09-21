"use client"

import React from "react"
import { Check } from "lucide-react"

export interface MissingQualityItem {
  title: string
  score: number
}

export interface ResumeQualityCardProps {
  className?: string
  percent: number
  missingItems?: MissingQualityItem[]
}

/**
 * ResumeQualityCard component implemented from Figma node 6850:74748
 * Thẻ hiển thị chất lượng hồ sơ với biểu đồ tròn và danh sách gợi ý hoàn thiện (tiếng Việt, dữ liệu thực)
 */
export default function ResumeQualityCard({
  className,
  percent = 0,
  missingItems = []
}: ResumeQualityCardProps) {
  const safePercent = Math.min(Math.max(Math.round(percent), 0), 100)
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (circumference * safePercent) / 100

  return (
    <div
      className={
        className ||
        "bg-white rounded-[16px] border border-[#EDEDED] px-[16px] py-[24px] flex flex-col gap-[16px] items-center w-full shadow-xs"
      }
      data-node-id="6850:74748"
    >
      {/* Tiêu đề thẻ (Figma: Frame 2147225330 / Your Resume Quality) */}
      <div className="flex items-center justify-center w-full" data-node-id="6850:74749">
        <h3
          className="font-medium text-[#222222] text-[20px] text-center leading-normal font-['Inter']"
          data-node-id="6850:74750"
        >
          Chất lượng Hồ sơ
        </h3>
      </div>

      {/* Biểu đồ tròn tiến độ (Figma: Frame 2147225329 / Graph) */}
      <div
        className="relative size-[150px] flex items-center justify-center shrink-0 my-1"
        data-node-id="6850:74751"
      >
        <svg className="size-full transform -rotate-90" viewBox="0 0 150 150">
          {/* Vòng nền tròn xám nhạt */}
          <circle
            cx="75"
            cy="75"
            r={radius}
            stroke="#EDEDED"
            strokeWidth="14"
            fill="transparent"
          />
          {/* Vòng tiến độ màu xanh chính */}
          <circle
            cx="75"
            cy="75"
            r={radius}
            stroke="#005DDC"
            strokeWidth="14"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Số phần trăm ở tâm biểu đồ (Figma: text 16px SemiBold #282828) */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          data-node-id="6850:74752"
        >
          <span
            className="font-semibold text-[#282828] text-[16px] text-center font-['Inter'] leading-normal"
            data-node-id="6850:74753"
          >
            {safePercent}%
          </span>
        </div>
      </div>

      {/* Đường kẻ phân cách ngang (Figma: Vector 672) */}
      <div className="w-full h-px bg-[#EDEDED] shrink-0" data-node-id="6850:74757" />

      {/* Khu vực gợi ý hoàn thiện hồ sơ (Figma: Frame 2147225324) */}
      <div className="flex flex-col gap-[16px] items-start w-full" data-node-id="6850:74758">
        <p
          className="font-semibold text-[#222222] text-[12px] leading-normal font-['Inter'] w-full"
          data-node-id="6850:74759"
        >
          {safePercent === 100
            ? "🎉 Hồ sơ của bạn đã hoàn thiện 100%!"
            : `Hồ sơ chỉ mới đạt ${safePercent}%! Hãy hoàn thiện thêm:`}
        </p>

        {/* Danh sách các mục còn thiếu (Figma: Frame 2147225323) */}
        {missingItems && missingItems.length > 0 ? (
          <div className="flex flex-col gap-[12px] items-start w-full" data-node-id="6850:74760">
            {missingItems.map((item, idx) => (
              <div
                key={idx}
                className="flex gap-[8px] items-center w-full"
                data-node-id={`6850:7476${idx + 1}`}
              >
                {/* Badge điểm cộng (Figma: Badge) */}
                <div
                  className="border border-[#005DDC] border-solid flex h-[20px] items-center justify-center px-[8px] py-[4px] rounded-[4px] shrink-0"
                  data-name="Badge"
                >
                  <span className="font-normal text-[#005DDC] text-[12px] font-['Inter'] leading-normal whitespace-nowrap">
                    +{item.score}%
                  </span>
                </div>
                {/* Tên mục cần hoàn thiện */}
                <span className="font-normal text-[#353535] text-[12px] font-['Inter'] leading-normal truncate">
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-1.5 w-full">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Hồ sơ đã đạt tiêu chuẩn ưu tiên tuyển dụng!</span>
          </div>
        )}
      </div>
    </div>
  )
}
