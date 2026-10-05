"use client"

import { Check, Sparkles, ArrowRight } from "lucide-react"

interface PricingCardsGridProps {
  onSelectPlan: (planId: string) => void
  isPremium?: boolean
  premiumUntil?: string | null
  singleEventCredits?: number
}

// Thẻ Checkmark tối giản
const MinimalCheck = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
)

export default function PricingCardsGrid({
  onSelectPlan,
  isPremium = false,
  premiumUntil,
  singleEventCredits = 0,
}: PricingCardsGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-[1100px] mx-auto w-full items-end mt-4">
      
      {/* 1. FREE PLAN - Tinh gọn, không viền */}
      <div className="w-full flex flex-col justify-between p-8 sm:p-10 rounded-2xl bg-transparent lg:pb-10 shrink-0 border border-transparent">
        <div>
          {/* Header Fixed Height để gióng hàng */}
          <div className="min-h-[160px] flex flex-col">
            <h3 className="text-2xl font-semibold text-zinc-900 tracking-tight mb-2">
              Khởi Đầu
            </h3>
            <p className="text-[14px] text-zinc-500 leading-relaxed mb-6 h-[40px]">
              Cá nhân, CLB sinh viên hoặc quán nhỏ tuyển số lượng ít.
            </p>
            <div className="flex items-baseline gap-1 mt-auto">
              <span className="text-4xl font-semibold text-zinc-900 tracking-tight">0đ</span>
              <span className="text-zinc-500 text-[15px]">/tháng</span>
            </div>
          </div>

          <div className="w-full h-px bg-zinc-200 my-8" />

          {/* Feature list */}
          <ul className="flex flex-col gap-4">
            {[
              "Hạn mức 1 sự kiện / tháng",
              "Thời hạn hiển thị tin 7 ngày",
              "Nhận & duyệt hồ sơ miễn phí",
              "Xem đầy đủ thông tin liên hệ",
              "Nhắn tin trao đổi ngay trên web",
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <MinimalCheck className="w-[18px] h-[18px] text-zinc-400 shrink-0 mt-0.5" />
                <span className="text-[15px] text-zinc-600 leading-snug">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-10">
          <button
            type="button"
            onClick={() => onSelectPlan("free")}
            disabled={isPremium}
            className={`w-full h-12 rounded-xl font-medium text-[15px] transition-all flex items-center justify-center ${
              isPremium
                ? "text-zinc-400 bg-zinc-100 cursor-not-allowed"
                : "text-zinc-900 bg-zinc-200/50 hover:bg-zinc-200 active:scale-[0.98] cursor-pointer"
            }`}
          >
            {isPremium ? "Đã nâng cấp VIP" : "Bắt đầu miễn phí"}
          </button>
        </div>
      </div>

      {/* 2. SỰ KIỆN NHANH - Dark Mode, Nổi bật */}
      <div className="w-full flex flex-col justify-between p-8 sm:p-10 bg-zinc-950 rounded-2xl relative shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] shrink-0 z-10 ring-1 ring-white/10 lg:-translate-y-4">
        {/* Minimal Label thay vì Badge gắn góc */}
        <div className="absolute -top-3 left-8 bg-white text-zinc-950 px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold shadow-sm">
          Phổ biến nhất
        </div>

        <div>
          {/* Header Fixed Height */}
          <div className="min-h-[160px] flex flex-col">
            <h3 className="text-2xl font-semibold text-white tracking-tight mb-2">
              Sự Kiện Nhanh
            </h3>
            {singleEventCredits > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-300 bg-emerald-950/50 border border-emerald-800/50 px-2.5 py-1 rounded-full mb-6 self-start">
                <Sparkles className="w-3.5 h-3.5" />
                Còn {singleEventCredits} lượt chưa dùng
              </span>
            ) : (
              <p className="text-[14px] text-zinc-400 leading-relaxed mb-6 h-[40px]">
                Giải pháp trọn gói tuyển gấp cho 1 sự kiện, hội nghị.
              </p>
            )}
            <div className="flex items-baseline gap-1 mt-auto">
              <span className="text-4xl font-semibold text-white tracking-tight">99k</span>
              <span className="text-zinc-400 text-[15px]">/sự kiện</span>
            </div>
          </div>

          <div className="w-full h-px bg-zinc-800 my-8" />

          {/* Feature list */}
          <ul className="flex flex-col gap-4">
            {[
              "Hạn mức: 1 sự kiện trọn gói",
              "Ghim tin HOT & Tuyển Gấp 7 ngày",
              "Công cụ Điểm danh & Chấm công QR",
              "Thông báo duyệt đơn tức thì",
              "Bộ lọc ứng viên Điểm uy tín cao",
              "Báo cáo & hạ điểm ứng viên bùng ca",
              "Cấp Giấy chứng nhận E-Certificate",
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <MinimalCheck className="w-[18px] h-[18px] text-zinc-100 shrink-0 mt-0.5" />
                <span className="text-[15px] text-zinc-300 leading-snug">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-10">
          <button
            type="button"
            onClick={() => onSelectPlan("single_event")}
            className="w-full h-12 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-[15px] transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            {singleEventCredits > 0 ? "Mua thêm Sự Kiện (99k)" : "Chọn gói Sự Kiện"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. DOANH NGHIỆP - Sharp, Chuyên nghiệp */}
      <div className={`w-full flex flex-col justify-between p-8 sm:p-10 bg-white rounded-2xl shrink-0 ${isPremium ? 'ring-2 ring-emerald-500 shadow-xl' : 'ring-1 ring-zinc-200/80 shadow-sm'}`}>
        <div>
          {/* Header Fixed Height */}
          <div className="min-h-[160px] flex flex-col">
            <h3 className="text-2xl font-semibold text-zinc-900 tracking-tight mb-2">
              Doanh Nghiệp
            </h3>
            <p className="text-[14px] text-zinc-500 leading-relaxed mb-6 h-[40px]">
              Dành cho Agency sự kiện, Nhà hàng, Khách sạn tuyển liên tục.
            </p>
            <div className="flex items-baseline gap-1 mt-auto">
              <span className="text-4xl font-semibold text-zinc-900 tracking-tight">499k</span>
              <span className="text-zinc-500 text-[15px]">/tháng</span>
            </div>
          </div>

          <div className="w-full h-px bg-zinc-200 my-8" />

          {/* Feature list */}
          <ul className="flex flex-col gap-4">
            {[
              "Tối đa 5 sự kiện / tháng",
              "Ghim tin nổi bật cho các sự kiện",
              "Huy hiệu Doanh nghiệp VIP",
              "Ưu tiên hiển thị kết quả tìm kiếm",
              "Xuất file Excel nhân sự & chấm công",
              "Đẩy tin tự động & Hỗ trợ riêng 24/7",
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <MinimalCheck className="w-[18px] h-[18px] text-zinc-900 shrink-0 mt-0.5" />
                <span className="text-[15px] text-zinc-600 leading-snug">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-10">
          {isPremium ? (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled
                className="w-full h-12 rounded-xl bg-emerald-50 text-emerald-800 font-semibold text-[15px] flex items-center justify-center gap-2 cursor-default"
              >
                <Check className="w-4 h-4 text-emerald-600" />
                Đang sử dụng gói VIP
              </button>
              {premiumUntil && (
                <p className="text-xs text-center text-zinc-400 font-medium mt-1">
                  Hạn dùng: {new Date(premiumUntil).toLocaleDateString("vi-VN")}
                </p>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onSelectPlan("enterprise")}
              className="w-full h-12 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 font-medium text-[15px] transition-all flex items-center justify-center active:scale-[0.98] cursor-pointer"
            >
              Trải nghiệm Doanh Nghiệp
            </button>
          )}
        </div>
      </div>

    </div>
  )
}
