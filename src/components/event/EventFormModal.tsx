"use client"

import { Calendar, Clock, X, MapPin } from"lucide-react"
import { Button } from"@/components/ui/button"
import { Input } from"@/components/ui/input"
import { useState, useEffect } from"react"
import { supabase } from"@/lib/supabase"

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
 {editingId ?"✏️ Chỉnh sửa sự kiện" :"✨ Tạo sự kiện & Tuyển nhân sự mới"}
 </h2>
 <button onClick={resetForm} aria-label="Đóng" className="p-2 text-slate-500 hover:text-slate-700 bg-white rounded-full border border-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40">
 <X className="w-5 h-5" />
 </button>
 </div>

 <form onSubmit={handleSubmitEvent} className="p-6 sm:p-8 space-y-5 overflow-y-auto flex-1">
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
 <div className="space-y-2 sm:col-span-1">
 <label className="text-sm font-bold text-slate-700 flex items-center gap-1"><MapPin className="w-4 h-4 text-primary" /> Phường / Xã (Đà Nẵng)</label>
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

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
 <Calendar className="w-4 h-4 text-primary" /> Ngày diễn ra sự kiện
 </label>
 <Input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-slate-200 text-sm font-bold text-slate-700 focus-visible:ring-emerald-500" />
 </div>
 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
 <Clock className="w-4 h-4 text-destructive" /> Hạn chót đăng ký
 </label>
 <Input type="date" value={applicationDeadline} onChange={e => setApplicationDeadline(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-slate-200 text-sm font-bold text-slate-700 focus-visible:ring-emerald-500" />
 </div>
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
 className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
 isSelected
 ?"bg-accent border-emerald-500 text-primary"
 :"bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
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
 <Button type="submit" disabled={loading} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-8">
 {loading ?"Đang xử lý..." : editingId ?"Lưu thay đổi" :"Xuất bản sự kiện"}
 </Button>
 </div>
 </form>
 </div>
 </div>
 )
}