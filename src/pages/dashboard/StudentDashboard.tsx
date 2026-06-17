import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, MapPin, ChevronRight, CheckCircle2, Bookmark, CheckCircle, XCircle, Clock3, Heart, ChevronLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase"
import RotatingText from "@/components/RotatingText"

export default function StudentDashboard() {
    const navigate = useNavigate()
    const [events, setEvents] = useState<any[]>([])
    const [myApplications, setMyApplications] = useState<Record<string, string>>({})
    const [applyingId, setApplyingId] = useState<string | null>(null)
    const [loadingData, setLoadingData] = useState(true)

    const [userProfile, setUserProfile] = useState<any>(null)
    const [cvProgress, setCvProgress] = useState(0)

    // STATE MỚI: Quản lý từ khóa tìm kiếm
    const [searchTerm, setSearchTerm] = useState("")
    const [locationTerm, setLocationTerm] = useState("")
    
    // STATE CHO TOPCV STYLE
    const [bookmarkedEvents, setBookmarkedEvents] = useState<Record<string, boolean>>({})
    const [currentPage, setCurrentPage] = useState(1)
    const [showSuggestion, setShowSuggestion] = useState(true)

    const fetchEventsAndApplications = async () => {
        setLoadingData(true)

        const { data: eventsData } = await supabase
            .from("events")
            .select("*, profiles(full_name)")
            .order("created_at", { ascending: false })

        if (eventsData) setEvents(eventsData)

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: profileData } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .maybeSingle()

            if (profileData) {
                setUserProfile(profileData)
                let score = 0
                if (profileData.full_name) score += 20
                if (profileData.avatar_url) score += 20
                if (profileData.phone) score += 20
                if (profileData.university) score += 20
                if (profileData.skills) score += 20
                setCvProgress(score)
            }

            const { data: appsData } = await supabase
                .from("applications")
                .select("event_id, status")
                .eq("student_id", user.id)

            if (appsData) {
                const appMap: Record<string, string> = {}
                appsData.forEach(app => { appMap[app.event_id] = app.status })
                setMyApplications(appMap)
            }
        }

        setLoadingData(false)
    }

    useEffect(() => {
        fetchEventsAndApplications()
    }, [])

    const handleApply = async (eventId: string, organizerId: string, eventTitle: string) => { // Truyền thêm organizerId và title
        setApplyingId(eventId)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            alert("Bạn cần đăng nhập để ứng tuyển!")
            setApplyingId(null)
            return
        }

        // 1. Ghi đơn ứng tuyển
        const { error: appError } = await supabase.from("applications").insert([
            { event_id: eventId, student_id: user.id }
        ])

        // 2. Bắn thông báo cho BTC
        if (!appError) {
            await supabase.from("notifications").insert([{
                user_id: organizerId,
                title: "Có đơn ứng tuyển mới! 📩",
                message: `Sinh viên vừa nộp đơn vào sự kiện "${eventTitle}". Hãy vào kiểm tra ngay!`
            }])
            setMyApplications(prev => ({ ...prev, [eventId]: 'pending' }))
        } else {
            alert("Lỗi: " + appError.message)
        }
        setApplyingId(null)
    }

    const getColorClass = (index: number) => {
        const colors = ["bg-orange-100 text-orange-700", "bg-emerald-100 text-emerald-700", "bg-rose-100 text-rose-700", "bg-blue-100 text-blue-700", "bg-purple-100 text-purple-700"]
        return colors[index % colors.length]
    }

    const toggleBookmark = (eventId: string) => {
        setBookmarkedEvents(prev => ({ ...prev, [eventId]: !prev[eventId] }))
    }

    const getMockSalary = (job: any) => {
        const desc = (job.description || "").toLowerCase()
        if (desc.includes("tình nguyện") || desc.includes("volunteer")) return "Tình nguyện"
        if (desc.includes("phụ cấp") || desc.includes("hỗ trợ") || desc.includes("lương")) {
            return "Có hỗ trợ"
        }
        return "Cấp chứng nhận"
    }

    const renderActionButton = (job: any) => {
        const status = myApplications[job.id]

        if (status === 'approved') return (
            <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Trúng tuyển
            </span>
        )
        if (status === 'rejected') return (
            <span className="text-[11px] font-extrabold text-rose-500 bg-rose-50 px-2 py-1 rounded border border-rose-200 flex items-center gap-1">
                <XCircle className="w-3 h-3" /> K.phù hợp
            </span>
        )
        if (status === 'pending') return (
            <span className="text-[11px] font-extrabold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200 flex items-center gap-1">
                <Clock3 className="w-3 h-3" /> Chờ duyệt
            </span>
        )

        return (
            <Button
                onClick={(e) => {
                    e.stopPropagation();
                    handleApply(job.id, job.organizer_id, job.title)
                }}
                disabled={applyingId === job.id}
                className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold px-3 py-1 h-7 shadow-sm transition-colors border-0 shrink-0"
            >
                {applyingId === job.id ? "..." : "Ứng tuyển"}
            </Button>
        )
    }

    const firstName = userProfile?.full_name ? userProfile.full_name.split(' ').pop() : "bạn mới"

    // LOGIC LỌC SỰ KIỆN: Kết hợp cả Tên sự kiện (hoặc Tên BTC) và Địa điểm
    const filteredEvents = events.filter(job => {
        const matchesSearch = searchTerm === "" ||
            job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesLocation = locationTerm === "" ||
            (job.location && job.location.toLowerCase().includes(locationTerm.toLowerCase()));

        return matchesSearch && matchesLocation;
    })

    // PAGINATION VÀ TABS CHO TOPCV STYLE
    const itemsPerPage = 6
    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage) || 1
    const paginatedEvents = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const locationTabs = [
        { label: "Ngẫu nhiên", value: "" },
        { label: "Hà Nội", value: "Hà Nội" },
        { label: "TP. Hồ Chí Minh", value: "Hồ Chí Minh" },
        { label: "Đà Nẵng", value: "Đà Nẵng" },
        { label: "Cần Thơ", value: "Cần Thơ" }
    ]

    return (
        <div className="space-y-8 pb-10">
            {/* 1. BANNER PHẲNG */}
            <div className="relative overflow-hidden rounded-[2rem] bg-emerald-500 px-6 py-14 shadow-md sm:px-16 sm:py-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="relative z-10 mx-auto max-w-3xl text-center space-y-5">
                    <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl leading-tight flex flex-col items-center justify-center gap-3">
                        <span>Nắm bắt cơ hội sự kiện</span>
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                            <span>bứt phá</span>
                            <RotatingText
                                texts={["sự nghiệp", "tương lai", "bản thân", "giới hạn"]}
                                mainClassName="text-emerald-600 bg-white px-3 sm:px-4 py-0.5 sm:py-1 rounded-2xl inline-flex overflow-hidden justify-center shadow-md border-2 border-emerald-100"
                                staggerFrom="first"
                                initial={{ y: "100%", opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: "-120%", opacity: 0 }}
                                staggerDuration={0.02}
                                splitLevelClassName="overflow-hidden pb-0.5"
                                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                                rotationInterval={2500}
                            />
                        </div>
                    </h1>
                    <p className="mx-auto max-w-xl text-lg text-emerald-50 font-medium">
                        Hàng ngàn vị trí Tình nguyện viên, CTV Truyền thông và Điều phối đang chờ đón bạn.
                    </p>

                    {/* FORM TÌM KIẾM CÓ GẮN STATE */}
                    <div className="mx-auto mt-8 flex w-full max-w-3xl flex-col gap-2 rounded-3xl bg-white p-2 shadow-xl sm:flex-row sm:items-center sm:rounded-full">
                        <div className="flex flex-1 items-center px-4 py-2 sm:py-0">
                            <Search className="h-5 w-5 text-emerald-600" />
                            <Input
                                placeholder="Tìm tên sự kiện, BTC..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-slate-900 font-bold text-base placeholder:text-slate-400 h-11"
                            />
                        </div>
                        <div className="hidden h-8 w-[2px] bg-slate-100 sm:block"></div>
                        <div className="flex flex-1 items-center px-4 py-2 sm:py-0">
                            <MapPin className="h-5 w-5 text-slate-400" />
                            <Input
                                placeholder="Địa điểm (VD: Quận 1)"
                                value={locationTerm}
                                onChange={(e) => setLocationTerm(e.target.value)}
                                className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-slate-900 font-bold text-base placeholder:text-slate-400 h-11"
                            />
                        </div>
                        <Button className="h-12 w-full rounded-2xl sm:rounded-full bg-slate-900 px-10 text-base font-bold text-white hover:bg-slate-800 sm:w-auto transition-transform hover:scale-105 active:scale-95">
                            Tìm việc ngay
                        </Button>
                    </div>
                </div>
            </div>

            {/* 2. BỐ CỤC NỘI DUNG */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

                {/* CỘT CHÍNH */}
                <div className="space-y-6 lg:col-span-8">
                    {/* TOPCV HEADER AND FILTERS */}
                    <div className="bg-white rounded-2xl border-2 border-slate-100 p-5 space-y-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                                    Việc làm <span className="text-emerald-600">tốt nhất</span>
                                </h2>
                                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                                    ⚡ Đề xuất bởi EventMate AI
                                </span>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-4">
                                <button
                                    onClick={() => {
                                        setSearchTerm("");
                                        setLocationTerm("");
                                        setCurrentPage(1);
                                    }}
                                    className="text-xs font-extrabold text-slate-500 hover:text-emerald-600 transition-colors"
                                >
                                    Xem tất cả
                                </button>
                                <div className="flex items-center gap-1">
                                    <button 
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 disabled:opacity-50 disabled:hover:text-slate-400 disabled:hover:border-slate-200 transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button 
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 disabled:opacity-50 disabled:hover:text-slate-400 disabled:hover:border-slate-200 transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* FILTER TAGS BAR */}
                        <div className="flex items-center gap-3 overflow-hidden py-1 border-t border-slate-50 pt-3">
                            <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 text-xs font-bold text-slate-600">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                <span className="hidden xs:inline">Lọc theo: Địa điểm</span>
                                <span className="xs:hidden">Địa điểm</span>
                            </div>
                            
                            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-0.5">
                                {locationTabs.map(tab => (
                                    <button
                                        key={tab.label}
                                        onClick={() => {
                                            setLocationTerm(tab.value);
                                            setCurrentPage(1);
                                        }}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                                            (locationTerm === tab.value)
                                            ? "bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-600/10"
                                            : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100"
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* SUGGESTION BAR */}
                        {showSuggestion && (
                            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-emerald-800 font-medium animate-in fade-in duration-300">
                                <div className="flex items-center gap-2 pr-4">
                                    <span className="text-base shrink-0">💡</span>
                                    <span>Gợi ý: Nhấp vào tiêu đề hoặc ảnh để xem chi tiết và nộp đơn ứng tuyển nhanh chóng!</span>
                                </div>
                                <button onClick={() => setShowSuggestion(false)} className="text-emerald-600 hover:text-emerald-800 transition-colors shrink-0">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* EVENTS GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
                        {loadingData ? (
                            <div className="col-span-full text-center py-10 text-slate-500 font-medium">Đang tải sự kiện...</div>
                        ) : paginatedEvents.length === 0 ? (
                            <div className="col-span-full text-center py-12 px-6 bg-white rounded-[1.5rem] border-2 border-dashed border-slate-200">
                                <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-slate-900">Không tìm thấy kết quả</h3>
                                <p className="text-slate-500 font-medium mt-1">Thử thay đổi từ khóa hoặc địa điểm tìm kiếm xem sao.</p>
                                <Button onClick={() => { setSearchTerm(""); setLocationTerm(""); setCurrentPage(1); }} variant="link" className="text-emerald-600 font-bold mt-2">Xóa bộ lọc</Button>
                            </div>
                        ) : (
                            paginatedEvents.map((job, idx) => {
                                const isBookmarked = !!bookmarkedEvents[job.id];
                                return (
                                    <div 
                                        key={job.id} 
                                        className="group relative flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 transition-all duration-300 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-950/5 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        <div className="flex gap-4 items-start">
                                            <Avatar 
                                                className="h-14 w-14 rounded-xl border border-slate-100 shrink-0 cursor-pointer shadow-sm"
                                                onClick={() => navigate(`/jobs/${job.id}`)}
                                            >
                                                <AvatarFallback className="rounded-xl bg-slate-50 text-xl font-black text-slate-700 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                                    {job.profiles?.full_name ? job.profiles.full_name.charAt(0).toUpperCase() : "O"}
                                                </AvatarFallback>
                                            </Avatar>
                                            
                                            <div className="flex-1 min-w-0 pr-2">
                                                <h3 
                                                    className="text-[14px] font-extrabold text-slate-800 leading-snug group-hover:text-emerald-600 transition-colors cursor-pointer line-clamp-2"
                                                    onClick={() => navigate(`/jobs/${job.id}`)}
                                                    title={job.title}
                                                >
                                                    {job.title}
                                                </h3>
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1.5 truncate" title={job.profiles?.full_name}>
                                                    {job.profiles?.full_name || "Đơn vị ẩn danh"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <span className="text-[11px] font-bold bg-slate-50 text-slate-600 px-2 py-1 rounded">
                                                    {getMockSalary(job)}
                                                </span>
                                                <span className="text-[11px] font-bold bg-slate-50 text-slate-600 px-2 py-1 rounded truncate max-w-[80px]" title={job.location}>
                                                    {job.location || "Toàn quốc"}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => toggleBookmark(job.id)}
                                                    className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                                                        isBookmarked 
                                                        ? "bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100" 
                                                        : "bg-white border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-600"
                                                    }`}
                                                >
                                                    <Heart className={`w-3.5 h-3.5 ${isBookmarked ? "fill-current" : ""}`} />
                                                </button>
                                                
                                                {renderActionButton(job)}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>

                    {/* PAGINATION BOTTOM */}
                    {filteredEvents.length > itemsPerPage && (
                        <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-100 mt-6">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => {
                                    setCurrentPage(prev => Math.max(prev - 1, 1));
                                    window.scrollTo({ top: 400, behavior: 'smooth' });
                                }}
                                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 disabled:opacity-50 disabled:hover:text-slate-500 disabled:hover:border-slate-200 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-bold text-slate-600">
                                {currentPage} / {totalPages} trang
                            </span>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => {
                                    setCurrentPage(prev => Math.min(prev + 1, totalPages));
                                    window.scrollTo({ top: 400, behavior: 'smooth' });
                                }}
                                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 disabled:opacity-50 disabled:hover:text-slate-500 disabled:hover:border-slate-200 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* CỘT PHỤ BÊN PHẢI (Giữ nguyên) */}
                <div className="space-y-6 lg:col-span-4 lg:pl-2 mt-2">
                    <div className="overflow-hidden rounded-[1.5rem] border-2 border-slate-100 bg-white">
                        <div className="bg-emerald-50 p-6 flex items-center gap-4">
                            <Avatar className="h-16 w-16 border-4 border-white shadow-sm">
                                <AvatarImage src={userProfile?.avatar_url} />
                                <AvatarFallback className="bg-emerald-500 text-white font-bold text-xl">
                                    {userProfile?.full_name?.charAt(0) || "SV"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Chào {firstName}! 👋</h3>
                                <p className="text-sm font-bold text-emerald-700 mt-0.5">Tài khoản Ứng viên</p>
                            </div>
                        </div>
                        <div className="p-6 pt-4">
                            <div className="space-y-3">
                                <div className="flex items-end justify-between">
                                    <span className="text-sm font-bold text-slate-700">Mức độ hoàn thiện CV</span>
                                    <span className="text-lg font-black text-emerald-600">{cvProgress}%</span>
                                </div>
                                <Progress value={cvProgress} className="h-3 bg-slate-100 [&>div]:bg-emerald-500 rounded-full transition-all" />
                                <p className="text-sm text-slate-500 font-medium leading-relaxed pt-2">
                                    {cvProgress === 100
                                        ? <span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Hồ sơ của bạn đã hoàn hảo!</span>
                                        : <>Hồ sơ đầy đủ giúp bạn tăng <strong className="text-emerald-600">x3 cơ hội</strong> trúng tuyển.</>
                                    }
                                </p>
                            </div>
                            <Button
                                onClick={() => navigate('/cv')}
                                className="w-full mt-6 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 font-bold transition-transform hover:scale-[1.02] active:scale-[0.98] h-12"
                            >
                                Cập nhật CV ngay <ChevronRight className="ml-1 h-5 w-5 text-emerald-400" />
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-[1.5rem] border-2 border-slate-100 bg-white p-6">
                        <h3 className="font-extrabold text-slate-900 mb-5 tracking-tight flex items-center gap-2">
                            Bí kíp trúng tuyển 🚀
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 group cursor-pointer" onClick={() => navigate('/settings')}>
                                <CheckCircle2 className={`h-6 w-6 shrink-0 transition-colors ${userProfile?.avatar_url ? 'text-emerald-500' : 'text-slate-200 group-hover:text-emerald-300'}`} />
                                <span className={`text-sm font-bold mt-0.5 transition-colors ${userProfile?.avatar_url ? 'text-slate-400 line-through' : 'text-slate-600 group-hover:text-emerald-600'}`}>Cập nhật ảnh đại diện chỉn chu</span>
                            </li>
                            <li className="flex items-start gap-3 group cursor-pointer" onClick={() => navigate('/cv')}>
                                <CheckCircle2 className={`h-6 w-6 shrink-0 transition-colors ${userProfile?.skills ? 'text-emerald-500' : 'text-slate-200 group-hover:text-emerald-300'}`} />
                                <span className={`text-sm font-bold mt-0.5 transition-colors ${userProfile?.skills ? 'text-slate-400 line-through' : 'text-slate-600 group-hover:text-emerald-600'}`}>Liệt kê các kỹ năng mềm nổi bật</span>
                            </li>
                            <li className="flex items-start gap-3 group cursor-pointer" onClick={() => navigate('/cv')}>
                                <CheckCircle2 className={`h-6 w-6 shrink-0 transition-colors ${userProfile?.university ? 'text-emerald-500' : 'text-slate-200 group-hover:text-emerald-300'}`} />
                                <span className={`text-sm font-bold mt-0.5 transition-colors ${userProfile?.university ? 'text-slate-400 line-through' : 'text-slate-600 group-hover:text-emerald-600'}`}>Cập nhật trường Đại học/Cao đẳng</span>
                            </li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    )
}