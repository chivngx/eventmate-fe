"use client"

import { useRouter } from "next/navigation"
import { useUser } from "@/components/providers/AuthProvider"

export default function OrganizerHero({ navbar }: { navbar?: React.ReactNode }) {
  const router = useRouter()
  const { user, role } = useUser()

  return (
    <section
      id="employer-hero"
      className="w-full min-h-screen lg:h-screen lg:max-h-[920px] xl:max-h-[960px] flex flex-col justify-between bg-[#f4f4f4] relative overflow-hidden"
      data-node-id="5875:27309"
    >
      {/* Floating Navbar inside Hero's top area or Spacer */}
      {navbar ? (
        <div className="pt-4 sm:pt-6 lg:pt-8 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto w-full relative z-40 shrink-0">
          {navbar}
        </div>
      ) : (
        <div className="h-[92px] sm:h-[96px] shrink-0" />
      )}

      {/* Hero Content (Vertically Centered) */}
      <div className="flex-1 flex items-center justify-center w-full py-4 lg:py-0">
        <div className="max-w-[1232px] w-full mx-auto px-4 sm:px-6 lg:px-0 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-[60px] xl:gap-[100px]">
        {/* Left Column: Headline, subtext, button */}
        <div
          className="flex flex-col gap-[36px] items-start w-full lg:w-[504px] shrink-0 text-left"
          data-node-id="5875:27311"
        >
          <div className="flex flex-col gap-[24px] w-full" data-node-id="5875:27312">
            <h1
              className="font-['Inter'] font-bold text-4xl sm:text-5xl lg:text-[56px] text-[#222222] tracking-tight leading-[1.12]"
              data-node-id="5875:27313"
            >
              Tuyển Dụng Thông Minh, Bứt Phá Cùng{" "}
              <span className="text-[#005DDC]">EventMate!</span>
            </h1>
            <p
              className="font-['Inter'] font-medium text-base sm:text-[18px] text-[#757575] leading-[1.6]"
              data-node-id="5875:27314"
            >
              Đăng tin tuyển dụng trên EventMate và kết nối nhanh chóng với hàng ngàn nhân sự sự kiện chất lượng cao. Với các công cụ thông minh, khớp nối ca chính xác và giao diện tối ưu.
            </p>
          </div>

          <button
            onClick={() => {
              if (user && role === "organizer") {
                router.push("/dashboard?tab=post-job")
              } else {
                router.push("/register?role=organizer")
              }
            }}
            className="bg-[#282828] hover:bg-black text-white font-['Inter'] font-medium text-[18px] sm:text-[20px] h-[56px] w-full sm:w-[296px] rounded-[8px] flex items-center justify-center transition-all duration-200 shadow-md active:scale-98 cursor-pointer"
            data-node-id="5875:27315"
          >
            Đăng tin tuyển dụng
          </button>
        </div>

        {/* Right Column: Figma Arch Pill with Cutout Recruiter & Floating Dashboard Elements */}
        <div className="relative flex items-center justify-center w-full lg:w-[504px] pt-8 pb-12">
          {/* Background Pill Arch (Figma Frame 2147224908) */}
          <div
            className="bg-[#f9f9f9] rounded-[278px] w-[340px] sm:w-[440px] lg:w-[504px] h-[460px] sm:h-[515px] relative shrink-0"
            data-node-id="5875:27316"
          >
            {/* Cutout Hero Image (Figma image 304) */}
            <div
              className="absolute -top-[56px] left-0 w-[444px] h-[576px] pointer-events-none z-10"
              data-node-id="5875:27317"
            >
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img
                  src="/images/organizer-hero/hero-person.png"
                  alt="Tuyển dụng nhân sự EventMate"
                  className="absolute h-[108.85%] left-[-56.63%] max-w-none top-[-8.85%] w-[211.82%] select-none drop-shadow-sm"
                />
              </div>
            </div>

            {/* Floating Badge 1: +30K Job Seekers (Figma Frame 2147224912) */}
            <div
              className="absolute top-[18px] -left-2 sm:left-[10px] bg-white rounded-[16px] px-[16px] py-[8px] shadow-[2px_4px_16px_rgba(1,70,177,0.1)] flex items-center gap-[8px] z-20"
              data-node-id="5875:27342"
            >
              <div className="bg-[#005ddc] rounded-[16px] size-[48px] flex items-center justify-center shrink-0">
                <img
                  src="/images/organizer-hero/users-group.svg"
                  alt=""
                  className="size-[24px]"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-['Inter'] font-semibold text-[#222222] text-[18px] leading-tight">
                  +30K
                </span>
                <span className="font-['Inter'] font-normal text-[#757575] text-[13px]">
                  Ứng viên
                </span>
              </div>
            </div>

            {/* Floating Badge 2: Blue Bell Button with Red Dot */}
            <div
              className="absolute top-[127px] -left-3 sm:left-0 bg-[#005ddc] rounded-[16px] size-[48px] flex items-center justify-center shadow-[2px_4px_16px_rgba(1,70,177,0.12)] z-20"
              data-node-id="5875:27318"
            >
              <img
                src="/images/organizer-hero/bell.svg"
                alt="Thông báo"
                className="size-[24px]"
              />
              {/* Red notification dot */}
              <img
                src="/images/organizer-hero/red-dot.svg"
                alt=""
                className="absolute top-[-3px] right-[-3px] size-[12px] z-30"
                data-node-id="5875:27341"
              />
            </div>

            {/* Floating Badge 3: Donut Chart / Job Breakdown (Figma Frame 2147224789) */}
            <div
              className="absolute top-[53px] -right-4 sm:-right-6 lg:left-[360px] xl:left-[388px] bg-white rounded-[16px] p-[8px] shadow-[2px_4px_16px_rgba(1,70,177,0.1)] flex items-center w-[184px] sm:w-[192px] z-20"
              data-node-id="5875:27351"
            >
              <div className="relative size-[76px] sm:size-[80px] shrink-0 flex items-center justify-center">
                <img
                  src="/images/organizer-hero/donut-chart.svg"
                  alt="Biểu đồ phân bổ ca"
                  className="size-full object-contain"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-['Inter'] font-semibold text-[#222222] text-[10px] leading-tight">
                    15
                  </span>
                  <span className="font-['Inter'] font-normal text-[#515151] text-[7px]">
                    Tổng ca
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-[4px] flex-1 pl-1 text-[8px] font-medium text-[#515151]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="size-[8px] rounded-full bg-[#004eb7]" />
                    Đang duyệt
                  </span>
                  <span className="font-bold text-[#222222]">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="size-[8px] rounded-full bg-[#6eabff]" />
                    Đã nhận
                  </span>
                  <span className="font-bold text-[#222222]">4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="size-[8px] rounded-full bg-[#cfe3ff]" />
                    Từ chối
                  </span>
                  <span className="font-bold text-[#222222]">3</span>
                </div>
              </div>
            </div>

            {/* Floating Badge 4: 3-Bar Chart Widget (Figma Frame 2147224922) */}
            <div
              className="absolute top-[238px] -right-2 sm:-right-4 lg:left-[456px] bg-white rounded-[8px] p-[8px] h-[60px] flex items-end gap-[3px] shadow-[2px_4px_16px_rgba(1,70,177,0.1)] z-20"
              data-node-id="5875:27347"
            >
              <div className="bg-[#005ddc] h-[29px] w-[15px] rounded-[5px]" />
              <div className="bg-[#9ec7ff] h-[24px] w-[15px] rounded-[5px]" />
              <div className="bg-[#003e93] h-[40px] w-[15px] rounded-[5px]" />
            </div>

            {/* Floating Badge 5: Bottom 3 Metric Cards (Figma Frame 2147224914) */}
            <div
              className="absolute top-[430px] sm:top-[467px] left-[5px] sm:left-[20px] lg:left-[24px] flex items-center gap-[6px] z-20 overflow-x-auto max-w-full pb-2 sm:pb-0"
              data-node-id="5875:27319"
            >
              {/* Review */}
              <div
                className="bg-white rounded-[8px] px-[12px] sm:px-[14px] py-[10px] sm:py-[12px] h-[65px] shadow-[2px_4px_16px_rgba(1,70,177,0.1)] flex items-center justify-between gap-[6px] w-[142px] sm:w-[150px] shrink-0"
                data-node-id="5875:27320"
              >
                <div className="flex flex-col text-left">
                  <span className="font-['Inter'] font-normal text-[#757575] text-[11px] sm:text-[12px] whitespace-nowrap">
                    Đánh giá
                  </span>
                  <span className="font-['Inter'] font-semibold text-[#353535] text-[16px] sm:text-[18px] leading-tight">
                    40M
                  </span>
                </div>
                <div className="w-[48px] sm:w-[54px] h-[29px] shrink-0">
                  <img
                    src="/images/organizer-hero/chart-review-mini.svg"
                    alt=""
                    className="size-full object-contain"
                  />
                </div>
              </div>

              {/* Companies */}
              <div
                className="bg-white rounded-[8px] px-[12px] sm:px-[14px] py-[10px] sm:py-[12px] h-[65px] shadow-[2px_4px_16px_rgba(1,70,177,0.1)] flex items-center justify-between gap-[6px] w-[142px] sm:w-[150px] shrink-0"
                data-node-id="5875:27327"
              >
                <div className="flex flex-col text-left">
                  <span className="font-['Inter'] font-normal text-[#757575] text-[11px] sm:text-[12px] whitespace-nowrap">
                    Đối tác
                  </span>
                  <span className="font-['Inter'] font-semibold text-[#353535] text-[16px] sm:text-[18px] leading-tight">
                    1M
                  </span>
                </div>
                <div className="w-[48px] sm:w-[54px] h-[29px] shrink-0">
                  <img
                    src="/images/organizer-hero/chart-company-mini.svg"
                    alt=""
                    className="size-full object-contain"
                  />
                </div>
              </div>

              {/* Rating */}
              <div
                className="bg-white rounded-[8px] px-[12px] sm:px-[14px] py-[10px] sm:py-[12px] h-[65px] shadow-[2px_4px_16px_rgba(1,70,177,0.1)] flex items-center justify-between gap-[6px] w-[142px] sm:w-[150px] shrink-0"
                data-node-id="5875:27334"
              >
                <div className="flex flex-col text-left">
                  <span className="font-['Inter'] font-normal text-[#757575] text-[11px] sm:text-[12px] whitespace-nowrap">
                    Điểm sao
                  </span>
                  <span className="font-['Inter'] font-semibold text-[#353535] text-[16px] sm:text-[18px] leading-tight">
                    4.6
                  </span>
                </div>
                <div className="w-[48px] sm:w-[54px] h-[29px] shrink-0">
                  <img
                    src="/images/organizer-hero/chart-rating-mini.svg"
                    alt=""
                    className="size-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
)
}
