"use client"

import React, { useState, useMemo } from "react"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  FileText,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Users,
  Search,
  Award,
  CircleDollarSign,
  Clock,
  Star,
  ExternalLink,
  RotateCcw,
  Check,
  X,
  UserCheck
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface OrgEventApplicationsDetailProps {
  event: any
  applications: any[]
  loadingApps: boolean
  onBack: () => void
  setViewingCV: (cv: any) => void
  handleUpdateStatus: (appId: string, status: string) => void
  handleUpdateAttendanceStatus?: (appId: string, status: string) => void
  onStartChatWithStudent: (eventId: string, studentId: string) => void
  onRateStudent: (eventId: string, studentId: string, studentName: string) => void
}

export default function OrgEventApplicationsDetail({
  event,
  applications = [],
  loadingApps,
  onBack,
  setViewingCV,
  handleUpdateStatus,
  handleUpdateAttendanceStatus,
  onStartChatWithStudent,
  onRateStudent
}: OrgEventApplicationsDetailProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")

  if (!event) return null

  // Counts by status
  const counts = useMemo(() => {
    let pending = 0
    let approved = 0
    let rejected = 0
    applications.forEach((app) => {
      if (app.status === "approved") approved++
      else if (app.status === "rejected") rejected++
      else pending++
    })
    return { all: applications.length, pending, approved, rejected }
  }, [applications])

  // Filtered applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const student = app.profiles || {}
      const fullName = student.full_name || ""
      const university = student.university || ""
      const phone = student.phone || ""
      const email = student.email || ""

      // 1. Search matching
      const matchesSearch =
        !searchQuery.trim() ||
        fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        university.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phone.includes(searchQuery) ||
        email.toLowerCase().includes(searchQuery.toLowerCase())

      // 2. Status matching
      let matchesStatus = true
      if (statusFilter === "pending") matchesStatus = app.status === "pending" || !app.status
      if (statusFilter === "approved") matchesStatus = app.status === "approved"
      if (statusFilter === "rejected") matchesStatus = app.status === "rejected"

      return matchesSearch && matchesStatus
    })
  }, [applications, searchQuery, statusFilter])

  // Match score calculation
  const getCandidateMatchScore = (student: any) => {
    const userSkills = student?.skills
    if (!userSkills) return null
    const skills = userSkills.split(",").map((s: string) => s.trim().toLowerCase()).filter(Boolean)
    if (skills.length === 0) return null

    const searchText = `${event.title || ""} ${event.desc || event.description || ""} ${event.category || ""} ${event.position_type || ""}`.toLowerCase()
    let matches = 0
    skills.forEach((skill: string) => {
      if (searchText.includes(skill)) matches++
    })

    if (matches > 0) {
      const ratio = matches / skills.length
      return Math.round(55 + ratio * 45)
    }
    return 35
  }

  const isEventClosed =
    event.status === "closed" ||
    (event.event_date && new Date(event.event_date).getTime() < new Date().setHours(0, 0, 0, 0))

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header with Back Button */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="h-[40px] px-4 rounded-[8px] border border-[#cbcbcb] hover:border-slate-400 bg-white hover:bg-slate-50 text-[#222222] font-medium text-[13px] inline-flex items-center gap-2 transition cursor-pointer shrink-0 shadow-xs"
        >
          <ArrowLeft className="size-4" />
          <span>Quay lại danh sách chiến dịch</span>
        </button>
      </div>

      {/* 2. Event Summary Card (Joblin Style) */}
      <div className="bg-white border border-[#ededed] rounded-[16px] p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left info column */}
          <div className="space-y-3 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#f4f4f4] text-[#515151] px-2.5 py-1 rounded-[6px] text-[12px] font-medium">
                {event.category || "Sự kiện"}
              </span>

              <span className="bg-[#f4f4f4] text-[#222222] border border-[#ededed] px-2.5 py-1 rounded-[6px] text-[12px] font-medium">
                {event.position_type || "Tình nguyện viên"}
              </span>

              {isEventClosed ? (
                <span className="border border-[#757575] text-[#757575] bg-gray-50 px-2.5 py-0.5 rounded-[4px] text-[12px] font-medium">
                  Đã đóng
                </span>
              ) : (
                <span className="border border-[#009E00] text-[#009E00] bg-emerald-50/50 px-2.5 py-0.5 rounded-[4px] text-[12px] font-medium">
                  Đang mở tuyển
                </span>
              )}
            </div>

            <h1 className="font-['Inter'] font-bold text-[20px] sm:text-[22px] text-[#222222] leading-snug">
              {event.title}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[13px] text-[#515151] pt-1">
              <div className="flex items-center gap-2 truncate">
                <MapPin className="size-4 text-[#757575] shrink-0" />
                <span className="truncate">{event.location || "Đà Nẵng"}</span>
              </div>

              <div className="flex items-center gap-2 truncate">
                <Calendar className="size-4 text-[#757575] shrink-0" />
                <span>
                  {event.event_date ? new Date(event.event_date).toLocaleDateString("vi-VN") : "Chưa ấn định"}
                </span>
              </div>

              <div className="flex items-center gap-2 truncate">
                <CircleDollarSign className="size-4 text-[#757575] shrink-0" />
                <span>
                  {event.salary_amount
                    ? `${Number(String(event.salary_amount).replace(/\D/g, "")).toLocaleString()}đ`
                    : "Thỏa thuận"}
                </span>
              </div>

              <div className="flex items-center gap-2 truncate">
                <Clock className="size-4 text-[#757575] shrink-0" />
                <span>
                  {event.start_time && event.end_time ? `${event.start_time} - ${event.end_time}` : "Theo ca"}
                </span>
              </div>
            </div>
          </div>

          {/* Right Metrics Pillars */}
          <div className="grid grid-cols-3 gap-3 bg-[#fafafa] border border-[#ededed] rounded-[14px] p-4 shrink-0 text-center min-w-[300px]">
            <div>
              <p className="text-[11px] font-medium text-[#757575] uppercase">Cần tuyển</p>
              <p className="font-semibold text-[20px] text-[#222222] mt-0.5">{event.slots_needed || 1}</p>
            </div>
            <div className="border-x border-[#ededed] px-2">
              <p className="text-[11px] font-medium text-[#757575] uppercase">Đã duyệt</p>
              <p className="font-semibold text-[20px] text-[#009E00] mt-0.5">{counts.approved}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-[#757575] uppercase">Tổng đơn</p>
              <p className="font-semibold text-[20px] text-[#222222] mt-0.5">{counts.all}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Applicants Control Bar (Filter tabs + Search) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 bg-white p-3 rounded-[16px] border border-[#ededed] shadow-xs">
        {/* Status Switcher Tabs */}
        <div className="inline-flex max-w-fit bg-[#ededed] p-1 rounded-[8px] self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-[6px] text-[13px] font-medium transition-all cursor-pointer",
              statusFilter === "all"
                ? "bg-white text-[#222222] font-semibold shadow-xs"
                : "text-[#757575] hover:text-[#222222]"
            )}
          >
            Tất cả ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={cn(
              "px-3 py-1.5 rounded-[6px] text-[13px] font-medium transition-all cursor-pointer",
              statusFilter === "pending"
                ? "bg-white text-[#222222] font-semibold shadow-xs"
                : "text-[#757575] hover:text-[#222222]"
            )}
          >
            Chờ duyệt ({counts.pending})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("approved")}
            className={cn(
              "px-3 py-1.5 rounded-[6px] text-[13px] font-medium transition-all cursor-pointer",
              statusFilter === "approved"
                ? "bg-white text-[#009E00] font-semibold shadow-xs"
                : "text-[#757575] hover:text-[#222222]"
            )}
          >
            Trúng tuyển ({counts.approved})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("rejected")}
            className={cn(
              "px-3 py-1.5 rounded-[6px] text-[13px] font-medium transition-all cursor-pointer",
              statusFilter === "rejected"
                ? "bg-white text-[#dc0000] font-semibold shadow-xs"
                : "text-[#757575] hover:text-[#222222]"
            )}
          >
            Từ chối ({counts.rejected})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-full sm:max-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#757575]" />
          <input
            type="text"
            placeholder="Tìm ứng viên, trường, SĐT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[38px] pl-10 pr-3.5 bg-white border border-[#cbcbcb] rounded-[8px] text-[13px] text-[#222222] placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#222222] focus:ring-1 focus:ring-[#222222] transition-all"
          />
        </div>
      </div>

      {/* 4. Applications List Content */}
      {loadingApps ? (
        <div className="bg-white border border-[#ededed] rounded-[16px] p-16 text-center shadow-xs flex flex-col items-center justify-center space-y-3">
          <div className="size-8 rounded-full border-3 border-[#222222]/20 border-t-[#222222] animate-spin" />
          <p className="text-[14px] font-medium text-[#757575]">Đang tải danh sách hồ sơ người tham gia...</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-white border border-[#ededed] rounded-[16px] p-12 text-center max-w-xl mx-auto space-y-4 shadow-xs">
          <div className="size-14 bg-[#f4f4f4] rounded-[12px] flex items-center justify-center text-[#757575] mx-auto">
            <Users className="size-7 stroke-[1.75]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-[17px] text-[#222222]">
              {searchQuery ? "Không tìm thấy hồ sơ phù hợp" : "Chưa có ứng viên trong danh mục này"}
            </h3>
            <p className="text-[13px] text-[#757575] max-w-md mx-auto">
              {searchQuery
                ? "Thử tìm kiếm với từ khóa khác hoặc chuyển sang tab trạng thái khác."
                : "Hồ sơ của sinh viên đăng ký tham gia sự kiện sẽ được hiển thị và quản lý tại đây."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const student = app.profiles || {}
            const displayName = student.full_name || "Người tham gia ẩn danh"
            const matchScore = getCandidateMatchScore(student)

            const isApproved = app.status === "approved"
            const isRejected = app.status === "rejected"
            const isPending = !isApproved && !isRejected

            return (
              <div
                key={app.id}
                className="bg-white border border-[#ededed] hover:border-slate-300 rounded-[16px] p-5 sm:p-6 transition-all shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-5"
              >
                {/* Left: Avatar + Details */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <Avatar className="size-[54px] rounded-full border border-[#cbcbcb] shrink-0 bg-slate-100 shadow-xs">
                    <AvatarImage src={student.avatar_url} className="object-cover" />
                    <AvatarFallback className="bg-slate-200 text-[#222222] font-semibold text-base">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1 space-y-2">
                    {/* Name + Match Score + Status Badge */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="font-['Inter'] font-semibold text-[16px] text-[#222222] truncate">
                        {displayName}
                      </h4>

                      {matchScore !== null && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-[4px] text-[11px] font-semibold">
                          <span>🔥 Phù hợp: {matchScore}%</span>
                        </span>
                      )}

                      {/* Status Badges */}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-[#009E00] border border-emerald-200/80 px-2 py-0.5 rounded-[4px] text-[11px] font-medium">
                          <Check className="size-3" /> Trúng tuyển
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-[#dc0000] border border-rose-200/80 px-2 py-0.5 rounded-[4px] text-[11px] font-medium">
                          <X className="size-3" /> Chưa phù hợp
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200/80 px-2 py-0.5 rounded-[4px] text-[11px] font-medium">
                          Chờ duyệt
                        </span>
                      )}
                    </div>

                    {/* School & Email */}
                    <p className="text-[13px] text-[#757575] truncate">
                      {student.university || "Chưa cập nhật trường học"} • <span className="text-[#8c8c8c]">{student.email}</span>
                    </p>

                    {/* Meta Specs Chips: Phone, Reliability */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[12px]">

                      {student.phone && (
                        <span className="inline-flex items-center gap-1 bg-[#f4f4f4] border border-[#ededed] text-[#353535] px-2.5 py-0.5 rounded-[6px] font-medium">
                          SĐT: {student.phone}
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200/60 text-[#009E00] px-2.5 py-0.5 rounded-[6px] font-medium">
                        <Star className="size-3 fill-emerald-600 text-emerald-600" /> Tín nhiệm: {student.reliability_score ?? 100}%
                      </span>

                      <span className="text-[11px] text-[#8c8c8c] ml-1">
                        Nộp ngày: {new Date(app.applied_at).toLocaleDateString("vi-VN")}
                      </span>
                    </div>

                    {/* Student note quote bubble if provided */}
                    {app.student_note && (
                      <div className="mt-2 p-2.5 rounded-[8px] bg-[#fafafa] border border-[#ededed] text-[12px] text-[#515151] leading-relaxed max-w-2xl">
                        <span className="font-semibold text-[#222222]">📝 Lời nhắn ứng tuyển:</span> {app.student_note}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions Column */}
                <div className="flex flex-wrap items-center gap-2.5 pt-3 xl:pt-0 border-t xl:border-t-0 border-[#ededed] shrink-0 justify-end">
                  {/* View CV */}
                  <button
                    type="button"
                    onClick={() => setViewingCV(student)}
                    className="h-[38px] px-3.5 rounded-[8px] border border-[#cbcbcb] hover:border-slate-400 bg-white hover:bg-[#fafafa] text-[#222222] font-medium text-[13px] inline-flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <FileText className="size-3.5 text-[#515151]" />
                    <span>Xem CV</span>
                  </button>

                  {/* Chat */}
                  <button
                    type="button"
                    onClick={() => onStartChatWithStudent(event.id, student.id)}
                    className="h-[38px] px-3.5 rounded-[8px] border border-[#cbcbcb] hover:border-slate-400 bg-white hover:bg-[#fafafa] text-[#222222] font-medium text-[13px] inline-flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <MessageSquare className="size-3.5 text-[#515151]" />
                    <span>Nhắn tin</span>
                  </button>

                  {/* Attendance Switcher (If Approved) */}
                  {isApproved && handleUpdateAttendanceStatus && (
                    <div className="inline-flex bg-[#ededed] p-0.5 rounded-[8px] text-[12px] font-medium">
                      <button
                        type="button"
                        onClick={() => handleUpdateAttendanceStatus(app.id, "checked_in")}
                        title="Điểm danh có mặt tại sự kiện"
                        className={cn(
                          "px-2.5 py-1.5 rounded-[6px] transition cursor-pointer",
                          app.attendance_status === "checked_in"
                            ? "bg-white text-[#222222] font-semibold shadow-xs"
                            : "text-[#757575] hover:text-[#222222]"
                        )}
                      >
                        Có mặt
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateAttendanceStatus(app.id, "completed")}
                        title="Xác nhận hoàn thành ca làm"
                        className={cn(
                          "px-2.5 py-1.5 rounded-[6px] transition cursor-pointer",
                          app.attendance_status === "completed"
                            ? "bg-white text-[#009E00] font-semibold shadow-xs"
                            : "text-[#757575] hover:text-[#222222]"
                        )}
                      >
                        Hoàn thành
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateAttendanceStatus(app.id, "no_show")}
                        title="Đánh dấu bùng ca / vắng mặt"
                        className={cn(
                          "px-2.5 py-1.5 rounded-[6px] transition cursor-pointer",
                          app.attendance_status === "no_show"
                            ? "bg-white text-[#dc0000] font-semibold shadow-xs"
                            : "text-[#757575] hover:text-[#222222]"
                        )}
                      >
                        Vắng
                      </button>
                    </div>
                  )}

                  {/* Rate student (If approved and event is finished) */}
                  {isApproved && isEventClosed && (
                    <button
                      type="button"
                      onClick={() => onRateStudent(event.id, student.id, displayName)}
                      className="h-[38px] px-3.5 rounded-[8px] bg-amber-500 hover:bg-amber-600 text-white font-medium text-[13px] inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <Star className="size-3.5 fill-white" />
                      <span>Đánh giá</span>
                    </button>
                  )}

                  {/* Approve / Reject Controls */}
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(app.id, "approved")}
                        className="h-[38px] px-4 rounded-[8px] bg-[#009E00] hover:bg-[#008500] text-white font-medium text-[13px] inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                      >
                        <Check className="size-3.5" />
                        <span>Duyệt</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(app.id, "rejected")}
                        className="h-[38px] px-3.5 rounded-[8px] border border-rose-200 text-[#dc0000] hover:bg-rose-50 font-medium text-[13px] inline-flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <X className="size-3.5" />
                        <span>Từ chối</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(app.id, "pending")}
                      className="h-[38px] px-3 rounded-[8px] text-[#757575] hover:text-[#222222] hover:bg-[#fafafa] font-medium text-[12px] inline-flex items-center gap-1 transition cursor-pointer"
                      title="Hoàn tác trạng thái về chờ duyệt"
                    >
                      <RotateCcw className="size-3.5" />
                      <span>Hoàn tác</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
