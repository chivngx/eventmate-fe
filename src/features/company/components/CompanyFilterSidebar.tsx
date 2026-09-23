"use client"

import React from "react"
import {
  FilterSidebarShell,
  FilterSection,
  FilterPillGroup,
  FilterCheckboxRow,
  ActiveChipItem,
} from "@/components/common/FilterSidebarLayout"

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
  const activeCount =
    (filters.onlyHiring ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0) +
    (filters.categories?.length || 0) +
    (filters.sortBy && filters.sortBy !== "popular" ? 1 : 0)

  const statusCount =
    (filters.onlyHiring ? 1 : 0) + (filters.verifiedOnly ? 1 : 0)

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

  // Active chips
  const activeChips: ActiveChipItem[] = [
    ...(filters.onlyHiring
      ? [
          {
            id: "only-hiring",
            label: "Đang tuyển dụng",
            onRemove: handleHiringToggle,
          },
        ]
      : []),
    ...(filters.verifiedOnly
      ? [
          {
            id: "verified-only",
            label: "Đã xác thực",
            onRemove: handleVerifiedToggle,
          },
        ]
      : []),
    ...filters.categories.map((c) => ({
      id: `cat-${c}`,
      label: c,
      onRemove: () => handleCategoryToggle(c),
    })),
    ...(filters.sortBy && filters.sortBy !== "popular"
      ? [
          {
            id: `sort-${filters.sortBy}`,
            label: SORT_OPTIONS.find((s) => s.id === filters.sortBy)?.label || filters.sortBy,
            onRemove: () => handleSortChange("popular"),
            isBlue: true,
          },
        ]
      : []),
  ]

  return (
    <FilterSidebarShell
      title="Bộ lọc"
      mobileTitle="Bộ lọc ban tổ chức"
      activeCount={activeCount}
      onResetFilters={onResetFilters}
      activeChips={activeChips}
    >
      {/* 1. Sắp xếp theo */}
      <FilterSection
        title="Sắp xếp theo"
        hasActiveDot={Boolean(filters.sortBy && filters.sortBy !== "popular")}
      >
        <FilterPillGroup
          options={SORT_OPTIONS}
          value={filters.sortBy || "popular"}
          onChange={(val) => handleSortChange(val as QuickFilterType)}
        />
      </FilterSection>

      {/* 2. Trạng thái & Xác thực */}
      <FilterSection title="Trạng thái & Xác thực" count={statusCount}>
        <div className="flex flex-col gap-0.5">
          <FilterCheckboxRow
            checked={filters.onlyHiring}
            onChange={handleHiringToggle}
            label="Đang có sự kiện tuyển dụng"
          />
          <FilterCheckboxRow
            checked={filters.verifiedOnly}
            onChange={handleVerifiedToggle}
            label="Đã xác thực danh tính"
          />
        </div>
      </FilterSection>

      {/* 3. Lĩnh vực sự kiện */}
      <FilterSection title="Lĩnh vực sự kiện" count={filters.categories.length}>
        <div className="flex flex-col gap-0.5">
          {categoryOptions.map((opt) => (
            <FilterCheckboxRow
              key={opt.id}
              checked={filters.categories.includes(opt.id)}
              onChange={() => handleCategoryToggle(opt.id)}
              label={opt.label}
            />
          ))}
        </div>
      </FilterSection>
    </FilterSidebarShell>
  )
}
