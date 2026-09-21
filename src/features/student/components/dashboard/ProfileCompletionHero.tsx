"use client"

import Link from "next/link"
import { Eye, Heart } from "lucide-react"

interface ProfileCompletionHeroProps {
  fullName: string
  avatarUrl: string
  cvPercent: number
  profileViewsCount: number
  profileLikesCount: number
}

export default function ProfileCompletionHero({
  fullName,
  avatarUrl,
  cvPercent,
  profileViewsCount,
  profileLikesCount,
}: ProfileCompletionHeroProps) {
  return (
    <div className="bg-white rounded-[16px] border border-[#ededed] shadow-xs p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
      {/* Left: Avatar + Completion Text + Linear Progress + Button */}
      <div className="flex items-center gap-[16px] flex-1 min-w-0">
        <div className="relative rounded-[64px] shrink-0 size-[88px] overflow-hidden border border-[#ededed]">
          <img
            src={avatarUrl}
            alt={fullName}
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=005DDC&color=fff`
            }}
            className="size-full object-cover rounded-[64px] pointer-events-none"
          />
        </div>
        <div className="flex flex-col gap-[10px] items-start justify-center flex-1 min-w-0">
          <div className="flex flex-col gap-[4px] items-start w-full">
            <p className="font-['Inter'] font-semibold leading-normal text-[#222222] text-[18px] w-full">
              <span className="text-[#005ddc]">{cvPercent}%</span>
              <span> Hồ sơ đã hoàn thiện</span>
            </p>
            <p className="font-['Inter'] font-normal leading-normal text-[#757575] text-[12px] w-full">
              {cvPercent === 100
                ? "Hồ sơ của bạn đã hoàn thiện 100%! Sẵn sàng nhận cơ hội tốt nhất."
                : "Gần hoàn thành rồi! Hãy bổ sung thêm thông tin để tăng cơ hội trúng tuyển."}
            </p>
          </div>

          {/* Progress / Linear (Figma: w: 286px, h: 6px) */}
          <div className="h-[6px] w-full max-w-[320px] bg-[#cbcbcb] rounded-[100px] overflow-hidden relative">
            <div
              className="h-full bg-[#005ddc] rounded-[100px] transition-all duration-500"
              style={{ width: `${cvPercent}%` }}
            />
          </div>

          {/* Complete your resume button */}
          <Link
            href="/profile"
            className="flex items-center gap-[8px] h-[32px] text-[#003e93] font-['Inter'] font-medium text-[14px] leading-[1.6] hover:underline cursor-pointer"
          >
            <span>Hoàn thiện hồ sơ</span>
          </Link>
        </div>
      </div>

      {/* Right: Insight cards */}
      <div className="flex items-center gap-[16px] shrink-0 self-stretch sm:self-auto justify-start sm:justify-end">
        {/* 1. Lượt xem hồ sơ */}
        <div className="bg-white border border-[#ededed] flex flex-col gap-[12px] h-[96px] w-[116px] items-start justify-center px-[12px] py-[8px] rounded-[8px] shrink-0">
          <div className="bg-white border border-[#ededed]/60 rounded-[4px] size-[32px] flex items-center justify-center shrink-0 shadow-xs">
            <Eye className="size-[18px] text-[#282828]" />
          </div>
          <div className="flex flex-col gap-[4px] items-start leading-normal text-left whitespace-nowrap">
            <div className="flex gap-[4px] items-center text-[#282828]">
              <p className="font-['Inter'] font-semibold text-[14.8px]">
                {profileViewsCount}
              </p>
              <p className="font-['Inter'] font-medium text-[10px] text-[#757575]">
                người
              </p>
            </div>
            <p className="font-['Inter'] font-medium text-[#757575] text-[10px]">
              Đã xem hồ sơ
            </p>
          </div>
        </div>

        {/* 2. Lượt thích hồ sơ */}
        <div className="bg-white border border-[#ededed] flex flex-col gap-[12px] h-[96px] w-[116px] items-start justify-center px-[12px] py-[8px] rounded-[8px] shrink-0">
          <div className="bg-white border border-[#ededed]/60 rounded-[4px] size-[32px] flex items-center justify-center shrink-0 shadow-xs">
            <Heart className="size-[18px] text-[#282828]" />
          </div>
          <div className="flex flex-col gap-[4px] items-start leading-normal text-left whitespace-nowrap">
            <div className="flex gap-[4px] items-center text-[#282828]">
              <p className="font-['Inter'] font-semibold text-[14.8px]">
                {profileLikesCount}
              </p>
              <p className="font-['Inter'] font-medium text-[10px] text-[#757575]">
                người
              </p>
            </div>
            <p className="font-['Inter'] font-medium text-[#757575] text-[10px]">
              Đã thích hồ sơ
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
