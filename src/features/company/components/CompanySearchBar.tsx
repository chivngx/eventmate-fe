"use client"

import React from "react"
import CommonSearchBar from "@/components/common/SearchBar"

export type QuickFilterType = "popular" | "viewed" | "top_rated" | "most_events"

export interface CompanySearchBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedLocation: string
  onLocationChange: (value: string) => void
  wards: Array<{ id: number; name: string }>
  onSearchSubmit?: () => void
  activeQuickFilter?: QuickFilterType
  onQuickFilterChange?: (filter: QuickFilterType) => void
}

export default function CompanySearchBar({
  searchTerm,
  onSearchChange,
  selectedLocation,
  onLocationChange,
  wards,
  onSearchSubmit,
}: CompanySearchBarProps) {
  return (
    <CommonSearchBar
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      selectedLocation={selectedLocation}
      onLocationChange={onLocationChange}
      wards={wards}
      placeholder="Tìm theo tên ban tổ chức, từ khóa..."
      searchButtonText="Tìm kiếm"
      onSearchSubmit={onSearchSubmit}
    />
  )
}
