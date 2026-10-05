"use client"

import { useState, useEffect } from "react"
import { JobItem } from "@/features/event/components/EventCard"
import { supabase } from "@/lib/supabase"
import JobsSliderSection from "./JobsSliderSection"

export interface UrgentJobsSectionProps {
  events?: JobItem[]
  loading?: boolean
  onNavigateToJob?: (jobId: string) => void
  bookmarkedEvents?: Record<string, boolean>
  onToggleBookmark?: (id: string) => void
}

export default function UrgentJobsSection({
  events: propEvents,
  loading: propLoading,
  onNavigateToJob,
  bookmarkedEvents = {},
  onToggleBookmark,
}: UrgentJobsSectionProps) {
  const [internalEvents, setInternalEvents] = useState<JobItem[]>([])
  const [internalLoading, setInternalLoading] = useState(propEvents === undefined)

  useEffect(() => {
    if (propEvents !== undefined) return

    let isMounted = true

    const fetchUrgentJobs = async () => {
      setInternalLoading(true)
      try {
        const { data, error } = await supabase
          .from("events")
          .select(`
            id,
            title,
            category,
            position_type,
            event_date,
            start_time,
            end_time,
            location,
            salary_amount,
            salary_type,
            payment_method,
            slug,
            created_at,
            organizer_id,
            slots_needed,
            benefits,
            is_urgent,
            bumped_at,
            plan_tier,
            profiles (
              id,
              full_name,
              avatar_url,
              slug,
              is_verified
            ),
            danang_wards (
              id,
              name
            )
          `)
          .is("deleted_at", null)
          .eq("is_urgent", true)
          .order("bumped_at", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false })
          .limit(10)

        if (!error && data && isMounted) {
          if (data.length > 0) {
            setInternalEvents(data as unknown as JobItem[])
          } else {
            // Fallback: nếu chưa có tin gấp nào, lấy các tin sự kiện mới nhất
            const { data: latestData } = await supabase
              .from("events")
              .select(`
                id,
                title,
                category,
                position_type,
                event_date,
                start_time,
                end_time,
                location,
                salary_amount,
                salary_type,
                payment_method,
                slug,
                created_at,
                organizer_id,
                slots_needed,
                benefits,
                is_urgent,
                bumped_at,
                plan_tier,
                profiles (
                  id,
                  full_name,
                  avatar_url,
                  slug,
                  is_verified
                ),
                danang_wards (
                  id,
                  name
                )
              `)
              .is("deleted_at", null)
              .order("created_at", { ascending: false })
              .limit(10)

            if (latestData && isMounted) {
              setInternalEvents(latestData as unknown as JobItem[])
            }
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải việc tuyển gấp:", err)
      } finally {
        if (isMounted) setInternalLoading(false)
      }
    }

    fetchUrgentJobs()

    return () => {
      isMounted = false
    }
  }, [propEvents])

  const jobs = propEvents ?? internalEvents
  const loading = propLoading ?? internalLoading

  return (
    <JobsSliderSection
      title="Sự kiện tuyển gấp"
      variant="banner"
      badgeText="Sự kiện xác thực"
      infoIcon
      isUrgentCardBadge
      jobs={jobs}
      loading={loading}
      emptyMessage="Hiện chưa có sự kiện tuyển gấp nào."
      viewMoreText="Xem thêm"
      viewMoreHref="/events"
      onNavigateToJob={onNavigateToJob}
      bookmarkedEvents={bookmarkedEvents}
      onToggleBookmark={onToggleBookmark}
    />
  )
}
