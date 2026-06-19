import { CheckCircle2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface CVSuggestionCardProps {
  userProfile: any
  cvProgress: number
  firstName: string
  onNavigate: (path: string) => void
}

export default function CVSuggestionCard({
  userProfile,
  cvProgress,
  firstName,
  onNavigate
}: CVSuggestionCardProps) {
  return (
    <div className="space-y-6">
      {/* CARD 1: TIẾN TRÌNH HỒ SƠ */}
      <div className="bg-white rounded-3xl border-2 border-slate-100 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-emerald-500/20 shadow-sm shrink-0">
            <AvatarImage src={userProfile?.avatar_url} />
            <AvatarFallback className="bg-slate-100 font-bold text-slate-700">
              {userProfile?.full_name ? userProfile.full_name.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm">Chào bạn, {firstName}!</h3>
            <p className="text-slate-500 text-xs mt-0.5">Cập nhật hồ sơ để tăng cơ hội trúng tuyển.</p>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-500">Hoàn thiện CV của bạn</span>
            <span className="text-emerald-600">{cvProgress}%</span>
          </div>
          <Progress value={cvProgress} className="h-2 bg-slate-100 [&>div]:bg-emerald-600 rounded-full" />
        </div>
      </div>

      {/* CARD 2: BÍ KÍP TRÚNG TUYỂN */}
      <div className="bg-white rounded-3xl border-2 border-slate-100 p-6 shadow-sm">
        <h3 className="font-extrabold text-slate-900 mb-5 tracking-tight flex items-center gap-2">
          Bí kíp trúng tuyển 🚀
        </h3>
        <ul className="space-y-4">
          <li className="flex items-start gap-3 group cursor-pointer" onClick={() => onNavigate('/settings')}>
            <CheckCircle2 className={`h-6 w-6 shrink-0 transition-colors ${userProfile?.avatar_url ? 'text-emerald-500' : 'text-slate-200 group-hover:text-emerald-300'}`} />
            <span className={`text-sm font-bold mt-0.5 transition-colors ${userProfile?.avatar_url ? 'text-slate-400 line-through' : 'text-slate-600 group-hover:text-emerald-600'}`}>Cập nhật ảnh đại diện chỉn chu</span>
          </li>
          <li className="flex items-start gap-3 group cursor-pointer" onClick={() => onNavigate('/cv')}>
            <CheckCircle2 className={`h-6 w-6 shrink-0 transition-colors ${userProfile?.skills ? 'text-emerald-500' : 'text-slate-200 group-hover:text-emerald-300'}`} />
            <span className={`text-sm font-bold mt-0.5 transition-colors ${userProfile?.skills ? 'text-slate-400 line-through' : 'text-slate-600 group-hover:text-emerald-600'}`}>Liệt kê các kỹ năng mềm nổi bật</span>
          </li>
          <li className="flex items-start gap-3 group cursor-pointer" onClick={() => onNavigate('/cv')}>
            <CheckCircle2 className={`h-6 w-6 shrink-0 transition-colors ${userProfile?.university ? 'text-emerald-500' : 'text-slate-200 group-hover:text-emerald-300'}`} />
            <span className={`text-sm font-bold mt-0.5 transition-colors ${userProfile?.university ? 'text-slate-400 line-through' : 'text-slate-600 group-hover:text-emerald-600'}`}>Cập nhật trường Đại học/Cao đẳng</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
