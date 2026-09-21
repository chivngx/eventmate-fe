"use client"

import React, { useState } from "react"
import { ChevronUp, ChevronDown, RotateCcw, Filter, X } from "lucide-react"
import Checkbox from "@/components/ui/checkbox"

export interface FilterState {
  onlyHiring: boolean
  wards: string[]
}

export interface CompanyFilterSidebarProps {
  filters: FilterState
  onFilterChange: (newFilters: FilterState) => void
  onResetFilters: () => void
  availableWards: Array<{ id: number; name: string }>
}

export default function CompanyFilterSidebar({
  filters,
  onFilterChange,
  onResetFilters,
  availableWards,
}: CompanyFilterSidebarProps) {
  const [openSections, setOpenSections] = useState({
    hiring: true,
    wards: true,
  })
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const activeCount =
    (filters.onlyHiring ? 1 : 0) +
    filters.wards.length

  const handleWardToggle = (wardName: string) => {
    const updated = filters.wards.includes(wardName)
      ? filters.wards.filter((w) => w !== wardName)
      : [...filters.wards, wardName]
    onFilterChange({ ...filters, wards: updated })
  }

  const handleHiringToggle = () => {
    onFilterChange({ ...filters, onlyHiring: !filters.onlyHiring })
  }

  const filterContent = (
    <div className="flex flex-col gap-2 text-sm w-full">
      {/* Header: All Filters / Active count (Figma node 5387:22482) */}
      <div className="flex items-center justify-between pb-3 border-b border-[#ededed]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#282828]" />
          <span className="font-semibold text-[18px] text-[#282828]">Bộ lọc</span>
          {activeCount > 0 && (
            <span className="bg-[#eff5ff] text-[#005ddc] text-xs font-semibold px-2 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs text-[#515151] hover:text-[#005ddc] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Xóa lọc</span>
          </button>
        )}
      </div>

      {/* Accordion 1: Trạng thái tuyển dụng */}
      <div className="border-b border-[#ededed] py-2.5">
        <button
          type="button"
          onClick={() => toggleSection("hiring")}
          className="w-full flex items-center justify-between py-1 font-medium text-[#282828] text-[18px] text-left cursor-pointer"
        >
          <span>Trạng thái hoạt động</span>
          {openSections.hiring ? (
            <ChevronUp className="w-5 h-5 text-[#515151]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#515151]" />
          )}
        </button>
        {openSections.hiring && (
          <div className="mt-2 flex flex-col gap-1">
            <Checkbox
              checked={filters.onlyHiring}
              onChange={handleHiringToggle}
              label="Đang có sự kiện tuyển dụng"
            />
          </div>
        )}
      </div>

      {/* Accordion 2: Khu vực / Quận huyện */}
      <div className="py-2.5">
        <button
          type="button"
          onClick={() => toggleSection("wards")}
          className="w-full flex items-center justify-between py-1 font-medium text-[#282828] text-[18px] text-left cursor-pointer"
        >
          <span>Khu vực tại Đà Nẵng</span>
          {openSections.wards ? (
            <ChevronUp className="w-5 h-5 text-[#515151]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#515151]" />
          )}
        </button>
        {openSections.wards && (
          <div className="mt-2 max-h-56 overflow-y-auto pr-1 flex flex-col gap-1 custom-scrollbar">
            {availableWards.map((ward) => (
              <Checkbox
                key={ward.id}
                checked={filters.wards.includes(ward.name)}
                onChange={() => handleWardToggle(ward.name)}
                label={ward.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Drawer Trigger Button */}
      <div className="lg:hidden w-full mb-4">
        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          className="w-full py-2.5 px-4 bg-white border border-[#ededed] rounded-[8px] flex items-center justify-between font-medium text-[#282828] shadow-xs cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#005ddc]" />
            <span>Bộ lọc tìm kiếm</span>
          </div>
          {activeCount > 0 && (
            <span className="bg-[#eff5ff] text-[#005ddc] text-xs font-semibold px-2 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Filter Modal / Drawer */}
      {isMobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          {/* Drawer content */}
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-5 flex flex-col shadow-xl z-10 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#ededed] mb-3">
              <span className="font-bold text-[18px] text-[#222222]">Bộ lọc nâng cao</span>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1 rounded-lg text-[#515151] hover:text-[#222222]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {filterContent}
            <div className="mt-auto pt-4 border-t border-[#ededed]">
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="w-full bg-[#005ddc] hover:bg-[#004eb7] text-white py-2.5 rounded-[8px] font-semibold text-sm transition-all cursor-pointer"
              >
                Áp dụng bộ lọc
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar (Figma node 5875:24886: 296px width, rounded 8px) */}
      <aside className="hidden lg:block w-[296px] shrink-0 bg-white border border-[#ededed] rounded-[8px] p-4 shadow-xs sticky top-24 self-start">
        {filterContent}
      </aside>
    </>
  )
}
