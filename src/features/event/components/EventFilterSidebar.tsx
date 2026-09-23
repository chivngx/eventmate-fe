"use client"

import {
  FilterSidebarShell,
  FilterSection,
  FilterPillGroup,
  FilterCheckboxRow,
  ActiveChipItem,
} from "@/components/common/FilterSidebarLayout"

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
  availableWards?: Array<{ id: number; name: string }>
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
  { id: "all", label: "Tất cả" },
  { id: "24h", label: "24 giờ qua" },
  { id: "3d", label: "3 ngày qua" },
  { id: "7d", label: "7 ngày qua" },
  { id: "14d", label: "14 ngày qua" },
]

export default function EventFilterSidebar({
  filters,
  onFilterChange,
  onResetFilters,
  availableCategories,
  availablePositions,
}: EventFilterSidebarProps) {
  // Active filters count
  const activeCount =
    filters.categories.length +
    filters.positions.length +
    filters.salaryTypes.length +
    filters.paymentMethods.length +
    (filters.dateRange && filters.dateRange !== "all" ? 1 : 0)

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

  // Build active chips list
  const activeChips: ActiveChipItem[] = [
    ...filters.categories.map((c) => ({
      id: `cat-${c}`,
      label: c,
      onRemove: () => handleToggleCategory(c),
    })),
    ...filters.positions.map((p) => ({
      id: `pos-${p}`,
      label: p,
      onRemove: () => handleTogglePosition(p),
    })),
    ...filters.salaryTypes.map((s) => ({
      id: `sal-${s}`,
      label: SALARY_TYPE_OPTIONS.find((o) => o.id === s)?.label || s,
      onRemove: () => handleToggleSalary(s),
    })),
    ...filters.paymentMethods.map((m) => ({
      id: `pay-${m}`,
      label: PAYMENT_METHOD_OPTIONS.find((o) => o.id === m)?.label || m,
      onRemove: () => handleTogglePaymentMethod(m),
    })),
    ...(filters.dateRange && filters.dateRange !== "all"
      ? [
          {
            id: `date-${filters.dateRange}`,
            label: DATE_OPTIONS.find((o) => o.id === filters.dateRange)?.label || filters.dateRange,
            onRemove: () => handleSelectDate("all"),
          },
        ]
      : []),
  ]

  return (
    <FilterSidebarShell
      title="Bộ lọc"
      mobileTitle="Bộ lọc tìm kiếm việc làm"
      activeCount={activeCount}
      onResetFilters={onResetFilters}
      activeChips={activeChips}
    >
      {/* 1. Danh mục sự kiện */}
      <FilterSection title="Danh mục sự kiện" count={filters.categories.length}>
        <div className="flex flex-col gap-0.5">
          {categoryOptions.map((opt) => (
            <FilterCheckboxRow
              key={opt.id}
              checked={filters.categories.includes(opt.id)}
              onChange={() => handleToggleCategory(opt.id)}
              label={opt.label}
            />
          ))}
        </div>
      </FilterSection>

      {/* 2. Vị trí tuyển dụng */}
      <FilterSection title="Vị trí tuyển dụng" count={filters.positions.length}>
        <div className="flex flex-col gap-0.5">
          {positionOptions.map((opt) => (
            <FilterCheckboxRow
              key={opt.id}
              checked={filters.positions.includes(opt.id)}
              onChange={() => handleTogglePosition(opt.id)}
              label={opt.label}
            />
          ))}
        </div>
      </FilterSection>

      {/* 3. Thời gian đăng */}
      <FilterSection
        title="Thời gian đăng"
        hasActiveDot={Boolean(filters.dateRange && filters.dateRange !== "all")}
      >
        <FilterPillGroup
          options={DATE_OPTIONS}
          value={filters.dateRange || "all"}
          onChange={handleSelectDate}
        />
      </FilterSection>

      {/* 4. Hình thức thù lao */}
      <FilterSection title="Hình thức thù lao" count={filters.salaryTypes.length}>
        <div className="flex flex-col gap-0.5">
          {SALARY_TYPE_OPTIONS.map((opt) => (
            <FilterCheckboxRow
              key={opt.id}
              checked={filters.salaryTypes.includes(opt.id)}
              onChange={() => handleToggleSalary(opt.id)}
              label={opt.label}
            />
          ))}
        </div>
      </FilterSection>

      {/* 5. Phương thức thanh toán */}
      <FilterSection title="Phương thức thanh toán" count={filters.paymentMethods.length}>
        <div className="flex flex-col gap-0.5">
          {PAYMENT_METHOD_OPTIONS.map((opt) => (
            <FilterCheckboxRow
              key={opt.id}
              checked={filters.paymentMethods.includes(opt.id)}
              onChange={() => handleTogglePaymentMethod(opt.id)}
              label={opt.label}
            />
          ))}
        </div>
      </FilterSection>
    </FilterSidebarShell>
  )
}
