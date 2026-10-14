"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Sparkles,
  Ticket,
  Boxes,
  Radio,
  Mic,
  Camera,
  UtensilsCrossed,
  Coffee,
  PartyPopper,
  HandHeart,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react"

const POPULAR_CATEGORIES = [
  {
    id: "pg-pb-su-kien",
    name: "PG & PB Sự kiện",
    icon: Sparkles,
    searchKeyword: "PG & PB Sự kiện",
  },
  {
    id: "le-tan-check-in",
    name: "Lễ tân & Check-in",
    icon: Ticket,
    searchKeyword: "Lễ tân & Check-in",
  },
  {
    id: "hau-can-san-khau",
    name: "Hậu cần & Sân khấu",
    icon: Boxes,
    searchKeyword: "Hậu cần & Sân khấu",
  },
  {
    id: "dieu-phoi-su-kien",
    name: "Điều phối sự kiện",
    icon: Radio,
    searchKeyword: "Điều phối sự kiện",
  },
  {
    id: "mc-hoat-nao",
    name: "MC & Hoạt náo",
    icon: Mic,
    searchKeyword: "MC & Hoạt náo",
  },
  {
    id: "quay-phim-chup-anh",
    name: "Quay phim & Chụp ảnh",
    icon: Camera,
    searchKeyword: "Quay phim & Chụp ảnh",
  },
  {
    id: "phuc-vu-tiec-banquet",
    name: "Phục vụ tiệc (Banquet)",
    icon: UtensilsCrossed,
    searchKeyword: "Phục vụ tiệc (Banquet)",
  },
  {
    id: "pha-che-su-kien",
    name: "Pha chế sự kiện",
    icon: Coffee,
    searchKeyword: "Pha chế sự kiện",
  },
  {
    id: "mascot-bieu-dien",
    name: "Mascot & Biểu diễn",
    icon: PartyPopper,
    searchKeyword: "Mascot & Biểu diễn",
  },
  {
    id: "tinh-nguyen-vien",
    name: "Tình nguyện viên",
    icon: HandHeart,
    searchKeyword: "Tình nguyện viên",
  },
]

export default function PopularCategories() {
  const router = useRouter()
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 10)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    const container = scrollRef.current
    if (container) {
      container.addEventListener("scroll", checkScroll)
      window.addEventListener("resize", checkScroll)
      return () => {
        container.removeEventListener("scroll", checkScroll)
        window.removeEventListener("resize", checkScroll)
      }
    }
  }, [])

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320
      scrollRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const handleCategoryClick = (keyword) => {
    router.push(`/events?search=${encodeURIComponent(keyword)}`)
  }

  return (
    <section
      className="w-full bg-white rounded-xl py-6 px-4 sm:px-6 border border-gray-200/90 shadow-2xs relative"
      aria-label="Các vị trí sự kiện phổ biến"
    >
      {/* Header with Title and Left/Right Arrow Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-400">
            DANH MỤC TUYỂN DỤNG HÀNG ĐẦU
          </p>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Các vị trí sự kiện phổ biến
          </h2>
        </div>

        {/* Navigation Controls: View All + 2 Arrow Buttons */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => router.push("/events")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0D9488] transition-colors cursor-pointer mr-1"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* 2 Arrow Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              aria-label="Lướt sang trái"
              className="size-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-slate-50 hover:border-teal-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-slate-700 shadow-2xs active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              aria-label="Lướt sang phải"
              className="size-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-slate-50 hover:border-teal-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-slate-700 shadow-2xs active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Horizontal Slider Track */}
      <div className="relative w-full">
        {/* Left Floating Arrow Button on Track */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll("left")}
            aria-label="Lướt vị trí sang trái"
            className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 size-8 rounded-lg bg-white shadow-md border border-gray-200 items-center justify-center z-20 hover:bg-slate-50 hover:border-teal-300 transition-all cursor-pointer text-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Right Floating Arrow Button on Track */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll("right")}
            aria-label="Lướt vị trí sang phải"
            className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 size-8 rounded-lg bg-white shadow-md border border-gray-200 items-center justify-center z-20 hover:bg-slate-50 hover:border-teal-300 transition-all cursor-pointer text-slate-700"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="overflow-x-auto scroll-smooth py-1 px-1 -mx-1 scrollbar-none flex items-center gap-3 select-none"
        >
          {POPULAR_CATEGORIES.map((cat) => {
            const Icon = cat.icon
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.searchKeyword)}
                className="inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-slate-50/70 hover:bg-teal-50/70 border border-gray-200/70 hover:border-teal-300 transition-all text-slate-700 hover:text-teal-900 cursor-pointer shadow-2xs shrink-0 select-none group/item"
              >
                <div className="w-7 h-7 rounded-md bg-white border border-gray-200/70 flex items-center justify-center text-slate-600 group-hover/item:text-[#0D9488] group-hover/item:border-teal-200 transition-colors shadow-2xs shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs sm:text-[13px] font-semibold tracking-tight whitespace-nowrap">
                  {cat.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}


