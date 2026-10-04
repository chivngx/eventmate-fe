"use client"

import { Sparkles } from "lucide-react"

interface PricingHeroTabsProps {
  title?: string
  caption?: string
}

export default function PricingHeroTabs({
  title = "Bảng Giá Tuyển Dụng Nhân Sự Sự Kiện",
  caption = "Tối ưu chi phí theo từng show diễn hoặc giải pháp tuyển dụng trọn gói tại Đà Nẵng.",
}: PricingHeroTabsProps) {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-[1232px] mx-auto text-center">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-xs font-medium border border-zinc-200">
        <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
        Linh hoạt theo sự kiện & gói tháng cho Agency
      </div>
      <div className="flex flex-col items-center justify-center gap-2">
        <h1 className="font-['Inter'] font-semibold text-[32px] sm:text-[36px] text-zinc-950 leading-normal tracking-tight">
          {title}
        </h1>
        <p className="font-['Inter'] font-normal text-[15px] sm:text-[16px] text-zinc-500 leading-[1.6] max-w-[540px]">
          {caption}
        </p>
      </div>
    </div>
  )
}
