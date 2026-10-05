"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Search, MapPin, Briefcase, ChevronDown, Check, Users, BadgeCheck, Wrench, Headset, Mic, Camera, Utensils, GlassWater, Smile, HeartHandshake, X } from "lucide-react"

interface HeroSearchBannerProps {
  searchTerm?: string
  setSearchTerm?: (term: string) => void
  wardIdTerm?: string
  setWardIdTerm?: (ward: string) => void
  activeWards?: Array<{ id: string | number; name: string }>
  onSearch?: (term?: string, ward?: string, category?: string) => void
  title?: React.ReactNode
  children?: React.ReactNode
}

const EVENT_ROLES = [
  { id: "PG & PB Sự kiện", icon: Users },
  { id: "Lễ tân & Check-in", icon: BadgeCheck },
  { id: "Hậu cần & Sân khấu", icon: Wrench },
  { id: "Điều phối sự kiện", icon: Headset },
  { id: "MC & Hoạt náo", icon: Mic },
  { id: "Quay phim & Chụp ảnh", icon: Camera },
  { id: "Phục vụ tiệc (Banquet)", icon: Utensils },
  { id: "Pha chế sự kiện", icon: GlassWater },
  { id: "Mascot & Biểu diễn", icon: Smile },
  { id: "Tình nguyện viên", icon: HeartHandshake },
]


