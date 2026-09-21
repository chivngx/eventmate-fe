"use client"

import { useState } from "react"

interface TestimonialItem {
  id: string
  nodeId: string
  quote: string
  name: string
  role: string
  company: string
  avatar: string
  logo: string
}

const testimonials: TestimonialItem[] = [
  {
    id: "1",
    nodeId: "5875:27444",
    quote:
      "Tôi có trải nghiệm tuyệt vời khi sử dụng nền tảng này! Quy trình tuyển chọn và phân chia ca trực diễn ra vô cùng mượt mà, chúng tôi đã nhanh chóng tìm đủ nhân sự phù hợp ngay trước sự kiện.",
    name: "Albert Flores",
    role: "Trưởng ban Nhân sự",
    company: "Warephase",
    avatar: "/images/testimonials/avatar-1.png",
    logo: "/images/testimonials/logo-1.png",
  },
  {
    id: "2",
    nodeId: "5875:27445",
    quote:
      "Rất hài lòng với kết quả mang lại! Chúng tôi dễ dàng tiếp cận nguồn ứng viên tài năng, chủ động cho từng vị trí điều phối. Nền tảng dễ thao tác và cập nhật tiến độ liên tục.",
    name: "Jane Cooper",
    role: "Giám đốc Vận hành",
    company: "Iselectrics",
    avatar: "/images/testimonials/avatar-2.png",
    logo: "/images/testimonials/logo-2.png",
  },
  {
    id: "3",
    nodeId: "5875:27446",
    quote:
      "Nền tảng giúp việc chiêu mộ nhân sự sự kiện trở nên đơn giản hơn bao giờ hết. Các bộ lọc tìm kiếm chuẩn xác giúp ban tổ chức nhanh chóng chọn đúng người đúng việc một cách hiệu quả.",
    name: "Floyd Miles",
    role: "Quản lý Dự án",
    company: "Toughzap",
    avatar: "/images/testimonials/avatar-3.png",
    logo: "/images/testimonials/logo-3.png",
  },
]

export default function OrganizerTestimonialsSlider() {
  const [activeSlide, setActiveSlide] = useState(0)

  return (
    <section id="employer-testimonials" className="w-full py-8 sm:py-10 lg:py-10 scroll-mt-20" data-node-id="5875:27440">
      <div className="max-w-[1232px] mx-auto px-4 sm:px-6 lg:px-0 flex flex-col gap-[32px] items-center">
        {/* Section Header (Figma node 5875:27441: Titr home) */}
        <div
          className="flex flex-col items-center gap-[8px] text-center max-w-[650px] px-4"
          data-node-id="5875:27441"
          data-name="Titr home"
        >
          <h2 className="font-['Inter'] font-semibold text-2xl sm:text-3xl lg:text-[36px] text-[#222222] tracking-tight leading-tight">
            Minh chứng thực tế - Đối tác đồng hành
          </h2>
          <p className="font-['Inter'] font-normal text-[15px] sm:text-[16px] text-[#757575] leading-[1.6]">
            Sự tin tưởng từ các đối tác hàng đầu chứng minh lý do EventMate là lựa chọn tối ưu để kết nối và xây dựng đội ngũ nhân sự sự kiện chất lượng.
          </p>
        </div>

        {/* 3 Testimonials Cards (Figma node 5875:27442) */}
        <div className="flex flex-col gap-[16px] items-center w-full" data-node-id="5875:27442">
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-[16px] w-full"
            data-node-id="5875:27443"
          >
            {testimonials.map((item) => (
              <div
                key={item.id}
                data-node-id={item.nodeId}
                className="bg-[#f9f9f9] rounded-[8px] p-[24px] min-h-[291px] flex flex-col justify-between items-start gap-[16px] text-left transition-all duration-300 hover:bg-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 group border border-transparent hover:border-slate-100"
              >
                {/* Quote SVG Icon */}
                <div className="h-[27px] w-[30.15px] shrink-0">
                  <img
                    src="/images/testimonials/quote-icon.svg"
                    alt=""
                    className="size-full object-contain"
                  />
                </div>

                {/* Quote Text */}
                <p className="font-['Inter'] font-normal text-[16px] text-[#282828] leading-[1.6] line-clamp-4 flex-1">
                  &ldquo;{item.quote}&rdquo;
                </p>

                {/* Divider */}
                <div className="w-full h-px bg-[#EDEDED]" />

                {/* Author Info */}
                <div className="flex gap-[12px] items-center w-full">
                  <div className="relative rounded-full shrink-0 size-[64px] overflow-hidden border border-slate-100">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="size-full object-cover select-none"
                    />
                  </div>
                  <div className="flex flex-col gap-[2px] items-start justify-center min-w-0">
                    <p className="font-['Inter'] font-medium text-[#222222] text-[16px] truncate">
                      {item.name}
                    </p>
                    <p className="font-['Inter'] font-normal text-[#757575] text-[12px] truncate">
                      {item.role}
                    </p>
                    <div className="flex gap-[4px] items-center justify-center mt-0.5">
                      <div className="size-[16px] rounded-[4px] overflow-hidden shrink-0">
                        <img
                          src={item.logo}
                          alt={item.company}
                          className="size-full object-cover"
                        />
                      </div>
                      <p className="font-['Inter'] font-normal text-[#757575] text-[12px] truncate">
                        {item.company}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Slider Circles (Figma node 5875:27447) */}
          <div
            className="flex items-center justify-center gap-[8px] h-[16px] mt-2"
            data-node-id="5875:27447"
          >
            {[0, 1, 2, 3, 4].map((dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setActiveSlide(dotIdx)}
                className={`size-[8px] rounded-full transition-all duration-200 cursor-pointer ${
                  activeSlide === dotIdx
                    ? "bg-[#222222] scale-110"
                    : "border border-[#CBCBCB] hover:border-[#222222] bg-transparent"
                }`}
                aria-label={`Trang ${dotIdx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
