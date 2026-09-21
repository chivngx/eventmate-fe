"use client"

import React, { useState } from "react"
import { ChevronUp, ChevronDown, RotateCcw, Filter, X } from "lucide-react"
import Checkbox from "@/components/ui/checkbox"

export type QuickFilterType = "popular" | "viewed" | "top_rated" | "most_events"

export const SORT_OPTIONS: Array<{ id: QuickFilterType; label: string }> = [
  { id: "popular", label: "Phổ biến nhất" },
  { id: "viewed", label: "Xem nhiều nhất" },
  { id: "top_rated", label: "Đánh giá cao" },
  { id: "most_events", label: "Tuyển dụng sôi nổi" },
]

export interface CompanyFilterState {
  onlyHiring: boolean
  verifiedOnly: boolean
  categories: string[]
  sortBy: QuickFilterType
}

export type FilterState = CompanyFilterState

export interface CompanyFilterSidebarProps {
  filters: CompanyFilterState
  onFilterChange: (newFilters: CompanyFilterState) => void
  onResetFilters: () => void
  availableCategories?: Array<{ id?: number | string; name: string }>
}

export const DEFAULT_CATEGORY_OPTIONS = [
  { id: "Lễ hội Âm nhạc", label: "Lễ hội Âm nhạc" },
  { id: "Hội thảo / Workshop", label: "Hội thảo / Workshop" },
  { id: "Giải đấu Thể thao", label: "Giải đấu Thể thao" },
  { id: "Giao lưu Văn hóa", label: "Giao lưu Văn hóa" },
  { id: "Triển lãm / Hội chợ", label: "Triển lãm / Hội chợ" },
  { id: "Sự kiện Công nghệ", label: "Sự kiện Công nghệ" },
]

