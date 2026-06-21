import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import MainLayout from "@/components/layout/MainLayout"
import { Briefcase, MapPin, Building2, CheckCircle, XCircle, Clock3, ArrowRight, CalendarDays, Tag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ScheduleCalendar from "@/components/dashboard/ScheduleCalendar"
import ReviewModal from "@/components/dashboard/ReviewModal"

export default function MyJobs() {
    const navigate = useNavigate()
    const [applications, setApplications] = useState<any[]>([])
    const [interviews, setInterviews] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [role, setRole] = useState("student")
    const [userId, setUserId] = useState<string | null>(null)
    const [reviewingEvent, setReviewingEvent] = useState<{ eventId: string; organizerId: string; organizerName: string } | null>(null)

    const fetchMyApplications = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            navigate("/login")
            return
        }
        setUserId(user.id)

        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
        if (profile) setRole(profile.role)

        const { data, error } = await supabase
            .from("applications")
            .select(`
                id, 
                status, 
                applied_at,
                events (
                    id, title, location, status, position_type, category, benefits, event_date, application_deadline, ward_id,
                    danang_wards (name),
                    profiles (id, full_name, avatar_url)
                )
            `)
            .eq("student_id", user.id)
            .order("applied_at", { ascending: false })

        if (error) {
            console.error("🚨 Lỗi truy vấn đơn ứng tuyển:", error)
            alert("Lỗi kết nối Database: " + error.message)
        } else if (data) {
            setApplications(data)
        }

        // Tải các buổi phỏng vấn đã được chấp nhận
        const { data: intData, error: intError } = await supabase
            .from("interviews")
            .select(`
                id,
                title,
                scheduled_at,
                meeting_link,
                status,
                events (id, title, location)
            `)
            .eq("student_id", user.id)
            .eq("status", "accepted")

        if (!intError && intData) {
            setInterviews(intData)
        }

        setLoading(false)
    }

    useEffect(() => {
        fetchMyApplications()
    }, [navigate])

    const handleWithdraw = async (appId: string) => {
        const isConfirmed = window.confirm("⚠️ Bạn có chắc chắn muốn rút đơn ứng tuyển sự kiện này không?\nHành động này không thể hoàn tác.")
        if (!isConfirmed) return

        const { error } = await supabase
            .from("applications")
            .delete()
            .eq("id", appId)

        if (!error) {
            alert("Đã rút đơn ứng tuyển thành công.")
            setApplications(prev => prev.filter(app => app.id !== appId))
        } else {
            alert("Lỗi khi hủy ứng tuyển: " + error.message)
        }
    }

    if (loading) return (
        <MainLayout role="student">
            <div className="flex justify-center items-center py-20 text-slate-500 font-medium">Đang tải lịch sử ứng tuyển...</div>
        </MainLayout>
    )

    return (
        <MainLayout role={role}>
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

                <div className="mb-8 bg-white p-8 rounded-[2rem] border-2 border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                            <Briefcase className="w-8 h-8 text-emerald-500" />
                            Việc làm đã nộp
                        </h1>
                        <p className="text-slate-500 font-medium mt-2">
                            Theo dõi trạng thái các đơn ứng tuyển và sự kiện bạn đã tham gia.
                        </p>
                    </div>
                    <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none px-4 py-2 text-sm font-bold">
                        Tổng cộng: {applications.length} đơn
                    </Badge>
                </div>

                {(applications.length > 0 || interviews.length > 0) && (
                    <div className="mb-8">
                        <ScheduleCalendar applications={applications} interviews={interviews} />
                    </div>
                )}

                <div className="space-y-4">
                    {applications.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Briefcase className="w-10 h-10 text-slate-300" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Bạn chưa ứng tuyển sự kiện nào</h2>
                            <p className="text-slate-500 font-medium mb-6">Hàng ngàn cơ hội đang chờ đón bạn ngoài kia. Hãy bắt đầu khám phá ngay!</p>
                            <Button onClick={() => navigate("/")} className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-8">
                                Tìm việc ngay <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                    ) : (
                        applications.map((app, idx) => {
                            const event = app.events
                            const organizer = event?.profiles

                            let StatusBadge, StatusIcon, statusColor
                            if (app.status === 'approved') {
                                StatusBadge = "Trúng tuyển"
                                StatusIcon = <CheckCircle className="w-5 h-5" />
                                statusColor = "bg-emerald-50 text-emerald-600 border-emerald-200"
                            } else if (app.status === 'rejected') {
                                StatusBadge = "Chưa phù hợp"
                                StatusIcon = <XCircle className="w-5 h-5" />
                                statusColor = "bg-rose-50 text-rose-600 border-rose-100"
                            } else {
                                StatusBadge = "Đang chờ duyệt"
                                StatusIcon = <Clock3 className="w-5 h-5" />
                                statusColor = "bg-amber-50 text-amber-600 border-amber-200"
                            }

                            return (
                                <div key={app.id} className="bg-white rounded-[1.5rem] border-2 border-slate-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 50}ms` }}>

                                    <div className="flex gap-5 items-start flex-1 cursor-pointer min-w-0" onClick={() => navigate(`/jobs/${event?.id}`)}>
                                        <Avatar className="h-16 w-16 rounded-2xl border-2 border-slate-50 mt-1 shrink-0">
                                            <AvatarImage src={organizer?.avatar_url} />
                                            <AvatarFallback className="rounded-2xl bg-slate-100 text-2xl font-black text-slate-700">
                                                {organizer?.full_name ? organizer.full_name.charAt(0).toUpperCase() : "O"}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                                                <h3 className="text-lg font-bold text-slate-900 leading-tight hover:text-emerald-600 transition-colors truncate">
                                                    {event?.title || "Sự kiện đã bị xóa"}
                                                </h3>
                                                {event?.status === 'upcoming' ? (
                                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 font-bold">Đang mở</Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 font-bold">Đã đóng</Badge>
                                                )}
                                            </div>

                                            <p className="text-sm font-bold text-slate-500 flex items-center gap-2 mb-3">
                                                <Building2 className="w-4 h-4" /> {organizer?.full_name || "Đơn vị ẩn danh"}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-bold text-slate-400">
                                                {/* ĐÃ SỬA: Gỡ chữ "Toàn quốc", ưu tiên Phường/Xã chuẩn từ DB */}
                                                <span className="flex items-center gap-1 rounded bg-slate-50 px-2 py-0.5 text-slate-600 max-w-[180px] truncate" title={event?.location}>
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    {event?.danang_wards?.name ? `P. ${event.danang_wards.name}` : (event?.location || "Đà Nẵng")}
                                                </span>
                                                {event?.position_type && (
                                                    <span className="flex items-center gap-1 rounded bg-slate-50 px-2 py-0.5 text-slate-600">
                                                        <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {event.position_type}
                                                    </span>
                                                )}
                                                {event?.category && (
                                                    <span className="flex items-center gap-1 rounded bg-slate-50 px-2 py-0.5 text-slate-600">
                                                        <Tag className="w-3.5 h-3.5 text-slate-400" /> {event.category}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1.5 text-slate-400 px-1">
                                                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" /> Đã nộp: {new Date(app.applied_at).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-3 shrink-0 w-full sm:w-auto">
                                        <div className="flex items-center gap-2 text-xs font-black text-slate-400 bg-slate-50/50 p-2 rounded-xl border border-slate-100 flex-wrap">
                                            <span className="text-slate-500">Quy trình:</span>
                                            <span className="text-emerald-600 flex items-center gap-0.5">✓ Nộp đơn</span>
                                            <span className="text-slate-300">➔</span>
                                            <span className={app.status === 'pending' ? 'text-amber-600 font-black animate-pulse' : 'text-emerald-600'}>
                                                {app.status === 'pending' ? '● Đang duyệt' : '✓ Đang duyệt'}
                                            </span>
                                            <span className="text-slate-300">➔</span>
                                            <span className={app.status === 'approved' ? 'text-emerald-600' : app.status === 'rejected' ? 'text-rose-500' : 'text-slate-300'}>
                                                {app.status === 'approved' ? '✓ Trúng tuyển' : app.status === 'rejected' ? '✗ K.Phù hợp' : 'Kết quả'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 w-full justify-end">
                                            {/* [MỚI] LỐI TẮT BẢN ĐỒ NGAY TRÊN DÒNG LỊCH SỬ ỨNG TUYỂN */}
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((event?.location ? event.location + ', ' : '') + (event?.danang_wards?.name ? 'Phường ' + event.danang_wards.name + ', ' : '') + 'Đà Nẵng')}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex items-center gap-0.5 rounded-xl bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-100 transition-colors h-8"
                                            >
                                                🗺️ Bản đồ
                                            </a>
                                            <div className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border-2 font-bold text-xs h-8 ${statusColor}`}>
                                                {StatusIcon} {StatusBadge}
                                            </div>
                                            {app.status === 'approved' && event?.status === 'completed' && (
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setReviewingEvent({
                                                            eventId: event.id,
                                                            organizerId: event.profiles?.id,
                                                            organizerName: event.profiles?.full_name || "Nhà tổ chức"
                                                        });
                                                    }}
                                                    className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold h-8 px-2.5 text-xs flex items-center gap-1 shadow-none"
                                                >
                                                    ⭐ Đánh giá BTC
                                                </Button>
                                            )}
                                            {app.status === "pending" && (
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleWithdraw(app.id);
                                                    }}
                                                    variant="outline"
                                                    className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold h-8 px-2.5 shadow-none flex items-center gap-1 text-xs"
                                                    title="Hủy ứng tuyển sự kiện này"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span className="hidden md:inline">Hủy</span>
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            )
                        })
                    )}
                </div>

            </div>

            {reviewingEvent && userId && (
                <ReviewModal
                    isOpen={!!reviewingEvent}
                    onClose={() => setReviewingEvent(null)}
                    eventId={reviewingEvent.eventId}
                    reviewerId={userId}
                    revieweeId={reviewingEvent.organizerId}
                    revieweeName={reviewingEvent.organizerName}
                />
            )}
        </MainLayout>
    )
}