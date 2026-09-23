"use client"

import React, { useState, useRef, useEffect, useMemo } from "react"
import { Search, ChevronDown, X, Check } from "lucide-react"
import { PinIcon } from "@/components/icons"
import { cn } from "@/lib/utils"

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
  const [isLocationOpen, setIsLocationOpen] = useState(false)
  const [wardFilter, setWardFilter] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLocationOpen(false)
    if (onSearchSubmit) onSearchSubmit()
  }

  // Filter wards by search input
  const filteredWards = useMemo(() => {
    if (!wardFilter.trim()) return wards
    const query = wardFilter.trim().toLowerCase()
    return wards.filter((w) => {
      const name = typeof w === "string" ? w : w?.name || ""
      return name.toLowerCase().includes(query)
    })
  }, [wards, wardFilter])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLocationOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLocationOpen(false)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const marginClass = className.includes("mx-") ? "" : "mx-auto"

  return (
    <div className={cn("w-full max-w-[640px] flex flex-col gap-4 relative z-30", marginClass, className)}>
      {/* Floating Island Inset Pill Search Box */}
      <form
        onSubmit={handleSubmit}
        className="w-full h-[58px] sm:h-[62px] bg-white border border-slate-200/90 hover:border-slate-300/90 rounded-full p-1.5 sm:p-2 flex items-center shadow-[0_10px_30px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.02)] focus-within:border-black/30 focus-within:ring-4 focus-within:ring-black/5 transition-all relative z-30"
      >
        {/* Keyword Search Input */}
        <div className="flex-1 flex items-center pl-3.5 sm:pl-4 pr-1 min-w-0 h-full">
          <Search className="w-4.5 h-4.5 text-[#888888] shrink-0 mr-2.5 transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent border-0 text-[#222222] placeholder:text-[#9e9e9e] text-[14px] sm:text-[15px] font-medium focus:outline-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Xóa từ khóa"
              className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors mr-1 cursor-pointer shrink-0"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 shrink-0 mx-0.5 sm:mx-1" />

        {/* Location Dropdown Popover Trigger */}
        <div
          ref={dropdownRef}
          className="relative flex items-center px-2.5 sm:px-3.5 min-w-[130px] sm:min-w-[170px] max-w-[200px] shrink-0 h-full"
        >
          <button
            type="button"
            onClick={() => setIsLocationOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isLocationOpen}
            className="w-full flex items-center justify-between gap-1 text-left focus:outline-none cursor-pointer group py-1"
          >
            <div className="flex items-center min-w-0 pr-1">
              <PinIcon className="w-4.5 h-4.5 text-[#222222] shrink-0 mr-2" />
              <span
                className={cn(
                  "text-[13px] sm:text-[14px] font-medium truncate",
                  selectedLocation ? "text-[#222222]" : "text-[#757575]"
                )}
              >
                {selectedLocation || "Tất cả khu vực"}
              </span>
            </div>
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 text-[#757575] shrink-0 transition-transform duration-200 group-hover:text-[#222222]",
                isLocationOpen && "rotate-180 text-[#222222]"
              )}
            />
          </button>

          {/* Floating Popover Combobox */}
          {isLocationOpen && (
            <div className="absolute top-[calc(100%+8px)] left-0 w-[210px] sm:w-[220px] bg-white border border-slate-200/90 rounded-[16px] shadow-[0_12px_32px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.04)] p-2 z-50 animate-in fade-in-0 zoom-in-95 duration-150 flex flex-col gap-1.5">
              {/* Search filter input inside popover */}
              <div className="relative flex items-center px-2 py-1.5 bg-slate-50 border border-slate-200/80 rounded-[8px] focus-within:border-black/40 focus-within:bg-white focus-within:ring-2 focus-within:ring-black/5 transition-all">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1.5" />
                <input
                  type="text"
                  value={wardFilter}
                  onChange={(e) => setWardFilter(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      if (filteredWards.length > 0) {
                        const first = filteredWards[0]
                        const name = typeof first === "string" ? first : first?.name || ""
                        onLocationChange(name)
                        setIsLocationOpen(false)
                        setWardFilter("")
                      }
                    }
                  }}
                  placeholder="Tìm quận, phường..."
                  className="w-full bg-transparent border-0 text-[12px] font-medium text-[#222222] placeholder:text-slate-400 focus:outline-none"
                  autoFocus
                />
                {wardFilter && (
                  <button
                    type="button"
                    onClick={() => setWardFilter("")}
                    className="p-0.5 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer shrink-0"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>

              {/* Scrollable list */}
              <div className="max-h-[195px] overflow-y-auto overflow-x-hidden space-y-0.5 pr-1 text-left scrollbar-thin [scrollbar-width:thin] [scrollbar-color:#e2e8f0_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
                {/* All locations option */}
                <button
                  type="button"
                  onClick={() => {
                    onLocationChange("")
                    setIsLocationOpen(false)
                    setWardFilter("")
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-1.5 rounded-[8px] text-[12.5px] font-medium transition-colors cursor-pointer text-left",
                    !selectedLocation
                      ? "bg-slate-100 text-[#222222] font-semibold"
                      : "text-[#555555] hover:bg-slate-50 hover:text-[#222222]"
                  )}
                >
                  <span className="truncate">Tất cả khu vực</span>
                  {!selectedLocation && <Check className="w-3.5 h-3.5 text-[#222222] shrink-0 ml-1.5" />}
                </button>

                {/* Filtered Wards */}
                {filteredWards.map((ward) => {
                  const wardName = typeof ward === "string" ? ward : ward?.name || ""
                  if (!wardName) return null
                  const isSelected = selectedLocation === wardName
                  return (
                    <button
                      key={ward?.id ?? wardName}
                      type="button"
                      onClick={() => {
                        onLocationChange(wardName)
                        setIsLocationOpen(false)
                        setWardFilter("")
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-1.5 rounded-[8px] text-[12.5px] font-medium transition-colors cursor-pointer text-left",
                        isSelected
                          ? "bg-slate-100 text-[#222222] font-semibold"
                          : "text-[#555555] hover:bg-slate-50 hover:text-[#222222]"
                      )}
                    >
                      <span className="truncate">{wardName}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#222222] shrink-0 ml-1.5" />}
                    </button>
                  )
                })}

                {filteredWards.length === 0 && (
                  <div className="py-3 text-center text-[11.5px] text-slate-400">
                    Không tìm thấy khu vực phù hợp
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Inset Circular Search Action Button */}
        <button
          type="submit"
          title={searchButtonText}
          aria-label={searchButtonText}
          className="size-[44px] sm:size-[46px] bg-[#222222] hover:bg-black active:scale-[0.94] text-white rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-[0_4px_14px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)]"
        >
          <Search className="size-4.5 sm:size-5 text-white" />
        </button>
      </form>

      {/* Quick Filter Pills */}
      {quickFilters && quickFilters.length > 0 && (
        <div className="w-full flex items-center justify-center sm:justify-between gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap">
          {quickFilters.map((pill) => {
            const isActive = activeQuickFilter === pill.id
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => onQuickFilterChange?.(pill.id)}
                className={cn(
                  "h-9 px-4 rounded-full text-[13px] font-medium transition-all cursor-pointer whitespace-nowrap border flex-1 text-center shadow-2xs",
                  isActive
                    ? "bg-[#222222] border-[#222222] text-white shadow-xs"
                    : "bg-white border-slate-200/90 text-[#555555] hover:bg-slate-50 hover:text-[#222222] hover:border-slate-300"
                )}
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
