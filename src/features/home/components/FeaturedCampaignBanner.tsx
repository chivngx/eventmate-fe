"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface SponsorBanner {
  id: string
  title: string
  imageUrl: string
  targetUrl: string
}

const SPONSOR_BANNERS: SponsorBanner[] = [
  {
    id: "tam-hoa-phat",
    title: "CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ TÂM HÒA PHÁT",
    imageUrl: "/images/banners/sponsor-banner-1.png",
    targetUrl: "/events?search=T%C3%A2m%20H%C3%B2a%20Ph%C3%A1t",
  },
  {
    id: "diff-2026",
    title: "LỄ HỘI PHÁO HOA QUỐC TẾ ĐÀ NẴNG (DIFF 2026)",
    imageUrl: "/images/banners/sponsor-banner-1.png",
    targetUrl: "/events?search=DIFF",
  },
  {
    id: "furama-resort",
    title: "FURAMA RESORT DANANG — TUYỂN DỤNG SỰ KIỆN",
    imageUrl: "/images/banners/sponsor-banner-1.png",
    targetUrl: "/events?search=Furama",
  },
  {
    id: "mikazuki-resort",
    title: "DA NANG MIKAZUKI RESORTS & SPA",
    imageUrl: "/images/banners/sponsor-banner-1.png",
    targetUrl: "/events?search=Mikazuki",
  },
]

export default function FeaturedCampaignBanner() {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Auto-advance slides every 5s unless hovered
  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SPONSOR_BANNERS.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isPaused])

  const handleBannerClick = (url: string) => {
    router.push(url)
  }

  return (
    <section
      className="w-full relative rounded-xl sm:rounded-2xl overflow-hidden bg-white shadow-xs group"
      aria-label="Banner quảng cáo nhà tuyển dụng"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slider Viewport */}
      <div className="w-full aspect-[1200/305] min-h-[140px] sm:min-h-[200px] md:min-h-[260px] relative overflow-hidden">
        {SPONSOR_BANNERS.map((banner, index) => {
          const isActive = index === currentSlide

          return (
            <div
              key={banner.id}
              onClick={() => handleBannerClick(banner.targetUrl)}
              role="button"
              tabIndex={isActive ? 0 : -1}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleBannerClick(banner.targetUrl)
                }
              }}
              className={`absolute inset-0 w-full h-full cursor-pointer transition-opacity duration-700 ease-in-out select-none ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
              title={banner.title}
            >
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
              />
            </div>
          )
        })}

        {/* Bottom Pagination Dots */}
        <div className="absolute bottom-2 sm:bottom-3 left-0 right-0 z-20 flex items-center justify-center gap-2 pointer-events-auto">
          {SPONSOR_BANNERS.map((_, dotIndex) => {
            const isDotActive = dotIndex === currentSlide

            return (
              <button
                key={dotIndex}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentSlide(dotIndex)
                }}
                className={`size-2 sm:size-2.5 rounded-[4px] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${
                  isDotActive
                    ? "bg-[#FF8800] w-4 sm:w-5"
                    : "bg-[#C5C5C5] hover:bg-gray-400"
                }`}
                aria-label={`Đi tới banner ${dotIndex + 1}`}
                aria-current={isDotActive ? "true" : undefined}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
