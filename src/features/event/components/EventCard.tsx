"use client"

import { useNavigate } from "@/lib/router"
import { MapPin, Calendar, Users } from "lucide-react"
import { formatSalary, formatTimeAgo, formatShiftTime, cn } from "@/lib/utils"

export interface JobItem {
  id: string
  title: string
  category?: string | null
  position_type?: string | null
  event_date?: string | null
  start_time?: string | null
  end_time?: string | null
  location?: string | null
  salary_amount?: number | null
  salary_type?: string | null
  payment_method?: string | null
  work_mode?: string | null
  job_type?: string | null
  created_at?: string | null
  organizer_id?: string | null
  slots_needed?: number | null
  benefits?: string[] | null
  tags?: string[] | null
  slug?: string | null
  banner_url?: string | null
  is_urgent?: boolean | null
  is_featured?: boolean | null
  bumped_at?: string | null
  plan_tier?: string | null
  profiles?: {
    id?: string
    full_name?: string | null
    avatar_url?: string | null
    slug?: string | null
  } | null
  danang_wards?: {
    id?: number
    name: string
  } | null
}

export interface EventCardProps {
  job: JobItem
  isBookmarked?: boolean
  onToggleBookmark?: (id: string) => void
  onNavigate?: (id: string) => void
  className?: string
}

export type EventJobCardProps = EventCardProps

export default function EventCard({
  job,
  onNavigate,
  className = "",
}: EventCardProps) {
  const navigate = useNavigate()

  const organizerName = job.profiles?.full_name || "Ban tổ chức sự kiện"
  const logoUrl = job.profiles?.avatar_url || job.banner_url || null
  const locationText = job.danang_wards?.name || job.location || "Đà Nẵng"
  const formattedSalaryText = formatSalary(job.salary_amount, job.salary_type, "Thỏa thuận")
  const timeAgoText = job.created_at ? formatTimeAgo(job.created_at) : "Gần đây"

  // Event date & shift
  let formattedDate: string | null = null
  if (job.event_date) {
    try {
      const d = new Date(job.event_date)
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      }
    } catch {
      formattedDate = null
    }
  }
  const shiftTime = formatShiftTime(job.start_time, job.end_time)
  const eventDateText = formattedDate
    ? shiftTime
      ? `${formattedDate} (${shiftTime})`
      : formattedDate
    : null

  // Badges
  const badges: string[] = []
  if (Array.isArray(job.tags) && job.tags.length > 0) {
    badges.push(...job.tags)
  } else {
    if (job.position_type) badges.push(job.position_type)
    if (job.category) badges.push(job.category)
    if (job.job_type) badges.push(job.job_type)
  }
  if (badges.length === 0) {
    badges.push(job.salary_type === "volunteer" ? "Tình nguyện viên" : "Theo sự kiện")
  }

  const handleCardClick = () => {
    if (onNavigate) {
      onNavigate(job.id)
    } else {
      navigate(`/events/${job.slug || job.id}`)
    }
  }

  return (
    <article
      onClick={handleCardClick}
      className={cn(
        "group relative bg-white border hover:shadow-[0_8px_25px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-200 rounded-2xl p-4.5 sm:p-5 cursor-pointer flex flex-col justify-between gap-3.5",
        job.is_featured ? "border-amber-300/90 bg-gradient-to-b from-amber-50/25 to-white shadow-xs" : "border-zinc-200/80 hover:border-zinc-300",
        className
      )}
    >
      {/* Top Section: Squircle Logo & Titles */}
      <div className="flex items-start gap-3.5">
        {/* Logo: Modern Squircle badge */}
        <div className="shrink-0 size-12 sm:size-13 rounded-xl bg-zinc-50 border border-zinc-200/70 p-1 flex items-center justify-center overflow-hidden transition-colors group-hover:border-zinc-300">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={organizerName}
              className="size-full object-contain rounded-lg"
              onError={(e: any) => {
                e.currentTarget.style.display = "none"
                if (e.currentTarget.nextElementSibling) {
                  e.currentTarget.nextElementSibling.style.display = "flex"
                }
              }}
            />
          ) : null}
          <div
            className={`size-full rounded-lg bg-zinc-100 text-zinc-700 font-semibold text-base flex items-center justify-center ${
              logoUrl ? "hidden" : ""
            }`}
          >
            {organizerName.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Organizer & Title */}
        <div className="flex-1 min-w-0">
          <span className="text-[12.5px] font-medium text-zinc-500 truncate block">
            {organizerName}
          </span>
          <h3
            title={job.title}
            className="text-[15px] sm:text-[16px] font-semibold text-zinc-900 group-hover:text-black transition-colors leading-snug line-clamp-1 sm:line-clamp-2 mt-0.5"
          >
            {job.title}
          </h3>
        </div>
      </div>

      {/* Middle Section: Event Meta & Badges */}
      <div className="flex flex-col gap-2.5">
        {/* Date & Location */}
        <div className="flex items-center gap-3.5 text-[12.5px] text-zinc-500 flex-wrap">
          {eventDateText && (
            <span className="inline-flex items-center gap-1.5 font-normal text-zinc-600">
              <Calendar className="size-3.5 text-zinc-400 shrink-0" />
              <span>{eventDateText}</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 font-normal text-zinc-600">
            <MapPin className="size-3.5 text-zinc-400 shrink-0" />
            <span className="truncate">{locationText}</span>
          </span>
        </div>

        {/* Badges row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {job.is_featured && (
            <span className="inline-flex items-center gap-1 h-6 px-2.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs">
              ★ Nổi bật
            </span>
          )}
          {job.is_urgent && (
            <span className="inline-flex items-center gap-1 h-6 px-2.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200 shadow-2xs">
              🔥 Tuyển gấp
            </span>
          )}
          {badges.slice(0, 2).map((badgeText, idx) => (
            <span
              key={idx}
              className="inline-flex items-center h-6 px-2.5 rounded-md text-[11.5px] font-medium bg-zinc-100/90 text-zinc-600"
            >
              {badgeText}
            </span>
          ))}
          {job.work_mode && (
            <span className="inline-flex items-center h-6 px-2.5 rounded-md text-[11.5px] font-medium bg-zinc-100/90 text-zinc-600">
              {job.work_mode}
            </span>
          )}
          {typeof job.slots_needed === "number" && job.slots_needed > 0 && (
            <span className="inline-flex items-center gap-1 h-6 px-2.5 rounded-md text-[11.5px] font-medium bg-zinc-100/90 text-zinc-600">
              <Users className="size-3 text-zinc-400 shrink-0" />
              <span>Cần {job.slots_needed} bạn</span>
            </span>
          )}
        </div>
      </div>

      {/* Bottom Row: Salary & Time posted */}
      <div className="pt-2.5 border-t border-zinc-100 flex items-center justify-between">
        <span className="font-semibold text-[14px] sm:text-[14.5px] text-zinc-900">
          {formattedSalaryText}
        </span>
        <span className="text-zinc-400 text-[11.5px] sm:text-[12px] font-normal">
          {timeAgoText}
        </span>
      </div>
    </article>
  )
}

export { EventCard as JobCardFigma, EventCard as EventJobCard }
