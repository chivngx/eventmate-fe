import { Edit2, Trash2, Users, Calendar, MapPin, Briefcase, Tag, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import CVViewModal from "./CVViewModal"
import { X } from "lucide-react"

interface OrgEventsTabProps {
  fetching: boolean
  events: any[]
  onEditClick: (ev: any) => void
  onDeleteEvent: (id: string) => void
  onViewApplications: (ev: any) => void
  selectedEvent: any | null
  loadingApps: boolean
  applications: any[]
  onUpdateStatus: (appId: string, status: string) => void
  viewingCV: any | null
  setViewingCV: (cv: any | null) => void
  onCloseAppsModal: () => void
}

export default function OrgEventsTab({
  fetching,
  events,
  onEditClick,
  onDeleteEvent,
  onViewApplications,
  selectedEvent,
  loadingApps,
  applications,
  onUpdateStatus,
  viewingCV,
  setViewingCV,
  onCloseAppsModal
}: OrgEventsTabProps) {

  if (fetching) return <div className="text-center py-10 text-slate-500 font-medium">Đang tải danh sách bài đăng...</div>

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[2rem] border-2 border-slate-100 p-6 sm:p-8 shadow-sm">
        <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
          📋 Danh sách chiến dịch tuyển dụng của bạn
        </h3>

        {events.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-2xl">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-bold text-base">Bạn chưa tạo chiến dịch tuyển dụng nào.</p>
            <p className="text-slate-400 text-sm mt-1">Nhấn nút "Tạo chiến dịch mới" ở góc trên để bắt đầu tìm kiếm nhân sự!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((job) => (
              <div key={job.id} className="border-2 border-slate-50 rounded-2xl p-5 bg-slate-50/30 hover:bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-300 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2">{job.title}</h4>
                    <Badge variant={job.status === 'upcoming' ? 'default' : 'secondary'} className={job.status === 'upcoming' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none font-bold text-[10px]' : 'font-bold text-[10px]'}>
                      {job.status === 'upcoming' ? 'Đang mở' : 'Đã hoàn thành'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mt-4 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {job.location || "Toàn quốc"}</span>
                    <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {job.position_type}</span>
                    <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {job.category}</span>
                    <span className="flex items-center gap-1 text-rose-600"><Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" /> Hạn: {job.application_deadline ? new Date(job.application_deadline).toLocaleDateString('vi-VN') : 'Không rõ'}</span>
                  </div>

                  <div className="mt-3 bg-slate-50 rounded-xl p-3 border border-slate-100/50 text-xs font-bold text-slate-600 flex justify-between">
                    <span>Cần tuyển: <strong className="text-slate-900">{job.slots_needed} vị trí</strong></span>
                    <span className="text-emerald-600">Quyền lợi: {job.benefits}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3 mt-1">
                  <Button onClick={() => onViewApplications(job)} variant="outline" className="rounded-xl border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-bold text-xs h-9 px-3 flex items-center gap-1">
                    <Users className="w-4 h-4" /> Xem ứng viên
                  </Button>
                  <div className="flex items-center gap-1">
                    <Button onClick={() => onEditClick(job)} variant="ghost" className="h-9 w-9 p-0 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => onDeleteEvent(job.id)} variant="ghost" className="h-9 w-9 p-0 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="bg-slate-50 p-6 flex items-center justify-between border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">📩 Danh sách ứng viên ứng tuyển</h3>
                <p className="text-xs font-bold text-indigo-600 mt-0.5">Sự kiện: {selectedEvent.title}</p>
              </div>
              <button onClick={onCloseAppsModal} className="p-2 text-slate-400 hover:text-slate-800 bg-white rounded-full border border-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {loadingApps ? (
                <div className="text-center py-10 font-medium text-slate-500">Đang tải hồ sơ ứng viên...</div>
              ) : applications.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-bold">Chưa có ứng viên nào nộp đơn vào sự kiện này.</div>
              ) : (
                <div className="space-y-3">
                  {applications.map((app) => {
                    const student = app.profiles
                    return (
                      <div key={app.id} className="border-2 border-slate-50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/20">
                        <div>
                          <h4 className="font-bold text-slate-900 text-base">{student?.full_name || "Ứng viên ẩn danh"}</h4>
                          <p className="text-xs text-slate-400 font-bold mt-0.5">{student?.university || "Chưa cập nhật trường học"} • {student?.email}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {student?.skills ? student.skills.split(',').map((s: string) => (
                              <Badge key={s} variant="secondary" className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 border-none">{s.trim()}</Badge>
                            )) : <span className="text-[10px] font-bold text-slate-400">Chưa bổ sung kỹ năng</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <Button onClick={() => setViewingCV(student)} size="sm" variant="outline" className="rounded-xl font-bold text-xs h-9">Xem CV</Button>
                          {app.status === 'pending' ? (
                            <>
                              <Button onClick={() => onUpdateStatus(app.id, 'approved')} size="sm" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9">Duyệt nhận</Button>
                              <Button onClick={() => onUpdateStatus(app.id, 'rejected')} size="sm" variant="ghost" className="rounded-xl text-rose-500 hover:bg-rose-50 font-bold text-xs h-9">Từ chối</Button>
                            </>
                          ) : (
                            <Badge className={`font-black text-xs px-3 py-1.5 rounded-xl border ${app.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-100'
                              }`}>
                              {app.status === 'approved' ? '✓ Đã tiếp nhận' : '✕ Từ chối'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ĐÃ SỬA: Đổi tên prop từ student thành viewingCV khớp 100% định dạng file gốc */}
      <CVViewModal viewingCV={viewingCV} onClose={() => setViewingCV(null)} />
    </div>
  )
}