export default function CompanyFilterSidebar({
  filters,
  onFilterChange,
  onResetFilters,
  availableCategories,
}: CompanyFilterSidebarProps) {
  const [openSections, setOpenSections] = useState({
    sort: true,
    status: true,
    categories: true,
  })
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const activeCount =
    (filters.onlyHiring ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0) +
    (filters.categories?.length || 0) +
    (filters.sortBy && filters.sortBy !== "popular" ? 1 : 0)

  const handleSortChange = (sort: QuickFilterType) => {
    onFilterChange({ ...filters, sortBy: sort })
  }

  const handleHiringToggle = () => {
    onFilterChange({ ...filters, onlyHiring: !filters.onlyHiring })
  }

  const handleVerifiedToggle = () => {
    onFilterChange({ ...filters, verifiedOnly: !filters.verifiedOnly })
  }

  const handleCategoryToggle = (categoryName: string) => {
    const updated = filters.categories.includes(categoryName)
      ? filters.categories.filter((c) => c !== categoryName)
      : [...filters.categories, categoryName]
    onFilterChange({ ...filters, categories: updated })
  }

  // Categories list to render (dynamic or default)
  const categoryOptions =
    availableCategories && availableCategories.length > 0
      ? availableCategories.map((c) => ({ id: c.name, label: c.name }))
      : DEFAULT_CATEGORY_OPTIONS

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

      {/* Active Filter Tags */}
      {activeCount > 0 && (
        <div className="py-2.5 border-b border-[#ededed] flex flex-wrap gap-1.5">
          {filters.onlyHiring && (
            <span className="bg-[#ededed] text-[#353535] text-[13px] font-medium px-2 py-1 rounded-[6px] flex items-center gap-1">
              Đang tuyển dụng
              <button
                type="button"
                onClick={handleHiringToggle}
                className="hover:text-red-500 cursor-pointer"
                title="Bỏ lọc tuyển dụng"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {filters.verifiedOnly && (
            <span className="bg-[#ededed] text-[#353535] text-[13px] font-medium px-2 py-1 rounded-[6px] flex items-center gap-1">
              Đã xác thực
              <button
                type="button"
                onClick={handleVerifiedToggle}
                className="hover:text-red-500 cursor-pointer"
                title="Bỏ lọc đã xác thực"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {filters.categories.map((c) => (
            <span
              key={`cat-${c}`}
              className="bg-[#ededed] text-[#353535] text-[13px] font-medium px-2 py-1 rounded-[6px] flex items-center gap-1"
            >
              {c}
              <button
                type="button"
                onClick={() => handleCategoryToggle(c)}
                className="hover:text-red-500 cursor-pointer"
                title="Bỏ chọn lĩnh vực"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}

          {filters.sortBy && filters.sortBy !== "popular" && (
            <span className="bg-[#eff5ff] text-[#005ddc] text-[13px] font-medium px-2 py-1 rounded-[6px] flex items-center gap-1">
              {SORT_OPTIONS.find((s) => s.id === filters.sortBy)?.label || filters.sortBy}
              <button
                type="button"
                onClick={() => handleSortChange("popular")}
                className="hover:text-red-500 cursor-pointer"
                title="Đặt lại sắp xếp"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Accordion 1: Sắp xếp theo */}
      <div className="border-b border-[#ededed] py-2.5">
        <button
          type="button"
          onClick={() => toggleSection("sort")}
          className="w-full flex items-center justify-between py-1 font-medium text-[#282828] text-[18px] text-left cursor-pointer"
        >
          <span>Sắp xếp theo</span>
          {openSections.sort ? (
            <ChevronUp className="w-5 h-5 text-[#515151]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#515151]" />
          )}
        </button>
        {openSections.sort && (
          <div className="mt-2 flex flex-col gap-1">
            {SORT_OPTIONS.map((opt) => {
              const isSelected = (filters.sortBy || "popular") === opt.id
              return (
                <label
                  key={opt.id}
                  className="flex items-center gap-2.5 py-1 text-sm text-[#515151] hover:text-[#222222] cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="company_sort_filter"
                    checked={isSelected}
                    onChange={() => handleSortChange(opt.id)}
                    className="w-4 h-4 text-[#005ddc] border-[#cbcbcb] focus:ring-[#005ddc] accent-[#005ddc] cursor-pointer"
                  />
                  <span className={isSelected ? "font-semibold text-[#005ddc]" : "text-[#353535]"}>
                    {opt.label}
                  </span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* Accordion 2: Trạng thái & Xác thực */}
      <div className="border-b border-[#ededed] py-2.5">
        <button
          type="button"
          onClick={() => toggleSection("status")}
          className="w-full flex items-center justify-between py-1 font-medium text-[#282828] text-[18px] text-left cursor-pointer"
        >
          <span>Trạng thái & Xác thực</span>
          {openSections.status ? (
            <ChevronUp className="w-5 h-5 text-[#515151]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#515151]" />
          )}
        </button>
        {openSections.status && (
          <div className="mt-2 flex flex-col gap-1">
            <Checkbox
              checked={filters.onlyHiring}
              onChange={handleHiringToggle}
              label="Đang có sự kiện tuyển dụng"
            />
            <Checkbox
              checked={filters.verifiedOnly}
              onChange={handleVerifiedToggle}
              label="Đã xác thực danh tính"
            />
          </div>
        )}
      </div>

      {/* Accordion 2: Lĩnh vực sự kiện */}
      <div className="py-2.5">
        <button
          type="button"
          onClick={() => toggleSection("categories")}
          className="w-full flex items-center justify-between py-1 font-medium text-[#282828] text-[18px] text-left cursor-pointer"
        >
          <span>Lĩnh vực sự kiện</span>
          {openSections.categories ? (
            <ChevronUp className="w-5 h-5 text-[#515151]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#515151]" />
          )}
        </button>
        {openSections.categories && (
          <div className="mt-2 flex flex-col gap-1">
            {categoryOptions.map((opt) => (
              <Checkbox
                key={opt.id}
                checked={filters.categories.includes(opt.id)}
                onChange={() => handleCategoryToggle(opt.id)}
                label={opt.label}
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
            <span>Bộ lọc ban tổ chức</span>
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
              <span className="font-bold text-[18px] text-[#222222]">Bộ lọc ban tổ chức</span>
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
      <aside className="hidden lg:block w-[296px] shrink-0 bg-white border border-[#ededed] rounded-[8px] p-4 shadow-xs sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto custom-scrollbar">
        {filterContent}
      </aside>
    </>
  )
}
