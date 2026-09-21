"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown, RotateCcw, Filter, X } from "lucide-react"
import Checkbox from "@/components/ui/checkbox"

export interface JobFilterState {
  categories: string[]
  positions: string[]
  salaryTypes: string[]
  paymentMethods: string[]
  dateRange: string
  wards: string[]
}

export interface EventFilterSidebarProps {
  filters: JobFilterState
  onFilterChange: (newFilters: JobFilterState) => void
  onResetFilters: () => void
  availableWards: Array<{ id: number; name: string }>
  availableCategories?: Array<{ id?: number | string; name: string }>
  availablePositions?: Array<{ id?: number | string; name: string }>
}

export const DEFAULT_CATEGORY_OPTIONS = [
  { id: "Lễ hội Âm nhạc", label: "Lễ hội Âm nhạc" },
  { id: "Hội thảo / Workshop", label: "Hội thảo / Workshop" },
  { id: "Giải đấu Thể thao", label: "Giải đấu Thể thao" },
  { id: "Giao lưu Văn hóa", label: "Giao lưu Văn hóa" },
  { id: "Triển lãm / Hội chợ", label: "Triển lãm / Hội chợ" },
  { id: "Sự kiện Công nghệ", label: "Sự kiện Công nghệ" },
]

export const DEFAULT_POSITION_OPTIONS = [
  { id: "Tình nguyện viên", label: "Tình nguyện viên" },
  { id: "Điều phối viên (Coordinator)", label: "Điều phối viên (Coordinator)" },
  { id: "CTV Truyền thông", label: "CTV Truyền thông" },
  { id: "Hậu cần & Setup", label: "Hậu cần & Setup" },
  { id: "MC / Hoạt náo viên", label: "MC / Hoạt náo viên" },
  { id: "Hỗ trợ khách mời", label: "Hỗ trợ khách mời" },
]

export const SALARY_TYPE_OPTIONS = [
  { id: "per_shift", label: "Thù lao theo ca" },
  { id: "per_hour", label: "Thù lao theo giờ" },
  { id: "per_event", label: "Trọn gói sự kiện" },
  { id: "volunteer", label: "Tình nguyện viên" },
]

export const PAYMENT_METHOD_OPTIONS = [
  { id: "cash_after_event", label: "Tiền mặt sau sự kiện" },
  { id: "bank_transfer", label: "Chuyển khoản sau ca" },
  { id: "after_project", label: "Quyết toán sau sự kiện" },
]

export const DATE_OPTIONS = [
  { id: "all", label: "Tất cả thời gian" },
  { id: "24h", label: "24 giờ qua" },
  { id: "3d", label: "3 ngày qua" },
  { id: "7d", label: "7 ngày qua" },
  { id: "14d", label: "14 ngày qua" },
]

