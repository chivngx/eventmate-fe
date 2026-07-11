"use client"

import { useState, useEffect } from"react"
import { useParams, useNavigate } from"@/lib/router"
import { supabase } from"@/lib/supabase"
import { getUserFacingMessage } from"@/lib/error"
import { useUser } from"@/components/providers/AuthProvider"
import MainLayout from"@/components/layout/MainLayout"
import { MapPin, Calendar, CheckCircle, XCircle, Clock3, Bookmark, Briefcase, Tag, DollarSign, Users, ExternalLink } from"lucide-react"
import { Button } from"@/components/ui/button"
import { useToast } from"@/components/ui/ToastProvider"
import { SkeletonEventDetail } from"@/components/ui/Skeleton"

export default function EventDetail() {
 const { id } = useParams<{ id: string }>()
 const navigate = useNavigate()
 const { showToast } = useToast()
 // 🔒 P1.1: user + role từ context (thay getUser() + profiles.select lặp)
 const { user, role, loading: authLoading } = useUser()
 const [event, setEvent] = useState<any>(null)
 const [loading, setLoading] = useState(true)
 const [applyStatus, setApplyStatus] = useState<string | null>(null)
 const [isApplying, setIsApplying] = useState(false)
 const [isBookmarked, setIsBookmarked] = useState(false)

 useEffect(() => {
 if (authLoading) return
 const fetchEventDetails = async () => {
 setLoading(true)
 const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id ||"")
 let eventQuery = supabase
 .from("events")
 .select("*, profiles(id, full_name, avatar_url, slug, scale, address), danang_wards(name)")

 if (isUuid) {
 eventQuery = eventQuery.eq("id", id)
 } else {
 eventQuery = eventQuery.eq("slug", id)
 }

 const { data: eventData, error } = await eventQuery.maybeSingle()

 if (eventData) {
 setEvent(eventData)

 // Tự động chuyển hướng URL từ ID dạng UUID sang dạng Slug SEO thân thiện
 if (isUuid && eventData.slug) {
 navigate(`/jobs/${eventData.slug}`, { replace: true })
 }

 if (user) {
 if (role ==="student") {
 const { data: appData } = await supabase
 .from("applications")
 .select("status")
 .eq("event_id", eventData.id)
 .eq("student_id", user.id)
 .maybeSingle()

 if (appData) setApplyStatus(appData.status)

 const { data: bookmarkData } = await supabase
 .from("event_bookmarks")
 .select("id")
 .eq("event_id", eventData.id)
 .eq("student_id", user.id)
 .maybeSingle()

 if (bookmarkData) setIsBookmarked(true)
 }
 }
 } else {
 console.error("Lỗi hoặc không tìm thấy sự kiện", error)
 }
 setLoading(false)
 }

 fetchEventDetails()
 }, [id, user, role, authLoading, navigate])

 const handleApply = async () => {
 setIsApplying(true)

 if (!user) {
 window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode:"login" } }))
 return
 }

 const { error } = await supabase.from("applications").insert([
 { event_id: event.id, student_id: user.id }
 ])

 if (error) {
 showToast({ title:"Đã xảy ra lỗi", message: getUserFacingMessage(error,"Vui lòng thử lại."), type:"error" })
 } else {
 setApplyStatus('pending')
 showToast({ title:"Ứng tuyển thành công", message:"Đơn ứng tuyển của bạn đã được gửi. Vui lòng chờ BTC phê duyệt.", type:"success" })
 }
 setIsApplying(false)
 }

 const toggleBookmark = async () => {
 if (!user) {
 window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode:"login" } }))
 return
 }

 if (isBookmarked) {
 const { error } = await supabase
 .from("event_bookmarks")
 .delete()
 .eq("student_id", user.id)
 .eq("event_id", event.id)

 if (!error) {
 setIsBookmarked(false)
 showToast({ title:"Đã hủy lưu", message:"Đã hủy lưu tin tuyển dụng thành công.", type:"info" })
 }
 else showToast({ title:"Đã xảy ra lỗi", message: getUserFacingMessage(error,"Vui lòng thử lại."), type:"error" })
 } else {
 const { error } = await supabase
 .from("event_bookmarks")
 .insert([{ student_id: user.id, event_id: event.id }])

 if (!error) {
 setIsBookmarked(true)
 showToast({ title:"Đã lưu tin", message:"Đã lưu tin tuyển dụng thành công.", type:"success" })
 }
 else showToast({ title:"Đã xảy ra lỗi", message: getUserFacingMessage(error,"Vui lòng thử lại."), type:"error" })
 }
 }

 if (loading) return <SkeletonEventDetail />

 if (!event) return (
 <MainLayout role="guest">
 <div className="text-center py-20">
 <h2 className="text-2xl font-black text-slate-900">Không tìm thấy sự kiện</h2>
 <p className="text-slate-500 mt-2">Sự kiện này có thể đã bị xóa hoặc không tồn tại.</p>
 <Button onClick={() => navigate(-1)} className="mt-4 rounded-xl bg-slate-900 text-white">Quay lại</Button>
 </div>
 </MainLayout>
 )

 const isPastDeadline = event.application_deadline ? new Date() > new Date(event.application_deadline) : false;
 const disabledApply = isApplying || event.status !== 'upcoming';

 const renderApplyAction = () => {
 if (role !=="student") return null

 if (applyStatus === 'approved') {
 return (
 <button disabled className="job-detail_info--actions-button button-primary btn-apply-job flex items-center justify-center rounded-md font-semibold bg-emerald-100 border border-emerald-200 text-emerald-700 h-[40px] px-6">
 <CheckCircle className="w-4 h-4 mr-2" /> Trúng tuyển
 </button>
 )
 }
 if (applyStatus === 'rejected') {
 return (
 <button disabled className="job-detail_info--actions-button button-primary btn-apply-job flex items-center justify-center rounded-md font-semibold bg-rose-50 border border-rose-100 text-rose-500 h-[40px] px-6">
 <XCircle className="w-4 h-4 mr-2" /> Chưa phù hợp
 </button>
 )
 }
 if (applyStatus === 'pending') {
 return (
 <button disabled className="job-detail_info--actions-button button-primary btn-apply-job flex items-center justify-center rounded-md font-semibold bg-amber-50 border border-amber-100 text-amber-600 h-[40px] px-6">
 <Clock3 className="w-4 h-4 mr-2" /> Đang chờ duyệt
 </button>
 )
 }

 return (
 <button
 onClick={handleApply}
 disabled={disabledApply || isPastDeadline}
 className="job-detail_info--actions-button button-primary open-apply-modal btn-apply-job flex items-center justify-center bg-primary hover:bg-primary/90 text-white font-semibold font-sans rounded-md transition-all active:scale-95 disabled:opacity-50 h-[40px] px-6 text-sm flex-1 cursor-pointer"
 >
 {isApplying ?"Đang xử lý..." : isPastDeadline ?"Đã hết hạn nộp đơn" : event.status !== 'upcoming' ?"Đã đóng đăng ký" :"Ứng tuyển ngay"}
 </button>
 )
 }

 return (
 <MainLayout role={role ||"guest"}>
 <div className="max-w-6xl mx-auto pt-1 pb-6 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
 {/* Two Column Layout */}
 <div className="job-detail_body flex flex-col lg:flex-row gap-6 items-start">
 {/* Left Column (Width: approx 760px on large screen) */}
 <div className="job-detail_body-left flex-1 w-full lg:max-w-[760px] space-y-6">
 {/* Box 1: Header / General Summary */}
 <div id="header-job-info" className="job-detail_box job-detail_info bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
 <h1 className="job-detail_info--title text-xl md:text-2xl font-bold text-foreground leading-tight mb-4">
 {event.title}
 </h1>

 {/* Quick Info Grid */}
 <div className="job-detail_info--sections grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-5 pb-6">
 <div className="job-detail_info--section section-salary flex items-center gap-3">
 <div className="job-detail_info--section-icon w-9 h-9 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
 <DollarSign className="w-4 h-4 text-primary" />
 </div>
 <div>
 <p className="job-detail_info--section-content-title text-[12px] text-slate-400 font-medium">Quyền lợi / Lương</p>
 <p className="job-detail_info--section-content-value text-[13px] text-foreground font-semibold truncate max-w-[180px]" title={event.benefits ||"Thỏa thuận"}>
 {event.benefits ||"Thỏa thuận"}
 </p>
 </div>
 </div>
 <div className="job-detail_info--section section-location flex items-center gap-3">
 <div className="job-detail_info--section-icon w-9 h-9 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
 <MapPin className="w-4 h-4 text-primary" />
 </div>
 <div>
 <p className="job-detail_info--section-content-title text-[12px] text-slate-400 font-medium">Khu vực</p>
 <p className="job-detail_info--section-content-value text-[13px] text-foreground font-semibold truncate" title={event.danang_wards?.name ? `P. ${event.danang_wards.name}` :"Đà Nẵng"}>
 {event.danang_wards?.name ? `${event.danang_wards.name}` :"Đà Nẵng"}
 </p>
 </div>
 </div>
 <div className="job-detail_info--section section-eventdate flex items-center gap-3">
 <div className="job-detail_info--section-icon w-9 h-9 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
 <Calendar className="w-4 h-4 text-primary" />
 </div>
 <div>
 <p className="job-detail_info--section-content-title text-[12px] text-slate-400 font-medium">Ngày diễn ra</p>
 <p className="job-detail_info--section-content-value text-[13px] text-foreground font-semibold">
 {event.event_date ? new Date(event.event_date).toLocaleDateString('vi-VN') :"Đang cập nhật"}
 </p>
 </div>
 </div>
 </div>

 {/* Hạn chót nộp hồ sơ */}
 <div className="job-detail_info--flex flex items-center text-sm text-foreground gap-2 mt-4 mb-6">
 <div className="job-detail_info--deadline flex items-center gap-1 text-sm text-muted-foreground bg-slate-50 px-2.5 py-1.5 md:px-2 md:py-1 rounded">
 <span>Hạn nộp hồ sơ</span>
 </div>
 <div className="job-detail_info--deadline-date text-sm font-semibold text-foreground">
 {event.application_deadline ? new Date(event.application_deadline).toLocaleDateString('vi-VN') :"Không giới hạn"}
 </div>
 {event.application_deadline && (
 <span className="deadline text-sm font-semibold text-foreground">
 {(() => {
 const diff = new Date(event.application_deadline).getTime() - new Date().getTime();
 const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
 return diffDays > 0 ? `(Còn ${diffDays} ngày)` :"(Đã hết hạn)";
 })()}
 </span>
 )}
 </div>

 {/* Action Buttons Row */}
 <div className="job-detail_info--actions box-apply-current flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
 {renderApplyAction()}
 {role === 'student' && (
 <button
 id="save-job"
 onClick={toggleBookmark}
 className={`job-detail_info--actions-button button-white btn-save-job flex items-center justify-center rounded-md font-semibold font-sans h-[40px] px-6 border transition-all cursor-pointer ${isBookmarked
 ?"bg-primary border-primary text-white hover:bg-primary/90"
 :"bg-white border-primary text-primary hover:bg-primary/5"
 }`}
 >
 <Bookmark className={`w-4 h-4 mr-1.5 ${isBookmarked ?"fill-current" :""}`} />
 {isBookmarked ?"Đã lưu" :"Lưu tin"}
 </button>
 )}
 </div>
 </div>

 {/* Box 2: Job Description Box */}
 <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-6">
 <h2 className="text-lg font-bold text-foreground border-l-[4px] border-primary pl-3 leading-none flex items-center">
 Chi tiết tin tuyển dụng
 </h2>

 {/* Detailed Description */}
 <div className="space-y-4">
 <h3 className="text-[15px] font-bold text-foreground">Mô tả công việc</h3>
 <div className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
 {event.description ||"Chưa có mô tả chi tiết cho sự kiện này."}
 </div>
 </div>

 {/* Specific Location Details */}
 <div className="border-t border-slate-100 pt-5 space-y-3">
 <h3 className="text-[15px] font-bold text-foreground">Địa điểm làm việc cụ thể</h3>
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
 <div className="text-sm text-slate-700 font-medium flex items-center gap-2">
 <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
 <span>
 {event.location ? `${event.location}, ` :""}
 {event.danang_wards?.name ? `Phường ${event.danang_wards.name}, ` :""}
 Đà Nẵng
 </span>
 </div>
 <a
 href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((event.location ? event.location + ', ' : '') + (event.danang_wards?.name ? 'Phường ' + event.danang_wards.name + ', ' : '') + 'Đà Nẵng')}`}
 target="_blank"
 rel="noreferrer"
 className="text-xs font-bold text-primary bg-primary/5 px-3 py-2 rounded-lg border border-primary/20 inline-flex items-center gap-1.5 hover:bg-primary/10 transition-all hover:border-primary/30 shrink-0"
 >
 <MapPin className="w-3.5 h-3.5" />
 Xem vị trí trên Google Maps
 </a>
 </div>
 </div>
 </div>
 </div>

 {/* Right Column (Sidebar, Width: approx 350px on large screen) */}
 <div className="job-detail_body-right w-full lg:w-[350px] shrink-0 flex flex-col gap-6 items-center text-foreground text-sm leading-5">
 {/* Company Card */}
 <div
 className="job-detail_box right job-detail_company bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex flex-col gap-4 items-start text-foreground text-sm leading-5"
 >
 <div className="job-detail_company--information w-full flex flex-col gap-3">
 <div className="job-detail_company--information-item company-name flex items-start text-foreground text-[14px] gap-[16px] leading-[20px] mb-3">
 <div
 onClick={() => navigate(`/companies/${event.profiles?.slug || event.organizer_id}`)}
 className="company-logo flex items-center justify-center bg-white border border-muted rounded-lg border-[0.8px] text-primary text-sm leading-5 p-[7.04px] w-[88px] h-[88px] shrink-0 cursor-pointer"
 >
 <img
 src={event.profiles?.avatar_url ||"https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=88&h=88&q=80"}
 alt={event.profiles?.full_name}
 className="w-full h-full object-contain rounded"
 onError={(e: any) => {
 e.target.onerror = null;
 e.target.src ="https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=88&h=88&q=80";
 }}
 />
 </div>
 <div className="company-name-label flex flex-col gap-1 text-foreground text-sm leading-5 w-full">
 <a
 onClick={() => navigate(`/companies/${event.profiles?.slug || event.organizer_id}`)}
 className="name text-[14px] font-semibold text-foreground font-sans tracking-[-0.16px] leading-[24px] cursor-pointer hover:text-primary transition-colors"
 >
 {event.profiles?.full_name ||"Đơn vị ẩn danh"}
 </a>
 </div>
 </div>

 <div className="job-detail_company--information-item company-scale flex items-start text-foreground text-[14px] gap-[16px] leading-[20px] mb-2">
 <div className="company-title flex items-center gap-[8px] text-muted-foreground text-[14px] leading-[22px] tracking-[0.14px] w-[88px] shrink-0">
 <Users className="w-4 h-4 text-muted-foreground fill-none text-[14px] leading-[22px] tracking-[0.14px]" />
 <span>Quy mô:</span>
 </div>
 <div className="company-value text-foreground text-[14px] font-medium leading-[22px] tracking-[0.14px] w-full">
 {event.profiles?.scale ||"Chưa cập nhật"}
 </div>
 </div>

 <div className="job-detail_company--information-item company-address flex items-start text-foreground text-[14px] gap-[16px] leading-[20px] mb-2">
 <div className="company-title flex items-center gap-[8px] text-muted-foreground text-[14px] leading-[22px] tracking-[0.14px] w-[88px] shrink-0">
 <MapPin className="w-4 h-4 text-muted-foreground fill-none text-[14px] leading-[22px] tracking-[0.14px]" />
 <span>Địa điểm:</span>
 </div>
 <div className="company-value text-foreground text-[14px] font-medium leading-[22px] tracking-[0.14px] w-full">
 {event.profiles?.address ||"Chưa cập nhật"}
 </div>
 </div>
 </div>

 <div className="job-detail_company--link w-full flex justify-center text-foreground text-sm leading-5 mt-1">
 <a
 onClick={() => navigate(`/companies/${event.profiles?.slug || event.organizer_id}`)}
 className="flex items-center justify-center gap-2.5 text-primary text-[14px] font-semibold leading-[22px] tracking-[0.175px] font-sans hover:underline cursor-pointer"
 >
 Xem trang công ty
 <ExternalLink className="text-[15px] text-primary w-4 h-4 flex items-center justify-center leading-[20px] text-center shrink-0" />
 </a>
 </div>
 </div>


 {/* General Info Box */}
 <div className="job-detail_body-right--box-general bg-white rounded-lg border border-slate-200 p-5 shadow-sm text-foreground text-sm leading-5 w-full">
 <div className="box-title text-lg font-bold text-foreground mb-4">
 Thông tin chung
 </div>

 <div className="box-general-content flex flex-col gap-4 text-foreground text-sm leading-5 w-full">
 <div className="box-general-group flex items-center gap-4 text-foreground text-sm leading-5 w-full">
 <div className="box-general-group-icon flex items-center justify-center bg-muted rounded-xl p-2 text-foreground text-sm leading-5 w-10 h-10 shrink-0">
 <Briefcase className="w-5 h-5 text-foreground fill-none text-sm leading-5" />
 </div>
 <div className="box-general-group-info flex flex-col gap-1 text-foreground text-sm leading-5 w-full">
 <div className="box-general-group-info-title text-foreground text-[14px] tracking-[0.14px] leading-[22px] whitespace-nowrap">
 Vị trí tuyển
 </div>
 <div className="box-general-group-info-value text-foreground text-[14px] font-semibold tracking-[0.175px] leading-[22px] whitespace-nowrap">
 {event.position_type ||"Tình nguyện viên"}
 </div>
 </div>
 </div>

 <div className="box-general-group flex items-center gap-4 text-foreground text-sm leading-5 w-full">
 <div className="box-general-group-icon flex items-center justify-center bg-muted rounded-xl p-2 text-foreground text-sm leading-5 w-10 h-10 shrink-0">
 <Tag className="w-5 h-5 text-foreground fill-none text-sm leading-5" />
 </div>
 <div className="box-general-group-info flex flex-col gap-1 text-foreground text-sm leading-5 w-full">
 <div className="box-general-group-info-title text-foreground text-[14px] tracking-[0.14px] leading-[22px] whitespace-nowrap">
 Loại hình
 </div>
 <div className="box-general-group-info-value text-foreground text-[14px] font-semibold tracking-[0.175px] leading-[22px] whitespace-nowrap">
 {event.category ||"Chưa phân loại"}
 </div>
 </div>
 </div>

 <div className="box-general-group flex items-center gap-4 text-foreground text-sm leading-5 w-full">
 <div className="box-general-group-icon flex items-center justify-center bg-muted rounded-xl p-2 text-foreground text-sm leading-5 w-10 h-10 shrink-0">
 <Users className="w-5 h-5 text-foreground fill-none text-sm leading-5" />
 </div>
 <div className="box-general-group-info flex flex-col gap-1 text-foreground text-sm leading-5 w-full">
 <div className="box-general-group-info-title text-foreground text-[14px] tracking-[0.14px] leading-[22px] whitespace-nowrap">
 Số lượng tuyển
 </div>
 <div className="box-general-group-info-value text-foreground text-[14px] font-semibold tracking-[0.175px] leading-[22px] whitespace-nowrap">
 {event.slots_needed || 1} nhân sự
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </MainLayout>
 )
}