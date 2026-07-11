"use client"

import { Search, MapPin, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import RotatingText from "@/components/RotatingText"

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
    <section className="bg-primary text-white rounded-2xl px-5 py-8 sm:px-8 sm:py-10 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="mx-auto max-w-3xl text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full">
          <Calendar className="w-3.5 h-3.5" />
          Việc làm sự kiện tại Đà Nẵng
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight flex flex-col items-center justify-center gap-2">
          <span>Tìm cơ hội sự kiện phù hợp với</span>
          <RotatingText
            texts={["sự nghiệp", "tương lai", "năng lực", "đam mê"]}
            mainClassName="text-primary bg-white px-3 sm:px-4 py-0.5 sm:py-1 rounded-lg inline-flex overflow-hidden justify-center shadow-sm"
            staggerFrom="first"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-120%", opacity: 0 }}
            staggerDuration={0.02}
            splitLevelClassName="overflow-hidden pb-0.5"
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            rotationInterval={2500}
          />
        </h1>

        <p className="mx-auto max-w-xl text-sm text-white/80 font-medium">
          Hàng trăm vị trí Tình nguyện viên, CTV Truyền thông và Điều phối
          đang chờ đón bạn.
        </p>

        {/* Search bar — flat white card on primary bg */}
        <div className="mx-auto mt-6 flex w-full max-w-2xl flex-col gap-2 rounded-xl bg-white p-2 shadow-sm sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center px-3 py-2 sm:py-1 min-w-0">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <Input
              placeholder="Tìm sự kiện, BTC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-slate-800 font-medium text-sm placeholder:text-slate-400 h-9"
            />
          </div>

          <div className="hidden h-6 w-px bg-slate-200 sm:block" />

          <div className="flex flex-1 items-center px-3 py-2 sm:py-1 min-w-0">
            <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={wardIdTerm}
              onChange={(e) => setWardIdTerm(e.target.value)}
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-slate-800 font-medium text-sm h-9 w-full focus:outline-none cursor-pointer pl-2"
            >
              <option value="">Tất cả khu vực</option>
              {activeWards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <Button className="h-10 w-full rounded-lg bg-primary hover:bg-primary/90 px-6 text-sm font-semibold text-white sm:w-auto transition-colors">
            Tìm kiếm
          </Button>
        </div>
      </div>
    </section>
  )
}
