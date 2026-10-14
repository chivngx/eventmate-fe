"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Search, ChevronDown, Check, ArrowRight, ShieldCheck, Users, CreditCard, Sparkles, Building, Calendar, X, MapPin } from "lucide-react"
import { useJobPositions, useWards } from "@/hooks/useLookups"

const DEFAULT_POSITIONS = [
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
  "Âm thanh & Ánh sáng",
  "An ninh & Điều hướng",
  "Thu ngân & Bán vé",
  "Mẫu ảnh & Lookbook",
  "Biên đạo & Vũ đoàn",
  "Hướng dẫn viên sự kiện",
]

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
  const [isPositionOpen, setIsPositionOpen] = useState(false)
  const [isCustomActive, setIsCustomActive] = useState(false)

  const wardDropdownRef = useRef(null)
  const positionDropdownRef = useRef(null)

  // Fetch database positions to merge dynamically
  const { data: dbPositions = [] } = useJobPositions()

  const allPositions = useMemo(() => {
    const list = [...DEFAULT_POSITIONS]
    const seen = new Set(list.map((p) => p.toLowerCase()))

    if (Array.isArray(dbPositions)) {
      dbPositions.forEach((dp) => {
        const name = dp?.name?.trim()
        if (name && !seen.has(name.toLowerCase())) {
          seen.add(name.toLowerCase())
          list.push(name)
        }
      })
    }
    return list
  }, [dbPositions])

  // Filter positions when user types into the search box
  const filteredPositions = useMemo(() => {
    if (!searchTerm.trim() || isCustomActive || searchTerm === "Khác") return allPositions
    const q = searchTerm.toLowerCase().trim()
    return allPositions.filter((p) => p.toLowerCase().includes(q))
  }, [allPositions, searchTerm, isCustomActive])

  // Check if "Khác" is currently active
  const isCustomSelected = useMemo(() => {
    if (!searchTerm) return false
    const match = allPositions.some((p) => p.toLowerCase() === searchTerm.toLowerCase())
    return isCustomActive || !match || searchTerm === "Khác"
  }, [searchTerm, allPositions, isCustomActive])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wardDropdownRef.current && !wardDropdownRef.current.contains(event.target)) {
        setIsWardOpen(false)
      }
      if (positionDropdownRef.current && !positionDropdownRef.current.contains(event.target)) {
        setIsPositionOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])
  // Fetch all 94 wards from database danang_wards
  const { data: dbWards = [] } = useWards()

  const allWards = useMemo(() => {
    if (Array.isArray(dbWards) && dbWards.length > 0) return dbWards
    if (Array.isArray(activeWards) && activeWards.length > 0) return activeWards
    return []
  }, [dbWards, activeWards])

  const filteredWards = useMemo(() => {
    if (!wardSearch.trim()) return allWards
    const query = wardSearch.toLowerCase().trim()
    return allWards.filter((w) => w?.name?.toLowerCase().includes(query))
  }, [allWards, wardSearch])

  const selectedWardName = useMemo(() => {
    if (!wardIdTerm) return ""
    const found = allWards.find((w) => w.id?.toString() === wardIdTerm?.toString())
    return found?.name || ""
  }, [allWards, wardIdTerm])

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsWardOpen(false)
    setIsPositionOpen(false)
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
              {/* Position Selector Popup / Input */}
              <div ref={positionDropdownRef} className="relative flex-1 w-full">
                <div
                  onClick={() => {
                    setIsPositionOpen(true)
                    setIsWardOpen(false)
                  }}
                  className="w-full bg-white border border-gray-300 rounded-lg shadow-2xs flex items-center px-3.5 py-2.5 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all cursor-pointer"
                >
                  <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm?.(e.target.value)
                      if (!isPositionOpen) setIsPositionOpen(true)
                    }}
                    onFocus={() => {
                      setIsPositionOpen(true)
                      setIsWardOpen(false)
                    }}
                    placeholder="Vị trí: Lễ tân, PG, PB, Điều phối, MC..."
                    className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSearchTerm?.("")
                        setIsCustomActive(false)
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer mr-0.5"
                      title="Xóa lựa chọn"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsPositionOpen(!isPositionOpen)
                      setIsWardOpen(false)
                    }}
                    className="p-0.5 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                        isPositionOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Position Popup Dropdown */}
                {isPositionOpen && (
                  <div className="absolute top-[calc(100%+6px)] left-0 right-0 sm:right-auto w-full sm:w-[480px] md:w-[520px] bg-white border border-gray-200/90 rounded-xl shadow-xl z-50 p-3 sm:p-4 animate-in fade-in zoom-in-95 duration-150">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                          Chọn vị trí tuyển dụng
                        </span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                          {allPositions.length + 1} lựa chọn
                        </span>
                      </div>
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchTerm?.("")
                            setIsCustomActive(false)
                          }}
                          className="text-xs text-slate-400 hover:text-teal-600 cursor-pointer font-medium transition-colors"
                        >
                          Bỏ chọn
                        </button>
                      )}
                    </div>

                    {/* All positions option */}
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm?.("")
                        setIsCustomActive(false)
                        setIsPositionOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between mb-1.5 cursor-pointer ${
                        !searchTerm
                          ? "bg-teal-50 text-teal-800 font-semibold border border-teal-200"
                          : "hover:bg-slate-50 text-slate-700 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                        <span>Tất cả vị trí sự kiện</span>
                      </div>
                      {!searchTerm && <Check className="w-3.5 h-3.5 text-teal-600" />}
                    </button>

                    {/* Positions Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[220px] overflow-y-auto pr-1 py-0.5">
                      {filteredPositions.map((pos) => {
                        const isSelected = searchTerm?.toLowerCase() === pos.toLowerCase()
                        return (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => {
                              setSearchTerm?.(pos)
                              setIsCustomActive(false)
                              setIsPositionOpen(false)
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer truncate ${
                              isSelected
                                ? "bg-teal-50 text-teal-800 font-semibold border border-teal-200"
                                : "hover:bg-slate-50 text-slate-700 border border-transparent hover:border-slate-200"
                            }`}
                          >
                            <span className="truncate">{pos}</span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 ml-1" />
                            )}
                          </button>
                        )
                      })}
                    </div>

                    {/* If filtered list is empty */}
                    {filteredPositions.length === 0 && (
                      <div className="py-3 px-2 text-center text-xs text-slate-500">
                        <p className="mb-2">Không tìm thấy vị trí chuẩn khớp với "{searchTerm}"</p>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomActive(true)
                            setIsPositionOpen(false)
                          }}
                          className="px-3 py-1.5 rounded-md bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-medium border border-teal-200 cursor-pointer transition-colors"
                        >
                          👉 Chọn "{searchTerm}" (Vị trí khác)
                        </button>
                      </div>
                    )}

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-2" />

                    {/* "Khác" (Other) item */}
                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomActive(true)
                          if (!searchTerm || allPositions.some((p) => p.toLowerCase() === searchTerm.toLowerCase())) {
                            setSearchTerm?.("Khác")
                          }
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                          isCustomSelected
                            ? "bg-teal-50 text-teal-800 font-semibold border border-teal-200"
                            : "hover:bg-slate-50 text-slate-700 border border-transparent hover:border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span className="font-semibold text-slate-900">Khác</span>
                          <span className="text-[11px] text-slate-400 font-normal">
                            (Tự nhập vị trí hoặc tìm kiếm tự do)
                          </span>
                        </div>
                        {isCustomSelected && <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
                      </button>

                      {/* Custom input box when "Khác" is selected or clicked */}
                      {isCustomActive && (
                        <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 animate-in fade-in duration-100">
                          <input
                            type="text"
                            autoFocus
                            value={searchTerm === "Khác" ? "" : searchTerm}
                            onChange={(e) => setSearchTerm?.(e.target.value || "Khác")}
                            placeholder="Nhập tên vị trí khác (ví dụ: DJ, Bếp, Phiên dịch...)"
                            className="flex-1 bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                setIsPositionOpen(false)
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setIsPositionOpen(false)}
                            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded cursor-pointer transition-colors shrink-0"
                          >
                            Xong
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* District / Ward Filter Popup */}
              <div ref={wardDropdownRef} className="relative w-full sm:w-[170px]">
                <button
                  type="button"
                  onClick={() => {
                    setIsWardOpen(!isWardOpen)
                    setIsPositionOpen(false)
                  }}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors shadow-2xs group"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 group-hover:text-teal-600 transition-colors" />
                    <span className="truncate font-medium text-slate-800">
                      {selectedWardName || "Toàn TP"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-1">
                    {wardIdTerm && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation()
                          setWardIdTerm?.("")
                        }}
                        className="p-0.5 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                        title="Xóa khu vực"
                      >
                        <X className="w-3 h-3" />
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                        isWardOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* District / Ward Popup Dropdown */}
                {isWardOpen && (
                  <div className="absolute top-[calc(100%+6px)] right-0 left-auto sm:right-0 w-full sm:w-[420px] md:w-[480px] bg-white border border-gray-200/90 rounded-xl shadow-xl z-50 p-3 sm:p-4 animate-in fade-in zoom-in-95 duration-150">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                          Khu vực / Địa điểm
                        </span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                          {allWards.length} địa điểm
                        </span>
                      </div>
                      {wardIdTerm && (
                        <button
                          type="button"
                          onClick={() => setWardIdTerm?.("")}
                          className="text-xs text-slate-400 hover:text-teal-600 cursor-pointer font-medium transition-colors"
                        >
                          Đặt lại
                        </button>
                      )}
                    </div>

                    {/* Search Input inside popup */}
                    <div className="relative mb-2.5">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
                      <input
                        type="text"
                        autoFocus
                        value={wardSearch}
                        onChange={(e) => setWardSearch(e.target.value)}
                        placeholder="Tìm kiếm quận, huyện, phường, xã..."
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg pl-8 pr-7 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                      />
                      {wardSearch && (
                        <button
                          type="button"
                          onClick={() => setWardSearch("")}
                          className="p-1 text-slate-400 hover:text-slate-600 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                          title="Xóa tìm kiếm"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* "Toàn thành phố" option */}
                    <button
                      type="button"
                      onClick={() => {
                        setWardIdTerm?.("")
                        setIsWardOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between mb-1.5 cursor-pointer ${
                        !wardIdTerm
                          ? "bg-teal-50 text-teal-800 font-semibold border border-teal-200"
                          : "hover:bg-slate-50 text-slate-700 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                        <span>Toàn thành phố (Tất cả khu vực)</span>
                      </div>
                      {!wardIdTerm && <Check className="w-3.5 h-3.5 text-teal-600" />}
                    </button>

                    {/* Scrollable Grid of 94 Wards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[250px] overflow-y-auto pr-1 py-1">
                      {filteredWards.map((w) => {
                        const isSelected = wardIdTerm?.toString() === w.id?.toString()
                        return (
                          <button
                            key={w.id}
                            type="button"
                            title={w.name}
                            onClick={() => {
                              setWardIdTerm?.(w.id.toString())
                              setIsWardOpen(false)
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer truncate ${
                              isSelected
                                ? "bg-teal-50 text-teal-800 font-semibold border border-teal-200"
                                : "hover:bg-slate-50 text-slate-700 border border-transparent hover:border-slate-200"
                            }`}
                          >
                            <span className="truncate">{w.name}</span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 ml-1" />
                            )}
                          </button>
                        )
                      })}
                    </div>

                    {/* Empty search results */}
                    {filteredWards.length === 0 && (
                      <div className="py-4 text-center text-xs text-slate-500">
                        <p className="mb-2">Không tìm thấy địa điểm khớp với "{wardSearch}"</p>
                        <button
                          type="button"
                          onClick={() => setWardSearch("")}
                          className="px-3 py-1 rounded-md bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-medium border border-teal-200 cursor-pointer transition-colors"
                        >
                          Xem toàn bộ địa điểm
                        </button>
                      </div>
                    )}
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
