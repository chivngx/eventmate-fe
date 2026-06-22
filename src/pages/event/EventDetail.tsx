import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import MainLayout from "@/components/layout/MainLayout"
import { MapPin, Calendar, CheckCircle, XCircle, Clock3, Bookmark, Briefcase, Tag, DollarSign, Users, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/ToastProvider"
import { SkeletonEventDetail } from "@/components/ui/Skeleton"

export default function EventDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { showToast } = useToast()
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
            showToast({ title: "Đã xảy ra lỗi", message: error.message, type: "error" })
        } else {
            setApplyStatus('pending')
            showToast({ title: "Ứng tuyển thành công", message: "Đơn ứng tuyển của bạn đã được gửi. Vui lòng chờ BTC phê duyệt.", type: "success" })
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

            if (!error) {
                setIsBookmarked(false)
                showToast({ title: "Đã hủy lưu", message: "Đã hủy lưu tin tuyển dụng thành công.", type: "info" })
            }
            else showToast({ title: "Đã xảy ra lỗi", message: error.message, type: "error" })
        } else {
            const { error } = await supabase
                .from("event_bookmarks")
                .insert([{ student_id: user.id, event_id: event.id }])

            if (!error) {
                setIsBookmarked(true)
                showToast({ title: "Đã lưu tin", message: "Đã lưu tin tuyển dụng thành công.", type: "success" })
            }
            else showToast({ title: "Đã xảy ra lỗi", message: error.message, type: "error" })
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
        if (role !== "student") return null

        if (applyStatus === 'approved') {
            return (
                <button disabled className="job-detail_info--actions-button button-primary btn-apply-job flex items-center justify-center rounded-md font-semibold bg-emerald-100 border border-emerald-200 text-emerald-700 h-[40px] px-6 min-[1440px]:w-[569px] min-[1440px]:h-[40px] min-[1440px]:rounded-[6px] min-[1440px]:text-[14px] min-[1440px]:gap-[6px] min-[1440px]:leading-[22px] min-[1440px]:p-[8px_16px_8px_12px]">
                    <CheckCircle className="w-4 h-4 mr-2" /> Trúng tuyển
                </button>
            )
        }
        if (applyStatus === 'rejected') {
            return (
                <button disabled className="job-detail_info--actions-button button-primary btn-apply-job flex items-center justify-center rounded-md font-semibold bg-rose-50 border border-rose-100 text-rose-500 h-[40px] px-6 min-[1440px]:w-[569px] min-[1440px]:h-[40px] min-[1440px]:rounded-[6px] min-[1440px]:text-[14px] min-[1440px]:gap-[6px] min-[1440px]:leading-[22px] min-[1440px]:p-[8px_16px_8px_12px]">
                    <XCircle className="w-4 h-4 mr-2" /> Chưa phù hợp
                </button>
            )
        }
        if (applyStatus === 'pending') {
            return (
                <button disabled className="job-detail_info--actions-button button-primary btn-apply-job flex items-center justify-center rounded-md font-semibold bg-amber-50 border border-amber-100 text-amber-600 h-[40px] px-6 min-[1440px]:w-[569px] min-[1440px]:h-[40px] min-[1440px]:rounded-[6px] min-[1440px]:text-[14px] min-[1440px]:gap-[6px] min-[1440px]:leading-[22px] min-[1440px]:p-[8px_16px_8px_12px]">
                    <Clock3 className="w-4 h-4 mr-2" /> Đang chờ duyệt
                </button>
            )
        }

        return (
            <button
                onClick={handleApply}
                disabled={disabledApply || isPastDeadline}
                className="job-detail_info--actions-button button-primary open-apply-modal btn-apply-job flex items-center justify-center bg-[#00b14f] hover:bg-[#009a44] text-white font-semibold font-sans rounded-md transition-all active:scale-95 disabled:opacity-50 h-[40px] px-6 text-sm flex-1 cursor-pointer min-[1440px]:w-[569px] min-[1440px]:h-[40px] min-[1440px]:rounded-[6px] min-[1440px]:text-[14px] min-[1440px]:font-semibold min-[1440px]:gap-[6px] min-[1440px]:leading-[22px] min-[1440px]:tracking-[0.175px] min-[1440px]:p-[8px_16px_8px_12px]"
            >
                {isApplying ? "Đang xử lý..." : isPastDeadline ? "Đã hết hạn nộp đơn" : event.status !== 'upcoming' ? "Đã đóng đăng ký" : "Ứng tuyển ngay"}
            </button>
        )
    }

    return (
        <MainLayout role={role}>
            <div className="max-w-6xl mx-auto pt-1 pb-6 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Two Column Layout */}
                <div className="job-detail_body flex flex-col lg:flex-row gap-6 items-start min-[1440px]:w-[1140px] min-[1440px]:gap-[28px] min-[1440px]:flex-row">
                    {/* Left Column (Width: approx 760px on large screen) */}
                    <div className="job-detail_body-left flex-1 w-full lg:max-w-[760px] space-y-6 min-[1440px]:w-[761px] min-[1440px]:gap-[28px] min-[1440px]:flex-col">
                        {/* Box 1: Header / General Summary */}
                        <div id="header-job-info" className="job-detail_box job-detail_info bg-white rounded-lg border border-slate-200 p-6 shadow-sm min-[1440px]:p-[20px_24px] min-[1440px]:rounded-[8px] min-[1440px]:gap-[16px] min-[1440px]:flex-col">
                            <h1 className="job-detail_info--title text-xl md:text-2xl font-bold text-[#263a4d] leading-tight mb-4 min-[1440px]:mb-[16px] min-[1440px]:w-[713px] min-[1440px]:text-[20px] min-[1440px]:font-bold min-[1440px]:font-sans min-[1440px]:tracking-[-0.2px] min-[1440px]:leading-[28px]">
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
                                            {event.danang_wards?.name ? `${event.danang_wards.name}` : "Đà Nẵng"}
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
                            <div className="job-detail_info--flex flex items-center text-sm text-[#333] gap-2 mt-4 mb-6 min-[1440px]:w-[713px] min-[1440px]:h-[26px] min-[1440px]:flex min-[1440px]:items-center min-[1440px]:gap-[4px] min-[1440px]:text-[14px] min-[1440px]:leading-[20px] min-[1440px]:text-[#333] min-[1440px]:mt-[16px] min-[1440px]:mb-6">
                                <div className="job-detail_info--deadline flex items-center gap-1 text-sm text-[#7f878f] bg-slate-50 px-2.5 py-1.5 md:p-[2px_8px_2px_4px] rounded min-[1440px]:rounded-[4px] min-[1440px]:gap-[4px] min-[1440px]:text-[14px] min-[1440px]:leading-[22px] min-[1440px]:tracking-[0.14px] min-[1440px]:text-[#7f878f]">
                                    <span>Hạn nộp hồ sơ</span>
                                </div>
                                <div className="job-detail_info--deadline-date text-sm font-semibold text-[#263a4d] min-[1440px]:text-[14px] min-[1440px]:font-semibold min-[1440px]:leading-[22px] min-[1440px]:tracking-[0.175px] min-[1440px]:text-[#263a4d]">
                                    {event.application_deadline ? new Date(event.application_deadline).toLocaleDateString('vi-VN') : "Không giới hạn"}
                                </div>
                                {event.application_deadline && (
                                    <span className="deadline text-sm font-semibold text-[#263a4d] min-[1440px]:text-[14px] min-[1440px]:font-semibold min-[1440px]:leading-[22px] min-[1440px]:tracking-[0.175px] min-[1440px]:text-[#263a4d]">
                                        {(() => {
                                            const diff = new Date(event.application_deadline).getTime() - new Date().getTime();
                                            const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
                                            return diffDays > 0 ? `(Còn ${diffDays} ngày)` : "(Đã hết hạn)";
                                        })()}
                                    </span>
                                )}
                            </div>

                            {/* Action Buttons Row */}
                            <div className="job-detail_info--actions box-apply-current flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5 min-[1440px]:w-[713px] min-[1440px]:h-[40px] min-[1440px]:flex min-[1440px]:items-center min-[1440px]:flex-wrap min-[1440px]:text-[14px] min-[1440px]:gap-[12px] min-[1440px]:leading-[20px] min-[1440px]:m-[4px_0px_0px] min-[1440px]:border-t-0 min-[1440px]:pt-0">
                                {renderApplyAction()}
                                {role === 'student' && (
                                    <button
                                        id="save-job"
                                        onClick={toggleBookmark}
                                        className={`job-detail_info--actions-button button-white btn-save-job flex items-center justify-center rounded-md font-semibold font-sans h-[40px] px-6 border transition-all cursor-pointer min-[1440px]:w-[130px] min-[1440px]:h-[40px] min-[1440px]:border-[0.8px] min-[1440px]:rounded-[6px] min-[1440px]:text-[14px] min-[1440px]:font-semibold min-[1440px]:gap-[6px] min-[1440px]:leading-[22px] min-[1440px]:tracking-[0.175px] min-[1440px]:p-[8px_16px_8px_12px] ${isBookmarked
                                            ? "bg-[#00b14f] border-[#00b14f] text-white hover:bg-[#009e47]"
                                            : "bg-white border-[#00b14f] text-[#00b14f] hover:bg-[#00b14f]/5"
                                            }`}
                                    >
                                        <Bookmark className={`w-4 h-4 mr-1.5 ${isBookmarked ? "fill-current" : ""}`} />
                                        {isBookmarked ? "Đã lưu" : "Lưu tin"}
                                    </button>
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
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="text-sm text-slate-700 font-medium flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span>
                                            {event.location ? `${event.location}, ` : ""}
                                            {event.danang_wards?.name ? `Phường ${event.danang_wards.name}, ` : ""}
                                            Đà Nẵng
                                        </span>
                                    </div>
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((event.location ? event.location + ', ' : '') + (event.danang_wards?.name ? 'Phường ' + event.danang_wards.name + ', ' : '') + 'Đà Nẵng')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs font-bold text-[#00b14f] bg-[#00b14f]/5 px-3 py-2 rounded-lg border border-[#00b14f]/20 inline-flex items-center gap-1.5 hover:bg-[#00b14f]/10 transition-all hover:border-[#00b14f]/30 shrink-0"
                                    >
                                        <MapPin className="w-3.5 h-3.5" />
                                        Xem vị trí trên Google Maps
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Sidebar, Width: approx 350px on large screen) */}
                    <div className="job-detail_body-right w-full lg:w-[350px] shrink-0 flex flex-col gap-6 items-center text-[#333] text-[14px] leading-[20px] min-[1440px]:w-[352px] min-[1440px]:gap-[24px] min-[1440px]:bg-[#f4f5f5]">
                        {/* Company Card */}
                        <div
                            className="job-detail_box right job-detail_company bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex flex-col gap-4 items-start text-[#333] text-[14px] leading-[20px] min-[1440px]:w-[352px] min-[1440px]:rounded-[8px] min-[1440px]:gap-[16px] min-[1440px]:p-[20px]"
                        >
                            <div className="job-detail_company--information w-full flex flex-col gap-3 min-[1440px]:w-[312px]">
                                <div className="job-detail_company--information-item company-name flex items-start text-[#333] text-[14px] gap-[16px] leading-[20px] mb-3 min-[1440px]:mb-[12px]">
                                    <div
                                        onClick={() => navigate(`/companies/${event.profiles?.slug || event.organizer_id}`)}
                                        className="company-logo flex items-center justify-center bg-white border border-[#e9eaec] rounded-[8px] border-[0.8px] text-[#23527c] text-[14px] leading-[20px] p-[7.04px] w-[88px] h-[88px] shrink-0 cursor-pointer"
                                    >
                                        <img
                                            src={event.profiles?.avatar_url || "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=88&h=88&q=80"}
                                            alt={event.profiles?.full_name}
                                            className="w-full h-full object-contain rounded"
                                            onError={(e: any) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=88&h=88&q=80";
                                            }}
                                        />
                                    </div>
                                    <div className="company-name-label flex flex-col gap-1 text-[#333] text-[14px] leading-[20px] w-full min-[1440px]:w-[206px] min-[1440px]:gap-[4px]">
                                        <a
                                            onClick={() => navigate(`/companies/${event.profiles?.slug || event.organizer_id}`)}
                                            className="name text-[14px] font-semibold text-[#212f3f] font-sans tracking-[-0.16px] leading-[24px] cursor-pointer hover:text-[#00b14f] transition-colors"
                                        >
                                            {event.profiles?.full_name || "Đơn vị ẩn danh"}
                                        </a>
                                    </div>
                                </div>

                                <div className="job-detail_company--information-item company-scale flex items-start text-[#333] text-[14px] gap-[16px] leading-[20px] mb-2 min-[1440px]:mb-[8px]">
                                    <div className="company-title flex items-center gap-[8px] text-[#7f878f] text-[14px] leading-[22px] tracking-[0.14px] w-[88px] shrink-0">
                                        <Users className="w-4 h-4 text-[#7f878f] fill-none text-[14px] leading-[22px] tracking-[0.14px]" />
                                        <span>Quy mô:</span>
                                    </div>
                                    <div className="company-value text-[#212f3f] text-[14px] font-medium leading-[22px] tracking-[0.14px] w-full min-[1440px]:w-[208px]">
                                        {event.profiles?.scale || "Chưa cập nhật"}
                                    </div>
                                </div>

                                <div className="job-detail_company--information-item company-address flex items-start text-[#333] text-[14px] gap-[16px] leading-[20px] mb-2 min-[1440px]:mb-[8px]">
                                    <div className="company-title flex items-center gap-[8px] text-[#7f878f] text-[14px] leading-[22px] tracking-[0.14px] w-[88px] shrink-0">
                                        <MapPin className="w-4 h-4 text-[#7f878f] fill-none text-[14px] leading-[22px] tracking-[0.14px]" />
                                        <span>Địa điểm:</span>
                                    </div>
                                    <div className="company-value text-[#212f3f] text-[14px] font-medium leading-[22px] tracking-[0.14px] w-full min-[1440px]:w-[208px]">
                                        {event.profiles?.address || "Chưa cập nhật"}
                                    </div>
                                </div>
                            </div>

                            <div className="job-detail_company--link w-full flex justify-center text-[#333] text-[14px] leading-[20px] min-[1440px]:w-[312px] mt-1">
                                <a
                                    onClick={() => navigate(`/companies/${event.profiles?.slug || event.organizer_id}`)}
                                    className="flex items-center justify-center gap-[10px] text-[#00b14f] text-[14px] font-semibold leading-[22px] tracking-[0.175px] font-sans hover:underline cursor-pointer"
                                >
                                    Xem trang công ty
                                    <ExternalLink className="text-[15px] text-[#00b14f] w-4 h-4 flex items-center justify-center leading-[20px] text-center shrink-0" />
                                </a>
                            </div>
                        </div>


                        {/* General Info Box */}
                        <div className="job-detail_body-right--box-general bg-white rounded-lg border border-slate-200 p-5 shadow-sm text-[#333] text-[14px] leading-[20px] w-full min-[1440px]:w-[351px] min-[1440px]:rounded-[8px] min-[1440px]:p-[20px]">
                            <div className="box-title text-lg font-bold text-[#212f3f] mb-4 min-[1440px]:w-[311px] min-[1440px]:text-[20px] min-[1440px]:font-bold min-[1440px]:tracking-[-0.2px] min-[1440px]:leading-[28px] min-[1440px]:m-[0px_0px_16px]">
                                Thông tin chung
                            </div>

                            <div className="box-general-content flex flex-col gap-4 text-[#333] text-[14px] leading-[20px] w-full min-[1440px]:w-[311px] min-[1440px]:gap-[20px]">
                                <div className="box-general-group flex items-center gap-4 text-[#333] text-[14px] leading-[20px] w-full min-[1440px]:w-[311px] min-[1440px]:gap-[16px]">
                                    <div className="box-general-group-icon flex items-center justify-center bg-[#f2f4f5] rounded-[30px] p-2 text-[#333] text-[14px] leading-[20px] w-[40px] h-[40px] shrink-0">
                                        <Briefcase className="w-5 h-5 text-[#333] fill-none text-[14px] leading-[20px]" />
                                    </div>
                                    <div className="box-general-group-info flex flex-col gap-1 text-[#333] text-[14px] leading-[20px] w-full min-[1440px]:w-[70px] min-[1440px]:gap-[4px]">
                                        <div className="box-general-group-info-title text-[#4d5965] text-[14px] tracking-[0.14px] leading-[22px] min-[1440px]:w-[70px] whitespace-nowrap">
                                            Vị trí tuyển
                                        </div>
                                        <div className="box-general-group-info-value text-[#212f3f] text-[14px] font-semibold tracking-[0.175px] leading-[22px] min-[1440px]:w-[70px] whitespace-nowrap">
                                            {event.position_type || "Tình nguyện viên"}
                                        </div>
                                    </div>
                                </div>

                                <div className="box-general-group flex items-center gap-4 text-[#333] text-[14px] leading-[20px] w-full min-[1440px]:w-[311px] min-[1440px]:gap-[16px]">
                                    <div className="box-general-group-icon flex items-center justify-center bg-[#f2f4f5] rounded-[30px] p-2 text-[#333] text-[14px] leading-[20px] w-[40px] h-[40px] shrink-0">
                                        <Tag className="w-5 h-5 text-[#333] fill-none text-[14px] leading-[20px]" />
                                    </div>
                                    <div className="box-general-group-info flex flex-col gap-1 text-[#333] text-[14px] leading-[20px] w-full min-[1440px]:w-[70px] min-[1440px]:gap-[4px]">
                                        <div className="box-general-group-info-title text-[#4d5965] text-[14px] tracking-[0.14px] leading-[22px] min-[1440px]:w-[70px] whitespace-nowrap">
                                            Loại hình
                                        </div>
                                        <div className="box-general-group-info-value text-[#212f3f] text-[14px] font-semibold tracking-[0.175px] leading-[22px] min-[1440px]:w-[70px] whitespace-nowrap">
                                            {event.category || "Chưa phân loại"}
                                        </div>
                                    </div>
                                </div>

                                <div className="box-general-group flex items-center gap-4 text-[#333] text-[14px] leading-[20px] w-full min-[1440px]:w-[311px] min-[1440px]:gap-[16px]">
                                    <div className="box-general-group-icon flex items-center justify-center bg-[#f2f4f5] rounded-[30px] p-2 text-[#333] text-[14px] leading-[20px] w-[40px] h-[40px] shrink-0">
                                        <Users className="w-5 h-5 text-[#333] fill-none text-[14px] leading-[20px]" />
                                    </div>
                                    <div className="box-general-group-info flex flex-col gap-1 text-[#333] text-[14px] leading-[20px] w-full min-[1440px]:w-[70px] min-[1440px]:gap-[4px]">
                                        <div className="box-general-group-info-title text-[#4d5965] text-[14px] tracking-[0.14px] leading-[22px] min-[1440px]:w-[70px] whitespace-nowrap">
                                            Số lượng tuyển
                                        </div>
                                        <div className="box-general-group-info-value text-[#212f3f] text-[14px] font-semibold tracking-[0.175px] leading-[22px] min-[1440px]:w-[70px] whitespace-nowrap">
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