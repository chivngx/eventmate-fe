"use client"

import React from "react"
import { Check, Sparkles } from "lucide-react"

interface PricingCardsGridProps {
  billingCycle: "monthly" | "yearly"
  onSelectPlan: (planId: string) => void
  isPremium?: boolean
  premiumUntil?: string | null
  singleEventCredits?: number
}

export default function PricingCardsGrid({
  billingCycle,
  onSelectPlan,
  isPremium = false,
  premiumUntil,
  singleEventCredits = 0,
}: PricingCardsGridProps) {
  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-[16px] max-w-[1232px] mx-auto w-full">
      
      {/* 1. FREE PLAN - KHỞI ĐẦU */}
      <div className="w-full lg:w-[296px] min-h-[622px] px-[16px] py-[32px] bg-white border border-[#CBCBCB] rounded-[16px] flex flex-col justify-between shrink-0">
        <div>
          {/* Header Info */}
          <div className="flex flex-col gap-[8px]">
            <h3 className="text-[32px] font-semibold text-[#222222] tracking-tight leading-normal">
              Khởi Đầu
            </h3>
            <p className="text-[12px] text-[#757575] font-normal leading-[1.6] min-h-[45px]">
              Dành cho cá nhân, CLB sinh viên hoặc quán nhỏ tuyển số lượng ít.
            </p>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-[4px] mt-[32px] mb-[24px]">
            <span className="text-[36px] font-semibold text-[#222222] leading-none">
              0đ
            </span>
            <span className="text-[16px] font-normal text-[#757575]">
              / tháng
            </span>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-[#CBCBCB] mb-[24px]" />

          {/* Feature list */}
          <ul className="flex flex-col gap-[16px]">
            <li className="flex items-center gap-[8px]">
              <Check className="w-[20px] h-[20px] text-[#222222] shrink-0 stroke-[2]" />
              <span className="text-[14px] font-medium text-[#222222] leading-[1.6]">
                Hạn mức 1 sự kiện / tháng
              </span>
            </li>
            <li className="flex items-center gap-[8px]">
              <Check className="w-[20px] h-[20px] text-[#222222] shrink-0 stroke-[2]" />
              <span className="text-[14px] font-medium text-[#222222] leading-[1.6]">
                Thời hạn hiển thị tin 7 ngày
              </span>
            </li>
            <li className="flex items-center gap-[8px]">
              <Check className="w-[20px] h-[20px] text-[#222222] shrink-0 stroke-[2]" />
              <span className="text-[14px] font-medium text-[#222222] leading-[1.6]">
                Nhận & duyệt hồ sơ miễn phí
              </span>
            </li>
            <li className="flex items-center gap-[8px]">
              <Check className="w-[20px] h-[20px] text-[#222222] shrink-0 stroke-[2]" />
              <span className="text-[14px] font-medium text-[#222222] leading-[1.6]">
                Xem đầy đủ thông tin liên hệ
              </span>
            </li>
            <li className="flex items-center gap-[8px]">
              <Check className="w-[20px] h-[20px] text-[#222222] shrink-0 stroke-[2]" />
              <span className="text-[14px] font-medium text-[#222222] leading-[1.6]">
                Nhắn tin trao đổi ngay trên web
              </span>
            </li>
          </ul>
        </div>

        {/* CTA Button */}
        <div className="pt-[32px]">
          <button
            type="button"
            onClick={() => onSelectPlan("free")}
            disabled={isPremium}
            className={`w-full h-[48px] rounded-[8px] border font-medium text-[16px] sm:text-[18px] transition-colors flex items-center justify-center ${
              isPremium
                ? "border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed"
                : "border-[#282828] text-[#282828] hover:bg-[#282828] hover:text-white cursor-pointer"
            }`}
          >
            {isPremium ? "Đã nâng cấp VIP" : "Bắt đầu miễn phí"}
          </button>
        </div>
      </div>

      {/* 2. SỰ KIỆN NHANH - HIGHLIGHTED CENTER */}
      <div className="w-full lg:w-[400px] min-h-[622px] p-[32px] bg-white border-2 border-[#282828] rounded-[16px] flex flex-col justify-between relative shrink-0 shadow-sm">
        {/* Most Popular Badge */}
        <div className="absolute top-[-1px] right-[30px] bg-[#222222] text-white px-[12px] py-[4px] rounded-b-[6px] text-[12px] font-medium leading-normal shadow-xs">
          Phổ biến nhất
        </div>

        <div>
          {/* Header Info */}
          <div className="flex flex-col gap-[8px]">
            <h3 className="text-[32px] font-semibold text-[#282828] tracking-tight leading-normal">
              Sự Kiện Nhanh
            </h3>
            {singleEventCredits > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full self-start">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Đang có {singleEventCredits} lượt chưa dùng
              </span>
            )}
            <p className="text-[12px] text-[#757575] font-normal leading-[1.6] min-h-[45px]">
              Giải pháp trọn gói tuyển gấp cho 1 sự kiện, tiệc cưới, activation hoặc hội nghị.
            </p>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-[4px] mt-[32px] mb-[24px]">
            <span className="text-[36px] font-semibold text-[#222222] leading-none">
              99.000đ
            </span>
            <span className="text-[16px] font-normal text-[#757575]">
              / sự kiện
            </span>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-[#CBCBCB] mb-[24px]" />

          {/* Feature list */}
          <ul className="flex flex-col gap-[16px]">
            <li className="flex items-center gap-[8px]">
              <Check className="w-[20px] h-[20px] text-[#005DDC] shrink-0 stroke-[2]" />
              <span className="text-[14px] font-semibold text-[#222222] leading-[1.6]">
                Hạn mức: 1 sự kiện trọn gói
              </span>
            </li>
            <li className="flex items-center gap-[8px]">
              <Check className="w-[20px] h-[20px] text-[#005DDC] shrink-0 stroke-[2]" />
              <span className="text-[14px] font-medium text-[#222222] leading-[1.6]">
                Ghim tin HOT & Tuyển Gấp 7 ngày
              </span>
            </li>
            <li className="flex items-center gap-[8px]">
              <Check className="w-[20px] h-[20px] text-[#005DDC] shrink-0 stroke-[2]" />
              <span className="text-[14px] font-medium text-[#222222] leading-[1.6]">
                Công cụ Điểm danh & Chấm công QR
              </span>
            </li>
            <li className="flex items-center gap-[8px]">
              <Check className="w-[20px] h-[20px] text-[#005DDC] shrink-0 stroke-[2]" />
              <span className="text-[14px] font-medium text-[#222222] leading-[1.6]">
                Tự động cấp link nhóm Zalo khi duyệt
              </span>
            </li>
            <li className="flex items-center gap-[8px]">
              <Check className="w-[20px] h-[20px] text-[#005DDC] shrink-0 stroke-[2]" />
              <span className="text-[14px] font-medium text-[#222222] leading-[1.6]">
                Bộ lọc ứng viên có Điểm uy tín cao
              </span>
            </li>
            <li className="flex items-center gap-[8px]">
              <Check className="w-[20px] h-[20px] text-[#005DDC] shrink-0 stroke-[2]" />
              <span className="text-[14px] font-medium text-[#222222] leading-[1.6]">
                Báo cáo & hạ điểm ứng viên bùng ca
              </span>
            </li>
            <li className="flex items-center gap-[8px]">
              <Check className="w-[20px] h-[20px] text-[#005DDC] shrink-0 stroke-[2]" />
              <span className="text-[14px] font-medium text-[#222222] leading-[1.6]">
                Cấp Giấy chứng nhận E-Certificate
              </span>
            </li>
          </ul>
        </div>

        {/* CTA Button */}
        <div className="pt-[32px]">
          <button
            type="button"
            onClick={() => onSelectPlan("single_event")}
            className="w-full h-[48px] rounded-[8px] bg-[#282828] hover:bg-[#005DDC] text-white font-medium text-[18px] transition-colors flex items-center justify-center shadow-xs cursor-pointer"
          >
            {singleEventCredits > 0 ? "Mua thêm Sự Kiện (99k)" : "Chọn gói Sự Kiện (99k)"}
          </button>
        </div>
      </div>

      {/* 3. DOANH NGHIỆP - ENTERPRISE */}
      <div
        className={`w-full lg:w-[296px] min-h-[622px] px-[16px] py-[32px] bg-white border ${
          isPremium
            ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
            : "border-[#CBCBCB]"
        } rounded-[16px] flex flex-col justify-between shrink-0 relative`}
      >
        {isPremium && (
          <div className="absolute top-[-1px] right-[24px] bg-emerald-600 text-white px-[12px] py-[4px] rounded-b-[6px] text-[12px] font-semibold flex items-center gap-1 shadow-xs">
            <Check className="w-3.5 h-3.5" /> Gói hiện tại
          </div>
        )}

        <div>
          {/* Header Info */}
          <div className="flex flex-col gap-[8px]">
            <h3 className="text-[32px] font-semibold text-[#222222] tracking-tight leading-normal">
              Doanh Nghiệp
            </h3>
            <p className="text-[12px] text-[#757575] font-normal leading-[1.6] min-h-[45px]">
              Dành cho Agency sự kiện, Trung tâm tiệc cưới, Khách sạn, Bar/Pub tuyển liên tục.
            </p>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-[4px] mt-[32px] mb-[24px]">
            <span className="text-[36px] font-semibold text-[#222222] leading-none">
              {billingCycle === "yearly" ? "399.000đ" : "499.000đ"}
            </span>
            <span className="text-[16px] font-normal text-[#757575]">
              / tháng
            </span>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-[#CBCBCB] mb-[24px]" />

          {/* Feature list */}
          <ul className="flex flex-col gap-[16px]">
            <li className="flex items-center gap-[8px]">
              <Check className="w-[20px] h-[20px] text-[#222222] shrink-0 stroke-[2]" />
              <span className="text-[14px] font-semibold text-[#222222] leading-[1.6]">
                Tối đa 5 sự kiện / tháng
              </span>
            </li>
            <li className="flex items-center gap-[8px]">
              <Check className="w-[20px] h-[20px] text-[#222222] shrink-0 stroke-[2]" />
              <span className="text-[14px] font-medium text-[#222222] leading-[1.6]">
                Ghim tin nổi bật cho các sự kiện
              </span>
            </li>
            <li className="flex items-center gap-[8px]">
              <Check className="w-[20px] h-[20px] text-[#222222] shrink-0 stroke-[2]" />
              <span className="text-[14px] font-medium text-[#222222] leading-[1.6]">
                Huy hiệu Doanh nghiệp VIP & Ưu tiên tìm kiếm
              </span>
            </li>
            <li className="flex items-center gap-[8px]">
              <Check className="w-[20px] h-[20px] text-[#222222] shrink-0 stroke-[2]" />
              <span className="text-[14px] font-medium text-[#222222] leading-[1.6]">
                Xuất file Excel nhân sự & chấm công
              </span>
            </li>
            <li className="flex items-center gap-[8px]">
              <Check className="w-[20px] h-[20px] text-[#222222] shrink-0 stroke-[2]" />
              <span className="text-[14px] font-medium text-[#222222] leading-[1.6]">
                Hệ thống lên lịch Phỏng vấn / Casting
              </span>
            </li>
            <li className="flex items-center gap-[8px]">
              <Check className="w-[20px] h-[20px] text-[#222222] shrink-0 stroke-[2]" />
              <span className="text-[14px] font-medium text-[#222222] leading-[1.6]">
                Đẩy tin tự động & Hỗ trợ riêng 24/7
              </span>
            </li>
          </ul>
        </div>

        {/* CTA Button */}
        <div className="pt-[32px]">
          {isPremium ? (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled
                className="w-full h-[48px] rounded-[8px] bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold text-[16px] flex items-center justify-center gap-2 cursor-default"
              >
                <Check className="w-4 h-4 text-emerald-600" />
                Đang sử dụng
              </button>
              {premiumUntil && (
                <p className="text-[11.5px] text-center text-slate-500 font-normal">
                  Hạn dùng: {new Date(premiumUntil).toLocaleDateString("vi-VN")}
                </p>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onSelectPlan("enterprise")}
              className="w-full h-[48px] rounded-[8px] border border-[#282828] text-[#282828] hover:bg-[#282828] hover:text-white font-medium text-[18px] transition-colors flex items-center justify-center cursor-pointer"
            >
              Chọn gói Doanh Nghiệp
            </button>
          )}
        </div>
      </div>

    </div>
  )
}
