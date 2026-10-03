"use client"

import React from "react"
import Link from "next/link"
import { Calendar, MapPin, DollarSign, Clock, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react"

export interface UpcomingShift {
  id: string
  status: string
  applied_at: string
  events?: {
    id: string
    title: string
    location?: string | null
    event_date?: string | null
    salary_amount?: number | null
    salary_type?: string | null
    position_type?: string | null
    danang_wards?: { name?: string | null } | null
    organizer?: {
      id?: string
      full_name?: string | null
      avatar_url?: string | null
    } | null
  } | null
}

interface StudentUpcomingShiftsProps {
  shifts: UpcomingShift[]
}

export default function StudentUpcomingShifts({ shifts }: StudentUpcomingShiftsProps) {
  const formatSalary = (amount?: number | null, type?: string | null) => {
    if (!amount) return "Thoả thuận"
    const formatted = `${amount.toLocaleString("vi-VN")}đ`
    if (type === "hourly") return `${formatted}/giờ`
    if (type === "daily") return `${formatted}/ngày`
    return `${formatted}/ca`
  }

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Chưa cập nhật ngày"
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-5 sm:p-6 shadow-xs flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-900 tracking-tight">
              Lịch Ca Làm Đã Được Duyệt
            </h2>
            <p className="text-xs text-zinc-500">
              Các sự kiện bạn đã ứng tuyển thành công và chuẩn bị tham gia
            </p>
          </div>
        </div>

        <Link
          href="/events"
          className="text-xs font-medium text-zinc-700 hover:text-zinc-950 flex items-center gap-1 transition-colors"
        >
          <span>Khám phá thêm</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Shifts List or Empty State */}
      {shifts.length > 0 ? (
        <div className="flex flex-col gap-3">
          {shifts.map((shift) => {
            const ev = shift.events
            if (!ev) return null
            const wardName = ev.danang_wards?.name
            const locationDisplay = [ev.location, wardName].filter(Boolean).join(", ") || "Đà Nẵng"

            return (
              <div
                key={shift.id}
                className="p-4 rounded-xl border border-zinc-200/90 bg-zinc-50/50 hover:bg-zinc-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center font-bold text-xs text-zinc-800 shrink-0 shadow-2xs overflow-hidden">
                    {ev.organizer?.avatar_url ? (
                      <img
                        src={ev.organizer.avatar_url}
                        alt={ev.organizer.full_name || "Organizer"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{ev.organizer?.full_name?.charAt(0) || "EM"}</span>
                    )}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/events/${ev.id}`}
                        className="text-sm font-semibold text-zinc-900 hover:text-zinc-600 truncate transition-colors"
                      >
                        {ev.title}
                      </Link>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Đã trúng tuyển
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
                      <span className="flex items-center gap-1 text-zinc-700 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        {formatDate(ev.event_date)}
                      </span>
                      <span className="flex items-center gap-1 truncate max-w-[240px]">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate">{locationDisplay}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-200/60">
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-zinc-400">Thù lao</p>
                    <p className="text-sm font-bold text-zinc-900">
                      {formatSalary(ev.salary_amount, ev.salary_type)}
                    </p>
                  </div>
                  <Link
                    href={`/events/${ev.id}`}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-medium transition-colors shadow-2xs"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="py-8 px-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/60 flex flex-col items-center text-center gap-2">
          <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
            <Clock className="w-5 h-5 text-zinc-400" />
          </div>
          <p className="text-sm font-medium text-zinc-900">Chưa có ca làm sự kiện nào sắp diễn ra</p>
          <p className="text-xs text-zinc-500 max-w-md">
            Khi hồ sơ ứng tuyển của bạn được Ban tổ chức phê duyệt, lịch trình và thời gian tập trung sẽ hiển thị tại đây.
          </p>
          <Link
            href="/events"
            className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-medium transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Ứng tuyển sự kiện ngay
          </Link>
        </div>
      )}
    </div>
  )
}
