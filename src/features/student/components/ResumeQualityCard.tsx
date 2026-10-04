"use client"

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
    >
      <div className="flex items-center justify-center w-full">
        <h3 className="font-medium text-[#222222] text-[20px] text-center leading-normal font-['Inter']">
          Chất lượng Hồ sơ
        </h3>
      </div>

      <div className="relative size-[150px] flex items-center justify-center shrink-0 my-1">
        <svg className="size-full transform -rotate-90" viewBox="0 0 150 150">
          <circle
            cx="75"
            cy="75"
            r={radius}
            stroke="#EDEDED"
            strokeWidth="14"
            fill="transparent"
          />
          <circle
            cx="75"
            cy="75"
            r={radius}
            stroke="#18181B"
            strokeWidth="14"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-bold text-zinc-950 text-[18px] text-center font-['Inter'] leading-normal">
            {safePercent}%
          </span>
        </div>
      </div>

      <div className="w-full h-px bg-[#EDEDED] shrink-0" />

      <div className="flex flex-col gap-[16px] items-start w-full">
        <p className="font-semibold text-[#222222] text-[12px] leading-normal font-['Inter'] w-full">
          {safePercent === 100
            ? "🎉 Hồ sơ của bạn đã hoàn thiện 100%!"
            : `Hồ sơ chỉ mới đạt ${safePercent}%! Hãy hoàn thiện thêm:`}
        </p>

        {missingItems && missingItems.length > 0 ? (
          <div className="flex flex-col gap-[12px] items-start w-full">
            {missingItems.map((item, idx) => (
              <div
                key={idx}
                className="flex gap-[8px] items-center w-full"
              >
                <div className="border border-zinc-200 bg-zinc-50 flex h-[20px] items-center justify-center px-[8px] py-[4px] rounded-[4px] shrink-0">
                  <span className="font-semibold text-zinc-900 text-[12px] font-['Inter'] leading-normal whitespace-nowrap">
                    +{item.score}%
                  </span>
                </div>
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