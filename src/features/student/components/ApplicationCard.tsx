"use client"

import Link from "next/link"
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Send,
  Award,
  Star,
} from "lucide-react"

interface ApplicationCardProps {
  application: any
  isExpanded: boolean
  onToggleExpand: () => void
  onViewCertificate: (cert: {
    studentName: string
    eventTitle: string
    position: string
    eventDate: string
    organizerName: string
  }) => void
  onReview?: (data: { eventId: string; organizerId: string; organizerName: string }) => void
  studentFullName: string
  formatSalary?: (amount: number | null, type: string | null) => string
}

function formatTimeAgo(dateString?: string): string {
  if (!dateString) return "Gần đây"
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays > 30) return date.toLocaleDateString("vi-VN")
  if (diffDays > 0) return `${diffDays} ngày trước`
  if (diffHours > 0) return `${diffHours} giờ trước`
  return "Hôm nay"
}

export default function ApplicationCard({
  application: app,
  isExpanded,
  onToggleExpand,
  onViewCertificate,
  onReview,
  studentFullName,
}: ApplicationCardProps) {
  const event = app.events || {}
  const organizer = event.profiles || {}
  const orgName = organizer.full_name || organizer.university || "Ban Tổ Chức"
  const orgAvatar =
    organizer.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(orgName)}&background=005DDC&color=fff`
  const status = app.status || "pending"

  // Status Badge Styling matching Figma node 6447:50565 / 5875:27652
  let statusBadge = (
    <div
      className="border border-[#005ddc] flex h-[28px] items-center justify-center px-[8px] py-[4px] relative rounded-[4px] shrink-0"
      data-name="Badge"
    >
      <span className="font-normal text-[#005ddc] text-[12px] leading-normal whitespace-nowrap">
        Đã ứng tuyển
      </span>
    </div>
  )

  if (status === "approved") {
    statusBadge = (
      <div
        className="border border-[#009e00] flex h-[28px] items-center justify-center px-[8px] py-[4px] relative rounded-[4px] shrink-0"
        data-name="Badge"
      >
        <span className="font-normal text-[#009e00] text-[12px] leading-normal whitespace-nowrap">
          Trúng tuyển
        </span>
      </div>
    )
  } else if (status === "rejected") {
    statusBadge = (
      <div
        className="border border-[#dc0000] flex h-[28px] items-center justify-center px-[8px] py-[4px] relative rounded-[4px] shrink-0"
        data-name="Badge"
      >
        <span className="font-normal text-[#dc0000] text-[12px] leading-normal whitespace-nowrap">
          Bị từ chối
        </span>
      </div>
    )
  }

  const timeAgo = formatTimeAgo(app.applied_at)

  return (
    <div
      className="bg-white border border-[#ededed] rounded-[8px] overflow-hidden transition-shadow"
      data-node-id={isExpanded ? "5875:27652" : "6447:50565"}
      data-name="Apply Status"
    >
      {/* 1. Header Card (Figma: Component 11, node I6447:50565;3822:25558 / I5875:27652;3822:26237) */}
      <div className="p-[24px] flex items-center justify-between gap-4">
        {/* Left Info Group (Figma: Frame 2147225256) */}
        <div className="flex gap-[12px] items-start min-w-0 flex-1">
          {/* Company / Event Logo (64x64, rounded-8px, border #ededed) */}
          <div className="size-[64px] rounded-[8px] border border-[#ededed] overflow-hidden bg-slate-50 shrink-0">
            <img
              src={orgAvatar}
              alt={orgName}
              className="size-full object-cover"
            />
          </div>

          {/* Title & Badge (Figma: Frame 2147225255) */}
          <div className="flex flex-col gap-[8px] items-start justify-center min-w-0 flex-1">
            <div className="flex flex-col gap-[2px] items-start leading-normal min-w-0 w-full">
              <p className="font-normal text-[#a5a5a5] text-[12px] truncate w-full">
                {orgName}
              </p>
              <Link
                href={`/events/${event.id}`}
                className="font-medium text-[#222] text-[18px] hover:text-[#005ddc] transition-colors truncate block max-w-full"
              >
                {event.title || "Vị trí Sự kiện"}
              </Link>
            </div>
            <div>{statusBadge}</div>
          </div>
        </div>

        {/* Right Chevron Button ONLY (Figma: angle-down / angle-up, size 24px) */}
        <div className="flex items-center justify-center shrink-0">
          <button
            onClick={onToggleExpand}
            className="size-[24px] flex items-center justify-center text-[#222] hover:text-[#005ddc] transition-colors cursor-pointer"
            aria-label={isExpanded ? "Thu gọn chi tiết" : "Xem chi tiết"}
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* 2. Expanded Timeline Section (Figma: Component 10 / Frame 2147225425, node I5875:27652;3822:26247) */}
      {isExpanded && (
        <div
          className="bg-white border-t border-[#f4f4f4] px-[20px] py-[16px] flex flex-col gap-[12px] w-full"
          data-node-id="I5875:27652;3822:26247"
          data-name="Component 10/Frame 2147225425"
        >
          {/* A. If status is APPROVED */}
          {status === "approved" && (
            <>
              {/* Step 1: Accepted (Active with description) */}
              <div className="flex gap-[8px] items-center w-full">
                <div className="size-[16px] shrink-0 text-[#009e00]">
                  <CheckCircle2 className="size-full" />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden rounded-[8px]">
                  <div className="bg-[#f4f4f4] border-l-4 border-[#009e00] pl-[16px] pr-[12px] py-[8px] flex flex-col gap-[8px] w-full">
                    <div className="flex items-center justify-between w-full whitespace-nowrap">
                      <p className="font-semibold text-[#222] text-[12px]">Trúng tuyển</p>
                      <p className="font-medium text-[#757575] text-[10px] text-center">
                        {timeAgo}
                      </p>
                    </div>
                    <p className="font-normal text-[#757575] text-[12px] truncate w-full">
                      Đơn ứng tuyển của bạn đã được Ban tổ chức phê duyệt trúng tuyển. Vui lòng tham gia nhóm điều phối.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2: Checked (Passed, compact) */}
              <div className="flex gap-[8px] items-center w-full">
                <div className="size-[16px] shrink-0 text-[#a5a5a5]">
                  <CheckCircle2 className="size-full" />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden rounded-[8px]">
                  <div className="bg-[#f4f4f4] border-l-4 border-[#f6b500] pl-[16px] pr-[12px] py-[8px] flex items-center justify-between w-full whitespace-nowrap">
                    <p className="font-semibold text-[#757575] text-[12px]">Đã xem hồ sơ</p>
                    <p className="font-medium text-[#757575] text-[10px] text-center">
                      {timeAgo}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3: Applied (Passed, compact) */}
              <div className="flex gap-[8px] items-center w-full">
                <div className="size-[16px] shrink-0 text-[#a5a5a5]">
                  <CheckCircle2 className="size-full" />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden rounded-[8px]">
                  <div className="bg-[#f4f4f4] border-l-4 border-[#222] pl-[16px] pr-[12px] py-[8px] flex items-center justify-between w-full whitespace-nowrap">
                    <p className="font-semibold text-[#757575] text-[12px]">Đã ứng tuyển</p>
                    <p className="font-medium text-[#757575] text-[10px] text-center">
                      {timeAgo}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* B. If status is REJECTED */}
          {status === "rejected" && (
            <>
              {/* Step 1: Rejected (Active with description) */}
              <div className="flex gap-[8px] items-center w-full">
                <div className="size-[16px] shrink-0 text-[#dc0000]">
                  <AlertCircle className="size-full" />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden rounded-[8px]">
                  <div className="bg-[#f4f4f4] border-l-4 border-[#dc0000] pl-[16px] pr-[12px] py-[8px] flex flex-col gap-[8px] w-full">
                    <div className="flex items-center justify-between w-full whitespace-nowrap">
                      <p className="font-semibold text-[#222] text-[12px]">Bị từ chối</p>
                      <p className="font-medium text-[#757575] text-[10px] text-center">
                        {timeAgo}
                      </p>
                    </div>
                    <p className="font-normal text-[#757575] text-[12px] truncate w-full">
                      Rất tiếc vị trí sự kiện này đã nhận đủ số lượng nhân sự. Hẹn gặp bạn ở chiến dịch sau nhé!
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2: Checked (Passed, compact) */}
              <div className="flex gap-[8px] items-center w-full">
                <div className="size-[16px] shrink-0 text-[#a5a5a5]">
                  <CheckCircle2 className="size-full" />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden rounded-[8px]">
                  <div className="bg-[#f4f4f4] border-l-4 border-[#f6b500] pl-[16px] pr-[12px] py-[8px] flex items-center justify-between w-full whitespace-nowrap">
                    <p className="font-semibold text-[#757575] text-[12px]">Đã xem hồ sơ</p>
                    <p className="font-medium text-[#757575] text-[10px] text-center">
                      {timeAgo}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3: Applied (Passed, compact) */}
              <div className="flex gap-[8px] items-center w-full">
                <div className="size-[16px] shrink-0 text-[#a5a5a5]">
                  <CheckCircle2 className="size-full" />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden rounded-[8px]">
                  <div className="bg-[#f4f4f4] border-l-4 border-[#222] pl-[16px] pr-[12px] py-[8px] flex items-center justify-between w-full whitespace-nowrap">
                    <p className="font-semibold text-[#757575] text-[12px]">Đã ứng tuyển</p>
                    <p className="font-medium text-[#757575] text-[10px] text-center">
                      {timeAgo}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* C. If status is PENDING (Default) */}
          {status !== "approved" && status !== "rejected" && (
            <>
              {/* Step 1: Checked (Active with description) */}
              <div className="flex gap-[8px] items-center w-full">
                <div className="size-[16px] shrink-0 text-[#f6b500]">
                  <CheckCircle2 className="size-full" />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden rounded-[8px]">
                  <div className="bg-[#f4f4f4] border-l-4 border-[#f6b500] pl-[16px] pr-[12px] py-[8px] flex flex-col gap-[4px] w-full">
                    <div className="flex items-center justify-between w-full whitespace-nowrap">
                      <p className="font-semibold text-[#222] text-[12px]">Đã xem hồ sơ</p>
                      <p className="font-medium text-[#757575] text-[10px] text-center">
                        {timeAgo}
                      </p>
                    </div>
                    <p className="font-normal text-[#757575] text-[12px] truncate w-full">
                      Ban tổ chức đã xem qua hồ sơ năng lực của bạn và đang xét duyệt.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2: Applied (Passed, compact) */}
              <div className="flex gap-[8px] items-center w-full">
                <div className="size-[16px] shrink-0 text-[#a5a5a5]">
                  <CheckCircle2 className="size-full" />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden rounded-[8px]">
                  <div className="bg-[#f4f4f4] border-l-4 border-[#222] pl-[16px] pr-[12px] py-[8px] flex items-center justify-between w-full whitespace-nowrap">
                    <p className="font-semibold text-[#757575] text-[12px]">Đã ứng tuyển</p>
                    <p className="font-medium text-[#757575] text-[10px] text-center">
                      {timeAgo}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Action Links (Zalo Group / Certificate) */}
          {(event.zalo_group_link || app.attendance_status === "completed") && (
            <div className="pt-2 flex items-center gap-3 border-t border-[#ededed]/60">
              {status === "approved" && event.zalo_group_link && (
                <a
                  href={event.zalo_group_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 px-3 rounded-[6px] bg-[#005ddc] text-white hover:bg-[#004eb7] text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Vào nhóm Zalo</span>
                </a>
              )}

              {app.attendance_status === "completed" && (
                <button
                  onClick={() =>
                    onViewCertificate({
                      studentName: studentFullName,
                      eventTitle: event.title,
                      position: event.position_type || "Nhân sự sự kiện",
                      eventDate: event.event_date
                        ? new Date(event.event_date).toLocaleDateString("vi-VN")
                        : "2025",
                      organizerName: orgName,
                    })
                  }
                  className="h-8 px-3 rounded-[6px] bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Xem Chứng nhận</span>
                </button>
              )}

              {app.attendance_status === "completed" && onReview && (
                <button
                  onClick={() =>
                    onReview({
                      eventId: event.id,
                      organizerId: organizer.id || event.organizer_id,
                      organizerName: orgName,
                    })
                  }
                  className="h-8 px-3 rounded-[6px] bg-amber-500 text-white hover:bg-amber-600 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>Đánh giá Ban tổ chức</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
