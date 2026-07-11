"use client"

import { Search, MapPin, CalendarDays, Users, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"

interface StudentHeroProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  wardIdTerm: string
  setWardIdTerm: (value: string) => void
  activeWards: any[]
  totalEvents?: number
  totalRegistrations?: number
}

export default function StudentHero({
  searchTerm,
  setSearchTerm,
  wardIdTerm,
  setWardIdTerm,
  activeWards,
  totalEvents = 0,
  totalRegistrations = 0,
}: StudentHeroProps) {
  return (
    <section className="space-y-5">
      {/* Title + description */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Khám phá sự kiện
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
          Tìm cơ hội tham gia sự kiện tại Đà Nẵng — tình nguyện viên, CTV truyền thông, điều phối viên và nhiều vị trí khác.
        </p>
      </div>

      {/* Stats bar — event platform feel */}
      <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <CalendarDays className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{totalEvents}</p>
            <p className="text-xs text-muted-foreground">sự kiện đang mở</p>
          </div>
        </div>
        <div className="w-px h-8 bg-slate-200" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{totalRegistrations}</p>
            <p className="text-xs text-muted-foreground">người đã tham gia</p>
          </div>
        </div>
        <div className="w-px h-8 bg-slate-200 hidden sm:block" />
        <div className="flex items-center gap-2 hidden sm:flex">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Đà Nẵng</p>
            <p className="text-xs text-muted-foreground">khu vực</p>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex flex-1 items-center bg-white border border-slate-200 rounded-lg px-3 min-w-0">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <Input
            placeholder="Tìm tên sự kiện, ban tổ chức..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm placeholder:text-slate-400 h-10"
          />
        </div>

        <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 sm:w-48">
          <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={wardIdTerm}
            onChange={(e) => setWardIdTerm(e.target.value)}
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm text-slate-700 h-10 w-full focus:outline-none cursor-pointer pl-2"
          >
            <option value="">Tất cả khu vực</option>
            {activeWards.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>
    </section>
  )
}
