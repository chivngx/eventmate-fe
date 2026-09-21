"use client"

import React from "react"
import CommonSearchBar, { QuickFilterOption } from "@/components/common/SearchBar"

export type QuickFilterType = "popular" | "viewed" | "top_rated" | "most_events"

export interface CompanySearchBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedLocation: string
  onLocationChange: (value: string) => void
  activeQuickFilter: QuickFilterType
  onQuickFilterChange: (filter: QuickFilterType) => void
  wards: Array<{ id: number; name: string }>
  onSearchSubmit?: () => void
}

const QUICK_FILTERS: Array<QuickFilterOption<QuickFilterType>> = [
  { id: "popular", label: "Phổ biến nhất" },
  { id: "viewed", label: "Xem nhiều nhất" },
  { id: "top_rated", label: "Đánh giá cao" },
  { id: "most_events", label: "Tuyển dụng sôi nổi" },
]

export default function CompanySearchBar({
  searchTerm,
  onSearchChange,
  selectedLocation,
  onLocationChange,
  activeQuickFilter,
  onQuickFilterChange,
  wards,
  onSearchSubmit,
}: CompanySearchBarProps) {
  return (
    <CommonSearchBar<QuickFilterType>
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      selectedLocation={selectedLocation}
      onLocationChange={onLocationChange}
      wards={wards}
      placeholder="Tìm theo tên ban tổ chức, từ khóa..."
      searchButtonText="Tìm kiếm"
      onSearchSubmit={onSearchSubmit}
      quickFilters={QUICK_FILTERS}
      activeQuickFilter={activeQuickFilter}
      onQuickFilterChange={onQuickFilterChange}
    />
  )
}
