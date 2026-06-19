import { Heart, CheckCircle, XCircle, Clock3 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface EventCardProps {
  job: any
  idx: number
  isBookmarked: boolean
  onToggleBookmark: (eventId: string) => void
  myApplicationStatus?: string
  onApply: (eventId: string, organizerId: string, eventTitle: string) => void
  applyingId: string | null
  onNavigateToJob: (jobId: string) => void
}

export default function EventCard({
  job,
  idx,
  isBookmarked,
  onToggleBookmark,
  myApplicationStatus,
  onApply,
  applyingId,
  onNavigateToJob
}: EventCardProps) {
  const getMockSalary = (item: any) => {
    if (item.benefits) return item.benefits
    const desc = (item.description || "").toLowerCase()
    if (desc.includes("tình nguyện") || desc.includes("volunteer")) return "Tình nguyện"
    return "Cấp chứng nhận"
  }

  const renderActionButton = () => {
    if (myApplicationStatus === "approved") {
      return (
        <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> Trúng tuyển
        </span>
      )
    }
    if (myApplicationStatus === "rejected") {
      return (
        <span className="text-[11px] font-extrabold text-rose-500 bg-rose-50 px-2 py-1 rounded border border-rose-200 flex items-center gap-1">
          <XCircle className="w-3 h-3" /> K.phù hợp
        </span>
      )
    }
    if (myApplicationStatus === "pending") {
      return (
        <span className="text-[11px] font-extrabold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200 flex items-center gap-1">
          <Clock3 className="w-3 h-3" /> Chờ duyệt
        </span>
      )
    }

    return (
      <Button
        onClick={(e) => {
          e.stopPropagation()
          onApply(job.id, job.organizer_id, job.title)
        }}
        disabled={applyingId === job.id}
        className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold px-3 py-1 h-7 shadow-sm transition-colors border-0 shrink-0"
      >
        {applyingId === job.id ? "..." : "Ứng tuyển"}
      </Button>
    )
  }

  return (
    <div
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 transition-all duration-300 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-950/5 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${idx * 50}ms` }}
    >
      <div className="flex gap-4 items-start">
        <Avatar
          className="h-14 w-14 rounded-xl border border-slate-100 shrink-0 cursor-pointer shadow-sm"
          onClick={() => onNavigateToJob(job.id)}
        >
          <AvatarFallback className="rounded-xl bg-slate-50 text-xl font-black text-slate-700 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
            {job.profiles?.full_name ? job.profiles.full_name.charAt(0).toUpperCase() : "O"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 pr-2">
          <h3
            className="text-[14px] font-extrabold text-slate-800 leading-snug group-hover:text-emerald-600 transition-colors cursor-pointer line-clamp-2"
            onClick={() => onNavigateToJob(job.id)}
            title={job.title}
          >
            {job.title}
          </h3>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1.5 truncate" title={job.profiles?.full_name}>
            {job.profiles?.full_name || "Đơn vị ẩn danh"}
          </p>
        </div>
      </div>

      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold bg-slate-50 text-slate-600 px-2 py-1 rounded">
            {getMockSalary(job)}
          </span>
          <span className="text-[11px] font-bold bg-slate-50 text-slate-600 px-2 py-1 rounded truncate max-w-[80px]" title={job.location}>
            {job.location || "Toàn quốc"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onToggleBookmark(job.id)}
            className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all shrink-0 ${isBookmarked
                ? "bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100"
                : "bg-white border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-600"
              }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isBookmarked ? "fill-current" : ""}`} />
          </button>

          {renderActionButton()}
        </div>
      </div>
    </div>
  )
}
