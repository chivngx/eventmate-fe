"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import EventCard from "@/features/event/components/EventCard"

interface UrgentJobItem {
  id: string
  title: string
  company: string
  verified?: boolean
  isPartner?: boolean
  salary: string
  location: string
  priority?: boolean
  timeAgo: string
  applicantsCount: number
  imageUrl: string
}

// Ordered for 2 rows in column-flow grid:
// Col 1: Card 1 (top), Card 6 (bottom)
// Col 2: Card 2 (top), Card 7 (bottom)
// Col 3: Card 3 (top), Card 8 (bottom)
// Col 4: Card 4 (top), Card 9 (bottom)
// Col 5: Card 5 (top), Card 10 (bottom)
const URGENT_JOBS: UrgentJobItem[] = [
  {
    id: "urgent-1",
    title: "TUYỂN 10 BẠN CHECK-IN & HƯỚNG DẪN KHÁCH SỰ KIỆN FASHION SHOW",
    company: "DanaEvent Media",
    salary: "350.000 đ/ca",
    location: "P. Hải Châu",
    priority: true,
    timeAgo: "3 phút trước",
    applicantsCount: 102,
    imageUrl: "/images/urgent/job-1.png",
  },
  {
    id: "urgent-6",
    title: "PG LỄ TÂN ĐÓN KHÁCH HỘI THẢO Y DƯỢC MIỀN TRUNG",
    company: "Furama Resort Danang",
    salary: "450.000 đ/ca",
    location: "P. Khuê Mỹ",
    timeAgo: "4 phút trước",
    applicantsCount: 6,
    imageUrl: "/images/urgent/job-6.png",
  },
  {
    id: "urgent-2",
    title: "CẦN 8 BẠN HỖ TRỢ ĐIỀU PHỐI GIẢI CHẠY MARATHON BIỂN",
    company: "Danang Sports Event JSC",
    verified: true,
    salary: "40.000 đ/giờ",
    location: "P. Phước Ninh",
    timeAgo: "4 phút trước",
    applicantsCount: 66,
    imageUrl: "/images/urgent/job-2.png",
  },
  {
    id: "urgent-7",
    title: "NHÂN SỰ SOÁT VÉ & HƯỚNG DẪN KHÁN GIẢ ĐÊM NHẠC ACOUSTIC",
    company: "On The Radio Bar & Lounge",
    verified: true,
    salary: "280.000 đ/ca",
    location: "P. An Hải Nam",
    timeAgo: "5 phút trước",
    applicantsCount: 47,
    imageUrl: "/images/urgent/job-7.png",
  },
  {
    id: "urgent-3",
    title: "TUYỂN 6 BẠN HẬU CẦN SETUP SÂN KHẤU TIỆC CƯỚI TỐI NAY",
    company: "Trung Tâm Hội Nghị Tiệc Cưới Mikazuki",
    salary: "400.000 đ/ca",
    location: "P. Thạc Gián",
    timeAgo: "5 phút trước",
    applicantsCount: 40,
    imageUrl: "/images/urgent/job-3.png",
  },
  {
    id: "urgent-8",
    title: "PHỤC VỤ TIỆC VIP GALA DINNER HỘI NGHỊ QUỐC TẾ",
    company: "Ariyana Convention Centre",
    isPartner: true,
    salary: "350.000 đ/ca",
    location: "P. Mỹ An",
    timeAgo: "5 phút trước",
    applicantsCount: 128,
    imageUrl: "/images/urgent/job-8.png",
  },
  {
    id: "urgent-4",
    title: "PB / PG HOẠT NÁO ROADSHOW KHAI TRƯƠNG SHOWROOM",
    company: "Viet Promotion Agency",
    salary: "500.000 đ/ca",
    location: "P. Bình Thuận",
    timeAgo: "8 phút trước",
    applicantsCount: 7,
    imageUrl: "/images/urgent/job-4.png",
  },
  {
    id: "urgent-9",
    title: "HỖ TRỢ ÂM THANH ÁNH SÁNG MINI CONCERT BÃI BIỂN",
    company: "Dana Sound & Lighting Pro",
    salary: "45.000 đ/giờ",
    location: "P. Thanh Khê Đông",
    timeAgo: "8 phút trước",
    applicantsCount: 21,
    imageUrl: "/images/urgent/job-9.png",
  },
  {
    id: "urgent-5",
    title: "ĐIỀU PHỐI BÃI XE VÀ AN NINH SỰ KIỆN LỄ HỘI ẨM THỰC",
    company: "Công ty Dịch Vụ An Ninh Miền Trung",
    salary: "300.000 đ/ca",
    location: "P. Hòa Cường Nam",
    timeAgo: "8 phút trước",
    applicantsCount: 14,
    imageUrl: "/images/urgent/job-5.png",
  },
  {
    id: "urgent-10",
    title: "LỄ TÂN TRAO THƯỞNG GIẢI GOLF NHA TRANG - ĐÀ NẴNG OPEN",
    company: "BRG Danang Golf Resort",
    salary: "600.000 đ/ca",
    location: "P. Xuân Hà",
    timeAgo: "9 phút trước",
    applicantsCount: 21,
    imageUrl: "/images/urgent/job-10.png",
  },
]