export default function HeroSearchBanner({
  searchTerm = "",
  setSearchTerm,
  wardIdTerm = "",
  setWardIdTerm,
  activeWards = [],
  onSearch,
  title = "Sự kiện tới tay, đi làm ngay!",
  children,
}: HeroSearchBannerProps) {
  const [selectedRole, setSelectedRole] = useState("")
  const [isWardOpen, setIsWardOpen] = useState(false)
  const [isRoleOpen, setIsRoleOpen] = useState(false)
  const [wardSearch, setWardSearch] = useState("")

  const wardDropdownRef = useRef<HTMLDivElement>(null)
  const roleDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wardDropdownRef.current && !wardDropdownRef.current.contains(event.target as Node)) {
        setIsWardOpen(false)
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredWards = useMemo(() => {
    if (!wardSearch.trim()) return activeWards
    const query = wardSearch.toLowerCase()
    return activeWards.filter((w) => w.name.toLowerCase().includes(query))
  }, [activeWards, wardSearch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsWardOpen(false)
    setIsRoleOpen(false)
    onSearch?.(searchTerm, wardIdTerm, selectedRole)
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
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-6 md:mb-8">
          {title}
        </h1>

        {children ? (
          children
        ) : (
          /* Premium Custom Floating Search Bar */
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl md:rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-2 flex flex-col md:flex-row items-center w-full max-w-[960px] mx-auto border border-gray-200/80"
          >
            {/* Field 1: Keyword Search */}
            <div className="flex items-center gap-3 px-6 py-2.5 w-full md:w-[40%] hover:bg-gray-100/60 focus-within:bg-gray-100/60 transition-colors md:rounded-full cursor-text relative group">
              <Search className="w-5 h-5 text-gray-400 shrink-0 group-focus-within:text-gray-900 transition-colors" />
              <div className="flex flex-col items-start w-full">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-0.5 cursor-text">
                  Việc làm
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm?.(e.target.value)}
                  placeholder="Tìm tên sự kiện, vị trí..."
                  className="w-full bg-transparent text-[15px] font-semibold text-gray-900 placeholder-gray-400 focus:outline-none"
                />
              </div>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm?.("")}
                  className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer shrink-0 absolute right-4"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="hidden md:block w-[1px] h-10 bg-gray-200 shrink-0" />

            {/* Field 2: District Filter */}
            <div 
              ref={wardDropdownRef}
              className="relative flex items-center px-6 py-2.5 w-full md:w-[25%] hover:bg-gray-100/60 transition-colors md:rounded-full cursor-pointer group"
              onClick={() => {
                setIsWardOpen(!isWardOpen)
                setIsRoleOpen(false)
              }}
            >
              <div className="w-full flex items-center justify-between">
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Khu vực</span>
                  <span className={`text-[15px] truncate ${wardIdTerm ? "text-gray-900 font-semibold" : "text-gray-400 font-medium"}`}>
                    {wardIdTerm ? activeWards.find((w) => w.id.toString() === wardIdTerm)?.name || "Đã chọn" : "Tất cả"}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${isWardOpen ? "rotate-180 text-gray-900" : ""}`} />
              </div>

              {/* Popover */}
              {isWardOpen && (
                <div className="absolute top-[calc(100%+16px)] left-0 w-full md:w-[300px] bg-white border border-gray-100 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-3 border-b border-gray-50 bg-gray-50/50">
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-100 transition-all">
                      <Search className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
                      <input
                        type="text"
                        value={wardSearch}
                        onChange={(e) => setWardSearch(e.target.value)}
                        placeholder="Tìm quận, phường..."
                        className="w-full bg-transparent text-[14px] font-medium text-gray-900 focus:outline-none"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-[260px] overflow-y-auto p-2 scrollbar-thin [scrollbar-width:thin] text-left">
                    <button
                      type="button"
                      onClick={() => {
                        setWardIdTerm?.("")
                        setIsWardOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] transition-colors cursor-pointer ${
                        !wardIdTerm ? "bg-gray-100 text-gray-900 font-bold" : "text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <span>Tất cả khu vực</span>
                      {!wardIdTerm && <Check className="w-4.5 h-4.5 text-gray-900" />}
                    </button>
                    {filteredWards.length === 0 ? (
                      <div className="py-6 text-center text-sm text-gray-400">Không tìm thấy khu vực</div>
                    ) : (
                      filteredWards.map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => {
                            setWardIdTerm?.(w.id.toString())
                            setIsWardOpen(false)
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] transition-colors cursor-pointer mt-1 ${
                            wardIdTerm === w.id.toString() ? "bg-gray-100 text-gray-900 font-bold" : "text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <span className="truncate pr-2 text-left">{w.name}</span>
                          {wardIdTerm === w.id.toString() && <Check className="w-4.5 h-4.5 text-gray-900 shrink-0" />}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden md:block w-[1px] h-10 bg-gray-200 shrink-0" />

            {/* Field 3: Role / Category Filter */}
            <div 
              ref={roleDropdownRef}
              className="relative flex items-center px-6 py-2.5 w-full md:w-[35%] hover:bg-gray-100/60 transition-colors md:rounded-full cursor-pointer group"
              onClick={() => {
                setIsRoleOpen(!isRoleOpen)
                setIsWardOpen(false)
              }}
            >
              <div className="w-full flex items-center justify-between pr-2 md:pr-4">
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Ngành nghề</span>
                  <span className={`text-[15px] truncate ${selectedRole ? "text-gray-900 font-semibold" : "text-gray-400 font-medium"}`}>
                    {selectedRole || "Tất cả ngành nghề"}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${isRoleOpen ? "rotate-180 text-gray-900" : ""}`} />
              </div>

              {/* Popover */}
              {isRoleOpen && (
                <div className="absolute top-[calc(100%+16px)] right-0 md:left-0 md:right-auto w-full md:w-[320px] bg-white border border-gray-100 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="max-h-[360px] overflow-y-auto p-2 scrollbar-thin [scrollbar-width:thin] text-left">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole("")
                        setIsRoleOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-[14px] transition-colors cursor-pointer ${
                        !selectedRole ? "bg-gray-100 text-gray-900 font-bold" : "text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Briefcase className={`w-4.5 h-4.5 ${!selectedRole ? "text-gray-900" : "text-gray-400"}`} />
                        <span>Tất cả ngành nghề</span>
                      </div>
                      {!selectedRole && <Check className="w-4.5 h-4.5 text-gray-900" />}
                    </button>

                    <div className="h-px bg-gray-100 my-2 mx-3" />

                    {EVENT_ROLES.map((role) => {
                      const Icon = role.icon
                      const isSelected = selectedRole === role.id
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => {
                            setSelectedRole(role.id)
                            setIsRoleOpen(false)
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-3 mt-1 rounded-xl text-[14px] transition-colors cursor-pointer ${
                            isSelected ? "bg-gray-100 text-gray-900 font-bold" : "text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4.5 h-4.5 ${isSelected ? "text-gray-900" : "text-gray-400"}`} strokeWidth={1.5} />
                            <span>{role.id}</span>
                          </div>
                          {isSelected && <Check className="w-4.5 h-4.5 text-gray-900 shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full md:w-auto bg-[#222222] hover:bg-black active:scale-95 text-white font-bold px-8 py-3.5 rounded-xl md:rounded-full transition-all flex items-center justify-center gap-2.5 text-[15px] shrink-0 shadow-lg cursor-pointer md:ml-auto md:mr-1"
            >
              <Search className="w-4.5 h-4.5" />
              <span>Tìm kiếm</span>
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
