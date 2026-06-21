import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import MainLayout from "@/components/layout/MainLayout"
import { MapPin, Calendar, CheckCircle, XCircle, Clock3, Bookmark, Briefcase, Tag, DollarSign, Users, Hourglass } from "lucide-react"
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
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || "")
            let eventQuery = supabase
                .from("events")
                .select("*, profiles(id, full_name, avatar_url, slug), danang_wards(name)")

            if (isUuid) {
                eventQuery = eventQuery.eq("id", id)
            } else {
                eventQuery = eventQuery.eq("slug", id)
            }

            const { data: eventData, error } = await eventQuery.maybeSingle()

            if (eventData) {
                setEvent(eventData)

                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
                    if (profile) setRole(profile.role)

                    if (profile?.role === "student") {
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
    }, [id])

    const handleApply = async () => {
        setIsApplying(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode: "login" } }))
            return
        }

        const { error } = await supabase.from("applications").insert([
            { event_id: event.id, student_id: user.id }
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
                .eq("event_id", event.id)

            if (!error) setIsBookmarked(false)
            else alert("Lỗi khi hủy lưu việc làm: " + error.message)
        } else {
            const { error } = await supabase
                .from("event_bookmarks")
                .insert([{ student_id: user.id, event_id: event.id }])

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
                {/* Two Column Layout */}
                <div className="job-detail_body flex flex-col lg:flex-row gap-6 items-start min-[1440px]:w-[1140px] min-[1440px]:gap-[28px] min-[1440px]:flex-row">
                    {/* Left Column (Width: approx 760px on large screen) */}
                    <div className="job-detail_body-left flex-1 w-full lg:max-w-[760px] space-y-6 min-[1440px]:w-[761px] min-[1440px]:gap-[28px] min-[1440px]:flex-col">
                        {/* Box 1: Header / General Summary */}
                        <div id="header-job-info" className="job-detail_box job-detail_info bg-white rounded-lg border border-slate-200 p-6 shadow-sm min-[1440px]:p-[20px_24px] min-[1440px]:rounded-[8px] min-[1440px]:gap-[16px] min-[1440px]:flex-col">
                            <h1 className="job-detail_info--title text-xl md:text-2xl font-bold text-[#263a4d] leading-tight mb-2 min-[1440px]:w-[713px] min-[1440px]:text-[20px] min-[1440px]:font-bold min-[1440px]:font-sans min-[1440px]:tracking-[-0.2px] min-[1440px]:leading-[28px]">
                                {event.title}
                            </h1>

                            {/* Quick Info Grid */}
                            <div className="job-detail_info--sections grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-5 pb-6 min-[1440px]:w-[713px] min-[1440px]:h-[46px] min-[1440px]:flex-row min-[1440px]:items-center min-[1440px]:justify-between min-[1440px]:pt-0 min-[1440px]:pb-0 min-[1440px]:border-t-0 min-[1440px]:flex">
                                <div className="job-detail_info--section section-salary flex items-center gap-3 min-[1440px]:h-[46px] min-[1440px]:flex-row min-[1440px]:items-center min-[1440px]:gap-[16px]">
                                    <div className="job-detail_info--section-icon w-9 h-9 rounded-full bg-[#00b14f]/5 flex items-center justify-center shrink-0 min-[1440px]:w-[40px] min-[1440px]:h-[40px] min-[1440px]:rounded-[30px] min-[1440px]:p-[10px] min-[1440px]:flex min-[1440px]:flex-col min-[1440px]:justify-center min-[1440px]:items-center min-[1440px]:gap-[10px] min-[1440px]:bg-gradient-to-br min-[1440px]:from-[#00bf5d] min-[1440px]:to-[#00907c]">
                                        <DollarSign className="w-4 h-4 text-[#00b14f] min-[1440px]:text-white" />
                                    </div>
                                    <div>
                                        <p className="job-detail_info--section-content-title text-[12px] text-slate-400 font-medium min-[1440px]:h-[22px] min-[1440px]:text-[14px] min-[1440px]:text-[#263a4d] min-[1440px]:leading-[22px] min-[1440px]:tracking-[0.14px]">Quyền lợi / Lương</p>
                                        <p className="job-detail_info--section-content-value text-[13px] text-[#212f3f] font-semibold truncate max-w-[180px] min-[1440px]:h-[22px] min-[1440px]:text-[14px] min-[1440px]:text-[#212f3f] min-[1440px]:font-semibold min-[1440px]:leading-[22px] min-[1440px]:tracking-[0.175px]" title={event.benefits || "Thỏa thuận"}>
                                            {event.benefits || "Thỏa thuận"}
                                        </p>
                                    </div>
                                </div>
                                <div className="job-detail_info--section section-location flex items-center gap-3 min-[1440px]:flex-row min-[1440px]:items-center min-[1440px]:gap-[16px] min-[1440px]:flex-basis-0">
                                    <div className="job-detail_info--section-icon w-9 h-9 rounded-full bg-[#00b14f]/5 flex items-center justify-center shrink-0 min-[1440px]:w-[40px] min-[1440px]:h-[40px] min-[1440px]:rounded-[30px] min-[1440px]:p-[10px] min-[1440px]:flex min-[1440px]:flex-col min-[1440px]:justify-center min-[1440px]:items-center min-[1440px]:gap-[10px] min-[1440px]:bg-gradient-to-br min-[1440px]:from-[#00bf5d] min-[1440px]:to-[#00907c]">
                                        <MapPin className="w-4 h-4 text-[#00b14f] min-[1440px]:text-white" />
                                    </div>
                                    <div>
                                        <p className="job-detail_info--section-content-title text-[12px] text-slate-400 font-medium min-[1440px]:h-[22px] min-[1440px]:text-[14px] min-[1440px]:text-[#263a4d] min-[1440px]:leading-[22px] min-[1440px]:tracking-[0.14px]">Khu vực</p>
                                        <p className="job-detail_info--section-content-value text-[13px] text-[#212f3f] font-semibold truncate min-[1440px]:h-[22px] min-[1440px]:text-[14px] min-[1440px]:text-[#212f3f] min-[1440px]:font-semibold min-[1440px]:leading-[22px] min-[1440px]:tracking-[0.175px]" title={event.danang_wards?.name ? `P. ${event.danang_wards.name}` : "Đà Nẵng"}>
                                            {event.danang_wards?.name ? `P. ${event.danang_wards.name}` : "Đà Nẵng"}
                                        </p>
                                    </div>
                                </div>
                                <div className="job-detail_info--section section-eventdate flex items-center gap-3 min-[1440px]:flex-row min-[1440px]:items-center min-[1440px]:gap-[16px]">
                                    <div className="job-detail_info--section-icon w-9 h-9 rounded-full bg-[#00b14f]/5 flex items-center justify-center shrink-0 min-[1440px]:w-[40px] min-[1440px]:h-[40px] min-[1440px]:rounded-[30px] min-[1440px]:p-[10px] min-[1440px]:flex min-[1440px]:flex-col min-[1440px]:justify-center min-[1440px]:items-center min-[1440px]:gap-[10px] min-[1440px]:bg-gradient-to-br min-[1440px]:from-[#00bf5d] min-[1440px]:to-[#00907c]">
                                        <Calendar className="w-4 h-4 text-[#00b14f] min-[1440px]:text-white" />
                                    </div>
                                    <div>
                                        <p className="job-detail_info--section-content-title text-[12px] text-slate-400 font-medium min-[1440px]:h-[22px] min-[1440px]:text-[14px] min-[1440px]:text-[#263a4d] min-[1440px]:leading-[22px] min-[1440px]:tracking-[0.14px]">Ngày diễn ra</p>
                                        <p className="job-detail_info--section-content-value text-[13px] text-[#212f3f] font-semibold min-[1440px]:h-[22px] min-[1440px]:text-[14px] min-[1440px]:text-[#212f3f] min-[1440px]:font-semibold min-[1440px]:leading-[22px] min-[1440px]:tracking-[0.175px]">
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
                                    <>
                                        <Button
                                            onClick={toggleBookmark}
                                            variant="outline"
                                            className={`rounded-md font-bold h-11 px-6 border transition-all ${isBookmarked
                                                ? "bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100"
                                                : "border-[#99e0b9] text-[#00b14f] hover:bg-[#00b14f]/5 hover:text-[#00b14f]"
                                                }`}
                                        >
                                            <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? "fill-current" : ""}`} />
                                            {isBookmarked ? "Đã lưu" : "Lưu tin"}
                                        </Button>
                                    </>
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
                        <div
                            onClick={() => navigate(`/companies/${event.organizer_id}`)}
                            className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm flex flex-col items-center text-center cursor-pointer hover:border-[#00b14f] transition-colors group"
                        >
                            <Avatar className="h-16 w-16 rounded-2xl border border-slate-100 shadow-sm mb-4">
                                <AvatarImage src={event.profiles?.avatar_url} />
                                <AvatarFallback className="rounded-2xl bg-emerald-50 text-emerald-600 text-2xl font-black">
                                    {event.profiles?.full_name?.charAt(0).toUpperCase() || "O"}
                                </AvatarFallback>
                            </Avatar>
                            <h2 className="text-sm font-bold text-[#212f3f] leading-snug group-hover:text-[#00b14f] transition-colors mb-2">
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