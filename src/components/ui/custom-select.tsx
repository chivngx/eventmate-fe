"use client"

import React, { useState, useRef, useEffect } from "react"
import { ChevronDown, Check, Search } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectOption {
  value: string
  label: string
  sublabel?: string
}

interface CustomSelectProps {
  id?: string
  name?: string
  value: string
  onChange: (value: string) => void
  options: (SelectOption | string)[]
  placeholder?: string
  disabled?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  error?: string
  className?: string
  buttonClassName?: string
}

export function CustomSelect({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = "Chọn một mục...",
  disabled = false,
  searchable = false,
  searchPlaceholder = "Tìm kiếm...",
  error,
  className,
  buttonClassName,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Normalize options to SelectOption[]
  const normalizedOptions: SelectOption[] = React.useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === "string") {
        return { value: opt, label: opt }
      }
      return opt
    })
  }, [options])

  // Filter options if searchable
  const filteredOptions = React.useMemo(() => {
    if (!searchable || !searchTerm.trim()) return normalizedOptions
    const q = searchTerm.toLowerCase().trim()
    return normalizedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
    )
  }, [normalizedOptions, searchable, searchTerm])

  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value))

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
    if (!isOpen) {
      setSearchTerm("")
    }
  }, [isOpen, searchable])

  // Keyboard navigation: Escape closes
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Hidden input for form integration if name is given */}
      {name && <input type="hidden" name={name} value={value} />}

      {/* Select Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "w-full h-10.5 px-3.5 rounded-lg border text-[14px] text-left flex items-center justify-between transition cursor-pointer select-none outline-none",
          "bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100",
          error
            ? "border-rose-500 dark:border-rose-500 ring-1 ring-rose-500/20"
            : isOpen
            ? "border-zinc-900 dark:border-zinc-100 ring-1 ring-zinc-900/10 dark:ring-zinc-100/10"
            : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600",
          disabled && "bg-zinc-100 dark:bg-zinc-800/40 opacity-60 cursor-not-allowed",
          buttonClassName
        )}
      >
        <span
          className={cn(
            "truncate block mr-2",
            !selectedOption && "text-zinc-400 dark:text-zinc-500 font-normal"
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180 text-zinc-700 dark:text-zinc-200"
          )}
        />
      </button>

      {/* Inline error message */}
      {error && (
        <p className="text-[12px] text-rose-500 dark:text-rose-400 mt-1 flex items-center gap-1 font-medium">
          {error}
        </p>
      )}

      {/* Dropdown Popup Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100 min-w-full">
          {/* Search box if enabled */}
          {searchable && (
            <div className="p-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-850/50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full h-8 pl-8 pr-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[13px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1 divide-y-0 divide-zinc-50 dark:divide-zinc-800/40">
            {filteredOptions.length === 0 ? (
              <div className="py-4 px-3 text-center text-[13px] text-zinc-400 dark:text-zinc-500">
                Không tìm thấy kết quả phù hợp
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value)
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value)
                      setIsOpen(false)
                    }}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg text-left text-[13.5px] transition flex items-center justify-between gap-2 cursor-pointer",
                      isSelected
                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-semibold"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                    )}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="truncate">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="text-[11px] text-zinc-400 font-normal truncate">
                          {opt.sublabel}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-zinc-900 dark:text-zinc-100 shrink-0 stroke-[2.5]" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
