"use client"

import Link from "next/link"
import {
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Send,
  Award,
  Star,
  Calendar,
  MapPin,
  Banknote,
  Clock,
  XCircle,
  Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"

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
  formatSalary,
}: ApplicationCardProps) {
  const event = app.events || {}
  const organizer = event.profiles || {}
  const orgName = organizer.full_name || organizer.university || "Ban Tổ Chức"
  const orgAvatar =
    organizer.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(orgName)}&background=27272a&color=fff`
  const status = app.status || "pending"
  const timeAgo = formatTimeAgo(app.applied_at)

  // Salary string
  const salaryDisplay = formatSalary
    ? formatSalary(event.salary_amount, event.salary_type)
    : event.salary_amount
    ? `${event.salary_amount.toLocaleString("vi-VN")}đ`
    : "Thù lao thỏa thuận"

  // Date string
  const eventDateDisplay = event.event_date
    ? new Date(event.event_date).toLocaleDateString("vi-VN")
    : "Chưa xác định"

  // Location string
  const locationDisplay = event.danang_wards?.name || event.location || "Đà Nẵng"

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700">
      {/* 1. Header Card */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Info Group */}
        <div className="flex items-start gap-4 min-w-0 flex-1">
          {/* Company / Event Logo */}
          <div className="size-14 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50 dark:bg-zinc-800 shrink-0">
            <img
              src={orgAvatar}
              alt={orgName}
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(orgName)}&background=27272a&color=fff&size=56`
              }}
              className="size-full object-cover"
            />
          </div>

          {/* Title & Meta */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate max-w-xs">
                {orgName}
              </span>
              <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                Ứng tuyển {timeAgo}
              </span>
            </div>

            <Link
              href={`/events/${event.id}`}
              className="font-semibold text-base text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1 block"
            >
              {event.title || "Vị trí Sự kiện"}
            </Link>

            {/* Quick Meta Chips */}
            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-zinc-500 dark:text-zinc-400 pt-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>{eventDateDisplay}</span>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                <span>{locationDisplay}</span>
              </span>
              <span className="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                <Banknote className="w-3.5 h-3.5 text-zinc-400" />
                <span>{salaryDisplay}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Status Badge & Toggle Expand Button */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
          {/* Status Badge */}
          {status === "approved" ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Trúng tuyển
            </span>
          ) : status === "rejected" ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/60">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              Bị từ chối
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              Đang xét duyệt
            </span>
          )}

          {/* Toggle Button */}
          <button
            type="button"
            onClick={onToggleExpand}
            className="size-8 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label={isExpanded ? "Thu gọn chi tiết" : "Xem chi tiết"}
          >
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                isExpanded && "rotate-180"
              )}
            />
          </button>
        </div>
      </div>

      {/* 2. Expanded Timeline & Action Section */}
      {isExpanded && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 px-5 py-4 space-y-4">
          {/* Vertical Stepper Timeline */}
          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-zinc-200 dark:before:bg-zinc-700">
            {/* Step 1: Đã nộp đơn */}
            <div className="relative">
              <span className="absolute -left-6 top-0.5 size-4 rounded-full bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-100 flex items-center justify-center">
                <span className="size-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100" />
              </span>
              <div className="space-y-0.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Đã nộp đơn ứng tuyển
                  </span>
                  <span className="text-zinc-400 dark:text-zinc-500">{timeAgo}</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Hồ sơ ứng tuyển của bạn đã được gửi thành công đến Ban tổ chức.
                </p>
              </div>
            </div>

            {/* Step 2: Đã xem hồ sơ */}
            <div className="relative">
              <span
                className={cn(
                  "absolute -left-6 top-0.5 size-4 rounded-full bg-white dark:bg-zinc-900 border-2 flex items-center justify-center",
                  status === "approved" || status === "rejected"
                    ? "border-zinc-900 dark:border-zinc-100"
                    : "border-amber-500"
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    status === "approved" || status === "rejected"
                      ? "bg-zinc-900 dark:bg-zinc-100"
                      : "bg-amber-500"
                  )}
                />
              </span>
              <div className="space-y-0.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Ban tổ chức đã xem hồ sơ
                  </span>
                  <span className="text-zinc-400 dark:text-zinc-500">{timeAgo}</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Ban tổ chức đã kiểm tra thông tin năng lực và kinh nghiệm của bạn.
                </p>
              </div>
            </div>

            {/* Step 3: Kết quả xét duyệt */}
            <div className="relative">
              {status === "approved" ? (
                <>
                  <span className="absolute -left-6 top-0.5 size-4 rounded-full bg-emerald-500 border-2 border-emerald-500 flex items-center justify-center text-white">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        Chúc mừng! Bạn đã trúng tuyển
                      </span>
                      <span className="text-zinc-400 dark:text-zinc-500">{timeAgo}</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Đơn ứng tuyển đã được duyệt. Vui lòng tham gia nhóm Zalo điều phối của Ban tổ chức để nhận ca và phân công chi tiết.
                    </p>
                  </div>
                </>
              ) : status === "rejected" ? (
                <>
                  <span className="absolute -left-6 top-0.5 size-4 rounded-full bg-rose-500 border-2 border-rose-500 flex items-center justify-center text-white">
                    <XCircle className="w-3 h-3 text-white" />
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-rose-700 dark:text-rose-400">
                        Chưa phù hợp ở chiến dịch này
                      </span>
                      <span className="text-zinc-400 dark:text-zinc-500">{timeAgo}</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Rất tiếc vị trí sự kiện này đã nhận đủ số lượng nhân sự. Chúc bạn may mắn ở các sự kiện tiếp theo!
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <span className="absolute -left-6 top-0.5 size-4 rounded-full bg-white dark:bg-zinc-900 border-2 border-zinc-400 flex items-center justify-center">
                    <Clock className="w-2.5 h-2.5 text-zinc-500" />
                  </span>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                        Đang chờ kết quả xét duyệt
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Ban tổ chức đang tổng hợp danh sách ứng viên và sẽ phản hồi sớm nhất.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Links & Buttons */}
          {(event.zalo_group_link || app.attendance_status === "completed") && (
            <div className="pt-3 flex flex-wrap items-center gap-2.5 border-t border-zinc-200 dark:border-zinc-800">
              {status === "approved" && event.zalo_group_link && (
                <a
                  href={event.zalo_group_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 px-3.5 rounded-lg bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Vào nhóm Zalo điều phối</span>
                </a>
              )}

              {app.attendance_status === "completed" && (
                <button
                  type="button"
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
                  className="h-8 px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
                  <span>Xem Chứng nhận</span>
                </button>
              )}

              {app.attendance_status === "completed" && onReview && (
                <button
                  type="button"
                  onClick={() =>
                    onReview({
                      eventId: event.id,
                      organizerId: organizer.id || event.organizer_id,
                      organizerName: orgName,
                    })
                  }
                  className="h-8 px-3.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
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
