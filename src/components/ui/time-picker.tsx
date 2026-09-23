"use client"

import React, { useState, useRef, useEffect, useMemo } from "react"
import { Clock, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  id?: string
  name?: string
  value?: string // HH:mm
  onChange: (value: string) => void
  minTime?: string // HH:mm
  placeholder?: string
  error?: string
  disabled?: boolean
  className?: string
  quickShifts?: { label: string; time: string }[]
}

const DEFAULT_TIME_OPTIONS: string[] = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30",
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
  "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"
]

export function TimePicker({
  id,
  name,
  value = "",
  onChange,
  minTime,
  placeholder = "Chọn giờ...",
  error,
  disabled = false,
  className,
  quickShifts,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customTime, setCustomTime] = useState(value)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCustomTime(value)
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

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setCustomTime(val)
    if (/^([01]\d|2[0-3]):([0-5]\d)$/.test(val)) {
      onChange(val)
    }
  }

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
          <Clock className="w-4 h-4 text-zinc-400 shrink-0" />
          <span className={cn("truncate font-medium", !value && "text-zinc-400 dark:text-zinc-500 font-normal")}>
            {value || placeholder}
          </span>
        </div>
      </button>

      {/* Inline Error Message */}
      {error && (
        <p className="text-[12px] text-rose-500 dark:text-rose-400 mt-1 flex items-center gap-1 font-medium">
          {error}
        </p>
      )}

      {/* Popover */}
      {isOpen && (
        <div className="absolute z-50 left-0 top-full mt-1.5 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl p-3 animate-in fade-in-0 zoom-in-95 duration-100">
          {/* Quick Presets if provided */}
          {quickShifts && quickShifts.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pb-2.5 mb-2.5 border-b border-zinc-100 dark:border-zinc-800">
              {quickShifts.map((shift) => (
                <button
                  key={shift.label}
                  type="button"
                  onClick={() => {
                    onChange(shift.time)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "px-2 py-1 text-xs rounded-md font-medium transition cursor-pointer border",
                    value === shift.time
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent"
                      : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
                  )}
                >
                  {shift.label}
                </button>
              ))}
            </div>
          )}

          {/* Direct Input */}
          <div className="mb-2">
            <label className="text-[11px] font-medium text-zinc-400 block mb-1">
              Nhập giờ tùy chỉnh (HH:mm)
            </label>
            <input
              type="time"
              value={customTime}
              onChange={handleCustomChange}
              className="w-full h-8 px-2.5 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900"
            />
          </div>

          {/* Time Slot Grid */}
          <div className="text-[11px] font-medium text-zinc-400 mb-1">
            Khung giờ phổ biến
          </div>
          <div className="max-h-48 overflow-y-auto grid grid-cols-3 gap-1 pr-1">
            {DEFAULT_TIME_OPTIONS.map((time) => {
              const isSelected = value === time
              const isDisabled = minTime ? time <= minTime : false

              return (
                <button
                  key={time}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    onChange(time)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "h-8 rounded-lg text-xs font-medium transition flex items-center justify-center cursor-pointer",
                    isSelected
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold shadow-xs"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                    isDisabled && "opacity-30 cursor-not-allowed hover:bg-transparent pointer-events-none"
                  )}
                >
                  {time}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
