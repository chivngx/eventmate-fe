"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import EventCard, { JobItem } from "@/features/event/components/EventCard"

export interface JobsSliderSectionProps {
  title: string
  variant?: "banner" | "simple"
  badgeText?: string
  infoIcon?: boolean
  isUrgentCardBadge?: boolean
  headerRight?: React.ReactNode

  jobs?: JobItem[]
  loading?: boolean
  emptyMessage?: string

  viewMoreText?: string
  viewMoreHref?: string
  onNavigateToJob?: (jobId: string) => void
  bookmarkedEvents?: Record<string, boolean>
  onToggleBookmark?: (id: string) => void
}

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
}: JobsSliderSectionProps) {
  const router = useRouter()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
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
      {/* 1. Header */}
      {variant === "banner" ? (
        <div className="relative rounded-[12px] overflow-hidden px-4 sm:px-5 py-4 flex flex-col gap-2 bg-[#FFF4EC]">
          {/* Title row */}
          <div className="flex items-center gap-2 relative z-10">
            <h2 className="text-[20px] font-bold text-[#222222] leading-[30px]">
              {title}
            </h2>
            {infoIcon && (
              <img
                src="/images/urgent/icon-info.svg"
                alt={title}
                className="size-6 cursor-pointer"
              />
            )}
          </div>

          {/* Badges row */}
          {badgeText && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 relative z-10">
              <div className="flex items-center gap-2">
                <img
                  src="/images/urgent/icon-check-circle.svg"
                  alt=""
                  className="size-5 shrink-0"
                />
                <span className="text-[14px] sm:text-[16px] font-medium text-[#222222] whitespace-nowrap">
                  {badgeText}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[20px] font-bold text-[#222222] leading-[30px]">
              {title}
            </h2>
            {infoIcon && (
              <img
                src="/images/urgent/icon-info.svg"
                alt={title}
                className="size-6 cursor-pointer"
              />
            )}
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

        {/* Scrollable Grid or Loading/Empty state */}
        {loading ? (
          <div className="overflow-x-auto scroll-smooth py-1 px-1 -mx-1 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex gap-4 items-stretch">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-[min(340px,85vw)] md:w-[min(360px,46vw)] lg:w-[calc((100%-32px)/3)] shrink-0 min-h-[192px] p-4 bg-white rounded-[16px] border border-[#e8e8e8] animate-pulse flex gap-3 items-start"
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
        ) : jobs.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            <p className="text-sm font-medium">{emptyMessage}</p>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="overflow-x-auto scroll-smooth py-1 px-1 -mx-1 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex gap-4 items-stretch"
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

      {/* 3. Bottom Pill Button */}
      <div className="flex justify-center pt-1">
        <button
          type="button"
          onClick={() => router.push(viewMoreHref)}
          className="h-[40px] px-6 border border-[#dadada] rounded-full bg-white text-[#222222] font-bold text-[16px] leading-[24px] hover:bg-gray-50 transition-colors"
        >
          {viewMoreText}
        </button>
      </div>
    </section>
  )
}
