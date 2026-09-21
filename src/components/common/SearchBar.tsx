"use client"

import React from "react"
import { Search, MapPin, ChevronDown } from "lucide-react"

export interface QuickFilterOption<T extends string = string> {
  id: T
  label: string
}

export interface SearchBarProps<T extends string = string> {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedLocation: string
  onLocationChange: (value: string) => void
  wards: Array<{ id?: number | string; name: string } | any>
  placeholder?: string
  searchButtonText?: string
  onSearchSubmit?: () => void
  quickFilters?: Array<QuickFilterOption<T>>
  activeQuickFilter?: T
  onQuickFilterChange?: (filterId: T) => void
  className?: string
}

export default function SearchBar<T extends string = string>({
  searchTerm,
  onSearchChange,
  selectedLocation,
  onLocationChange,
  wards = [],
  placeholder = "Tìm kiếm từ khóa...",
  searchButtonText = "Tìm kiếm",
  onSearchSubmit,
  quickFilters,
  activeQuickFilter,
  onQuickFilterChange,
  className = "",
}: SearchBarProps<T>) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearchSubmit) onSearchSubmit()
  }

  const marginClass = className.includes("mx-") ? "" : "mx-auto"

  return (
    <div className={`w-full max-w-[608px] ${marginClass} flex flex-col gap-5 ${className}`}>
      {/* 608x56px Search Box matching Figma (nodes 5875:24879, 6295:27418 & 7182:22171) */}
      <form
        onSubmit={handleSubmit}
        className="w-full h-14 bg-white border border-[#cbcbcb] rounded-[8px] flex items-stretch overflow-hidden shadow-[0_4px_20px_rgba(0,93,220,0.06)] focus-within:border-[#005ddc] focus-within:ring-2 focus-within:ring-[#005ddc]/20 transition-all"
      >
        {/* Keyword Search Input */}
        <div className="flex-1 flex items-center pl-4 pr-2 min-w-0">
          <Search className="w-5 h-5 text-[#a5a5a5] shrink-0 mr-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent border-0 text-[#222222] placeholder:text-[#a5a5a5] text-[15px] sm:text-[16px] font-medium focus:outline-none"
          />
        </div>

        {/* Divider */}
        <div className="w-px bg-[#ededed] my-3 shrink-0" />

        {/* Location Dropdown */}
        <div className="relative flex items-center px-3 sm:px-4 min-w-[140px] sm:min-w-[190px] max-w-[210px] shrink-0">
          <MapPin className="w-5 h-5 text-[#005ddc] shrink-0 mr-2" />
          <select
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
            aria-label="Chọn khu vực quận huyện"
            className="w-full bg-transparent border-0 text-[#222222] text-[14px] sm:text-[15px] font-medium focus:outline-none cursor-pointer appearance-none pr-6 truncate"
          >
            <option value="">Tất cả khu vực</option>
            {wards.map((ward) => (
              <option key={ward.id ?? ward.name} value={ward.name}>
                {ward.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-[#515151] pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Search Action Button */}
        <button
          type="submit"
          aria-label={searchButtonText}
          className="bg-[#005ddc] hover:bg-[#004eb7] active:scale-[0.98] text-white px-5 sm:px-7 h-full flex items-center justify-center gap-2 font-medium text-[15px] sm:text-[16px] transition-all shrink-0 cursor-pointer rounded-r-[7px]"
        >
          <Search className="w-5 h-5" />
          <span className="hidden xs:inline">{searchButtonText}</span>
        </button>
      </form>

      {/* Optional Quick Filter Pills (Figma node 5875:24880: 40px height, rounded 8px) */}
      {quickFilters && quickFilters.length > 0 && (
        <div className="w-full flex items-center justify-center sm:justify-between gap-2.5 sm:gap-3 flex-wrap sm:flex-nowrap">
          {quickFilters.map((pill) => {
            const isActive = activeQuickFilter === pill.id
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => onQuickFilterChange?.(pill.id)}
                className={`h-10 px-3.5 sm:px-4 rounded-[8px] text-[13px] sm:text-[14px] font-medium transition-all cursor-pointer whitespace-nowrap border flex-1 text-center ${
                  isActive
                    ? "bg-[#eff5ff] border-[#005ddc] text-[#005ddc] font-semibold"
                    : "bg-white border-[#ededed] text-[#515151] hover:border-[#cbcbcb] hover:text-[#222222]"
                }`}
              >
                {pill.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
