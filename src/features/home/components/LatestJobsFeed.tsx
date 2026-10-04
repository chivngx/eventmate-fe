"use client"

import { JobItem } from "@/features/event/components/EventCard"
import JobsSliderSection from "./JobsSliderSection"

export interface LatestJobsFeedProps {
  events?: JobItem[]
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
  return (
    <JobsSliderSection
      title="Sự kiện mới nhất"
      variant="simple"
      jobs={events}
      loading={loading}
      emptyMessage="Hiện chưa có sự kiện nào trong danh mục này."
      viewMoreText="Xem thêm"
      viewMoreHref="/events"
      onNavigateToJob={onNavigateToJob}
      bookmarkedEvents={bookmarkedEvents}
      onToggleBookmark={onToggleBookmark}
    />
  )
}

