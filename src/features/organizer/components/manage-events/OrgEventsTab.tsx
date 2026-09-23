"use client"

import React, { useState, useMemo } from "react"
import {
  Edit2,
  Trash2,
  Users,
  Calendar,
  MapPin,
  Briefcase,
  Tag,
  Clock,
  CircleDollarSign,
  Search,
  Plus,
  Play,
  Pause,
  AlertCircle,
  CheckCircle2,
  Rocket
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface OrgEventsTabProps {
  fetching: boolean
  events: any[]
  onEditClick: (ev: any) => void
  onDeleteEvent: (id: string) => void
  onViewApplications: (ev: any) => void
  onUpdateStatus?: (eventId: string, newStatus: string) => void
  onBumpEvent?: (eventId: string) => void
  isPremium?: boolean
  onCreateNew?: () => void
}

export default function OrgEventsTab({
  fetching,
  events = [],
  onEditClick,
  onDeleteEvent,
  onViewApplications,
  onUpdateStatus,
  onBumpEvent,
  isPremium = false,
  onCreateNew
}: OrgEventsTabProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused" | "completed">("all")

  // Counts & Metrics
  const stats = useMemo(() => {
    let active = 0
    let paused = 0
    let completed = 0
    let totalPending = 0
    let totalApproved = 0

    events.forEach((ev) => {
      const isClosed = ev.status === "closed"
      const isCompleted = ev.status === "completed"

      if (isCompleted) {
        completed++
      } else if (isClosed) {
        paused++
      } else {
        active++
      }

      const apps = ev.applications || []
      apps.forEach((a: any) => {
        if (a.status === "approved") totalApproved++
        else if (a.status === "pending" || !a.status) totalPending++
      })
    })

    return {
      total: events.length,
      active,
      paused,
      completed,
      totalPending,
      totalApproved
    }
  }, [events])

  // Filter & Search logic
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // 1. Search filter
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        ev.title?.toLowerCase().includes(q) ||
        ev.category?.toLowerCase().includes(q) ||
        ev.location?.toLowerCase().includes(q) ||
        ev.position_type?.toLowerCase().includes(q) ||
        ev.danang_wards?.name?.toLowerCase().includes(q)

      // 2. Status filter
      const isClosed = ev.status === "closed"
      const isCompleted = ev.status === "completed"
      const isActive = !isClosed && !isCompleted

      let matchesStatus = true
      if (statusFilter === "active") matchesStatus = isActive
      if (statusFilter === "paused") matchesStatus = isClosed
      if (statusFilter === "completed") matchesStatus = isCompleted

      return matchesSearch && matchesStatus
    })
  }, [events, searchQuery, statusFilter])

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="size-8 rounded-full border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-zinc-100 animate-spin" />
        <p className="text-[13.5px] font-medium text-zinc-500 dark:text-zinc-400">
          Đang tải danh sách chiến dịch tuyển dụng...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Quick Stats Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 shadow-xs">
          <p className="text-[11.5px] font-medium text-zinc-500 dark:text-zinc-400">Tổng chiến dịch</p>
          <p className="text-[19px] font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{stats.total}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 shadow-xs">
          <p className="text-[11.5px] font-medium text-zinc-500 dark:text-zinc-400">Đang tuyển dụng</p>
          <p className="text-[19px] font-bold text-emerald-600 dark:text-emerald-500 mt-0.5">{stats.active}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 shadow-xs">
          <p className="text-[11.5px] font-medium text-zinc-500 dark:text-zinc-400">Hồ sơ chờ duyệt</p>
          <p className="text-[19px] font-bold text-amber-600 dark:text-amber-500 mt-0.5">{stats.totalPending}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 shadow-xs">
          <p className="text-[11.5px] font-medium text-zinc-500 dark:text-zinc-400">Nhân sự đã tuyển</p>
          <p className="text-[19px] font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{stats.totalApproved}</p>
        </div>
      </div>

      {/* 2. Filter & Search Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
        {/* Status Segmented Switcher */}
        <div className="inline-flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg self-start sm:self-auto overflow-x-auto max-w-full">
          {[
            { id: "all", label: `Tất cả (${stats.total})` },
            { id: "active", label: `Đang mở (${stats.active})` },
            { id: "paused", label: `Tạm dừng (${stats.paused})` },
            { id: "completed", label: `Đã xong (${stats.completed})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              className={cn(
                "px-3 py-1.5 rounded-md text-[13px] font-medium transition-all cursor-pointer whitespace-nowrap",
                statusFilter === tab.id
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Create Button */}
        <div className="flex items-center gap-2.5 flex-1 max-w-full sm:max-w-md ml-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm sự kiện, vai trò, địa điểm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9.5 pl-9 pr-3 bg-white dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-lg text-[13.5px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 transition"
            />
          </div>

          {onCreateNew && (
            <Button
              type="button"
              onClick={onCreateNew}
              className="h-9.5 px-3.5 rounded-lg bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-[13px] font-medium inline-flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer transition"
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">Tạo mới</span>
            </Button>
          )}
        </div>
      </div>

      {/* 3. Events Grid or Empty State */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center max-w-md mx-auto space-y-3 shadow-xs">
          <div className="size-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 mx-auto">
            <Calendar className="size-6 stroke-[1.75]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-[16px] text-zinc-900 dark:text-zinc-100">
              {searchQuery ? "Không tìm thấy sự kiện phù hợp" : "Chưa có sự kiện trong mục này"}
            </h3>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
              {searchQuery
                ? "Thử thay đổi từ khóa tìm kiếm hoặc chọn tab bộ lọc khác."
                : "Tạo bài tuyển dụng mới để bắt đầu tiếp cận ứng viên sinh viên tại Đà Nẵng."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {filteredEvents.map((job) => {
            const apps = job.applications || []
            const totalCount = apps.length
            const approvedCount = apps.filter((a: any) => a.status === "approved").length
            const pendingCount = apps.filter((a: any) => a.status === "pending" || !a.status).length
            const remainingSlots = typeof job.slots_needed === "number" ? job.slots_needed : 0
            const totalQuota = approvedCount + remainingSlots > 0 ? approvedCount + remainingSlots : (job.slots_needed || 1)
            const isQuotaFull = remainingSlots === 0 && approvedCount >= totalQuota && totalQuota > 0
            const progressPercent = Math.min(100, Math.round((approvedCount / totalQuota) * 100))

            const isClosed = job.status === "closed"
            const isCompleted = job.status === "completed"
            const isActive = !isClosed && !isCompleted

            // Date formatting
            let dateStr = "Chưa ấn định"
            if (job.event_date) {
              const dStart = new Date(job.event_date).toLocaleDateString("vi-VN")
              if (job.end_date) {
                const dEnd = new Date(job.end_date).toLocaleDateString("vi-VN")
                dateStr = `${dStart} - ${dEnd}`
              } else {
                dateStr = dStart
              }
            }

            const locationDisplay = job.danang_wards?.name
              ? `${job.danang_wards.name}, Đà Nẵng`
              : job.location || "Đà Nẵng"

            return (
              <div
                key={job.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 hover:border-zinc-300 dark:hover:border-zinc-700 transition shadow-xs flex flex-col justify-between gap-3 group"
              >
                <div className="space-y-2.5">
                  {/* Category Pill & Status Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded text-[11px] font-medium tracking-normal truncate max-w-[170px]">
                      <Tag className="size-3 text-zinc-400 shrink-0" />
                      <span className="truncate">{job.category || "Sự kiện chung"}</span>
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isCompleted ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[11px] font-medium">
                          Đã hoàn thành
                        </span>
                      ) : isClosed ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[11px] font-medium">
                          Tạm dừng
                        </span>
                      ) : isQuotaFull ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium">
                          <CheckCircle2 className="size-2.5" /> Đủ chỉ tiêu
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium">
                          Đang mở
                        </span>
                      )}

                      {pendingCount > 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 text-[11px] font-semibold">
                          <span>{pendingCount} chờ</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Event Title */}
                  <h3 className="font-semibold text-[14.5px] text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-1">
                    {job.title}
                  </h3>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-1.5 text-[11.5px] text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center gap-1.5 truncate" title={locationDisplay}>
                      <MapPin className="size-3 text-zinc-400 shrink-0" />
                      <span className="truncate">{locationDisplay}</span>
                    </div>

                    <div className="flex items-center gap-1.5 truncate" title={job.position_type || "Tình nguyện viên"}>
                      <Briefcase className="size-3 text-zinc-400 shrink-0" />
                      <span className="truncate">{job.position_type || "Tình nguyện viên"}</span>
                    </div>

                    <div className="flex items-center gap-1.5 truncate" title={dateStr}>
                      <Calendar className="size-3 text-zinc-400 shrink-0" />
                      <span className="truncate">{dateStr}</span>
                    </div>

                    <div className="flex items-center gap-1.5 truncate">
                      <CircleDollarSign className="size-3 text-zinc-400 shrink-0" />
                      <span className="truncate">
                        {job.salary_amount && Number(job.salary_amount) > 0
                          ? `${Number(job.salary_amount).toLocaleString("vi-VN")} đ`
                          : "Tình nguyện viên"}
                      </span>
                    </div>
                  </div>

                  {/* Slot Progress Bar */}
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-md p-2 space-y-1">
                    <div className="flex items-center justify-between text-[11.5px]">
                      <span className="text-zinc-500 dark:text-zinc-400">Tiến độ:</span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        <strong className="text-emerald-600 dark:text-emerald-400">{approvedCount}</strong>/{totalQuota} ({progressPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all duration-300 rounded-full",
                          progressPercent >= 100
                            ? "bg-emerald-600 dark:bg-emerald-500"
                            : "bg-zinc-800 dark:bg-zinc-200"
                        )}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between gap-1.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => onViewApplications(job)}
                    className="flex-1 h-8 px-3 rounded-md bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white font-medium text-[12px] flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Users className="size-3.5" />
                    <span>Xem hồ sơ ({totalCount})</span>
                  </button>

                  {/* Status Toggle Button (Open / Pause) */}
                  {onUpdateStatus && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(job.id, isClosed ? "upcoming" : "closed")}
                      title={isClosed ? "Mở lại nhận đơn" : "Tạm dừng nhận đơn"}
                      className="size-8 rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center transition cursor-pointer shrink-0"
                    >
                      {isClosed ? <Play className="size-3" /> : <Pause className="size-3" />}
                    </button>
                  )}

                  {/* Bump Button */}
                  {onBumpEvent && (
                    <button
                      type="button"
                      onClick={() => onBumpEvent(job.id)}
                      title={isPremium ? "Đẩy tin lên đầu (Gói VIP)" : "Nâng cấp VIP để đẩy tin"}
                      className={cn(
                        "size-8 rounded-md border flex items-center justify-center transition cursor-pointer shrink-0",
                        isPremium
                          ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-400"
                          : "border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                      )}
                    >
                      <Rocket className="size-3.5" />
                    </button>
                  )}

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => onEditClick(job)}
                    title="Chỉnh sửa"
                    className="size-8 rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center transition cursor-pointer shrink-0"
                  >
                    <Edit2 className="size-3" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => onDeleteEvent(job.id)}
                    title="Xóa sự kiện"
                    className="size-8 rounded-md border border-zinc-200 dark:border-zinc-700 hover:border-red-200 hover:bg-red-50 text-zinc-500 hover:text-red-600 flex items-center justify-center transition cursor-pointer shrink-0"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
