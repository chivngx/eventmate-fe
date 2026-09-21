"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function OrganizerBottomCta() {
  const router = useRouter()
  const [selectedExp, setSelectedExp] = useState<string>("more-2")
  const [badges, setBadges] = useState<string[]>(["Web Developer", "Full-Time"])

  const removeBadge = (badgeToRemove: string) => {
    setBadges((prev) => prev.filter((b) => b !== badgeToRemove))
  }

  return (
    <section
      id="employer-cta"
      className="w-full bg-[#282828] text-white relative overflow-hidden mt-8 lg:mt-10 py-16 lg:py-20"
      data-node-id="5875:27448"
    >
      {/* Figma Vector Background Curves */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img
          src="/images/organizer-cta/curve-left.svg"
          alt=""
          className="absolute -top-[218px] -left-[251px] w-[854px] h-[716px] max-w-none opacity-40 select-none"
        />
        <img
          src="/images/organizer-cta/curve-right.svg"
          alt=""
          className="absolute top-[47px] right-0 w-[767px] h-[621px] max-w-none opacity-40 select-none"
        />
      </div>

      <div className="max-w-[1232px] mx-auto px-4 sm:px-6 lg:px-0 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-[48px]">
        {/* Left Column: Headline, Description & CTA Button */}
        <div className="flex flex-col gap-[44px] items-start w-full lg:w-[480px] shrink-0 text-left">
          <div className="flex flex-col gap-[24px] sm:gap-[36px] w-full">
            <h2 className="font-['Inter'] font-bold text-3xl sm:text-4xl lg:text-[48px] text-white leading-tight tracking-tight">
              Kế hoạch nâng cấp đa dạng tính năng cho Ban tổ chức
            </h2>
            <p className="font-['Inter'] font-medium text-[16px] sm:text-[18px] text-[#a5a5a5] leading-[1.6]">
              Tiếp cận toàn diện các giải pháp tuyển dụng sự kiện chỉ trên một nền tảng duy nhất. Chúng tôi cam kết duy trì chất lượng dịch vụ và bảo đảm sự thành công cho sự kiện của bạn.
            </p>
          </div>

          <button
            onClick={() => router.push("/register?role=organizer")}
            className="bg-[#005ddc] hover:bg-[#004eb7] text-white font-['Inter'] font-medium text-[18px] sm:text-[20px] h-[56px] w-full sm:w-[288px] rounded-[8px] flex items-center justify-center transition-all duration-200 shadow-lg shadow-blue-600/30 active:scale-98 cursor-pointer"
          >
            Bắt đầu ngay
          </button>
        </div>

        {/* Right Column: Two Staggered Cards matching Figma Frame 2147225474 */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center gap-[24px] lg:gap-[32px] xl:gap-[47px] w-full lg:w-auto shrink-0">
          {/* Card 1: Review Card (Roberto Alexander) */}
          <div
            className="bg-white rounded-[8px] p-[16px] w-full sm:w-[246px] h-auto sm:h-[254px] flex flex-col justify-between shrink-0 shadow-[0px_4px_24px_rgba(0,0,0,0.45)] text-slate-800"
            data-node-id="5875:27466"
          >
            <div className="flex flex-col gap-[16px]">
              <div className="flex flex-col gap-[8px]">
                {/* Author row */}
                <div className="flex gap-[8px] items-center">
                  <div className="size-[48px] rounded-full overflow-hidden shrink-0 border border-slate-100">
                    <img
                      src="/images/organizer-cta/avatar-roberto.png"
                      alt="Roberto Alexander"
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-['Inter'] font-semibold text-[#222222] text-[16px] leading-tight">
                      Roberto Alexander
                    </span>
                    <span className="font-['Inter'] font-normal text-[#a5a5a5] text-[12px]">
                      Điều Phối Sự Kiện
                    </span>
                  </div>
                </div>

                {/* 5 Stars */}
                <div className="flex gap-[4px] items-center">
                  {[...Array(5)].map((_, i) => (
                    <img
                      key={i}
                      src="/images/organizer-cta/star.svg"
                      alt="star"
                      className="size-[14px]"
                    />
                  ))}
                </div>
              </div>

              {/* Review Quote */}
              <p className="font-['Inter'] font-medium text-[#222222] text-[14px] leading-[1.6] text-left">
                &ldquo;Thật tuyệt vời, sử dụng nền tảng này đã giúp chúng tôi kết nối đội ngũ CTV sự kiện đúng chuyên môn và tuyển dụng cực kỳ nhanh chóng.&rdquo;
              </p>
            </div>

            {/* Footer Tag */}
            <div className="flex items-center gap-[6px] text-left pt-2 border-t border-slate-100">
              <span className="size-[6px] rounded-full bg-[#005ddc]" />
              <span className="font-['Inter'] font-normal text-[#a5a5a5] text-[12px]">
                Hoạt động tuần này
              </span>
            </div>
          </div>

          {/* Card 2: Filter / Post Job Card */}
          <div
            className="bg-white rounded-[8px] px-[24px] pt-[32px] pb-[24px] w-full sm:w-[305px] h-auto sm:h-[414px] flex flex-col justify-between shrink-0 shadow-[0px_4px_24px_rgba(0,0,0,0.45)] text-slate-800"
            data-node-id="5875:27488"
          >
            <div className="flex flex-col gap-[20px]">
              {/* Floating Label Input 1: Job Title */}
              <div className="relative w-full">
                <div className="border border-[#a5a5a5] rounded-[8px] h-[40px] px-[16px] flex items-center justify-between">
                  <span className="font-['Inter'] font-normal text-[#282828] text-[14px]">
                    Web Developer
                  </span>
                  <img
                    src="/images/organizer-cta/eye.svg"
                    alt=""
                    className="size-[20px] opacity-70"
                  />
                </div>
                <span className="absolute -top-[10px] left-[12px] bg-white px-[8px] font-['Inter'] font-medium text-[#222222] text-[12px] leading-tight">
                  Job Title
                </span>
              </div>

              {/* Floating Label Input 2: Job Type */}
              <div className="relative w-full">
                <div className="border border-[#a5a5a5] rounded-[8px] h-[40px] px-[16px] flex items-center justify-between">
                  <span className="font-['Inter'] font-normal text-[#282828] text-[14px]">
                    Full-Time
                  </span>
                  <img
                    src="/images/organizer-cta/eye.svg"
                    alt=""
                    className="size-[20px] opacity-70"
                  />
                </div>
                <span className="absolute -top-[10px] left-[12px] bg-white px-[8px] font-['Inter'] font-medium text-[#222222] text-[12px] leading-tight">
                  Job Type
                </span>
              </div>

              {/* Badges */}
              {badges.length > 0 && (
                <div className="flex flex-wrap gap-[8px] items-center">
                  {badges.map((b) => (
                    <div
                      key={b}
                      className="bg-[#ededed] text-[#353535] h-[28px] px-[10px] rounded-[6px] flex items-center gap-[6px] font-['Inter'] text-[13px]"
                    >
                      <span>{b}</span>
                      <button
                        onClick={() => removeBadge(b)}
                        className="cursor-pointer hover:opacity-75"
                        aria-label={`Xóa ${b}`}
                      >
                        <img
                          src="/images/organizer-cta/close.svg"
                          alt=""
                          className="size-[12px]"
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Experience Level Section */}
              <div className="flex flex-col gap-[12px] items-start text-left">
                <h4 className="font-['Inter'] font-semibold text-[#222222] text-[16px]">
                  Experience Level
                </h4>

                <div className="grid grid-cols-2 gap-x-[12px] gap-y-[8px] w-full text-left">
                  {[
                    { id: "1y", label: "1 years" },
                    { id: "less-1", label: "Less than 1 year" },
                    { id: "2y", label: "2 years" },
                    { id: "more-2", label: "More than 2 years" },
                  ].map((exp) => (
                    <label
                      key={exp.id}
                      onClick={() => setSelectedExp(exp.id)}
                      className="flex items-center gap-[8px] cursor-pointer py-1"
                    >
                      <input
                        type="checkbox"
                        checked={selectedExp === exp.id}
                        onChange={() => setSelectedExp(exp.id)}
                        className="w-4 h-4 rounded border-slate-300 text-[#005ddc] focus:ring-[#005ddc] cursor-pointer"
                      />
                      <span className="font-['Inter'] font-normal text-[#353535] text-[13px] whitespace-nowrap">
                        {exp.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <button
              onClick={() => router.push("/register?role=organizer")}
              className="border border-[#005ddc] text-[#005ddc] hover:bg-blue-50 font-['Inter'] font-medium text-[14px] h-[36px] w-full rounded-[8px] flex items-center justify-center transition-colors cursor-pointer mt-4"
            >
              Post Job
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
