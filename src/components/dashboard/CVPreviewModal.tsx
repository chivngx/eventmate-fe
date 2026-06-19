import { X, Mail, Phone, GraduationCap, Sparkles, Printer, User, Award } from "lucide-react"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface CVPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  profile: {
    full_name: string
    email: string
    avatar_url?: string
    phone?: string
    university?: string
    bio?: string
    skills?: string
    cv_completion_percent?: number
  }
}

type ThemeAccent = "emerald" | "blue" | "violet"

export default function CVPreviewModal({ isOpen, onClose, profile }: CVPreviewModalProps) {
  const [accent, setAccent] = useState<ThemeAccent>("emerald")

  if (!isOpen) return null

  const getAccentClass = () => {
    switch (accent) {
      case "blue":
        return {
          bg: "bg-blue-600",
          text: "text-blue-600",
          border: "border-blue-600",
          lightBg: "bg-blue-50",
          badge: "bg-blue-50 text-blue-700 border-blue-100",
        }
      case "violet":
        return {
          bg: "bg-violet-600",
          text: "text-violet-600",
          border: "border-violet-600",
          lightBg: "bg-violet-50",
          badge: "bg-violet-50 text-violet-700 border-violet-100",
        }
      default:
        return {
          bg: "bg-emerald-600",
          text: "text-emerald-600",
          border: "border-emerald-600",
          lightBg: "bg-emerald-50",
          badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
        }
    }
  }

  const classes = getAccentClass()
  const skillList = profile.skills
    ? profile.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : []

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Container chính */}
      <div className="relative w-full max-w-4xl bg-slate-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:rounded-none print:w-full print:bg-white">
        
        {/* THANH ĐIỀU KHIỂN TRÊN - ẨN KHI IN */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-slate-200 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <h3 className="font-black text-slate-800 text-lg">Mẫu CV Cá Nhân</h3>
            {/* Bộ chọn Accent Color */}
            <div className="flex items-center gap-1.5 ml-4 bg-slate-100 p-1 rounded-full">
              <button
                onClick={() => setAccent("emerald")}
                className={`w-5 h-5 rounded-full bg-emerald-500 border-2 transition-transform ${
                  accent === "emerald" ? "border-slate-800 scale-110" : "border-transparent"
                }`}
                title="Xanh lá"
              />
              <button
                onClick={() => setAccent("blue")}
                className={`w-5 h-5 rounded-full bg-blue-500 border-2 transition-transform ${
                  accent === "blue" ? "border-slate-800 scale-110" : "border-transparent"
                }`}
                title="Xanh dương"
              />
              <button
                onClick={() => setAccent("violet")}
                className={`w-5 h-5 rounded-full bg-violet-500 border-2 transition-transform ${
                  accent === "violet" ? "border-slate-800 scale-110" : "border-transparent"
                }`}
                title="Tím hồng"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              className="rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs h-9 px-4 flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> In / Tải PDF
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PHẦN NỘI DUNG CV - ĐƯỢC THIẾT KẾ ĐỂ IN VỪA VẶN KHỔ A4 */}
        <div className="flex-1 overflow-y-auto p-8 print:p-0 print:overflow-visible">
          <div className="bg-white mx-auto shadow-sm border border-slate-200 w-full max-w-[210mm] min-h-[297mm] p-10 flex flex-col gap-8 rounded-2xl print:border-none print:shadow-none print:rounded-none print:p-0 print:max-w-none">
            
            {/* Header CV */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 border-b pb-8 border-slate-100">
              <Avatar className="h-24 w-24 rounded-2xl border-4 border-slate-100 shadow-md shrink-0">
                <AvatarImage src={profile.avatar_url} className="object-cover" />
                <AvatarFallback className={`${classes.bg} text-white font-black text-3xl rounded-2xl`}>
                  {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : <User className="w-10 h-10" />}
                </AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left flex-1 space-y-1.5">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{profile.full_name}</h1>
                <p className={`text-sm font-black uppercase tracking-widest ${classes.text}`}>Ứng viên năng động</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1.5 text-xs font-bold text-slate-500 pt-2">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {profile.email}
                  </span>
                  {profile.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> {profile.phone}
                    </span>
                  )}
                  {profile.university && (
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5" /> {profile.university}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Thân CV */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 flex-1">
              
              {/* Cột trái (Thông tin bổ trợ) */}
              <div className="md:col-span-4 space-y-6 border-r border-slate-100 pr-6 print:col-span-4">
                
                {/* Học vấn */}
                {profile.university && (
                  <div className="space-y-3">
                    <h3 className={`text-sm font-black uppercase tracking-wider ${classes.text} border-b pb-1.5 ${classes.border}`}>
                      Học Vấn
                    </h3>
                    <div className="space-y-1">
                      <p className="text-sm font-black text-slate-800">{profile.university}</p>
                      <p className="text-xs font-bold text-slate-400">Sinh viên chính quy</p>
                    </div>
                  </div>
                )}

                {/* Kỹ năng */}
                {skillList.length > 0 && (
                  <div className="space-y-3">
                    <h3 className={`text-sm font-black uppercase tracking-wider ${classes.text} border-b pb-1.5 ${classes.border}`}>
                      Kỹ Năng
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {skillList.map((skill, index) => (
                        <span
                          key={index}
                          className={`text-[10px] font-black px-2 py-0.5 rounded border ${classes.badge}`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cam kết / Mục tiêu */}
                <div className="space-y-3">
                  <h3 className={`text-sm font-black uppercase tracking-wider ${classes.text} border-b pb-1.5 ${classes.border}`}>
                    Chứng nhận
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Award className={`w-4 h-4 shrink-0 ${classes.text}`} />
                    <span>Chứng chỉ hoạt động tích cực (EventMate)</span>
                  </div>
                </div>
              </div>

              {/* Cột phải (Thông tin chính) */}
              <div className="md:col-span-8 space-y-6 print:col-span-8">
                
                {/* Giới thiệu bản thân */}
                <div className="space-y-3">
                  <h3 className={`text-sm font-black uppercase tracking-wider ${classes.text} border-b pb-1.5 ${classes.border} flex items-center gap-1.5`}>
                    <User className="w-4 h-4" /> Giới thiệu bản thân
                  </h3>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-line">
                    {profile.bio || "Chưa cập nhật thông tin giới thiệu bản thân. Hãy cập nhật để nhà tuyển dụng hiểu rõ hơn về bạn."}
                  </p>
                </div>

                {/* Hoạt động/Kinh nghiệm */}
                <div className="space-y-4">
                  <h3 className={`text-sm font-black uppercase tracking-wider ${classes.text} border-b pb-1.5 ${classes.border} flex items-center gap-1.5`}>
                    <Sparkles className="w-4 h-4" /> Hoạt động ngoại khóa & Dự án
                  </h3>
                  <div className="relative border-l border-slate-100 pl-4 ml-1.5 space-y-4 pt-1">
                    <div className="relative">
                      <div className={`absolute -left-[20.5px] top-1 w-3.5 h-3.5 rounded-full border-2 bg-white ${classes.border}`} />
                      <div className="space-y-1">
                        <p className="text-xs font-black text-slate-400">2025 - Hiện tại</p>
                        <p className="text-sm font-black text-slate-800">Thành viên Ban tổ chức sự kiện cộng đồng</p>
                        <p className="text-xs font-medium text-slate-500">Tham gia điều phối, hỗ trợ check-in và tổ chức các sự kiện lớn kết nối qua cổng EventMate.</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Footer CV */}
            <div className="mt-auto border-t pt-4 border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400">
              <p>Hồ sơ trực tuyến được tạo bởi EventMate</p>
              <p>Trang 1 / 1</p>
            </div>

          </div>
        </div>

      </div>

      {/* CSS In ấn bổ trợ */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:static, .print\\:static * {
            visibility: visible;
          }
          .print\\:static {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
