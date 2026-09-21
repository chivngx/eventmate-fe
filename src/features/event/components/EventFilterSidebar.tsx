"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown, RotateCcw, Filter, X } from "lucide-react"
import Checkbox from "@/components/ui/checkbox"

export interface JobFilterState {
  workModes: string[]
  jobTypes: string[]
  dateRange: string
  salaryTypes: string[]
  wards: string[]
}

export interface EventFilterSidebarProps {
  filters: JobFilterState
  onFilterChange: (newFilters: JobFilterState) => void
  onResetFilters: () => void
  availableWards: Array<{ id: number; name: string }>
}

export const WORK_MODE_OPTIONS = [
  { id: "onsite", label: "Tại sự kiện (Onsite)" },
  { id: "hybrid", label: "Linh hoạt (Hybrid)" },
  { id: "remote", label: "Từ xa (Remote)" },
]

export const JOB_TYPE_OPTIONS = [
  { id: "fulltime", label: "Toàn thời gian" },
  { id: "parttime", label: "Bán thời gian" },
  { id: "shift", label: "Theo ca / Thời vụ" },
  { id: "volunteer", label: "Tình nguyện viên" },
  { id: "contract", label: "Hợp đồng" },
]

export const DATE_OPTIONS = [
  { id: "all", label: "Tất cả thời gian" },
  { id: "24h", label: "24 giờ qua" },
  { id: "3d", label: "3 ngày qua" },
  { id: "7d", label: "7 ngày qua" },
  { id: "14d", label: "14 ngày qua" },
]

export const SALARY_OPTIONS = [
  { id: "hourly", label: "Thù lao theo giờ" },
  { id: "shift", label: "Thù lao theo ca" },
  { id: "fixed", label: "Trọn gói sự kiện" },
  { id: "negotiable", label: "Thỏa thuận" },
  { id: "volunteer", label: "Tình nguyện viên" },
]

