"use client"

import React from "react"
import { Check, ShieldCheck } from "lucide-react"

interface PaymentOrderSummaryProps {
  planId: string
  billingCycle: "monthly" | "yearly"
}

const PLAN_DETAILS: Record<
  string,
  {
    name: string
    description: string
    monthlyPrice: string
    yearlyPrice: string
    monthlyRaw: number
    yearlyRaw: number
    features: string[]
  }
> = {
  single_event: {
    name: "Sự Kiện Nhanh",
    description:
      "Giải pháp trọn gói tuyển gấp cho 1 sự kiện, tiệc cưới, activation hoặc hội nghị.",
    monthlyPrice: "99.000đ",
    yearlyPrice: "99.000đ",
    monthlyRaw: 99000,
    yearlyRaw: 99000,
    features: [
      "Hạn mức: 1 sự kiện trọn gói",
      "Ghim tin HOT & Tuyển Gấp 7 ngày",
      "Công cụ Điểm danh & Chấm công QR",
      "Tự động cấp link nhóm Zalo khi duyệt đơn",
      "Bộ lọc ứng viên có Điểm uy tín cao",
      "Báo cáo & hạ điểm ứng viên bùng ca",
      "Cấp Giấy chứng nhận E-Certificate",
    ],
  },
  enterprise: {
    name: "Doanh Nghiệp",
    description:
      "Dành cho Agency sự kiện, Trung tâm tiệc cưới, Khách sạn, Bar/Pub tuyển liên tục.",
    monthlyPrice: "499.000đ",
    yearlyPrice: "399.000đ",
    monthlyRaw: 499000,
    yearlyRaw: 399000 * 12,
    features: [
      "Tối đa 5 sự kiện hoạt động cùng lúc trong tháng",
      "Ghim tin nổi bật cho các sự kiện",
      "Showroom ảnh sự kiện & Bản đồ Maps",
      "Xuất file Excel danh sách nhân sự & chấm công",
      "Hệ thống lên lịch Phỏng vấn / Casting",
      "Đẩy tin tự động & Hỗ trợ ưu tiên riêng 24/7",
    ],
  },
  standard: {
    name: "Doanh Nghiệp",
    description:
      "Dành cho Agency sự kiện, Trung tâm tiệc cưới, Khách sạn, Bar/Pub tuyển liên tục.",
    monthlyPrice: "499.000đ",
    yearlyPrice: "399.000đ",
    monthlyRaw: 499000,
    yearlyRaw: 399000 * 12,
    features: [
      "Tối đa 5 sự kiện hoạt động cùng lúc trong tháng",
      "Ghim tin nổi bật cho các sự kiện",
      "Showroom ảnh sự kiện & Bản đồ Maps",
      "Xuất file Excel danh sách nhân sự & chấm công",
      "Hệ thống lên lịch Phỏng vấn / Casting",
      "Đẩy tin tự động & Hỗ trợ ưu tiên riêng 24/7",
    ],
  },
  starter: {
    name: "Sự Kiện Nhanh",
    description:
      "Giải pháp trọn gói tuyển gấp cho 1 sự kiện, tiệc cưới, activation hoặc hội nghị.",
    monthlyPrice: "99.000đ",
    yearlyPrice: "99.000đ",
    monthlyRaw: 99000,
    yearlyRaw: 99000,
    features: [
      "Hạn mức: 1 sự kiện trọn gói",
      "Ghim tin HOT & Tuyển Gấp 7 ngày",
      "Công cụ Điểm danh & Chấm công QR",
      "Tự động cấp link nhóm Zalo khi duyệt đơn",
      "Bộ lọc ứng viên có Điểm uy tín cao",
      "Báo cáo & hạ điểm ứng viên bùng ca",
      "Cấp Giấy chứng nhận E-Certificate",
    ],
  },
  free: {
    name: "Khởi Đầu",
    description:
      "Dành cho cá nhân, CLB sinh viên hoặc quán nhỏ tuyển số lượng ít.",
    monthlyPrice: "0đ",
    yearlyPrice: "0đ",
    monthlyRaw: 0,
    yearlyRaw: 0,
    features: [
      "Hạn mức 1 sự kiện / tháng",
      "Thời hạn hiển thị tin 7 ngày",
      "Nhận & duyệt hồ sơ miễn phí",
      "Xem đầy đủ thông tin liên hệ",
      "Nhắn tin trao đổi ngay trên web",
    ],
  },
}

export default function PaymentOrderSummary({
  planId,
  billingCycle,
}: PaymentOrderSummaryProps) {
  const plan = PLAN_DETAILS[planId] || PLAN_DETAILS.single_event
  const priceDisplay =
    planId === "single_event"
      ? plan.monthlyPrice
      : billingCycle === "yearly"
      ? plan.yearlyPrice
      : plan.monthlyPrice
  const totalAmount =
    planId === "single_event"
      ? plan.monthlyRaw
      : billingCycle === "yearly"
      ? plan.yearlyRaw
      : plan.monthlyRaw

  return (
    <div className="w-full lg:w-[400px] shrink-0 border border-[#CBCBCB] rounded-[16px] p-6 sm:p-8 bg-white shadow-xs space-y-6">
      {/* Header Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[28px] sm:text-[32px] font-semibold text-[#222222] tracking-tight">
            {plan.name}
          </h3>
          <span className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {planId === "single_event"
              ? "Gói theo sự kiện"
              : billingCycle === "yearly"
              ? "Gói theo năm"
              : "Gói theo tháng"}
          </span>
        </div>
        <p className="text-[12px] sm:text-[13px] text-[#757575] font-normal leading-relaxed">
          {plan.description}
        </p>
      </div>

      {/* Pricing Display */}
      <div className="flex items-baseline gap-1.5 pt-2">
        <span className="text-3xl sm:text-4xl font-bold text-[#222222]">
          {priceDisplay}
        </span>
        <span className="text-[14px] font-normal text-[#757575]">
          {planId === "single_event" ? "/ sự kiện" : "/ tháng"}
        </span>
      </div>

      {billingCycle === "yearly" && (
        <div className="p-2.5 rounded-[8px] bg-emerald-50 border border-emerald-200/70 text-[12px] text-emerald-800 font-medium flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Tiết kiệm 20% khi thanh toán trọn gói cả năm ({(totalAmount).toLocaleString("vi-VN")}đ/năm)</span>
        </div>
      )}

      {/* Divider */}
      <hr className="border-[#CBCBCB]/60" />

      {/* Feature List (Figma node 6349:42310) */}
      <div className="space-y-3.5">
        <p className="text-[13px] font-semibold text-[#222222] uppercase tracking-wider">
          Quyền lợi bao gồm:
        </p>
        <ul className="space-y-3.5 text-[13px] sm:text-[14px] text-[#222222]">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#282828] flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
              </div>
              <span className="leading-snug">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Summary Footer */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[14px]">
        <span className="text-[#757575]">Tổng thanh toán:</span>
        <span className="font-bold text-[18px] text-[#005DDC]">
          {(totalAmount).toLocaleString("vi-VN")}đ
        </span>
      </div>
    </div>
  )
}
