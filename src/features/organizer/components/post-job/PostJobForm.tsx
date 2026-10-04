"use client"

import React, { useState, useEffect } from "react"
import {
  Briefcase,
  MapPin,
  CircleDollarSign,
  FileText,
  Calendar,
  Clock,
  Check,
  CheckCircle2,
  Circle,
  MessageCircle,
  Users,
  Eye,
  ChevronDown,
  Sparkles,
  Flame,
  Award,
  Lock,
  AlertTriangle,
  Plus,
  Minus,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { useUser } from "@/components/providers/AuthProvider"
import { supabase } from "@/lib/supabase"
import EventCard, { JobItem } from "@/features/event/components/EventCard"
import { cn } from "@/lib/utils"
import { CustomSelect } from "@/components/ui/custom-select"
import { DatePicker } from "@/components/ui/date-picker"
import { TimePicker } from "@/components/ui/time-picker"

export interface EventPositionInput {
  id?: string
  title: string
  slots_needed: string | number
  salary_amount: string | number
  salary_type: string
  description?: string
}

export interface PostJobFormProps {
  editingId?: string | null
  title: string
  setTitle: (val: string) => void
  location: string
  setLocation: (val: string) => void
  wardId: string
  setWardId: (val: string) => void
  wards?: any[]
  eventDate: string
  setEventDate: (val: string) => void
  endDate?: string
  setEndDate?: (val: string) => void
  startTime?: string
  setStartTime?: (val: string) => void
  endTime?: string
  setEndTime?: (val: string) => void
  positions?: EventPositionInput[]
  setPositions?: React.Dispatch<React.SetStateAction<EventPositionInput[]>>
  salaryAmount?: string
  setSalaryAmount?: (val: string) => void
  salaryType?: string
  setSalaryType?: (val: string) => void
  paymentMethod?: string
  setPaymentMethod?: (val: string) => void
  zaloGroupLink?: string
  setZaloGroupLink?: (val: string) => void
  applicationDeadline: string
  setApplicationDeadline: (val: string) => void
  positionType?: string
  setPositionType?: (val: string) => void
  category: string
  setCategory: (val: string) => void
  benefits: string
  setBenefits: (val: string) => void
  slotsNeeded?: string
  setSlotsNeeded?: (val: string) => void
  desc: string
  setDesc: (val: string) => void
  isUrgent?: boolean
  setIsUrgent?: (val: boolean) => void
  isFeatured?: boolean
  setIsFeatured?: (val: boolean) => void
  isPremium?: boolean
  singleEventCredits?: number
  eventsThisMonthCount?: number
  monthlyLimit?: number
  loading?: boolean
  onSubmit: (e: React.FormEvent) => void
  onCancel?: () => void
  positionsList?: string[]
  categoriesList?: string[]
  errors?: Record<string, string>
  setErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>
}

export default function PostJobForm({
  editingId,
  title,
  setTitle,
  location,
  setLocation,
  wardId,
  setWardId,
  wards = [],
  eventDate,
  setEventDate,
  endDate = "",
  setEndDate,
  startTime = "",
  setStartTime,
  endTime = "",
  setEndTime,
  positions = [],
  setPositions,
  salaryAmount = "",
  setSalaryAmount,
  salaryType = "per_shift",
  setSalaryType,
  paymentMethod = "cash_after_event",
  setPaymentMethod,
  zaloGroupLink = "",
  setZaloGroupLink,
  applicationDeadline,
  setApplicationDeadline,
  positionType = "",
  setPositionType,
  category,
  setCategory,
  benefits,
  setBenefits,
  slotsNeeded = "1",
  setSlotsNeeded,
  desc,
  setDesc,
  isUrgent = false,
  setIsUrgent,
  isFeatured = false,
  setIsFeatured,
  isPremium = false,
  singleEventCredits = 0,
  eventsThisMonthCount = 0,
  monthlyLimit = 1,
  loading = false,
  onSubmit,
  onCancel,
  positionsList = [],
  categoriesList = [],
  errors = {},
  setErrors,
}: PostJobFormProps) {
  const { user, profile } = useUser()
  const canUseUrgent = isPremium || singleEventCredits > 0

  const clearError = (field: string) => {
    if (setErrors && errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const setErrorField = (field: string, msg: string) => {
    if (setErrors) {
      setErrors((prev) => ({ ...prev, [field]: msg }))
    }
  }

  const localTodayStr = React.useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, "0")
    const d = String(now.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
  }, [])

  // DB categories and positions fallback
  const [availableJobRoles, setAvailableJobRoles] = useState<string[]>(positionsList)
  const [categories, setCategories] = useState<string[]>(categoriesList)

  useEffect(() => {
    if (availableJobRoles.length === 0 || categories.length === 0) {
      const loadOptions = async () => {
        const { data: posData } = await supabase
          .from("job_positions")
          .select("name")
          .order("name", { ascending: true })
        if (posData && posData.length > 0) {
          setAvailableJobRoles(posData.map((p: any) => p.name))
        }
        const { data: catData } = await supabase
          .from("event_categories")
          .select("name")
          .order("name", { ascending: true })
        if (catData && catData.length > 0) {
          setCategories(catData.map((c: any) => c.name))
        }
      }
      loadOptions()
    }
  }, [])

  const handleAddPosition = () => {
    if (!setPositions) return
    setPositions((prev) => [
      ...prev,
      {
        title: "",
        slots_needed: "2",
        salary_amount: "150000",
        salary_type: "per_shift",
        description: "",
      },
    ])
  }

  const handleRemovePosition = (idx: number) => {
    if (!setPositions || positions.length <= 1) return
    setPositions((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleUpdatePosition = (idx: number, field: keyof EventPositionInput, value: string) => {
    if (!setPositions) return
    setPositions((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
    if (field === "title") clearError(`position_${idx}_title`)
    if (field === "slots_needed") clearError(`position_${idx}_slots`)
    if (field === "salary_amount") clearError(`position_${idx}_salary`)
  }

  // Event Benefits Options
  const benefitOptions = [
    "Giấy chứng nhận hoạt động (Certificate)",
    "Hỗ trợ ăn uống & nước uống trong ca",
    "Áo đồng phục & Thẻ Ban tổ chức (BTC)",
    "Cộng điểm rèn luyện sinh viên",
    "Hỗ trợ chi phí xăng xe / đi lại",
    "Thưởng chuyên cần & Hiệu suất",
    "Tập huấn / Training kỹ năng trước sự kiện",
    "Bảo hiểm sự kiện"
  ]

  const [selectedBenefits, setSelectedBenefits] = useState<string[]>(() => {
    if (benefits) {
      return benefits.split(",").map((b) => b.trim()).filter(Boolean)
    }
    return []
  })

  // Sync selectedBenefits when external `benefits` prop changes (e.g. edit mode)
  useEffect(() => {
    if (benefits) {
      const parsed = benefits.split(",").map((b) => b.trim()).filter(Boolean)
      setSelectedBenefits(parsed)
    } else {
      setSelectedBenefits([])
    }
  }, [benefits])

  const toggleBenefit = (b: string) => {
    const updated = selectedBenefits.includes(b)
      ? selectedBenefits.filter((item) => item !== b)
      : [...selectedBenefits, b]
    setSelectedBenefits(updated)
    if (setBenefits) {
      setBenefits(updated.join(", "))
    }
  }

  const selectedWard = wards.find((w) => String(w.id) === String(wardId))

  const fallbackCategories = [
    "Sự kiện Âm nhạc & Lễ hội",
    "Hội nghị & Hội thảo",
    "Giải đấu Thể thao & Marathon",
    "Lễ hội & Triển lãm Văn hóa",
    "Hoạt động Tình nguyện & Cộng đồng",
    "Sự kiện Doanh nghiệp & Ra mắt",
  ]

  const fallbackPositions = [
    "TNV Hướng dẫn & Check-in",
    "TNV Hậu cần & Sân khấu",
    "CTV Media & Quay chụp",
    "Điều phối viên & Trưởng nhóm",
    "CTV Hoạt náo & MC",
    "Hỗ trợ Kỹ thuật & Âm thanh",
    "Lễ tân & Tiếp đón khách VIP",
  ]

  const categoryOptions = (categories.length > 0 ? categories : fallbackCategories).map((c) => ({
    value: c,
    label: c,
  }))

  const wardOptions = wards.map((w) => ({
    value: String(w.id),
    label: w.name,
  }))

  const totalSlotsCount = positions.reduce(
    (sum, p) => sum + (parseInt(String(p.slots_needed || "0"), 10) || 0),
    0
  )
  const combinedPositionTitles = positions
    .map((p) => p.title.trim())
    .filter(Boolean)
    .join(" • ")

  // Realtime Preview Job Item for EventCard
  const previewJob: JobItem = {
    id: editingId || "preview-id",
    title: title.trim() || "Tiêu đề sự kiện",
    category: category || "Sự kiện chung",
    position_type: combinedPositionTitles || positionType || "Cộng tác viên sự kiện",
    event_date: eventDate || null,
    start_time: startTime || null,
    end_time: endTime || null,
    location: location.trim() || "Địa điểm sự kiện",
    salary_amount: positions[0]?.salary_amount ? Number(String(positions[0].salary_amount).replace(/\D/g, "")) : 0,
    salary_type: positions[0]?.salary_type || "per_shift",
    payment_method: paymentMethod,
    slots_needed: totalSlotsCount > 0 ? totalSlotsCount : 1,
    benefits: selectedBenefits,
    created_at: new Date().toISOString(),
    danang_wards: selectedWard ? { id: selectedWard.id, name: selectedWard.name } : null,
    profiles: {
      full_name: profile?.full_name || user?.user_metadata?.full_name || "Ban tổ chức sự kiện",
      avatar_url: profile?.avatar_url || user?.user_metadata?.avatar_url || null,
    },
  }

  // Checklist computation
  const checklist = [
    { label: "Tiêu đề sự kiện rõ ràng", done: title.trim().length >= 5 },
    {
      label: "Đã có ít nhất 1 vị trí tuyển dụng",
      done: positions.length > 0 && positions.every((p) => p.title.trim().length > 0),
    },
    { label: "Chọn Phường/Xã & Địa chỉ cụ thể", done: Boolean(wardId && location.trim()) },
    { label: "Chọn ngày diễn ra sự kiện", done: Boolean(eventDate) },
    { label: "Đặt hạn chót nhận đăng ký", done: Boolean(applicationDeadline) },
    { label: "Mô tả sự kiện & yêu cầu chung", done: desc.trim().length >= 20 },
  ]
  const completedChecklistCount = checklist.filter((c) => c.done).length
  const isQuotaExceeded = !editingId && eventsThisMonthCount >= monthlyLimit

  return (
    <div className="w-full max-w-[1360px] mx-auto pb-16 animate-in fade-in duration-200">
      {/* CẢNH BÁO ĐẠT HẠN MỨC GÓI */}
      {isQuotaExceeded && (
        <div className="mb-6 p-4 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-5 text-rose-600 shrink-0" />
            <div>
              <h4 className="text-[14px] font-semibold text-rose-900 dark:text-rose-200">
                Bạn đã sử dụng hết hạn mức đăng tin tháng này ({eventsThisMonthCount}/{monthlyLimit} sự kiện)
              </h4>
              <p className="text-[12.5px] text-rose-700 dark:text-rose-300 mt-0.5">
                Gói {isPremium ? "Doanh nghiệp" : "Khởi đầu (Miễn phí)"} cho phép tối đa {monthlyLimit} sự kiện trong một tháng.
              </p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-medium rounded-lg shrink-0 transition-colors shadow-xs"
          >
            Nâng cấp gói dịch vụ &rarr;
          </Link>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* 2-COLUMN LAYOUT: Form (Left 65%) + Live Preview Sticky (Right 35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* CỘT TRÁI: FORM NHẬP LIỆU */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
            
            {/* KHỐI 1: THÔNG TIN SỰ KIỆN */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-zinc-100 dark:border-zinc-800/80">
                <div className="size-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-200">
                  <FileText className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                    1. Thông tin sự kiện
                  </h2>
                  <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
                    Tên chương trình, danh mục và hạn chót nhận đăng ký
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Tên sự kiện */}
                <div>
                  <label htmlFor="event-title" className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Tên sự kiện / Chiến dịch <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="event-title"
                    name="title"
                    type="text"
                    required
                    placeholder="VD: Lễ hội Âm nhạc Danang Electronic 2026, Giải chạy Marathon Quốc tế..."
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value)
                      clearError("title")
                    }}
                    className={cn(
                      "w-full h-10.5 px-3.5 rounded-lg border bg-white dark:bg-zinc-800/50 text-[14px] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none transition",
                      errors.title
                        ? "border-rose-500 ring-1 ring-rose-500/20"
                        : "border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                    )}
                  />
                  {errors.title && (
                    <p className="text-[12px] text-rose-500 dark:text-rose-400 mt-1 font-medium flex items-center gap-1">
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Danh mục sự kiện & Hạn chót ứng tuyển */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Danh mục sự kiện */}
                  <div>
                    <label htmlFor="event-category" className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Danh mục sự kiện <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      id="event-category"
                      name="category"
                      value={category}
                      onChange={(val) => {
                        setCategory(val)
                        clearError("category")
                      }}
                      options={categoryOptions}
                      placeholder="Chọn danh mục sự kiện"
                      error={errors.category}
                    />
                  </div>

                  {/* Hạn chót nhận đăng ký */}
                  <div>
                    <label htmlFor="event-applicationDeadline" className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Hạn chót nhận đơn <span className="text-red-500">*</span>
                    </label>
                    <DatePicker
                      id="event-applicationDeadline"
                      name="applicationDeadline"
                      value={applicationDeadline}
                      onChange={(val) => {
                        setApplicationDeadline(val)
                        if (!val) {
                          setErrorField("applicationDeadline", "Vui lòng chọn hạn chót nhận đơn")
                        } else if (val < localTodayStr) {
                          setErrorField("applicationDeadline", "Hạn chót ứng tuyển không thể ở trong quá khứ")
                        } else if (eventDate && val > eventDate) {
                          setErrorField("applicationDeadline", "Hạn chót không được sau ngày diễn ra sự kiện")
                        } else {
                          clearError("applicationDeadline")
                        }
                      }}
                      minDate={localTodayStr}
                      maxDate={eventDate || undefined}
                      placeholder="Chọn hạn chót nhận đơn..."
                      error={errors.applicationDeadline}
                      presets={[
                        { label: "Hôm nay", daysFromNow: 0 },
                        { label: "Ngày mai", daysFromNow: 1 },
                        { label: "+3 ngày", daysFromNow: 3 },
                        { label: "+7 ngày", daysFromNow: 7 },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* KHỐI 2: CÁC VỊ TRÍ TUYỂN DỤNG & THÙ LAO */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-200">
                    <Briefcase className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                      2. Các vị trí tuyển dụng & Thù lao
                    </h2>
                    <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
                      Thêm một hoặc nhiều vị trí tuyển dụng cho sự kiện này
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {positions.length} vị trí • {totalSlotsCount} nhân sự
                  </span>
                </div>
              </div>

              {errors.positions && (
                <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-[13px] text-rose-600 dark:text-rose-400">
                  {errors.positions}
                </div>
              )}

              <div className="space-y-4">
                {positions.map((pos, idx) => {
                  const titleError = errors[`position_${idx}_title`]
                  const slotsError = errors[`position_${idx}_slots`]
                  const salaryError = errors[`position_${idx}_salary`]

                  return (
                    <div
                      key={pos.id || idx}
                      className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 transition relative space-y-4"
                    >
                      {/* Thẻ Header vị trí */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-[13.5px] font-semibold text-zinc-800 dark:text-zinc-200">
                            {pos.title.trim() ? pos.title : `Vị trí #${idx + 1}`}
                          </span>
                        </div>

                        {positions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePosition(idx)}
                            className="text-xs font-medium text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                            title="Xóa vị trí này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa vị trí</span>
                          </button>
                        )}
                      </div>

                      {/* Tên vị trí tuyển dụng */}
                      <div>
                        <label className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                          Tên vị trí tuyển dụng <span className="text-red-500">*</span>
                        </label>
                        <input
                          id={`event-position_${idx}_title`}
                          type="text"
                          required
                          placeholder="VD: TNV Check-in & Hướng dẫn, CTV Kỹ thuật sân khấu..."
                          value={pos.title}
                          onChange={(e) => handleUpdatePosition(idx, "title", e.target.value)}
                          className={cn(
                            "w-full h-10 px-3.5 rounded-lg border bg-white dark:bg-zinc-900 text-[14px] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none transition",
                            titleError
                              ? "border-rose-500 ring-1 ring-rose-500/20"
                              : "border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                          )}
                        />
                        {titleError && (
                          <p className="text-[12px] text-rose-500 dark:text-rose-400 mt-1 font-medium">
                            {titleError}
                          </p>
                        )}

                        {/* Gợi ý chọn nhanh vai trò */}
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <span className="text-xs text-zinc-400">Gợi ý nhanh:</span>
                          {(availableJobRoles.length > 0 ? availableJobRoles : fallbackPositions).slice(0, 5).map((role) => (
                            <button
                              key={role}
                              type="button"
                              onClick={() => handleUpdatePosition(idx, "title", role)}
                              className={cn(
                                "px-2 py-0.5 text-xs rounded-md border transition cursor-pointer font-medium",
                                pos.title === role
                                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent shadow-xs"
                                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400"
                              )}
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Số lượng + Hình thức thù lao + Mức thù lao */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">
                        {/* Số lượng */}
                        <div className="md:col-span-4">
                          <label className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                            Số lượng cần <span className="text-red-500">*</span>
                          </label>
                          <div className="relative flex items-center">
                            <button
                              type="button"
                              onClick={() => {
                                const cur = parseInt(String(pos.slots_needed || "0"), 10)
                                handleUpdatePosition(idx, "slots_needed", String(Math.max(1, cur - 1)))
                              }}
                              disabled={parseInt(String(pos.slots_needed || "0"), 10) <= 1}
                              className="absolute left-1 top-1/2 -translate-y-1/2 size-8 rounded-md flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              id={`event-position_${idx}_slots`}
                              type="text"
                              inputMode="numeric"
                              value={pos.slots_needed}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "")
                                handleUpdatePosition(idx, "slots_needed", val)
                              }}
                              className={cn(
                                "w-full h-10 px-9 rounded-lg border bg-white dark:bg-zinc-900 text-center font-medium text-[14px] text-zinc-900 dark:text-zinc-100 focus:outline-none transition",
                                slotsError
                                  ? "border-rose-500 ring-1 ring-rose-500/20"
                                  : "border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-100"
                              )}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const cur = parseInt(String(pos.slots_needed || "0"), 10)
                                handleUpdatePosition(idx, "slots_needed", String(cur < 1 ? 1 : cur + 1))
                              }}
                              className="absolute right-1 top-1/2 -translate-y-1/2 size-8 rounded-md flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {slotsError && (
                            <p className="text-[12px] text-rose-500 dark:text-rose-400 mt-1 font-medium">
                              {slotsError}
                            </p>
                          )}
                        </div>

                        {/* Hình thức thù lao */}
                        <div className="md:col-span-4">
                          <label className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                            Hình thức thù lao
                          </label>
                          <select
                            value={pos.salary_type}
                            onChange={(e) => {
                              handleUpdatePosition(idx, "salary_type", e.target.value)
                              if (e.target.value === "volunteer") {
                                handleUpdatePosition(idx, "salary_amount", "0")
                              }
                            }}
                            className="w-full h-10 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[13.5px] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition cursor-pointer"
                          >
                            <option value="per_shift">Theo ca trực</option>
                            <option value="hourly">Theo giờ</option>
                            <option value="per_event">Trọn gói sự kiện</option>
                            <option value="volunteer">Tình nguyện viên (0đ)</option>
                          </select>
                        </div>

                        {/* Mức thù lao */}
                        <div className="md:col-span-4">
                          <label className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                            Mức thù lao (VNĐ)
                          </label>
                          <div className="relative">
                            <input
                              id={`event-position_${idx}_salary`}
                              type="text"
                              disabled={pos.salary_type === "volunteer"}
                              placeholder={pos.salary_type === "volunteer" ? "Tình nguyện viên" : "VD: 150000"}
                              value={pos.salary_type === "volunteer" ? "" : pos.salary_amount}
                              onChange={(e) => {
                                handleUpdatePosition(idx, "salary_amount", e.target.value.replace(/\D/g, ""))
                              }}
                              className={cn(
                                "w-full h-10 px-3 pr-8 rounded-lg border bg-white dark:bg-zinc-900 text-[14px] text-zinc-900 dark:text-zinc-100 focus:outline-none disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed transition",
                                salaryError
                                  ? "border-rose-500 ring-1 ring-rose-500/20"
                                  : "border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-100"
                              )}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400 pointer-events-none">
                              đ
                            </span>
                          </div>
                          {salaryError && (
                            <p className="text-[12px] text-rose-500 dark:text-rose-400 mt-1 font-medium">
                              {salaryError}
                            </p>
                          )}
                          {pos.salary_amount && Number(pos.salary_amount) > 0 && pos.salary_type !== "volunteer" && (
                            <span className="text-[11.5px] text-zinc-500 mt-0.5 block">
                              = <strong>{Number(pos.salary_amount).toLocaleString("vi-VN")} đ</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Ghi chú / Yêu cầu riêng cho vị trí */}
                      <div>
                        <input
                          type="text"
                          placeholder="Mô tả / yêu cầu riêng cho vị trí này (VD: Chiều cao từ 1m60, biết chụp máy cơ, tự túc xe máy...)"
                          value={pos.description || ""}
                          onChange={(e) => handleUpdatePosition(idx, "description", e.target.value)}
                          className="w-full h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700/80 bg-white/70 dark:bg-zinc-900 text-[13px] text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition"
                        />
                      </div>
                    </div>
                  )
                })}

                {/* Nút thêm vị trí tuyển dụng mới */}
                <button
                  type="button"
                  onClick={handleAddPosition}
                  className="w-full py-3 px-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 dark:hover:border-zinc-500 rounded-xl text-[13.5px] font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white flex items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm vị trí tuyển dụng khác</span>
                </button>
              </div>
            </div>

            {/* KHỐI 3: THỜI GIAN & ĐỊA ĐIỂM TỔ CHỨC */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-zinc-100 dark:border-zinc-800/80">
                <div className="size-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-200">
                  <MapPin className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                    3. Thời gian & Địa điểm tổ chức
                  </h2>
                  <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
                    Khu vực tại Đà Nẵng, địa chỉ chi tiết và khung giờ ca trực
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Phường/Xã & Địa chỉ cụ thể */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phường/Xã */}
                  <div>
                    <label htmlFor="event-wardId" className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Phường / Xã (Đà Nẵng) <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      id="event-wardId"
                      name="wardId"
                      value={wardId}
                      onChange={(val) => {
                        setWardId(val)
                        clearError("wardId")
                      }}
                      options={wardOptions}
                      placeholder="Chọn Phường / Xã"
                      searchable={true}
                      searchPlaceholder="Tìm kiếm phường, xã..."
                      error={errors.wardId}
                    />
                  </div>

                  {/* Địa chỉ cụ thể */}
                  <div>
                    <label htmlFor="event-location" className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Địa chỉ / Địa điểm chi tiết <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="event-location"
                      name="location"
                      type="text"
                      required
                      placeholder="VD: Cung Thể thao Tiên Sơn, 03 Phan Đăng Lưu..."
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value)
                        clearError("location")
                      }}
                      className={cn(
                        "w-full h-10.5 px-3.5 rounded-lg border bg-white dark:bg-zinc-800/50 text-[14px] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none transition",
                        errors.location
                          ? "border-rose-500 ring-1 ring-rose-500/20"
                          : "border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                      )}
                    />
                    {errors.location && (
                      <p className="text-[12px] text-rose-500 dark:text-rose-400 mt-1 font-medium flex items-center gap-1">
                        {errors.location}
                      </p>
                    )}
                  </div>
                </div>

                {/* Ngày bắt đầu & Ngày kết thúc */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="event-eventDate" className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Ngày bắt đầu sự kiện <span className="text-red-500">*</span>
                    </label>
                    <DatePicker
                      id="event-eventDate"
                      name="eventDate"
                      value={eventDate}
                      onChange={(val) => {
                        setEventDate(val)
                        if (!val) {
                          setErrorField("eventDate", "Vui lòng chọn ngày bắt đầu sự kiện")
                        } else if (val < localTodayStr) {
                          setErrorField("eventDate", "Ngày sự kiện không thể ở trong quá khứ")
                        } else {
                          clearError("eventDate")
                          if (applicationDeadline && applicationDeadline > val) {
                            setErrorField("applicationDeadline", "Hạn chót không được sau ngày diễn ra sự kiện")
                          } else if (errors.applicationDeadline?.includes("không được sau ngày")) {
                            clearError("applicationDeadline")
                          }
                          if (endDate && endDate < val) {
                            setErrorField("endDate", "Ngày kết thúc không thể trước ngày bắt đầu")
                          } else if (errors.endDate?.includes("không thể trước ngày")) {
                            clearError("endDate")
                          }
                        }
                      }}
                      minDate={localTodayStr}
                      placeholder="Chọn ngày bắt đầu sự kiện..."
                      error={errors.eventDate}
                      presets={[
                        { label: "Ngày mai", daysFromNow: 1 },
                        { label: "+3 ngày", daysFromNow: 3 },
                        { label: "+7 ngày", daysFromNow: 7 },
                        { label: "+14 ngày", daysFromNow: 14 },
                      ]}
                    />
                  </div>

                  <div>
                    <label htmlFor="event-endDate" className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Ngày kết thúc <span className="text-zinc-400 text-xs font-normal">(nếu nhiều ngày)</span>
                    </label>
                    <DatePicker
                      id="event-endDate"
                      name="endDate"
                      value={endDate}
                      onChange={(val) => {
                        if (setEndDate) setEndDate(val)
                        if (val && eventDate && val < eventDate) {
                          setErrorField("endDate", "Ngày kết thúc không thể trước ngày bắt đầu")
                        } else {
                          clearError("endDate")
                        }
                      }}
                      minDate={eventDate || localTodayStr}
                      placeholder="Chọn ngày kết thúc..."
                      error={errors.endDate}
                      presets={undefined}
                    />
                  </div>
                </div>

                {/* Giờ ca trực */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="event-startTime" className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Giờ bắt đầu ca trực
                    </label>
                    <TimePicker
                      id="event-startTime"
                      name="startTime"
                      value={startTime}
                      onChange={(val) => {
                        if (setStartTime) setStartTime(val)
                        clearError("startTime")
                        if (endTime && (!endDate || endDate === eventDate) && val >= endTime) {
                          setErrorField("endTime", "Giờ kết thúc ca trực phải sau giờ bắt đầu")
                        } else if (errors.endTime?.includes("phải sau giờ bắt đầu")) {
                          clearError("endTime")
                        }
                      }}
                      placeholder="Chọn giờ bắt đầu..."
                      error={errors.startTime}
                      quickShifts={[
                        { label: "Sáng 07:30", time: "07:30" },
                        { label: "Sáng 08:00", time: "08:00" },
                        { label: "Chiều 13:00", time: "13:00" },
                        { label: "Tối 18:00", time: "18:00" },
                      ]}
                    />
                  </div>

                  <div>
                    <label htmlFor="event-endTime" className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Giờ kết thúc ca trực
                    </label>
                    <TimePicker
                      id="event-endTime"
                      name="endTime"
                      value={endTime}
                      onChange={(val) => {
                        if (setEndTime) setEndTime(val)
                        if (startTime && (!endDate || endDate === eventDate) && val <= startTime) {
                          setErrorField("endTime", "Giờ kết thúc ca trực phải sau giờ bắt đầu")
                        } else {
                          clearError("endTime")
                        }
                      }}
                      minTime={(!endDate || endDate === eventDate) ? startTime : undefined}
                      placeholder="Chọn giờ kết thúc..."
                      error={errors.endTime}
                      quickShifts={[
                        { label: "Trưa 11:30", time: "11:30" },
                        { label: "Chiều 17:00", time: "17:00" },
                        { label: "Tối 21:00", time: "21:00" },
                        { label: "Khuya 22:30", time: "22:30" },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* KHỐI 4: QUYỀN LỢI & PHƯƠNG THỨC THANH TOÁN */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-zinc-100 dark:border-zinc-800/80">
                <div className="size-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-200">
                  <CircleDollarSign className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                    4. Quyền lợi & Phương thức thanh toán
                  </h2>
                  <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
                    Hình thức chi trả và các chế độ đãi ngộ cho nhân sự
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Phương thức thanh toán */}
                <div>
                  <label htmlFor="event-payment-method" className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Phương thức thanh toán <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    id="event-payment-method"
                    name="paymentMethod"
                    value={paymentMethod}
                    onChange={(val) => {
                      if (setPaymentMethod) setPaymentMethod(val)
                      clearError("paymentMethod")
                    }}
                    options={[
                      { value: "cash_after_event", label: "Nhận tiền mặt ngay sau sự kiện" },
                      { value: "bank_transfer", label: "Chuyển khoản sau khi kết thúc ca" },
                      { value: "after_project", label: "Quyết toán sau chuỗi sự kiện" },
                    ]}
                    placeholder="Chọn phương thức thanh toán"
                  />
                </div>

                {/* Danh sách quyền lợi dạng Chips 1-chạm */}
                <div className="pt-2">
                  <label className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Chế độ đãi ngộ & Quyền lợi kèm theo <span className="text-zinc-400 text-xs font-normal">(chọn nhiều)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {benefitOptions.map((b) => {
                      const isChecked = selectedBenefits.includes(b)
                      return (
                        <button
                          key={b}
                          type="button"
                          onClick={() => toggleBenefit(b)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition cursor-pointer border select-none ${
                            isChecked
                              ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 shadow-xs"
                              : "border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-100"
                          }`}
                        >
                          {isChecked ? (
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                          )}
                          <span>{b}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* KHỐI 5: MÔ TẢ CHI TIẾT & KÊNH TIẾP NHẬN */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-zinc-100 dark:border-zinc-800/80">
                <div className="size-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-200">
                  <FileText className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                    5. Mô tả chi tiết & Kênh tiếp nhận
                  </h2>
                  <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
                    Nội dung nhiệm vụ, trang phục, lưu ý và link nhóm liên hệ
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Link Zalo nhóm tiếp nhận */}
                <div>
                  <label htmlFor="event-zaloGroupLink" className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Link nhóm Zalo tiếp nhận ứng viên <span className="text-zinc-400 text-xs font-normal">(tùy chọn)</span>
                  </label>
                  <div className="relative">
                    <input
                      id="event-zaloGroupLink"
                      name="zaloGroupLink"
                      type="url"
                      placeholder="https://zalo.me/g/..."
                      value={zaloGroupLink}
                      onChange={(e) => {
                        if (setZaloGroupLink) setZaloGroupLink(e.target.value)
                        clearError("zaloGroupLink")
                      }}
                      className={cn(
                        "w-full h-10.5 pl-9 pr-3.5 rounded-lg border bg-white dark:bg-zinc-800/50 text-[14px] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none transition",
                        errors.zaloGroupLink
                          ? "border-rose-500 ring-1 ring-rose-500/20"
                          : "border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                      )}
                    />
                    <MessageCircle className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {errors.zaloGroupLink && (
                    <p className="text-[12px] text-rose-500 dark:text-rose-400 mt-1 font-medium flex items-center gap-1">
                      {errors.zaloGroupLink}
                    </p>
                  )}
                  <span className="text-[11.5px] text-zinc-500 mt-1 block">
                    Link này sẽ tự động hiển thị cho ứng viên sau khi được bạn phê duyệt.
                  </span>
                </div>

                {/* Mô tả chi tiết */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="event-desc" className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
                      Mô tả nhiệm vụ & Yêu cầu <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11.5px] text-zinc-400 font-mono">
                      {desc.length}/1500 ký tự
                    </span>
                  </div>
                  <textarea
                    id="event-desc"
                    name="description"
                    rows={6}
                    required
                    placeholder="• Tổng quan: Giới thiệu sự kiện, mục tiêu và quy mô...&#10;• Yêu cầu chung: Đúng giờ, nhiệt tình, có trách nhiệm, ưu tiên sinh viên các trường ĐH tại Đà Nẵng...&#10;• Trang phục & Tác phong: Áo thun trắng/đen, quần dài tối màu, giày thể thao..."
                    value={desc}
                    onChange={(e) => {
                      setDesc(e.target.value)
                      clearError("desc")
                    }}
                    maxLength={1500}
                    className={cn(
                      "w-full p-3.5 rounded-lg border bg-white dark:bg-zinc-800/50 text-[14px] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none resize-y leading-relaxed transition",
                      errors.desc
                        ? "border-rose-500 ring-1 ring-rose-500/20"
                        : "border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                    )}
                  />
                  {errors.desc && (
                    <p className="text-[12px] text-rose-500 dark:text-rose-400 mt-1 font-medium flex items-center gap-1">
                      {errors.desc}
                    </p>
                  )}
                  <p className="text-[11.5px] text-zinc-500 mt-1">
                    Gợi ý: Nêu rõ trang phục bắt buộc, giờ tập trung điểm danh và các lưu ý đặc thù của sự kiện.
                  </p>
                </div>
              </div>
            </div>

            {/* KHỐI 6: TÙY CHỌN GÓI DỊCH VỤ & HIỂN THỊ ƯU TIÊN */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-zinc-100 dark:border-zinc-800/80">
                <div className="size-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                    6. Gói dịch vụ & Tùy chọn hiển thị ưu tiên
                  </h2>
                  <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
                    Ghim tin tuyển gấp hoặc nổi bật trên trang chủ để tiếp cận ứng viên nhanh nhất
                  </p>
                </div>
              </div>

              <div className="space-y-3.5">
                {/* Banner thông báo credit Sự Kiện Nhanh */}
                {!isPremium && singleEventCredits > 0 && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                    <Sparkles className="size-4 text-amber-600 shrink-0" />
                    <span>
                      Bạn có <strong>{singleEventCredits} lượt đăng Sự Kiện Nhanh (99k)</strong>. Sự kiện này được cấp quyền <strong>Ghim Tuyển Gấp</strong> và mã <strong>QR Điểm danh</strong>!
                    </span>
                  </div>
                )}

                {/* 1. Tuyển gấp / Ghim tin HOT */}
                <label className={cn(
                  "p-4 rounded-xl border transition-all flex items-start justify-between gap-4 cursor-pointer",
                  isUrgent ? "border-rose-300 bg-rose-50/50 dark:bg-rose-950/20 shadow-xs" : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-800/30 hover:border-zinc-300",
                  !canUseUrgent && "opacity-75 cursor-not-allowed"
                )}>
                  <div className="flex items-start gap-3">
                    <Flame className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100">
                          Ghim tin Tuyển Gấp / HOT
                        </span>
                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                          Gói Sự kiện & Doanh nghiệp
                        </span>
                      </div>
                      <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                        Gắn huy hiệu "Tuyển gấp" màu đỏ bắt mắt và ưu tiên đưa tin lên đầu trang tìm việc.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    disabled={!canUseUrgent}
                    onChange={(e) => setIsUrgent && setIsUrgent(e.target.checked)}
                    className="size-5 rounded border-zinc-300 text-rose-600 focus:ring-rose-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mt-0.5"
                  />
                </label>

                {/* 2. Ghim tin Nổi bật trang chủ */}
                <label className={cn(
                  "p-4 rounded-xl border transition-all flex items-start justify-between gap-4 cursor-pointer",
                  isFeatured ? "border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs" : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-800/30 hover:border-zinc-300",
                  !isPremium && "opacity-75 cursor-not-allowed"
                )}>
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100">
                          Ghim Nổi Bật Trang Chủ
                        </span>
                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          Gói Doanh nghiệp VIP
                        </span>
                      </div>
                      <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                        Đưa sự kiện vào khu vực Tin Nổi Bật hàng đầu với viền vàng kim và huy hiệu VIP.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    disabled={!isPremium}
                    onChange={(e) => setIsFeatured && setIsFeatured(e.target.checked)}
                    className="size-5 rounded border-zinc-300 text-amber-600 focus:ring-amber-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mt-0.5"
                  />
                </label>

                {!isPremium && (
                  <div className="p-3 bg-zinc-100 dark:bg-zinc-800/60 rounded-lg flex items-center justify-between gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-zinc-500" />
                      Tài khoản miễn phí: Giới hạn 1 sự kiện / tháng, tin tự động đóng sau 7 ngày.
                    </span>
                    <Link
                      href="/pricing"
                      className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline shrink-0"
                    >
                      Nâng cấp ngay &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* CỘT PHẢI: LIVE PREVIEW STICKY & TIÊU CHUẨN ĐĂNG TIN */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-4 flex flex-col gap-5">
            
            {/* THẺ PREVIEW CARD */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">
                    Xem trước hiển thị (Live Preview)
                  </span>
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  Giao diện ứng viên
                </span>
              </div>

              {/* EventCard Component */}
              <div className="pointer-events-none select-none">
                <EventCard job={previewJob} />
              </div>
              <p className="text-[11.5px] text-zinc-400 text-center mt-2.5">
                Đây là giao diện thẻ sự kiện sinh viên sẽ nhìn thấy trên trang chủ.
              </p>
            </div>

            {/* THẺ CHECKLIST TIÊU CHUẨN BÀI ĐĂNG */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">
                  Kiểm tra trước khi đăng
                </span>
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {completedChecklistCount}/{checklist.length}
                </span>
              </div>

              <ul className="space-y-2.5">
                {checklist.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-[12.5px]">
                    {item.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-zinc-300 dark:text-zinc-600 shrink-0" />
                    )}
                    <span className={item.done ? "text-zinc-800 dark:text-zinc-200 font-medium" : "text-zinc-500 dark:text-zinc-400"}>
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="flex items-center justify-between gap-3 pt-5 border-t border-zinc-200 dark:border-zinc-800 bg-[#f3f5f7] dark:bg-zinc-950 sticky bottom-0 z-20 py-2">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="h-10.5 px-5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-[14px] font-medium transition cursor-pointer"
            >
              Hủy bỏ
            </button>
          ) : <div />}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading || isQuotaExceeded}
              className="h-10.5 px-7 rounded-lg bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-[14px] font-semibold shadow-xs transition-all flex items-center justify-center disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
                  Đang xử lý...
                </span>
              ) : editingId ? (
                "Lưu thay đổi bài đăng"
              ) : isQuotaExceeded ? (
                "Đã hết hạn mức đăng tin"
              ) : (
                "Xuất bản & Đăng tuyển"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
