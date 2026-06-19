import { Users, FileText, CheckCircle, XCircle } from "lucide-react"
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
}

export default function OrgApplicationsTab({
  events,
  selectedFilterEventId,
  setSelectedFilterEventId,
  loadingAllApps,
  allApplications,
  setViewingCV,
  handleUpdateStatus
}: OrgApplicationsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Quản lý ứng viên</h1>
          <p className="text-slate-500 font-medium mt-1">Duyệt hồ sơ và phản hồi kết quả cho các ứng viên nộp đơn.</p>
        </div>
        {/* Dropdown lọc theo sự kiện */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-bold text-slate-500">Lọc sự kiện:</span>
          <select
            value={selectedFilterEventId}
            onChange={e => setSelectedFilterEventId(e.target.value)}
            className="h-10 rounded-xl bg-white border-2 border-slate-200 px-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">Tất cả sự kiện</option>
            {events.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border-2 border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6">
          {loadingAllApps ? (
            <div className="text-center py-12 text-slate-500 font-medium">Đang tải hồ sơ ứng viên...</div>
          ) : (
            (() => {
              const filteredApps = allApplications.filter(app =>
                selectedFilterEventId === "all" || app.event_id === selectedFilterEventId
              )

              if (filteredApps.length === 0) {
                return (
                  <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-[2rem]">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-700">Chưa có ứng viên</h3>
                    <p className="text-slate-500 font-medium mt-1">Không tìm thấy hồ sơ ứng tuyển nào khớp với bộ lọc.</p>
                  </div>
                )
              }

              return (
                <div className="grid grid-cols-1 gap-4">
                  {filteredApps.map((app) => {
                    let statusBadge = null
                    if (app.status === 'pending') statusBadge = <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 shadow-none">Chờ duyệt</Badge>
                    else if (app.status === 'approved') statusBadge = <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 shadow-none">Đã duyệt</Badge>
                    else statusBadge = <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 shadow-none">Đã từ chối</Badge>

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
                      <div key={app.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 hover:bg-white hover:border-emerald-200 transition-colors">
                        <div className="flex items-center gap-4 mb-4 md:mb-0">
                          <Avatar className="h-12 w-12 border-2 border-white shadow-sm shrink-0">
                            <AvatarImage src={app.profiles?.avatar_url} />
                            <AvatarFallback className="bg-slate-200 text-slate-600 font-bold">{app.profiles?.full_name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-base font-bold text-slate-900">{app.profiles?.full_name || "Ứng viên ẩn danh"}</h4>
                              {candidateMatchScore !== null && (
                                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-200">
                                  🔥 Match: {candidateMatchScore}%
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">Ứng tuyển vào: <span className="font-bold text-emerald-600">{app.events?.title}</span></p>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              <span className="text-xs font-semibold text-slate-500">{app.profiles?.email}</span>
                              <span className="text-slate-200">|</span>
                              <span className="text-xs font-bold text-slate-400">Nộp ngày {new Date(app.applied_at).toLocaleDateString('vi-VN')}</span>
                              <span className="text-slate-200">|</span>
                              {statusBadge}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                          <Button onClick={() => setViewingCV(app.profiles)} variant="secondary" className="rounded-xl font-bold h-10 px-4 hover:bg-slate-200"><FileText className="w-4 h-4 mr-1.5" /> Xem CV</Button>
                          {app.status === 'pending' ? (
                            <>
                              <Button onClick={() => handleUpdateStatus(app.id, 'approved')} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-none h-10 font-bold px-4"><CheckCircle className="w-4 h-4" /></Button>
                              <Button onClick={() => handleUpdateStatus(app.id, 'rejected')} variant="outline" className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 shadow-none h-10 font-bold px-4"><XCircle className="w-4 h-4" /></Button>
                            </>
                          ) : (
                            <Button onClick={() => handleUpdateStatus(app.id, 'pending')} variant="ghost" className="text-slate-400 hover:text-slate-600 font-medium text-xs underline px-2">Hoàn tác</Button>
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
