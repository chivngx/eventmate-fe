"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { formatTimeAgo, cn } from "@/lib/utils"

export interface JobItem {
  id: string
  title: string
  category?: string | null
  position_type?: string | null
  event_date?: string | null
  start_time?: string | null
  end_time?: string | null
  location?: string | null
  salary_amount?: number | null
  salary_type?: string | null
  payment_method?: string | null
  work_mode?: string | null
  job_type?: string | null
  created_at?: string | null
  organizer_id?: string | null
  slots_needed?: number | null
  benefits?: string[] | null
  tags?: string[] | null
  slug?: string | null
  banner_url?: string | null
  is_urgent?: boolean | null
  is_featured?: boolean | null
  bumped_at?: string | null
  plan_tier?: string | null
  profiles?: {
    id?: string
    full_name?: string | null
    avatar_url?: string | null
    slug?: string | null
    is_verified?: boolean | null
  } | null
  danang_wards?: {
    id?: number
    name: string
  } | null
  // Extended fields for custom feeds & Vieclamtot items
  company?: string | null
  organizer_name?: string | null
  verified?: boolean | null
  isPartner?: boolean | null
  salary?: string | null
  priority?: boolean | null
  timeAgo?: string | null
  applicantsCount?: number | null
  applicants_count?: number | null
  applications_count?: number | null
  imageUrl?: string | null
}

export interface EventCardProps {
  job: JobItem
  isBookmarked?: boolean
  onToggleBookmark?: (id: string) => void
  onNavigate?: (id: string) => void
  className?: string
}

export type EventJobCardProps = EventCardProps

export default function EventCard({
  job,
  onNavigate,
  className = "",
}: EventCardProps) {
  const router = useRouter()
  const [imageError, setImageError] = useState(false)

  const organizerName =
    job.company ||
    job.organizer_name ||
    job.profiles?.full_name ||
    "Ban tổ chức sự kiện"

  const displayImage =
    job.imageUrl ||
    job.banner_url ||
    job.profiles?.avatar_url ||
    "/images/urgent/job-1.png"

  const rawLocation =
    job.danang_wards?.name ||
    job.location ||
    "Đà Nẵng"

  const locationText = (() => {
    if (!rawLocation) return "Đà Nẵng"
    if (rawLocation.includes("•")) {
      return rawLocation.split("•").pop()?.trim() || rawLocation
    }
    return (
      rawLocation
        .replace(/^(Q\.|Quận|Huyện)\s+[^,•]+[,•]\s*/i, "")
        .replace(/\s*,\s*(TP\.|Thành phố\s+)?Đà Nẵng$/i, "")
        .trim() || rawLocation
    )
  })()

  const salaryFormatted = job.salary
    ? job.salary
    : job.salary_amount
      ? `${Number(job.salary_amount).toLocaleString("vi-VN")} đ${job.salary_type === "hourly"
        ? "/giờ"
        : job.salary_type === "fixed"
          ? "/show"
          : job.salary_type === "daily"
            ? "/ngày"
            : "/ca"
      }`
      : job.salary_type === "volunteer"
        ? "Tình nguyện viên"
        : "Thương lượng"

  const timeAgoText =
    job.timeAgo ||
    (job.created_at ? formatTimeAgo(job.created_at) : "Vừa xong")


  const isVerified = Boolean(
    job.verified ?? job.profiles?.is_verified
  )
  const isPartner = Boolean(
    job.isPartner ?? (job.plan_tier === "pro" || job.is_featured)
  )
  const isUrgent = Boolean(
    job.is_urgent === true || (job.is_urgent === undefined && job.id.startsWith("urgent"))
  )
  const isPriority = Boolean(job.priority ?? job.is_featured)

  const handleCardClick = () => {
    if (onNavigate) {
      onNavigate(job.id)
    } else {
      router.push(`/events/${job.slug || job.id}`)
    }
  }

  return (
    <article
      onClick={handleCardClick}
      className={cn(
        "w-full h-full min-h-[192px] p-4 bg-white rounded-[16px] border border-[#e8e8e8] hover:shadow-md transition-shadow cursor-pointer flex gap-3 items-start select-none",
        className
      )}
    >
      {/* Left Thumbnail */}
      <div className="size-[56px] min-w-[56px] min-h-[56px] rounded-[6px] overflow-hidden relative shrink-0 bg-gray-50 border border-gray-100">
        {imageError ? (
          <div className="size-full flex items-center justify-center bg-gray-100 text-gray-500 font-bold text-sm">
            {organizerName.charAt(0).toUpperCase()}
          </div>
        ) : (
          <Image
            src={displayImage}
            alt={job.title}
            fill
            sizes="56px"
            className="object-cover"
            unoptimized
            onError={() => setImageError(true)}
          />
        )}
      </div>

      {/* Right Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-full gap-1">
        {/* Title & Badges */}
        <div className="w-full">
          {(isUrgent || isPartner) && (
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              {isUrgent && (
                <img
                  src="/images/urgent/badge-tuyen-gap.svg"
                  alt="Tuyển gấp"
                  className="h-[18px] w-[77px] shrink-0"
                />
              )}
              {isPartner && (
                <span className="bg-[#FF8800] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] shrink-0">
                  Đối Tác
                </span>
              )}
            </div>
          )}
          <h3
            title={job.title}
            className="font-semibold text-[#222222] text-[15px] sm:text-[16px] leading-[22px] sm:leading-[24px] line-clamp-2"
          >
            {job.title}
          </h3>
        </div>

        {/* Company Name & Verified */}
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="text-[13px] sm:text-[14px] font-semibold text-[#8c8c8c] truncate">
            {organizerName}
          </span>
          {isVerified && (
            <img
              src="/images/urgent/icon-verified.svg"
              alt="Xác thực"
              className="size-4 shrink-0"
            />
          )}
        </div>

        {/* Salary */}
        <div className="text-[15px] sm:text-[16px] font-bold text-[#f0325e] leading-[24px] whitespace-nowrap">
          {salaryFormatted}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-[13px] sm:text-[14px] text-[#8c8c8c] whitespace-nowrap overflow-hidden">
          <img
            src="/images/urgent/icon-location.svg"
            alt=""
            className="size-4 shrink-0"
          />
          <span className="truncate">{locationText}</span>
        </div>

        {/* Footer: Priority + Time */}
        <div className="flex items-center pt-1 border-t border-gray-50 text-[12px] text-[#8c8c8c]">
          <div className="flex items-center gap-1.5 overflow-hidden">
            {isPriority && (
              <>
                <span className="whitespace-nowrap">Tin ưu tiên</span>
                <span className="size-[3px] rounded-full bg-[#9b9b9b] shrink-0" />
              </>
            )}
            <span className="whitespace-nowrap">{timeAgoText}</span>
          </div>
        </div>
      </div>
    </article>
  )
}

export { EventCard as JobCardFigma, EventCard as EventJobCard }
