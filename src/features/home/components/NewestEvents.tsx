"use client"

import Link from "next/link"
import { ChevronRight, Building2 } from "lucide-react"
import EventCard from "@/features/event/components/EventCard"

export interface NewestEventsProps {
  events?: any[]
  loading?: boolean
  bookmarkedEvents?: Record<string, boolean>
  onToggleBookmark?: (id: string) => void
  onNavigateToJob?: (id: string) => void
}

export type NewestJobsProps = NewestEventsProps

export default function NewestEvents({
  events = [],
  loading = false,
  bookmarkedEvents = {},
  onToggleBookmark,
  onNavigateToJob,
}: NewestEventsProps) {
  const displayJobs = events.slice(0, 6)

  return (
    <section
      id="newest-jobs"
      className="w-full"
      data-node-id="5875:29405"
      data-name="Frame 2147225777"
    >
      <div className="max-w-[1232px] mx-auto px-4 sm:px-6 lg:px-0">
        {/* Section Header (Figma node 5875:29406: Titr home) */}
        <div
          className="relative flex flex-col items-center justify-center text-center mb-8 sm:mb-10"
          data-node-id="5875:29406"
          data-name="Titr home"
        >
          {/* Centered Title & Subtitle */}
          <div className="flex flex-col items-center gap-2 max-w-[600px] px-4">
            <h2
              className="font-['Inter'] font-semibold text-2xl sm:text-3xl lg:text-[36px] text-[#222222] tracking-tight leading-tight text-center"
              data-node-id="I5875:29406;874:9496"
            >
              Việc Làm Sự Kiện Mới Nhất
            </h2>
            <p
              className="font-['Inter'] font-normal text-[15px] sm:text-[16px] text-[#757575] leading-[1.6] text-center"
              data-node-id="I5875:29406;874:9497"
            >
              Đón đầu các cơ hội việc làm sự kiện hấp dẫn và ứng tuyển nhanh nhất hôm nay
            </p>
          </div>

          {/* "Xem thêm >" Button on Right Corner (Figma node I5875:29406;3985:41205) */}
          <Link
            href="/events"
            data-node-id="I5875:29406;3988:40331"
            className="sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2 mt-4 sm:mt-0 inline-flex items-center gap-1 text-[14px] font-medium text-[#005DDC] hover:text-[#004EB7] transition-colors group px-2 py-1 rounded-[8px]"
          >
            <span>Xem thêm</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px] w-full">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#EDEDED] rounded-[8px] p-[24px] h-[181px] flex gap-[12px] items-start animate-pulse"
              >
                <div className="w-16 h-16 rounded-[8px] bg-slate-100 shrink-0" />
                <div className="min-w-0 flex-1 flex flex-col justify-between h-[133px]">
                  <div className="space-y-1.5">
                    <div className="w-24 h-3 bg-slate-100 rounded" />
                    <div className="w-4/5 h-4.5 bg-slate-100 rounded" />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-16 h-5 bg-slate-100 rounded" />
                    <div className="w-16 h-5 bg-slate-100 rounded" />
                  </div>
                  <div className="w-32 h-3 bg-slate-100 rounded" />
                  <div className="flex items-center justify-between pt-1">
                    <div className="w-24 h-4 bg-slate-100 rounded" />
                    <div className="w-16 h-3 bg-slate-100 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayJobs.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-[8px] border border-dashed border-slate-200">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-[16px] font-medium text-[#222222]">
              Chưa có việc làm sự kiện nào
            </p>
            <p className="text-[14px] text-[#757575] mt-1 max-w-md mx-auto">
              Các cơ hội việc làm sự kiện mới nhất sẽ sớm được cập nhật tại đây. Vui lòng quay lại sau!
            </p>
          </div>
        ) : (
          /* 3-column x 2-row Job Cards Grid (Figma node 5875:29407) */
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px] w-full"
            data-node-id="5875:29407"
          >
            {displayJobs.map((job) => (
              <EventCard
                key={job.id}
                job={job}
                isBookmarked={!!bookmarkedEvents[job.id]}
                onToggleBookmark={onToggleBookmark}
                onNavigate={onNavigateToJob}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
