"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface SectionTitleProps {
  title: string
  caption: string
  more?: boolean
  moreText?: string
  moreHref?: string
  onMore?: () => void
  centered?: boolean
}

export default function SectionTitle({
  title,
  caption,
  more = false,
  moreText = "Xem thêm",
  moreHref,
  onMore,
  centered = false,
}: SectionTitleProps) {
  return (
    <div
      className={`w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 sm:mb-10 ${
        centered ? "text-center md:text-center items-center justify-center" : ""
      }`}
    >
      <div className={`flex flex-col gap-2 ${centered ? "items-center max-w-2xl mx-auto" : "max-w-2xl"}`}>
        <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-semibold text-[#222222] tracking-tight leading-tight">
          {title}
        </h2>
        <p className="text-sm sm:text-base text-[#757575] leading-relaxed font-normal">
          {caption}
        </p>
      </div>

      {more && (
        <div className="shrink-0">
          {moreHref ? (
            <Link
              href={moreHref}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#005DDC] hover:text-[#004EB7] px-4 py-2 rounded-lg transition-colors group"
            >
              <span>{moreText}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ) : (
            <button
              onClick={onMore}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#005DDC] hover:text-[#004EB7] px-4 py-2 rounded-lg transition-colors group cursor-pointer"
            >
              <span>{moreText}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
