import { Edit2, Trash2, Users, Calendar, MapPin, Briefcase, Tag, Clock } from "lucide-react"
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

  if (fetching) return <div className="text-center py-10 text-slate-500 font-medium">Đang tải danh sách bài đăng...</div>

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm">
        <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
          📋 Danh sách chiến dịch tuyển dụng của bạn
        </h3>

        {events.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-bold text-base">Bạn chưa tạo chiến dịch tuyển dụng nào.</p>
            <p className="text-slate-400 dark:text-slate-550 text-sm mt-1">Nhấn nút "Tạo chiến dịch mới" ở góc trên để bắt đầu tìm kiếm nhân sự!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((job) => (
              <div key={job.id} className="border-2 border-slate-50 dark:border-slate-800/80 rounded-2xl p-5 bg-slate-50/30 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 hover:border-emerald-250 dark:hover:border-emerald-900 hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-300 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-base leading-snug line-clamp-2">{job.title}</h4>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge variant={job.status === 'upcoming' ? 'default' : 'secondary'} className={job.status === 'upcoming' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-450 hover:bg-emerald-100 border-none font-bold text-[10px]' : 'font-bold text-[10px]'}>
                        {job.status === 'upcoming' ? 'Đang mở' : 'Đã hoàn thành'}
                      </Badge>
                      {job.applications && job.applications.length > 0 && (
                        <Badge className="bg-amber-100 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border-none font-bold text-[10px] whitespace-nowrap">
                          {job.applications.length} ứng viên
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mt-4 text-xs font-bold text-slate-500 dark:text-slate-450">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-550 shrink-0" /> {job.location || "Toàn quốc"}</span>
                    <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-slate-400 dark:text-slate-550 shrink-0" /> {job.position_type}</span>
                    <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5 text-slate-400 dark:text-slate-550 shrink-0" /> {job.category}</span>
                    <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400"><Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" /> Hạn: {job.application_deadline ? new Date(job.application_deadline).toLocaleDateString('vi-VN') : 'Không rõ'}</span>
                  </div>

                  <div className="mt-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100/50 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-350 flex justify-between">
                    <span>Cần tuyển: <strong className="text-slate-900 dark:text-slate-100">{job.slots_needed} vị trí</strong></span>
                    <span className="text-emerald-600 dark:text-emerald-400">Quyền lợi: {job.benefits}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 pt-3 mt-1">
                  <Button onClick={() => onViewApplications(job)} variant="outline" className="rounded-xl border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 font-bold text-xs h-9 px-3 flex items-center gap-1">
                    <Users className="w-4 h-4" /> Xem ứng viên {job.applications && job.applications.length > 0 && `(${job.applications.length})`}
                  </Button>
                  <div className="flex items-center gap-1">
                    <Button onClick={() => onEditClick(job)} variant="ghost" className="h-9 w-9 p-0 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => onDeleteEvent(job.id)} variant="ghost" className="h-9 w-9 p-0 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}