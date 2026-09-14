"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "@/lib/router"
import { supabase } from "@/lib/supabase"
import { getUserFacingMessage } from "@/lib/error"
import { useUser } from "@/components/providers/AuthProvider"
import MainLayout from "@/components/layout/MainLayout"
import { MapPin, Calendar, CheckCircle, XCircle, Clock3, Bookmark, DollarSign, Users, ExternalLink, Building2, Banknote, Clock, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { useToast } from "@/components/ui/ToastProvider"
import { SkeletonEventDetail } from "@/components/ui/Skeleton"

export default function EventDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { showToast } = useToast()
    // 🔒 P1.1: user + role từ context (thay getUser() + profiles.select lặp)
    const { user, role, profile, loading: authLoading } = useUser()
    const [event, setEvent] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [applyStatus, setApplyStatus] = useState<string | null>(null)
    const [isApplying, setIsApplying] = useState(false)
    const [isBookmarked, setIsBookmarked] = useState(false)

    // Modal đăng ký & thông tin sự kiện
    const [showApplyModal, setShowApplyModal] = useState(false)
    const [studentNote, setStudentNote] = useState("")
    const [shirtSize, setShirtSize] = useState("M")
    const [zaloPhone, setZaloPhone] = useState("")

    useEffect(() => {
        if (authLoading) return
        const fetchEventDetails = async () => {
            setLoading(true)
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || "")
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
                    if (role === "student") {
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

    const handleApply = () => {
        if (!user) {
            window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode: "login" } }))
            return
        }
        setShirtSize(profile?.shirt_size || "M")
        setZaloPhone(profile?.zalo_phone || profile?.phone || "")
        setShowApplyModal(true)
    }

    const handleConfirmApply = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !event) return
        setIsApplying(true)

        // Cập nhật profile nếu user nhập size áo hoặc số zalo
        if (shirtSize || zaloPhone) {
            await supabase
                .from("profiles")
                .update({
                    shirt_size: shirtSize,
                    zalo_phone: zaloPhone || null
                })
                .eq("id", user.id)
        }

        const { error } = await supabase.from("applications").insert([
            {
                event_id: event.id,
                student_id: user.id,
                student_note: studentNote ? studentNote.trim() : null
            }
        ])

        if (error) {
            showToast({ title: "Đã xảy ra lỗi", message: getUserFacingMessage(error, "Vui lòng thử lại."), type: "error" })
        } else {
            setApplyStatus('pending')
            setShowApplyModal(false)
            showToast({ title: "Đăng ký thành công", message: "Đơn đăng ký của bạn đã được gửi. Vui lòng chờ BTC phê duyệt.", type: "success" })
        }
        setIsApplying(false)
    }

    const toggleBookmark = async () => {
        if (!user) {
            window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode: "login" } }))
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
                showToast({ title: "Đã hủy lưu", message: "Đã hủy lưu sự kiện thành công.", type: "info" })
            }
            else showToast({ title: "Đã xảy ra lỗi", message: getUserFacingMessage(error, "Vui lòng thử lại."), type: "error" })
        } else {
            const { error } = await supabase
                .from("event_bookmarks")
                .insert([{ student_id: user.id, event_id: event.id }])

            if (!error) {
                setIsBookmarked(true)
                showToast({ title: "Đã lưu tin", message: "Đã lưu sự kiện thành công.", type: "success" })
            }
            else showToast({ title: "Đã xảy ra lỗi", message: getUserFacingMessage(error, "Vui lòng thử lại."), type: "error" })
        }
    }

    if (loading) return <SkeletonEventDetail />

    if (!event) return (
        <MainLayout role="guest">
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-slate-900">Không tìm thấy sự kiện</h2>
                <p className="text-slate-500 mt-2">Sự kiện này có thể đã bị xóa hoặc không tồn tại.</p>
                <Button onClick={() => navigate(-1)} className="mt-4 rounded-xl bg-slate-900 text-white">Quay lại</Button>
            </div>
        </MainLayout>
    )

    const isPastDeadline = event.application_deadline ? new Date() > new Date(event.application_deadline) : false;
    const disabledApply = isApplying || event.status !== 'upcoming';

    const renderApplyAction = () => {
        if (role !== "student") return null

        if (applyStatus === 'approved') {
            return (
                <button disabled className="flex items-center justify-center rounded-lg font-semibold bg-slate-100 border border-slate-200 text-slate-600 h-10 px-6 text-sm">
                    <CheckCircle className="w-4 h-4 mr-2" /> Trúng tuyển
                </button>
            )
        }
        if (applyStatus === 'rejected') {
            return (
                <button disabled className="flex items-center justify-center rounded-lg font-semibold bg-destructive/10 border border-destructive/20 text-destructive h-10 px-6 text-sm">
                    <XCircle className="w-4 h-4 mr-2" /> Chưa phù hợp
                </button>
            )
        }
        if (applyStatus === 'pending') {
            return (
                <button disabled className="flex items-center justify-center rounded-lg font-semibold bg-slate-100 border border-slate-200 text-slate-600 h-10 px-6 text-sm">
                    <Clock3 className="w-4 h-4 mr-2" /> Đang chờ duyệt
                </button>
            )
        }

        return (
            <button
                onClick={handleApply}
                disabled={disabledApply || isPastDeadline}
                className="flex items-center justify-center bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed h-10 px-6 text-sm flex-1 cursor-pointer"
            >
                {isApplying ? "Đang xử lý..." : isPastDeadline ? "Đã hết hạn đăng ký" : event.status !== 'upcoming' ? "Đã đóng đăng ký" : "Đăng ký tham gia"}
            </button>
        )
    }

    const formatSalary = (amount: number | null, type: string | null) => {
        if (!amount) return "Thỏa thuận"
        const formatted = amount.toLocaleString("vi-VN") + "đ"
        switch (type) {
            case "per_hour": return `${formatted}/giờ`
            case "per_shift": return `${formatted}/ca`
            case "per_event": return `${formatted}/sự kiện`
            case "volunteer": return "Tình nguyện"
            default: return formatted
        }
    }

    const formatShiftTime = (startTime: string | null, endTime: string | null) => {
        if (!startTime && !endTime) return null
        const start = startTime ? startTime.slice(0, 5) : ""
        const end = endTime ? endTime.slice(0, 5) : ""
        return `${start} - ${end}`
    }

    return (
        <MainLayout role={role || "guest"}>
            <div className="max-w-5xl mx-auto pb-8 animate-in fade-in slide-in-from-bottom-3 duration-300">

                {/* APPROVED STUDENT: Zalo coordination banner */}
                {applyStatus === 'approved' && event.zalo_group_link && (
                    <div className="mb-5 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm sm:text-base font-bold text-emerald-950">
                                    🎉 Bạn đã trúng tuyển! Hãy tham gia nhóm Zalo điều phối sự kiện
                                </h3>
                                <p className="text-xs sm:text-sm text-emerald-700 mt-0.5">
                                    Nhận phân công vị trí, hướng dẫn đồng phục và điểm danh vào ngày diễn ra sự kiện.
                                </p>
                            </div>
                        </div>
                        <a
                            href={event.zalo_group_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm shrink-0"
                        >
                            Vào nhóm Zalo <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                )}

                {/* EVENT HERO — title + date prominent + status badge */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 mb-5">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        {/* Date block — event ticket style */}
                        <div className="flex flex-col items-center justify-center w-16 shrink-0 bg-primary text-white rounded-xl py-2">
                            {event.event_date ? (
                                <>
                                    <span className="text-xl font-extrabold leading-none">
                                        {new Date(event.event_date).getDate()}
                                    </span>
                                    <span className="text-xs font-bold uppercase mt-0.5">
                                        Th{new Date(event.event_date).getMonth() + 1}
                                    </span>
                                </>
                            ) : (
                                <Calendar className="w-6 h-6 my-1" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                {event.category && (
                                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{event.category}</span>
                                )}
                                {event.position_type && (
                                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{event.position_type}</span>
                                )}
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${event.status === 'upcoming' ? 'bg-slate-100 text-slate-600' :
                                        event.status === 'ongoing' ? 'bg-slate-100 text-slate-600' :
                                            'bg-slate-100 text-slate-500'
                                    }`}>
                                    {event.status === 'upcoming' ? 'Đang mở đăng ký' : event.status === 'ongoing' ? 'Đang diễn ra' : 'Đã kết thúc'}
                                </span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight mb-2">
                                {event.title}
                            </h1>
                            <button
                                onClick={() => navigate(`/companies/${event.profiles?.slug || event.organizer_id}`)}
                                className="text-sm text-slate-500 hover:text-slate-900 transition-colors inline-flex items-center gap-1.5"
                            >
                                <Building2 className="w-4 h-4" />
                                {event.profiles?.full_name || "Đơn vị ẩn danh"}
                            </button>
                        </div>
                    </div>

                    {/* Quick info grid — 6 cols responsive */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-5 border-t border-slate-100">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                <MapPin className="w-4 h-4 text-slate-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500">Khu vực</p>
                                <p className="text-sm font-semibold text-foreground truncate">{event.danang_wards?.name || "Đà Nẵng"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                <Calendar className="w-4 h-4 text-slate-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500">Ngày diễn ra</p>
                                <p className="text-sm font-semibold text-foreground truncate">
                                    {event.event_date ? new Date(event.event_date).toLocaleDateString('vi-VN') : "Đang cập nhật"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                <Clock className="w-4 h-4 text-slate-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500">Ca làm việc</p>
                                <p className="text-sm font-semibold text-foreground truncate">
                                    {formatShiftTime(event.start_time, event.end_time) || "Theo lịch"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                <Banknote className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500">Thù lao</p>
                                <p className="text-sm font-semibold text-emerald-600 truncate" title={formatSalary(event.salary_amount, event.salary_type)}>
                                    {formatSalary(event.salary_amount, event.salary_type)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                <DollarSign className="w-4 h-4 text-slate-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500">Thanh toán</p>
                                <p className="text-sm font-semibold text-foreground truncate" title={event.payment_method === 'cash_after_event' ? 'Tiền mặt cuối buổi' : event.payment_method === 'bank_transfer' ? 'Chuyển khoản' : (event.benefits || "Thỏa thuận")}>
                                    {event.payment_method === 'cash_after_event' ? 'Tiền mặt cuối buổi' : event.payment_method === 'bank_transfer' ? 'Chuyển khoản' : (event.benefits || "Thỏa thuận")}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                <Users className="w-4 h-4 text-slate-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500">Số lượng</p>
                                <p className="text-sm font-semibold text-foreground">{event.slots_needed || 1} vị trí</p>
                            </div>
                        </div>
                    </div>

                    {/* Deadline + actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5 pt-5 border-t border-slate-100">
                        <div className="text-sm text-slate-500 flex items-center gap-2">
                            <Clock3 className="w-4 h-4" />
                            <span>Hạn đăng ký: </span>
                            <span className="font-semibold text-foreground">
                                {event.application_deadline ? new Date(event.application_deadline).toLocaleDateString('vi-VN') : "Không giới hạn"}
                            </span>
                            {event.application_deadline && (() => {
                                const diff = new Date(event.application_deadline).getTime() - Date.now()
                                const days = Math.ceil(diff / 86400000)
                                return days > 0 ? <span className="text-slate-600 font-semibold">({days} ngày nữa)</span> : null
                            })()}
                        </div>
                        <div className="flex items-center gap-2">
                            {renderApplyAction()}
                            {role === 'student' && (
                                <button
                                    onClick={toggleBookmark}
                                    aria-label={isBookmarked ? "Bỏ lưu" : "Lưu sự kiện"}
                                    className={`flex items-center justify-center rounded-lg font-semibold h-10 px-5 border transition-all cursor-pointer ${isBookmarked ? "bg-primary border-primary text-white hover:bg-primary/90" : "bg-white border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-900"
                                        }`}
                                >
                                    <Bookmark className={`w-4 h-4 mr-1.5 ${isBookmarked ? "fill-current" : ""}`} />
                                    {isBookmarked ? "Đã lưu" : "Lưu"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT — 2 col: description (2/3) + sidebar (1/3) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* Left: description + location */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Description */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7">
                            <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2.5">
                                <span className="w-1 h-5 bg-slate-300 rounded-full"></span>
                                Chi tiết sự kiện
                            </h2>
                            <div className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {event.description || "Chưa có mô tả chi tiết cho sự kiện này."}
                            </div>
                        </div>

                        {/* Location */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7">
                            <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2.5">
                                <span className="w-1 h-5 bg-slate-300 rounded-full"></span>
                                Địa điểm tổ chức
                            </h2>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 sm:p-5 rounded-xl">
                                <div className="flex items-start gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                        <MapPin className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-slate-500 mb-0.5">Địa chỉ</p>
                                        <p className="text-sm font-semibold text-foreground leading-snug">
                                            {event.location ? `${event.location}, ` : ""}
                                            {event.danang_wards?.name ? `${event.danang_wards.name}, ` : ""}
                                            Đà Nẵng
                                        </p>
                                    </div>
                                </div>
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((event.location || '') + ' Đà Nẵng')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs font-semibold text-slate-600 bg-white px-3 py-2 rounded-lg border border-slate-200 inline-flex items-center gap-1.5 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0"
                                >
                                    <MapPin className="w-3.5 h-3.5" />
                                    Xem trên Google Maps
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Right: organizer card + info */}
                    <div className="space-y-5">
                        {/* Organizer */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Đơn vị tổ chức</h2>
                            <div
                                onClick={() => navigate(`/companies/${event.profiles?.slug || event.organizer_id}`)}
                                className="flex items-start gap-3 cursor-pointer"
                            >
                                <div className="w-14 h-14 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                                    <img
                                        src={event.profiles?.avatar_url || "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=120&h=120&q=80"}
                                        alt={event.profiles?.full_name}
                                        className="w-full h-full object-cover"
                                        onError={(e: any) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=120&h=120&q=80" }}
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-foreground hover:text-slate-900 transition-colors truncate">
                                        {event.profiles?.full_name || "Đơn vị ẩn danh"}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                                        <Users className="w-3 h-3 shrink-0" /> {event.profiles?.scale || "Chưa cập nhật"}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 truncate">
                                        <MapPin className="w-3 h-3 shrink-0" /> {event.profiles?.address || "Chưa cập nhật"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(`/companies/${event.profiles?.slug || event.organizer_id}`)}
                                className="w-full mt-4 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2.5 inline-flex items-center justify-center gap-1.5 transition-colors"
                            >
                                Xem trang ban tổ chức <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal ứng tuyển sự kiện */}
            <Modal
                isOpen={showApplyModal}
                onClose={() => setShowApplyModal(false)}
                titleId="apply-modal-title"
                maxWidthClassName="max-w-lg"
            >
                <div className="p-6">
                    <h2 id="apply-modal-title" className="text-lg font-bold text-slate-900 mb-1">
                        Ứng tuyển sự kiện
                    </h2>
                    <p className="text-xs text-slate-500 mb-5 truncate">
                        {event.title}
                    </p>

                    <form onSubmit={handleConfirmApply} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Số điện thoại / Zalo nhận liên hệ <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="tel"
                                required
                                value={zaloPhone}
                                onChange={(e) => setZaloPhone(e.target.value)}
                                placeholder="VD: 0905123456"
                                className="w-full h-10 px-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                            <p className="text-[11px] text-slate-400 mt-1">
                                Dùng để BTC add vào nhóm điều phối hoặc thông báo trúng tuyển.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Size áo đồng phục
                                </label>
                                <select
                                    value={shirtSize}
                                    onChange={(e) => setShirtSize(e.target.value)}
                                    className="w-full h-10 px-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                                >
                                    <option value="S">Size S (Dưới 50kg)</option>
                                    <option value="M">Size M (50 - 60kg)</option>
                                    <option value="L">Size L (60 - 70kg)</option>
                                    <option value="XL">Size XL (70 - 80kg)</option>
                                    <option value="XXL">Size XXL (Trên 80kg)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Thù lao dự kiến
                                </label>
                                <div className="h-10 px-3 text-sm rounded-lg bg-slate-50 border border-slate-200 flex items-center font-medium text-emerald-600 truncate">
                                    {formatSalary(event.salary_amount, event.salary_type)}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Lời nhắn cho Ban tổ chức
                            </label>
                            <textarea
                                rows={3}
                                value={studentNote}
                                onChange={(e) => setStudentNote(e.target.value)}
                                placeholder="Kinh nghiệm sự kiện đã từng làm, ca muốn đăng ký, hoặc câu hỏi cho BTC..."
                                className="w-full p-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                            />
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setShowApplyModal(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={isApplying}
                                className="px-5 py-2 text-sm font-semibold bg-primary hover:bg-primary/90 text-white rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                            >
                                {isApplying ? "Đang gửi..." : "Xác nhận nộp đơn"}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </MainLayout>
    )
}