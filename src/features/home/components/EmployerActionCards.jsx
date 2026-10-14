"use client"

import { useRouter } from "next/navigation"
import { Users, FilePlus2, Handshake, Receipt, ArrowRight } from "lucide-react"

const EMPLOYER_ACTION_CARDS = [
  {
    id: "post-job",
    title: "Đăng tin tuyển dụng",
    subtitle: "Tạo ca làm việc và nhận ứng viên ngay",
    actionText: "Đăng tin ngay",
    href: "/organizer/events/new",
    icon: FilePlus2,
  },
  {
    id: "find-candidates",
    title: "Tìm kiếm nhân sự",
    subtitle: "Duyệt hồ sơ nhân sự theo chuyên môn",
    actionText: "Khám phá nhân sự",
    href: "/dashboard",
    icon: Users,
  },
  {
    id: "become-partner",
    title: "Giải pháp doanh nghiệp",
    subtitle: "Cung ứng trọn gói cho sự kiện quy mô lớn",
    actionText: "Liên hệ hợp tác",
    href: "/pricing",
    icon: Handshake,
  },
  {
    id: "pricing-quote",
    title: "Báo giá & Dịch vụ",
    subtitle: "Minh bạch chi phí và quyền lợi hợp đồng",
    actionText: "Xem bảng giá",
    href: "/pricing",
    icon: Receipt,
  },
]

export default function EmployerActionCards() {
  const router = useRouter()

  return (
    <section className="w-full bg-white rounded-xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs" aria-label="Dành cho Ban Tổ Chức">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Dành cho Nhà tổ chức & Doanh nghiệp
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Giải pháp tuyển chọn và điều phối nhân sự nhanh chóng, chuẩn mực
          </p>
        </div>
      </div>

      {/* 4 Cards Grid (clean corporate borders, no childlike bubbles, no orange) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {EMPLOYER_ACTION_CARDS.map((card) => {
          const IconComp = card.icon

          return (
            <div
              key={card.id}
              onClick={() => router.push(card.href)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  router.push(card.href)
                }
              }}
              className="group bg-slate-50/70 hover:bg-teal-50/50 rounded-xl p-5 cursor-pointer transition-all border border-gray-200/80 hover:border-teal-300 flex flex-col justify-between select-none min-h-[140px]"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-white border border-gray-200/80 shadow-2xs flex items-center justify-center text-[#0D9488] mb-3 group-hover:border-teal-200 transition-colors">
                  <IconComp className="w-5 h-5" />
                </div>
                <h3 className="text-[15px] font-bold text-slate-900 leading-snug">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {card.subtitle}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200/60 flex items-center justify-between text-xs font-semibold text-teal-800">
                <span>{card.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#0D9488] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
