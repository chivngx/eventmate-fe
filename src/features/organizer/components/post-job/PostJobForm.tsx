"use client"

import React, { useState, useEffect } from "react"
import {
  Briefcase,
  MapPin,
  CircleDollarSign,
  Sparkles,
  FileText,
  X,
  Clock,
  Calendar,
  ChevronDown,
  MessageCircle,
  Award,
  Users
} from "lucide-react"
import { supabase } from "@/lib/supabase"

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
  positionType: string
  setPositionType: (val: string) => void
  category: string
  setCategory: (val: string) => void
  benefits: string
  setBenefits: (val: string) => void
  slotsNeeded: string
  setSlotsNeeded: (val: string) => void
  desc: string
  setDesc: (val: string) => void
  loading?: boolean
  onSubmit: (e: React.FormEvent) => void
  onCancel?: () => void
  positionsList?: string[]
  categoriesList?: string[]
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
  positionType,
  setPositionType,
  category,
  setCategory,
  benefits,
  setBenefits,
  slotsNeeded,
  setSlotsNeeded,
  desc,
  setDesc,
  loading = false,
  onSubmit,
  onCancel,
  positionsList = [],
  categoriesList = []
}: PostJobFormProps) {
  // DB categories and positions fallback
  const [positions, setPositions] = useState<string[]>(positionsList)
  const [categories, setCategories] = useState<string[]>(categoriesList)

  useEffect(() => {
    if (positions.length === 0 || categories.length === 0) {
      const loadOptions = async () => {
        const { data: posData } = await supabase
          .from("job_positions")
          .select("name")
          .order("name", { ascending: true })
        if (posData && posData.length > 0) {
          setPositions(posData.map((p: any) => p.name))
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

  // Event Benefits Options
  const benefitOptions = [
    "Giấy chứng nhận hoạt động (Certificate)",
    "Hỗ trợ ăn uống & nước uống trong ca trực",
    "Áo đồng phục & Thẻ Ban tổ chức (BTC)",
    "Cộng điểm rèn luyện sinh viên",
    "Hỗ trợ chi phí xăng xe / đi lại",
    "Thưởng chuyên cần & Hiệu suất làm việc",
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

  return (
    <div className="w-full max-w-[1360px] mx-auto pb-16 animate-in fade-in duration-300">
      <form onSubmit={onSubmit} className="space-y-6">
        {/* 2-COLUMN GRID ON DESKTOP */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* CỘT TRÁI: THÔNG TIN CƠ BẢN, VỊ TRÍ, THỜI GIAN & ĐỊA ĐIỂM */}
          <div className="flex flex-col gap-6">
            
            {/* THẺ 1: THÔNG TIN CHUNG SỰ KIỆN & VỊ TRÍ */}
            <div className="bg-white dark:bg-zinc-900 border border-[#ededed] dark:border-zinc-800 rounded-[8px] sm:rounded-[12px] p-4 sm:p-6 shadow-none flex flex-col gap-7">
              {/* Header */}
              <div className="flex items-center gap-2 pb-1">
                <Briefcase className="w-5 h-5 text-[#222222] dark:text-zinc-100 stroke-[1.75]" />
                <h2 className="text-[17px] font-semibold text-[#222222] dark:text-zinc-100 leading-normal">
                  1. Thông tin chung sự kiện & Vị trí
                </h2>
              </div>

              <div className="flex flex-col gap-7">
                {/* 1. Tên vị trí tuyển dụng */}
                <div className="relative w-full">
                  <div className="border border-[#a5a5a5] dark:border-zinc-700 rounded-[8px] h-[48px] px-4 flex items-center w-full bg-transparent focus-within:border-[#222222] dark:focus-within:border-zinc-300 transition">
                    <input
                      id="event-title"
                      name="title"
                      type="text"
                      required
                      placeholder="VD: CTV Check-in khách mời, TNV Hậu cần..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-transparent font-['Inter'] text-[14px] text-[#222222] dark:text-zinc-100 placeholder-[#a5a5a5] dark:placeholder-zinc-500 focus:outline-none"
                    />
                  </div>
                  <label htmlFor="event-title" className="absolute -top-[12px] left-3 bg-white dark:bg-zinc-900 px-2 py-[1px] rounded-[30px] flex items-center gap-0.5 pointer-events-none select-none z-10">
                    <span className="font-['Inter'] font-medium text-[13px] text-[#222222] dark:text-zinc-200">
                      Tên vị trí tuyển dụng
                    </span>
                    <span className="font-semibold text-[#dc0000] text-[15px] leading-none">*</span>
                  </label>
                </div>

                {/* 2. Danh mục sự kiện & Vị trí tuyển dụng */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Danh mục sự kiện */}
                  <div className="relative w-full">
                    <div className="relative border border-[#a5a5a5] dark:border-zinc-700 rounded-[8px] h-[48px] px-4 flex items-center w-full bg-transparent focus-within:border-[#222222] dark:focus-within:border-zinc-300 transition">
                      <select
                        id="event-category"
                        name="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-transparent font-['Inter'] text-[14px] text-[#222222] dark:text-zinc-100 focus:outline-none appearance-none cursor-pointer pr-6"
                      >
                        <option value="" className="text-[#a5a5a5]">Chọn danh mục sự kiện</option>
                        {categories.map((cat, idx) => (
                          <option key={idx} value={cat} className="text-[#222222] dark:text-zinc-100 dark:bg-zinc-900">
                            {cat}
                          </option>
                        ))}
                        {categories.length === 0 && (
                          <>
                            <option value="Sự kiện Âm nhạc & Lễ hội">Sự kiện Âm nhạc & Lễ hội</option>
                            <option value="Hội nghị & Hội thảo">Hội nghị & Hội thảo</option>
                            <option value="Giải đấu Thể thao & Marathon">Giải đấu Thể thao & Marathon</option>
                            <option value="Lễ hội & Triển lãm Văn hóa">Lễ hội & Triển lãm Văn hóa</option>
                            <option value="Hoạt động Tình nguyện & Cộng đồng">Hoạt động Tình nguyện & Cộng đồng</option>
                            <option value="Sự kiện Doanh nghiệp & Ra mắt">Sự kiện Doanh nghiệp & Ra mắt</option>
                          </>
                        )}
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#757575] dark:text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <label htmlFor="event-category" className="absolute -top-[12px] left-3 bg-white dark:bg-zinc-900 px-2 py-[1px] rounded-[30px] flex items-center gap-0.5 pointer-events-none select-none z-10">
                      <span className="font-['Inter'] font-medium text-[13px] text-[#222222] dark:text-zinc-200">
                        Danh mục sự kiện
                      </span>
                      <span className="font-semibold text-[#dc0000] text-[15px] leading-none">*</span>
                    </label>
                  </div>

                  {/* Vị trí / Vai trò phụ trách */}
                  <div className="relative w-full">
                    <div className="relative border border-[#a5a5a5] dark:border-zinc-700 rounded-[8px] h-[48px] px-4 flex items-center w-full bg-transparent focus-within:border-[#222222] dark:focus-within:border-zinc-300 transition">
                      <select
                        id="event-position-type"
                        name="positionType"
                        value={positionType}
                        onChange={(e) => setPositionType(e.target.value)}
                        className="w-full bg-transparent font-['Inter'] text-[14px] text-[#222222] dark:text-zinc-100 focus:outline-none appearance-none cursor-pointer pr-6"
                      >
                        <option value="" className="text-[#a5a5a5]">Chọn vai trò / vị trí</option>
                        {positions.map((pos, idx) => (
                          <option key={idx} value={pos} className="text-[#222222] dark:text-zinc-100 dark:bg-zinc-900">
                            {pos}
                          </option>
                        ))}
                        {positions.length === 0 && (
                          <>
                            <option value="TNV Hướng dẫn & Check-in">TNV Hướng dẫn & Check-in</option>
                            <option value="TNV Hậu cần & Sân khấu">TNV Hậu cần & Sân khấu</option>
                            <option value="CTV Media & Quay chụp">CTV Media & Quay chụp</option>
                            <option value="Điều phối viên & Trưởng nhóm">Điều phối viên & Trưởng nhóm</option>
                            <option value="CTV Hoạt náo & MC">CTV Hoạt náo & MC</option>
                            <option value="Hỗ trợ Kỹ thuật & Âm thanh">Hỗ trợ Kỹ thuật & Âm thanh</option>
                            <option value="Lễ tân & Tiếp đón khách VIP">Lễ tân & Tiếp đón khách VIP</option>
                          </>
                        )}
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#757575] dark:text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <label htmlFor="event-position-type" className="absolute -top-[12px] left-3 bg-white dark:bg-zinc-900 px-2 py-[1px] rounded-[30px] flex items-center gap-0.5 pointer-events-none select-none z-10">
                      <span className="font-['Inter'] font-medium text-[13px] text-[#222222] dark:text-zinc-200">
                        Vai trò / Vị trí
                      </span>
                      <span className="font-semibold text-[#dc0000] text-[15px] leading-none">*</span>
                    </label>
                  </div>
                </div>

                {/* 3. Số lượng cần tuyển & Hạn chót ứng tuyển */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="relative w-full">
                    <div className="border border-[#a5a5a5] dark:border-zinc-700 rounded-[8px] h-[48px] px-4 flex items-center w-full bg-transparent focus-within:border-[#222222] dark:focus-within:border-zinc-300 transition">
                      <input
                        id="event-slots-needed"
                        name="slotsNeeded"
                        type="number"
                        min="1"
                        placeholder="VD: 5"
                        value={slotsNeeded}
                        onChange={(e) => setSlotsNeeded(e.target.value)}
                        className="w-full bg-transparent font-['Inter'] text-[14px] text-[#222222] dark:text-zinc-100 placeholder-[#a5a5a5] dark:placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                    <label htmlFor="event-slots-needed" className="absolute -top-[12px] left-3 bg-white dark:bg-zinc-900 px-2 py-[1px] rounded-[30px] flex items-center gap-0.5 pointer-events-none select-none z-10">
                      <span className="font-['Inter'] font-medium text-[13px] text-[#222222] dark:text-zinc-200">
                        Số lượng cần tuyển
                      </span>
                      <span className="font-semibold text-[#dc0000] text-[15px] leading-none">*</span>
                    </label>
                  </div>

                  <div className="relative w-full">
                    <div className="border border-[#a5a5a5] dark:border-zinc-700 rounded-[8px] h-[48px] px-4 flex items-center w-full bg-transparent focus-within:border-[#222222] dark:focus-within:border-zinc-300 transition">
                      <input
                        id="event-application-deadline"
                        name="applicationDeadline"
                        type="date"
                        required
                        value={applicationDeadline}
                        onChange={(e) => setApplicationDeadline(e.target.value)}
                        className="w-full bg-transparent font-['Inter'] text-[14px] text-[#222222] dark:text-zinc-100 focus:outline-none cursor-pointer"
                      />
                    </div>
                    <label htmlFor="event-application-deadline" className="absolute -top-[12px] left-3 bg-white dark:bg-zinc-900 px-2 py-[1px] rounded-[30px] flex items-center gap-0.5 pointer-events-none select-none z-10">
                      <span className="font-['Inter'] font-medium text-[13px] text-[#222222] dark:text-zinc-200">
                        Hạn chót nhận đăng ký
                      </span>
                      <span className="font-semibold text-[#dc0000] text-[15px] leading-none">*</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* THẺ 2: THỜI GIAN & ĐỊA ĐIỂM TỔ CHỨC */}
            <div className="bg-white dark:bg-zinc-900 border border-[#ededed] dark:border-zinc-800 rounded-[8px] sm:rounded-[12px] p-4 sm:p-6 shadow-none flex flex-col gap-7">
              {/* Header */}
              <div className="flex items-center gap-2 pb-1">
                <MapPin className="w-5 h-5 text-[#222222] dark:text-zinc-100 stroke-[1.75]" />
                <h2 className="text-[17px] font-semibold text-[#222222] dark:text-zinc-100 leading-normal">
                  2. Thời gian & Địa điểm tổ chức
                </h2>
              </div>

              <div className="flex flex-col gap-7">
                {/* 1. Phường/Xã và Địa điểm chi tiết */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Phường / Xã */}
                  <div className="relative w-full">
                    <div className="relative border border-[#a5a5a5] dark:border-zinc-700 rounded-[8px] h-[48px] px-4 flex items-center w-full bg-transparent focus-within:border-[#222222] dark:focus-within:border-zinc-300 transition">
                      <select
                        id="event-ward-id"
                        name="wardId"
                        value={wardId}
                        onChange={(e) => setWardId(e.target.value)}
                        className="w-full bg-transparent font-['Inter'] text-[14px] text-[#222222] dark:text-zinc-100 focus:outline-none appearance-none cursor-pointer pr-6"
                      >
                        <option value="" className="text-[#a5a5a5]">Chọn Phường / Xã (Đà Nẵng)</option>
                        {wards.map((w) => (
                          <option key={w.id} value={w.id} className="text-[#222222] dark:text-zinc-100 dark:bg-zinc-900">
                            {w.name}
                          </option>
                        ))}
                        {wards.length === 0 && <option value="1">Hải Châu, Đà Nẵng</option>}
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#757575] dark:text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <label htmlFor="event-ward-id" className="absolute -top-[12px] left-3 bg-white dark:bg-zinc-900 px-2 py-[1px] rounded-[30px] flex items-center gap-0.5 pointer-events-none select-none z-10">
                      <span className="font-['Inter'] font-medium text-[13px] text-[#222222] dark:text-zinc-200">
                        Phường / Xã (Đà Nẵng)
                      </span>
                      <span className="font-semibold text-[#dc0000] text-[15px] leading-none">*</span>
                    </label>
                  </div>

                  {/* Địa chỉ cụ thể */}
                  <div className="relative w-full">
                    <div className="border border-[#a5a5a5] dark:border-zinc-700 rounded-[8px] h-[48px] px-4 flex items-center w-full bg-transparent focus-within:border-[#222222] dark:focus-within:border-zinc-300 transition">
                      <input
                        id="event-location"
                        name="location"
                        type="text"
                        required
                        placeholder="VD: Cung Tiên Sơn, 03 Phan Đăng Lưu..."
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-transparent font-['Inter'] text-[14px] text-[#222222] dark:text-zinc-100 placeholder-[#a5a5a5] dark:placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                    <label htmlFor="event-location" className="absolute -top-[12px] left-3 bg-white dark:bg-zinc-900 px-2 py-[1px] rounded-[30px] flex items-center gap-0.5 pointer-events-none select-none z-10">
                      <span className="font-['Inter'] font-medium text-[13px] text-[#222222] dark:text-zinc-200">
                        Địa chỉ / Địa điểm
                      </span>
                      <span className="font-semibold text-[#dc0000] text-[15px] leading-none">*</span>
                    </label>
                  </div>
                </div>

                {/* Badge vị trí đã chọn */}
                {(selectedWard?.name || location) && (
                  <div className="flex flex-wrap items-center gap-2 -mt-3">
                    <span className="inline-flex items-center gap-1.5 bg-[#f4f4f5] dark:bg-zinc-800 text-[#222222] dark:text-zinc-200 text-xs font-medium px-3 py-1.5 rounded-[6px] border border-[#e4e4e7] dark:border-zinc-700">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      {selectedWard?.name ? `${selectedWard.name}, Đà Nẵng` : ""}
                      {selectedWard?.name && location ? " — " : ""}
                      {location}
                      <button
                        type="button"
                        onClick={() => {
                          setWardId("")
                          setLocation("")
                        }}
                        className="hover:text-red-600 transition ml-1"
                        title="Xóa địa chỉ"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  </div>
                )}

                {/* 2. Ngày bắt đầu & Ngày kết thúc sự kiện */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="relative w-full">
                    <div className="border border-[#a5a5a5] dark:border-zinc-700 rounded-[8px] h-[48px] px-4 flex items-center w-full bg-transparent focus-within:border-[#222222] dark:focus-within:border-zinc-300 transition">
                      <input
                        id="event-date"
                        name="eventDate"
                        type="date"
                        required
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full bg-transparent font-['Inter'] text-[14px] text-[#222222] dark:text-zinc-100 focus:outline-none cursor-pointer"
                      />
                    </div>
                    <label htmlFor="event-date" className="absolute -top-[12px] left-3 bg-white dark:bg-zinc-900 px-2 py-[1px] rounded-[30px] flex items-center gap-0.5 pointer-events-none select-none z-10">
                      <span className="font-['Inter'] font-medium text-[13px] text-[#222222] dark:text-zinc-200 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        Ngày bắt đầu sự kiện
                      </span>
                      <span className="font-semibold text-[#dc0000] text-[15px] leading-none">*</span>
                    </label>
                  </div>

                  <div className="relative w-full">
                    <div className="border border-[#a5a5a5] dark:border-zinc-700 rounded-[8px] h-[48px] px-4 flex items-center w-full bg-transparent focus-within:border-[#222222] dark:focus-within:border-zinc-300 transition">
                      <input
                        id="event-end-date"
                        name="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate && setEndDate(e.target.value)}
                        className="w-full bg-transparent font-['Inter'] text-[14px] text-[#222222] dark:text-zinc-100 focus:outline-none cursor-pointer"
                      />
                    </div>
                    <label htmlFor="event-end-date" className="absolute -top-[12px] left-3 bg-white dark:bg-zinc-900 px-2 py-[1px] rounded-[30px] flex items-center gap-0.5 pointer-events-none select-none z-10">
                      <span className="font-['Inter'] font-medium text-[13px] text-[#222222] dark:text-zinc-200 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        Ngày kết thúc (nhiều ngày)
                      </span>
                    </label>
                  </div>
                </div>

                {/* 3. Khung giờ ca làm việc */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="relative w-full">
                    <div className="border border-[#a5a5a5] dark:border-zinc-700 rounded-[8px] h-[48px] px-4 flex items-center w-full bg-transparent focus-within:border-[#222222] dark:focus-within:border-zinc-300 transition">
                      <input
                        id="event-start-time"
                        name="startTime"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime && setStartTime(e.target.value)}
                        className="w-full bg-transparent font-['Inter'] text-[14px] text-[#222222] dark:text-zinc-100 focus:outline-none cursor-pointer"
                      />
                    </div>
                    <label htmlFor="event-start-time" className="absolute -top-[12px] left-3 bg-white dark:bg-zinc-900 px-2 py-[1px] rounded-[30px] flex items-center gap-0.5 pointer-events-none select-none z-10">
                      <span className="font-['Inter'] font-medium text-[13px] text-[#222222] dark:text-zinc-200 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        Giờ bắt đầu ca trực
                      </span>
                    </label>
                  </div>

                  <div className="relative w-full">
                    <div className="border border-[#a5a5a5] dark:border-zinc-700 rounded-[8px] h-[48px] px-4 flex items-center w-full bg-transparent focus-within:border-[#222222] dark:focus-within:border-zinc-300 transition">
                      <input
                        id="event-end-time"
                        name="endTime"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime && setEndTime(e.target.value)}
                        className="w-full bg-transparent font-['Inter'] text-[14px] text-[#222222] dark:text-zinc-100 focus:outline-none cursor-pointer"
                      />
                    </div>
                    <label htmlFor="event-end-time" className="absolute -top-[12px] left-3 bg-white dark:bg-zinc-900 px-2 py-[1px] rounded-[30px] flex items-center gap-0.5 pointer-events-none select-none z-10">
                      <span className="font-['Inter'] font-medium text-[13px] text-[#222222] dark:text-zinc-200 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        Giờ kết thúc ca trực
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* CỘT PHẢI: THÙ LAO, QUYỀN LỢI, MÔ TẢ & TIẾP NHẬN */}
          <div className="flex flex-col gap-6">

            {/* THẺ 3: THÙ LAO, QUYỀN LỢI & TIẾP NHẬN */}
            <div className="bg-white dark:bg-zinc-900 border border-[#ededed] dark:border-zinc-800 rounded-[8px] sm:rounded-[12px] p-4 sm:p-6 shadow-none flex flex-col gap-7">
              {/* Header */}
              <div className="flex items-center gap-2 pb-1">
                <CircleDollarSign className="w-5 h-5 text-[#222222] dark:text-zinc-100 stroke-[1.75]" />
                <h2 className="text-[17px] font-semibold text-[#222222] dark:text-zinc-100 leading-normal">
                  3. Thù lao, Quyền lợi & Tiếp nhận
                </h2>
              </div>

              <div className="flex flex-col gap-7">
                {/* 1. Mức thù lao & Hình thức chi trả */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Mức thù lao */}
                  <div className="relative w-full">
                    <div className="border border-[#a5a5a5] dark:border-zinc-700 rounded-[8px] h-[48px] px-4 flex items-center w-full bg-transparent focus-within:border-[#222222] dark:focus-within:border-zinc-300 transition">
                      <input
                        id="event-salary-amount"
                        name="salaryAmount"
                        type="text"
                        placeholder="VD: 200,000 (Để trống nếu phi lợi nhuận)"
                        value={salaryAmount}
                        onChange={(e) => setSalaryAmount && setSalaryAmount(e.target.value)}
                        className="w-full bg-transparent font-['Inter'] text-[14px] text-[#222222] dark:text-zinc-100 placeholder-[#a5a5a5] dark:placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                    <label htmlFor="event-salary-amount" className="absolute -top-[12px] left-3 bg-white dark:bg-zinc-900 px-2 py-[1px] rounded-[30px] flex items-center gap-0.5 pointer-events-none select-none z-10">
                      <span className="font-['Inter'] font-medium text-[13px] text-[#222222] dark:text-zinc-200">
                        Mức thù lao / Hỗ trợ (VNĐ)
                      </span>
                    </label>
                  </div>

                  {/* Hình thức chi trả */}
                  <div className="relative w-full">
                    <div className="relative border border-[#a5a5a5] dark:border-zinc-700 rounded-[8px] h-[48px] px-4 flex items-center w-full bg-transparent focus-within:border-[#222222] dark:focus-within:border-zinc-300 transition">
                      <select
                        id="event-salary-type"
                        name="salaryType"
                        value={salaryType}
                        onChange={(e) => setSalaryType && setSalaryType(e.target.value)}
                        className="w-full bg-transparent font-['Inter'] text-[14px] text-[#222222] dark:text-zinc-100 focus:outline-none appearance-none cursor-pointer pr-6"
                      >
                        <option value="per_shift">Tính theo ca làm việc</option>
                        <option value="hourly">Tính theo giờ</option>
                        <option value="per_event">Trọn gói toàn bộ sự kiện</option>
                        <option value="volunteer">Tình nguyện viên (Không thù lao)</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#757575] dark:text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <label htmlFor="event-salary-type" className="absolute -top-[12px] left-3 bg-white dark:bg-zinc-900 px-2 py-[1px] rounded-[30px] flex items-center gap-0.5 pointer-events-none select-none z-10">
                      <span className="font-['Inter'] font-medium text-[13px] text-[#222222] dark:text-zinc-200">
                        Hình thức tính thù lao
                      </span>
                    </label>
                  </div>
                </div>

                {/* 2. Phương thức thanh toán & Link Zalo tiếp nhận */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Phương thức thanh toán */}
                  <div className="relative w-full">
                    <div className="relative border border-[#a5a5a5] dark:border-zinc-700 rounded-[8px] h-[48px] px-4 flex items-center w-full bg-transparent focus-within:border-[#222222] dark:focus-within:border-zinc-300 transition">
                      <select
                        id="event-payment-method"
                        name="paymentMethod"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod && setPaymentMethod(e.target.value)}
                        className="w-full bg-transparent font-['Inter'] text-[14px] text-[#222222] dark:text-zinc-100 focus:outline-none appearance-none cursor-pointer pr-6"
                      >
                        <option value="cash_after_event">Nhận tiền mặt ngay sau sự kiện</option>
                        <option value="bank_transfer">Chuyển khoản sau khi kết thúc ca</option>
                        <option value="after_project">Quyết toán sau chuỗi sự kiện</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#757575] dark:text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <label htmlFor="event-payment-method" className="absolute -top-[12px] left-3 bg-white dark:bg-zinc-900 px-2 py-[1px] rounded-[30px] flex items-center gap-0.5 pointer-events-none select-none z-10">
                      <span className="font-['Inter'] font-medium text-[13px] text-[#222222] dark:text-zinc-200">
                        Phương thức thanh toán
                      </span>
                    </label>
                  </div>

                  {/* Link Zalo nhóm */}
                  <div className="relative w-full">
                    <div className="border border-[#a5a5a5] dark:border-zinc-700 rounded-[8px] h-[48px] px-4 flex items-center w-full bg-transparent focus-within:border-[#222222] dark:focus-within:border-zinc-300 transition">
                      <input
                        id="event-zalo-link"
                        name="zaloGroupLink"
                        type="url"
                        placeholder="https://zalo.me/g/..."
                        value={zaloGroupLink}
                        onChange={(e) => setZaloGroupLink && setZaloGroupLink(e.target.value)}
                        className="w-full bg-transparent font-['Inter'] text-[14px] text-[#222222] dark:text-zinc-100 placeholder-[#a5a5a5] dark:placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                    <label htmlFor="event-zalo-link" className="absolute -top-[12px] left-3 bg-white dark:bg-zinc-900 px-2 py-[1px] rounded-[30px] flex items-center gap-0.5 pointer-events-none select-none z-10">
                      <span className="font-['Inter'] font-medium text-[13px] text-[#222222] dark:text-zinc-200 flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                        Link Zalo nhóm tiếp nhận
                      </span>
                    </label>
                  </div>
                </div>

                {/* 3. Quyền lợi dành cho CTV / TNV */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h3 className="text-[14px] font-semibold text-[#222222] dark:text-zinc-200">
                      Quyền lợi & Hỗ trợ dành cho nhân sự tham gia
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {benefitOptions.map((b, idx) => {
                      const isChecked = selectedBenefits.includes(b)
                      const benefitId = `benefit-opt-${idx}`
                      return (
                        <label
                          key={b}
                          htmlFor={benefitId}
                          className={`flex items-center gap-2 p-2.5 rounded-[8px] border transition cursor-pointer select-none text-[13px] ${
                            isChecked
                              ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 font-medium"
                              : "border-[#e4e4e7] dark:border-zinc-800 bg-transparent text-[#444444] dark:text-zinc-300 hover:border-zinc-400"
                          }`}
                        >
                          <input
                            id={benefitId}
                            name="benefitsList"
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleBenefit(b)}
                            className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="leading-tight">{b}</span>
                        </label>
                      )
                    })}
                  </div>

                  {/* Badges quyền lợi đã chọn */}
                  {selectedBenefits.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      {selectedBenefits.map((b) => (
                        <span
                          key={b}
                          className="inline-flex items-center gap-1.5 bg-[#f4f4f5] dark:bg-zinc-800 text-[#222222] dark:text-zinc-200 text-xs font-medium px-2.5 py-1 rounded-[6px] border border-[#e4e4e7] dark:border-zinc-700"
                        >
                          {b}
                          <button
                            type="button"
                            onClick={() => toggleBenefit(b)}
                            className="hover:text-red-600 transition ml-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* THẺ 4: MÔ TẢ CHI TIẾT & YÊU CẦU CÔNG VIỆC */}
            <div className="bg-white dark:bg-zinc-900 border border-[#ededed] dark:border-zinc-800 rounded-[8px] sm:rounded-[12px] p-4 sm:p-6 shadow-none flex flex-col gap-7">
              {/* Header */}
              <div className="flex items-center gap-2 pb-1">
                <FileText className="w-5 h-5 text-[#222222] dark:text-zinc-100 stroke-[1.75]" />
                <h2 className="text-[17px] font-semibold text-[#222222] dark:text-zinc-100 leading-normal">
                  4. Mô tả chi tiết & Yêu cầu công việc
                </h2>
              </div>

              <div className="flex flex-col gap-2">
                <div className="relative w-full">
                  <textarea
                    id="event-description"
                    name="description"
                    rows={5}
                    required
                    placeholder="• Nhiệm vụ chính: Hướng dẫn check-in, phát thẻ đeo, hỗ trợ điều phối chỗ ngồi...&#10;• Yêu cầu: Đúng giờ, nhiệt tình, có trách nhiệm, ưu tiên sinh viên các trường ĐH tại Đà Nẵng...&#10;• Trang phục: Áo thun trắng/đen, quần dài tối màu, giày thể thao..."
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="w-full p-4 rounded-[8px] border border-[#a5a5a5] dark:border-zinc-700 bg-transparent text-[#222222] dark:text-zinc-100 text-[14px] focus:outline-none focus:border-[#222222] dark:focus:border-zinc-300 resize-y leading-relaxed transition placeholder-[#a5a5a5] dark:placeholder-zinc-500"
                  />
                  <label htmlFor="event-description" className="absolute -top-[12px] left-3 bg-white dark:bg-zinc-900 px-2 py-[1px] rounded-[30px] flex items-center gap-0.5 pointer-events-none select-none z-10">
                    <span className="font-['Inter'] font-medium text-[13px] text-[#222222] dark:text-zinc-200">
                      Nội dung mô tả, yêu cầu & lưu ý
                    </span>
                    <span className="font-semibold text-[#dc0000] text-[15px] leading-none">*</span>
                  </label>
                </div>
                <div className="flex items-center justify-between text-xs text-[#757575] dark:text-zinc-400 px-1">
                  <span>Nêu rõ trang phục, thời gian tập trung và các lưu ý đặc thù</span>
                  <span>{desc.length}/1000 ký tự</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e4e4e7] dark:border-zinc-800">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="h-[46px] px-6 rounded-[8px] border border-[#d1d5db] dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[#374151] dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 text-[15px] font-medium transition"
            >
              Hủy bỏ
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto min-w-[220px] h-[46px] px-8 rounded-[8px] bg-[#222222] hover:bg-black text-white dark:bg-white dark:text-[#222222] dark:hover:bg-zinc-100 text-[15px] font-semibold shadow-none transition-all flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
                Đang xử lý...
              </span>
            ) : editingId ? (
              "Lưu thay đổi sự kiện"
            ) : (
              "Lưu & Đăng sự kiện"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
