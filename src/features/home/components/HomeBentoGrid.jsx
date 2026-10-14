"use client"

import { useRouter } from "next/navigation"
import { ShieldCheck, ArrowUpRight, CheckCircle2, Lock, Building2, Calendar, FileCheck, Award } from "lucide-react"

export default function HomeBentoGrid() {
  const router = useRouter()

  return (
    <section className="w-full py-8 md:py-12" aria-label="Tiêu chuẩn nhân sự">
      {/* Section Header directly matching "Build the Perfect Card" in reference image */}
      <div className="text-center max-w-xl mx-auto mb-8 md:mb-10">
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-slate-400 mb-2">
          THE FUTURE OF EVENT HIRING, <span className="text-[#0D9488] font-bold">TODAY</span>
        </p>
        <h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-[-0.03em]"
          style={{ fontFamily: "'Plus Jakarta Sans', 'Lexend', 'Be Vietnam Pro', sans-serif" }}
        >
          Quy chuẩn nhân sự{" "}
          <span className="bg-gradient-to-r from-[#0F766E] via-[#14B8A6] to-[#2DD4BF] bg-clip-text text-transparent">
            chuyên nghiệp
          </span>
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-500 font-normal">
          Mọi quy trình từ ứng tuyển, kiểm duyệt hồ sơ cho đến thanh toán thù lao đều minh bạch và chuẩn mực.
        </p>
      </div>

      {/* 3-Column Clean Bento Grid (rounded-xl, no childlike rounding) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">

        {/* Card 1: Ca làm & Thù lao minh bạch (Soft warm neutral tone) */}
        <div
          onClick={() => router.push("/events")}
          className="group relative h-[360px] md:h-[380px] rounded-xl p-6 flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#F9FBFA] to-white border border-gray-200/80 hover:border-teal-200 hover:shadow-md transition-all cursor-pointer"
        >
          {/* Clean Shift UI Card Mockup */}
          <div className="relative w-full h-[190px] flex items-center justify-center">
            <div className="w-[92%] bg-white rounded-lg p-4 shadow-sm border border-gray-200 rotate-[-2deg] group-hover:rotate-0 transition-transform">
              <div className="flex items-center justify-between mb-2.5 text-[11px]">
                <span className="font-semibold text-slate-400 uppercase tracking-wider">Phiếu điều phối ca</span>
                <span className="text-teal-800 bg-teal-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-teal-200/70">
                  Đã duyệt
                </span>
              </div>

              <div className="space-y-1 mb-3">
                <p className="text-sm font-bold text-slate-900">Lễ tân đón khách VIP & Check-in</p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-400" /> Ariyana Convention Centre Danang
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Thù lao chuẩn</span>
                  <span className="text-sm font-bold text-slate-900">500.000đ / ca</span>
                </div>
                <span className="bg-[#0D9488] hover:bg-[#0F766E] text-white px-3 py-1 rounded text-xs font-medium transition-colors">
                  Ứng tuyển
                </span>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Ca làm & Thù lao minh bạch
              </h3>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#0D9488] transition-colors" />
            </div>
            <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-normal">
              Doanh nghiệp công khai mức lương, nhiệm vụ và giờ giấc cụ thể trước khi ứng viên xác nhận.
            </p>
          </div>
        </div>

        {/* Card 2: Xác thực & Bảo vệ quyền lợi (Soft mint tone with clean shield) */}
        <div
          onClick={() => router.push("/blog")}
          className="group relative h-[360px] md:h-[380px] rounded-xl p-6 flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#E6F8F0] to-white border border-teal-100 hover:border-teal-300 hover:shadow-md transition-all cursor-pointer"
        >
          {/* Faint Wordmark */}
          <span className="absolute top-6 inset-x-0 text-center text-[70px] font-black text-teal-900/[0.03] tracking-widest uppercase select-none pointer-events-none">
            Secure
          </span>

          {/* Frosted Glass Shield Mockup */}
          <div className="relative w-full h-[190px] flex items-center justify-center">
            {/* Top pill */}
            <div className="absolute w-[86%] bg-white/95 rounded-lg py-2 px-3 border border-gray-200 shadow-2xs -translate-y-8 flex items-center justify-between text-[11px] text-slate-700 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0D9488]" /> Xác thực pháp lý BTC
              </span>
              <span className="text-teal-800 font-bold">100% eKYC</span>
            </div>

            {/* Clean Shield Icon */}
            <div className="relative z-10 w-16 h-18 rounded-xl bg-gradient-to-br from-[#0D9488] to-[#14B8A6] shadow-md flex items-center justify-center border border-white/40">
              <Lock className="w-7 h-7 text-white" />
            </div>

            {/* Bottom pill */}
            <div className="absolute w-[86%] bg-white/95 rounded-lg py-2 px-3 border border-gray-200 shadow-2xs translate-y-8 flex items-center justify-between text-[11px] text-slate-700 font-medium">
              <span className="flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-[#0D9488]" /> Hợp đồng & Cam kết thanh toán
              </span>
              <span className="text-slate-900 font-bold">Chuẩn hóa</span>
            </div>
          </div>

          {/* Text Content */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Xác thực & Bảo đảm pháp lý
              </h3>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#0D9488] transition-colors" />
            </div>
            <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-normal">
              100% doanh nghiệp và nhân sự đều được kiểm tra định danh, tạo dựng môi trường hợp tác tin cậy.
            </p>
          </div>
        </div>

        {/* Card 3: Hồ sơ số & Đánh giá uy tín (Soft teal tone with overlapping cards) */}
        <div
          onClick={() => router.push("/events")}
          className="group relative h-[360px] md:h-[380px] rounded-xl p-6 flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#F0FAF7] to-white border border-teal-100 hover:border-teal-300 hover:shadow-md transition-all cursor-pointer"
        >
          {/* Overlapping Sleek Professional Cards */}
          <div className="relative w-full h-[190px] flex items-center justify-center">
            {/* Dark Metallic Card */}
            <div className="w-[86%] h-[105px] rounded-lg bg-slate-900 p-3.5 text-white shadow-md border border-slate-700/80 -rotate-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-semibold text-[#2DD4BF]">HỒ SƠ NHÂN SỰ</span>
                <span>EV-STAFF-2026</span>
              </div>
              <div>
                <p className="text-xs font-bold text-white">Nguyễn Minh Anh</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>Trưởng nhóm sự kiện</span>
                  <span className="text-[#2DD4BF] font-bold">4.9 / 5.0 (28 show)</span>
                </div>
              </div>
            </div>

            {/* Overlapping Card */}
            <div className="absolute w-[80%] h-[90px] rounded-lg bg-gradient-to-r from-teal-900 to-teal-700 p-3 text-white shadow-lg border border-teal-500/40 rotate-3 translate-y-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] font-semibold text-teal-200">
                <span>DỰ ÁN ĐANG TRIỂN KHAI</span>
                <span className="bg-teal-500/30 px-1.5 py-0.2 rounded text-[9px]">Xác nhận</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span>Danang International Fireworks</span>
                <span className="text-[#2DD4BF]">20 Nhân sự</span>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Hồ sơ số & Đánh giá năng lực
              </h3>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#0D9488] transition-colors" />
            </div>
            <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-normal">
              Đánh giá công tâm dựa trên chất lượng làm việc thực tế, giúp doanh nghiệp an tâm giao việc.
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}
