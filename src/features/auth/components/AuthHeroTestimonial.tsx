"use client"

import React from "react"

export interface TestimonialItem {
    id: number
    name: string
    role: string
    avatar: string
    quote: string
}

export const AUTH_TESTIMONIALS: TestimonialItem[] = [
    {
        id: 1,
        name: "Nguyễn Minh Thảo",
        role: "Sinh viên ĐH Bách Khoa Đà Nẵng",
        avatar: "/images/auth/eleanor-avatar.png",
        quote:
            "EventMate giúp mình tìm kiếm các cơ hội việc làm sự kiện uy tín tại Đà Nẵng cực kỳ nhanh chóng. Quy trình ứng tuyển rõ ràng và nhận việc linh hoạt theo lịch học.",
    },
    {
        id: 2,
        name: "Lê Hoàng Nam",
        role: "Cộng tác viên Sự kiện",
        avatar: "/images/auth/leslie-avatar.png",
        quote:
            "Tham gia các sự kiện lớn qua EventMate giúp mình học hỏi được rất nhiều kỹ năng thực tế. Đội ngũ hỗ trợ nhiệt tình và thanh toán thù lao rất minh bạch.",
    },
    {
        id: 3,
        name: "Trần Thu Hà",
        role: "Sinh viên ĐH Ngoại Ngữ",
        avatar: "/images/auth/darrell-avatar.png",
        quote:
            "Hồ sơ trực tuyến chuyên nghiệp và tính năng tìm việc theo khu vực giúp mình dễ dàng tiếp cận những công việc sự kiện phù hợp nhất.",
    },
    {
        id: 4,
        name: "Phạm Quốc Bảo",
        role: "Điều phối viên Sự kiện",
        avatar: "/images/auth/eleanor-avatar.png",
        quote:
            "Từ một sinh viên ứng tuyển làm CTV, EventMate đã giúp mình kết nối với nhiều Ban tổ chức lớn và phát triển vững chắc con đường sự nghiệp.",
    },
]

interface AuthHeroTestimonialProps {
    activeIdx: number
    onSelectIdx: (idx: number) => void
    testimonials?: TestimonialItem[]
    heroImage?: string
}

export function AuthHeroTestimonial({
    activeIdx,
    onSelectIdx,
    testimonials = AUTH_TESTIMONIALS,
    heroImage = "/images/auth/signup-hero.png",
}: AuthHeroTestimonialProps) {
    const current = testimonials[activeIdx] || testimonials[0]

    return (
        <div className="hidden lg:flex flex-1 relative min-h-[560px] lg:min-h-[580px] xl:min-h-[640px] h-[calc(100vh-2rem)] max-h-[900px] rounded-2xl overflow-hidden shadow-2xl p-6 lg:p-7 xl:p-9 flex-col justify-end items-stretch my-auto">
            {/* Hero Background Image */}
            <img
                src={heroImage}
                alt="Event opportunity and organizer collaboration"
                className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none rounded-2xl"
            />

            {/* Frosted Glassmorphism Testimonial Card */}
            <div className="relative z-10 w-full backdrop-blur-[45px] bg-white/90 p-4 sm:p-5 xl:p-6 rounded-2xl shadow-lg border border-white/70 flex flex-col gap-3 sm:gap-3.5 text-left transition-all duration-300">
                {/* User profile header */}
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 xl:w-11 xl:h-11 rounded-full overflow-hidden shrink-0 ring-2 ring-white shadow-xs">
                        <img
                            src={current.avatar}
                            alt={current.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="font-semibold text-slate-900 text-[15px] xl:text-[16px] leading-tight">
                            {current.name}
                        </h3>
                        <span className="text-slate-500 text-[11.5px] xl:text-[12px] font-normal leading-normal">
                            {current.role}
                        </span>
                    </div>
                </div>

                {/* Testimonial Quote */}
                <p className="text-slate-800 text-[13.5px] xl:text-[14.5px] leading-relaxed font-normal min-h-[60px] xl:min-h-[68px]">
                    {current.quote}
                </p>

                {/* Testimonial Slider Dots */}
                <div className="flex items-center gap-1.5 pt-0.5" role="tablist" aria-label="Testimonials slider">
                    {testimonials.map((t, index) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => onSelectIdx(index)}
                            aria-label={`View testimonial ${index + 1}`}
                            aria-selected={activeIdx === index}
                            className={`rounded-full transition-all cursor-pointer ${
                                activeIdx === index
                                    ? "w-2.5 h-2.5 bg-slate-900"
                                    : "w-2 h-2 bg-slate-300 hover:bg-slate-500"
                            }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

