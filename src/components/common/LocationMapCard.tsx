"use client"

import { Navigation } from "lucide-react"

export interface LocationMapCardProps {
  title?: string
  address?: string | null
  searchQuery?: string
  mapEmbedUrl?: string | null
  className?: string
}

function parseEmbedSrc(input?: string | null): string | null {
  if (!input) return null
  const trimmed = input.trim()
  const match = trimmed.match(/src=["']([^"']+)["']/)
  if (match && match[1]) {
    return match[1]
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed
  }
  return null
}

export default function LocationMapCard({
  title = "Vị trí trên bản đồ",
  address,
  searchQuery,
  mapEmbedUrl,
  className = "",
}: LocationMapCardProps) {
  const displayAddress = address || "Đà Nẵng, Việt Nam"
  const queryText = [searchQuery, address].filter(Boolean).join(", ") || "Đà Nẵng, Việt Nam"
  const encodedQuery = encodeURIComponent(queryText)
  const defaultEmbedUrl = `https://maps.google.com/maps?q=${encodedQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`
  const finalEmbedUrl = parseEmbedSrc(mapEmbedUrl) || defaultEmbedUrl

  return (
    <section className={`bg-white rounded-[16px] p-6 space-y-4 shadow-xs ${className}`}>
      <h3 className="font-['Inter'] font-bold text-[16px] text-[#222222]">
        {title}
      </h3>

      <div className="flex items-start gap-2.5">
        <Navigation className="size-4 text-[#757575] shrink-0 mt-0.5" />
        <p className="text-[13px] text-[#515151] leading-relaxed">
          {displayAddress}
        </p>
      </div>

      {/* Embedded Google Maps */}
      <div className="relative aspect-[4/3] w-full rounded-[14px] overflow-hidden bg-slate-100">
        <iframe
          title={title}
          src={finalEmbedUrl}
          className="w-full h-full border-0"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  )
}
