import { MapPin, Award, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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

  const benefitTabs = [
    { label: "Tất cả quyền lợi", value: "" },
    { label: "Cấp chứng nhận", value: "Cấp chứng nhận" },
    { label: "Có phụ cấp ăn uống", value: "Có phụ cấp ăn uống" },
    { label: "Hỗ trợ lương cứng", value: "Hỗ trợ lương cứng" },
    { label: "Thỏa thuận", value: "Thỏa thuận" }
  ]

  return (
    <div className="space-y-4">
      {(positionParam || categoryParam || filterParam === "saved" || benefitTerm || wardIdTerm) && (
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 animate-in fade-in duration-200">
          <span className="text-xs font-bold text-slate-500">Bộ lọc đang bật:</span>
          {filterParam === "saved" && (
            <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold px-2 py-1 flex items-center gap-1 text-xs">
              Mục: Việc làm đã lưu
              <X onClick={() => clearParamFilter("filter")} className="w-3 h-3 ml-1 cursor-pointer hover:text-rose-500" />
            </Badge>
          )}
          {positionParam && (
            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold px-2 py-1 flex items-center gap-1 text-xs">
              Vị trí: {positionParam}
              <X onClick={() => clearParamFilter("position")} className="w-3 h-3 ml-1 cursor-pointer hover:text-rose-500" />
            </Badge>
          )}
          {categoryParam && (
            <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold px-2 py-1 flex items-center gap-1 text-xs">
              Nhóm: {categoryParam}
              <X onClick={() => clearParamFilter("category")} className="w-3 h-3 ml-1 cursor-pointer hover:text-rose-500" />
            </Badge>
          )}
          {benefitTerm && (
            <Badge className="bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 font-bold px-2 py-1 flex items-center gap-1 text-xs">
              Quyền lợi: {benefitTerm}
              <X onClick={() => setBenefitTerm("")} className="w-3 h-3 ml-1 cursor-pointer hover:text-rose-500" />
            </Badge>
          )}
          {wardIdTerm && (
            <Badge className="bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 font-bold px-2 py-1 flex items-center gap-1 text-xs">
              Phường/Xã: {wards.find(w => String(w.id) === wardIdTerm)?.name}
              <X onClick={() => setWardIdTerm("")} className="w-3 h-3 ml-1 cursor-pointer hover:text-rose-500" />
            </Badge>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 overflow-hidden py-1 border-t border-slate-50 pt-3">
        <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 text-xs font-bold text-slate-600 min-w-[140px]">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>Khu vực Phường/Xã</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-0.5">
          <button
            onClick={() => setWardIdTerm("")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${wardIdTerm === ""
              ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
              : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100"
              }`}
          >
            Tất cả khu vực
          </button>
          {wards.map((ward) => (
            <button
              key={ward.id}
              onClick={() => setWardIdTerm(String(ward.id))}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${wardIdTerm === String(ward.id)
                ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100"
                }`}
            >
              {ward.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 overflow-hidden py-1 border-t border-slate-50 pt-1">
        <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 text-xs font-bold text-slate-600 min-w-[140px]">
          <Award className="w-3.5 h-3.5 text-slate-400" />
          <span>Quyền lợi / Lương</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-0.5">
          {benefitTabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => {
                setBenefitTerm(tab.value)
                setCurrentPage(1)
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${benefitTerm === tab.value
                ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100"
                }`}
            >
              {tab.label}
            </button>
          ))}
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