import { X, Phone, GraduationCap, Sparkles } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface CVViewModalProps {
  viewingCV: any
  onClose: () => void
}

export default function CVViewModal({ viewingCV, onClose }: CVViewModalProps) {
  if (!viewingCV) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-slate-50 p-6 flex items-start justify-between border-b border-slate-100">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
              <AvatarImage src={viewingCV.avatar_url} />
              <AvatarFallback className="bg-slate-200 text-slate-600 font-bold text-xl">
                {viewingCV.full_name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-black text-slate-900">{viewingCV.full_name || "Ứng viên ẩn danh"}</h3>
              <p className="text-sm font-medium text-slate-500 mt-0.5">{viewingCV.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 bg-white rounded-full border border-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Điện thoại
              </p>
              <p className="font-semibold text-slate-900">{viewingCV.phone || "Chưa cập nhật"}</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" /> Học vấn
              </p>
              <p className="font-semibold text-slate-900 truncate" title={viewingCV.university}>
                {viewingCV.university || "Chưa cập nhật"}
              </p>
            </div>
          </div>
          
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Kỹ năng
            </p>
            <div className="flex flex-wrap gap-2">
              {viewingCV.skills ? (
                viewingCV.skills.split(',').map((skill: string, i: number) => (
                  <Badge key={i} className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shadow-none px-3 py-1 text-xs">
                    {skill.trim()}
                  </Badge>
                ))
              ) : (
                <p className="text-sm font-medium text-slate-500 italic">Ứng viên chưa nhập kỹ năng.</p>
              )}
            </div>
          </div>
          
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Giới thiệu bản thân</p>
            <div className="bg-slate-50 rounded-2xl p-4 text-sm font-medium text-slate-700 leading-relaxed">
              {viewingCV.bio || <span className="italic text-slate-400">Không có giới thiệu.</span>}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <Button onClick={onClose} className="bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-bold px-6">Đóng</Button>
        </div>
      </div>
    </div>
  )
}
