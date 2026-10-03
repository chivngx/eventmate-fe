"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import EventCard from "@/features/event/components/EventCard"

export interface LatestJobsFeedProps {
  events?: any[]
  loading?: boolean
  bookmarkedEvents?: Record<string, boolean>
  onToggleBookmark?: (id: string) => void
  onNavigateToJob?: (id: string) => void
}

export default function LatestJobsFeed({
  events = [],
  loading = false,
  bookmarkedEvents = {},
  onToggleBookmark,
  onNavigateToJob,
}: LatestJobsFeedProps) {
  const router = useRouter()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  // Filter events based on active tab
  const displayEvents = activeTab === "all"
    ? events
    : events.filter((job) => {
      const text = `${job.title || ""} ${job.category || ""} ${job.position_type || ""}`.toLowerCase()
      if (activeTab === "today") return true
      if (activeTab === "weekend") return text.includes("cuối tuần") || text.includes("thứ 7") || text.includes("chủ nhật")
      if (activeTab === "banquet") return text.includes("tiệc") || text.includes("cưới") || text.includes("phục vụ") || text.includes("buffet")
      if (activeTab === "conference") return text.includes("hội nghị") || text.includes("hội thảo") || text.includes("triển lãm")
      if (activeTab === "pg") return text.includes("pg") || text.includes("pb") || text.includes("check-in") || text.includes("activation")
      return true
    })

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 10)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
  }, [displayEvents.length])

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
      router.push(`/events/${jobId}`)
    }
  }

  return (
    <section className="w-full bg-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col gap-4">
      {/* 1. Header (No banner) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-2">
          <h2 className="text-[20px] font-bold text-[#222222] leading-[30px]">
            Việc làm mới nhất
          </h2>
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

        {/* Scrollable 2-row Grid or Loading/Empty state */}
        {loading ? (
          <div className="overflow-x-auto scroll-smooth py-1 px-1 -mx-1 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="grid grid-rows-2 auto-cols-[min(340px,85vw)] md:auto-cols-[min(360px,46vw)] lg:auto-cols-[calc((100%-32px)/3)] grid-flow-col gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-full min-h-[192px] p-4 bg-white rounded-[16px] border border-[#e8e8e8] animate-pulse flex gap-3 items-start"
                >
                  <div className="size-[56px] min-w-[56px] rounded-[6px] bg-gray-100 shrink-0" />
                  <div className="flex-1 space-y-2.5">
                    <div className="h-4 bg-gray-100 rounded w-20" />
                    <div className="h-4 bg-gray-100 rounded w-4/5" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-4 bg-gray-100 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : displayEvents.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <p className="text-sm font-medium">Hiện chưa có việc làm nào trong danh mục này.</p>
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className="mt-3 text-xs text-blue-600 font-bold hover:underline"
            >
              Xem tất cả việc làm
            </button>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="overflow-x-auto scroll-smooth py-1 px-1 -mx-1 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            <div className="grid grid-rows-2 auto-cols-[min(340px,85vw)] md:auto-cols-[min(360px,46vw)] lg:auto-cols-[calc((100%-32px)/3)] grid-flow-col gap-4">
              {displayEvents.map((job) => (
                <EventCard
                  key={job.id}
                  job={job}
                  isBookmarked={!!bookmarkedEvents[job.id]}
                  onToggleBookmark={onToggleBookmark}
                  onNavigate={handleClickJob}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Bottom Pill Button */}
      <div className="flex justify-center pt-1">
        <button
          type="button"
          onClick={() => router.push("/events")}
          className="h-[40px] px-6 border border-[#dadada] rounded-full bg-white text-[#222222] font-bold text-[16px] leading-[24px] hover:bg-gray-50 transition-colors"
        >
          Xem thêm việc làm mới nhất
        </button>
      </div>
    </section>
  )
}
