"use client"

import { Check } from "lucide-react"

interface PaymentOrderSummaryProps {
  planId: string
  billingCycle?: "monthly" | "yearly"
}

// Thẻ Checkmark tối giản
const MinimalCheck = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
)

const PLAN_DETAILS: Record<
  string,
  {
    name: string
    description: string
    monthlyPrice: string
    monthlyRaw: number
    features: string[]
  }
> = {
  single_event: {
    name: "Sự Kiện Nhanh",
    description:
      "Giải pháp trọn gói tuyển gấp cho 1 sự kiện, tiệc cưới, activation hoặc hội nghị.",
    monthlyPrice: "99.000đ",
    monthlyRaw: 99000,
    features: [
      "Hạn mức: 1 sự kiện trọn gói",
      "Ghim tin HOT & Tuyển Gấp 7 ngày",
      "Công cụ Điểm danh & Chấm công QR",
      "Thông báo kết quả duyệt đơn tức thì",
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
    monthlyRaw: 499000,
    features: [
      "Tối đa 5 sự kiện hoạt động cùng lúc trong tháng",
      "Ghim tin nổi bật cho các sự kiện",
      "Huy hiệu Doanh nghiệp VIP & Ưu tiên tìm kiếm",
      "Xuất file Excel danh sách nhân sự & chấm công",
      "Tin nhắn trực tiếp trao đổi với ứng viên",
      "Đẩy tin tự động & Hỗ trợ ưu tiên riêng 24/7",
    ],
  },
  standard: {
    name: "Doanh Nghiệp",
    description:
      "Dành cho Agency sự kiện, Trung tâm tiệc cưới, Khách sạn, Bar/Pub tuyển liên tục.",
    monthlyPrice: "499.000đ",
    monthlyRaw: 499000,
    features: [
      "Tối đa 5 sự kiện hoạt động cùng lúc trong tháng",
      "Ghim tin nổi bật cho các sự kiện",
      "Huy hiệu Doanh nghiệp VIP & Ưu tiên tìm kiếm",
      "Xuất file Excel danh sách nhân sự & chấm công",
      "Tin nhắn trực tiếp trao đổi với ứng viên",
      "Đẩy tin tự động & Hỗ trợ ưu tiên riêng 24/7",
    ],
  },
  starter: {
    name: "Sự Kiện Nhanh",
    description:
      "Giải pháp trọn gói tuyển gấp cho 1 sự kiện, tiệc cưới, activation hoặc hội nghị.",
    monthlyPrice: "99.000đ",
    monthlyRaw: 99000,
    features: [
      "Hạn mức: 1 sự kiện trọn gói",
      "Ghim tin HOT & Tuyển Gấp 7 ngày",
      "Công cụ Điểm danh & Chấm công QR",
      "Thông báo kết quả duyệt đơn tức thì",
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
    monthlyRaw: 0,
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
}: PaymentOrderSummaryProps) {
  const plan = PLAN_DETAILS[planId] || PLAN_DETAILS.single_event
  const priceDisplay = plan.monthlyPrice
  const totalAmount = plan.monthlyRaw

  return (
    <div className="w-full lg:w-[420px] shrink-0 rounded-2xl p-8 sm:p-10 bg-zinc-950 text-white shadow-2xl relative overflow-hidden ring-1 ring-white/10 mt-8 lg:mt-0">
      {/* Ambient background glow inside the dark card */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/15 blur-[80px] pointer-events-none rounded-full" />
      
      {/* Header Info */}
      <div className="space-y-4 relative z-10">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-3xl font-semibold tracking-tight text-white">
            {plan.name}
          </h3>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white text-zinc-950 uppercase tracking-wider shrink-0 shadow-sm mt-1">
            {planId === "single_event" ? "Theo Sự Kiện" : "Gói Tháng"}
          </span>
        </div>
        <p className="text-[14px] text-zinc-400 font-normal leading-relaxed pr-6">
          {plan.description}
        </p>
      </div>

      {/* Pricing Display */}
      <div className="flex items-baseline gap-1.5 pt-8 pb-8 relative z-10">
        <span className="text-4xl font-semibold tracking-tight text-white">
          {priceDisplay}
        </span>
        <span className="text-[15px] font-normal text-zinc-400">
          {planId === "single_event" ? "/ sự kiện" : "/ tháng"}
        </span>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-zinc-800 mb-8 relative z-10" />

      {/* Feature List */}
      <div className="space-y-6 relative z-10">
        <p className="text-[12px] font-semibold text-zinc-400 uppercase tracking-[0.15em]">
          Quyền lợi bao gồm
        </p>
        <ul className="flex flex-col gap-4">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <MinimalCheck className="w-[18px] h-[18px] text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-[14.5px] text-zinc-300 leading-snug">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Summary Footer */}
      <div className="pt-8 mt-8 border-t border-zinc-800 flex items-center justify-between relative z-10">
        <span className="text-zinc-400 text-[15px]">Tổng thanh toán</span>
        <span className="font-mono font-semibold text-[26px] text-white tracking-tight">
          {(totalAmount).toLocaleString("vi-VN")}đ
        </span>
      </div>
    </div>
  )
}
