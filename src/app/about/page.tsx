import type { Metadata } from "next"
import MainLayout from "@/components/layout/MainLayout"
import Link from "next/link"
import { Users, Sparkles, ShieldCheck, MapPin, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Về Chúng Tôi — EventMate Đà Nẵng",
  description: "EventMate là nền tảng kết nối nhân sự sự kiện thông minh, uy tín hàng đầu tại Đà Nẵng.",
}

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="bg-white min-h-screen py-10 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#005DDC] border border-blue-200">
              <Sparkles className="w-3.5 h-3.5" />
              Sứ Mệnh Của EventMate
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#222222] tracking-tight">
              Kết Nối Nhân Sự Sự Kiện Hàng Đầu Tại Đà Nẵng
            </h1>
            <p className="text-base sm:text-lg text-[#515151] leading-relaxed">
              EventMate ra đời với sứ mệnh đơn giản hóa quy trình tuyển dụng nhân sự thời vụ và chuyên nghiệp cho mọi lễ hội, hội nghị, triển lãm và sự kiện giải trí tại thành phố đáng sống.
            </p>
          </div>

          {/* 3 Core Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="size-12 rounded-xl bg-blue-100 text-[#005DDC] flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-[#222222]">Cộng Đồng Trẻ & Nhiệt Huyết</h3>
              <p className="text-sm text-[#515151] leading-relaxed">
                Mạng lưới hàng ngàn sinh viên năng động đến từ các trường Đại học lớn tại Đà Nẵng, sẵn sàng cống hiến cho các sự kiện tầm cỡ.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="size-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-[#222222]">Minh Bạch & Uy Tín</h3>
              <p className="text-sm text-[#515151] leading-relaxed">
                Hệ thống đánh giá độ tin cậy hai chiều (Reliability Score), đảm bảo thù lao rõ ràng và giảm thiểu tối đa tình trạng hủy ca.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="size-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-[#222222]">Đậm Chất Đà Nẵng</h3>
              <p className="text-sm text-[#515151] leading-relaxed">
                Tối ưu hóa theo từng quận phường tại Đà Nẵng, giúp ban tổ chức tuyển đúng người tại đúng khu vực diễn ra sự kiện.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-r from-[#005DDC] to-[#004EB7] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold">Bạn Đang Tổ Chức Sự Kiện?</h2>
              <p className="text-blue-100 text-sm sm:text-base max-w-xl">
                Đăng bài tuyển dụng ngay hôm nay để tiếp cận ứng viên tài năng trong vòng vài phút.
              </p>
            </div>
            <Link
              href="/post-job"
              className="px-6 py-3 rounded-xl bg-white text-[#005DDC] hover:bg-blue-50 font-semibold text-sm sm:text-base transition-all shrink-0 flex items-center gap-2 shadow-sm"
            >
              <span>Đăng Tuyển Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    </MainLayout>
  )
}
