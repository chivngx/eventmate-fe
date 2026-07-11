"use client"

import { SlidersHorizontal } from "lucide-react"

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

/**
 * Simple inline filters — 2 dropdowns (category + benefit).
 * Replaced the dense pill bar (TopCV pattern) with clean selects.
 */
export default function QuickFilters({
  categoryTerm,
  setCategoryTerm,
  benefitTerm,
  activeCategories,
  activeBenefits,
  setBenefitTerm,
  setCurrentPage,
}: QuickFiltersProps) {
  const handleCategory = (val: string) => {
    setCategoryTerm(val)
    setCurrentPage(1)
  }
  const handleBenefit = (val: string) => {
    setBenefitTerm(val)
    setCurrentPage(1)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />

      <select
        value={categoryTerm}
        onChange={(e) => handleCategory(e.target.value)}
        className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-600 cursor-pointer hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-ring/30"
      >
        <option value="">Tất cả loại sự kiện</option>
        {activeCategories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        value={benefitTerm}
        onChange={(e) => handleBenefit(e.target.value)}
        className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-600 cursor-pointer hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-ring/30"
      >
        <option value="">Tất cả quyền lợi</option>
        {activeBenefits.map((b) => (
          <option key={b} value={b}>{b}</option>
        ))}
      </select>
    </div>
  )
}
