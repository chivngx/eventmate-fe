"use client"

import { useNavigate } from "@/lib/router"
import { MapPin } from "lucide-react"
import { formatSalary, formatTimeAgo, cn } from "@/lib/utils"

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
  banner_url?: string | null
  slug?: string | null
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
        "group relative bg-white border border-[#ededed] hover:border-[#005ddc]/50 hover:shadow-md transition-all duration-200 rounded-[8px] p-5 sm:p-6 cursor-pointer flex gap-3.5 sm:gap-4 items-start",
        className
      )}
    >
      {/* Logo: Circular, completely borderless */}
      <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={organizerName}
            className="w-full h-full object-cover rounded-full"
            onError={(e: any) => {
              e.currentTarget.style.display = "none"
              if (e.currentTarget.nextElementSibling) {
                e.currentTarget.nextElementSibling.style.display = "flex"
              }
            }}
          />
        ) : null}
        <div
          className={`w-full h-full rounded-full bg-slate-100 text-slate-700 font-bold text-base sm:text-lg flex items-center justify-center ${
            logoUrl ? "hidden" : ""
          }`}
        >
          {organizerName.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Details (Figma node 4777:81239) */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-2 h-full">
        {/* Top block: Company name & Job title */}
        <div>
          <span className="text-[12px] text-[#a5a5a5] font-normal truncate block">
            {organizerName}
          </span>

          <h3
            title={job.title}
            className="text-[16px] sm:text-[18px] font-medium text-[#222222] truncate group-hover:text-[#005ddc] transition-colors mt-0.5"
          >
            {job.title}
          </h3>
        </div>

        {/* Badges row (Figma node 4777:81247) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {badges.slice(0, 2).map((badgeText, idx) => (
            <span
              key={idx}
              className="inline-flex items-center h-5 px-2 py-0.5 rounded-[4px] text-[12px] font-normal bg-[#eff5ff] text-[#005ddc]"
            >
              {badgeText}
            </span>
          ))}
          {job.work_mode && (
            <span className="inline-flex items-center h-5 px-2 py-0.5 rounded-[4px] text-[12px] font-normal bg-slate-100 text-[#515151]">
              {job.work_mode}
            </span>
          )}
        </div>

        {/* Location & Bottom metrics row (Figma node 4777:81250) */}
        <div className="pt-1 flex flex-col gap-1 border-t border-slate-50">
          <div className="flex items-center gap-1.5 text-[#353535] text-[12px] font-normal">
            <MapPin className="w-3.5 h-3.5 text-[#a5a5a5] shrink-0" />
            <span className="truncate">{locationText}</span>
          </div>

          <div className="flex items-center justify-between text-sm pt-0.5">
            <span className="font-medium text-[#005ddc] text-[13px] sm:text-[14px]">
              {formattedSalaryText}
            </span>
            <span className="text-[#757575] text-[11px] sm:text-[12px] font-normal">
              {timeAgoText}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

export { EventCard as JobCardFigma, EventCard as EventJobCard }