export default function EventFilterSidebar({
  filters,
  onFilterChange,
  onResetFilters,
  availableWards,
}: EventFilterSidebarProps) {
  const [openSections, setOpenSections] = useState({
    workModes: true,
    jobTypes: true,
    date: true,
    salary: true,
    wards: true,
  })
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Active filters count
  const activeCount =
    filters.workModes.length +
    filters.jobTypes.length +
    (filters.dateRange && filters.dateRange !== "all" ? 1 : 0) +
    filters.salaryTypes.length +
    filters.wards.length

  const handleToggleWorkMode = (mode: string) => {
    const updated = filters.workModes.includes(mode)
      ? filters.workModes.filter((m) => m !== mode)
      : [...filters.workModes, mode]
    onFilterChange({ ...filters, workModes: updated })
  }

  const handleToggleJobType = (type: string) => {
    const updated = filters.jobTypes.includes(type)
      ? filters.jobTypes.filter((t) => t !== type)
      : [...filters.jobTypes, type]
    onFilterChange({ ...filters, jobTypes: updated })
  }

  const handleSelectDate = (dateId: string) => {
    onFilterChange({
      ...filters,
      dateRange: filters.dateRange === dateId ? "all" : dateId,
    })
  }

  const handleToggleSalary = (sal: string) => {
    const updated = filters.salaryTypes.includes(sal)
      ? filters.salaryTypes.filter((s) => s !== sal)
      : [...filters.salaryTypes, sal]
    onFilterChange({ ...filters, salaryTypes: updated })
  }

  const handleToggleWard = (wardName: string) => {
    const updated = filters.wards.includes(wardName)
      ? filters.wards.filter((w) => w !== wardName)
      : [...filters.wards, wardName]
    onFilterChange({ ...filters, wards: updated })
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

      {/* Active Filter Tags (Figma node 4343:66317) */}
      {activeCount > 0 && (
        <div className="py-2.5 border-b border-[#ededed] flex flex-wrap gap-1.5">
          {filters.jobTypes.map((t) => {
            const opt = JOB_TYPE_OPTIONS.find((o) => o.id === t)
            return (
              <span
                key={t}
                className="bg-[#ededed] text-[#353535] text-[13px] font-medium px-2 py-1 rounded-[6px] flex items-center gap-1"
              >
                {opt?.label || t}
                <button
                  type="button"
                  onClick={() => handleToggleJobType(t)}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )
          })}
          {filters.workModes.map((m) => {
            const opt = WORK_MODE_OPTIONS.find((o) => o.id === m)
            return (
              <span
                key={m}
                className="bg-[#ededed] text-[#353535] text-[13px] font-medium px-2 py-1 rounded-[6px] flex items-center gap-1"
              >
                {opt?.label || m}
                <button
                  type="button"
                  onClick={() => handleToggleWorkMode(m)}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )
          })}
          {filters.dateRange && filters.dateRange !== "all" && (
            <span className="bg-[#ededed] text-[#353535] text-[13px] font-medium px-2 py-1 rounded-[6px] flex items-center gap-1">
              {DATE_OPTIONS.find((o) => o.id === filters.dateRange)?.label}
              <button
                type="button"
                onClick={() => handleSelectDate("all")}
                className="hover:text-red-500 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {filters.wards.map((w) => (
            <span
              key={w}
              className="bg-[#ededed] text-[#353535] text-[13px] font-medium px-2 py-1 rounded-[6px] flex items-center gap-1"
            >
              {w}
              <button
                type="button"
                onClick={() => handleToggleWard(w)}
                className="hover:text-red-500 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Accordion 1: Loại hình công việc (Figma node 6242:29597) */}
      <div className="border-b border-[#ededed] py-2.5">
        <button
          type="button"
          onClick={() => toggleSection("jobTypes")}
          className="w-full flex items-center justify-between py-1 font-medium text-[#282828] text-[18px] text-left cursor-pointer"
        >
          <span>Loại hình công việc</span>
          {openSections.jobTypes ? (
            <ChevronUp className="w-5 h-5 text-[#515151]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#515151]" />
          )}
        </button>
        {openSections.jobTypes && (
          <div className="mt-2 flex flex-col gap-1">
            {JOB_TYPE_OPTIONS.map((opt) => (
              <Checkbox
                key={opt.id}
                checked={filters.jobTypes.includes(opt.id)}
                onChange={() => handleToggleJobType(opt.id)}
                label={opt.label}
              />
            ))}
          </div>
        )}
      </div>

      {/* Accordion 2: Thời gian đăng (Figma node 6242:26584) */}
      <div className="border-b border-[#ededed] py-2.5">
        <button
          type="button"
          onClick={() => toggleSection("date")}
          className="w-full flex items-center justify-between py-1 font-medium text-[#282828] text-[18px] text-left cursor-pointer"
        >
          <span>Thời gian đăng</span>
          {openSections.date ? (
            <ChevronUp className="w-5 h-5 text-[#515151]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#515151]" />
          )}
        </button>
        {openSections.date && (
          <div className="mt-2 flex flex-col gap-1">
            {DATE_OPTIONS.filter((d) => d.id !== "all").map((opt) => (
              <Checkbox
                key={opt.id}
                checked={filters.dateRange === opt.id}
                onChange={() => handleSelectDate(opt.id)}
                label={opt.label}
              />
            ))}
          </div>
        )}
      </div>

      {/* Accordion 3: Hình thức làm việc (Figma node 6242:40091) */}
      <div className="border-b border-[#ededed] py-2.5">
        <button
          type="button"
          onClick={() => toggleSection("workModes")}
          className="w-full flex items-center justify-between py-1 font-medium text-[#282828] text-[18px] text-left cursor-pointer"
        >
          <span>Hình thức làm việc</span>
          {openSections.workModes ? (
            <ChevronUp className="w-5 h-5 text-[#515151]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#515151]" />
          )}
        </button>
        {openSections.workModes && (
          <div className="mt-2 flex flex-col gap-1">
            {WORK_MODE_OPTIONS.map((opt) => (
              <Checkbox
                key={opt.id}
                checked={filters.workModes.includes(opt.id)}
                onChange={() => handleToggleWorkMode(opt.id)}
                label={opt.label}
              />
            ))}
          </div>
        )}
      </div>

      {/* Accordion 4: Mức thù lao (Figma node 6242:41546) */}
      <div className="border-b border-[#ededed] py-2.5">
        <button
          type="button"
          onClick={() => toggleSection("salary")}
          className="w-full flex items-center justify-between py-1 font-medium text-[#282828] text-[18px] text-left cursor-pointer"
        >
          <span>Mức thù lao</span>
          {openSections.salary ? (
            <ChevronUp className="w-5 h-5 text-[#515151]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#515151]" />
          )}
        </button>
        {openSections.salary && (
          <div className="mt-2 flex flex-col gap-1">
            {SALARY_OPTIONS.map((opt) => (
              <Checkbox
                key={opt.id}
                checked={filters.salaryTypes.includes(opt.id)}
                onChange={() => handleToggleSalary(opt.id)}
                label={opt.label}
              />
            ))}
          </div>
        )}
      </div>

      {/* Accordion 5: Khu vực tại Đà Nẵng */}
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
          <div className="mt-2 max-h-52 overflow-y-auto pr-1 flex flex-col gap-1 custom-scrollbar">
            {availableWards.map((ward) => (
              <Checkbox
                key={ward.id}
                checked={filters.wards.includes(ward.name)}
                onChange={() => handleToggleWard(ward.name)}
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
            <span>Bộ lọc tìm kiếm việc làm</span>
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
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-5 flex flex-col shadow-xl z-10 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#ededed] mb-3">
              <span className="font-bold text-[18px] text-[#222222]">Bộ lọc việc làm</span>
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

      {/* Desktop Persistent Sidebar (Figma node 6295:27389: 296px width, rounded 8px) */}
      <aside className="hidden lg:block w-[296px] shrink-0 bg-white border border-[#ededed] rounded-[8px] p-4 shadow-xs sticky top-24 self-start">
        {filterContent}
      </aside>
    </>
  )
}
