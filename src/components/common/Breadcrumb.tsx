"use client"

import React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  showHome?: boolean
  className?: string
}

export function Breadcrumb({
  items,
  showHome = true,
  className,
}: BreadcrumbProps) {
  const fullItems: BreadcrumbItem[] = showHome
    ? [{ label: "Trang chủ", href: "/" }, ...items]
    : items

  if (fullItems.length === 0) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center flex-wrap gap-1.5 text-[13px] text-slate-500", className)}
    >
      <ol className="flex items-center flex-wrap gap-1.5 min-w-0">
        {fullItems.map((item, index) => {
          const isLast = index === fullItems.length - 1

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5 min-w-0">
              {index > 0 && (
                <ChevronRight className="size-3.5 text-slate-300 shrink-0 stroke-[2]" aria-hidden="true" />
              )}
              {isLast || !item.href ? (
                <span
                  className="text-slate-900 font-medium truncate max-w-[220px] sm:max-w-[320px] md:max-w-[480px]"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer hover:underline underline-offset-4 decoration-slate-300"
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumb
