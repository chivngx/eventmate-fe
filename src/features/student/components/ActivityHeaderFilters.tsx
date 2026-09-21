"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Check } from "lucide-react"

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
  { id: "rejected", label: "Bị từ chối" },
  { id: "accepted", label: "Trúng tuyển" },
  { id: "interviewed", label: "Đã phỏng vấn" },
]

export default function ActivityHeaderFilters({
  activeTab,
  onTabChange,
  statusFilter,
  onStatusFilterChange,
  sortOrder,
  onSortOrderChange,
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
    <div
      className="flex flex-col gap-[32px] items-start relative w-full"
      data-node-id="6447:50552"
    >
      {/* 1. Main Navigation Tabs (Figma: Frame 2147225696, node 6447:50553) */}
      <div
        className="border-b border-[#ededed] flex gap-[16px] items-center relative shrink-0 w-full overflow-x-auto no-scrollbar"
        data-node-id="6447:50553"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex gap-[8px] h-[40px] items-center justify-center px-[16px] py-[8px] relative shrink-0 cursor-pointer font-medium text-[16px] leading-normal transition-colors whitespace-nowrap ${
                isActive
                  ? "border-b-2 border-[#005ddc] -mb-[1px] text-[#005ddc]"
                  : "text-[#a5a5a5] hover:text-[#515151]"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* 2. Sub-Filter Pills & Sort Action Bar (Figma: Frame 2147225425, node 6447:50554) */}
      {activeTab === "apply_status" && (
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative shrink-0 w-full"
          data-node-id="6447:50554"
        >
          {/* Status Filter Pills (Figma: Frame 2147225248, node 6447:50555) */}
          <div
            className="flex gap-[8px] items-center relative shrink-0 overflow-x-auto no-scrollbar pb-0.5"
            data-node-id="6447:50555"
          >
            {STATUS_PILLS.map((pill) => {
              const isSelected = statusFilter === pill.id
              return (
                <button
                  key={pill.id}
                  onClick={() => onStatusFilterChange(pill.id)}
                  className={`flex gap-[8px] h-[32px] items-center justify-center px-[16px] py-[8px] relative rounded-[8px] shrink-0 cursor-pointer font-medium text-[14px] leading-[1.6] transition-all whitespace-nowrap ${
                    isSelected
                      ? "bg-[#005ddc] text-white shadow-xs"
                      : "border border-[#a5a5a5] text-[#515151] hover:border-[#757575] hover:bg-slate-50 bg-white"
                  }`}
                >
                  {pill.label}
                </button>
              )
            })}
          </div>

          {/* Sort Dropdown Button (Figma: Buttons, node 6447:50562) */}
          <div className="relative self-end sm:self-auto" ref={sortRef}>
            <button
              onClick={() => setSortDropdownOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={sortDropdownOpen}
              className="border border-[#515151] flex gap-[8px] h-[32px] items-center justify-center px-[16px] py-[8px] relative rounded-[8px] shrink-0 cursor-pointer text-[#515151] text-[14px] font-medium leading-[1.6] transition-colors hover:bg-slate-50 bg-white"
              data-node-id="6447:50562"
            >
              <span>{sortOrder === "newest" ? "Mới nhất" : "Cũ nhất"}</span>
              <ChevronDown
                className={`w-4 h-4 text-[#515151] transition-transform duration-200 ${
                  sortDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {sortDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-[8px] border border-[#ededed] shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    onSortOrderChange("newest")
                    setSortDropdownOpen(false)
                  }}
                  className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    sortOrder === "newest"
                      ? "text-[#005ddc] bg-blue-50/60 font-semibold"
                      : "text-[#515151] hover:bg-slate-50"
                  }`}
                >
                  <span>Mới nhất</span>
                  {sortOrder === "newest" && <Check className="w-3.5 h-3.5 text-[#005ddc]" />}
                </button>
                <button
                  onClick={() => {
                    onSortOrderChange("oldest")
                    setSortDropdownOpen(false)
                  }}
                  className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    sortOrder === "oldest"
                      ? "text-[#005ddc] bg-blue-50/60 font-semibold"
                      : "text-[#515151] hover:bg-slate-50"
                  }`}
                >
                  <span>Cũ nhất</span>
                  {sortOrder === "oldest" && <Check className="w-3.5 h-3.5 text-[#005ddc]" />}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
