"use client"

import { Calendar, Clock, X, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface EventFormModalProps {
  showForm: boolean
  editingId: string | null
  resetForm: () => void
  handleSubmitEvent: (e: React.FormEvent) => void
  title: string
  setTitle: (val: string) => void
  location: string
  setLocation: (val: string) => void
  wardId: string
  setWardId: (val: string) => void
  wards: any[]
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
  loading: boolean
}

export default function EventFormModal({
  showForm,
  editingId,
  resetForm,
  handleSubmitEvent,
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
  startTime = "07:30",
  setStartTime,
  endTime = "17:00",
  setEndTime,
  salaryAmount = "200000",
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
  loading
}: EventFormModalProps) {
  const [positions, setPositions] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    if (showForm) {
      const loadDbData = async () => {
        const { data: posData } = await supabase.from('job_positions').select('name').order('name', { ascending: true })
        if (posData && posData.length > 0) {
          setPositions(posData.map(p => p.name))
        }
        const { data: catData } = await supabase.from('event_categories').select('name').order('name', { ascending: true })
        if (catData && catData.length > 0) {
          setCategories(catData.map(c => c.name))
        }
      }
      loadDbData()
    }
  }, [showForm])

  if (!showForm) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] border border-slate-200">
        <div className="bg-slate-50 p-6 flex items-center justify-between border-b border-slate-200 shrink-0">
          <h2 className="text-xl font-extrabold text-slate-900">
            {editingId ? "✏️ Chỉnh sửa sự kiện" : "✨ Tạo sự kiện & Tuyển nhân sự mới"}
          </h2>
          <button onClick={resetForm} aria-label="Đóng" className="p-2 text-slate-500 hover:text-slate-700 bg-white rounded-full border border-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitEvent} className="p-6 sm:p-8 space-y-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-2 sm:col-span-1">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-1"><MapPin className="w-4 h-4 text-slate-600" /> Phường / Xã (Đà Nẵng)</label>
              <select
                value={wardId}
                onChange={e => setWardId(e.target.value)}
                className="h-12 rounded-xl bg-slate-50 border border-slate-200 p-2 text-sm font-bold text-slate-700 w-full focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Chọn Phường/Xã --</option>
                {wards.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 sm:col-span-1">
              <label className="text-sm font-bold text-slate-700">Số nhà / Tên đường cụ thể</label>
              <Input placeholder="VD: 54 Nguyễn Lương Bằng..." value={location} onChange={e => setLocation(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-slate-200 text-slate-900 text-base font-medium focus-visible:ring-emerald-500" />
            </div>

            <div className="space-y-2 sm:col-span-1">
              <label className="text-sm font-bold text-slate-700">Tên sự kiện / Vị trí tuyển</label>
              <Input placeholder="VD: Tình nguyện viên Lễ hội âm nhạc..." value={title} onChange={e => setTitle(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-slate-200 text-slate-900 text-base font-medium focus-visible:ring-emerald-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-600" /> Ngày bắt đầu sự kiện
              </label>
              <Input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-slate-200 text-sm font-bold text-slate-700 focus-visible:ring-emerald-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" /> Ngày kết thúc (Tùy chọn)
              </label>
              <Input type="date" value={endDate} onChange={e => setEndDate && setEndDate(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-slate-200 text-sm font-bold text-slate-700 focus-visible:ring-emerald-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-destructive" /> Hạn chót đăng ký
              </label>
              <Input type="date" value={applicationDeadline} onChange={e => setApplicationDeadline(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-slate-200 text-sm font-bold text-slate-700 focus-visible:ring-emerald-500" />
            </div>
          </div>

          {/* Khung giờ ca làm việc */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" /> Giờ bắt đầu ca
              </label>
              <Input type="time" value={startTime} onChange={e => setStartTime && setStartTime(e.target.value)} className="h-11 rounded-xl bg-white border-slate-200 text-sm font-bold text-slate-700 focus-visible:ring-emerald-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" /> Giờ kết thúc ca
              </label>
              <Input type="time" value={endTime} onChange={e => setEndTime && setEndTime(e.target.value)} className="h-11 rounded-xl bg-white border-slate-200 text-sm font-bold text-slate-700 focus-visible:ring-emerald-500" />
            </div>
          </div>

          {/* Thù lao & Thanh toán */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/60">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800">💰 Mức thù lao (VNĐ)</label>
              <Input
                type="number"
                min="0"
                step="10000"
                placeholder="VD: 250000 (0 nếu TNV)"
                value={salaryAmount}
                onChange={e => setSalaryAmount && setSalaryAmount(e.target.value)}
                className="h-11 rounded-xl bg-white border-slate-200 text-slate-900 font-bold focus-visible:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800">Đơn vị tính thù lao</label>
              <select
                value={salaryType}
                onChange={e => setSalaryType && setSalaryType(e.target.value)}
                className="h-11 rounded-xl bg-white border border-slate-200 p-2 text-sm font-bold text-slate-700 w-full focus:outline-none focus:border-emerald-500"
              >
                <option value="per_shift">Theo ca làm việc</option>
                <option value="per_hour">Theo giờ (h)</option>
                <option value="per_event">Trọn gói sự kiện</option>
                <option value="volunteer">Tình nguyện viên (Không lương)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800">Hình thức chi trả</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod && setPaymentMethod(e.target.value)}
                className="h-11 rounded-xl bg-white border border-slate-200 p-2 text-sm font-bold text-slate-700 w-full focus:outline-none focus:border-emerald-500"
              >
                <option value="cash_after_event">Tiền mặt ngay sau sự kiện</option>
                <option value="bank_transfer">Chuyển khoản (1 - 3 ngày sau)</option>
              </select>
            </div>
          </div>

          {/* Kênh điều phối Zalo */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center justify-between">
              <span>💬 Link nhóm Zalo điều phối sự kiện</span>
              <span className="text-xs font-normal text-slate-500">(Chỉ ứng viên trúng tuyển mới thấy)</span>
            </label>
            <Input
              placeholder="VD: https://zalo.me/g/xxxxxx"
              value={zaloGroupLink}
              onChange={e => setZaloGroupLink && setZaloGroupLink(e.target.value)}
              className="h-12 rounded-xl bg-slate-50 border-slate-200 text-slate-900 text-sm font-medium focus-visible:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Vị trí tuyển nhân sự</label>
              <select value={positionType} onChange={e => setPositionType(e.target.value)} className="h-12 rounded-xl bg-slate-50 border border-slate-200 p-2 text-sm font-bold text-slate-700 w-full focus:outline-none focus:border-emerald-500">
                {positions.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Loại hình sự kiện</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="h-12 rounded-xl bg-slate-50 border border-slate-200 p-2 text-sm font-bold text-slate-700 w-full focus:outline-none focus:border-emerald-500">
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Số lượng cần tuyển</label>
              <Input type="number" min="1" value={slotsNeeded} onChange={e => setSlotsNeeded(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-slate-200 text-slate-900 text-base font-medium focus-visible:ring-emerald-500" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700">Quyền lợi / Phụ cấp (Chọn nhiều)</label>
            <div className="flex flex-wrap gap-2.5">
              {['Cấp chứng nhận', 'Có phụ cấp ăn uống', 'Hỗ trợ lương cứng', 'Thỏa thuận'].map(b => {
                const selectedBenefits = benefits ? benefits.split(",").map(x => x.trim()) : [];
                const isSelected = selectedBenefits.includes(b);

                const handleToggle = () => {
                  let newSelected;
                  if (isSelected) {
                    newSelected = selectedBenefits.filter(x => x !== b);
                  } else {
                    newSelected = [...selectedBenefits, b];
                  }
                  setBenefits(newSelected.join(","));
                };

                return (
                  <button
                    key={b}
                    type="button"
                    onClick={handleToggle}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${isSelected
                      ? "bg-slate-100 border-emerald-500 text-slate-600"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Chi tiết sự kiện & Yêu cầu cụ thể</label>
            <textarea placeholder="Nhập mô tả chi tiết..." value={desc} onChange={e => setDesc(e.target.value)} rows={5} className="w-full rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm font-medium focus:outline-none focus:border-emerald-500 resize-none whitespace-pre-wrap text-slate-900" />
          </div>
          <div className="flex justify-end pt-2 gap-3">
            <Button type="button" onClick={resetForm} variant="outline" className="rounded-xl font-bold h-12 px-6">Hủy</Button>
            <Button type="submit" disabled={loading} className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8">
              {loading ? "Đang xử lý..." : editingId ? "Lưu thay đổi" : "Xuất bản sự kiện"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}