interface UrgentJobsSectionProps {
  onNavigateToJob?: (jobId: string) => void
  bookmarkedEvents?: Record<string, boolean>
  onToggleBookmark?: (id: string) => void
}

export default function UrgentJobsSection({
  onNavigateToJob,
  bookmarkedEvents = {},
  onToggleBookmark,
}: UrgentJobsSectionProps) {
  const router = useRouter()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 10)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 392 // 376px card + 16px gap
      scrollContainerRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const handleClickJob = (jobId: string) => {
    if (onNavigateToJob) {
      onNavigateToJob(jobId)
    } else {
      router.push(`/events`)
    }
  }

  return (
    <section className="w-full bg-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col gap-4">
      {/* 1. Header Banner */}
      <div className="relative rounded-[12px] overflow-hidden px-4 sm:px-5 py-4 flex flex-col gap-2 bg-[#e4ecfb]">
        {/* Right side banner illustration ("Phản hồi trong 24h") */}
        <div className="absolute right-0 top-0 h-full w-[280px] sm:w-[337px] pointer-events-none hidden sm:block">
          <img
            src="/images/urgent/header-banner-right.png"
            alt="Phản hồi trong 24h"
            className="w-full h-full object-contain object-right"
          />
        </div>

        {/* Title row */}
        <div className="flex items-center gap-2 relative z-10">
          <h2 className="text-[20px] font-bold text-[#222222] leading-[30px]">
            Việc tuyển gấp
          </h2>
          <img
            src="/images/urgent/icon-info.svg"
            alt="Thông tin việc tuyển gấp"
            className="size-6 cursor-pointer"
          />
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <img
              src="/images/urgent/icon-check-circle.svg"
              alt=""
              className="size-5 shrink-0"
            />
            <span className="text-[14px] sm:text-[16px] font-medium text-[#222222] whitespace-nowrap">
              Việc làm xác thực
            </span>
          </div>
          <div className="flex items-center gap-2">
            <img
              src="/images/urgent/icon-check-circle.svg"
              alt=""
              className="size-5 shrink-0"
            />
            <span className="text-[14px] sm:text-[16px] font-medium text-[#222222] whitespace-nowrap">
              Nhận việc trong 1-2 ngày
            </span>
          </div>
        </div>
      </div>

      {/* 2. Grid Container with Horizontal Scroll and Arrow Controls */}
      <div className="relative w-full">
        {/* Previous Button */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Xem việc trước"
            className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 size-11 rounded-full bg-white shadow-[0px_4px_8px_rgba(34,34,34,0.12)] border border-gray-100 flex items-center justify-center z-20 hover:bg-gray-50 transition-all active:scale-95"
          >
            <img
              src="/images/urgent/icon-chevron-right.svg"
              alt=""
              className="w-2.5 h-4 rotate-180"
            />
          </button>
        )}

        {/* Next Button */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Xem thêm việc"
            className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 size-11 rounded-full bg-white shadow-[0px_4px_8px_rgba(34,34,34,0.12)] border border-gray-100 flex items-center justify-center z-20 hover:bg-gray-50 transition-all active:scale-95"
          >
            <img
              src="/images/urgent/icon-chevron-right.svg"
              alt=""
              className="w-2.5 h-4"
            />
          </button>
        )}

        {/* Scrollable 2-row Grid */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="overflow-x-auto scroll-smooth py-1 px-1 -mx-1 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="grid grid-rows-2 auto-cols-[min(340px,85vw)] md:auto-cols-[min(360px,46vw)] lg:auto-cols-[calc((100%-32px)/3)] grid-flow-col gap-4">
            {URGENT_JOBS.map((job) => (
              <EventCard
                key={job.id}
                job={{
                  ...job,
                  is_urgent: true,
                }}
                isBookmarked={!!bookmarkedEvents[job.id]}
                onToggleBookmark={onToggleBookmark}
                onNavigate={handleClickJob}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 3. Bottom Pill Button */}
      <div className="flex justify-center pt-1">
        <button
          type="button"
          onClick={() => router.push("/events")}
          className="h-[40px] px-6 border border-[#dadada] rounded-full bg-white text-[#222222] font-bold text-[16px] leading-[24px] hover:bg-gray-50 transition-colors"
        >
          Xem thêm việc tuyển gấp
        </button>
      </div>
    </section>
  )
}
