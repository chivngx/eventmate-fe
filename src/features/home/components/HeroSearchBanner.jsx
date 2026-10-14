"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Search, ChevronDown, Check, ArrowRight, ShieldCheck, Users, CreditCard, Sparkles, Building, Calendar } from "lucide-react"

/**
 * @param {Object} [props]
 * @param {string} [props.searchTerm]
 * @param {any} [props.setSearchTerm]
 * @param {string} [props.wardIdTerm]
 * @param {any} [props.setWardIdTerm]
 * @param {any} [props.activeWards]
 * @param {any} [props.onSearch]
 * @param {any} [props.title]
 * @param {any} [props.children]
 */
export default function HeroSearchBanner({
  searchTerm = "",
  setSearchTerm,
  wardIdTerm = "",
  setWardIdTerm,
  activeWards = [],
  onSearch,
  title,
  children,
} = {}) {
  const [isWardOpen, setIsWardOpen] = useState(false)
  const [wardSearch, setWardSearch] = useState("")

  const wardDropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wardDropdownRef.current && !wardDropdownRef.current.contains(event.target)) {
        setIsWardOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredWards = useMemo(() => {
    const list = activeWards || []
    if (!wardSearch.trim()) return list
    const query = wardSearch.toLowerCase()
    return list.filter((w) => w.name.toLowerCase().includes(query))
  }, [activeWards, wardSearch])

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsWardOpen(false)
    onSearch?.(searchTerm, wardIdTerm)
  }

  // Non-home view or custom children view (e.g. Blog, Search)
  if (children || title) {
    return (
      <div className="w-full relative py-10 md:py-14 bg-gradient-to-b from-[#F0FAF6] to-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-teal-200/80 bg-white text-xs font-medium text-teal-900 mb-4 shadow-2xs">
            <span className="w-1.5 h-1.5 bg-teal-400 rounded-xs" />
            <span>EventMate Platform</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-6">
            {title || "Khám Phá Việc Làm Sự Kiện"}
          </h1>
          {children ? (
            children
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow-2xs p-2 flex flex-col sm:flex-row items-center w-full max-w-[620px] mx-auto border border-gray-200 gap-2"
            >
              <div className="flex items-center gap-2.5 px-3 py-1.5 flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm?.(e.target.value)}
                  placeholder="Tìm tên sự kiện, vị trí..."
                  className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-md transition-colors flex items-center justify-center gap-1.5 text-sm cursor-pointer shadow-xs"
              >
                <span>Tìm kiếm</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  // Pure Mint Green (Teal/Seafoam) 2-Column Hero matching Brim reference image
  return (
    <section className="w-full relative pt-10 md:pt-16 pb-12 md:pb-16 bg-white border-b border-gray-100" aria-label="Giới thiệu nền tảng">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 xl:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* === LEFT COLUMN === */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* 1. Small Clean Tag like "[World best platform]" in reference image */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-teal-200/90 bg-white text-xs font-medium text-slate-700 mb-6 shadow-2xs">
              <span className="w-1.5 h-1.5 bg-[#2DD4BF] rounded-xs" />
              <span>Nền tảng nhân sự sự kiện tiêu chuẩn</span>
            </div>

            {/* 2. Bold Executive Headline (Sleek, High-end B2B Typography) */}
            <h1
              className="text-4xl sm:text-5xl lg:text-[54px] font-bold text-slate-900 tracking-[-0.035em] leading-[1.14] mb-5"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Lexend', 'Be Vietnam Pro', sans-serif" }}
            >
              Cung ứng nhân sự <br />
              và <span className="bg-gradient-to-r from-[#0D9488] via-[#14B8A6] to-[#2DD4BF] bg-clip-text text-transparent">vận hành sự kiện</span>
            </h1>

            {/* 3. Concise Subtitle */}
            <p className="text-base sm:text-[17px] text-slate-600 leading-relaxed mb-8 max-w-lg font-normal">
              Nền tảng kết nối, tuyển chọn và điều phối lực lượng nhân sự chuyên nghiệp cho các sự kiện, triển lãm và hội nghị hàng đầu tại Đà Nẵng.
            </p>

            {/* 4. Professional Search & Action Box (clean rectangular, mint accents) */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-[580px] mb-8"
            >
              {/* Keyword Search Input */}
              <div className="relative flex-1 w-full bg-white border border-gray-300 rounded-lg shadow-2xs flex items-center px-3.5 py-2.5 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all">
                <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm?.(e.target.value)}
                  placeholder="Vị trí: Lễ tân, PG, PB, Điều phối, MC..."
                  className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* District Filter Dropdown */}
              <div ref={wardDropdownRef} className="relative w-full sm:w-[150px]">
                <button
                  type="button"
                  onClick={() => setIsWardOpen(!isWardOpen)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  <span className="truncate">
                    {wardIdTerm ? (activeWards || []).find((w) => w.id.toString() === wardIdTerm)?.name || "Khu vực" : "Toàn TP"}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isWardOpen ? "rotate-180" : ""}`} />
                </button>

                {isWardOpen && (
                  <div className="absolute top-[calc(100%+6px)] left-0 w-[220px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-1.5 max-h-[220px] overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setWardIdTerm?.("")
                        setIsWardOpen(false)
                      }}
                      className="w-full text-left px-3 py-1.5 rounded text-xs font-medium hover:bg-slate-50 text-slate-700"
                    >
                      Toàn thành phố
                    </button>
                    {filteredWards.map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => {
                          setWardIdTerm?.(w.id.toString())
                          setIsWardOpen(false)
                        }}
                        className="w-full text-left px-3 py-1.5 rounded text-xs font-medium hover:bg-slate-50 text-slate-700 truncate"
                      >
                        {w.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Clean CTA Button with Pure Mint Gradient */}
              <button
                type="submit"
                className="w-full sm:w-auto bg-gradient-to-r from-[#0D9488] to-[#14B8A6] hover:from-[#0F766E] hover:to-[#0D9488] text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm shadow-teal-500/20 active:scale-98"
              >
                <span>Tìm kiếm</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* 5. Clean 3-Item Features Row with Mint Cyan icons (Physical Card, Virtual Card, Spending style) */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#14B8A6]" />
                <span>100% Đã xác thực</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#14B8A6]" />
                <span>Nhân sự tiêu chuẩn</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#14B8A6]" />
                <span>Hợp đồng & Hóa đơn</span>
              </div>
            </div>
          </div>

          {/* === RIGHT COLUMN: Large Pastel Mint Card Container with Staff Pass === */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="relative w-full aspect-[4/3.6] max-w-[460px] rounded-2xl bg-gradient-to-br from-[#E6F8F0] via-[#F0FAF5] to-[#DDF5EA] border border-teal-100 p-8 flex items-center justify-center shadow-xs overflow-hidden">

              {/* Very Faint Background Wordmark */}
              <span className="absolute text-[90px] font-black text-teal-900/[0.03] tracking-widest select-none pointer-events-none uppercase">
                Events
              </span>

              {/* Floating Frosted Mint Badge (exact match to the floating green square icon in reference image) */}
              <div className="absolute top-8 left-10 z-20 w-12 h-12 rounded-xl bg-gradient-to-tr from-[#2DD4BF] to-[#99F6E4] p-0.5 shadow-md shadow-teal-500/20 rotate-[-6deg]">
                <div className="w-full h-full rounded-[10px] bg-[#0D9488] flex items-center justify-center text-white border border-white/30">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Realistic Corporate Event Staff Badge Card */}
              <div className="relative z-10 w-[84%] aspect-[1.58/1] rounded-xl bg-slate-900 p-5 shadow-xl border border-slate-700/80 rotate-[-3deg] flex flex-col justify-between text-white">

                {/* Card Top: Chip & EventMate Logo */}
                <div className="flex items-center justify-between">
                  <div className="w-8 h-6 rounded bg-gradient-to-r from-amber-200 to-yellow-400 border border-amber-400/50 flex items-center justify-center">
                    <div className="w-6 h-3 border-y border-amber-600/30 grid grid-cols-2 gap-0.5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-extrabold tracking-wider uppercase text-white">
                      EVENTMATE
                    </span>
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-teal-400/20 text-[#2DD4BF] border border-teal-400/30">
                      CORP
                    </span>
                  </div>
                </div>

                {/* Card Middle: Code */}
                <div className="font-mono text-xs text-slate-400 tracking-[0.2em]">
                  EV • DANANG • 2026
                </div>

                {/* Card Bottom: Holder Name & Verified Role */}
                <div className="flex items-end justify-between pt-1 border-t border-slate-700/60">
                  <div>
                    <span className="text-[9px] uppercase font-medium text-slate-400 block">Staff Pass</span>
                    <span className="text-xs font-bold text-white tracking-wide">
                      Nguyễn Minh Anh
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-medium text-slate-400 block">Xác thực</span>
                    <span className="text-[11px] font-bold text-[#2DD4BF]">
                      Verified Talent
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
