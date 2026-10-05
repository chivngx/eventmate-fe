"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "@/lib/router"
import { supabase } from "@/lib/supabase"
import { getUserFacingMessage } from "@/lib/error"
import { useUser } from "@/components/providers/AuthProvider"
import { useAuthModal } from "@/components/providers/AuthModalProvider"
import MainLayout from "@/components/layout/MainLayout"
import {
    CheckCircle2,
    XCircle,
    Clock3,
    ChevronRight,
    Check,
    ArrowUpRight,
} from "lucide-react"
import { useToast } from "@/components/providers/ToastProvider"
import { SkeletonEventDetail } from "@/components/ui/skeleton"
import { formatSalary, cn } from "@/lib/utils"
import VerifiedBadge from "@/components/ui/verified-badge"
import EventCard, { JobItem } from "./components/EventCard"
import Breadcrumb from "@/components/common/Breadcrumb"
import {
    BookmarkIcon,
    StatClockIcon,
    StatCalendarIcon,
    StatLocationIcon,
    StatDollarIcon,
} from "./components/StatIcons"
import ApplyPositionModal from "./components/ApplyPositionModal"

const DEFAULT_COMPANY_LOGO = "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=160&h=160&q=80"

export default function EventDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { showToast } = useToast()
    const { openLogin } = useAuthModal()
    const { user, role, profile, loading: authLoading } = useUser()
    const [event, setEvent] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [applyStatus, setApplyStatus] = useState<string | null>(null)
    const [userApplication, setUserApplication] = useState<any>(null)
    const [isApplying, setIsApplying] = useState(false)
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [similarJobs, setSimilarJobs] = useState<JobItem[]>([])

    // State for Position Application Modal
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
    const [selectedPositionId, setSelectedPositionId] = useState<string>("")

    const requireAuth = (message: string) => {
        if (!user) {
            openLogin({ message })
            return false
        }
        return true
    }

    useEffect(() => {
        if (authLoading) return
        const fetchEventDetails = async () => {
            setLoading(true)
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || "")
            let eventQuery = supabase
                .from("events")
                .select("*, profiles(id, full_name, avatar_url, slug, address, is_verified, bio), danang_wards(name)")

            if (isUuid) {
                eventQuery = eventQuery.eq("id", id)
            } else {
                eventQuery = eventQuery.eq("slug", id)
            }

            const { data: eventData, error } = await eventQuery.maybeSingle()

            if (eventData) {
                if (isUuid && eventData.slug) {
                    navigate(`/events/${eventData.slug}`, { replace: true })
                }

                const { data: posData } = await supabase
                    .from("event_positions")
                    .select("*")
                    .eq("event_id", eventData.id)
                    .order("created_at", { ascending: true })

                let positions = (posData && posData.length > 0) ? posData : []
                if (positions.length === 0) {
                    const titles = eventData.position_type
                        ? eventData.position_type.split(",").map((s: string) => s.trim()).filter(Boolean)
                        : []
                    const effectiveTitles = titles.length > 0 ? titles : ["Tình nguyện viên sự kiện"]
                    const isMulti = effectiveTitles.length > 1
                    positions = effectiveTitles.map((t: string, idx: number) => ({
                        id: isMulti ? `pos_${idx}` : "default",
                        event_id: eventData.id,
                        title: t,
                        slots_needed: isMulti
                            ? Math.max(1, Math.floor((eventData.slots_needed || effectiveTitles.length) / effectiveTitles.length))
                            : (eventData.slots_needed || 1),
                        salary_amount: eventData.salary_amount || 0,
                        salary_type: eventData.salary_type || "per_shift",
                        description: null,
                        created_at: new Date().toISOString(),
                    }))
                }

                ; (eventData as any).event_positions = positions
                setEvent(eventData)

                if (positions.length > 0) {
                    setSelectedPositionId(positions[0].id)
                }

                if (user) {
                    if (role === "student") {
                        const { data: appData } = await supabase
                            .from("applications")
                            .select("id, status, position_id, student_note")
                            .eq("event_id", eventData.id)
                            .eq("student_id", user.id)
                            .maybeSingle()

                        if (appData) {
                            if (appData.position_id) {
                                const foundPos = positions.find((p: any) => p.id === appData.position_id)
                                if (foundPos) {
                                    ; (appData as any).event_positions = foundPos
                                }
                            }
                            setApplyStatus(appData.status)
                            setUserApplication(appData)
                        }

                        const { data: bookmarkData } = await supabase
                            .from("event_bookmarks")
                            .select("id")
                            .eq("event_id", eventData.id)
                            .eq("student_id", user.id)
                            .maybeSingle()

                        if (bookmarkData) setIsBookmarked(true)
                    }
                }

                fetchSimilarJobs(eventData.id, eventData.category)
            } else {
                console.error("Lỗi hoặc không tìm thấy sự kiện", error?.message || error || "Không tìm thấy dữ liệu sự kiện")
            }
            setLoading(false)
        }

        fetchEventDetails()
    }, [id, user, role, authLoading, navigate])

    const fetchSimilarJobs = async (currentEventId: string, category: string | null) => {
        try {
            const buildQuery = () =>
                supabase
                    .from("events")
                    .select("id, slug, title, category, position_type, salary_amount, salary_type, created_at, danang_wards(name), profiles(full_name, avatar_url, is_verified)")
                    .neq("id", currentEventId)
                    .order("created_at", { ascending: false })
                    .limit(6)

            let result = category ? await buildQuery().eq("category", category) : { data: null, error: null }
            if (!result.data || result.data.length === 0) {
                result = await buildQuery()
            }
            setSimilarJobs((result.data as any) || [])
        } catch (_err) {
            setSimilarJobs([])
        }
    }

    const openApplyModal = (preferredPositionId?: string) => {
        if (!requireAuth("Vui lòng đăng nhập để ứng tuyển sự kiện này.")) return
        
        if (role === "student" && !profile?.is_verified) {
            showToast({
                title: "Yêu cầu xác thực tài khoản",
                message: "Bạn cần hoàn tất xác thực CCCD (eKYC) trong Cài đặt tài khoản trước khi ứng tuyển sự kiện.",
                type: "error",
            })
            navigate("/account")
            return
        }

        if (preferredPositionId) {
            setSelectedPositionId(preferredPositionId)
        } else if (event?.event_positions && event.event_positions.length > 0) {
            setSelectedPositionId(event.event_positions[0].id)
        }
        setIsApplyModalOpen(true)
    }

    const handleConfirmApply = async () => {
        if (!requireAuth("Vui lòng đăng nhập để ứng tuyển sự kiện này.") || !user) return
        if (!event || isApplying) return
        setIsApplying(true)

        try {
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selectedPositionId || "")
            const { error } = await supabase.from("applications").insert([
                {
                    event_id: event.id,
                    student_id: user.id,
                    position_id: isUuid ? selectedPositionId : null,
                    status: "pending"
                }
            ])

            if (error) {
                showToast({
                    title: "Đã xảy ra lỗi",
                    message: getUserFacingMessage(error, "Vui lòng thử lại."),
                    type: "error"
                })
            } else {
                setApplyStatus("pending")
                const matchedPos = event.event_positions?.find((p: any) => p.id === selectedPositionId)
                setUserApplication({
                    position_id: selectedPositionId,
                    event_positions: matchedPos || null,
                })
                setIsApplyModalOpen(false)
                showToast({
                    title: "Ứng tuyển thành công",
                    message: "Đơn ứng tuyển của bạn đã được gửi tới Ban tổ chức!",
                    type: "success",
                    actionLink: "/my-events",
                    actionText: "Xem hoạt động"
                })
            }
        } catch (err: any) {
            showToast({
                title: "Đã xảy ra lỗi",
                message: getUserFacingMessage(err, "Không thể gửi đơn ứng tuyển."),
                type: "error"
            })
        } finally {
            setIsApplying(false)
        }
    }

    const handleMessage = () => {
        if (!requireAuth("Vui lòng đăng nhập để gửi tin nhắn cho Ban tổ chức.")) return
        if (event?.organizer_id === user?.id) {
            showToast({ title: "Thông báo", message: "Đây là sự kiện do bạn đăng tuyển.", type: "info" })
            return
        }
        if (event?.organizer_id) {
            navigate(`/chat?organizerId=${event.organizer_id}&eventId=${event.id}`)
        } else {
            navigate("/chat")
        }
    }

    const toggleBookmark = async () => {
        if (!requireAuth("Vui lòng đăng nhập để lưu sự kiện này.") || !user) return

        if (isBookmarked) {
            const { error } = await supabase
                .from("event_bookmarks")
                .delete()
                .eq("student_id", user.id)
                .eq("event_id", event.id)

            if (!error) {
                setIsBookmarked(false)
                showToast({ title: "Đã hủy lưu", message: "Đã hủy lưu sự kiện thành công.", type: "info" })
            } else {
                showToast({ title: "Đã xảy ra lỗi", message: getUserFacingMessage(error, "Vui lòng thử lại."), type: "error" })
            }
        } else {
            const { error } = await supabase
                .from("event_bookmarks")
                .insert([{ student_id: user.id, event_id: event.id }])

            if (!error) {
                setIsBookmarked(true)
                showToast({ title: "Đã lưu tin", message: "Đã lưu sự kiện thành công.", type: "success" })
            } else {
                showToast({ title: "Đã xảy ra lỗi", message: getUserFacingMessage(error, "Vui lòng thử lại."), type: "error" })
            }
        }
    }

    if (loading) return <SkeletonEventDetail />

    if (!event) {
        return (
            <MainLayout role="guest" fullWidth={true} className="bg-slate-50">
                <div className="bg-slate-50 min-h-screen text-center py-32 flex flex-col items-center">
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Không tìm thấy sự kiện</h2>
                    <p className="text-slate-500 mt-3 text-lg">Sự kiện này có thể đã bị xóa hoặc không tồn tại.</p>
                    <button onClick={() => navigate(-1)} className="mt-8 px-6 py-3 rounded-full bg-slate-900 text-white font-medium hover:bg-black transition-all active:scale-95">
                        Quay lại trang trước
                    </button>
                </div>
            </MainLayout>
        )
    }

    const isPastDeadline = event.application_deadline ? new Date() > new Date(event.application_deadline) : false
    const disabledApply = isApplying || event.status !== "upcoming"

    // Render Apply Button State
    const renderApplyButton = () => {
        if (role === "organizer") return null

        const posTitle = userApplication?.event_positions?.title

        if (applyStatus === "approved") {
            return (
                <button disabled className="h-[52px] w-full rounded-full font-medium text-[15px] bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center gap-2 cursor-default transition-all">
                    <CheckCircle2 className="size-5 text-emerald-600" />
                    <span>Trúng tuyển {posTitle ? `(${posTitle})` : ""}</span>
                </button>
            )
        }
        if (applyStatus === "rejected") {
            return (
                <button disabled className="h-[52px] w-full rounded-full font-medium text-[15px] bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center gap-2 cursor-default transition-all">
                    <XCircle className="size-5 text-rose-600" /> 
                    <span>Chưa phù hợp</span>
                </button>
            )
        }
        if (applyStatus === "pending") {
            return (
                <button disabled className="h-[52px] w-full rounded-full font-medium text-[15px] bg-slate-100 text-slate-600 flex items-center justify-center gap-2 cursor-default transition-all">
                    <Clock3 className="size-5 text-slate-500" />
                    <span>Đang chờ duyệt {posTitle ? `(${posTitle})` : ""}</span>
                </button>
            )
        }

        return (
            <button
                onClick={() => openApplyModal()}
                disabled={disabledApply || isPastDeadline}
                className="group relative h-[52px] w-full rounded-full bg-slate-900 text-white font-medium text-[16px] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-black hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between pl-6 pr-1.5 overflow-hidden"
            >
                <span className="flex-1 text-center font-semibold">
                    {isApplying ? "Đang xử lý..." : isPastDeadline ? "Đã hết hạn" : event.status !== "upcoming" ? "Đã đóng đơn" : "Ứng tuyển ngay"}
                </span>
                {!(disabledApply || isPastDeadline) && (
                    <div className="size-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-white group-hover:text-slate-900">
                        <ArrowUpRight className="size-5 text-white group-hover:text-slate-900 transition-colors" />
                    </div>
                )}
            </button>
        )
    }

    const benefitsList = event.benefits
        ? event.benefits.split("\n").filter((item: string) => item.trim().length > 0)
        : []

    const descriptionLines = event.description && event.description.trim().length > 0
        ? event.description.split("\n").filter((item: string) => item.trim().length > 0)
        : []

    const companyUrl = `/companies/${event.profiles?.slug || event.organizer_id}`

    return (
        <MainLayout role={role || "guest"} fullWidth={true} className="bg-slate-50">
            <div className="bg-slate-50 min-h-screen pb-24 pt-6 lg:pt-10 selection:bg-orange-100 selection:text-orange-900">
                <div className="w-full max-w-[1120px] mx-auto px-5 lg:px-8 flex flex-col gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)]">
                    
                    {/* BREADCRUMB */}
                    <div className="hidden md:block">
                        <Breadcrumb
                            items={[
                                { label: "Việc làm", href: "/events" },
                                ...(event.category
                                    ? [{ label: event.category, href: `/events?category=${encodeURIComponent(event.category)}` }]
                                    : []),
                                { label: event.title },
                            ]}
                        />
                    </div>

                    {/* HEADER HERO */}
                    <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start justify-between">
                        {/* Left: Info */}
                        <div className="flex flex-col sm:flex-row gap-6 md:gap-8 items-start w-full md:w-[70%]">
                            {/* Double-Bezel Logo */}
                            <div className="relative size-[100px] sm:size-[120px] shrink-0 p-1.5 bg-white rounded-[2.5rem] ring-1 ring-slate-200 shadow-sm">
                                <div className="w-full h-full rounded-[calc(2.5rem-0.375rem)] overflow-hidden bg-slate-100 flex items-center justify-center">
                                    <img
                                        alt={event.profiles?.full_name || "Company Logo"}
                                        className="size-full object-cover"
                                        src={event.profiles?.avatar_url || DEFAULT_COMPANY_LOGO}
                                        onError={(e: any) => {
                                            e.target.onerror = null
                                            e.target.src = DEFAULT_COMPANY_LOGO
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-5 w-full pt-1">
                                <div className="flex flex-col gap-3">
                                    {/* Eyebrow & Organizer */}
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className={cn(
                                            "px-3 py-1 text-[11px] uppercase tracking-wider font-bold rounded-full",
                                            event.status === "upcoming" ? "bg-orange-100 text-orange-700" : "bg-slate-200 text-slate-600"
                                        )}>
                                            {event.status === "upcoming" ? "Đang mở đơn" : "Đã đóng đơn"}
                                        </span>
                                        <button onClick={() => navigate(companyUrl)} className="text-[14px] font-semibold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1">
                                            {event.profiles?.full_name || "Ban tổ chức"}
                                            <VerifiedBadge variant="icon" />
                                        </button>
                                    </div>
                                    
                                    {/* Title & Bookmark */}
                                    <div className="flex items-start justify-between gap-4 w-full">
                                        <h1 className="text-[28px] md:text-[36px] lg:text-[42px] font-bold text-slate-900 tracking-tight leading-[1.15]">
                                            {event.title || "Chi tiết sự kiện"}
                                        </h1>
                                        <button 
                                            onClick={toggleBookmark} 
                                            title={isBookmarked ? "Bỏ lưu sự kiện" : "Lưu sự kiện"}
                                            className={cn(
                                                "shrink-0 size-11 md:size-12 rounded-full border flex items-center justify-center transition-all duration-300 active:scale-95 shadow-sm mt-1",
                                                isBookmarked ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-white border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300"
                                            )}
                                        >
                                            <BookmarkIcon active={isBookmarked} />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-[16px] md:text-[18px] text-slate-500 leading-relaxed max-w-[640px] line-clamp-2 md:line-clamp-3">
                                    {event.description
                                        ? event.description.split("\n")[0]
                                        : "Thông tin chi tiết về sự kiện và các vị trí tuyển dụng."}
                                </p>
                            </div>
                        </div>

                        {/* Right: CTA Actions (Desktop) */}
                        <div className="hidden md:flex flex-col gap-3 w-full md:w-[30%] shrink-0 pt-2">
                            {renderApplyButton()}
                            <button onClick={handleMessage} className="w-full h-[52px] rounded-full border border-slate-200 bg-white font-semibold text-[15px] text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] shadow-sm flex items-center justify-center gap-2">
                                Nhắn tin cho BTC
                            </button>
                        </div>
                    </div>

                    {/* Mobile CTA (Shows only on mobile below hero) */}
                    <div className="flex md:hidden flex-col gap-3 w-full">
                        {renderApplyButton()}
                        <button onClick={handleMessage} className="w-full h-[52px] rounded-full border border-slate-200 bg-white font-semibold text-[15px] text-slate-700 active:scale-[0.98] shadow-sm flex items-center justify-center">
                            Nhắn tin cho BTC
                        </button>
                    </div>

                    {/* BENTO STATS GRID */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5 w-full mt-2 lg:mt-6">
                        {/* 1. Employment Type */}
                        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] flex flex-col gap-4">
                            <div className="size-12 rounded-full bg-blue-50/80 flex items-center justify-center text-blue-600 shrink-0">
                                <StatClockIcon />
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                                <p className="font-bold text-slate-900 text-[16px] truncate" title={event.event_positions?.length > 1 ? `${event.event_positions.length} vị trí tuyển dụng` : (event.event_positions?.[0]?.title || event.position_type || "Cộng tác viên")}>
                                    {event.event_positions?.length > 1 ? `${event.event_positions.length} vị trí tuyển dụng` : (event.event_positions?.[0]?.title || event.position_type || "Cộng tác viên")}
                                </p>
                                <p className="font-medium text-slate-500 text-[14px]">Vị trí</p>
                            </div>
                        </div>

                        {/* 2. Total Slots */}
                        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] flex flex-col gap-4">
                            <div className="size-12 rounded-full bg-orange-50/80 flex items-center justify-center text-orange-600 shrink-0">
                                <StatCalendarIcon />
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                                <p className="font-bold text-slate-900 text-[16px] truncate">
                                    {event.slots_needed ? `${event.slots_needed} nhân sự` : "Không giới hạn"}
                                </p>
                                <p className="font-medium text-slate-500 text-[14px]">Chỉ tiêu tuyển</p>
                            </div>
                        </div>

                        {/* 3. Location */}
                        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] flex flex-col gap-4">
                            <div className="size-12 rounded-full bg-emerald-50/80 flex items-center justify-center text-emerald-600 shrink-0">
                                <StatLocationIcon />
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                                <p className="font-bold text-slate-900 text-[16px] truncate" title={event.danang_wards?.name ? `${event.danang_wards.name}, Đà Nẵng` : "Đà Nẵng"}>
                                    {event.danang_wards?.name ? `${event.danang_wards.name}, Đà Nẵng` : "Đà Nẵng"}
                                </p>
                                <p className="font-medium text-slate-500 text-[14px]">Địa điểm</p>
                            </div>
                        </div>

                        {/* 4. Salary */}
                        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] flex flex-col gap-4">
                            <div className="size-12 rounded-full bg-purple-50/80 flex items-center justify-center text-purple-600 shrink-0">
                                <StatDollarIcon />
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                                {(() => {
                                    const positions = event.event_positions || []
                                    let salaryText = formatSalary(event.salary_amount, event.salary_type)
                                    if (positions.length > 1) {
                                        const nonVol = positions.filter((p: any) => p.salary_type !== "volunteer")
                                        if (nonVol.length === 0) {
                                            salaryText = "Tình nguyện viên"
                                        } else {
                                            const amounts = nonVol.map((p: any) => Number(p.salary_amount) || 0)
                                            const min = Math.min(...amounts)
                                            const max = Math.max(...amounts)
                                            salaryText = min === max
                                                ? formatSalary(min, nonVol[0].salary_type)
                                                : `${min.toLocaleString("vi-VN")} - ${max.toLocaleString("vi-VN")} đ`
                                        }
                                    }
                                    return (
                                        <p className="font-bold text-slate-900 text-[16px] truncate" title={salaryText}>
                                            {salaryText}
                                        </p>
                                    )
                                })()}
                                <p className="font-medium text-slate-500 text-[14px]">Mức thù lao</p>
                            </div>
                        </div>
                    </div>

                    {/* SPLIT CONTENT LAYOUT */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 w-full mt-2 lg:mt-6">
                        
                        {/* LEFT: 2/3 Main Content */}
                        <div className="lg:col-span-2 flex flex-col gap-8 lg:gap-10">
                            
                            {/* 1. VỊ TRÍ ĐANG TUYỂN DỤNG (Chỉ hiển thị khi có >1 vị trí) */}
                            {event.event_positions && event.event_positions.length > 1 && (
                                <div className="flex flex-col gap-6 w-full">
                                    <div className="flex items-center gap-3">
                                        <h2 className="font-bold text-slate-900 text-2xl tracking-tight">Vị trí đang tuyển</h2>
                                        <span className="text-[12px] font-bold px-3 py-1 rounded-full bg-slate-200 text-slate-700">
                                            {event.event_positions.length} vị trí
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                        {event.event_positions.map((pos: any) => {
                                            const isSelectedByUser = userApplication?.position_id === pos.id
                                            return (
                                                <div
                                                    key={pos.id}
                                                    className={cn(
                                                        "bg-white rounded-[1.5rem] border p-6 flex flex-col justify-between gap-5 transition-all duration-300 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]",
                                                        isSelectedByUser
                                                            ? "border-slate-900 ring-1 ring-slate-900/10 bg-slate-900/5"
                                                            : "border-slate-100 hover:border-slate-300"
                                                    )}
                                                >
                                                    <div className="flex flex-col gap-4">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <h3 className="font-bold text-slate-900 text-[17px] leading-snug">
                                                                {pos.title}
                                                            </h3>
                                                            {isSelectedByUser && (
                                                                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-900 text-white shrink-0 uppercase tracking-wide">
                                                                    Đã chọn
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2 flex-wrap text-[13px]">
                                                            <span className="px-3 py-1.5 rounded-lg bg-slate-100 font-medium text-slate-700">
                                                                Cần tuyển: {pos.slots_needed}
                                                            </span>
                                                            <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold">
                                                                {formatSalary(pos.salary_amount, pos.salary_type)}
                                                            </span>
                                                        </div>

                                                        {pos.description && (
                                                            <p className="text-[14px] text-slate-500 leading-relaxed">
                                                                {pos.description}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {!applyStatus && role !== "organizer" && (
                                                        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                                                            <button
                                                                type="button"
                                                                onClick={() => openApplyModal(pos.id)}
                                                                disabled={disabledApply || isPastDeadline}
                                                                className="text-[14px] font-semibold text-orange-600 hover:text-orange-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
                                                            >
                                                                <span>Ứng tuyển vị trí này</span>
                                                                <ChevronRight className="size-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* 2. MÔ TẢ & QUYỀN LỢI (Double-Bezel Card) */}
                            {(descriptionLines.length > 0 || benefitsList.length > 0) && (
                                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-12 flex flex-col gap-12">
                                    
                                    {/* Mô tả công việc */}
                                    {descriptionLines.length > 0 && (
                                        <div className="flex flex-col gap-6">
                                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Mô tả công việc</h2>
                                            <ul className="flex flex-col gap-4">
                                                {descriptionLines.map((line: string, index: number) => (
                                                    <li key={index} className="flex items-start gap-4 text-slate-600 text-[17px] leading-[1.7]">
                                                        <div className="mt-1 shrink-0 size-6 rounded-full bg-orange-50 flex items-center justify-center">
                                                            <Check className="size-3.5 text-orange-500 stroke-[3]" />
                                                        </div>
                                                        <span className="pt-0.5">{line.replace(/^[-*•]\s*/, "")}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Quyền lợi */}
                                    {benefitsList.length > 0 && (
                                        <div className="flex flex-col gap-6">
                                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Quyền lợi & Đãi ngộ</h2>
                                            <ul className="flex flex-col gap-4">
                                                {benefitsList.map((benefit: string, index: number) => (
                                                    <li key={index} className="flex items-start gap-4 text-slate-600 text-[17px] leading-[1.7]">
                                                        <div className="mt-1 shrink-0 size-6 rounded-full bg-emerald-50 flex items-center justify-center">
                                                            <Check className="size-3.5 text-emerald-500 stroke-[3]" />
                                                        </div>
                                                        <span className="pt-0.5">{benefit.replace(/^[-*•]\s*/, "")}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                </div>
                            )}

                        </div>

                        {/* RIGHT: 1/3 Sidebar Sticky */}
                        <div className="lg:col-span-1 hidden lg:block">
                            <div className="sticky top-28 bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 flex flex-col gap-8">
                                <div className="flex flex-col gap-2">
                                    <h3 className="font-bold text-slate-900 text-[20px] tracking-tight">Về nhà tổ chức</h3>
                                    <p className="text-[14px] text-slate-500 font-medium">Đơn vị đăng tải sự kiện này</p>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    <div className="size-[60px] shrink-0 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden">
                                        <img 
                                            src={event.profiles?.avatar_url || DEFAULT_COMPANY_LOGO} 
                                            alt="Logo"
                                            className="size-full object-cover"
                                            onError={(e: any) => {
                                                e.target.onerror = null
                                                e.target.src = DEFAULT_COMPANY_LOGO
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-bold text-slate-900 text-[16px] truncate">{event.profiles?.full_name}</span>
                                        <span className="text-[14px] text-slate-500 truncate mt-0.5">Tổ chức sự kiện</span>
                                    </div>
                                </div>

                                {event.profiles?.bio && (
                                    <p className="text-[15px] text-slate-600 line-clamp-4 leading-[1.7]">
                                        {event.profiles.bio}
                                    </p>
                                )}
                                
                                <button 
                                    onClick={() => navigate(companyUrl)} 
                                    className="h-12 w-full rounded-xl bg-slate-50 text-slate-700 font-semibold text-[15px] hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    Xem hồ sơ tổ chức
                                    <ChevronRight className="size-4" />
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* SIMILAR JOBS */}
                    {similarJobs.length > 0 && (
                        <div className="flex flex-col gap-8 items-start w-full mt-10 lg:mt-16">
                            <div className="flex items-center justify-between w-full">
                                <h2 className="font-bold text-slate-900 text-2xl tracking-tight">
                                    Sự kiện tương tự
                                </h2>
                                <button
                                    onClick={() => navigate("/events")}
                                    className="hidden sm:flex items-center gap-1.5 text-slate-500 hover:text-slate-900 font-semibold text-[15px] transition-colors"
                                >
                                    <span>Xem tất cả</span>
                                    <ChevronRight className="size-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
                                {similarJobs.slice(0, 6).map((job) => (
                                    <EventCard
                                        key={job.id}
                                        job={job}
                                    />
                                ))}
                            </div>
                            
                            <button
                                onClick={() => navigate("/events")}
                                className="flex sm:hidden items-center justify-center gap-2 w-full h-12 rounded-full bg-slate-100 text-slate-700 font-semibold text-[15px] mt-2"
                            >
                                Xem tất cả sự kiện <ChevronRight className="size-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL ỨNG TUYỂN VỊ TRÍ */}
            <ApplyPositionModal
                isOpen={isApplyModalOpen}
                onClose={() => setIsApplyModalOpen(false)}
                event={event}
                selectedPositionId={selectedPositionId}
                onSelectPosition={setSelectedPositionId}
                onConfirm={handleConfirmApply}
                isApplying={isApplying}
                profile={profile}
                user={user}
            />

        </MainLayout>
    )
}