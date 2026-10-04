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
  "PG & PB Sự kiện",
  "Lễ tân & Check-in",
  "Hậu cần & Sân khấu",
  "Điều phối sự kiện",
  "MC & Hoạt náo",
  "Quay phim & Chụp ảnh",
  "Phục vụ tiệc (Banquet)",
  "Pha chế sự kiện",
  "Mascot & Biểu diễn",
  "Tình nguyện viên",
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
    <div className="w-full relative overflow-visible">
      {/* Orange Background spanning top to exact half of search bar */}
      <div className="absolute inset-x-0 top-0 h-[calc(100%-30px)] bg-[#FB7328]" />

      {/* 3D Curvy Background Tube / Ribbon (Spanning FULL VIEWPORT width) */}
      <div className="hidden md:block absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1600 180" fill="none">
          <defs>
            <linearGradient id="tubeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FED7AA" stopOpacity="0.4" />
              <stop offset="25%" stopColor="#EA580C" stopOpacity="0.55" />
              <stop offset="75%" stopColor="#F97316" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FFEDD5" stopOpacity="0.35" />
            </linearGradient>
            <filter id="tubeGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#7C2D12" floodOpacity="0.25" />
            </filter>
          </defs>
          <path
            d="M -40,75 C 180,160 320,15 540,80 C 720,130 920,130 1100,70 C 1300,10 1440,155 1650,65"
            stroke="url(#tubeGrad)"
            strokeWidth="24"
            strokeLinecap="round"
            filter="url(#tubeGlow)"
          />
        </svg>
      </div>

      {/* --- 3D FLOATING PIXAR ASSETS LAYER (Strictly inside hero bounds, semantically clustered, zero overlap) --- */}
      <div className="hidden md:block absolute inset-0 w-full h-full pointer-events-none select-none z-20 overflow-visible">
        {/* === CLUSTER 1 (LEFT WING): Ban Tổ Chức & Check-in Nhân Sự === */}
        {/* 1. All-Access Pass (High Far-Left - hanging badge) */}
        <div className="absolute left-[1.5%] xl:left-[2%] top-2.5 lg:top-3 w-13 h-18 xl:w-15 xl:h-20">
          <img
            src="/images/home/pass.png"
            alt="Thẻ ban tổ chức"
            className="w-full h-full object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.18)] rotate-3 transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* 2. Walkie-Talkie (Low Mid-Left - event coordination tool) */}
        <div className="absolute left-[6.5%] xl:left-[7%] bottom-5 lg:bottom-6 w-13 h-17 xl:w-15 xl:h-19">
          <img
            src="/images/home/walkie-talkie.png"
            alt="Bộ đàm điều phối"
            className="w-full h-full object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.2)] rotate-3 transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* 3. Check-in Wristband (Mid-High Inner-Left - event admission companion) */}
        <div className="absolute left-[11.8%] xl:left-[12.5%] top-6 lg:top-7 w-12 h-12 xl:w-14 xl:h-14">
          <img
            src="/images/home/wristband.png"
            alt="Vòng tay check-in"
            className="w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.18)] -rotate-6 transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* 4. Mascot Chick on Paper Plane (High Inner-Left - flying toward search center) */}
        <div className="absolute left-[16.5%] xl:left-[17.5%] top-1.5 lg:top-2 w-20 h-20 xl:w-24 xl:h-24">
          <img
            src="/images/home/single_3d_mascot.png"
            alt="Mascot EventMate"
            className="w-full h-full object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.2)] rotate-6 transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* === CLUSTER 2 (RIGHT WING): Sân Khấu, Âm Thanh & Vé Sự Kiện === */}
        {/* 5. Stage Spotlight (High Inner-Right - shining down onto the Star) */}
        <div className="absolute right-[18%] xl:right-[19%] top-2 lg:top-2.5 w-16 h-16 xl:w-18 xl:h-18">
          <img
            src="/images/home/spotlight.png"
            alt="Đèn sân khấu"
            className="w-full h-full object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.18)] -rotate-3 transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* 6. Rating Star (Mid Inner-Right - basking in the spotlight's beam) */}
        <div className="absolute right-[13.5%] xl:right-[14%] top-6 lg:top-7 w-10 h-10 xl:w-11 xl:h-11">
          <img
            src="/images/home/star.png"
            alt="Ngôi sao tỏa sáng"
            className="w-full h-full object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.15)] rotate-12 transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* 7. Event Tickets (Low Mid-Right - admission pass to the show) */}
        <div className="absolute right-[7.5%] xl:right-[8%] bottom-5 lg:bottom-6 w-15 h-15 xl:w-17 xl:h-17">
          <img
            src="/images/home/tickets.png"
            alt="Vé sự kiện VIP"
            className="w-full h-full object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.18)] -rotate-6 transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* 8. Megaphone (High Far-Right - horn announcing into center slogan) */}
        <div className="absolute right-[1.5%] xl:right-[2%] top-2.5 lg:top-3 w-16 h-16 xl:w-18 xl:h-18">
          <img
            src="/images/home/megaphone.png"
            alt="Loa điều phối"
            className="w-full h-full object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.18)] -rotate-3 transition-transform duration-300 hover:scale-105"
          />
        </div>
      </div>

      {/* --- CENTER CONTENT (Slogan & Search Bar with Plenty of Breathing Room) --- */}
      <div className="max-w-4xl mx-auto relative z-10 text-center pt-8 pb-0 md:pt-10 md:pb-0 px-4">
        {/* Punchy Vieclamtot-style Slogan */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-6 md:mb-8">
          Sự kiện tới tay, đi làm ngay!
        </h1>

        {/* Vieclamtot-style Single Capsule Search Bar */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl md:rounded-full shadow-lg p-2 md:p-2.5 flex flex-col md:flex-row items-center gap-2 max-w-4xl mx-auto border border-gray-100 text-gray-800"
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
            className="w-full md:w-auto bg-[#FB7328] hover:bg-[#e65f15] active:bg-[#d44f0b] text-white font-bold px-7 py-3 rounded-xl md:rounded-full transition-colors flex items-center justify-center gap-2 text-sm shrink-0 shadow-md"
          >
            <Search className="w-4 h-4" />
            <span>Tìm việc</span>
          </button>
        </form>
      </div>
    </div>
  )
}
