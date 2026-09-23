"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export type MainTab = "apply_status" | "offered_job" | "saved_job" | "followed_company"
export type StatusFilter = "all" | "applied" | "checked" | "rejected" | "accepted" | "interviewed"
export type SortOrder = "newest" | "oldest"

interface ActivityHeaderFiltersProps {
  activeTab: MainTab
  onTabChange: (tab: MainTab) => void
  statusFilter: StatusFilter
  onStatusFilterChange: (filter: StatusFilter) => void
  sortOrder: SortOrder
  onSortOrderChange: (order: SortOrder) => void
  counts?: {
    apply_status?: number
    offered_job?: number
    saved_job?: number
    followed_company?: number
  }
}

const TABS: { id: MainTab; label: string }[] = [
  { id: "apply_status", label: "Trạng thái ứng tuyển" },
  { id: "offered_job", label: "Lời mời nhận việc" },
  { id: "saved_job", label: "Việc đã lưu" },
  { id: "followed_company", label: "Đơn vị theo dõi" },
]

const STATUS_PILLS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "applied", label: "Đã ứng tuyển" },
  { id: "checked", label: "Đã xem hồ sơ" },
  { id: "accepted", label: "Trúng tuyển" },
  { id: "rejected", label: "Bị từ chối" },
  { id: "interviewed", label: "Đã phỏng vấn" },
]

export default function ActivityHeaderFilters({
  activeTab,
  onTabChange,
  statusFilter,
  onStatusFilterChange,
  sortOrder,
  onSortOrderChange,
  counts = {},
}: ActivityHeaderFiltersProps) {
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="w-full space-y-4">
      {/* 1. Main Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          const count = counts[tab.id] ?? 0
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer whitespace-nowrap shrink-0",
                isActive
                  ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <span>{tab.label}</span>
              {count > 0 && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 text-[11px] font-semibold rounded-full",
                    isActive
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* 2. Sub-Filter Pills & Sort Bar (Only when on apply_status tab) */}
      {activeTab === "apply_status" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {STATUS_PILLS.map((pill) => {
              const isSelected = statusFilter === pill.id
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => onStatusFilterChange(pill.id)}
                  className={cn(
                    "h-8 px-3 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer shrink-0",
                    isSelected
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                      : "bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-zinc-600 dark:text-zinc-400"
                  )}
                >
                  {pill.label}
                </button>
              )
            })}
          </div>

          {/* Sort Dropdown Button */}
          <div className="relative self-end sm:self-auto shrink-0" ref={sortRef}>
            <button
              type="button"
              onClick={() => setSortDropdownOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={sortDropdownOpen}
              className="h-8 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>{sortOrder === "newest" ? "Mới nhất" : "Cũ nhất"}</span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-zinc-500 transition-transform duration-200",
                  sortDropdownOpen && "rotate-180"
                )}
              />
            </button>

            {/* Dropdown Menu */}
            {sortDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-32 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    onSortOrderChange("newest")
                    setSortDropdownOpen(false)
                  }}
                  className={cn(
                    "w-full px-3 py-1.5 text-left text-xs font-medium flex items-center justify-between transition-colors cursor-pointer",
                    sortOrder === "newest"
                      ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  )}
                >
                  <span>Mới nhất</span>
                  {sortOrder === "newest" && <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSortOrderChange("oldest")
                    setSortDropdownOpen(false)
                  }}
                  className={cn(
                    "w-full px-3 py-1.5 text-left text-xs font-medium flex items-center justify-between transition-colors cursor-pointer",
                    sortOrder === "oldest"
                      ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  )}
                >
                  <span>Cũ nhất</span>
                  {sortOrder === "oldest" && <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
