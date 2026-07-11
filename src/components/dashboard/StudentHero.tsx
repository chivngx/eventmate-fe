"use client"

import { Search, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"

interface StudentHeroProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  wardIdTerm: string
  setWardIdTerm: (value: string) => void
  activeWards: any[]
}

export default function StudentHero({
  searchTerm,
  setSearchTerm,
  wardIdTerm,
  setWardIdTerm,
  activeWards,
}: StudentHeroProps) {
  return (
    <section className="space-y-4">
      {/* Title — simple, event-focused */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Sự kiện đang tuyển nhân sự
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tìm cơ hội tham gia sự kiện tại Đà Nẵng — tình nguyện viên, CTV, điều phối viên.
        </p>
      </div>

      {/* Search bar — clean, flat */}
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
