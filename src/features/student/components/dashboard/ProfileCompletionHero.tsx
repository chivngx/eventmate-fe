"use client"

import Link from "next/link"

interface ProfileCompletionHeroProps {
  fullName: string
  avatarUrl: string
  cvPercent: number
}

export default function ProfileCompletionHero({
  fullName,
  avatarUrl,
  cvPercent,
}: ProfileCompletionHeroProps) {
  return (
    <div className="bg-white rounded-[16px] border border-[#ededed] shadow-xs p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
      {/* Left: Avatar + Completion Text + Linear Progress */}
      <div className="flex items-center gap-[16px] flex-1 min-w-0">
        <div className="relative rounded-[64px] shrink-0 size-[88px] overflow-hidden border border-[#ededed]">
          <img
            src={avatarUrl}
            alt={fullName}
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=18181B&color=fff`
            }}
            className="size-full object-cover rounded-[64px] pointer-events-none"
          />
        </div>
        <div className="flex flex-col gap-[10px] items-start justify-center flex-1 min-w-0">
          <div className="flex flex-col gap-[4px] items-start w-full">
            <p className="font-['Inter'] font-semibold leading-normal text-[#222222] text-[18px] w-full">
              <span className="text-emerald-600 font-bold">{cvPercent}%</span>
              <span> Hồ sơ đã hoàn thiện</span>
            </p>
            <p className="font-['Inter'] font-normal leading-normal text-[#757575] text-[12px] w-full">
              {cvPercent === 100
                ? "Hồ sơ của bạn đã hoàn thiện 100%! Sẵn sàng nhận cơ hội tốt nhất."
                : "Gần hoàn thành rồi! Hãy bổ sung thêm thông tin để tăng cơ hội trúng tuyển."}
            </p>
          </div>

          {/* Progress / Linear (Figma: w: 286px, h: 6px) */}
          <div className="h-[6px] w-full max-w-[320px] bg-zinc-200 rounded-[100px] overflow-hidden relative">
            <div
              className="h-full bg-emerald-500 rounded-[100px] transition-all duration-500"
              style={{ width: `${cvPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Right: Action button */}
      <div className="shrink-0 self-stretch sm:self-auto flex items-center justify-end">
        <Link
          href="/profile"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-[13.5px] font-semibold transition cursor-pointer shadow-xs"
        >
          Hoàn thiện hồ sơ &rarr;
        </Link>
      </div>
    </div>
  )
}
