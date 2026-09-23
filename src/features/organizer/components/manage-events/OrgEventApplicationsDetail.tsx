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
  RotateCcw,
  Check,
  X,
  Phone,
  UserCheck,
  ClipboardList,
  AlertCircle,
  Download,
  QrCode,
  Lock,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/providers/ToastProvider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import EventCheckinQRModal from "./EventCheckinQRModal"

interface OrgEventApplicationsDetailProps {
  event: any
  applications: any[]
  loadingApps: boolean
  reviewsMap?: Record<string, { rating: number; comment?: string }>
  onBack: () => void
  setViewingCV: (cv: any) => void
  handleUpdateStatus: (appId: string, status: string) => void
  handleBulkUpdateStatus?: (appIds: string[], status: string) => void
  handleUpdateAttendanceStatus?: (appId: string, status: string) => void
  onStartChatWithStudent: (eventId: string, studentId: string) => void
  onRateStudent: (eventId: string, studentId: string, studentName: string) => void
  isPremium?: boolean
}

export default function OrgEventApplicationsDetail({
  event,
  applications = [],
  loadingApps,
  reviewsMap = {},
  onBack,
  setViewingCV,
  handleUpdateStatus,
  handleBulkUpdateStatus,
  handleUpdateAttendanceStatus,
  onStartChatWithStudent,
  onRateStudent,
  isPremium = false,
}: OrgEventApplicationsDetailProps) {
  const router = useRouter()
  const { showToast } = useToast()
  // Main Workspace Tab: 'pipeline' (Duyệt hồ sơ) vs 'attendance' (Điểm danh & Đánh giá)
  const [workspaceTab, setWorkspaceTab] = useState<"pipeline" | "attendance">("pipeline")

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")

  // Selected applications for bulk operations
  const [selectedAppIds, setSelectedAppIds] = useState<Set<string>>(new Set())

  // QR Check-in modal state
  const [showQRModal, setShowQRModal] = useState(false)

  // Export applications to CSV with UTF-8 BOM for Excel
  const exportApplicationsToCSV = () => {
    if (!applications || applications.length === 0) {
      alert("Chưa có danh sách ứng viên để xuất file.")
      return
    }

    const headers = [
      "STT",
      "Họ và tên",
      "Số điện thoại / Zalo",
      "Email",
      "Trường học",
      "Vị trí ứng tuyển",
      "Trạng thái hồ sơ",
      "Trạng thái điểm danh",
      "Điểm uy tín"
    ]

    const statusMap: Record<string, string> = {
      approved: "Trúng tuyển",
      rejected: "Từ chối",
      pending: "Chờ duyệt"
    }

    const attendanceMap: Record<string, string> = {
      present: "Có mặt",
      absent: "Vắng mặt",
      unmarked: "Chưa điểm danh"
    }

    const rows = applications.map((app, index) => {
      const p = app.profiles || {}
      return [
        index + 1,
        `"${(p.full_name || "Chưa cập nhật").replace(/"/g, '""')}"`,
        `"${(p.phone || "Chưa cập nhật").replace(/"/g, '""')}"`,
        `"${(p.email || "Chưa cập nhật").replace(/"/g, '""')}"`,
        `"${(p.university || "Chưa cập nhật").replace(/"/g, '""')}"`,
        `"${(event?.title || "Tình nguyện viên").replace(/"/g, '""')}"`,
        `"${statusMap[app.status] || "Chờ duyệt"}"`,
        `"${attendanceMap[app.attendance_status] || "Chưa điểm danh"}"`,
        p.trust_score ?? 100
      ].join(",")
    })

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    const safeTitle = (event?.title || "su_kien").replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]/g, "_")
    link.setAttribute("href", url)
    link.setAttribute("download", `Danh_sach_ung_vien_${safeTitle}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

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

  const remainingSlots = typeof event.slots_needed === "number" ? event.slots_needed : 0
  const totalQuota = counts.approved + remainingSlots > 0 ? counts.approved + remainingSlots : (event.slots_needed || 1)
  const isQuotaReached = remainingSlots === 0 && counts.approved >= totalQuota && totalQuota > 0

  // Filtered applications for Tab 1 (Pipeline)
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const student = app.profiles || {}
      const fullName = student.full_name || ""
      const university = student.university || ""
      const phone = student.phone || ""
      const email = student.email || ""

      // 1. Search matching
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        fullName.toLowerCase().includes(q) ||
        university.toLowerCase().includes(q) ||
        phone.includes(q) ||
        email.toLowerCase().includes(q)

      // 2. Status matching
      let matchesStatus = true
      if (statusFilter === "pending") matchesStatus = app.status === "pending" || !app.status
      if (statusFilter === "approved") matchesStatus = app.status === "approved"
      if (statusFilter === "rejected") matchesStatus = app.status === "rejected"

      return matchesSearch && matchesStatus
    })
  }, [applications, searchQuery, statusFilter])

  // Approved applications for Tab 2 (Attendance & Reviews)
  const approvedApps = useMemo(() => {
    return applications.filter((app) => {
      if (app.status !== "approved") return false
      const student = app.profiles || {}
      const fullName = student.full_name || ""
      const phone = student.phone || ""
      const q = searchQuery.toLowerCase().trim()
      return !q || fullName.toLowerCase().includes(q) || phone.includes(q)
    })
  }, [applications, searchQuery])

  // Bulk selection toggles
  const toggleSelectApp = (id: string) => {
    setSelectedAppIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedAppIds.size === filteredApps.length) {
      setSelectedAppIds(new Set())
    } else {
      setSelectedAppIds(new Set(filteredApps.map((a) => a.id)))
    }
  }

  const handleBulkApprove = () => {
    if (!handleBulkUpdateStatus) return
    const ids = Array.from(selectedAppIds)
    handleBulkUpdateStatus(ids, "approved")
    setSelectedAppIds(new Set())
  }

  const handleBulkReject = () => {
    if (!handleBulkUpdateStatus) return
    const ids = Array.from(selectedAppIds)
    handleBulkUpdateStatus(ids, "rejected")
    setSelectedAppIds(new Set())
  }

  // Date formatting
  let dateStr = "Chưa ấn định"
  if (event.event_date) {
    const dStart = new Date(event.event_date).toLocaleDateString("vi-VN")
    if (event.end_date) {
      const dEnd = new Date(event.end_date).toLocaleDateString("vi-VN")
      dateStr = `${dStart} - ${dEnd}`
    } else {
      dateStr = dStart
    }
  }

  const locationDisplay = event.danang_wards?.name
    ? `${event.danang_wards.name}, Đà Nẵng`
    : event.location || "Đà Nẵng"

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header with Back Button */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="h-9 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-medium text-[13px] inline-flex items-center gap-2 transition cursor-pointer shrink-0 shadow-xs"
        >
          <ArrowLeft className="size-4" />
          <span>Quay lại danh sách chiến dịch</span>
        </button>

        {isQuotaReached && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-[12px] font-medium">
            <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Đã đạt đủ {counts.approved}/{totalQuota} chỉ tiêu tuyển dụng</span>
          </div>
        )}
      </div>

      {/* 2. Event Summary Header Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Info */}
          <div className="space-y-2.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2.5 py-0.5 rounded-md text-[12px] font-medium">
                {event.category || "Sự kiện"}
              </span>

              <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 px-2.5 py-0.5 rounded-md text-[12px] font-medium">
                {event.position_type || "Tình nguyện viên"}
              </span>

              <span className="border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2.5 py-0.5 rounded-md text-[12px] font-medium">
                {event.status === "closed" ? "Tạm dừng" : event.status === "completed" ? "Đã xong" : "Đang mở"}
              </span>
            </div>

            <h1 className="font-bold text-[20px] sm:text-[22px] text-zinc-900 dark:text-zinc-100 leading-tight">
              {event.title}
            </h1>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12.5px] text-zinc-600 dark:text-zinc-400 pt-1">
              <div className="flex items-center gap-1.5 truncate" title={locationDisplay}>
                <MapPin className="size-3.5 text-zinc-400 shrink-0" />
                <span className="truncate">{locationDisplay}</span>
              </div>

              <div className="flex items-center gap-1.5 truncate" title={dateStr}>
                <Calendar className="size-3.5 text-zinc-400 shrink-0" />
                <span className="truncate">{dateStr}</span>
              </div>

              <div className="flex items-center gap-1.5 truncate">
                <CircleDollarSign className="size-3.5 text-zinc-400 shrink-0" />
                <span className="truncate">
                  {event.salary_amount && Number(event.salary_amount) > 0
                    ? `${Number(event.salary_amount).toLocaleString("vi-VN")} đ`
                    : "Tình nguyện viên"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 truncate">
                <Clock className="size-3.5 text-zinc-400 shrink-0" />
                <span className="truncate">
                  {event.start_time && event.end_time ? `${event.start_time} - ${event.end_time}` : "Theo ca trực"}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Metrics Pillars */}
          <div className="grid grid-cols-3 gap-2.5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-xl p-3.5 shrink-0 text-center min-w-[280px]">
            <div>
              <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Cần tuyển</p>
              <p className="font-bold text-[18px] text-zinc-900 dark:text-zinc-100 mt-0.5">{totalQuota}</p>
            </div>
            <div className="border-x border-zinc-200 dark:border-zinc-700 px-2">
              <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Đã duyệt</p>
              <p className="font-bold text-[18px] text-emerald-600 dark:text-emerald-400 mt-0.5">{counts.approved}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Tổng đơn</p>
              <p className="font-bold text-[18px] text-zinc-900 dark:text-zinc-100 mt-0.5">{counts.all}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace Tabs: Pipeline vs Attendance + Action Buttons */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setWorkspaceTab("pipeline")}
            className={cn(
              "pb-3 text-[14px] font-medium border-b-2 transition-all cursor-pointer flex items-center gap-2",
              workspaceTab === "pipeline"
                ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800"
            )}
          >
            <ClipboardList className="size-4" />
            <span>Duyệt hồ sơ tuyển dụng</span>
            <span className="text-xs px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setWorkspaceTab("attendance")}
            className={cn(
              "pb-3 text-[14px] font-medium border-b-2 transition-all cursor-pointer flex items-center gap-2",
              workspaceTab === "attendance"
                ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800"
            )}
          >
            <UserCheck className="size-4" />
            <span>Bảng điểm danh & Đánh giá</span>
            <span className="text-xs px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-medium">
              {counts.approved}
            </span>
          </button>
        </div>

        {/* Action Buttons: QR Check-in & Export CSV */}
        {(() => {
          const canUseQR = isPremium || event.plan_tier === "single_event" || event.plan_tier === "enterprise"
          const canExportExcel = isPremium || event.plan_tier === "enterprise"

          const handleOpenQR = () => {
            if (!canUseQR) {
              showToast({
                type: "error",
                title: "Tính năng nâng cấp",
                message: "Mã QR Điểm danh dành riêng cho gói Sự Kiện Nhanh và Doanh Nghiệp VIP. Vui lòng nâng cấp!",
              })
              router.push("/pricing")
              return
            }
            setShowQRModal(true)
          }

          const handleExportCSV = () => {
            if (!canExportExcel) {
              showToast({
                type: "error",
                title: "Tính năng VIP",
                message: "Xuất danh sách nhân sự Excel / CSV dành riêng cho gói Doanh Nghiệp VIP. Vui lòng nâng cấp!",
              })
              router.push("/pricing")
              return
            }
            exportApplicationsToCSV()
          }

          return (
            <div className="flex items-center gap-2 pb-2 sm:pb-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenQR}
                title={canUseQR ? "Mã QR Điểm danh" : "Nâng cấp gói để mở khóa QR Điểm danh"}
                className={cn(
                  "h-8 text-xs font-semibold gap-1.5 shadow-xs cursor-pointer",
                  canUseQR
                    ? "border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                    : "border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                )}
              >
                {canUseQR ? <QrCode className="size-3.5" /> : <Lock className="size-3.5 text-zinc-400" />}
                <span>Mã QR Điểm danh</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                title={canExportExcel ? "Xuất Excel / CSV" : "Nâng cấp VIP để xuất file Excel"}
                className={cn(
                  "h-8 text-xs font-semibold gap-1.5 shadow-xs cursor-pointer",
                  canExportExcel
                    ? "border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                    : "border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                )}
              >
                {canExportExcel ? <Download className="size-3.5" /> : <Lock className="size-3.5 text-zinc-400" />}
                <span>Xuất Excel / CSV</span>
              </Button>
            </div>
          )
        })()}
      </div>

      {/* 4. TAB 1: PIPELINE (DUYỆT HỒ SƠ ỨNG TUYỂN) */}
      {workspaceTab === "pipeline" && (
        <div className="space-y-4">
          {/* Sub Controls: Status Tabs & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            {/* Status Switcher Tabs */}
            <div className="inline-flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg self-start sm:self-auto overflow-x-auto max-w-full">
              {[
                { id: "all", label: `Tất cả (${counts.all})` },
                { id: "pending", label: `Chờ duyệt (${counts.pending})` },
                { id: "approved", label: `Trúng tuyển (${counts.approved})` },
                { id: "rejected", label: `Từ chối (${counts.rejected})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-[13px] font-medium transition-all cursor-pointer whitespace-nowrap",
                    statusFilter === tab.id
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-full sm:max-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm ứng viên, trường, SĐT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 bg-white dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-lg text-[13px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 transition"
              />
            </div>
          </div>

          {/* Bulk Action Bar (Visible when 1 or more items selected) */}
          {selectedAppIds.size > 0 && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md animate-in slide-in-from-top-2 duration-150">
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-medium">
                  Đã chọn <strong>{selectedAppIds.size}</strong> ứng viên
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedAppIds(new Set())}
                  className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
                >
                  Bỏ chọn
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={handleBulkApprove}
                  className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  <Check className="size-3.5 mr-1" />
                  <span>Duyệt trúng tuyển ({selectedAppIds.size})</span>
                </Button>

                <Button
                  type="button"
                  onClick={handleBulkReject}
                  variant="outline"
                  className="h-8 px-3.5 border-zinc-700 text-rose-300 hover:bg-rose-950/40 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  <X className="size-3.5 mr-1" />
                  <span>Từ chối ({selectedAppIds.size})</span>
                </Button>
              </div>
            </div>
          )}

          {/* Select All Checkbox row */}
          {filteredApps.length > 0 && (
            <div className="flex items-center justify-between px-2 text-[12px] text-zinc-500">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedAppIds.size === filteredApps.length && filteredApps.length > 0}
                  onChange={toggleSelectAll}
                  className="size-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                />
                <span>Chọn tất cả ({filteredApps.length} hồ sơ)</span>
              </label>
            </div>
          )}

          {/* Applications List */}
          {loadingApps ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-16 text-center shadow-xs flex flex-col items-center justify-center space-y-3">
              <div className="size-8 rounded-full border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-zinc-100 animate-spin" />
              <p className="text-[13.5px] font-medium text-zinc-500 dark:text-zinc-400">
                Đang tải danh sách hồ sơ người tham gia...
              </p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center max-w-md mx-auto space-y-3 shadow-xs">
              <div className="size-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 mx-auto">
                <Users className="size-6 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-[16px] text-zinc-900 dark:text-zinc-100">
                  {searchQuery ? "Không tìm thấy hồ sơ phù hợp" : "Chưa có ứng viên trong mục này"}
                </h3>
                <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
                  {searchQuery
                    ? "Thử tìm kiếm với từ khóa khác hoặc chuyển sang tab trạng thái khác."
                    : "Hồ sơ của sinh viên ứng tuyển sẽ hiển thị tại đây để bạn xét duyệt."}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredApps.map((app) => {
                const student = app.profiles || {}
                const displayName = student.full_name || "Người tham gia ẩn danh"
                const isSelected = selectedAppIds.has(app.id)

                const isApproved = app.status === "approved"
                const isRejected = app.status === "rejected"
                const isPending = !isApproved && !isRejected

                return (
                  <div
                    key={app.id}
                    className={cn(
                      "bg-white dark:bg-zinc-900 border rounded-xl p-3.5 sm:p-4 transition shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-3.5",
                      isSelected
                        ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50/50 dark:bg-zinc-800/40"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                    )}
                  >
                    {/* Left: Checkbox + Avatar + Details */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectApp(app.id)}
                        className="size-4 mt-0.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer shrink-0"
                      />

                      <Avatar className="size-10.5 rounded-full border border-zinc-200 dark:border-zinc-700 shrink-0 bg-zinc-100">
                        <AvatarImage src={student.avatar_url} className="object-cover" />
                        <AvatarFallback className="bg-zinc-200 text-zinc-800 font-semibold text-xs">
                          {displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1 space-y-1.5">
                        {/* Name + Status Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-[15px] text-zinc-900 dark:text-zinc-100 truncate">
                            {displayName}
                          </h4>

                          {/* Status */}
                          {isApproved && (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded text-[11px] font-medium">
                              <Check className="size-3" /> Trúng tuyển
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 px-2 py-0.5 rounded text-[11px] font-medium">
                              <X className="size-3" /> Chưa phù hợp
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded text-[11px] font-medium">
                              Chờ duyệt
                            </span>
                          )}
                        </div>

                        {/* School & Email */}
                        <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400 truncate">
                          {student.university || "Chưa cập nhật trường học"} •{" "}
                          <span className="text-zinc-400">{student.email}</span>
                        </p>

                        {/* Chips: Phone, Reliability, Skills */}
                        <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11.5px]">
                          {student.phone && (
                            <span className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded font-medium">
                              <Phone className="size-3 text-zinc-400" />
                              <span>{student.phone}</span>
                            </span>
                          )}

                          <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded font-medium">
                            <Star className="size-3 fill-emerald-600 text-emerald-600" />
                            <span>Uy tín: {student.reliability_score ?? 100}%</span>
                          </span>

                          {student.skills && (
                            <span className="text-zinc-500 dark:text-zinc-400 truncate max-w-[320px]">
                              Kỹ năng: <strong className="font-medium text-zinc-700 dark:text-zinc-300">{student.skills}</strong>
                            </span>
                          )}

                          <span className="text-zinc-400 ml-auto">
                            Nộp: {new Date(app.applied_at).toLocaleDateString("vi-VN")}
                          </span>
                        </div>

                        {/* Student Note */}
                        {app.student_note && (
                          <div className="mt-2 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 text-[12px] text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">Lời nhắn:</span>{" "}
                            {app.student_note}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions Column */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 xl:pt-0 border-t xl:border-t-0 border-zinc-100 dark:border-zinc-800 shrink-0 justify-end">
                      {/* View CV */}
                      <button
                        type="button"
                        onClick={() => setViewingCV(student)}
                        className="h-8.5 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-medium text-[12.5px] inline-flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <FileText className="size-3.5 text-zinc-400" />
                        <span>Xem CV</span>
                      </button>

                      {/* Chat */}
                      <button
                        type="button"
                        onClick={() => onStartChatWithStudent(event.id, student.id)}
                        className="h-8.5 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-medium text-[12.5px] inline-flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <MessageSquare className="size-3.5 text-zinc-400" />
                        <span>Nhắn tin</span>
                      </button>

                      {/* Approve / Reject Controls */}
                      {isPending ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(app.id, "approved")}
                            className="h-8.5 px-3.5 rounded-lg bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium text-[12.5px] inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                          >
                            <Check className="size-3.5" />
                            <span>Duyệt</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(app.id, "rejected")}
                            className="h-8.5 px-3 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium text-[12.5px] inline-flex items-center gap-1 transition cursor-pointer"
                          >
                            <X className="size-3.5" />
                            <span>Từ chối</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(app.id, "pending")}
                          className="h-8.5 px-3 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium text-[12px] inline-flex items-center gap-1 transition cursor-pointer"
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
      )}

      {/* 5. TAB 2: ATTENDANCE & REVIEWS (BẢNG ĐIỂM DANH & ĐÁNH GIÁ) */}
      {workspaceTab === "attendance" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">
                Danh sách điểm danh & Bàn giao ca trực
              </h3>
              <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400">
                Dành cho nhân sự đã trúng tuyển. Cập nhật trạng thái có mặt tại sự kiện và đánh giá sau khi hoàn thành ca.
              </p>
            </div>

            {/* Quick Search inside Attendance */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm tên, SĐT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8.5 pl-9 pr-3 bg-white dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-lg text-[13px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 transition"
              />
            </div>
          </div>

          {approvedApps.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center max-w-md mx-auto space-y-3 shadow-xs">
              <div className="size-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 mx-auto">
                <UserCheck className="size-6 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-[16px] text-zinc-900 dark:text-zinc-100">
                  Chưa có nhân sự trúng tuyển
                </h3>
                <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
                  Hãy chuyển sang tab "Duyệt hồ sơ tuyển dụng" để phê duyệt các ứng viên phù hợp trước.
                </p>
              </div>
              <Button
                type="button"
                onClick={() => setWorkspaceTab("pipeline")}
                className="h-9 px-4 rounded-lg bg-zinc-900 hover:bg-black text-white text-[13px] font-medium cursor-pointer"
              >
                Chuyển đến Duyệt hồ sơ
              </Button>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-[12px] font-medium text-zinc-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Nhân sự</th>
                      <th className="py-3 px-4">Liên hệ</th>
                      <th className="py-3 px-4 text-center">Trạng thái điểm danh</th>
                      <th className="py-3 px-4 text-right">Đánh giá uy tín</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {approvedApps.map((app) => {
                      const student = app.profiles || {}
                      const displayName = student.full_name || "Ứng viên"
                      const attendance = app.attendance_status || "pending_event"
                      const reviewData = reviewsMap[student.id]

                      return (
                        <tr key={app.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition">
                          {/* Name & University */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="size-9 rounded-full border border-zinc-200 dark:border-zinc-700 shrink-0">
                                <AvatarImage src={student.avatar_url} className="object-cover" />
                                <AvatarFallback className="bg-zinc-200 text-zinc-800 font-semibold text-xs">
                                  {displayName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-zinc-900 dark:text-zinc-100">{displayName}</p>
                                <p className="text-[11.5px] text-zinc-500 truncate max-w-[200px]">
                                  {student.university || "Chưa cập nhật trường"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Contact (Phone call & Chat) */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              {student.phone ? (
                                <a
                                  href={`tel:${student.phone}`}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 text-[12px] font-medium transition"
                                  title="Gọi điện trực tiếp"
                                >
                                  <Phone className="size-3 text-zinc-500" />
                                  <span>{student.phone}</span>
                                </a>
                              ) : (
                                <span className="text-zinc-400 text-xs">Chưa có SĐT</span>
                              )}

                              <button
                                type="button"
                                onClick={() => onStartChatWithStudent(event.id, student.id)}
                                className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 transition cursor-pointer"
                                title="Nhắn tin"
                              >
                                <MessageSquare className="size-3.5" />
                              </button>
                            </div>
                          </td>

                          {/* Attendance Switcher */}
                          <td className="py-3.5 px-4 text-center">
                            {handleUpdateAttendanceStatus && (
                              <div className="inline-flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg text-[12px] font-medium">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAttendanceStatus(app.id, "checked_in")}
                                  title="Đã có mặt tại địa điểm"
                                  className={cn(
                                    "px-2.5 py-1 rounded-md transition cursor-pointer",
                                    attendance === "checked_in"
                                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold shadow-xs"
                                      : "text-zinc-500 hover:text-zinc-800"
                                  )}
                                >
                                  Có mặt
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAttendanceStatus(app.id, "completed")}
                                  title="Đã hoàn thành ca trực tốt"
                                  className={cn(
                                    "px-2.5 py-1 rounded-md transition cursor-pointer",
                                    attendance === "completed"
                                      ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs"
                                      : "text-zinc-500 hover:text-zinc-800"
                                  )}
                                >
                                  Hoàn thành
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAttendanceStatus(app.id, "no_show")}
                                  title="Vắng mặt / Bùng ca"
                                  className={cn(
                                    "px-2.5 py-1 rounded-md transition cursor-pointer",
                                    attendance === "no_show"
                                      ? "bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 font-semibold shadow-xs"
                                      : "text-zinc-500 hover:text-zinc-800"
                                  )}
                                >
                                  Bùng ca
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Review Action */}
                          <td className="py-3.5 px-4 text-right">
                            {reviewData ? (
                              <span className="inline-flex items-center gap-1 text-[12.5px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800/60">
                                <Star className="size-3.5 fill-amber-500 text-amber-500" />
                                <span>{reviewData.rating}.0 (Đã đánh giá)</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onRateStudent(event.id, student.id, displayName)}
                                className="h-8 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-[12.5px] font-medium inline-flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                              >
                                <Star className="size-3.5 text-amber-500" />
                                <span>Đánh giá</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* QR Check-in Modal */}
      <EventCheckinQRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        event={event}
      />
    </div>
  )
}
