"use client"

import JobsSliderSection from "./JobsSliderSection"

export default function LatestJobsFeed({
  events = [],
  loading = false,
  bookmarkedEvents = {},
  onToggleBookmark,
  onNavigateToJob,
}) {
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
