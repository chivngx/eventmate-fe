import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Plus, Calendar, Users, Activity, ArrowLeft, CheckCircle, XCircle, FileText, X, Phone, GraduationCap, Sparkles, Pencil, Trash2, MapPin, Briefcase, Award, Tag, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function OrgDashboard() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [events, setEvents] = useState<any[]>([])

    // Cấu trúc form dữ liệu nâng cao + Trường ngày tháng mới
    const [title, setTitle] = useState("")
    const [desc, setDesc] = useState("")
    const [location, setLocation] = useState("")
    const [positionType, setPositionType] = useState("Tình nguyện viên")
    const [benefits, setBenefits] = useState("Cấp chứng nhận")
    const [category, setCategory] = useState("Lễ hội Âm nhạc")
    const [slotsNeeded, setSlotsNeeded] = useState("1")
    const [eventDate, setEventDate] = useState("") // [MỚI] Ngày diễn ra sự kiện
    const [applicationDeadline, setApplicationDeadline] = useState("") // [MỚI] Hạn chót nộp đơn

    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)

    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    const [selectedEvent, setSelectedEvent] = useState<any | null>(null)
    const [applications, setApplications] = useState<any[]>([])
    const [loadingApps, setLoadingApps] = useState(false)
    const [viewingCV, setViewingCV] = useState<any | null>(null)

    const fetchMyEvents = async () => {
        setFetching(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
            .from("events")
            .select("*")
            .eq("organizer_id", user.id)
            .order("created_at", { ascending: false })

        if (!error && data) setEvents(data)
        setFetching(false)
    }

    useEffect(() => {
        fetchMyEvents()
    }, [])

    useEffect(() => {
        if (searchParams.get("action") === "create") {
            setShowForm(true)
            setTimeout(() => {
                const element = document.getElementById("event-form")
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" })
                }
            }, 150)
        }
    }, [searchParams])

    const resetForm = () => {
        setTitle("")
        setDesc("")
        setLocation("")
        setPositionType("Tình nguyện viên")
        setBenefits("Cấp chứng nhận")
        setCategory("Lễ hội Âm nhạc")
        setSlotsNeeded("1")
        setEventDate("")
        setApplicationDeadline("")
        setEditingId(null)
        setShowForm(false)
        setSearchParams({})
    }

    const handleSubmitEvent = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !desc || !location || !eventDate || !applicationDeadline) {
            alert("Vui lòng điền đầy đủ thông tin và chọn thời hạn!");
            return
        }
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const eventPayload = {
                title,
                description: desc,
                location,
                position_type: positionType,
                benefits,
                category,
                slots_needed: parseInt(slotsNeeded) || 1,
                event_date: eventDate ? new Date(eventDate).toISOString() : null, // Gửi ngày lên DB
                application_deadline: applicationDeadline ? new Date(applicationDeadline).toISOString() : null // Gửi hạn chót lên DB
            }

            if (editingId) {
                // UPDATE (Sửa sự kiện)
                const { error } = await supabase
                    .from("events")
                    .update(eventPayload)
                    .eq("id", editingId)
                    .eq("organizer_id", user.id)

                if (!error) {
                    alert("Cập nhật sự kiện thành công!")
                    resetForm()
                    fetchMyEvents()
                } else {
                    alert("Lỗi khi cập nhật: " + error.message)
                }
            } else {
                // INSERT (Tạo sự kiện mới)
                const { error } = await supabase.from("events").insert([
                    { organizer_id: user.id, ...eventPayload, status: 'upcoming' }
                ])
                if (!error) {
                    alert("Tạo sự kiện thành công!")
                    resetForm()
                    fetchMyEvents()
                } else {
                    alert("Lỗi: " + error.message)
                }
            }
        }
        setLoading(false)
    }

    const handleEditClick = (ev: any) => {
        setEditingId(ev.id)
        setTitle(ev.title)
        setDesc(ev.description)
        setLocation(ev.location)
        setPositionType(ev.position_type || "Tình nguyện viên")
        setBenefits(ev.benefits || "Cấp chứng nhận")
        setCategory(ev.category || "Lễ hội Âm nhạc")
        setSlotsNeeded(String(ev.slots_needed || 1))
        // Trích xuất chuỗi YYYY-MM-DD từ ISO string để hiển thị lên thẻ <input type="date" />
        setEventDate(ev.event_date ? ev.event_date.split('T')[0] : "")
        setApplicationDeadline(ev.application_deadline ? ev.application_deadline.split('T')[0] : "")
        setShowForm(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDeleteEvent = async (id: string) => {
        const isConfirmed = window.confirm("🚨 BẠN CÓ CHẮC CHẮN MUỐN XÓA SỰ KIỆN NÀY?\nToàn bộ đơn ứng tuyển của sinh viên cũng sẽ bị xóa vĩnh viễn!")
        if (!isConfirmed) return

        const { error } = await supabase.from("events").delete().eq("id", id)
        if (error) {
            alert("Lỗi khi xóa: " + error.message)
        } else {
            alert("Đã xóa sự kiện thành công.")
            fetchMyEvents()
        }
    }

    const handleViewApplications = async (event: any) => {
        setSelectedEvent(event)
        setLoadingApps(true)
        const { data, error } = await supabase
            .from("applications")
            .select(`
            id, status, applied_at, student_id, 
            profiles!applications_student_id_fkey (id, full_name, email, avatar_url, phone, university, bio, skills)
        `)
            .eq("event_id", event.id)
            .order("applied_at", { ascending: false })

        if (!error && data) setApplications(data)
        setLoadingApps(false)
    }

    const handleUpdateStatus = async (appId: string, studentId: string, newStatus: string) => {
        const { error } = await supabase.from("applications").update({ status: newStatus }).eq("id", appId)

        if (!error) {
            setApplications(apps => apps.map(app => app.id === appId ? { ...app, status: newStatus } : app))
        } else {
            alert("Lỗi khi cập nhật trạng thái: " + error.message)
        }
    }

    const totalEvents = events.length
    const activeEvents = events.filter(e => e.status === 'upcoming').length

    return (
        <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">

            {!selectedEvent && (
                <>
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900">Bảng điều khiển</h1>
                            <p className="text-slate-500 font-medium mt-1">Quản lý các chiến dịch tuyển dụng và sự kiện của bạn.</p>
                        </div>
                        <Button
                            onClick={() => showForm ? resetForm() : setShowForm(true)}
                            className="rounded-2xl bg-slate-900 text-white hover:bg-slate-800 font-bold h-11 px-6 transition-transform active:scale-95 shadow-lg shadow-slate-900/20"
                        >
                            {showForm ? "Đóng Form" : <><Plus className="w-5 h-5 mr-1" /> Tạo sự kiện mới</>}
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tổng sự kiện</p>
                                <h3 className="text-2xl font-black text-slate-900">{totalEvents}</h3>
                            </div>
                        </div>
                        <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <Activity className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Đang mở đăng ký</p>
                                <h3 className="text-2xl font-black text-slate-900">{activeEvents}</h3>
                            </div>
                        </div>
                    </div>

                    {/* FORM TẠO/SỬA SỰ KIỆN PHÂN LOẠI NÂNG CAO */}
                    {showForm && (
                        <div id="event-form" className="bg-white rounded-[2rem] border-2 border-emerald-100 shadow-xl shadow-emerald-900/5 p-6 sm:p-8 animate-in zoom-in-95 duration-200">
                            <div className="mb-6">
                                <h2 className="text-xl font-extrabold text-slate-900">
                                    {editingId ? "✏️ Chỉnh sửa sự kiện" : "Tạo sự kiện & Tuyển dụng mới"}
                                </h2>
                            </div>
                            <form onSubmit={handleSubmitEvent} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Tên sự kiện / Vị trí tuyển</label>
                                        <Input placeholder="VD: Tình nguyện viên Lễ hội âm nhạc..." value={title} onChange={e => setTitle(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-slate-200 text-base font-medium focus-visible:ring-emerald-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Địa điểm tổ chức</label>
                                        <Input placeholder="VD: Đà Nẵng, Hà Nội..." value={location} onChange={e => setLocation(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-slate-200 text-base font-medium focus-visible:ring-emerald-500" />
                                    </div>
                                </div>

                                {/* [MỚI] HÀNG CHỌN NGÀY THÁNG ĐỒNG BỘ */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-emerald-600" /> Ngày diễn ra sự kiện</label>
                                        <Input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-slate-200 text-sm font-bold text-slate-700 focus-visible:ring-emerald-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Clock className="w-4 h-4 text-rose-500 animate-pulse" /> Hạn chót nộp đơn (Ngày hết hạn)</label>
                                        <Input type="date" value={applicationDeadline} onChange={e => setApplicationDeadline(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-slate-200 text-sm font-bold text-slate-700 focus-visible:ring-emerald-500" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Vị trí tuyển dụng</label>
                                        <select value={positionType} onChange={e => setPositionType(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-2 border-slate-100 p-2 text-sm font-bold text-slate-700 w-full focus:outline-none focus:border-emerald-500">
                                            {['Tình nguyện viên', 'Điều phối viên (Coordinator)', 'CTV Truyền thông', 'Hậu cần & Setup', 'MC / Hoạt náo viên', 'Hỗ trợ khách mời'].map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Loại hình sự kiện</label>
                                        <select value={category} onChange={e => setCategory(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-2 border-slate-100 p-2 text-sm font-bold text-slate-700 w-full focus:outline-none focus:border-emerald-500">
                                            {['Lễ hội Âm nhạc', 'Hội thảo / Workshop', 'Giải đấu Thể thao', 'Giao lưu Văn hóa', 'Triển lãm / Hội chợ', 'Sự kiện Công nghệ'].map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Quyền lợi / Phụ cấp</label>
                                        <select value={benefits} onChange={e => setBenefits(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-2 border-slate-100 p-2 text-sm font-bold text-slate-700 w-full focus:outline-none focus:border-emerald-500">
                                            {['Cấp chứng nhận', 'Có phụ cấp ăn uống', 'Hỗ trợ lương cứng', 'Thỏa thuận'].map(b => (
                                                <option key={b} value={b}>{b}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Số lượng cần tuyển</label>
                                        <Input type="number" min="1" value={slotsNeeded} onChange={e => setSlotsNeeded(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-slate-200 text-base font-medium focus-visible:ring-emerald-500" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Mô tả công việc & Yêu cầu cụ thể</label>
                                    <textarea placeholder="Nhập mô tả chi tiết..." value={desc} onChange={e => setDesc(e.target.value)} rows={5} className="w-full rounded-xl bg-slate-50 border-2 border-slate-200 p-4 text-sm font-medium focus:outline-none focus:border-emerald-500 resize-none whitespace-pre-wrap" />
                                </div>
                                <div className="flex justify-end pt-2 gap-3">
                                    {editingId && (
                                        <Button type="button" onClick={resetForm} variant="outline" className="rounded-xl font-bold h-12 px-6">Hủy</Button>
                                    )}
                                    <Button type="submit" disabled={loading} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-8">
                                        {loading ? "Đang xử lý..." : editingId ? "Lưu thay đổi" : "Xuất bản sự kiện"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}
                </>
            )}

            {!selectedEvent ? (
                <div className="bg-white rounded-[2rem] border-2 border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <h3 className="text-lg font-extrabold text-slate-900">Danh sách sự kiện của bạn</h3>
                    </div>
                    <div className="p-6">
                        {fetching ? (
                            <div className="text-center py-8 text-slate-500 font-medium">Đang tải dữ liệu...</div>
                        ) : events.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-slate-500 font-medium">Bạn chưa tạo sự kiện nào.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {events.map((ev) => (
                                    <div key={ev.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border-2 border-slate-100 hover:border-emerald-200 transition-colors group">
                                        <div className="flex-1 pr-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{ev.title}</h4>
                                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                                                    {ev.status === 'upcoming' ? 'Đang mở' : 'Đã đóng'}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-500 font-medium line-clamp-1 mb-2">{ev.description}</p>

                                            {/* HIỂN THỊ CÁC TRƯỜNG DỮ LIỆU ĐỘNG THỰC TẾ KÈM HẠN CHÓT */}
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-slate-400 mt-2">
                                                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {ev.location}</span>
                                                <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {ev.position_type || "Tình nguyện viên"}</span>
                                                <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> {ev.category || "Lễ hội"}</span>
                                                <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Tuyển: {ev.slots_needed || 1} người</span>
                                                {ev.application_deadline && (
                                                    <span className="flex items-center gap-1 text-rose-500 bg-rose-50/50 px-2 py-0.5 rounded border border-rose-100">
                                                        <Clock className="w-3.5 h-3.5" /> Hạn nộp: {new Date(ev.application_deadline).toLocaleDateString('vi-VN')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-4 sm:mt-0 flex gap-2 shrink-0 flex-wrap items-center">
                                            <Button onClick={() => handleViewApplications(ev)} variant="outline" className="rounded-xl border-slate-200 text-slate-700 font-bold hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                                                <Users className="w-4 h-4 mr-2" /> Xem đơn nộp
                                            </Button>
                                            <Button onClick={() => handleEditClick(ev)} variant="outline" className="rounded-xl border-slate-200 text-slate-500 font-bold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors px-3" title="Chỉnh sửa sự kiện">
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button onClick={() => handleDeleteEvent(ev.id)} variant="outline" className="rounded-xl border-slate-200 text-slate-500 font-bold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors px-3" title="Xóa sự kiện">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="animate-in slide-in-from-right-8 duration-300">
                    <button onClick={() => setSelectedEvent(null)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 mb-6 transition-colors">
                        <ArrowLeft className="w-5 h-5" /> Quay lại danh sách sự kiện
                    </button>
                    <div className="bg-white rounded-[2rem] border-2 border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-emerald-50/50">
                            <h2 className="text-xl font-black text-slate-900">Hồ sơ ứng tuyển</h2>
                            <p className="text-sm font-bold text-emerald-700 mt-1">Sự kiện: {selectedEvent.title}</p>
                        </div>
                        <div className="p-6">
                            {loadingApps ? (
                                <div className="text-center py-8 text-slate-500 font-medium">Đang tải hồ sơ...</div>
                            ) : applications.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl">
                                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500 font-medium">Chưa có ứng viên nào nộp đơn vào sự kiện này.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {applications.map((app) => {
                                        let statusBadge = null
                                        if (app.status === 'pending') statusBadge = <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 shadow-none">Chờ duyệt</Badge>
                                        else if (app.status === 'approved') statusBadge = <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 shadow-none">Đã duyệt</Badge>
                                        else statusBadge = <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 shadow-none">Đã từ chối</Badge>

                                        return (
                                            <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 hover:bg-white hover:border-emerald-200 transition-colors">
                                                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                                        <AvatarImage src={app.profiles?.avatar_url} />
                                                        <AvatarFallback className="bg-slate-200 text-slate-600 font-bold">{app.profiles?.full_name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h4 className="text-base font-bold text-slate-900">{app.profiles?.full_name || "Ứng viên ẩn danh"}</h4>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <p className="text-xs font-medium text-slate-500">{app.profiles?.email}</p>
                                                            {statusBadge}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Button onClick={() => setViewingCV(app.profiles)} variant="secondary" className="rounded-xl font-bold h-10 px-4 hover:bg-slate-200"><FileText className="w-4 h-4 mr-1.5" /> Xem CV</Button>
                                                    {app.status === 'pending' && (
                                                        <>
                                                            <Button onClick={() => handleUpdateStatus(app.id, app.student_id, 'approved')} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-none h-10 font-bold px-4"><CheckCircle className="w-4 h-4" /></Button>
                                                            <Button onClick={() => handleUpdateStatus(app.id, app.student_id, 'rejected')} variant="outline" className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 shadow-none h-10 font-bold px-4"><XCircle className="w-4 h-4" /></Button>
                                                        </>
                                                    )}
                                                    {app.status !== 'pending' && (
                                                        <Button onClick={() => handleUpdateStatus(app.id, app.student_id, 'pending')} variant="ghost" className="text-slate-400 hover:text-slate-600 font-medium text-xs underline px-2">Hoàn tác</Button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* POPUP XEM CV GIỮ NGUYÊN */}
            {viewingCV && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-slate-50 p-6 flex items-start justify-between border-b border-slate-100">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                                    <AvatarImage src={viewingCV.avatar_url} />
                                    <AvatarFallback className="bg-slate-200 text-slate-600 font-bold text-xl">{viewingCV.full_name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">{viewingCV.full_name || "Ứng viên ẩn danh"}</h3>
                                    <p className="text-sm font-medium text-slate-500 mt-0.5">{viewingCV.email}</p>
                                </div>
                            </div>
                            <button onClick={() => setViewingCV(null)} className="p-2 text-slate-400 hover:text-slate-800 bg-white rounded-full border border-slate-200 transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-slate-50 rounded-2xl p-4">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Điện thoại</p>
                                    <p className="font-semibold text-slate-900">{viewingCV.phone || "Chưa cập nhật"}</p>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-4">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> Học vấn</p>
                                    <p className="font-semibold text-slate-900 truncate" title={viewingCV.university}>{viewingCV.university || "Chưa cập nhật"}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Kỹ năng</p>
                                <div className="flex flex-wrap gap-2">
                                    {viewingCV.skills ? viewingCV.skills.split(',').map((skill: string, i: number) => (
                                        <Badge key={i} className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shadow-none px-3 py-1 text-xs">{skill.trim()}</Badge>
                                    )) : <p className="text-sm font-medium text-slate-500 italic">Ứng viên chưa nhập kỹ năng.</p>}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Giới thiệu bản thân</p>
                                <div className="bg-slate-50 rounded-2xl p-4 text-sm font-medium text-slate-700 leading-relaxed">
                                    {viewingCV.bio || <span className="italic text-slate-400">Không có giới thiệu.</span>}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <Button onClick={() => setViewingCV(null)} className="bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-bold px-6">Đóng</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}