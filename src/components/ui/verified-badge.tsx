"use client"

import React from "react"
import { CheckCircle } from "lucide-react"

export interface VerifiedBadgeProps {
  variant?: "icon" | "pill"
  text?: string
  className?: string
}

/**
 * Verified Badge Icon from Figma (16x16 Blue check star badge) or Pill badge
 */
export function VerifiedBadge({
  variant = "icon",
  text = "Đã xác thực KYC",
  className = "",
}: VerifiedBadgeProps) {
  if (variant === "pill") {
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 ${className}`}
      >
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>{text}</span>
      </span>
    )
  }

  return (
    <svg
      className={`size-[16px] shrink-0 ${className}`}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={text}
    >
      <path
        d="M8 0L9.79611 1.79611L12.3307 1.44293L13.1114 3.8637L15.3884 5.05025L14.7071 7.5L15.3884 9.94975L13.1114 11.1363L12.3307 13.5571L9.79611 13.2039L8 15L6.20389 13.2039L3.66933 13.5571L2.88856 11.1363L0.611593 9.94975L1.29289 7.5L0.611593 5.05025L2.88856 3.8637L3.66933 1.44293L6.20389 1.79611L8 0Z"
        fill="#005DDC"
      />
      <path
        d="M5 7.5L7 9.5L11 5.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default VerifiedBadge
