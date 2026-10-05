"use client"

import { Sparkles } from "lucide-react"

interface PricingHeroTabsProps {
  title?: string
  caption?: string
}

export default function PricingHeroTabs({
  title = "Tuyển dụng tinh gọn.\nHiệu quả tối đa.",
  caption = "Giải pháp nhân sự sự kiện chuyên nghiệp tại Đà Nẵng. Linh hoạt theo từng show diễn hoặc trọn gói cho Agency.",
}: PricingHeroTabsProps) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-[800px] mx-auto text-center">
      <div className="font-mono text-[11px] sm:text-[12px] uppercase tracking-[0.2em] text-zinc-500 font-medium">
        Lựa chọn gói dịch vụ
      </div>
      <div className="flex flex-col items-center justify-center gap-6">
        <h1 className="font-semibold text-5xl sm:text-6xl md:text-7xl text-zinc-950 leading-[1.1] tracking-tighter whitespace-pre-line">
          {title}
        </h1>
        <p className="text-[16px] sm:text-[18px] text-zinc-500 leading-relaxed max-w-[540px]">
          {caption}
        </p>
      </div>
    </div>
  )
}
