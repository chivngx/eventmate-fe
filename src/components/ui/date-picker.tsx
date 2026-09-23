"use client"

import React, { useState, useRef, useEffect, useMemo } from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  id?: string
  name?: string
  value?: string // YYYY-MM-DD
  onChange: (value: string) => void
  minDate?: string // YYYY-MM-DD
  maxDate?: string // YYYY-MM-DD
  placeholder?: string
  error?: string
  disabled?: boolean
  className?: string
  presets?: { label: string; daysFromNow: number }[]
}

const DAYS_OF_WEEK = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
  "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
  "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
]

function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return ""
  const parts = dateStr.split("-")
  if (parts.length === 3) {
    const [y, m, d] = parts
    return `${d}/${m}/${y}`
  }
  return dateStr
}

function parseDate(dateStr?: string): Date | null {
  if (!dateStr) return null
  const [y, m, d] = dateStr.split("-").map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function DatePicker({
  id,
  name,
  value = "",
  onChange,
  minDate,
  maxDate,
  placeholder = "Chọn ngày...",
  error,
  disabled = false,
  className,
  presets = [
    { label: "Hôm nay", daysFromNow: 0 },
    { label: "Ngày mai", daysFromNow: 1 },
    { label: "+3 ngày", daysFromNow: 3 },
    { label: "+7 ngày", daysFromNow: 7 },
  ],
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Current view year & month
  const initialDate = useMemo(() => {
    return parseDate(value) || parseDate(minDate) || new Date()
  }, [value, minDate])

  const [viewYear, setViewYear] = useState(initialDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth())

  // Keep view in sync when value changes externally
  useEffect(() => {
    if (value) {
      const d = parseDate(value)
      if (d) {
        setViewYear(d.getFullYear())
        setViewMonth(d.getMonth())
      }
    }
  }, [value])

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Calendar calculations
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1)
    const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0)
    const totalDays = lastDayOfMonth.getDate()

    // Sunday = 0, Monday = 1 ... convert Monday to 0
    let startDayOfWeek = firstDayOfMonth.getDay() - 1
    if (startDayOfWeek === -1) startDayOfWeek = 6

    const days: { dateStr: string; dayNumber: number; isCurrentMonth: boolean }[] = []

    // Previous month padding days
    const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate()
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i
      const prevDate = new Date(viewYear, viewMonth - 1, d)
      days.push({
        dateStr: toDateString(prevDate),
        dayNumber: d,
        isCurrentMonth: false,
      })
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const currDate = new Date(viewYear, viewMonth, d)
      days.push({
        dateStr: toDateString(currDate),
        dayNumber: d,
        isCurrentMonth: true,
      })
    }

    // Next month padding days to complete 35 or 42 grid
    const remaining = 42 - days.length
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const nextDate = new Date(viewYear, viewMonth + 1, d)
        days.push({
          dateStr: toDateString(nextDate),
          dayNumber: d,
          isCurrentMonth: false,
        })
      }
    }

    return days
  }, [viewYear, viewMonth])

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const isDateDisabled = (dateStr: string) => {
    if (minDate && dateStr < minDate) return true
    if (maxDate && dateStr > maxDate) return true
    return false
  }

  const todayStr = toDateString(new Date())

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {name && <input type="hidden" name={name} value={value} />}

      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={cn(
          "w-full h-10.5 px-3.5 rounded-lg border text-[14px] text-left flex items-center justify-between transition cursor-pointer select-none outline-none",
          "bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100",
          error
            ? "border-rose-500 dark:border-rose-500 ring-1 ring-rose-500/20"
            : isOpen
            ? "border-zinc-900 dark:border-zinc-100 ring-1 ring-zinc-900/10 dark:ring-zinc-100/10"
            : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600",
          disabled && "bg-zinc-100 dark:bg-zinc-800/40 opacity-60 cursor-not-allowed"
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          <CalendarIcon className="w-4 h-4 text-zinc-400 shrink-0" />
          <span className={cn("truncate", !value && "text-zinc-400 dark:text-zinc-500 font-normal")}>
            {value ? formatDisplayDate(value) : placeholder}
          </span>
        </div>

        {value && !disabled && (
          <span
            onClick={(e) => {
              e.stopPropagation()
              onChange("")
            }}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition cursor-pointer"
            title="Xóa ngày"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}
      </button>

      {/* Inline Error Message */}
      {error && (
        <p className="text-[12px] text-rose-500 dark:text-rose-400 mt-1 flex items-center gap-1 font-medium">
          {error}
        </p>
      )}

      {/* Calendar Popover */}
      {isOpen && (
        <div className="absolute z-50 left-0 top-full mt-1.5 w-76 sm:w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl p-3.5 animate-in fade-in-0 zoom-in-95 duration-100">
          {/* Presets Bar */}
          {presets && presets.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800">
              {presets.map((preset) => {
                const target = new Date()
                target.setDate(target.getDate() + preset.daysFromNow)
                const targetStr = toDateString(target)
                const disabled = isDateDisabled(targetStr)
                const isSelected = value === targetStr

                return (
                  <button
                    key={preset.label}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      onChange(targetStr)
                      setIsOpen(false)
                    }}
                    className={cn(
                      "px-2.5 py-1 text-xs rounded-md font-medium transition cursor-pointer border",
                      isSelected
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent shadow-xs"
                        : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700",
                      disabled && "opacity-40 cursor-not-allowed pointer-events-none"
                    )}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>
          )}

          {/* Month/Year Navigation */}
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Tháng trước"
                className="size-7 rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Tháng sau"
                className="size-7 rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAYS_OF_WEEK.map((d) => (
              <span key={d} className="text-[11.5px] font-medium text-zinc-400 dark:text-zinc-500 py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((item, index) => {
              const disabled = isDateDisabled(item.dateStr)
              const isSelected = value === item.dateStr
              const isToday = item.dateStr === todayStr

              return (
                <button
                  key={`${item.dateStr}-${index}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange(item.dateStr)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "size-8.5 rounded-lg text-[13px] font-medium flex items-center justify-center transition cursor-pointer select-none",
                    !item.isCurrentMonth && "text-zinc-300 dark:text-zinc-600",
                    item.isCurrentMonth && !isSelected && "text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                    isToday && !isSelected && "border border-zinc-300 dark:border-zinc-700 font-bold",
                    isSelected && "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold shadow-xs",
                    disabled && "opacity-25 cursor-not-allowed hover:bg-transparent pointer-events-none"
                  )}
                >
                  {item.dayNumber}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
