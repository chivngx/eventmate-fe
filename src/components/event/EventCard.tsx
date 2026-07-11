"use client"

import { memo } from "react"
import { Heart, MapPin, Calendar, Clock, Users, ChevronRight } from "lucide-react"
import { useNavigate } from "@/lib/router"
import { cn } from "@/lib/utils"

interface EventCardProps {
  job: any
  idx: number
  isBookmarked: boolean
  onToggleBookmark: (eventId: string) => void
  onNavigateToJob: (jobId: string) => void
}

function formatDay(dateStr?: string): { day: string; month: string; weekday: string } | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: `Th${d.getMonth() + 1}`,
    weekday: weekdays[d.getDay()],
  }
}

function getDaysLeft(deadlineStr?: string): number | null {
  if (!deadlineStr) return null
  const diff = new Date(deadlineStr).getTime() - Date.now()
  const days = Math.ceil(diff / 86400000)
  return days > 0 ? days : 0
}

// Category accent colors — each event type has its own visual identity
const CATEGORY_ACCENTS: Record<string, { bar: string; bg: string; text: string }> = {
  "Lễ hội Âm nhạc": { bar: "bg-rose-500", bg: "bg-rose-50", text: "text-rose-600" },
  "Hội thảo / Workshop": { bar: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-600" },
  "Giải đấu Thể thao": { bar: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-600" },
  "Giao lưu Văn hóa": { bar: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-600" },
  "Triển lãm / Hội chợ": { bar: "bg-indigo-500", bg: "bg-indigo-50", text: "text-indigo-600" },
  "Sự kiện Công nghệ": { bar: "bg-purple-500", bg: "bg-purple-50", text: "text-purple-600" },
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
  const daysLeft = getDaysLeft(job.application_deadline)
  const slotsLeft = job.slots_needed ?? 0
  const isUrgent = daysLeft !== null && daysLeft <= 3 && daysLeft > 0
  const isClosed = daysLeft === 0 || job.status !== "upcoming"
  const accent = job.category ? CATEGORY_ACCENTS[job.category] : null

  return (
    <article
      onClick={() => onNavigateToJob(job.id)}
      className="group relative flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer animate-in fade-in slide-in-from-bottom-3"
      style={{ animationDelay: `${idx * 40}ms` }}
    >
      {/* Category color bar — event visual identity */}
      <div className={cn("h-1.5 w-full", accent?.bar || "bg-slate-300")} />

      {/* Urgent / closed badge */}
      {isClosed ? (
        <div className="absolute top-3 right-3 bg-slate-200 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
          Đã đóng
        </div>
      ) : isUrgent ? (
        <div className="absolute top-3 right-3 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />
          {daysLeft} ngày
        </div>
      ) : null}

      {/* Date block + content */}
      <div className="flex items-stretch gap-3 p-4 pb-3">
        {/* Date — large, prominent, ticket-style */}
        <div className="flex flex-col items-center justify-center w-16 shrink-0 bg-slate-900 rounded-xl py-2.5">
          {eventDate ? (
            <>
              <span className="text-[10px] font-bold text-white/50 uppercase">{eventDate.weekday}</span>
              <span className="text-xl font-bold leading-none text-white mt-0.5">
                {eventDate.day}
              </span>
              <span className="text-[10px] font-bold text-white/50 uppercase mt-0.5">
                {eventDate.month}
              </span>
            </>
          ) : (
            <Calendar className="w-5 h-5 text-white/40 my-2" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Category badge with color */}
          {job.category && accent && (
            <span className={cn("inline-block text-[10px] font-bold px-2 py-0.5 rounded mb-1.5", accent.bg, accent.text)}>
              {job.category}
            </span>
          )}
          <h3
            className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-slate-700 transition-colors"
            title={job.title}
          >
            {job.title}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/companies/${job.profiles?.slug || job.organizer_id}`)
            }}
            className="text-xs text-slate-500 mt-1 truncate hover:text-slate-900 transition-colors block max-w-full text-left"
            title={job.profiles?.full_name}
          >
            {job.profiles?.full_name || "Đơn vị ẩn danh"}
          </button>
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

      {/* Footer: location + slots */}
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
        {job.position_type && (
          <span className="shrink-0 ml-auto text-slate-400 truncate max-w-[100px]">{job.position_type}</span>
        )}
      </div>
    </article>
  )
}

export default memo(EventCard)
