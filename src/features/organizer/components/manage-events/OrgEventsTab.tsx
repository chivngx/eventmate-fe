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
  Award,
  CircleDollarSign,
  Search,
  Plus,
  ChevronRight,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface OrgEventsTabProps {
  fetching: boolean
  events: any[]
  onEditClick: (ev: any) => void
  onDeleteEvent: (id: string) => void
  onViewApplications: (ev: any) => void
  onCreateNew?: () => void
}

export default function OrgEventsTab({
  fetching,
  events = [],
  onEditClick,
  onDeleteEvent,
  onViewApplications,
  onCreateNew
}: OrgEventsTabProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "closed">("all")

  // Filter & Search logic
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // 1. Search filter
      const matchesSearch =
        !searchQuery.trim() ||
        ev.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.position_type?.toLowerCase().includes(searchQuery.toLowerCase())

      // 2. Status filter
      const isClosed = ev.status === "closed" || (ev.event_date && new Date(ev.event_date).getTime() < new Date().setHours(0, 0, 0, 0))
      let matchesStatus = true
      if (statusFilter === "active") matchesStatus = !isClosed
      if (statusFilter === "closed") matchesStatus = isClosed

      return matchesSearch && matchesStatus
    })
  }, [events, searchQuery, statusFilter])

  // Count active / closed
  const counts = useMemo(() => {
    let active = 0
    let closed = 0
    events.forEach((ev) => {
      const isClosed = ev.status === "closed" || (ev.event_date && new Date(ev.event_date).getTime() < new Date().setHours(0, 0, 0, 0))
      if (isClosed) closed++
      else active++
    })
    return { all: events.length, active, closed }
  }, [events])

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-white rounded-[16px] border border-[#ededed]">
        <div className="size-10 rounded-full border-3 border-[#222222]/20 border-t-[#222222] animate-spin" />
        <p className="text-[14px] font-medium text-[#757575]">Đang tải danh sách chiến dịch tuyển dụng...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Filter & Search Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 bg-white p-3 rounded-[16px] border border-[#ededed] shadow-xs">
        {/* Status Segmented Switcher */}
        <div className="inline-flex max-w-fit bg-[#ededed] p-1 rounded-[8px] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-[6px] text-[13px] font-medium transition-all cursor-pointer",
              statusFilter === "all"
                ? "bg-white text-[#222222] font-semibold shadow-xs"
                : "text-[#757575] hover:text-[#222222]"
            )}
          >
            Tất cả ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={cn(
              "px-3.5 py-1.5 rounded-[6px] text-[13px] font-medium transition-all cursor-pointer",
              statusFilter === "active"
                ? "bg-white text-[#222222] font-semibold shadow-xs"
                : "text-[#757575] hover:text-[#222222]"
            )}
          >
            Đang mở ({counts.active})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("closed")}
            className={cn(
              "px-3.5 py-1.5 rounded-[6px] text-[13px] font-medium transition-all cursor-pointer",
              statusFilter === "closed"
                ? "bg-white text-[#222222] font-semibold shadow-xs"
                : "text-[#757575] hover:text-[#222222]"
            )}
          >
            Đã đóng ({counts.closed})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-full sm:max-w-[320px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#757575]" />
          <input
            type="text"
            placeholder="Tìm theo tên sự kiện, vị trí..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[40px] pl-10 pr-3.5 bg-white border border-[#cbcbcb] rounded-[8px] text-[14px] text-[#222222] placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#222222] focus:ring-1 focus:ring-[#222222] transition-all"
          />
        </div>
      </div>

      {/* 2. Events Grid or Empty State */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white border border-[#ededed] rounded-[16px] p-12 text-center max-w-xl mx-auto space-y-4 shadow-xs">
          <div className="size-14 bg-[#f4f4f4] rounded-[12px] flex items-center justify-center text-[#757575] mx-auto">
            <Calendar className="size-7 stroke-[1.75]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-['Inter'] font-semibold text-[18px] text-[#222222]">
              {searchQuery ? "Không tìm thấy sự kiện phù hợp" : "Chưa có chiến dịch tuyển dụng nào"}
            </h3>
            <p className="text-[13px] text-[#757575] max-w-md mx-auto leading-relaxed">
              {searchQuery
                ? "Thử thay đổi từ khóa tìm kiếm hoặc chuyển tab bộ lọc trạng thái để xem thêm."
                : "Đăng tin tuyển dụng tình nguyện viên / CTV để tiếp cận hàng ngàn sinh viên tài năng tại Đà Nẵng!"}
            </p>
          </div>
          {onCreateNew && !searchQuery && (
            <Button
              type="button"
              onClick={onCreateNew}
              className="h-[42px] px-5 rounded-[8px] bg-[#222222] hover:bg-black text-white font-medium text-[14px] inline-flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Plus className="size-4" />
              Tạo chiến dịch mới
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((job) => {
            const candidateCount = job.applications?.length || 0
            const isClosed = job.status === "closed" || (job.event_date && new Date(job.event_date).getTime() < new Date().setHours(0, 0, 0, 0))

            return (
              <div
                key={job.id}
                className="bg-white border border-[#ededed] rounded-[16px] p-6 hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between gap-5 shadow-xs group"
              >
                <div className="space-y-4">
                  {/* Category Pill & Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 bg-[#f4f4f4] text-[#515151] px-2.5 py-1 rounded-[6px] text-[12px] font-medium tracking-normal truncate max-w-[200px]">
                      <Tag className="size-3 text-[#757575] shrink-0" />
                      <span className="truncate">{job.category || "Sự kiện chung"}</span>
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      {isClosed ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-[4px] border border-[#757575] text-[#757575] bg-gray-50 text-[12px] font-medium">
                          Đã đóng
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-[4px] border border-[#009E00] text-[#009E00] bg-emerald-50/50 text-[12px] font-medium">
                          Đang mở đăng ký
                        </span>
                      )}

                      {candidateCount > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-[4px] border border-[#ededed] text-[#222222] bg-[#f4f4f4] text-[12px] font-medium">
                          {candidateCount} hồ sơ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="font-['Inter'] font-semibold text-[17px] text-[#222222] leading-snug line-clamp-2 group-hover:text-black transition-colors">
                    {job.title}
                  </h4>

                  {/* Meta Details Box */}
                  <div className="bg-[#fafafa] border border-[#ededed] rounded-[12px] p-3.5 grid grid-cols-2 gap-2.5 text-[13px] text-[#515151]">
                    <div className="flex items-center gap-2 truncate min-w-0" title={job.location || "Đà Nẵng"}>
                      <MapPin className="size-4 text-[#757575] shrink-0" />
                      <span className="truncate">{job.location || "Đà Nẵng"}</span>
                    </div>

                    <div className="flex items-center gap-2 truncate min-w-0" title={job.position_type || "Tình nguyện viên"}>
                      <Briefcase className="size-4 text-[#757575] shrink-0" />
                      <span className="truncate">{job.position_type || "Tình nguyện viên"}</span>
                    </div>

                    <div className="flex items-center gap-2 truncate min-w-0">
                      <CircleDollarSign className="size-4 text-[#757575] shrink-0" />
                      <span className="truncate">
                        {job.salary_amount
                          ? `${Number(String(job.salary_amount).replace(/\D/g, "")).toLocaleString()}đ`
                          : "Thỏa thuận"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 truncate min-w-0" title={job.application_deadline ? new Date(job.application_deadline).toLocaleDateString('vi-VN') : 'Không giới hạn'}>
                      <Clock className="size-4 text-[#757575] shrink-0" />
                      <span className="truncate">
                        Hạn: {job.application_deadline ? new Date(job.application_deadline).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                      </span>
                    </div>
                  </div>

                  {/* Slots & Benefits Tags */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <span className="inline-flex items-center gap-1.5 bg-[#f4f4f4] border border-[#ededed] text-[#222222] px-3 py-1 rounded-[8px] text-[12px] font-medium">
                      <span>Cần tuyển:</span>
                      <strong className="font-semibold text-[#222222]">{job.slots_needed || 1}</strong>
                    </span>

                    {job.benefits && (
                      <span className="inline-flex items-center gap-1.5 bg-[#f4f4f4] border border-[#ededed] text-[#515151] px-3 py-1 rounded-[8px] text-[12px] font-medium truncate max-w-[280px]">
                        <Award className="size-3.5 text-[#757575] shrink-0" />
                        <span className="truncate">{job.benefits}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#ededed] mt-1">
                  <button
                    type="button"
                    onClick={() => onViewApplications(job)}
                    className="flex-1 h-[40px] px-4 rounded-[8px] bg-[#222222] hover:bg-black text-white font-medium text-[13px] flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                  >
                    <Users className="size-4" />
                    <span>Xem hồ sơ ({candidateCount})</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEditClick(job)}
                      aria-label="Chỉnh sửa thông tin chiến dịch"
                      title="Chỉnh sửa"
                      className="size-[40px] rounded-[8px] border border-[#ededed] hover:border-slate-300 hover:bg-[#f4f4f4] text-[#515151] hover:text-[#222222] flex items-center justify-center transition cursor-pointer"
                    >
                      <Edit2 className="size-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteEvent(job.id)}
                      aria-label="Xóa sự kiện"
                      title="Xóa sự kiện"
                      className="size-[40px] rounded-[8px] border border-[#ededed] hover:border-rose-300 hover:bg-rose-50 text-[#757575] hover:text-[#dc0000] flex items-center justify-center transition cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
