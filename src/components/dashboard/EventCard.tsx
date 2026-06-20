import { Heart, CheckCircle, XCircle, Clock3 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useNavigate } from "react-router-dom"

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
  onApply: _onApply,       // ĐÃ SỬA: Thêm tiền tố _ để tránh lỗi nghiêm ngặt tsc TS6133 khi không dùng nút ứng tuyển ngoài
  applyingId: _applyingId, // ĐÃ SỬA: Thêm tiền tố _ để tránh lỗi nghiêm ngặt tsc TS6133 khi không dùng nút ứng tuyển ngoài
  onNavigateToJob,
  userSkills
}: EventCardProps) {
  const navigate = useNavigate()
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

  // Chỉ hiển thị nhãn Trạng thái tĩnh đối với những công việc sinh viên ĐÃ NỘP HỒ SƠ để tăng UX
  const renderStatusBadge = () => {
    if (myApplicationStatus === "approved") {
      return (
        <span className="text-[12px] font-bold text-[#00b14f] bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1 shrink-0 h-9">
          <CheckCircle className="w-3.5 h-3.5" /> Trúng tuyển
        </span>
      )
    }
    if (myApplicationStatus === "rejected") {
      return (
        <span className="text-[12px] font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 flex items-center gap-1 shrink-0 h-9">
          <XCircle className="w-3.5 h-3.5" /> K.phù hợp
        </span>
      )
    }
    if (myApplicationStatus === "pending") {
      return (
        <span className="text-[12px] font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1 shrink-0 h-9">
          <Clock3 className="w-3.5 h-3.5" /> Chờ duyệt
        </span>
      )
    }
    return null // Mặc định ẩn hoàn toàn nút "Ứng tuyển" chủ động ra khỏi danh sách ngoài
  }

  return (
    <div
      onClick={() => onNavigateToJob(job.id)}
      className="group relative flex flex-col justify-between rounded-[1.25rem] border border-slate-100/90 bg-white p-5 transition-all duration-300 hover:border-[#00b14f] hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-0.5 cursor-pointer animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${idx * 40}ms` }}
    >
      <div className="flex gap-4 items-start">
        {/* KHỐI TRÁI: AVATAR / LOGO NHÀ TỔ CHỨC */}
        <Avatar className="h-14 w-14 rounded-2xl border border-slate-100 shrink-0 shadow-sm bg-slate-50/50">
          <AvatarFallback className="rounded-2xl bg-slate-50 text-xl font-black text-slate-600 group-hover:bg-emerald-50 group-hover:text-[#00b14f] transition-colors duration-200">
            {job.profiles?.full_name ? job.profiles.full_name.charAt(0).toUpperCase() : "O"}
          </AvatarFallback>
        </Avatar>

        {/* KHỐI PHẢI: CHI TIẾT NỘI DUNG CHỮ */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-[15px] font-bold text-[#212f3f] leading-snug group-hover:text-[#00b14f] transition-colors duration-200 line-clamp-2"
            title={job.title}
          >
            {job.title}
          </h3>
          <p
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/companies/${job.organizer_id}`)
            }}
            className="text-[13px] font-bold text-slate-400 mt-1 truncate hover:text-[#00b14f] transition-colors"
            title={job.profiles?.full_name}
          >
            {job.profiles?.full_name || "Đơn vị ẩn danh"}
          </p>

          {/* CỤM BADGES AI & PHẢN HỒI NHANH NGAY DƯỚI TIÊU ĐỀ */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {matchScore !== null && (
              <span className="bg-emerald-50/80 text-[#00b14f] text-[10px] font-black px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-0.5">
                🔥 Match: {matchScore}%
              </span>
            )}
            {job.organizer_id && (job.organizer_id.charCodeAt(0) % 2 === 0) && (
              <span className="bg-amber-50/80 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded border border-amber-100">
                ⚡ Phản hồi nhanh
              </span>
            )}
          </div>
        </div>
      </div>

      {/* KHỐI CHÂN THẺ (CARD FOOTER) ĐÃ ĐƯỢC TIN GIẢN BẢN ĐỒ VÀ NÚT ỨNG TUYỂN */}
      <div className="mt-5 pt-3.5 border-t border-slate-100/70 flex items-center justify-between gap-3">
        {/* TRÁI: VIÊN THUỐC THÔNG TIN ĐỊA HẠT ĐÀ NẴNG (ĐÃ ẨN BẢN ĐỒ) */}
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          <span className="text-[11px] font-bold bg-[#f4f5f6] text-[#263a4d] px-2.5 py-1 rounded-full whitespace-nowrap">
            {job.benefits || "Thỏa thuận"}
          </span>
          <span className="text-[11px] font-bold bg-[#f4f5f6] text-[#263a4d] px-2.5 py-1 rounded-full truncate max-w-[150px]" title={job.danang_wards?.name || job.location}>
            {job.danang_wards?.name ? `P. ${job.danang_wards.name}` : (job.location || "Đà Nẵng")}
          </span>
        </div>

        {/* PHẢI: CỤM NÚT TƯƠNG TÁC TÁCH BIỆT (ĐÃ ẨN NÚT ỨNG TUYỂN CHỦ ĐỘNG) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(job.id);
            }}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all shrink-0 active:scale-90 ${isBookmarked
              ? "bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100"
              : "bg-white border-slate-200 text-slate-400 hover:text-[#00b14f] hover:border-[#00b14f]"
              }`}
            title="Lưu việc làm"
          >
            <Heart className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
          </button>

          {renderStatusBadge()}
        </div>
      </div>
    </div>
  )
}