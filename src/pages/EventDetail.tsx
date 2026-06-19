import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import MainLayout from "@/components/layout/MainLayout"
// Bổ sung đầy đủ các Icon trực quan tương ứng với các trường mở rộng
import { ArrowLeft, MapPin, Calendar, Building2, CheckCircle, XCircle, Clock3, Share2, Bookmark, Briefcase, Tag, DollarSign, Users, Hourglass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function EventDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [event, setEvent] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [role, setRole] = useState<string>("guest")

    // Quản lý trạng thái ứng tuyển tại trang này
    const [applyStatus, setApplyStatus] = useState<string | null>(null)
    const [isApplying, setIsApplying] = useState(false)

    // [MỚI] State đồng bộ trạng thái lưu việc làm (Bookmark)
    const [isBookmarked, setIsBookmarked] = useState(false)

    useEffect(() => {
        const fetchEventDetails = async () => {
            setLoading(true)

            // Lấy thông tin user hiện tại
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
                if (profile) setRole(profile.role)

                // Nếu là sinh viên, kiểm tra xem đã ứng tuyển sự kiện này chưa
                if (profile?.role === "student") {
                    const { data: appData } = await supabase
                        .from("applications")
                        .select("status")
                        .eq("event_id", id)
                        .eq("student_id", user.id)
                        .maybeSingle()

                    if (appData) setApplyStatus(appData.status)

                    // [MỚI] Kiểm tra xem sinh viên đã lưu sự kiện này thực tế trong DB chưa
                    const { data: bookmarkData } = await supabase
                        .from("event_bookmarks")
                        .select("id")
                        .eq("event_id", id)
                        .eq("student_id", user.id)
                        .maybeSingle()

                    if (bookmarkData) setIsBookmarked(true)
                }
            }

            // Kéo dữ liệu chi tiết của sự kiện + thông tin BTC
            const { data: eventData, error } = await supabase
                .from("events")
                .select("*, profiles(full_name, avatar_url)")
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
            alert("Bạn cần đăng nhập để ứng tuyển!")
            navigate("/login")
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

    // [MỚI] Hàm xử lý bấm nút lưu việc làm trực tiếp từ trang chi tiết
    const toggleBookmark = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            alert("Bạn cần đăng nhập để thực hiện chức năng lưu việc làm!")
            return
        }

        if (isBookmarked) {
            // Nếu đã lưu -> Tiến hành hủy lưu khỏi Database
            const { error } = await supabase
                .from("event_bookmarks")
                .delete()
                .eq("student_id", user.id)
                .eq("event_id", id)

            if (!error) {
                setIsBookmarked(false)
            } else {
                alert("Lỗi khi hủy lưu việc làm: " + error.message)
            }
        } else {
            // Nếu chưa lưu -> Thêm dòng đăng ký mới vào Database
            const { error } = await supabase
                .from("event_bookmarks")
                .insert([{ student_id: user.id, event_id: id }])

            if (!error) {
                setIsBookmarked(true)
            } else {
                alert("Lỗi khi lưu việc làm: " + error.message)
            }
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

    // Hiển thị nút ứng tuyển dựa trên trạng thái và hạn chót thực tế
    const renderApplyButton = () => {
        if (role !== "student") return null // BTC không tự ứng tuyển

        if (applyStatus === 'approved') {
            return <Button disabled className="w-full rounded-2xl bg-emerald-100 text-emerald-700 font-bold h-12 border-2 border-emerald-200"><CheckCircle className="w-5 h-5 mr-2" /> Trúng tuyển</Button>
        }
        if (applyStatus === 'rejected') {
            return <Button disabled className="w-full rounded-2xl bg-rose-50 text-rose-500 font-bold h-12 border-2 border-rose-100"><XCircle className="w-5 h-5 mr-2" /> Chưa phù hợp</Button>
        }
        if (applyStatus === 'pending') {
            return <Button disabled className="w-full rounded-2xl bg-amber-50 text-amber-600 font-bold h-12 border-2 border-amber-100"><Clock3 className="w-5 h-5 mr-2" /> Đang chờ duyệt</Button>
        }

        const isPastDeadline = event.application_deadline ? new Date() > new Date(event.application_deadline) : false;

        return (
            <Button
                onClick={handleApply}
                disabled={disabledApply || isPastDeadline}
                className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 transition-transform active:scale-95 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
                {isApplying ? "Đang xử lý..." : isPastDeadline ? "Đã hết hạn nộp đơn" : event.status !== 'upcoming' ? "Đã đóng đăng ký" : "Ứng tuyển ngay"}
            </Button>
        )
    }

    const isPastDeadline = event.application_deadline ? new Date() > new Date(event.application_deadline) : false;
    const disabledApply = isApplying || event.status !== 'upcoming';

    return (
        <MainLayout role={role}>
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 mb-6 transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Quay lại
                </button>

                {/* HEADER SỰ KIỆN */}
                <div className="bg-white rounded-[2rem] border-2 border-slate-100 shadow-sm p-8 mb-8">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <Avatar className="h-24 w-24 rounded-3xl border-4 border-slate-50 shadow-sm shrink-0">
                            <AvatarImage src={event.profiles?.avatar_url} />
                            <AvatarFallback className="rounded-3xl bg-emerald-50 text-emerald-600 text-3xl font-black">
                                {event.profiles?.full_name?.charAt(0).toUpperCase() || "O"}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                                <Badge variant="secondary" className={event.status === 'upcoming' && !isPastDeadline ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-50 text-rose-600 border-rose-100'}>
                                    {isPastDeadline ? 'Đã hết hạn nhận hồ sơ' : event.status === 'upcoming' ? 'Đang mở đăng ký' : 'Đã đóng'}
                                </Badge>
                                <span className="text-sm font-bold text-slate-400 flex items-center gap-1">
                                    <Calendar className="w-4 h-4" /> Đăng ngày {new Date(event.created_at).toLocaleDateString('vi-VN')}
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-2 leading-tight">
                                {event.title}
                            </h1>

                            <h2 className="text-lg font-bold text-slate-500 flex items-center gap-2">
                                <Building2 className="w-5 h-5" /> {event.profiles?.full_name || "Đơn vị ẩn danh"}
                            </h2>
                        </div>
                    </div>
                </div>

                {/* BỐ CỤC 2 CỘT: CỘT NỘI DUNG & CỘT SIDEBAR ĐỘNG */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Cột trái: Chi tiết JD */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-[2rem] border-2 border-slate-100 shadow-sm p-8">
                            <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                                Chi tiết công việc
                            </h3>
                            <div className="text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                                {event.description || "Chưa có mô tả chi tiết cho sự kiện này."}
                            </div>
                        </div>
                    </div>

                    {/* Cột phải: Sidebar ghim cố định (Sticky) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-[100px] bg-white rounded-[2rem] border-2 border-slate-100 shadow-xl shadow-slate-900/5 p-6">

                            {/* Khối Thông tin tóm tắt */}
                            <div className="space-y-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Địa điểm</p>
                                        <p className="text-sm font-bold text-slate-900 mt-0.5">{event.location || "Đang cập nhật"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                        <Briefcase className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vị trí công việc</p>
                                        <p className="text-sm font-bold text-slate-900 mt-0.5">{event.position_type || "Tình nguyện viên"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                        <Tag className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loại hình sự kiện</p>
                                        <p className="text-sm font-bold text-slate-900 mt-0.5">{event.category || "Chưa phân loại"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                        <DollarSign className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quyền lợi / Phụ cấp</p>
                                        <p className="text-sm font-bold text-slate-900 mt-0.5">{event.benefits || "Thỏa thuận"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                        <Users className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Số lượng tuyển</p>
                                        <p className="text-sm font-bold text-slate-900 mt-0.5">{event.slots_needed || 1} nhân sự</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                        <Calendar className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ngày diễn ra</p>
                                        <p className="text-sm font-bold text-slate-900 mt-0.5">
                                            {event.event_date ? new Date(event.event_date).toLocaleDateString('vi-VN') : "Đang cập nhật"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                        <Hourglass className={`w-5 h-5 ${isPastDeadline ? 'text-rose-500 animate-bounce' : 'text-emerald-600'}`} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hạn chót nộp đơn</p>
                                        <p className={`text-sm font-bold mt-0.5 ${isPastDeadline ? 'text-rose-500' : 'text-slate-900'}`}>
                                            {event.application_deadline ? new Date(event.application_deadline).toLocaleDateString('vi-VN') : "Không giới hạn"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100 mb-6" />

                            {/* Khu vực Nút ứng tuyển thông minh */}
                            {renderApplyButton()}

                            {/* Nút thao tác phụ */}
                            <div className="flex gap-2 mt-3">
                                {/* [MỚI] Đồng bộ nút Lưu việc làm hoạt động thực tế với State */}
                                {role === 'student' ? (
                                    <Button
                                        onClick={toggleBookmark}
                                        variant={isBookmarked ? "default" : "outline"}
                                        className={`flex-1 rounded-xl font-bold h-11 transition-all ${isBookmarked
                                                ? "bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100 hover:text-rose-600 shadow-none"
                                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                            }`}
                                    >
                                        <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? "fill-current" : ""}`} />
                                        {isBookmarked ? "Đã lưu" : "Lưu lại"}
                                    </Button>
                                ) : (
                                    <Button disabled variant="outline" className="flex-1 rounded-xl border-slate-200 text-slate-300 font-bold h-11 shadow-none cursor-not-allowed">
                                        <Bookmark className="w-4 h-4 mr-2" /> Lưu lại
                                    </Button>
                                )}
                                <Button variant="outline" className="flex-1 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 h-11">
                                    <Share2 className="w-4 h-4 mr-2" /> Chia sẻ
                                </Button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </MainLayout>
    )
}