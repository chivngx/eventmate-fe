import { Heart } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface EventCardProps {
  job: any
  idx: number
  isBookmarked: boolean
  onToggleBookmark: (eventId: string) => void
  onNavigateToJob: (jobId: string) => void
}

export default function EventCard({
  job,
  idx,
  isBookmarked,
  onToggleBookmark,
  onNavigateToJob
}: EventCardProps) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => onNavigateToJob(job.id)}
      className="group relative flex flex-col justify-between rounded-[1.25rem] min-[1440px]:rounded-[10px] border border-slate-100/90 min-[1440px]:border-[0.8px] bg-white p-4 min-[1440px]:p-3 w-full max-w-[371px] h-[125px] min-[1440px]:w-[371px] min-[1440px]:h-[125px] min-[1440px]:shadow-[0px_2px_6px_0px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-[#00b14f] hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-0.5 cursor-pointer animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${idx * 40}ms` }}
    >
      <div className="flex gap-3 min-[1440px]:gap-[10px] items-start min-[1440px]:h-[65px] min-[1440px]:w-[345px]">
        {/* KHỐI TRÁI: AVATAR / LOGO NHÀ TỔ CHỨC */}
        <div className="h-12 w-12 min-[1440px]:w-[64px] min-[1440px]:h-[64px] min-[1440px]:rounded-[6px] min-[1440px]:border-[0.8px] min-[1440px]:border-[#dde4ec] rounded-2xl border border-slate-100 shrink-0 shadow-sm bg-slate-50 flex items-center justify-center overflow-hidden">
          {job.profiles?.avatar_url ? (
            <img
              src={job.profiles.avatar_url}
              alt={job.profiles?.full_name || "Organizer"}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex w-full h-full items-center justify-center bg-slate-50 text-xl min-[1440px]:text-base font-black text-slate-600 group-hover:bg-emerald-50 group-hover:text-[#00b14f] transition-colors duration-200 uppercase">
              {job.profiles?.full_name ? job.profiles.full_name.charAt(0) : "O"}
            </div>
          )}
        </div>

        {/* KHỐI PHẢI: CHI TIẾT NỘI DUNG CHỮ */}
        <div className="flex-1 min-w-0 min-[1440px]:w-[271px] min-[1440px]:h-[65px]">
          <h3
            className="text-[15px] min-[1440px]:text-[14px] min-[1440px]:font-semibold min-[1440px]:leading-[20px] font-bold text-[#212f3f] leading-snug group-hover:text-[#00b14f] transition-colors duration-200 line-clamp-2"
            title={job.title}
          >
            {job.title}
          </h3>
          <p
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/companies/${job.profiles?.slug || job.organizer_id}`)
            }}
            className="text-[13px] min-[1440px]:text-[12px] min-[1440px]:font-medium min-[1440px]:leading-[16px] min-[1440px]:text-[#6f7882] min-[1440px]:mt-[4px] font-bold text-slate-400 mt-1 truncate hover:text-[#00b14f] transition-colors"
            title={job.profiles?.full_name}
          >
            {job.profiles?.full_name || "Đơn vị ẩn danh"}
          </p>


        </div>
      </div>

      {/* KHỐI CHÂN THẺ (CARD FOOTER) ĐÃ ĐƯỢC TIN GIẢN BẢN ĐỒ VÀ NÚT ỨNG TUYỂN */}
      <div className="mt-2.5 min-[1440px]:mt-[6px] pt-2.5 min-[1440px]:pt-0 flex items-center justify-between gap-3 min-[1440px]:h-[28px] min-[1440px]:w-[345px] min-[1440px]:gap-[4px] min-[1440px]:items-end">
        {/* TRÁI: VIÊN THUỐC THÔNG TIN ĐỊA HẠT ĐÀ NẴNG (ĐÃ ẨN BẢN ĐỒ) */}
        <div className="flex items-center gap-1.5 min-[1440px]:gap-[5px] flex-1 min-w-0 min-[1440px]:w-[313px] min-[1440px]:h-[24px]">
          <span className="text-[11px] min-[1440px]:text-[12px] min-[1440px]:font-medium min-[1440px]:leading-[16px] min-[1440px]:bg-[#edeff0] min-[1440px]:text-[#263a4d] min-[1440px]:px-[10px] min-[1440px]:py-[4px] min-[1440px]:rounded-[34px] font-bold bg-[#f4f5f6] text-[#263a4d] px-2.5 py-1 rounded-full truncate max-w-[150px] min-[1440px]:max-w-[140px]" title={job.benefits || "Thỏa thuận"}>
            {job.benefits || "Thỏa thuận"}
          </span>
          <span className="text-[11px] min-[1440px]:text-[12px] min-[1440px]:font-medium min-[1440px]:leading-[16px] min-[1440px]:bg-[#edeff0] min-[1440px]:text-[#263a4d] min-[1440px]:px-[10px] min-[1440px]:py-[4px] min-[1440px]:rounded-[34px] font-bold bg-[#f4f5f6] text-[#263a4d] px-2.5 py-1 rounded-full truncate max-w-[120px] min-[1440px]:max-w-[100px]" title={job.danang_wards?.name || job.location}>
            {job.danang_wards?.name ? `${job.danang_wards.name}` : (job.location || "Đà Nẵng")}
          </span>
        </div>

        {/* PHẢI: CỤM NÚT TƯƠNG TÁC TÁCH BIỆT (ĐÃ ẨN NÚT ỨNG TUYỂN CHỦ ĐỘNG) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(job.id);
            }}
            className={`w-8 h-8 min-[1440px]:w-[26px] min-[1440px]:h-[26px] min-[1440px]:rounded-[5px] flex items-center justify-center transition-all shrink-0 active:scale-90 ${isBookmarked
              ? "bg-rose-50 text-rose-500 hover:bg-rose-100"
              : "bg-transparent text-[#00b14f] hover:bg-slate-50"
              }`}
            title="Lưu việc làm"
          >
            <Heart className={`w-[18px] h-[18px] min-[1440px]:w-[15px] min-[1440px]:h-[15px] ${isBookmarked ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  )
}