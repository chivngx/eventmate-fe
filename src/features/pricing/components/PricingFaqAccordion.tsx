"use client"

import React, { useState } from "react"
import { ChevronDown } from "lucide-react"

const FAQ_ITEMS = [
  {
    id: "faq-1",
    question: "Gói Sự Kiện Nhanh (99.000đ) có thời hạn và quyền lợi gì?",
    answer:
      "Gói Sự Kiện Nhanh áp dụng cho 1 sự kiện cụ thể với thời gian ghim tin HOT & Tuyển Gấp trong 7 ngày. Bạn sẽ được kích hoạt toàn bộ công cụ: Điểm danh & Chấm công sự kiện cho nhân sự ngày chạy event, tự động gửi link nhóm Zalo, bộ lọc ứng viên có Điểm uy tín cao chống bùng ca và công cụ cấp Chứng nhận E-Certificate cho nhân sự hoàn thành.",
  },
  {
    id: "faq-2",
    question: "Gói Doanh Nghiệp (499.000đ/tháng) có giới hạn bao nhiêu sự kiện?",
    answer:
      "Gói Doanh Nghiệp cho phép bạn quản lý tối đa 5 sự kiện hoạt động cùng lúc trong tháng (chỉ 399.000đ/tháng khi đăng ký theo năm). Gói này bao gồm Huy hiệu Doanh nghiệp VIP & Ưu tiên tìm kiếm, ghim tin nổi bật, xuất file Excel chấm công tính lương, và hệ thống lên lịch Phỏng vấn / Casting trực tuyến.",
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
  title = "Câu Hỏi Thường Gặp Về Bảng Giá",
  caption = "Giải đáp các câu hỏi thường gặp về gói dịch vụ, chính sách thanh toán và quyền lợi.",
}: PricingFaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleIndex = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section className="max-w-[1024px] mx-auto w-full flex flex-col gap-[32px] items-center">
      {/* Titr home (Figma node 5875:28777) */}
      <div className="flex flex-col items-center justify-center gap-[8px] text-center w-full">
        <h2 className="font-['Inter'] font-semibold text-[32px] sm:text-[36px] text-[#353535] leading-normal tracking-tight">
          {title}
        </h2>
        <p className="font-['Inter'] font-normal text-[15px] sm:text-[16px] text-[#757575] leading-[1.6] max-w-[500px]">
          {caption}
        </p>
      </div>

      {/* FAQ Container (Figma node 5875:28778) */}
      <div className="flex flex-col gap-[16px] w-full">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx

          return (
            <div
              key={item.id}
              className="bg-white border border-[#EDEDED] rounded-[8px] p-[24px] transition-all overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleIndex(idx)}
                className="w-full text-left flex items-center justify-between gap-[16px] cursor-pointer"
              >
                <div className="flex items-center gap-[12px] flex-1 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#282828] shrink-0 inline-block" />
                  <span className="font-['Inter'] font-semibold text-[17px] sm:text-[18px] text-[#282828] leading-normal">
                    {item.question}
                  </span>
                </div>

                <div className="size-[32px] rounded-[8px] flex items-center justify-center shrink-0">
                  <ChevronDown
                    className={`w-[20px] h-[20px] text-[#282828] transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {isOpen && (
                <div className="pt-[16px] pl-[18px] text-[15px] text-[#757575] leading-[1.6] animate-in fade-in duration-200">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
