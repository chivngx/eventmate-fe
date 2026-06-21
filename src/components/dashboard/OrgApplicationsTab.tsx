import { Users, FileText, CheckCircle, XCircle, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface OrgApplicationsTabProps {
  events: any[]
  selectedFilterEventId: string
  setSelectedFilterEventId: (val: string) => void
  loadingAllApps: boolean
  allApplications: any[]
  setViewingCV: (cv: any) => void
  handleUpdateStatus: (appId: string, status: string) => void
  onStartChatWithStudent: (eventId: string, studentId: string) => void
  onRateStudent: (eventId: string, studentId: string, studentName: string) => void
}

export default function OrgApplicationsTab({
  events,
  selectedFilterEventId,
  setSelectedFilterEventId,
  loadingAllApps,
  allApplications,
  setViewingCV,
  handleUpdateStatus,
  onStartChatWithStudent,
  onRateStudent
}: OrgApplicationsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">Quản lý ứng viên</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Duyệt hồ sơ và phản hồi kết quả cho các ứng viên nộp đơn.</p>
        </div>
        {/* Dropdown lọc theo sự kiện */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Lọc sự kiện:</span>
          <select
            value={selectedFilterEventId}
            onChange={e => setSelectedFilterEventId(e.target.value)}
            className="h-10 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">Tất cả sự kiện</option>
            {events.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800/80 shadow-sm overflow-hidden">
        <div className="p-6">
          {loadingAllApps ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400 font-medium">Đang tải hồ sơ ứng viên...</div>
          ) : (
            (() => {
              const filteredApps = allApplications.filter(app =>
                selectedFilterEventId === "all" || app.event_id === selectedFilterEventId
              )

              if (filteredApps.length === 0) {
                return (
                  <div className="text-center py-16 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem]">
                    <Users className="w-12 h-12 text-slate-300 dark:text-slate-655 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Chưa có ứng viên</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Không tìm thấy hồ sơ ứng tuyển nào khớp với bộ lọc.</p>
                  </div>
                )
              }

              return (
                <div className="grid grid-cols-1 gap-4">
                  {filteredApps.map((app) => {
                    let statusBadge = null
                    if (app.status === 'pending') statusBadge = <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400 border-none shadow-none font-bold text-[10px]">Chờ duyệt</Badge>
                    else if (app.status === 'approved') statusBadge = <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 border-none shadow-none font-bold text-[10px]">Đã duyệt</Badge>
                    else statusBadge = <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-455 border-none shadow-none font-bold text-[10px]">Đã từ chối</Badge>

                    const getCandidateMatchScore = () => {
                      const userSkills = app.profiles?.skills
                      if (!userSkills) return null
                      const skills = userSkills.split(",").map((s: string) => s.trim().toLowerCase()).filter(Boolean)
                      if (skills.length === 0) return null

                      const searchText = `${app.events?.title || ""} ${app.events?.description || ""} ${app.events?.category || ""} ${app.events?.position_type || ""}`.toLowerCase()
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
                      <div key={app.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 hover:border-emerald-250 dark:hover:border-emerald-900 transition-colors">
                        <div className="flex items-center gap-4 mb-4 md:mb-0">
                          <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-800 shadow-sm shrink-0">
                            <AvatarImage src={app.profiles?.avatar_url} />
                            <AvatarFallback className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">{app.profiles?.full_name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{app.profiles?.full_name || "Ứng viên ẩn danh"}</h4>
                              {candidateMatchScore !== null && (
                                <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/50">
                                  🔥 Match: {candidateMatchScore}%
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5">Ứng tuyển vào: <span className="font-bold text-emerald-600 dark:text-emerald-400">{app.events?.title}</span></p>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{app.profiles?.email}</span>
                              <span className="text-slate-200 dark:text-slate-800">|</span>
                              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Nộp ngày {new Date(app.applied_at).toLocaleDateString('vi-VN')}</span>
                              <span className="text-slate-200 dark:text-slate-800">|</span>
                              {statusBadge}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                          <Button onClick={() => setViewingCV(app.profiles)} variant="secondary" className="rounded-xl font-bold h-10 px-4 bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350"><FileText className="w-4 h-4 mr-1.5" /> Xem CV</Button>
                          <Button
                            onClick={() => onStartChatWithStudent(app.event_id, app.student_id)}
                            variant="outline"
                            className="rounded-xl font-bold h-10 px-4 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                          >
                            <MessageSquare className="w-4 h-4 text-emerald-500" /> Nhắn tin
                          </Button>
                          {app.status === 'approved' && app.events?.status === 'completed' && (
                            <Button
                              onClick={() => onRateStudent(app.event_id, app.student_id, app.profiles?.full_name || "Ứng viên")}
                              className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-none h-10 font-bold px-4 flex items-center gap-1 text-xs"
                            >
                              ⭐ Đánh giá
                            </Button>
                          )}
                          {app.status === 'pending' ? (
                            <>
                              <Button onClick={() => handleUpdateStatus(app.id, 'approved')} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-none h-10 font-bold px-4"><CheckCircle className="w-4 h-4" /></Button>
                              <Button onClick={() => handleUpdateStatus(app.id, 'rejected')} variant="outline" className="rounded-xl border-rose-200 dark:border-rose-900/30 text-rose-600 hover:bg-rose-50 hover:text-rose-700 shadow-none h-10 font-bold px-4"><XCircle className="w-4 h-4" /></Button>
                            </>
                          ) : (
                            <Button onClick={() => handleUpdateStatus(app.id, 'pending')} variant="ghost" className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-medium text-xs underline px-2">Hoàn tác</Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()
          )}
        </div>
      </div>
    </div>
  )
}
