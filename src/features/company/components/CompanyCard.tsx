"use client"

import { useNavigate } from "@/lib/router"
import { ChevronRight, Sparkles } from "lucide-react"
import VerifiedBadge from "@/components/ui/verified-badge"

export interface OrganizerProfile {
  id: string
  full_name: string
  avatar_url: string | null
  bio: string | null
  slug: string | null
  university: string | null
  email: string | null
  phone: string | null
  scale: string | null
  address: string | null
  reliability_score: number | null
  is_verified?: boolean | null
  is_premium?: boolean | null
  premium_until?: string | null
  events?: Array<{
    id: string
    title?: string
    status?: string
    category?: string | null
    ward_id?: number | null
    location?: string | null
    danang_wards?: { id?: number; name?: string } | null
  }>
}

export interface CompanyCardProps {
  organizer: OrganizerProfile
  isBookmarked?: boolean
  onToggleBookmark?: (id: string) => void
}

export default function CompanyCard({
  organizer,
}: CompanyCardProps) {
  const navigate = useNavigate()

  const displayName = organizer.full_name || "Ban tổ chức sự kiện"
  const isVip = Boolean(
    organizer.is_premium &&
    (!organizer.premium_until || new Date(organizer.premium_until) > new Date())
  )
  const eventCount = organizer.events?.length || 0
  const isHiring = organizer.events?.some(
    (e) => e.status === "upcoming" || e.status === "ongoing"
  )
  const orgLink = `/companies/${organizer.slug || organizer.id}`

  return (
    <article
      onClick={() => navigate(orgLink)}
      className="group relative bg-white border border-[#ededed] hover:border-[#005ddc]/50 hover:shadow-md transition-all duration-200 rounded-[8px] px-6 sm:px-8 py-5 sm:py-6 cursor-pointer flex items-center justify-between gap-4 sm:gap-6"
    >
      {/* Left side: Logo + Details (Figma node 5875:24889) */}
      <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0">
        {/* Avatar: Circular, completely borderless like EventCard */}
        <div className="shrink-0 w-16 h-16 sm:w-[84px] sm:h-[84px] rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
          {organizer.avatar_url ? (
            <img
              src={organizer.avatar_url}
              alt={displayName}
              className="w-full h-full object-cover rounded-full"
              onError={(e: any) => {
                e.currentTarget.style.display = "none"
                if (e.currentTarget.nextElementSibling) {
                  e.currentTarget.nextElementSibling.style.display = "flex"
                }
              }}
            />
          ) : null}
          <div
            className={`w-full h-full rounded-full bg-slate-100 text-slate-700 font-bold text-lg sm:text-xl flex items-center justify-center ${
              organizer.avatar_url ? "hidden" : ""
            }`}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Content details */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5 sm:gap-2">
          {/* Header row: Name */}
          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
            <h3 className="text-base sm:text-[18px] font-semibold text-[#222222] truncate group-hover:text-[#005ddc] transition-colors">
              {displayName}
            </h3>
            {organizer.is_verified && (
              <VerifiedBadge text="Đã xác thực danh tính" />
            )}
            {isVip && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                <Sparkles className="size-3 text-amber-500 fill-amber-500" />
                VIP
              </span>
            )}
          </div>

          {/* Description (Inter Regular 16px leading 1.6 #515151) */}
          <p className="text-sm sm:text-[15px] lg:text-[16px] text-[#515151] leading-[1.6] line-clamp-1 sm:line-clamp-2">
            {organizer.bio || "Đơn vị tổ chức sự kiện chuyên nghiệp và đối tác uy tín kết nối nhân lực tại Đà Nẵng."}
          </p>

          {/* Badges row (Figma node 589:7446: bg #eff5ff, text #005ddc, rounded 4px) */}
          <div className="flex items-center gap-2 flex-wrap pt-0.5">
            {isHiring && (
              <span className="inline-flex items-center h-5 px-2 py-0.5 rounded-[4px] text-[12px] font-normal bg-[#eff5ff] text-[#005ddc]">
                Đang tuyển dụng
              </span>
            )}
            {eventCount > 0 && (
              <span className="inline-flex items-center h-5 px-2 py-0.5 rounded-[4px] text-[12px] font-normal bg-[#eff5ff] text-[#005ddc]">
                {eventCount} Sự kiện
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right chevron indicator (Figma node 3846:28989) */}
      <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full text-[#515151] group-hover:text-[#005ddc] group-hover:translate-x-1 transition-all shrink-0">
        <ChevronRight className="w-6 h-6" />
      </div>
    </article>
  )
}
