import { Calendar, Clock, X, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface EventFormModalProps {
  showForm: boolean
  editingId: string | null
  resetForm: () => void
  handleSubmitEvent: (e: React.FormEvent) => void
  title: string
  setTitle: (val: string) => void
  location: string
  setLocation: (val: string) => void
  wardId: string               // [MỚI] Nhận ID Phường Xã từ hook
  setWardId: (val: string) => void
  wards: any[]                 // [MỚI] Nhận danh sách toàn bộ xã phường Đà Nẵng
  eventDate: string
  setEventDate: (val: string) => void
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
  if (!showForm) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="bg-slate-50 p-6 flex items-center justify-between border-b border-slate-100 shrink-0">
          <h2 className="text-xl font-extrabold text-slate-900">
            {editingId ? "✏️ Chỉnh sửa sự kiện" : "✨ Tạo sự kiện & Tuyển dụng mới"}
          </h2>
          <button onClick={resetForm} className="p-2 text-slate-400 hover:text-slate-800 bg-white rounded-full border border-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitEvent} className="p-6 sm:p-8 space-y-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-2 sm:col-span-1">
              {/* ĐÃ SỬA: Biến địa điểm tổ chức thành Dropdown danh mục hiển thị toàn bộ xã/phường Đà Nẵng */}
              <label className="text-sm font-bold text-slate-700 flex items-center gap-1"><MapPin className="w-4 h-4 text-emerald-600" /> Phường / Xã (Đà Nẵng)</label>
              <select
                value={wardId}
                onChange={e => setWardId(e.target.value)}
                className="h-12 rounded-xl bg-slate-50 border-2 border-slate-100 p-2 text-sm font-bold text-slate-700 w-full focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Chọn Phường/Xã --</option>
                {wards.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 sm:col-span-1">
              <label className="text-sm font-bold text-slate-700">Số nhà / Tên đường cụ thể</label>
              <Input placeholder="VD: 54 Nguyễn Lương Bằng..." value={location} onChange={e => setLocation(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-slate-200 text-base font-medium focus-visible:ring-emerald-500" />
            </div>

            <div className="space-y-2 sm:col-span-1">
              <label className="text-sm font-bold text-slate-700">Tên sự kiện / Vị trí tuyển</label>
              <Input placeholder="VD: Tình nguyện viên Lễ hội âm nhạc..." value={title} onChange={e => setTitle(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-slate-200 text-base font-medium focus-visible:ring-emerald-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" /> Ngày diễn ra sự kiện
              </label>
              <Input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-slate-200 text-sm font-bold text-slate-700 focus-visible:ring-emerald-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-rose-500" /> Hạn chót nộp đơn (Ngày hết hạn)
              </label>
              <Input type="date" value={applicationDeadline} onChange={e => setApplicationDeadline(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-slate-200 text-sm font-bold text-slate-700 focus-visible:ring-emerald-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Vị trí tuyển dụng</label>
              <select value={positionType} onChange={e => setPositionType(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-2 border-slate-100 p-2 text-sm font-bold text-slate-700 w-full focus:outline-none focus:border-emerald-500">
                {['Tình nguyện viên', 'Điều phối viên (Coordinator)', 'CTV Truyền thông', 'Hậu cần & Setup', 'MC / Hoạt náo viên', 'Hỗ trợ khách mời'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Loại hình sự kiện</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-2 border-slate-100 p-2 text-sm font-bold text-slate-700 w-full focus:outline-none focus:border-emerald-500">
                {['Lễ hội Âm nhạc', 'Hội thảo / Workshop', 'Giải đấu Thể thao', 'Giao lưu Văn hóa', 'Triển lãm / Hội chợ', 'Sự kiện Công nghệ'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Quyền lợi / Phụ cấp</label>
              <select value={benefits} onChange={e => setBenefits(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-2 border-slate-100 p-2 text-sm font-bold text-slate-700 w-full focus:outline-none focus:border-emerald-500">
                {['Cấp chứng nhận', 'Có phụ cấp ăn uống', 'Hỗ trợ lương cứng', 'Thỏa thuận'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Số lượng cần tuyển</label>
              <Input type="number" min="1" value={slotsNeeded} onChange={e => setSlotsNeeded(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-slate-200 text-base font-medium focus-visible:ring-emerald-500" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Mô tả công việc & Yêu cầu cụ thể</label>
            <textarea placeholder="Nhập mô tả chi tiết..." value={desc} onChange={e => setDesc(e.target.value)} rows={5} className="w-full rounded-xl bg-slate-50 border-2 border-slate-200 p-4 text-sm font-medium focus:outline-none focus:border-emerald-500 resize-none whitespace-pre-wrap" />
          </div>
          <div className="flex justify-end pt-2 gap-3">
            <Button type="button" onClick={resetForm} variant="outline" className="rounded-xl font-bold h-12 px-6">Hủy</Button>
            <Button type="submit" disabled={loading} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-8">
              {loading ? "Đang xử lý..." : editingId ? "Lưu thay đổi" : "Xuất bản sự kiện"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}