"use client"

import { useState } from "react"
import { Search, MapPin, Briefcase } from "lucide-react"

interface HeroSearchBannerProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  wardIdTerm: string
  setWardIdTerm: (ward: string) => void
  activeWards: Array<{ id: string | number; name: string }>
  onSearch: (term?: string, ward?: string, category?: string) => void
}

const EVENT_ROLES = [
  "PG & PB",
  "Lễ tân hội nghị",
  "Hậu cần & Sân khấu",
  "Soát vé & Check-in",
  "Chạy tiệc (Banquet)",
  "MC & Hoạt náo",
  "Mascot & Hoá trang",
  "Media & Quay chụp",
]


export default function HeroSearchBanner({
  searchTerm,
  setSearchTerm,
  wardIdTerm,
  setWardIdTerm,
  activeWards,
  onSearch,
}: HeroSearchBannerProps) {
  const [selectedRole, setSelectedRole] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchTerm, wardIdTerm, selectedRole)
  }


  return (
    <div className="w-full bg-gradient-to-b from-[#1877F2] via-[#1565C0] to-[#0D47A1] text-white pt-10 pb-12 sm:pt-12 sm:pb-16 md:pt-14 md:pb-20 px-4 relative overflow-hidden">
      {/* Background Subtle Circles for Depth */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none blur-2xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-sky-400/10 pointer-events-none blur-2xl" />

      <div className="max-w-5xl mx-auto relative z-10 text-center">
        {/* Punchy Vieclamtot-style Slogan */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
          Việc tới tay, đi làm ngay!
        </h1>

        {/* Vieclamtot-style Single Capsule Search Bar */}
        <form
          onSubmit={handleSubmit}
          className="mt-6 md:mt-8 bg-white rounded-2xl md:rounded-full shadow-2xl p-2 md:p-2.5 flex flex-col md:flex-row items-center gap-2 max-w-4xl mx-auto border border-white/20 text-gray-800"
        >
          {/* Field 1: Keyword Search */}
          <div className="flex items-center gap-2.5 px-3 py-2 w-full md:w-5/12 border-b md:border-b-0 md:border-r border-gray-200">
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm việc làm, vị trí sự kiện..."
              className="w-full bg-transparent text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none"
            />
          </div>

          {/* Field 2: District Filter */}
          <div className="flex items-center gap-2 px-3 py-2 w-full md:w-3/12 border-b md:border-b-0 md:border-r border-gray-200">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={wardIdTerm}
              onChange={(e) => setWardIdTerm(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
            >
              <option value="">Chọn khu vực</option>
              {activeWards.map((w) => (
                <option key={w.id} value={w.id} className="text-gray-900">
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Field 3: Role / Category Filter */}
          <div className="flex items-center gap-2 px-3 py-2 w-full md:w-3/12">
            <Briefcase className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
            >
              <option value="">Ngành nghề</option>
              {EVENT_ROLES.map((role) => (
                <option key={role} value={role} className="text-gray-900">
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full md:w-auto bg-[#1877F2] hover:bg-[#1366D6] active:bg-[#0D47A1] text-white font-bold px-7 py-3 rounded-xl md:rounded-full transition-colors flex items-center justify-center gap-2 text-sm shrink-0 shadow-md"
          >
            <Search className="w-4 h-4" />
            <span>Tìm việc</span>
          </button>
        </form>

      </div>
    </div>
  )
}
