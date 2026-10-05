"use client"

import React, { useState } from "react"
import { ChevronDown } from "lucide-react"

const FAQ_ITEMS = [
  {
    id: "faq-1",
    question: "Gói Sự Kiện Nhanh (99.000đ) có thời hạn và quyền lợi gì?",
    answer:
      "Gói Sự Kiện Nhanh áp dụng cho 1 sự kiện cụ thể với thời gian ghim tin HOT & Tuyển Gấp trong 7 ngày. Bạn sẽ được kích hoạt toàn bộ công cụ: Điểm danh & Chấm công sự kiện cho nhân sự ngày chạy event, thông báo kết quả duyệt đơn tức thì, bộ lọc ứng viên có Điểm uy tín cao chống bùng ca và công cụ cấp Chứng nhận E-Certificate cho nhân sự hoàn thành.",
  },
  {
    id: "faq-2",
    question: "Gói Doanh Nghiệp (499.000đ/tháng) có giới hạn bao nhiêu sự kiện?",
    answer:
      "Gói Doanh Nghiệp cho phép bạn quản lý tối đa 5 sự kiện hoạt động cùng lúc trong tháng (chỉ 399.000đ/tháng khi đăng ký theo năm). Gói này bao gồm Huy hiệu Doanh nghiệp VIP & Ưu tiên tìm kiếm, ghim tin nổi bật, xuất file Excel chấm công tính lương, và hệ thống tin nhắn trực tiếp trao đổi với ứng viên.",
  },
  {
    id: "faq-3",
    question: "Tôi có thể bắt đầu với gói Miễn Phí (0đ) không?",
    answer:
      "Có, bạn hoàn toàn có thể bắt đầu với gói Khởi Đầu (Free 0đ) để đăng tối đa 1 sự kiện/tháng. Khi cần tuyển gấp trong 24h hoặc cần công cụ điểm danh QR tại chỗ, bạn có thể nâng cấp lên gói Sự Kiện Nhanh bất cứ lúc nào.",
  },
  {
    id: "faq-4",
    question: "Mức giá niêm yết đã bao gồm thuế VAT và phí dịch vụ chưa?",
    answer:
      "Tất cả mức giá hiển thị đã bao gồm đầy đủ phí dịch vụ. Đối với các đơn vị doanh nghiệp, agency cần xuất hóa đơn tài chính (VAT), EventMate hỗ trợ phát hành hóa đơn điện tử hợp lệ nhanh chóng.",
  },
  {
    id: "faq-5",
    question: "EventMate hỗ trợ những phương thức thanh toán nào?",
    answer:
      "EventMate hỗ trợ quét mã VietQR ngân hàng (MBBank, Vietcombank, Techcombank...) qua cổng payOS. Quá trình thanh toán diễn ra tự động 24/7 và kích hoạt quyền lợi gói ngay trong 3-5 giây.",
  },
]

interface PricingFaqAccordionProps {
  title?: string
  caption?: string
}

export default function PricingFaqAccordion({
  title = "Câu Hỏi Thường Gặp",
  caption = "Tất cả những gì bạn cần biết về gói dịch vụ, chính sách và thanh toán.",
}: PricingFaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleIndex = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section className="max-w-[1000px] mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20 items-start pt-16">
      
      {/* Cột trái: Tiêu đề Sticky */}
      <div className="flex flex-col gap-4 lg:sticky lg:top-24">
        <h2 className="font-semibold text-3xl sm:text-4xl text-zinc-900 tracking-tight leading-tight">
          {title}
        </h2>
        <p className="text-[16px] text-zinc-500 leading-relaxed max-w-[320px]">
          {caption}
        </p>
      </div>

      {/* Cột phải: Accordion list, không viền */}
      <div className="flex flex-col w-full divide-y divide-zinc-200 border-t border-zinc-200">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx

          return (
            <div key={item.id} className="py-6 group">
              <button
                type="button"
                onClick={() => toggleIndex(idx)}
                className="w-full text-left flex items-start justify-between gap-6 cursor-pointer"
              >
                <span className="font-medium text-[16px] sm:text-[17px] text-zinc-900 leading-snug group-hover:text-zinc-600 transition-colors">
                  {item.question}
                </span>

                <span className="flex items-center justify-center shrink-0 mt-0.5">
                  <ChevronDown
                    className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </button>

              <div 
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="text-[15px] text-zinc-500 leading-relaxed pr-8">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
