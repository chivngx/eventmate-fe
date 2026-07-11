"use client"

import { memo } from "react"
import { Heart, MapPin, Calendar, Clock, Users } from "lucide-react"
import { useNavigate } from "@/lib/router"
import { cn } from "@/lib/utils"

interface EventCardProps {
  job: any
  idx: number
  isBookmarked: boolean
  onToggleBookmark: (eventId: string) => void
  onNavigateToJob: (jobId: string) => void
}

/** Format a date string into "DD/MM" for compact display on the ticket. */
function formatDay(dateStr?: string): { day: string; month: string } | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: `Th${d.getMonth() + 1}`,
  }
}

function EventCard({
  job,
  idx,
  isBookmarked,
  onToggleBookmark,
  onNavigateToJob,
}: EventCardProps) {
  const navigate = useNavigate()
  const eventDate = formatDay(job.event_date)
  const deadline = job.application_deadline
    ? new Date(job.application_deadline)
    : null
  const isDeadlineSoon =
    deadline && (deadline.getTime() - Date.now()) < 3 * 24 * 60 * 60 * 1000
  const slotsLeft = job.slots_needed ?? 0

  return (
    <article
      onClick={() => onNavigateToJob(job.id)}
      className="group relative flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 hover:border-primary/40 hover:shadow-md cursor-pointer animate-in fade-in slide-in-from-bottom-3"
      style={{ animationDelay: `${idx * 40}ms` }}
    >
      {/* Top strip: date block + category badge + bookmark */}
      <div className="flex items-stretch gap-3 p-4 pb-3">
        {/* Date block — event ticket vibe */}
        <div className="flex flex-col items-center justify-center w-14 shrink-0 bg-accent rounded-lg border border-primary/20">
          {eventDate ? (
            <>
              <span className="text-lg font-extrabold leading-none text-primary mt-1">
                {eventDate.day}
              </span>
              <span className="text-xs font-bold text-primary/70 uppercase mb-1">
                {eventDate.month}
              </span>
            </>
          ) : (
            <Calendar className="w-5 h-5 text-primary/60 my-2" />
          )}
        </div>

        {/* Title + organizer */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-primary transition-colors"
            title={job.title}
          >
            {job.title}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/companies/${job.profiles?.slug || job.organizer_id}`)
            }}
            className="text-xs text-slate-500 mt-1 truncate hover:text-primary transition-colors block max-w-full text-left"
            title={job.profiles?.full_name}
          >
            {job.profiles?.full_name || "Đơn vị ẩn danh"}
          </button>
          {/* Category + position tags */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {job.category && (
              <span className="text-xs font-semibold text-primary bg-accent px-2 py-0.5 rounded">
                {job.category}
              </span>
            )}
            {job.position_type && (
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded truncate max-w-[120px]">
                {job.position_type}
              </span>
            )}
          </div>
        </div>

        {/* Bookmark */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleBookmark(job.id)
          }}
          aria-label={isBookmarked ? "Bỏ lưu sự kiện này" : "Lưu sự kiện này"}
          aria-pressed={isBookmarked}
          className={cn(
            "w-8 h-8 flex items-center justify-center rounded-lg transition-all shrink-0 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            isBookmarked
              ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
              : "text-slate-400 hover:bg-slate-100 hover:text-destructive"
          )}
        >
          <Heart className={cn("w-4 h-4", isBookmarked && "fill-current")} />
        </button>
      </div>

      {/* Bottom strip: location + deadline + slots */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-t border-slate-100 text-xs text-slate-500 bg-slate-50/50">
        <span className="flex items-center gap-1 min-w-0 truncate">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{job.danang_wards?.name || job.location || "Đà Nẵng"}</span>
        </span>
        {slotsLeft > 0 && (
          <span className="flex items-center gap-1 shrink-0">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{slotsLeft} vị trí</span>
          </span>
        )}
        {isDeadlineSoon && (
          <span className="flex items-center gap-1 shrink-0 ml-auto text-primary font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Sắp hết hạn</span>
          </span>
        )}
      </div>
    </article>
  )
}

export default memo(EventCard)
