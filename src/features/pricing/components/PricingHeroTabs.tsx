"use client"

import React from "react"

interface PricingHeroTabsProps {
  billingCycle: "monthly" | "yearly"
  setBillingCycle: (cycle: "monthly" | "yearly") => void
  title?: string
  caption?: string
  monthlyLabel?: string
  yearlyLabel?: string
}

export default function PricingHeroTabs({
  billingCycle,
  setBillingCycle,
  title = "Bảng Giá Tuyển Dụng Nhân Sự Sự Kiện",
  caption = "Tối ưu chi phí theo từng show diễn hoặc giải pháp tuyển dụng trọn gói tại Đà Nẵng.",
  monthlyLabel = "Theo tháng",
  yearlyLabel = "Theo năm",
}: PricingHeroTabsProps) {
  return (
    <div className="flex flex-col items-center gap-[32px] w-full max-w-[1232px] mx-auto">
      {/* Titr home */}
      <div className="flex flex-col items-center justify-center gap-[8px] text-center">
        <h1 className="font-['Inter'] font-semibold text-[32px] sm:text-[36px] text-[#222222] leading-normal tracking-tight">
          {title}
        </h1>
        <p className="font-['Inter'] font-normal text-[15px] sm:text-[16px] text-[#757575] leading-[1.6] max-w-[500px]">
          {caption}
        </p>
      </div>

      {/* Plan Tabs */}
      <div className="w-[400px] max-w-full h-[58px] bg-[#F9F9F9] border border-[#A5A5A5] rounded-[12px] p-[4px] flex items-center shadow-xs">
        {/* Monthly Button */}
        <button
          type="button"
          onClick={() => setBillingCycle("monthly")}
          className={`flex-1 h-[48px] rounded-[8px] flex items-center justify-center font-['Inter'] font-medium text-[17px] sm:text-[18px] transition-colors cursor-pointer ${
            billingCycle === "monthly"
              ? "bg-[#282828] text-white"
              : "text-[#222222] hover:text-[#005DDC]"
          }`}
        >
          {monthlyLabel}
        </button>

        {/* Yearly Button */}
        <button
          type="button"
          onClick={() => setBillingCycle("yearly")}
          className={`flex-1 h-[48px] rounded-[8px] flex items-center justify-center font-['Inter'] font-medium text-[17px] sm:text-[18px] transition-colors cursor-pointer ${
            billingCycle === "yearly"
              ? "bg-[#282828] text-white"
              : "text-[#222222] hover:text-[#005DDC]"
          }`}
        >
          {yearlyLabel}
        </button>
      </div>
    </div>
  )
}
