"use client"

import { Search, MapPin, CalendarDays, Users, Sparkles, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useNavigate } from "@/lib/router"

interface StudentHeroProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  wardIdTerm: string
  setWardIdTerm: (value: string) => void
  activeWards: any[]
  totalEvents?: number
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  "Lễ hội Âm nhạc": { bg: "bg-rose-50", text: "text-rose-600", icon: "🎵" },
  "Hội thảo / Workshop": { bg: "bg-blue-50", text: "text-blue-600", icon: "💡" },
  "Giải đấu Thể thao": { bg: "bg-amber-50", text: "text-amber-600", icon: "🏆" },
  "Giao lưu Văn hóa": { bg: "bg-emerald-50", text: "text-emerald-600", icon: "🌍" },
  "Triển lãm / Hội chợ": { bg: "bg-indigo-50", text: "text-indigo-600", icon: "🎪" },
  "Sự kiện Công nghệ": { bg: "bg-purple-50", text: "text-purple-600", icon: "💻" },
}

export default function StudentHero({
  searchTerm,
  setSearchTerm,
  wardIdTerm,
  setWardIdTerm,
  activeWards,
  totalEvents = 0,
}: StudentHeroProps) {
  const navigate = useNavigate()

  return (
    <section className="space-y-6">
      {/* BOLD HERO — event platform energy */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 px-6 py-10 sm:px-10 sm:py-14">
        {/* Decorative dots pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-white/10 text-white/90 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Nền tảng sự kiện tại Đà Nẵng
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            Tham gia sự kiện,
            <br />
            <span className="text-primary">kiếm kinh nghiệm</span> thực tế
          </h1>

          <p className="mt-4 text-sm sm:text-base text-white/70 max-w-lg leading-relaxed">
            Hàng trăm vị trí tình nguyện viên, CTV truyền thông, điều phối viên tại các sự kiện âm nhạc, thể thao, hội thảo — chờ bạn khám phá.
          </p>

          {/* Search — prominent on dark bg */}
          <div className="mt-6 flex flex-col sm:flex-row gap-2 max-w-xl">
            <div className="flex flex-1 items-center bg-white rounded-lg px-3 min-w-0">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <Input
                placeholder="Tìm sự kiện, ban tổ chức..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm placeholder:text-slate-400 h-11"
              />
            </div>
            <div className="flex items-center bg-white rounded-lg px-3 sm:w-44">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                value={wardIdTerm}
                onChange={(e) => setWardIdTerm(e.target.value)}
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm text-slate-700 h-11 w-full focus:outline-none cursor-pointer pl-2"
              >
                <option value="">Tất cả khu vực</option>
                {activeWards.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-6 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              <div>
                <p className="text-lg font-bold text-white leading-none">{totalEvents}</p>
                <p className="text-xs text-white/60 mt-0.5">sự kiện đang mở</p>
              </div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-lg font-bold text-white leading-none">Đà Nẵng</p>
                <p className="text-xs text-white/60 mt-0.5">khu vực</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORY CARDS — colorful, bold */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900">Khám phá theo loại sự kiện</h2>
          <button
            onClick={() => navigate("/events/le-hoi-am-nhac")}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
          >
            Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(CATEGORY_COLORS).map(([name, colors]) => (
            <button
              key={name}
              onClick={() => {
                const event = new CustomEvent("category-select", { detail: name })
                window.dispatchEvent(event)
              }}
              className={`flex flex-col items-center gap-2 p-4 ${colors.bg} border border-transparent rounded-xl hover:scale-105 hover:shadow-md transition-all cursor-pointer`}
            >
              <span className="text-2xl">{colors.icon}</span>
              <span className={`text-xs font-semibold ${colors.text} text-center leading-tight`}>{name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
