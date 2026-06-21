import { ArrowLeft, Calendar, MapPin, FileText, MessageSquare, CheckCircle, XCircle, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface OrgEventApplicationsDetailProps {
  event: any
  applications: any[]
  loadingApps: boolean
  onBack: () => void
  setViewingCV: (cv: any) => void
  handleUpdateStatus: (appId: string, status: string) => void
  onStartChatWithStudent: (eventId: string, studentId: string) => void
  onRateStudent: (eventId: string, studentId: string, studentName: string) => void
}

export default function OrgEventApplicationsDetail({
  event,
  applications,
  loadingApps,
  onBack,
  setViewingCV,
  handleUpdateStatus,
  onStartChatWithStudent,
  onRateStudent
}: OrgEventApplicationsDetailProps) {
  if (!event) return null

  return (
    <div className="space-y-6">
      {/* Nút quay lại và Tiêu đề */}
      <div className="flex items-center gap-3">
        <Button
          onClick={onBack}
          variant="outline"
          className="rounded-xl border-slate-200 hover:bg-slate-50 font-bold text-xs h-9 px-3 flex items-center gap-1 shrink-0"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </Button>
        <div className="min-w-0">
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 truncate">
            Ứng viên của sự kiện
          </h2>
        </div>
      </div>

      {/* Thông tin Sự kiện Tóm tắt */}
      <div className="bg-slate-900 text-white rounded-[2rem] p-6 sm:p-8 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3 opacity-70"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-emerald-600 hover:bg-emerald-600 border-none font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">
                {event.position_type || "Vị trí tuyển"}
              </Badge>
              {event.status === 'upcoming' ? (
                <Badge className="bg-blue-600 hover:bg-blue-600 border-none font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">Đang mở tuyển</Badge>
              ) : (
                <Badge className="bg-slate-700 hover:bg-slate-700 border-none font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">Đã hoàn thành</Badge>
              )}
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white leading-tight">{event.title}</h1>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-slate-350 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {event.location || "Đà Nẵng"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                Ngày diễn ra: {event.event_date ? new Date(event.event_date).toLocaleDateString('vi-VN') : 'Chưa xác định'}
              </span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:w-48 shrink-0 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-450 uppercase tracking-wider">Cần tuyển</p>
              <h3 className="text-2xl font-black text-white mt-0.5">{event.slots_needed || 1} vị trí</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-450 shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách Ứng viên */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800/80 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            📩 Đơn ứng tuyển đã nhận ({applications.length})
          </h3>
        </div>

        <div className="p-6 sm:p-8">
          {loadingApps ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400 font-medium">Đang tải hồ sơ ứng viên...</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem]">
              <Users className="w-12 h-12 text-slate-300 dark:text-slate-655 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Chưa có ứng viên nộp đơn</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Hồ sơ ứng tuyển của sinh viên vào sự kiện này sẽ xuất hiện tại đây.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {applications.map((app) => {
                const student = app.profiles
                const displayName = student?.full_name || "Ứng viên ẩn danh"

                let statusBadge = null
                if (app.status === 'pending') {
                  statusBadge = <Badge className="bg-amber-55 text-amber-700 border-none shadow-none font-bold text-[10px]">Chờ duyệt</Badge>
                } else if (app.status === 'approved') {
                  statusBadge = <Badge className="bg-emerald-50 text-emerald-700 border-none shadow-none font-bold text-[10px]">Trúng tuyển</Badge>
                } else {
                  statusBadge = <Badge className="bg-rose-50 text-rose-700 border-none shadow-none font-bold text-[10px]">Chưa phù hợp</Badge>
                }

                // Match Score Calculation
                const getCandidateMatchScore = () => {
                  const userSkills = student?.skills
                  if (!userSkills) return null
                  const skills = userSkills.split(",").map((s: string) => s.trim().toLowerCase()).filter(Boolean)
                  if (skills.length === 0) return null

                  const searchText = `${event.title || ""} ${event.description || ""} ${event.category || ""} ${event.position_type || ""}`.toLowerCase()
                  let matches = 0
                  skills.forEach((skill: string) => {
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

                const candidateMatchScore = getCandidateMatchScore()

                return (
                  <div
                    key={app.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 hover:border-emerald-250 dark:hover:border-emerald-900 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                      <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-800 shadow-sm shrink-0">
                        <AvatarImage src={student?.avatar_url} />
                        <AvatarFallback className="bg-slate-200 dark:bg-slate-800 text-slate-655 dark:text-slate-300 font-bold">
                          {displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{displayName}</h4>
                          {candidateMatchScore !== null && (
                            <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/50">
                              🔥 Match: {candidateMatchScore}%
                            </span>
                          )}
                        </div>
                        
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {student?.university || "Chưa cập nhật trường học"}
                        </p>
                        
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">{student?.email}</span>
                          <span className="text-slate-200 dark:text-slate-800">|</span>
                          <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Nộp ngày {new Date(app.applied_at).toLocaleDateString('vi-VN')}</span>
                          <span className="text-slate-200 dark:text-slate-800">|</span>
                          {statusBadge}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      <Button
                        onClick={() => setViewingCV(student)}
                        variant="secondary"
                        className="rounded-xl font-bold h-10 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350"
                      >
                        <FileText className="w-4 h-4 mr-1.5" /> Xem CV
                      </Button>
                      
                      <Button
                        onClick={() => onStartChatWithStudent(event.id, student.id)}
                        variant="outline"
                        className="rounded-xl font-bold h-10 px-4 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-755 dark:text-slate-300 flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-500" /> Nhắn tin
                      </Button>

                      {app.status === 'approved' && event.status === 'completed' && (
                        <Button
                          onClick={() => onRateStudent(event.id, student.id, displayName)}
                          className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-none h-10 font-bold px-4 flex items-center gap-1 text-xs"
                        >
                          ⭐ Đánh giá
                        </Button>
                      )}

                      {app.status === 'pending' ? (
                        <div className="flex items-center gap-1.5">
                          <Button
                            onClick={() => handleUpdateStatus(app.id, 'approved')}
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-none h-10 font-bold px-4 flex items-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" /> Duyệt
                          </Button>
                          <Button
                            onClick={() => handleUpdateStatus(app.id, 'rejected')}
                            variant="outline"
                            className="rounded-xl border-rose-200 dark:border-rose-900/30 text-rose-600 hover:bg-rose-50 hover:text-rose-700 shadow-none h-10 font-bold px-4 flex items-center gap-1"
                          >
                            <XCircle className="w-4 h-4" /> Từ chối
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleUpdateStatus(app.id, 'pending')}
                          variant="ghost"
                          className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-bold text-xs underline px-2"
                        >
                          Hoàn tác
                        </Button>
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
  )
}
