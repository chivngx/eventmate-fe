"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "@/lib/router"
import { supabase } from "@/lib/supabase"
import { getUserFacingMessage } from "@/lib/error"
import { useUser } from "@/components/providers/AuthProvider"
import MainLayout from "@/components/layout/MainLayout"
import {
    CheckCircle2,
    XCircle,
    Clock3,
    ChevronRight,
    ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/providers/ToastProvider"
import { SkeletonEventDetail } from "@/components/ui/skeleton"
import { Modal } from "@/components/ui/modal"
import { formatSalary } from "@/lib/utils"
import VerifiedBadge from "@/components/ui/verified-badge"
import EventCard from "./components/EventCard"
import { calculateProfileCompletion } from "@/lib/profile-completion"

interface SimilarJob {
    id: string
    slug: string | null
    title: string
    category: string | null
    position_type: string | null
    salary_amount: number | null
    salary_type: string | null
    created_at: string | null
    location?: string | null
    danang_wards?: { name: string } | null
    profiles?: {
        full_name: string | null
        avatar_url: string | null
        is_verified?: boolean
    } | null
}

// Bookmark Icon matching Figma (24x24)
function BookmarkIcon({ active = false }: { active?: boolean }) {
    return (
        <svg className="size-[24px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M5 4C5 2.89543 5.89543 2 7 2H17C18.1046 2 19 2.89543 19 4V21.5C19 21.8492 18.5997 22.0435 18.3248 21.8276L12 16.8571L5.67523 21.8276C5.40034 22.0435 5 21.8492 5 21.5V4Z"
                fill={active ? "#005DDC" : "none"}
                stroke={active ? "#005DDC" : "#222222"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

// 4 Figma Outline Icons for Key Stats Bar (40x40 - Node 6365:34789)
function StatClockIcon() {
    return (
        <svg className="size-[40px] shrink-0" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2.08333C10.12 2.08333 2.08333 10.12 2.08333 20C2.08333 29.88 10.12 37.9167 20 37.9167C29.88 37.9167 37.9167 29.88 37.9167 20C37.9167 10.12 29.88 2.08333 20 2.08333ZM20 35.4167C11.4983 35.4167 4.58333 28.5017 4.58333 20C4.58333 11.4983 11.4983 4.58333 20 4.58333C28.5017 4.58333 35.4167 11.4983 35.4167 20C35.4167 28.5017 28.5017 35.4167 20 35.4167ZM25.8834 24.1166C26.3717 24.605 26.3717 25.3967 25.8834 25.885C25.64 26.1283 25.32 26.2516 25 26.2516C24.68 26.2516 24.36 26.13 24.1166 25.885L19.1166 20.885C18.8816 20.65 18.75 20.3316 18.75 20.0016V11.6683C18.75 10.9783 19.31 10.4183 20 10.4183C20.69 10.4183 21.25 10.9783 21.25 11.6683V19.4832L25.8834 24.1166Z" fill="#222222" />
        </svg>
    )
}

function StatCalendarIcon() {
    return (
        <svg className="size-[40px] shrink-0" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.3333 32.0833H8.33333C5.705 32.0833 4.58333 30.9617 4.58333 28.3333V14.5833H32.0833V18.3333C32.0833 19.0233 32.6433 19.5833 33.3333 19.5833C34.0233 19.5833 34.5833 19.0233 34.5833 18.3333V10.8333C34.5833 6.80333 32.3633 4.58333 28.3333 4.58333H26.25V3.33333C26.25 2.64333 25.69 2.08333 25 2.08333C24.31 2.08333 23.75 2.64333 23.75 3.33333V4.58333H12.9167V3.33333C12.9167 2.64333 12.3567 2.08333 11.6667 2.08333C10.9767 2.08333 10.4167 2.64333 10.4167 3.33333V4.58333H8.33333C4.30333 4.58333 2.08333 6.80333 2.08333 10.8333V28.3333C2.08333 32.3633 4.30333 34.5833 8.33333 34.5833H18.3333C19.0233 34.5833 19.5833 34.0233 19.5833 33.3333C19.5833 32.6433 19.0233 32.0833 18.3333 32.0833ZM8.33333 7.08333H10.4167V8.33333C10.4167 9.02333 10.9767 9.58333 11.6667 9.58333C12.3567 9.58333 12.9167 9.02333 12.9167 8.33333V7.08333H23.75V8.33333C23.75 9.02333 24.31 9.58333 25 9.58333C25.69 9.58333 26.25 9.02333 26.25 8.33333V7.08333H28.3333C30.9617 7.08333 32.0833 8.205 32.0833 10.8333V12.0833H4.58333V10.8333C4.58333 8.205 5.705 7.08333 8.33333 7.08333ZM13.3667 20C13.3667 20.92 12.6217 21.6667 11.7 21.6667C10.78 21.6667 10.0248 20.92 10.0248 20C10.0248 19.08 10.7633 18.3333 11.6833 18.3333H11.7C12.62 18.3333 13.3667 19.08 13.3667 20ZM20.0334 20C20.0334 20.92 19.2884 21.6667 18.3667 21.6667C17.4467 21.6667 16.6915 20.92 16.6915 20C16.6915 19.08 17.43 18.3333 18.35 18.3333H18.3667C19.2867 18.3333 20.0334 19.08 20.0334 20ZM30 22.0833C25.635 22.0833 22.0833 25.635 22.0833 30C22.0833 34.365 25.635 37.9167 30 37.9167C34.365 37.9167 37.9167 34.365 37.9167 30C37.9167 25.635 34.365 22.0833 30 22.0833ZM30 35.4167C27.0133 35.4167 24.5833 32.9867 24.5833 30C24.5833 27.0133 27.0133 24.5833 30 24.5833C32.9867 24.5833 35.4167 27.0133 35.4167 30C35.4167 32.9867 32.9867 35.4167 30 35.4167ZM13.3667 26.6667C13.3667 27.5867 12.6217 28.3333 11.7 28.3333C10.78 28.3333 10.0248 27.5867 10.0248 26.6667C10.0248 25.7467 10.7633 25 11.6833 25H11.7C12.62 25 13.3667 25.7467 13.3667 26.6667ZM32.6701 30.9017C33.1584 31.3884 33.1584 32.1818 32.6701 32.6701C32.4268 32.9134 32.1067 33.0367 31.7867 33.0367C31.4667 33.0367 31.1467 32.9151 30.9033 32.6701L29.1182 30.885C28.8832 30.65 28.7516 30.3333 28.7516 30.0016V27.5016C28.7516 26.8116 29.3116 26.2516 30.0016 26.2516C30.6916 26.2516 31.2516 26.8116 31.2516 27.5016V29.4832L32.6701 30.9017Z" fill="#222222" />
        </svg>
    )
}

function StatLocationIcon() {
    return (
        <svg className="size-[40px] shrink-0" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.1667 3.33333C11.3548 3.33333 5 10.0427 5 18.2906C5 27.0393 12.6047 32.3418 17.6367 35.8512L18.4931 36.4513C18.6971 36.5949 18.9319 36.6667 19.1667 36.6667C19.4014 36.6667 19.6362 36.5949 19.8402 36.4513L20.6967 35.8512C25.7287 32.3418 33.3333 27.0393 33.3333 18.2906C33.3333 10.0427 26.9786 3.33333 19.1667 3.33333ZM19.3593 33.7111L19.1667 33.8463L18.974 33.7111C14.1007 30.3128 7.42857 25.6598 7.42857 18.2906C7.42857 11.4564 12.6937 5.89744 19.1667 5.89744C25.6396 5.89744 30.9048 11.4564 30.9048 18.2906C30.9048 25.6598 24.2311 30.3145 19.3593 33.7111ZM19.1667 12.735C16.2653 12.735 13.9048 15.2273 13.9048 18.2906C13.9048 21.3538 16.2653 23.8462 19.1667 23.8462C22.068 23.8462 24.4286 21.3538 24.4286 18.2906C24.4286 15.2273 22.068 12.735 19.1667 12.735ZM19.1667 21.2821C17.6043 21.2821 16.3333 19.9402 16.3333 18.2906C16.3333 16.641 17.6043 15.2991 19.1667 15.2991C20.729 15.2991 22 16.641 22 18.2906C22 19.9402 20.729 21.2821 19.1667 21.2821Z" fill="#222222" />
        </svg>
    )
}

function StatDollarIcon() {
    return (
        <svg className="size-[40px] shrink-0" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2.08333C10.12 2.08333 2.08333 10.12 2.08333 20C2.08333 29.88 10.12 37.9167 20 37.9167C29.88 37.9167 37.9167 29.88 37.9167 20C37.9167 10.12 29.88 2.08333 20 2.08333ZM20 35.4167C11.4983 35.4167 4.58333 28.5017 4.58333 20C4.58333 11.4983 11.4983 4.58333 20 4.58333C28.5017 4.58333 35.4167 11.4983 35.4167 20C35.4167 28.5017 28.5017 35.4167 20 35.4167ZM21.6433 19.1201L18.9633 18.455C18.55 18.3517 18.1983 18.1199 17.9333 17.7816C17.6833 17.4649 17.545 17.0583 17.545 16.64C17.545 15.6083 18.3833 14.7701 19.415 14.7701H20.5817C21.535 14.7701 22.3333 15.4868 22.4417 16.4368C22.5183 17.1234 23.13 17.6201 23.8233 17.5401C24.51 17.4634 25.0033 16.8449 24.9267 16.1582C24.7017 14.1549 23.1516 12.61 21.2116 12.3283V11.6667C21.2116 10.9767 20.6516 10.4167 19.9616 10.4167C19.2716 10.4167 18.7116 10.9767 18.7116 11.6667V12.3401C16.6366 12.6801 15.045 14.4701 15.045 16.6384C15.045 17.6167 15.3733 18.5734 15.965 19.3201C16.5583 20.0851 17.405 20.6383 18.355 20.8783L21.035 21.5434C21.87 21.755 22.4533 22.5017 22.4533 23.3584C22.4533 23.855 22.2583 24.3233 21.9033 24.6783C21.5483 25.0333 21.08 25.2283 20.5833 25.2283H19.4167C18.4633 25.2283 17.665 24.5116 17.5567 23.5616C17.48 22.8749 16.8533 22.375 16.175 22.4583C15.4883 22.535 14.995 23.1533 15.0717 23.8399C15.2933 25.8183 16.8066 27.3534 18.7116 27.6617V28.3333C18.7116 29.0233 19.2716 29.5833 19.9616 29.5833C20.6516 29.5833 21.2116 29.0233 21.2116 28.3333V27.6701C22.1366 27.5351 22.995 27.125 23.67 26.45C24.4967 25.6233 24.9533 24.5266 24.9533 23.3616C24.9533 21.3566 23.595 19.6151 21.6433 19.1201Z" fill="#222222" />
        </svg>
    )
}

export default function EventDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { showToast } = useToast()
    const { user, role, profile, loading: authLoading } = useUser()
    const completionStats = useMemo(() => {
        return calculateProfileCompletion({
            fullName: profile?.full_name,
            avatarUrl: profile?.avatar_url,
            phone: profile?.phone,
            university: profile?.university,
            skills: profile?.skills,
            bio: profile?.bio,
        })
    }, [profile])
    const [event, setEvent] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [applyStatus, setApplyStatus] = useState<string | null>(null)
    const [isApplying, setIsApplying] = useState(false)
    const [showApplyModal, setShowApplyModal] = useState(false)
    const [studentNote, setStudentNote] = useState("")
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [similarJobs, setSimilarJobs] = useState<SimilarJob[]>([])

    useEffect(() => {
        if (authLoading) return
        const fetchEventDetails = async () => {
            setLoading(true)
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || "")
            let eventQuery = supabase
                .from("events")
                .select("*, profiles(id, full_name, avatar_url, slug, scale, address, is_verified, bio), danang_wards(name)")

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
                    navigate(`/events/${eventData.slug}`, { replace: true })
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

                // Lấy danh sách việc làm tương tự (tối đa 6 items)
                fetchSimilarJobs(eventData.id, eventData.category)
            } else {
                console.error("Lỗi hoặc không tìm thấy sự kiện", error)
            }
            setLoading(false)
        }

        fetchEventDetails()
    }, [id, user, role, authLoading, navigate])

    const fetchSimilarJobs = async (currentEventId: string, category: string | null) => {
        try {
            let query = supabase
                .from("events")
                .select("id, slug, title, category, position_type, salary_amount, salary_type, created_at, danang_wards(name), profiles(full_name, avatar_url, is_verified)")
                .neq("id", currentEventId)
                .order("created_at", { ascending: false })
                .limit(6)

            if (category) {
                query = query.eq("category", category)
            }

            const { data, error } = await query
            if (!error && data && data.length > 0) {
                setSimilarJobs(data as any)
            } else {
                // Fallback nếu không có cùng category, lấy các sự kiện khác mới nhất
                const { data: fallbackData } = await supabase
                    .from("events")
                    .select("id, slug, title, category, position_type, salary_amount, salary_type, created_at, danang_wards(name), profiles(full_name, avatar_url, is_verified)")
                    .neq("id", currentEventId)
                    .order("created_at", { ascending: false })
                    .limit(6)

                if (fallbackData && fallbackData.length > 0) {
                    setSimilarJobs(fallbackData as any)
                } else {
                    setSimilarJobs([])
                }
            }
        } catch (_err) {
            setSimilarJobs([])
        }
    }

    const handleOpenApplyModal = () => {
        if (!user) {
            navigate("/login")
            return
        }
        if (!event || isApplying) return
        setShowApplyModal(true)
    }

    const handleApply = async () => {
        if (!user) {
            navigate("/login")
            return
        }
        if (!event || isApplying) return
        setIsApplying(true)

        try {
            const { error } = await supabase.from("applications").insert([
                {
                    event_id: event.id,
                    student_id: user.id,
                    student_note: studentNote.trim() || null
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
                setShowApplyModal(false)
                setStudentNote("")
                showToast({
                    title: "Ứng tuyển thành công",
                    message: "Đơn ứng tuyển của bạn đã được gửi tới Ban tổ chức!",
                    type: "success",
                    actionLink: "/dashboard",
                    actionText: "Xem Dashboard"
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
        if (!user) {
            navigate("/login")
            return
        }
        if (event?.organizer_id === user.id) {
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
        if (!user) {
            navigate("/login")
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
            <MainLayout role="guest">
                <div className="text-center py-24">
                    <h2 className="text-2xl font-bold text-slate-900">Không tìm thấy sự kiện</h2>
                    <p className="text-slate-500 mt-2">Sự kiện này có thể đã bị xóa hoặc không tồn tại.</p>
                    <Button onClick={() => navigate(-1)} className="mt-5 rounded-xl bg-slate-900 text-white hover:bg-slate-800">
                        Quay lại
                    </Button>
                </div>
            </MainLayout>
        )
    }

    const isPastDeadline = event.application_deadline ? new Date() > new Date(event.application_deadline) : false
    const disabledApply = isApplying || event.status !== "upcoming"

    // Render Apply Button State
    const renderApplyButton = () => {
        if (role === "organizer") return null

        if (applyStatus === "approved") {
            return (
                <button
                    disabled
                    className="h-[40px] px-[16px] rounded-[8px] font-medium text-[16px] bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center gap-2 cursor-default shrink-0"
                >
                    <CheckCircle2 className="size-[16px] text-emerald-600" /> Trúng tuyển
                </button>
            )
        }
        if (applyStatus === "rejected") {
            return (
                <button
                    disabled
                    className="h-[40px] px-[16px] rounded-[8px] font-medium text-[16px] bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center gap-2 cursor-default shrink-0"
                >
                    <XCircle className="size-[16px] text-rose-600" /> Chưa phù hợp
                </button>
            )
        }
        if (applyStatus === "pending") {
            return (
                <button
                    disabled
                    className="h-[40px] px-[16px] rounded-[8px] font-medium text-[16px] bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center gap-2 cursor-default shrink-0"
                >
                    <Clock3 className="size-[16px] text-slate-500" /> Đang chờ duyệt
                </button>
            )
        }

        return (
            <button
                onClick={handleOpenApplyModal}
                disabled={disabledApply || isPastDeadline}
                className="bg-[#005ddc] hover:bg-[#004bb3] text-white h-[40px] px-[16px] min-w-[147px] rounded-[8px] font-medium text-[16px] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-none flex items-center justify-center cursor-pointer shrink-0"
            >
                {isApplying ? "Đang xử lý..." : isPastDeadline ? "Đã hết hạn" : event.status !== "upcoming" ? "Đã đóng đơn" : "Ứng tuyển ngay"}
            </button>
        )
    }

    // Default benefits bullets if not defined
    const benefitsList = event.benefits
        ? event.benefits.split("\n").filter((item: string) => item.trim().length > 0)
        : [
            "Được cấp giấy chứng nhận (Certificate) tham gia sự kiện chính thức",
            "Hỗ trợ phụ cấp ăn uống và chi phí đi lại theo ca làm việc",
            "Được tập huấn kỹ năng điều phối, xử lý tình huống thực tế trước sự kiện",
            "Môi trường làm việc trẻ trung, năng động, mở rộng mạng lưới quan hệ",
            "Cơ hội ưu tiên tuyển dụng vào các sự kiện quy mô lớn tiếp theo tại Đà Nẵng"
        ]

    // Default description bullets
    const descriptionLines = event.description && event.description.trim().length > 0
        ? event.description.split("\n").filter((item: string) => item.trim().length > 0)
        : [
            "Hỗ trợ ban tổ chức trong công tác đón tiếp, hướng dẫn và điều phối khách mời.",
            "Tham gia chuẩn bị khu vực tổ chức, tài liệu, vật phẩm và trang thiết bị sự kiện.",
            "Thực hiện quy trình check-in, kiểm soát vé và giải đáp thắc mắc của người tham dự.",
            "Phối hợp nhịp nhàng cùng các thành viên trong đội nhóm và tuân thủ phân công của trưởng ban.",
            "Đảm bảo tác phong chuẩn mực, nhiệt tình và trách nhiệm trong suốt thời gian diễn ra sự kiện."
        ]

    const completionPercent = profile ? completionStats.percent : 0
    const progressRadius = 28
    const progressCircumference = 2 * Math.PI * progressRadius
    const safePercent = Math.min(Math.max(completionPercent, 0), 100)
    const progressOffset = progressCircumference - (progressCircumference * safePercent) / 100
    const userAvatar = profile?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&h=128&q=80"

    return (
        <MainLayout role={role || "guest"} fullWidth={true}>
            <div className="bg-white min-h-screen pb-20 pt-6 sm:pt-10">
                <div className="w-full max-w-[1232px] mx-auto px-4 sm:px-6 lg:px-0 flex flex-col gap-[48px]">

                    {/* ZALO COORDINATION BANNER (For Approved Students) */}
                    {applyStatus === "approved" && event.zalo_group_link && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
                            <div className="flex items-center gap-3.5">
                                <div className="size-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
                                    <ExternalLink className="size-5" />
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
                                Vào nhóm Zalo <ExternalLink className="size-4" />
                            </a>
                        </div>
                    )}

                    {/* TOP HERO ROW: Job Header Left & Profile Card Right (Figma: Frame 2147225888 - node 6365:34765) */}
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-6 lg:gap-12 w-full" data-node-id="6365:34765">
                        {/* LEFT: Logo + Title + Buttons (Figma: Frame 2147225887 w-742 - node 6365:34766) */}
                        <div className="flex flex-col sm:flex-row items-start gap-[16px] flex-1 min-w-0" data-node-id="6365:34766">
                            {/* Company Logo (Figma: size 117x117 rounded-full - node 6365:34767) */}
                            <div className="relative size-[100px] sm:size-[117px] rounded-full shrink-0 overflow-hidden bg-slate-100 flex items-center justify-center border border-[#EDEDED]" data-node-id="6365:34767">
                                <img
                                    alt={event.profiles?.full_name || "Company Logo"}
                                    className="size-full object-cover rounded-full"
                                    src={
                                        event.profiles?.avatar_url ||
                                        "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=160&h=160&q=80"
                                    }
                                    onError={(e: any) => {
                                        e.target.onerror = null
                                        e.target.src = "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=160&h=160&q=80"
                                    }}
                                />
                            </div>

                            {/* Job Details Stack (Figma: Frame 2147225756 w-609 - node 6365:34768) */}
                            <div className="flex-1 min-w-0 flex flex-col gap-[16px]" data-node-id="6365:34768">
                                <div className="flex flex-col gap-[4px]" data-node-id="6365:34769">
                                    {/* Company Name + Verified Check (Figma: Frame 2147224607 - node 6365:34770) */}
                                    <div className="flex items-center gap-[6px]" data-node-id="6365:34770">
                                        <button
                                            onClick={() => navigate(`/companies/${event.profiles?.slug || event.organizer_id}`)}
                                            className="text-[14px] font-normal text-[#515151] hover:text-[#005DDC] transition-colors cursor-pointer"
                                            data-node-id="6365:34771"
                                        >
                                            {event.profiles?.full_name || "BMW"}
                                        </button>
                                        <div className="size-[16px] shrink-0 flex items-center justify-center" data-node-id="6365:34772" data-name="badge-check">
                                            <VerifiedBadge variant="icon" />
                                        </div>
                                    </div>

                                    {/* Job Title + Bookmark (Figma: Frame 2147225268 - node 6365:34773) */}
                                    <div className="flex items-center gap-[8px] flex-wrap" data-node-id="6365:34773">
                                        <h1 className="text-[24px] font-medium text-[#222222] tracking-tight leading-[normal]" data-node-id="6365:34774">
                                            {event.title || "UI/UX Designer"}
                                        </h1>
                                        <button
                                            onClick={toggleBookmark}
                                            title={isBookmarked ? "Bỏ lưu sự kiện" : "Lưu sự kiện"}
                                            aria-label="Lưu sự kiện"
                                            className="cursor-pointer size-[24px] flex items-center justify-center hover:opacity-80 transition-opacity shrink-0"
                                            data-node-id="6365:34775"
                                            data-name="New BookMark"
                                        >
                                            <BookmarkIcon active={isBookmarked} />
                                        </button>
                                    </div>
                                </div>

                                {/* Short Summary (Figma: text 16px leading 1.6 #757575 w-571 - node 6365:34776) */}
                                <p className="text-[16px] text-[#757575] font-normal leading-[1.6] max-w-[571px] line-clamp-2" data-node-id="6365:34776">
                                    {event.description
                                        ? event.description.split("\n")[0]
                                        : "A Senior UX Designer is a pivotal member of product development teams, responsible for ensuring that digital"}
                                </p>

                                {/* Action Buttons (Figma: Frame 2147225755 - node 6365:34777) */}
                                <div className="flex items-center gap-[16px] pt-[2px] flex-wrap" data-node-id="6365:34777">
                                    {renderApplyButton()}
                                    <button
                                        onClick={handleMessage}
                                        className="border border-[#005DDC] text-[#005DDC] bg-white hover:bg-[#EFF5FF] h-[40px] px-[16px] min-w-[147px] rounded-[8px] font-medium text-[16px] transition-all active:scale-[0.98] shadow-none flex items-center justify-center cursor-pointer shrink-0"
                                        data-name="Buttons"
                                    >
                                        Nhắn tin
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Profile Resume Completion Card (Figma: profile card - node 6365:34780 w-282 h-187) */}
                        <div className="w-full lg:w-[282px] bg-[#FCFCFC] border border-[#ECECEC] rounded-[8px] p-[16px] flex flex-col gap-[8px] items-center justify-center shrink-0 min-h-[187px]" data-node-id="6365:34780" data-name="profile card">
                            {/* Circular Avatar Progress Gauge (Figma: Frame 2147225274 size 64x64 border 2.25px - node 6365:34781) */}
                            <div className="relative size-[64px] flex items-center justify-center shrink-0" data-node-id="6365:34781">
                                <svg className="absolute inset-0 size-full transform -rotate-90" viewBox="0 0 64 64">
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r={progressRadius}
                                        stroke="#CBCBCB"
                                        strokeWidth="2.5"
                                        fill="none"
                                    />
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r={progressRadius}
                                        stroke="#005DDC"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeDasharray={progressCircumference}
                                        strokeDashoffset={progressOffset}
                                        fill="none"
                                        className="transition-all duration-700 ease-out"
                                    />
                                </svg>
                                <div className="size-[50px] rounded-full overflow-hidden flex items-center justify-center bg-white z-10 shadow-2xs">
                                    <img
                                        alt="User Avatar"
                                        className="size-full object-cover"
                                        src={userAvatar}
                                        onError={(e: any) => {
                                            e.target.onerror = null
                                            e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&h=128&q=80"
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Resume Completion & Subtitle (Figma: Frame 2147224730 - node 6365:34783) */}
                            <div className="flex flex-col gap-[4px] items-center text-center" data-node-id="6365:34783">
                                <div className="flex flex-col gap-[4px] items-center text-center" data-node-id="6365:34784">
                                    <p className="font-semibold text-[#222222] text-[12px] whitespace-nowrap text-center" data-node-id="6365:34785">
                                        <span className="text-[#005DDC]">{completionPercent}%</span> hồ sơ đã hoàn thiện
                                    </p>
                                    <p className="font-normal text-[#757575] text-[10px] leading-[normal] w-[170px] text-center" data-node-id="6365:34786">
                                        Gần xong rồi! Hãy bổ sung thêm thông tin nhé.
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate("/profile")}
                                    className="h-[32px] px-[16px] rounded-[8px] text-[#003E93] hover:text-[#002A66] hover:bg-blue-50/60 font-medium text-[14px] leading-[1.6] transition-colors cursor-pointer flex items-center justify-center whitespace-nowrap"
                                    data-node-id="6365:34787"
                                    data-name="Buttons"
                                >
                                    Hoàn thiện hồ sơ
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* HORIZONTAL DIVIDER LINE (Figma: Line 168) */}
                    <div className="w-full h-px bg-[#ededed]" />

                    {/* 4-COLUMN ACHIEVEMENT / KEY STATS BAR (Figma: achievement - node 6365:34789) */}
                    <div className="bg-white flex flex-col md:flex-row items-center justify-between py-[34px] w-full gap-6 md:gap-0" data-node-id="6365:34789" data-name="achievement">
                        {/* 1. Employment Type */}
                        <div className="flex gap-[8px] items-center justify-start md:justify-center px-4 w-full md:w-1/4" data-node-id="6365:34790" data-name="Job cart/diffrent states/achievement">
                            <StatClockIcon />
                            <div className="flex flex-col items-start justify-center min-w-0">
                                <div className="flex items-center mb-[-2px]">
                                    <p className="font-medium text-[#222222] text-[16px] truncate leading-normal">
                                        {event.position_type || "Toàn thời gian"}
                                    </p>
                                </div>
                                <p className="font-normal text-[#757575] text-[14px] leading-normal whitespace-nowrap">
                                    Hình thức làm việc
                                </p>
                            </div>
                        </div>

                        {/* Divider 1 */}
                        <div className="hidden md:block h-[52px] w-px bg-[#ededed] shrink-0" data-node-id="6365:34791" />

                        {/* 2. Experience Level */}
                        <div className="flex gap-[8px] items-center justify-start md:justify-center px-4 w-full md:w-1/4" data-node-id="6365:34792" data-name="Job cart/diffrent states/achievement">
                            <StatCalendarIcon />
                            <div className="flex flex-col items-start justify-center min-w-0">
                                <div className="flex items-center mb-[-2px]">
                                    <p className="font-medium text-[#222222] text-[16px] truncate leading-normal">
                                        {event.slots_needed ? `${event.slots_needed} vị trí tuyển` : "Không giới hạn"}
                                    </p>
                                </div>
                                <p className="font-normal text-[#757575] text-[14px] leading-normal whitespace-nowrap">
                                    Số lượng tuyển
                                </p>
                            </div>
                        </div>

                        {/* Divider 2 */}
                        <div className="hidden md:block h-[52px] w-px bg-[#ededed] shrink-0" data-node-id="6365:34793" />

                        {/* 3. Location */}
                        <div className="flex gap-[8px] items-center justify-start md:justify-center px-4 w-full md:w-1/4" data-node-id="6365:34794" data-name="Job cart/diffrent states/achievement">
                            <StatLocationIcon />
                            <div className="flex flex-col items-start justify-center min-w-0">
                                <div className="flex items-center mb-[-2px]">
                                    <p className="font-medium text-[#222222] text-[16px] truncate leading-normal" title={event.danang_wards?.name ? `${event.danang_wards.name}, Đà Nẵng` : "Đà Nẵng"}>
                                        {event.danang_wards?.name ? `${event.danang_wards.name}, Đà Nẵng` : "Đà Nẵng"}
                                    </p>
                                </div>
                                <p className="font-normal text-[#757575] text-[14px] leading-normal whitespace-nowrap">
                                    Địa điểm
                                </p>
                            </div>
                        </div>

                        {/* Divider 3 */}
                        <div className="hidden md:block h-[52px] w-px bg-[#ededed] shrink-0" data-node-id="6365:34795" />

                        {/* 4. Salary */}
                        <div className="flex gap-[8px] items-center justify-start md:justify-center px-4 w-full md:w-1/4" data-node-id="6365:34796" data-name="Job cart/diffrent states/achievement">
                            <StatDollarIcon />
                            <div className="flex flex-col items-start justify-center min-w-0">
                                <div className="flex items-center mb-[-2px]">
                                    <p className="font-medium text-[#222222] text-[16px] truncate leading-normal" title={formatSalary(event.salary_amount, event.salary_type)}>
                                        {formatSalary(event.salary_amount, event.salary_type)}
                                    </p>
                                </div>
                                <p className="font-normal text-[#757575] text-[14px] leading-normal whitespace-nowrap">
                                    Mức thù lao
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT STACK (Figma: Frame 2147225834 gap-88) */}
                    <div className="flex flex-col gap-[48px] w-full">

                        {/* 1. OVERVIEW (Figma: Frame 2147225680) */}
                        <div className="flex flex-col gap-[16px] items-start w-full">
                            <h2 className="font-semibold text-[#222222] text-[18px] leading-[normal]">
                                Overview
                            </h2>
                            <p className="font-normal text-[#282828] text-[16px] leading-[1.6] w-full">
                                {event.description
                                    ? event.description
                                    : "Thông tin tổng quan sự kiện đang được cập nhật."}
                            </p>
                        </div>

                        {/* 2. JOB DESCRIPTION (Figma: Frame 2147225681) */}
                        <div className="flex flex-col gap-[16px] items-start w-full">
                            <h2 className="font-semibold text-[#222222] text-[18px] leading-[normal]">
                                Job Description
                            </h2>
                            <ul className="list-disc ms-6 space-y-1 text-[#282828] text-[16px] leading-[1.6] w-full">
                                {descriptionLines.map((line: string, index: number) => (
                                    <li key={index}>
                                        <span>{line.replace(/^[-*•]\s*/, "")}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* 3. WHAT WE OFFER (Figma: Frame 2147225751) */}
                        <div className="flex flex-col gap-[24px] items-start w-full">
                            <div className="flex flex-col gap-[16px] items-start w-full">
                                <h2 className="font-semibold text-[#222222] text-[18px] leading-[normal]">
                                    What we offer
                                </h2>
                                <ul className="list-disc ms-6 space-y-1 text-[#282828] text-[16px] leading-[1.6] w-full">
                                    {benefitsList.map((benefit: string, index: number) => (
                                        <li key={index}>
                                            <span>{benefit.replace(/^[-*•]\s*/, "")}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Badges List (Figma: Frame 2147224614 h-20 bg-[#ededed] text-[#515151]) */}
                            <div className="flex flex-wrap gap-[12px] items-center">
                                {[
                                    event.position_type || "Nhân sự sự kiện",
                                    event.category || "Sự kiện văn hóa",
                                    event.salary_type === "per_shift" ? "Theo ca làm" : event.salary_type === "per_hour" ? "Theo giờ" : event.salary_type === "volunteer" ? "Tình nguyện" : "Theo chiến dịch",
                                    event.danang_wards?.name ? `Khu vực ${event.danang_wards.name}` : "Đà Nẵng",
                                    "Trực tiếp tại sự kiện"
                                ].map((tag, idx) => (
                                    <div key={idx} className="bg-[#ededed] flex h-[24px] items-center justify-center px-[10px] py-[4px] rounded-[4px] shrink-0">
                                        <span className="text-[#515151] text-[12px] font-medium leading-[normal]">
                                            {tag}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 4. VỀ BAN TỔ CHỨC (Figma: Frame 2147225753) */}
                        <div className="flex flex-col gap-[24px] items-start w-full">
                            <div className="flex items-center justify-between w-full">
                                <h2 className="font-semibold text-[#222222] text-[18px] leading-[normal]">
                                    Về ban tổ chức
                                </h2>
                                <button
                                    onClick={() => navigate(`/companies/${event.profiles?.slug || event.organizer_id}`)}
                                    className="flex items-center gap-[4px] text-[#005ddc] hover:text-[#004bb3] text-[14px] font-medium leading-[1.6] cursor-pointer hover:underline"
                                >
                                    <span>Xem chi tiết</span>
                                    <ChevronRight className="size-[18px]" />
                                </button>
                            </div>
                            <p className="font-normal text-[#282828] text-[16px] leading-[1.6] w-full">
                                {event.profiles?.bio ||
                                    event.profiles?.description ||
                                    "Ban tổ chức sự kiện uy tín tại Đà Nẵng kết nối cùng EventMate."}
                            </p>
                        </div>

                        {/* 5. SIMILAR JOBS (Figma: Frame 2147225783) */}
                        {similarJobs.length > 0 && (
                            <div className="flex flex-col gap-[24px] items-start w-full">
                                <div className="flex items-center justify-between w-full">
                                    <h2 className="font-semibold text-[#222222] text-[18px] leading-[normal]">
                                        Similar jobs
                                    </h2>
                                    <button
                                        onClick={() => navigate("/events")}
                                        className="flex items-center gap-[4px] text-[#005ddc] hover:text-[#004bb3] text-[14px] font-medium leading-[1.6] cursor-pointer hover:underline"
                                    >
                                        <span>More</span>
                                        <ChevronRight className="size-[18px]" />
                                    </button>
                                </div>

                                {/* 6-Card Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px] w-full">
                                    {similarJobs.slice(0, 6).map((job) => (
                                        <EventCard
                                            key={job.id}
                                            job={job}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Xác nhận ứng tuyển kèm lời nhắn */}
            <Modal
                isOpen={showApplyModal}
                onClose={() => !isApplying && setShowApplyModal(false)}
                maxWidthClassName="max-w-lg"
                panelClassName="p-6 sm:p-7 rounded-[16px]"
            >
                <div className="space-y-4">
                    <div>
                        <h3 className="text-[18px] font-semibold text-[#222222]">
                            Xác nhận ứng tuyển
                        </h3>
                        <p className="text-[13px] text-[#757575] mt-1">
                            Bạn đang nộp hồ sơ vào vị trí <strong>{event.position_type || "Nhân sự sự kiện"}</strong> của chiến dịch <strong>{event.title}</strong>.
                        </p>
                    </div>

                    <div className="p-3.5 bg-blue-50/70 rounded-[10px] border border-blue-100/80 text-xs text-[#005ddc] space-y-1">
                        <p className="font-semibold">💡 Lưu ý quan trọng:</p>
                        <p className="text-slate-600">Ban tổ chức sẽ xem xét hồ sơ năng lực và kỹ năng từ trang cá nhân của bạn trên EventMate để xét duyệt.</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[13px] font-medium text-[#222222] block">
                            Lời nhắn / Ghi chú gửi Ban tổ chức (không bắt buộc)
                        </label>
                        <textarea
                            value={studentNote}
                            onChange={(e) => setStudentNote(e.target.value)}
                            placeholder="Ví dụ: Em có kinh nghiệm trực check-in các sự kiện lớn, có thể tham gia đầy đủ ca làm từ sáng đến tối..."
                            rows={4}
                            className="w-full px-3.5 py-2.5 text-sm border border-[#ededed] rounded-[8px] focus:outline-none focus:border-[#005ddc] focus:ring-1 focus:ring-[#005ddc] resize-none"
                            maxLength={500}
                        />
                        <div className="flex justify-between text-[11px] text-[#a5a5a5]">
                            <span>Ghi chú ca rảnh hoặc kinh nghiệm nổi bật</span>
                            <span>{studentNote.length}/500</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ededed]">
                        <button
                            type="button"
                            onClick={() => setShowApplyModal(false)}
                            disabled={isApplying}
                            className="px-4 h-9 rounded-[8px] border border-[#ededed] text-xs font-medium text-[#515151] hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="button"
                            onClick={handleApply}
                            disabled={isApplying}
                            className="px-5 h-9 rounded-[8px] bg-[#005ddc] hover:bg-[#004eb7] text-white text-xs font-medium transition-colors cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-50"
                        >
                            {isApplying ? "Đang gửi..." : "Gửi đơn ứng tuyển"}
                        </button>
                    </div>
                </div>
            </Modal>
        </MainLayout>
    )
}