export default function EventFilterSidebar({
  filters,
  onFilterChange,
  onResetFilters,
  availableWards,
  availableCategories,
  availablePositions,
}: EventFilterSidebarProps) {
  const [openSections, setOpenSections] = useState({
    categories: true,
    positions: true,
    salary: true,
    payment: false,
    date: false,
    wards: true,
  })
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Active filters count
  const activeCount =
    filters.categories.length +
    filters.positions.length +
    filters.salaryTypes.length +
    filters.paymentMethods.length +
    (filters.dateRange && filters.dateRange !== "all" ? 1 : 0) +
    filters.wards.length

  const handleToggleCategory = (catName: string) => {
    const updated = filters.categories.includes(catName)
      ? filters.categories.filter((c) => c !== catName)
      : [...filters.categories, catName]
    onFilterChange({ ...filters, categories: updated })
  }

  const handleTogglePosition = (posName: string) => {
    const updated = filters.positions.includes(posName)
      ? filters.positions.filter((p) => p !== posName)
      : [...filters.positions, posName]
    onFilterChange({ ...filters, positions: updated })
  }

  const handleToggleSalary = (sal: string) => {
    const updated = filters.salaryTypes.includes(sal)
      ? filters.salaryTypes.filter((s) => s !== sal)
      : [...filters.salaryTypes, sal]
    onFilterChange({ ...filters, salaryTypes: updated })
  }

  const handleTogglePaymentMethod = (method: string) => {
    const updated = filters.paymentMethods.includes(method)
      ? filters.paymentMethods.filter((m) => m !== method)
      : [...filters.paymentMethods, method]
    onFilterChange({ ...filters, paymentMethods: updated })
  }

  const handleSelectDate = (dateId: string) => {
    onFilterChange({
      ...filters,
      dateRange: filters.dateRange === dateId ? "all" : dateId,
    })
  }

  const handleToggleWard = (wardName: string) => {
    const updated = filters.wards.includes(wardName)
      ? filters.wards.filter((w) => w !== wardName)
      : [...filters.wards, wardName]
    onFilterChange({ ...filters, wards: updated })
  }

  // Categories list to render (dynamic or default)
  const categoryOptions =
    availableCategories && availableCategories.length > 0
      ? availableCategories.map((c) => ({ id: c.name, label: c.name }))
      : DEFAULT_CATEGORY_OPTIONS

  // Positions list to render (dynamic or default)
  const positionOptions =
    availablePositions && availablePositions.length > 0
      ? availablePositions.map((p) => ({ id: p.name, label: p.name }))
      : DEFAULT_POSITION_OPTIONS

  const filterContent = (
    <div className="flex flex-col gap-2 text-sm w-full">
      {/* Header: All Filters / Active count */}
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
          {filters.categories.map((c) => (
            <span
              key={`cat-${c}`}
              className="bg-[#ededed] text-[#353535] text-[13px] font-medium px-2 py-1 rounded-[6px] flex items-center gap-1"
            >
              {c}
              <button
                type="button"
                onClick={() => handleToggleCategory(c)}
                className="hover:text-red-500 cursor-pointer"
                title="Bỏ chọn danh mục"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}

          {filters.positions.map((p) => (
            <span
              key={`pos-${p}`}
              className="bg-[#ededed] text-[#353535] text-[13px] font-medium px-2 py-1 rounded-[6px] flex items-center gap-1"
            >
              {p}
              <button
                type="button"
                onClick={() => handleTogglePosition(p)}
                className="hover:text-red-500 cursor-pointer"
                title="Bỏ chọn vị trí"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}

          {filters.salaryTypes.map((s) => {
            const opt = SALARY_TYPE_OPTIONS.find((o) => o.id === s)
            return (
              <span
                key={`sal-${s}`}
                className="bg-[#ededed] text-[#353535] text-[13px] font-medium px-2 py-1 rounded-[6px] flex items-center gap-1"
              >
                {opt?.label || s}
                <button
                  type="button"
                  onClick={() => handleToggleSalary(s)}
                  className="hover:text-red-500 cursor-pointer"
                  title="Bỏ chọn mức thù lao"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )
          })}

          {filters.paymentMethods.map((m) => {
            const opt = PAYMENT_METHOD_OPTIONS.find((o) => o.id === m)
            return (
              <span
                key={`pay-${m}`}
                className="bg-[#ededed] text-[#353535] text-[13px] font-medium px-2 py-1 rounded-[6px] flex items-center gap-1"
              >
                {opt?.label || m}
                <button
                  type="button"
                  onClick={() => handleTogglePaymentMethod(m)}
                  className="hover:text-red-500 cursor-pointer"
                  title="Bỏ chọn phương thức thanh toán"
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
                title="Bỏ lọc thời gian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {filters.wards.map((w) => (
            <span
              key={`ward-${w}`}
              className="bg-[#ededed] text-[#353535] text-[13px] font-medium px-2 py-1 rounded-[6px] flex items-center gap-1"
            >
              {w}
              <button
                type="button"
                onClick={() => handleToggleWard(w)}
                className="hover:text-red-500 cursor-pointer"
                title="Bỏ chọn khu vực"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Accordion 1: Danh mục sự kiện */}
      <div className="border-b border-[#ededed] py-2.5">
        <button
          type="button"
          onClick={() => toggleSection("categories")}
          className="w-full flex items-center justify-between py-1 font-medium text-[#282828] text-[18px] text-left cursor-pointer"
        >
          <span>Danh mục sự kiện</span>
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
                onChange={() => handleToggleCategory(opt.id)}
                label={opt.label}
              />
            ))}
          </div>
        )}
      </div>

      {/* Accordion 2: Vị trí tuyển dụng */}
      <div className="border-b border-[#ededed] py-2.5">
        <button
          type="button"
          onClick={() => toggleSection("positions")}
          className="w-full flex items-center justify-between py-1 font-medium text-[#282828] text-[18px] text-left cursor-pointer"
        >
          <span>Vị trí tuyển dụng</span>
          {openSections.positions ? (
            <ChevronUp className="w-5 h-5 text-[#515151]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#515151]" />
          )}
        </button>
        {openSections.positions && (
          <div className="mt-2 flex flex-col gap-1">
            {positionOptions.map((opt) => (
              <Checkbox
                key={opt.id}
                checked={filters.positions.includes(opt.id)}
                onChange={() => handleTogglePosition(opt.id)}
                label={opt.label}
              />
            ))}
          </div>
        )}
      </div>

      {/* Accordion 3: Hình thức thù lao */}
      <div className="border-b border-[#ededed] py-2.5">
        <button
          type="button"
          onClick={() => toggleSection("salary")}
          className="w-full flex items-center justify-between py-1 font-medium text-[#282828] text-[18px] text-left cursor-pointer"
        >
          <span>Hình thức thù lao</span>
          {openSections.salary ? (
            <ChevronUp className="w-5 h-5 text-[#515151]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#515151]" />
          )}
        </button>
        {openSections.salary && (
          <div className="mt-2 flex flex-col gap-1">
            {SALARY_TYPE_OPTIONS.map((opt) => (
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

      {/* Accordion 4: Phương thức thanh toán */}
      <div className="border-b border-[#ededed] py-2.5">
        <button
          type="button"
          onClick={() => toggleSection("payment")}
          className="w-full flex items-center justify-between py-1 font-medium text-[#282828] text-[18px] text-left cursor-pointer"
        >
          <span>Phương thức thanh toán</span>
          {openSections.payment ? (
            <ChevronUp className="w-5 h-5 text-[#515151]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#515151]" />
          )}
        </button>
        {openSections.payment && (
          <div className="mt-2 flex flex-col gap-1">
            {PAYMENT_METHOD_OPTIONS.map((opt) => (
              <Checkbox
                key={opt.id}
                checked={filters.paymentMethods.includes(opt.id)}
                onChange={() => handleTogglePaymentMethod(opt.id)}
                label={opt.label}
              />
            ))}
          </div>
        )}
      </div>

      {/* Accordion 5: Thời gian đăng */}
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

      {/* Accordion 6: Khu vực tại Đà Nẵng */}
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
            {availableWards.length > 0 ? (
              availableWards.map((ward) => (
                <Checkbox
                  key={ward.id}
                  checked={filters.wards.includes(ward.name)}
                  onChange={() => handleToggleWard(ward.name)}
                  label={ward.name}
                />
              ))
            ) : (
              <p className="text-xs text-[#757575] py-1">Đang tải danh sách khu vực...</p>
            )}
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
      <aside className="hidden lg:block w-[296px] shrink-0 bg-white border border-[#ededed] rounded-[8px] p-4 shadow-xs sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto custom-scrollbar">
        {filterContent}
      </aside>
    </>
  )
}
