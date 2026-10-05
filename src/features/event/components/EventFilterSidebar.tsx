"use client"

import React, { useMemo } from "react"
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

export interface EventFilterItem {
  category?: string | null
  position_type?: string | null
  salary_type?: string | null
  salary_amount?: number | null
  payment_method?: string | null
  created_at?: string | null
  [key: string]: any
}

export interface EventFilterSidebarProps {
  filters: JobFilterState
  onFilterChange: (newFilters: JobFilterState) => void
  onResetFilters: () => void
  availableWards?: Array<{ id: number; name: string }>
  availableCategories?: Array<{ id?: number | string; name: string }>
  availablePositions?: Array<{ id?: number | string; name: string }>
  events?: EventFilterItem[]
  isLoading?: boolean
}


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
  events,
  isLoading,
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

  // 1. Categories: candidate list from availableCategories (DB) + actual events
  const candidateCategories = useMemo(() => {
    const map = new Map<string, string>()

    if (availableCategories && availableCategories.length > 0) {
      availableCategories.forEach((c) => {
        if (c.name) map.set(c.name.trim().toLowerCase(), c.name.trim())
      })
    }

    events?.forEach((j) => {
      if (j.category) {
        const trimmed = j.category.trim()
        const key = trimmed.toLowerCase()
        if (!map.has(key)) {
          map.set(key, trimmed)
        }
      }
    })

    return Array.from(map.values()).map((name) => ({ id: name, label: name }))
  }, [availableCategories, events])

  const visibleCategoryOptions = useMemo(() => {
    if (!events) return candidateCategories

    return candidateCategories.filter((opt) => {
      if (filters.categories.includes(opt.id)) return true
      return events.some((j) => {
        if (!j.category) return false
        return j.category.trim().toLowerCase() === opt.id.toLowerCase()
      })
    })
  }, [candidateCategories, events, filters.categories])

  // 2. Positions: candidate list from availablePositions (DB) + actual events
  const candidatePositions = useMemo(() => {
    const map = new Map<string, string>()

    if (availablePositions && availablePositions.length > 0) {
      availablePositions.forEach((p) => {
        if (p.name) map.set(p.name.trim().toLowerCase(), p.name.trim())
      })
    }

    events?.forEach((j) => {
      if (j.position_type) {
        const parts = j.position_type.split(",").map((s) => s.trim()).filter(Boolean)
        parts.forEach((part) => {
          const key = part.toLowerCase()
          if (!map.has(key)) {
            map.set(key, part)
          }
        })
      }
    })

    return Array.from(map.values()).map((name) => ({ id: name, label: name }))
  }, [availablePositions, events])

  const visiblePositionOptions = useMemo(() => {
    if (!events) return candidatePositions

    return candidatePositions.filter((opt) => {
      if (filters.positions.includes(opt.id)) return true
      const optLower = opt.id.toLowerCase()
      return events.some((j) => {
        if (!j.position_type) return false
        const jPosLower = j.position_type.toLowerCase()
        return jPosLower.includes(optLower) || optLower.includes(jPosLower)
      })
    })
  }, [candidatePositions, events, filters.positions])

  // 3. Salary Types: only showing options with matching events or currently selected
  const visibleSalaryTypeOptions = useMemo(() => {
    if (!events) return SALARY_TYPE_OPTIONS

    return SALARY_TYPE_OPTIONS.filter((opt) => {
      if (filters.salaryTypes.includes(opt.id)) return true
      return events.some((j) => {
        if (opt.id === "volunteer") {
          return j.salary_type === "volunteer" || !j.salary_amount || j.salary_amount === 0
        }
        return j.salary_type === opt.id
      })
    })
  }, [events, filters.salaryTypes])

  // 4. Payment Methods: only showing options with matching events or currently selected
  const visiblePaymentMethodOptions = useMemo(() => {
    if (!events) return PAYMENT_METHOD_OPTIONS

    return PAYMENT_METHOD_OPTIONS.filter((opt) => {
      if (filters.paymentMethods.includes(opt.id)) return true
      return events.some((j) => j.payment_method === opt.id)
    })
  }, [events, filters.paymentMethods])

  // 5. Date Options: only showing ranges with matching events (plus 'all' and currently selected)
  const visibleDateOptions = useMemo(() => {
    if (!events) return DATE_OPTIONS

    const now = Date.now()
    const ranges: Record<string, number> = {
      "24h": 24 * 60 * 60 * 1000,
      "3d": 3 * 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "14d": 14 * 24 * 60 * 60 * 1000,
    }

    return DATE_OPTIONS.filter((opt) => {
      if (opt.id === "all") return true
      if (filters.dateRange === opt.id) return true
      const limit = ranges[opt.id]
      if (!limit) return true
      return events.some((j) => {
        if (!j.created_at) return false
        return now - new Date(j.created_at).getTime() <= limit
      })
    })
  }, [events, filters.dateRange])

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
      {isLoading ? (
        <div className="py-4 space-y-4 animate-pulse">
          <div className="space-y-2">
            <div className="h-4 bg-slate-100 rounded w-24" />
            <div className="h-3.5 bg-slate-100 rounded w-36" />
            <div className="h-3.5 bg-slate-100 rounded w-28" />
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="h-4 bg-slate-100 rounded w-28" />
            <div className="h-3.5 bg-slate-100 rounded w-40" />
            <div className="h-3.5 bg-slate-100 rounded w-32" />
          </div>
        </div>
      ) : (
        <>
          {/* 1. Danh mục sự kiện */}
          {visibleCategoryOptions.length > 0 && (
            <FilterSection title="Danh mục sự kiện" count={filters.categories.length}>
              <div className="flex flex-col gap-0.5">
                {visibleCategoryOptions.map((opt) => (
                  <FilterCheckboxRow
                    key={opt.id}
                    checked={filters.categories.includes(opt.id)}
                    onChange={() => handleToggleCategory(opt.id)}
                    label={opt.label}
                  />
                ))}
              </div>
            </FilterSection>
          )}

          {/* 2. Vị trí tuyển dụng */}
          {visiblePositionOptions.length > 0 && (
            <FilterSection title="Vị trí tuyển dụng" count={filters.positions.length}>
              <div className="flex flex-col gap-0.5">
                {visiblePositionOptions.map((opt) => (
                  <FilterCheckboxRow
                    key={opt.id}
                    checked={filters.positions.includes(opt.id)}
                    onChange={() => handleTogglePosition(opt.id)}
                    label={opt.label}
                  />
                ))}
              </div>
            </FilterSection>
          )}

          {/* 3. Thời gian đăng */}
          {visibleDateOptions.length > 1 && (
            <FilterSection
              title="Thời gian đăng"
              hasActiveDot={Boolean(filters.dateRange && filters.dateRange !== "all")}
            >
              <FilterPillGroup
                options={visibleDateOptions}
                value={filters.dateRange || "all"}
                onChange={handleSelectDate}
              />
            </FilterSection>
          )}

          {/* 4. Hình thức thù lao */}
          {visibleSalaryTypeOptions.length > 0 && (
            <FilterSection title="Hình thức thù lao" count={filters.salaryTypes.length}>
              <div className="flex flex-col gap-0.5">
                {visibleSalaryTypeOptions.map((opt) => (
                  <FilterCheckboxRow
                    key={opt.id}
                    checked={filters.salaryTypes.includes(opt.id)}
                    onChange={() => handleToggleSalary(opt.id)}
                    label={opt.label}
                  />
                ))}
              </div>
            </FilterSection>
          )}

          {/* 5. Phương thức thanh toán */}
          {visiblePaymentMethodOptions.length > 0 && (
            <FilterSection title="Phương thức thanh toán" count={filters.paymentMethods.length}>
              <div className="flex flex-col gap-0.5">
                {visiblePaymentMethodOptions.map((opt) => (
                  <FilterCheckboxRow
                    key={opt.id}
                    checked={filters.paymentMethods.includes(opt.id)}
                    onChange={() => handleTogglePaymentMethod(opt.id)}
                    label={opt.label}
                  />
                ))}
              </div>
            </FilterSection>
          )}

          {visibleCategoryOptions.length === 0 &&
            visiblePositionOptions.length === 0 &&
            visibleSalaryTypeOptions.length === 0 &&
            visiblePaymentMethodOptions.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-400">
                Chưa có bộ lọc phù hợp
              </div>
            )}
        </>
      )}
    </FilterSidebarShell>
  )
}

