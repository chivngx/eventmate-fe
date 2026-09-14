"use client"

import { X, Phone, GraduationCap, Sparkles, Shirt, Ruler, ShieldCheck } from "lucide-react"
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
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-xl shadow-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-slate-50 p-6 flex items-start justify-between border-b border-slate-200">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border border-slate-200 shadow-sm">
              <AvatarImage src={viewingCV.avatar_url} />
              <AvatarFallback className="bg-slate-200 text-slate-600 font-bold text-xl">
                {viewingCV.full_name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{viewingCV.full_name || "Người tham gia ẩn danh"}</h3>
              <p className="text-sm font-medium text-slate-500 mt-0.5">{viewingCV.email}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Đóng" className="p-2 text-slate-500 hover:text-slate-700 bg-white rounded-full border border-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> Liên hệ / Zalo
              </p>
              <p className="font-semibold text-slate-900 text-sm truncate">{viewingCV.zalo_phone || viewingCV.phone || "Chưa cập nhật"}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Shirt className="w-3.5 h-3.5" /> Size áo
              </p>
              <p className="font-semibold text-slate-900 text-sm">{viewingCV.shirt_size ? `Size ${viewingCV.shirt_size}` : "Chưa cập nhật"}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Ruler className="w-3.5 h-3.5" /> Chiều cao
              </p>
              <p className="font-semibold text-slate-900 text-sm">{viewingCV.height ? `${viewingCV.height} cm` : "Chưa cập nhật"}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Uy tín
              </p>
              <p className="font-semibold text-emerald-600 text-sm">{viewingCV.reliability_score ?? 100}/100</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" /> Học vấn / Trường
            </p>
            <p className="font-semibold text-slate-900 text-sm truncate" title={viewingCV.university}>
              {viewingCV.university || "Chưa cập nhật"}
            </p>
          </div>
          
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Kỹ năng
            </p>
            <div className="flex flex-wrap gap-2">
              {viewingCV.skills ? (
                viewingCV.skills.split(',').map((skill: string, i: number) => (
                  <Badge key={i} className="bg-slate-100 text-slate-600 hover:bg-slate-100 shadow-none px-3 py-1 text-xs">
                    {skill.trim()}
                  </Badge>
                ))
              ) : (
                <p className="text-sm font-medium text-slate-500 italic">Người tham gia chưa nhập kỹ năng.</p>
              )}
            </div>
          </div>
          
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Giới thiệu bản thân</p>
            <div className="bg-slate-50 rounded-2xl p-4 text-sm font-medium text-slate-700 leading-relaxed">
              {viewingCV.bio || <span className="italic text-slate-500">Không có giới thiệu.</span>}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <Button onClick={onClose} className="bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-bold px-6">Đóng</Button>
        </div>
      </div>
    </div>
  )
}
