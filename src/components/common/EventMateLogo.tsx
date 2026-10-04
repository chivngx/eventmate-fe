import React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export type LogoColorVariant = "orange" | "white" | "monochrome" | "blue-teal" | "ocean" | "solid"

const LOGO_SRC_MAP: Record<LogoColorVariant, string> = {
  orange: "/images/logo/eventmate-logo-square-512.png",
  "blue-teal": "/images/logo/eventmate-logo-square-512.png",
  ocean: "/images/logo/eventmate-logo-square-512.png",
  white: "/images/logo/eventmate-logo-square-white.png",
  monochrome: "/images/logo/eventmate-logo-square-charcoal.png",
  solid: "/images/logo/eventmate-logo-square-charcoal.png",
}

export interface EventMateLogoIconProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
  size?: number | string
  variant?: LogoColorVariant
  idPrefix?: string
}

export function EventMateLogoIcon({
  size = 28,
  className,
  variant = "orange",
  idPrefix: _idPrefix,
  style,
  ...props
}: EventMateLogoIconProps) {
  const src = LOGO_SRC_MAP[variant] || LOGO_SRC_MAP.orange
  const dimension = typeof size === "number" ? `${size}px` : size

  return (
    <img
      src={src}
      alt="EventMate"
      width={typeof size === "number" ? size : undefined}
      height={typeof size === "number" ? size : undefined}
      style={{
        width: dimension,
        height: dimension,
        ...style,
      }}
      className={cn("shrink-0 transition-transform duration-200 select-none object-contain", className)}
      draggable={false}
      {...props}
    />
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