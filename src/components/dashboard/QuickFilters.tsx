import { useState, useEffect, useRef } from "react"
import { X, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useSearchParams } from "react-router-dom"

interface QuickFiltersProps {
  filterParam: string
  positionParam: string
  categoryParam: string
  benefitTerm: string
  wardIdTerm: string
  setWardIdTerm: (val: string) => void
  wards: any[]
  setBenefitTerm: (val: string) => void
  clearParamFilter: (paramName: string) => void
  setCurrentPage: (page: number) => void
  showSuggestion: boolean
  setShowSuggestion: (val: boolean) => void
}

export default function QuickFilters({
  filterParam,
  positionParam,
  categoryParam,
  benefitTerm,
  wardIdTerm,
  setWardIdTerm,
  wards,
  setBenefitTerm,
  clearParamFilter,
  setCurrentPage,
  showSuggestion,
  setShowSuggestion
}: QuickFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const [filterMode, setFilterMode] = useState<"location" | "benefit" | "category">(() => {
    if (categoryParam) return "category"
    if (benefitTerm) return "benefit"
    return "location"
  })

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setShowLeftArrow(scrollLeft > 1)
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 1)
    }
  }

  useEffect(() => {
    const el = scrollContainerRef.current
    if (el) {
      el.addEventListener("scroll", checkScroll)
      checkScroll()
      
      const resizeObserver = new ResizeObserver(() => checkScroll())
      resizeObserver.observe(el)
      
      const timeout = setTimeout(checkScroll, 100)
      
      return () => {
        el.removeEventListener("scroll", checkScroll)
        resizeObserver.disconnect()
        clearTimeout(timeout)
      }
    }
  }, [filterMode, wards])

  const getPills = () => {
    if (filterMode === "location") {
      return [
        { label: "Tất cả khu vực", value: "" },
        ...wards.map((w) => ({ label: w.name, value: String(w.id) }))
      ]
    } else if (filterMode === "benefit") {
      return [
        { label: "Tất cả quyền lợi", value: "" },
        { label: "Cấp chứng nhận", value: "Cấp chứng nhận" },
        { label: "Có phụ cấp ăn uống", value: "Có phụ cấp ăn uống" },
        { label: "Hỗ trợ lương cứng", value: "Hỗ trợ lương cứng" },
        { label: "Thỏa thuận", value: "Thỏa thuận" }
      ]
    } else {
      return [
        { label: "Tất cả ngành nghề", value: "" },
        { label: "Lễ hội Âm nhạc", value: "Lễ hội Âm nhạc" },
        { label: "Hội thảo / Workshop", value: "Hội thảo / Workshop" },
        { label: "Giải đấu Thể thao", value: "Giải đấu Thể thao" },
        { label: "Giao lưu Văn hóa", value: "Giao lưu Văn hóa" },
        { label: "Triển lãm / Hội chợ", value: "Triển lãm / Hội chợ" },
        { label: "Sự kiện Công nghệ", value: "Sự kiện Công nghệ" }
      ]
    }
  }

  const pills = getPills()

  const getActiveValue = () => {
    if (filterMode === "location") return wardIdTerm
    if (filterMode === "benefit") return benefitTerm
    return categoryParam
  }
  const activeValue = getActiveValue()

  const handlePillClick = (val: string) => {
    setCurrentPage(1)
    if (filterMode === "location") {
      setWardIdTerm(val)
    } else if (filterMode === "benefit") {
      setBenefitTerm(val)
    } else if (filterMode === "category") {
      if (val) {
        searchParams.set("category", val)
      } else {
        searchParams.delete("category")
      }
      setSearchParams(searchParams)
    }
  }

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current
      const scrollAmount = clientWidth * 0.7
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      })
    }
  }

  return (
    <div className="space-y-4">
      {(positionParam || categoryParam || filterParam === "saved" || benefitTerm || wardIdTerm) && (
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 animate-in fade-in duration-200">
          <span className="text-xs font-bold text-slate-500">Bộ lọc đang bật:</span>
          {filterParam === "saved" && (
            <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold px-2 py-1 flex items-center gap-1 text-xs">
              Mục: Việc làm đã lưu
              <X onClick={() => clearParamFilter("filter")} className="w-3.5 h-3.5 ml-1 cursor-pointer hover:text-rose-500" />
            </Badge>
          )}
          {positionParam && (
            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold px-2 py-1 flex items-center gap-1 text-xs">
              Vị trí: {positionParam}
              <X onClick={() => clearParamFilter("position")} className="w-3.5 h-3.5 ml-1 cursor-pointer hover:text-rose-500" />
            </Badge>
          )}
          {categoryParam && (
            <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold px-2 py-1 flex items-center gap-1 text-xs">
              Nhóm: {categoryParam}
              <X onClick={() => {
                searchParams.delete("category")
                setSearchParams(searchParams)
                setCurrentPage(1)
              }} className="w-3.5 h-3.5 ml-1 cursor-pointer hover:text-rose-500" />
            </Badge>
          )}
          {benefitTerm && (
            <Badge className="bg-amber-50 text-amber-850 hover:bg-amber-100 border border-amber-200 font-bold px-2 py-1 flex items-center gap-1 text-xs">
              Quyền lợi: {benefitTerm}
              <X onClick={() => setBenefitTerm("")} className="w-3.5 h-3.5 ml-1 cursor-pointer hover:text-rose-500" />
            </Badge>
          )}
          {wardIdTerm && (
            <Badge className="bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 font-bold px-2 py-1 flex items-center gap-1 text-xs">
              Phường/Xã: {wards.find(w => String(w.id) === wardIdTerm)?.name}
              <X onClick={() => setWardIdTerm("")} className="w-3.5 h-3.5 ml-1 cursor-pointer hover:text-rose-500" />
            </Badge>
          )}
        </div>
      )}

      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 overflow-hidden py-1">
        <div className="relative flex items-center bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 shrink-0 transition-colors md:w-[220px]">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 mr-2" />
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as any)}
            className="bg-transparent text-slate-700 text-sm font-bold focus:outline-none cursor-pointer pr-8 appearance-none w-full"
          >
            <option value="location">Lọc theo: Địa điểm</option>
            <option value="benefit">Lọc theo: Quyền lợi</option>
            <option value="category">Lọc theo: Ngành nghề</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
        </div>

        <div className="flex-1 flex items-center relative overflow-hidden">
          <button
            type="button"
            onClick={() => scroll("left")}
            disabled={!showLeftArrow}
            className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all ${
              showLeftArrow
                ? "text-[#00b14f] border-[#00b14f] hover:bg-[#00b14f]/5 cursor-pointer"
                : "text-slate-300 border-slate-100 cursor-not-allowed opacity-40"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-1 mx-2 py-1"
          >
            {pills.map((pill) => {
              const isActive = activeValue === pill.value
              return (
                <button
                  key={pill.label}
                  type="button"
                  onClick={() => handlePillClick(pill.value)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                    isActive
                      ? "bg-[#00b14f] border-[#00b14f] text-white shadow-sm"
                      : "bg-[#f2f4f5] border-transparent text-[#212f3f] hover:border-[#00b14f] hover:text-[#00b14f] hover:bg-white"
                  }`}
                >
                  {pill.label}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => scroll("right")}
            disabled={!showRightArrow}
            className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all ${
              showRightArrow
                ? "text-[#00b14f] border-[#00b14f] hover:bg-[#00b14f]/5 cursor-pointer"
                : "text-slate-300 border-slate-100 cursor-not-allowed opacity-40"
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showSuggestion && (
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-emerald-800 font-medium animate-in fade-in duration-300">
          <div className="flex items-center gap-2 pr-4">
            <span className="text-base shrink-0">💡</span>
            <span>Gợi ý: Hệ thống đã tối ưu chuyên biệt cho thị trường Đà Nẵng sau sáp nhập địa giới hành chính mới nhất!</span>
          </div>
          <button onClick={() => setShowSuggestion(false)} className="text-emerald-600 hover:text-emerald-800 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}