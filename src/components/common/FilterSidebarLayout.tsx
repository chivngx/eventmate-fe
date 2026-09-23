"use client"

import React, { useState } from "react"
import { ChevronDown, RotateCcw, SlidersHorizontal, X } from "lucide-react"
import Checkbox from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

export interface ActiveChipItem {
  id: string
  label: string
  onRemove: () => void
  isBlue?: boolean
}

export interface FilterSidebarShellProps {
  title?: string
  mobileTitle?: string
  activeCount: number
  onResetFilters: () => void
  activeChips?: ActiveChipItem[]
  children: React.ReactNode
  className?: string
  applyButtonText?: string
}

export function FilterSidebarShell({
  title = "Bộ lọc",
  mobileTitle = "Bộ lọc",
  activeCount,
  onResetFilters,
  activeChips = [],
  children,
  className,
  applyButtonText,
}: FilterSidebarShellProps) {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  const filterContent = (
    <div className="flex flex-col text-sm w-full">
      {/* Header: All Filters / Active count / Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-800" />
          <span className="font-semibold text-[15px] text-slate-900 tracking-tight">{title}</span>
          {activeCount > 0 && (
            <span className="bg-slate-900 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Đặt lại</span>
          </button>
        )}
      </div>

      {/* Active Filter Chips (Removable tags) */}
      {activeChips.length > 0 && (
        <div className="py-2.5 border-b border-slate-100 flex flex-wrap gap-1.5">
          {activeChips.map((chip) => (
            <span
              key={chip.id}
              className={cn(
                "text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors",
                chip.isBlue
                  ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
              )}
            >
              <span className="truncate max-w-[140px]">{chip.label}</span>
              <button
                type="button"
                onClick={chip.onRemove}
                className="hover:text-red-500 cursor-pointer ml-0.5"
                title="Bỏ chọn"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Accordions / Sections */}
      <div className="divide-y divide-slate-100">{children}</div>
    </div>
  )

  return (
    <>
      {/* Mobile Drawer Trigger Button */}
      <div className="lg:hidden w-full mb-4">
        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          className="w-full py-2.5 px-4 bg-white border border-slate-200/90 rounded-xl flex items-center justify-between font-medium text-slate-800 shadow-xs cursor-pointer active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold">{mobileTitle}</span>
          </div>
          {activeCount > 0 && (
            <span className="bg-slate-900 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
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
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="font-bold text-[16px] text-slate-900">{mobileTitle}</span>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {filterContent}
            <div className="mt-auto pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="w-full bg-[#005DDC] hover:bg-[#004EB7] text-white py-2.5 rounded-xl font-semibold text-sm transition-all shadow-xs cursor-pointer active:scale-[0.98]"
              >
                {applyButtonText || `Áp dụng bộ lọc ${activeCount > 0 ? `(${activeCount})` : ""}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          "hidden lg:block w-[280px] shrink-0 bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200/80 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300",
          className
        )}
      >
        {filterContent}
      </aside>
    </>
  )
}

export interface FilterSectionProps {
  title: string
  count?: number
  hasActiveDot?: boolean
  defaultOpen?: boolean
  isOpen?: boolean
  onToggle?: () => void
  children: React.ReactNode
  className?: string
}

export function FilterSection({
  title,
  count = 0,
  hasActiveDot = false,
  defaultOpen = true,
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle,
  children,
  className,
}: FilterSectionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isControlled = controlledIsOpen !== undefined
  const isOpen = isControlled ? controlledIsOpen : internalOpen

  const handleToggle = () => {
    if (controlledOnToggle) {
      controlledOnToggle()
    } else {
      setInternalOpen((prev) => !prev)
    }
  }

  return (
    <div className={cn("py-3", className)}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between py-1 text-left group cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-[13.5px] font-semibold text-slate-800 group-hover:text-black transition-colors">
            {title}
          </span>
          {count > 0 && (
            <span className="size-4.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold flex items-center justify-center">
              {count}
            </span>
          )}
          {hasActiveDot && <span className="size-2 rounded-full bg-blue-600" />}
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && <div className="mt-2.5">{children}</div>}
    </div>
  )
}

export interface FilterPillOption {
  id: string
  label: string
}

export interface FilterPillGroupProps {
  options: FilterPillOption[]
  value: string
  onChange: (id: string) => void
  className?: string
}

export function FilterPillGroup({
  options,
  value,
  onChange,
  className,
}: FilterPillGroupProps) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {options.map((opt) => {
        const isSelected = value === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "px-2.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer select-none",
              isSelected
                ? "bg-slate-900 text-white shadow-2xs font-semibold"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export interface FilterCheckboxRowProps {
  checked: boolean
  onChange: () => void
  label: React.ReactNode
  className?: string
}

export function FilterCheckboxRow({
  checked,
  onChange,
  label,
  className,
}: FilterCheckboxRowProps) {
  return (
    <div className={cn("px-2 py-0.5 -mx-2 rounded-lg hover:bg-slate-50/80 transition-colors", className)}>
      <Checkbox checked={checked} onChange={onChange} label={label} />
    </div>
  )
}

export default FilterSidebarShell
