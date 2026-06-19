import { Plus, Calendar, Activity, Users, Pencil, Trash2, MapPin, Briefcase, Tag, Award, Clock, ArrowLeft, FileText, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface OrgEventsTabProps {
  events: any[]
  fetching: boolean
  showForm: boolean
  setShowForm: (val: boolean | ((prev: boolean) => boolean)) => void
  resetForm: () => void
  totalEvents: number
  activeEvents: number
  selectedEvent: any
  setSelectedEvent: (val: any) => void
  loadingApps: boolean
  applications: any[]
  setViewingCV: (val: any) => void
  handleUpdateStatus: (appId: string, status: string) => void
  handleEditClick: (ev: any) => void
  handleDeleteEvent: (id: string) => void
  handleViewApplications: (ev: any) => void
}

export default function OrgEventsTab({
  events,
  fetching,
  showForm,
  setShowForm,
  resetForm,
  totalEvents,
  activeEvents,
  selectedEvent,
  setSelectedEvent,
  loadingApps,
  applications,
  setViewingCV,
  handleUpdateStatus,
  handleEditClick,
  handleDeleteEvent,
  handleViewApplications
}: OrgEventsTabProps) {
  return (
    <>
      {!selectedEvent && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Bảng điều khiển</h1>
              <p className="text-slate-500 font-medium mt-1">Quản lý các chiến dịch tuyển dụng và sự kiện của bạn.</p>
            </div>
            <Button
              onClick={() => showForm ? resetForm() : setShowForm(true)}
              className="rounded-2xl bg-slate-900 text-white hover:bg-slate-800 font-bold h-11 px-6 transition-transform active:scale-95 shadow-lg shadow-slate-900/20"
            >
              {showForm ? "Đóng Form" : <><Plus className="w-5 h-5 mr-1" /> Tạo sự kiện mới</>}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tổng sự kiện</p>
                <h3 className="text-2xl font-black text-slate-900">{totalEvents}</h3>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Đang mở đăng ký</p>
                <h3 className="text-2xl font-black text-slate-900">{activeEvents}</h3>
              </div>
            </div>
          </div>
        </>
      )}

      {!selectedEvent ? (
        <div className="bg-white rounded-[2rem] border-2 border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900">Danh sách sự kiện của bạn</h3>
          </div>
          <div className="p-6">
            {fetching ? (
              <div className="text-center py-8 text-slate-500 font-medium">Đang tải dữ liệu...</div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 font-medium">Bạn chưa tạo sự kiện nào.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {events.map((ev) => (
                  <div key={ev.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border-2 border-slate-100 hover:border-emerald-200 transition-colors group">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{ev.title}</h4>
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                          {ev.status === 'upcoming' ? 'Đang mở' : 'Đã đóng'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 font-medium line-clamp-1 mb-2">{ev.description}</p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-slate-400 mt-2">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {ev.location}</span>
                        <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {ev.position_type || "Tình nguyện viên"}</span>
                        <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> {ev.category || "Lễ hội"}</span>
                        <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Tuyển: {ev.slots_needed || 1} người</span>
                        {ev.application_deadline && (
                          <span className="flex items-center gap-1 text-rose-500 bg-rose-50/50 px-2 py-0.5 rounded border border-rose-100">
                            <Clock className="w-3.5 h-3.5" /> Hạn nộp: {new Date(ev.application_deadline).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-0 flex gap-2 shrink-0 flex-wrap items-center">
                      <Button onClick={() => handleViewApplications(ev)} variant="outline" className="rounded-xl border-slate-200 text-slate-700 font-bold hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                        <Users className="w-4 h-4 mr-2" /> Xem đơn nộp
                      </Button>
                      <Button onClick={() => handleEditClick(ev)} variant="outline" className="rounded-xl border-slate-200 text-slate-500 font-bold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors px-3" title="Chỉnh sửa sự kiện">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => handleDeleteEvent(ev.id)} variant="outline" className="rounded-xl border-slate-200 text-slate-500 font-bold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors px-3" title="Xóa sự kiện">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="animate-in slide-in-from-right-8 duration-300">
          <button onClick={() => setSelectedEvent(null)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Quay lại danh sách sự kiện
          </button>
          <div className="bg-white rounded-[2rem] border-2 border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-emerald-50/50">
              <h2 className="text-xl font-black text-slate-900">Hồ sơ ứng tuyển</h2>
              <p className="text-sm font-bold text-emerald-700 mt-1">Sự kiện: {selectedEvent.title}</p>
            </div>
            <div className="p-6">
              {loadingApps ? (
                <div className="text-center py-8 text-slate-500 font-medium">Đang tải hồ sơ...</div>
              ) : applications.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">Chưa có ứng viên nào nộp đơn vào sự kiện này.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {applications.map((app) => {
                    let statusBadge = null
                    if (app.status === 'pending') statusBadge = <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 shadow-none">Chờ duyệt</Badge>
                    else if (app.status === 'approved') statusBadge = <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 shadow-none">Đã duyệt</Badge>
                    else statusBadge = <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 shadow-none">Đã từ chối</Badge>

                    return (
                      <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 hover:bg-white hover:border-emerald-200 transition-colors">
                        <div className="flex items-center gap-4 mb-4 sm:mb-0">
                          <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                            <AvatarImage src={app.profiles?.avatar_url} />
                            <AvatarFallback className="bg-slate-200 text-slate-600 font-bold">{app.profiles?.full_name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="text-base font-bold text-slate-900">{app.profiles?.full_name || "Ứng viên ẩn danh"}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-xs font-medium text-slate-500">{app.profiles?.email}</p>
                              {statusBadge}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Button onClick={() => setViewingCV(app.profiles)} variant="secondary" className="rounded-xl font-bold h-10 px-4 hover:bg-slate-200"><FileText className="w-4 h-4 mr-1.5" /> Xem CV</Button>
                          {app.status === 'pending' && (
                            <>
                              <Button onClick={() => handleUpdateStatus(app.id, 'approved')} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-none h-10 font-bold px-4"><CheckCircle className="w-4 h-4" /></Button>
                              <Button onClick={() => handleUpdateStatus(app.id, 'rejected')} variant="outline" className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 shadow-none h-10 font-bold px-4"><XCircle className="w-4 h-4" /></Button>
                            </>
                          )}
                          {app.status !== 'pending' && (
                            <Button onClick={() => handleUpdateStatus(app.id, 'pending')} variant="ghost" className="text-slate-400 hover:text-slate-600 font-medium text-xs underline px-2">Hoàn tác</Button>
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
    </>
  )
}
