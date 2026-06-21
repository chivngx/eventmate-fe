import { useState, useEffect, useRef } from "react"
import { SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"

interface QuickFiltersProps {
  categoryTerm: string
  setCategoryTerm: (val: string) => void
  benefitTerm: string
  wardIdTerm: string
  setWardIdTerm: (val: string) => void
  wards: any[]
  activeCategories: string[]
  activeBenefits: string[]
  setBenefitTerm: (val: string) => void
  setCurrentPage: (page: number) => void
}

export default function QuickFilters({
  categoryTerm,
  setCategoryTerm,
  benefitTerm,
  wardIdTerm,
  setWardIdTerm,
  wards,
  activeCategories,
  activeBenefits,
  setBenefitTerm,
  setCurrentPage,
}: QuickFiltersProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const [filterMode, setFilterMode] = useState<"location" | "benefit" | "category">(() => {
    if (categoryTerm) return "category"
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
        ...activeBenefits.map((b) => ({ label: b, value: b }))
      ]
    } else {
      return [
        { label: "Tất cả ngành nghề", value: "" },
        ...activeCategories.map((c) => ({ label: c, value: c }))
      ]
    }
  }

  const pills = getPills()

  const getActiveValue = () => {
    if (filterMode === "location") return wardIdTerm
    if (filterMode === "benefit") return benefitTerm
    return categoryTerm
  }
  const activeValue = getActiveValue()

  const handleFilterModeChange = (newMode: "location" | "benefit" | "category") => {
    setFilterMode(newMode)
    setCurrentPage(1)
    
    // Reset all filter states when switching mode
    setWardIdTerm("")
    setBenefitTerm("")
    setCategoryTerm("")
  }

  const handlePillClick = (val: string) => {
    setCurrentPage(1)
    if (filterMode === "location") {
      setWardIdTerm(val)
      setBenefitTerm("")
      setCategoryTerm("")
    } else if (filterMode === "benefit") {
      setWardIdTerm("")
      setBenefitTerm(val)
      setCategoryTerm("")
    } else if (filterMode === "category") {
      setWardIdTerm("")
      setBenefitTerm("")
      setCategoryTerm(val)
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
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 overflow-hidden py-1 min-[1440px]:w-[1140px] min-[1440px]:h-[40px] min-[1440px]:flex-row min-[1440px]:justify-between min-[1440px]:items-start min-[1440px]:gap-0 min-[1440px]:py-0">
        <div className="relative flex items-center bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 shrink-0 transition-colors md:w-[220px] min-[1440px]:w-[277px] min-[1440px]:h-[40px] min-[1440px]:grid min-[1440px]:grid-cols-[84.56px_169.12px] min-[1440px]:gap-[5px] min-[1440px]:bg-white min-[1440px]:border-[0.8px] min-[1440px]:border-[#dee0e2] min-[1440px]:rounded-[6px] min-[1440px]:pl-[10px] min-[1440px]:pr-[7px] min-[1440px]:py-0 items-center">
          <span className="flex items-center text-slate-400 gap-2 min-[1440px]:w-[85px] min-[1440px]:h-[20px] min-[1440px]:text-[#a6acb2] min-[1440px]:font-medium min-[1440px]:gap-[10px] min-[1440px]:text-[14px]">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0 min-[1440px]:w-[12px] min-[1440px]:h-[14px] min-[1440px]:text-[#a6acb2]" />
            <span className="text-sm font-bold min-[1440px]:text-[14px] min-[1440px]:font-medium">Lọc theo</span>
          </span>
          <select
            value={filterMode}
            onChange={(e) => handleFilterModeChange(e.target.value as any)}
            className="bg-transparent text-slate-700 text-sm font-bold focus:outline-none cursor-pointer pr-8 appearance-none w-full min-[1440px]:text-[#444] min-[1440px]:text-[14px] min-[1440px]:pl-[8px] min-[1440px]:pr-[20px] min-[1440px]:leading-[28px] min-[1440px]:font-medium"
          >
            <option value="location">Địa điểm</option>
            <option value="benefit">Quyền lợi</option>
            <option value="category">Ngành nghề</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none min-[1440px]:w-[20px] min-[1440px]:h-[25px] min-[1440px]:text-[#000000de] min-[1440px]:right-[7px]" />
        </div>

        <div className="flex-1 flex items-center relative overflow-hidden min-[1440px]:flex-initial min-[1440px]:w-[732px] min-[1440px]:h-[40px] min-[1440px]:flex min-[1440px]:items-center">
          <button
            type="button"
            onClick={() => scroll("left")}
            disabled={!showLeftArrow}
            className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all ${showLeftArrow
                ? "text-[#00b14f] border-[#00b14f] hover:bg-[#00b14f]/5 cursor-pointer"
                : "text-slate-300 border-slate-100 cursor-not-allowed opacity-40"
              } min-[1440px]:w-[32px] min-[1440px]:h-[32px] min-[1440px]:rounded-full min-[1440px]:border-[0.8px] min-[1440px]:mr-[15px] min-[1440px]:bg-white min-[1440px]:text-[#a6acb2] min-[1440px]:border-[#dee0e2] hover:min-[1440px]:bg-[#00b14f] hover:min-[1440px]:text-white hover:min-[1440px]:border-[#00b14f]`}
          >
            <ChevronLeft className="w-4 h-4 min-[1440px]:w-5 min-[1440px]:h-5" strokeWidth={1.5} />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-1 mx-2 py-1 min-[1440px]:w-[638px] min-[1440px]:h-[40px] min-[1440px]:flex-initial min-[1440px]:mx-0 min-[1440px]:py-0"
          >
            {pills.map((pill) => {
              const isActive = activeValue === pill.value
              return (
                <button
                  key={pill.label}
                  type="button"
                  onClick={() => handlePillClick(pill.value)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${isActive
                      ? "bg-[#00b14f] border-[#00b14f] text-white shadow-sm"
                      : "bg-[#f2f4f5] border-transparent text-[#212f3f] hover:border-[#00b14f] hover:text-[#00b14f] hover:bg-white"
                    } min-[1440px]:h-[40px] min-[1440px]:rounded-[20px] min-[1440px]:border-[0.8px] min-[1440px]:mr-[12px] min-[1440px]:py-[9px] min-[1440px]:px-[12px] min-[1440px]:text-[14px] min-[1440px]:font-medium min-[1440px]:leading-[20px] ${isActive
                      ? "min-[1440px]:bg-[#00b14f] min-[1440px]:border-[#00b14f] min-[1440px]:text-white"
                      : "min-[1440px]:bg-[#e9eaec] min-[1440px]:border-transparent min-[1440px]:text-[#333]"
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
            className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all ${showRightArrow
                ? "text-[#00b14f] border-[#00b14f] hover:bg-[#00b14f]/5 cursor-pointer"
                : "text-slate-300 border-slate-100 cursor-not-allowed opacity-40"
              } min-[1440px]:w-[32px] min-[1440px]:h-[32px] min-[1440px]:rounded-full min-[1440px]:border-[0.8px] min-[1440px]:bg-white min-[1440px]:text-[#a6acb2] min-[1440px]:border-[#dee0e2] hover:min-[1440px]:bg-[#00b14f] hover:min-[1440px]:text-white hover:min-[1440px]:border-[#00b14f] min-[1440px]:ml-auto`}
          >
            <ChevronRight className="w-4 h-4 min-[1440px]:w-5 min-[1440px]:h-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  )
}