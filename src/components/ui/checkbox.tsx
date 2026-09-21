"use client"

import React from "react"
import { Check } from "lucide-react"

export interface CheckboxProps {
  checked: boolean
  onChange: () => void
  label?: React.ReactNode
  disabled?: boolean
  className?: string
  id?: string
}

/**
 * Custom Figma-styled checkbox (20x20px, border 1.67px #cbcbcb, rounded 3.3px)
 */
export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  className = "",
  id,
}: CheckboxProps) {
  return (
    <label
      id={id}
      onClick={() => {
        if (!disabled) onChange()
      }}
      className={`flex items-center gap-2.5 py-1 cursor-pointer select-none group text-[14px] font-medium leading-[1.6] ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      <div
        className={`w-5 h-5 rounded-[3.3px] border-[1.67px] flex items-center justify-center transition-all shrink-0 ${
          checked
            ? "border-[#005ddc] bg-[#005ddc] text-white"
            : "border-[#cbcbcb] bg-white group-hover:border-[#005ddc]"
        }`}
      >
        {checked && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
      </div>
      {label && (
        <span
          className={`transition-colors truncate ${
            checked ? "text-[#222222] font-semibold" : "text-[#515151] group-hover:text-[#222222]"
          }`}
        >
          {label}
        </span>
      )}
    </label>
  )
}

export default Checkbox
