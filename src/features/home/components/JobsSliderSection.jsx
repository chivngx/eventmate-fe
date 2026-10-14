"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import EventCard from "@/features/event/components/EventCard"
import { ChevronRight, ChevronLeft, ArrowRight, CheckCircle2 } from "lucide-react"

export default function JobsSliderSection({
  title,
  variant = "simple",
  badgeText,
  infoIcon = false,
  isUrgentCardBadge = false,
  headerRight,
  jobs = [],
  loading = false,
  emptyMessage = "Hiện chưa có việc làm nào.",
  viewMoreText = "Xem thêm việc làm",
  viewMoreHref = "/events",
  onNavigateToJob,
  bookmarkedEvents = {},
  onToggleBookmark,
}) {
  const router = useRouter()
  const scrollContainerRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      const isOverflowing = scrollWidth > clientWidth + 4
      setCanScrollLeft(isOverflowing && scrollLeft > 10)
      setCanScrollRight(isOverflowing && scrollLeft < scrollWidth - clientWidth - 10)
    } else {
      setCanScrollLeft(false)
      setCanScrollRight(false)
    }
  }

  useEffect(() => {
    checkScroll()

    const rafId = requestAnimationFrame(checkScroll)
    const timeoutId = setTimeout(checkScroll, 100)

    const observer = new ResizeObserver(() => {
      checkScroll()
    })

    if (scrollContainerRef.current) {
      observer.observe(scrollContainerRef.current)
    }

    window.addEventListener("resize", checkScroll)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(timeoutId)
      observer.disconnect()
      window.removeEventListener("resize", checkScroll)
    }
  }, [jobs.length, loading])

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 392
      scrollContainerRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const handleClickJob = (jobId) => {
    if (onNavigateToJob) {
      onNavigateToJob(jobId)
    } else {
      router.push(`/events/${jobId}`)
    }
  }

  return (
    <section className="w-full bg-white rounded-xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs flex flex-col gap-5">
      {/* 1. Header (Clean, Corporate Mint, No Orange) */}
      {variant === "banner" ? (
        <div className="rounded-lg px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-teal-50/70 to-slate-50/80 border border-teal-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0D9488]" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {title}
            </h2>
          </div>

          {badgeText && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-white text-teal-800 border border-teal-200/80 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0D9488]" />
                {badgeText}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {title}
            </h2>
          </div>
          {headerRight}
        </div>
      )}

      {/* 2. Grid Container with Horizontal Scroll and Arrow Controls */}
      <div className="relative w-full">
        {/* Previous Button */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Xem việc trước"
            className="absolute -left-3 top-1/2 -translate-y-1/2 size-9 rounded-lg bg-white shadow-md border border-gray-200 flex items-center justify-center z-20 hover:bg-slate-50 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
        )}

        {/* Next Button */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Xem thêm việc"
            className="absolute -right-3 top-1/2 -translate-y-1/2 size-9 rounded-lg bg-white shadow-md border border-gray-200 flex items-center justify-center z-20 hover:bg-slate-50 transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        )}

        {/* Scrollable Grid or Loading/Empty state */}
        {loading ? (
          <div className="overflow-x-auto scroll-smooth py-1 px-1 -mx-1 scrollbar-none flex gap-4 items-stretch">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-[min(340px,85vw)] md:w-[min(360px,46vw)] lg:w-[calc((100%-32px)/3)] shrink-0 min-h-[192px] p-4 bg-white rounded-lg border border-gray-200 animate-pulse flex gap-3 items-start"
              >
                <div className="size-[56px] min-w-[56px] rounded bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 bg-slate-100 rounded w-20" />
                  <div className="h-4 bg-slate-100 rounded w-4/5" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            <p className="text-sm font-medium">{emptyMessage}</p>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="overflow-x-auto scroll-smooth py-1 px-1 -mx-1 scrollbar-none flex gap-4 items-stretch"
          >
            {jobs.map((job) => (
              <div
                key={job.id}
                className="w-[min(340px,85vw)] md:w-[min(360px,46vw)] lg:w-[calc((100%-32px)/3)] shrink-0"
              >
                <EventCard
                  job={isUrgentCardBadge ? { ...job, is_urgent: true } : job}
                  isBookmarked={!!bookmarkedEvents[job.id]}
                  onToggleBookmark={onToggleBookmark}
                  onNavigate={handleClickJob}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Bottom Action Button */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={() => router.push(viewMoreHref)}
          className="h-[38px] px-6 rounded-md border border-gray-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>{viewMoreText}</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </section>
  )
}
