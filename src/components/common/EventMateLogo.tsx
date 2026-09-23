import React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export type LogoColorVariant = "monochrome" | "blue-teal" | "ocean" | "solid"

export interface EventMateLogoIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
  className?: string
  idPrefix?: string
  variant?: LogoColorVariant
}

/**
 * Modern Geometric Isometric 3D "E" Mark for EventMate
 * Style: Monochrome Minimalist (Glossy Charcoal & Metallic Graphite)
 */
export function EventMateLogoIcon({
  size = 28,
  className,
  idPrefix = "em",
  variant = "monochrome",
  ...props
}: EventMateLogoIconProps) {
  const gradBodyId = `${idPrefix}-body-grad`
  const gradAccentId = `${idPrefix}-accent-grad`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 2000 1903"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 transition-transform duration-200", className)}
      {...props}
    >
      <defs>
        {variant === "monochrome" && (
          <>
            {/* Body: Deep Obsidian / Glossy Carbon Black */}
            <linearGradient id={gradBodyId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#27272A" />
              <stop offset="40%" stopColor="#18181B" />
              <stop offset="100%" stopColor="#09090B" />
            </linearGradient>

            {/* Accent facet: High-end Metallic Graphite / Silver sheen */}
            <linearGradient id={gradAccentId} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3F3F46" />
              <stop offset="50%" stopColor="#71717A" />
              <stop offset="100%" stopColor="#9CA3AF" />
            </linearGradient>
          </>
        )}

        {variant === "blue-teal" && (
          <>
            <linearGradient id={gradBodyId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0066FF" />
              <stop offset="50%" stopColor="#0052D4" />
              <stop offset="100%" stopColor="#003EB0" />
            </linearGradient>
            <linearGradient id={gradAccentId} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00B894" />
              <stop offset="60%" stopColor="#00D2B4" />
              <stop offset="100%" stopColor="#20E2C8" />
            </linearGradient>
          </>
        )}

        {variant === "ocean" && (
          <>
            <linearGradient id={gradBodyId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
            <linearGradient id={gradAccentId} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
          </>
        )}
      </defs>

      {/* Main Isometric Body (Path 1) */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M527.187 1325.8L1334.14 859.901V656.135L1159.2 555.156L352.271 1021.03V677.651L587.75 541.698L824.562 404.958L1175.29 202.479L911.958 50.4688L824.562 0L737.213 50.4688L412.984 237.63L88.7759 424.828L0.0415039 476.068V1426.38L88.7759 1477.61L412.984 1664.8L737.213 1851.98L824.562 1902.42L911.958 1851.98L1560.37 1477.61L1649.11 1426.38V1021.43L1647.6 1022.32L1296.88 1224.76L1061.42 1360.74L824.562 1497.48L587.75 1360.74L527.187 1325.8Z"
        fill={variant === "solid" ? "#18181B" : `url(#${gradBodyId})`}
      />

      {/* Top-Right Accent Facet (Path 2) */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1647.6 475.182V1022.32L1649.11 1021.43L1999.83 818.958V273.583L1911.1 222.354L1586.89 35.1458L1526.01 0L1175.29 202.479L1412.15 339.219L1472.67 374.167L1647.6 475.182Z"
        fill={variant === "solid" ? "#52525B" : `url(#${gradAccentId})`}
      />
    </svg>
  )
}

export interface EventMateLogoProps {
  className?: string
  iconSize?: number | string
  showText?: boolean
  textClassName?: string
  isLink?: boolean
  href?: string
  variant?: LogoColorVariant
  idPrefix?: string
}

/**
 * EventMate Logo Component with Icon and Typography
 */
export function EventMateLogo({
  className,
  iconSize = 32,
  isLink = false,
  href = "/",
  variant = "monochrome",
  idPrefix = "nav",
}: EventMateLogoProps) {
  const content = (
    <div className={cn("inline-flex items-center justify-center select-none", className)}>
      <EventMateLogoIcon size={iconSize} variant={variant} idPrefix={idPrefix} />
    </div>
  )

  if (isLink) {
    return (
      <Link
        href={href}
        className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 rounded-lg transition-transform hover:opacity-90 active:scale-95"
        aria-label="EventMate Home"
      >
        {content}
      </Link>
    )
  }

  return content
}

export default EventMateLogo
