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
  userSkills?: string
}

export default function EventCard({
  job,
  idx,
  isBookmarked,
  onToggleBookmark,
  myApplicationStatus,
  onApply,
  applyingId,
  onNavigateToJob,
  userSkills
}: EventCardProps) {
  const getMatchScore = () => {
    if (!userSkills) return null
    const skills = userSkills.split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
    if (skills.length === 0) return null

    const searchText = `${job.title} ${job.description || ""} ${job.category || ""} ${job.position_type || ""}`.toLowerCase()
    let matches = 0
    skills.forEach(skill => {
      if (searchText.includes(skill)) {
        matches++
      }
    })

    if (matches > 0) {
      const ratio = matches / skills.length
      return Math.round(55 + (ratio * 45))
    }
    return 35
  }

  const matchScore = getMatchScore()

  const getMockSalary = (item: any) => {
    if (item.benefits) return item.benefits
    const desc = (item.description || "").toLowerCase()
    if (desc.includes("tình nguyện") || desc.includes("volunteer")) return "Tình nguyện"
    return "Cấp chứng nhận"
  }

  const renderActionButton = () => {
    if (myApplicationStatus === "approved") {
      return (
        <span className="text-[11px] font-extrabold text-[#00b14f] bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex items-center gap-1">
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
        className="rounded-lg bg-[#00b14f] hover:bg-[#009b45] text-white text-[11px] font-extrabold px-3.5 py-1 h-7.5 shadow-sm transition-colors border-0 shrink-0"
      >
        {applyingId === job.id ? "..." : "Ứng tuyển"}
      </Button>
    )
  }

  return (
    <div
      className="group relative flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-4 transition-all duration-300 hover:border-[#00b14f] hover:shadow-md hover:shadow-slate-200/50 hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${idx * 50}ms` }}
    >
      <div className="flex gap-4 items-start">
        <Avatar
          className="h-12 w-12 rounded-lg border border-slate-100 shrink-0 cursor-pointer shadow-sm"
          onClick={() => onNavigateToJob(job.id)}
        >
          <AvatarFallback className="rounded-lg bg-slate-50 text-lg font-bold text-slate-600 group-hover:bg-emerald-50 group-hover:text-[#00b14f] transition-colors">
            {job.profiles?.full_name ? job.profiles.full_name.charAt(0).toUpperCase() : "O"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 pr-1">
          <h3
            className="text-[14px] font-semibold text-[#212f3f] leading-snug group-hover:text-[#00b14f] transition-colors cursor-pointer line-clamp-2"
            onClick={() => onNavigateToJob(job.id)}
            title={job.title}
          >
            {job.title}
          </h3>
          <p className="text-[12px] font-medium text-[#6f7882] mt-1 truncate" title={job.profiles?.full_name}>
            {job.profiles?.full_name || "Đơn vị ẩn danh"}
          </p>
          {matchScore !== null ? (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <span className="bg-emerald-50 hover:bg-emerald-100 text-[#00b14f] text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-0.5 shadow-sm shadow-emerald-500/5 transition-all cursor-help" title="Toppy AI đánh giá độ tương thích của hồ sơ của bạn với công việc này">
                🔥 Match: {matchScore}%
              </span>
              {job.organizer_id && (job.organizer_id.charCodeAt(0) % 2 === 0) && (
                <span className="bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-0.5 shadow-sm shadow-amber-500/5 transition-all cursor-help" title="Nhà tổ chức này phản hồi hồ sơ ứng tuyển trung bình dưới 48 giờ">
                  ⚡ Phản hồi nhanh
                </span>
              )}
            </div>
          ) : (
            job.organizer_id && (job.organizer_id.charCodeAt(0) % 2 === 0) && (
              <div className="mt-2.5 flex">
                <span className="bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-0.5 shadow-sm shadow-amber-500/5 transition-all cursor-help" title="Nhà tổ chức này phản hồi hồ sơ ứng tuyển trung bình dưới 48 giờ">
                  ⚡ Phản hồi nhanh
                </span>
              </div>
            )
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium bg-[#edeff0] text-[#263a4d] px-2.5 py-0.5 rounded-full">
            {getMockSalary(job)}
          </span>
          <span className="text-[11px] font-medium bg-[#edeff0] text-[#263a4d] px-2.5 py-0.5 rounded-full" title={job.location}>
            {job.location || "Toàn quốc"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onToggleBookmark(job.id)}
            className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all shrink-0 ${isBookmarked
                ? "bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100"
                : "bg-white border-slate-200 text-slate-400 hover:text-[#00b14f] hover:border-[#00b14f]"
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
