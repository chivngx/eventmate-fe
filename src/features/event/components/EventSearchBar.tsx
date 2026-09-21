"use client"

import CommonSearchBar from "@/components/common/SearchBar"

export interface EventSearchBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedLocation: string
  onLocationChange: (value: string) => void
  wards: Array<{ id: number; name: string }>
  onSearchSubmit?: () => void
}

export default function EventSearchBar({
  searchTerm,
  onSearchChange,
  selectedLocation,
  onLocationChange,
  wards,
  onSearchSubmit,
}: EventSearchBarProps) {
  return (
    <CommonSearchBar
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      selectedLocation={selectedLocation}
      onLocationChange={onLocationChange}
      wards={wards}
      placeholder="Vị trí, kỹ năng hoặc từ khóa..."
      searchButtonText="Tìm kiếm"
      onSearchSubmit={onSearchSubmit}
    />
  )
}
