import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import MainLayout from "@/components/layout/MainLayout"
import { ArrowLeft, MapPin, Calendar, CheckCircle, XCircle, Clock3, Bookmark, Briefcase, Tag, DollarSign, Users, Hourglass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function EventDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [event, setEvent] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [role, setRole] = useState<string>("guest")
    const [applyStatus, setApplyStatus] = useState<string | null>(null)
    const [isApplying, setIsApplying] = useState(false)
    const [isBookmarked, setIsBookmarked] = useState(false)

    useEffect(() => {
        const fetchEventDetails = async () => {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
                if (profile) setRole(profile.role)

                if (profile?.role === "student") {
                    const { data: appData } = await supabase
                        .from("applications")
                        .select("status")
                        .eq("event_id", id)
                        .eq("student_id", user.id)
                        .maybeSingle()

                    if (appData) setApplyStatus(appData.status)

                    const { data: bookmarkData } = await supabase
                        .from("event_bookmarks")
                        .select("id")
                        .eq("event_id", id)
                        .eq("student_id", user.id)
                        .maybeSingle()

                    if (bookmarkData) setIsBookmarked(true)
                }
            }

            const { data: eventData, error } = await supabase
                .from("events")
                .select("*, profiles(full_name, avatar_url), danang_wards(name)")
                .eq("id", id)
                .maybeSingle()

            if (eventData) {
                setEvent(eventData)
            } else {
                console.error("Lỗi hoặc không tìm thấy sự kiện", error)
            }
            setLoading(false)
        }

        fetchEventDetails()
    }, [id])

    const handleApply = async () => {
        setIsApplying(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode: "login" } }))
            return
        }

        const { error } = await supabase.from("applications").insert([
            { event_id: id, student_id: user.id }
        ])

        if (error) {
            alert("Lỗi: " + error.message)
        } else {
            setApplyStatus('pending')
            alert("Ứng tuyển thành công! Vui lòng chờ BTC duyệt.")
        }
        setIsApplying(false)
    }

    const toggleBookmark = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode: "login" } }))
            return
        }

        if (isBookmarked) {
            const { error } = await supabase
                .from("event_bookmarks")
                .delete()
                .eq("student_id", user.id)
                .eq("event_id", id)

            if (!error) setIsBookmarked(false)
            else alert("Lỗi khi hủy lưu việc làm: " + error.message)
        } else {
            const { error } = await supabase
                .from("event_bookmarks")
                .insert([{ student_id: user.id, event_id: id }])

            if (!error) setIsBookmarked(true)
            else alert("Lỗi khi lưu việc làm: " + error.message)
        }
    }

    if (loading) return (
        <MainLayout role="guest">
            <div className="flex justify-center items-center py-20 text-slate-500 font-medium">Đang tải chi tiết sự kiện...</div>
        </MainLayout>
    )

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
        if (role !== "student") return null

        if (applyStatus === 'approved') {
            return (
                <Button disabled className="rounded-md bg-emerald-100 text-emerald-700 font-bold h-11 border border-emerald-200 px-6">
                    <CheckCircle className="w-4 h-4 mr-2" /> Trúng tuyển
                </Button>
            )
        }
        if (applyStatus === 'rejected') {
            return (
                <Button disabled className="rounded-md bg-rose-50 text-rose-500 font-bold h-11 border border-rose-100 px-6">
                    <XCircle className="w-4 h-4 mr-2" /> Chưa phù hợp
                </Button>
            )
        }
        if (applyStatus === 'pending') {
            return (
                <Button disabled className="rounded-md bg-amber-50 text-amber-600 font-bold h-11 border border-amber-100 px-6">
                    <Clock3 className="w-4 h-4 mr-2" /> Đang chờ duyệt
                </Button>
            )
        }

        return (
            <Button
                onClick={handleApply}
                disabled={disabledApply || isPastDeadline}
                className="rounded-md bg-[#00b14f] hover:bg-[#009a44] text-white font-bold h-11 px-8 transition-transform active:scale-95 shadow-sm disabled:opacity-50"
            >
                {isApplying ? "Đang xử lý..." : isPastDeadline ? "Đã hết hạn nộp đơn" : event.status !== 'upcoming' ? "Đã đóng đăng ký" : "Ứng tuyển ngay"}
            </Button>
        )
    }

    return (
        <MainLayout role={role}>
            <div className="max-w-6xl mx-auto py-6 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Back button */}
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 mb-6 transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Quay lại
                </button>

                {/* Two Column Layout */}
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Left Column (Width: approx 760px on large screen) */}
                    <div className="flex-1 w-full lg:max-w-[760px] space-y-6">
                        {/* Box 1: Header / General Summary */}
                        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                            <h1 className="text-xl md:text-2xl font-bold text-[#263a4d] leading-tight mb-2">
                                {event.title}
                            </h1>
                            <div className="text-sm font-semibold text-slate-600 hover:text-[#00b14f] cursor-pointer transition-colors mb-5">
                                {event.profiles?.full_name || "Đơn vị ẩn danh"}
                            </div>

                            {/* Quick Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-5 pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-[#00b14f]/5 flex items-center justify-center shrink-0">
                                        <DollarSign className="w-4 h-4 text-[#00b14f]" />
                                    </div>
                                    <div>
                                        <p className="text-[12px] text-slate-400 font-medium">Quyền lợi / Lương</p>
                                        <p className="text-[13px] text-[#212f3f] font-semibold truncate max-w-[180px]" title={event.benefits || "Thỏa thuận"}>
                                            {event.benefits || "Thỏa thuận"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-[#00b14f]/5 flex items-center justify-center shrink-0">
                                        <MapPin className="w-4 h-4 text-[#00b14f]" />
                                    </div>
                                    <div>
                                        <p className="text-[12px] text-slate-400 font-medium">Khu vực</p>
                                        <p className="text-[13px] text-[#212f3f] font-semibold truncate" title={event.danang_wards?.name ? `P. ${event.danang_wards.name}` : "Đà Nẵng"}>
                                            {event.danang_wards?.name ? `P. ${event.danang_wards.name}` : "Đà Nẵng"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-[#00b14f]/5 flex items-center justify-center shrink-0">
                                        <Calendar className="w-4 h-4 text-[#00b14f]" />
                                    </div>
                                    <div>
                                        <p className="text-[12px] text-slate-400 font-medium">Ngày diễn ra</p>
                                        <p className="text-[13px] text-[#212f3f] font-semibold">
                                            {event.event_date ? new Date(event.event_date).toLocaleDateString('vi-VN') : "Đang cập nhật"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Hạn chót nộp hồ sơ */}
                            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-100 text-xs font-semibold text-slate-500 mb-6">
                                <Hourglass className="w-4 h-4 text-slate-400" />
                                <span>Hạn chót nộp hồ sơ: </span>
                                <span className={`font-bold ${isPastDeadline ? 'text-rose-500' : 'text-[#212f3f]'}`}>
                                    {event.application_deadline ? new Date(event.application_deadline).toLocaleDateString('vi-VN') : "Không giới hạn"}
                                </span>
                            </div>

                            {/* Action Buttons Row */}
                            <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
                                {renderApplyAction()}
                                {role === 'student' && (
                                    <Button
                                        onClick={toggleBookmark}
                                        variant="outline"
                                        className={`rounded-md font-bold h-11 px-6 border transition-all ${
                                            isBookmarked
                                                ? "bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100"
                                                : "border-[#99e0b9] text-[#00b14f] hover:bg-[#00b14f]/5 hover:text-[#00b14f]"
                                        }`}
                                    >
                                        <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? "fill-current" : ""}`} />
                                        {isBookmarked ? "Đã lưu" : "Lưu tin"}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Box 2: Job Description Box */}
                        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-6">
                            <h2 className="text-lg font-bold text-[#212f3f] border-l-[4px] border-[#00b14f] pl-3 leading-none flex items-center">
                                Chi tiết tin tuyển dụng
                            </h2>

                            {/* Detailed Description */}
                            <div className="space-y-4">
                                <h3 className="text-[15px] font-bold text-[#212f3f]">Mô tả công việc</h3>
                                <div className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                                    {event.description || "Chưa có mô tả chi tiết cho sự kiện này."}
                                </div>
                            </div>

                            {/* Specific Location Details */}
                            <div className="border-t border-slate-100 pt-5 space-y-3">
                                <h3 className="text-[15px] font-bold text-[#212f3f]">Địa điểm làm việc cụ thể</h3>
                                <div className="text-sm text-slate-700 font-medium">
                                    {event.location ? `${event.location}, ` : ""}
                                    {event.danang_wards?.name ? `Phường ${event.danang_wards.name}, ` : ""}
                                    Đà Nẵng
                                </div>
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((event.location ? event.location + ', ' : '') + (event.danang_wards?.name ? 'Phường ' + event.danang_wards.name + ', ' : '') + 'Đà Nẵng')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs font-bold text-[#00b14f] bg-[#00b14f]/5 px-3 py-1.5 rounded border border-[#99e0b9] inline-flex items-center gap-1.5 hover:bg-[#00b14f]/10 transition-colors"
                                >
                                    🗺️ Xem vị trí trên Google Maps
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Sidebar, Width: approx 350px on large screen) */}
                    <div className="w-full lg:w-[350px] space-y-6 shrink-0">
                        {/* Company Card */}
                        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm flex flex-col items-center text-center">
                            <Avatar className="h-16 w-16 rounded-2xl border border-slate-100 shadow-sm mb-4">
                                <AvatarImage src={event.profiles?.avatar_url} />
                                <AvatarFallback className="rounded-2xl bg-emerald-50 text-emerald-600 text-2xl font-black">
                                    {event.profiles?.full_name?.charAt(0).toUpperCase() || "O"}
                                </AvatarFallback>
                            </Avatar>
                            <h2 className="text-sm font-bold text-[#212f3f] leading-snug hover:text-[#00b14f] cursor-pointer transition-colors mb-2">
                                {event.profiles?.full_name || "Đơn vị ẩn danh"}
                            </h2>
                            <p className="text-[12px] text-slate-400 font-medium mb-3">Nhà tổ chức sự kiện / Doanh nghiệp đối tác</p>
                        </div>

                        {/* General Info Box */}
                        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-5">
                            <h3 className="text-sm font-bold text-[#212f3f] border-b border-slate-100 pb-3">
                                Thông tin chung
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Briefcase className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium">Vị trí công việc</p>
                                        <p className="text-sm text-[#212f3f] font-semibold mt-0.5">
                                            {event.position_type || "Tình nguyện viên"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Tag className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium">Loại hình sự kiện</p>
                                        <p className="text-sm text-[#212f3f] font-semibold mt-0.5">
                                            {event.category || "Chưa phân loại"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Users className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium">Số lượng cần tuyển</p>
                                        <p className="text-sm text-[#212f3f] font-semibold mt-0.5">
                                            {event.slots_needed || 1} nhân sự
                                        </p>
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