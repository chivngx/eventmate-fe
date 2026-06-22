import { Edit2, Trash2, Users, Calendar, MapPin, Briefcase, Tag, Clock, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface OrgEventsTabProps {
  fetching: boolean
  events: any[]
  onEditClick: (ev: any) => void
  onDeleteEvent: (id: string) => void
  onViewApplications: (ev: any) => void
}

export default function OrgEventsTab({
  fetching,
  events,
  onEditClick,
  onDeleteEvent,
  onViewApplications
}: OrgEventsTabProps) {

  if (fetching) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
    </div>
  )

  if (events.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-150 dark:border-slate-800 rounded-[2rem] max-w-xl mx-auto shadow-sm p-8 space-y-4">
        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-850 rounded-2xl flex items-center justify-center text-slate-400 mx-auto">
          <Calendar className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Chưa có tin tuyển dụng</h3>
          <p className="text-slate-500 text-xs font-semibold">
            Bắt đầu tạo bài tuyển dụng tình nguyện viên đầu tiên để tiếp cận hàng ngàn sinh viên tài năng tại Đà Nẵng!
          </p>
        </div>
        <p className="text-[10px] text-slate-400 font-bold">Hãy nhấp vào nút "Tạo chiến dịch mới" để tiếp tục.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
      {events.map((job) => {
        const candidateCount = job.applications?.length || 0

        return (
          <div
            key={job.id}
            className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800/80 rounded-[2rem] p-6 hover:border-emerald-300 dark:hover:border-emerald-800 hover:shadow-xl transition-all duration-300 flex flex-col justify-between gap-6 shadow-sm relative group overflow-hidden"
          >
            {/* Top Indicator Gradient Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="space-y-4">
              {/* Header: Title and Status Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] font-black tracking-widest text-emerald-600 dark:text-emerald-450 uppercase flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {job.category}
                  </span>
                  <h4 className="font-black text-slate-900 dark:text-slate-100 text-lg leading-snug line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-450 transition-colors">
                    {job.title}
                  </h4>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <Badge
                    className={`border-none font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full ${job.status === 'upcoming'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                  >
                    {job.status === 'upcoming' ? 'Đang mở tuyển' : 'Đã đóng'}
                  </Badge>

                  {candidateCount > 0 && (
                    <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-none font-black text-[10px] rounded-full">
                      {candidateCount} hồ sơ
                    </Badge>
                  )}
                </div>
              </div>

              {/* Grid detail metrics */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-850/50 rounded-2xl border border-slate-100/50 dark:border-slate-800/80 text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-2 truncate">
                  <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                  {job.location || "Đà Nẵng"}
                </span>
                <span className="flex items-center gap-2 truncate">
                  <Briefcase className="w-4 h-4 text-slate-400 dark:text-slate-550 shrink-0" />
                  {job.position_type}
                </span>
                <span className="flex items-center gap-2 truncate col-span-2 text-rose-600 dark:text-rose-450">
                  <Clock className="w-4 h-4 text-rose-500 shrink-0" />
                  Hạn ứng tuyển: {job.application_deadline ? new Date(job.application_deadline).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                </span>
              </div>

              {/* Slots and benefits badge */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold pt-1">
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-xl flex items-center gap-1">
                  Cần tuyển: <strong className="text-slate-900 dark:text-white font-extrabold">{job.slots_needed}</strong>
                </span>
                <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-xl flex items-center gap-1 border border-emerald-100/40">
                  <Award className="w-3.5 h-3.5" /> {job.benefits}
                </span>
              </div>
            </div>

            {/* Actions panel */}
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-2">
              <Button
                onClick={() => onViewApplications(job)}
                className="rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 font-black text-xs h-10 px-4 flex items-center gap-1.5 shadow-sm active:scale-98 transition-all border border-emerald-250/20"
              >
                <Users className="w-4 h-4" />
                Xem hồ sơ ứng viên
              </Button>

              <div className="flex items-center gap-1.5">
                <Button
                  onClick={() => onEditClick(job)}
                  variant="ghost"
                  className="h-10 w-10 p-0 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/80 border dark:border-slate-800/80"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>

                <Button
                  onClick={() => onDeleteEvent(job.id)}
                  variant="ghost"
                  className="h-10 w-10 p-0 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

          </div>
        )
      })}
    </div>
  )
}