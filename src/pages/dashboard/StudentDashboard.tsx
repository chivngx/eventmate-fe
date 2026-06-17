import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, MapPin, Clock, DollarSign, ChevronRight, CheckCircle2, Bookmark, CheckCircle, XCircle, Clock3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase"

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

    const renderActionButton = (job: any) => {
        const status = myApplications[job.id]

        if (status === 'approved') return <Button disabled className="mt-6 w-full rounded-2xl bg-emerald-100 text-emerald-700 opacity-100 font-bold sm:mt-0 sm:w-auto sm:self-center shadow-none px-6 h-11 border-2 border-emerald-200"><CheckCircle className="w-5 h-5 mr-2" /> Trúng tuyển</Button>
        if (status === 'rejected') return <Button disabled className="mt-6 w-full rounded-2xl bg-rose-50 text-rose-500 opacity-100 font-bold sm:mt-0 sm:w-auto sm:self-center shadow-none px-6 h-11 border-2 border-rose-100"><XCircle className="w-5 h-5 mr-2" /> Chưa phù hợp</Button>
        if (status === 'pending') return <Button disabled className="mt-6 w-full rounded-2xl bg-amber-50 text-amber-600 opacity-100 font-bold sm:mt-0 sm:w-auto sm:self-center shadow-none px-6 h-11 border-2 border-amber-100"><Clock3 className="w-5 h-5 mr-2" /> Đang chờ duyệt</Button>

        return (
            <Button
                onClick={() => handleApply(job.id, job.organizer_id, job.title)}
                disabled={applyingId === job.id}
                className="mt-6 w-full rounded-2xl bg-slate-900 text-white hover:bg-emerald-600 font-bold sm:mt-0 sm:w-auto sm:self-center shadow-none transition-colors px-6 h-11 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {applyingId === job.id ? "Đang xử lý..." : "Ứng tuyển ngay"}
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

    return (
        <div className="space-y-8 pb-10">
            {/* 1. BANNER PHẲNG */}
            <div className="relative overflow-hidden rounded-[2rem] bg-emerald-500 px-6 py-14 shadow-md sm:px-16 sm:py-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="relative z-10 mx-auto max-w-3xl text-center space-y-5">
                    <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl leading-tight">
                        Nắm bắt cơ hội sự kiện <br className="hidden sm:block" /> bứt phá sự nghiệp
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
                    <div className="flex items-center justify-between pb-2">
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                            Việc làm mới nhất
                            <Badge className="bg-emerald-100 text-emerald-700 shadow-none border-none ml-2">
                                {filteredEvents.length}
                            </Badge>
                        </h2>
                        <a href="#" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline">Xem tất cả</a>
                    </div>

                    <div className="flex flex-col gap-5">
                        {loadingData ? (
                            <div className="text-center py-10 text-slate-500 font-medium">Đang tải sự kiện...</div>
                        ) : filteredEvents.length === 0 ? (
                            <div className="text-center py-12 px-6 bg-white rounded-[1.5rem] border-2 border-dashed border-slate-200">
                                <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-slate-900">Không tìm thấy kết quả</h3>
                                <p className="text-slate-500 font-medium mt-1">Thử thay đổi từ khóa hoặc địa điểm tìm kiếm xem sao.</p>
                                <Button onClick={() => { setSearchTerm(""); setLocationTerm("") }} variant="link" className="text-emerald-600 font-bold mt-2">Xóa bộ lọc</Button>
                            </div>
                        ) : (
                            filteredEvents.map((job, idx) => (
                                <div key={job.id} className="group relative flex flex-col sm:flex-row sm:items-center justify-between rounded-[1.5rem] border-2 border-slate-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 50}ms` }}>
                                    <button className="absolute right-6 top-6 text-slate-300 hover:text-emerald-600 transition-colors">
                                        <Bookmark className="h-6 w-6" />
                                    </button>

                                    <div className="flex gap-5 items-start cursor-pointer w-full" onClick={() => navigate(`/jobs/${job.id}`)}>
                                        <Avatar className="h-16 w-16 rounded-2xl border-2 border-slate-50 mt-1 shrink-0">
                                            <AvatarFallback className="rounded-2xl bg-slate-100 text-2xl font-black text-slate-700 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                                {job.profiles?.full_name ? job.profiles.full_name.charAt(0).toUpperCase() : "O"}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="pr-8 flex-1">
                                            <div className="mb-2">
                                                <Badge variant="secondary" className={`font-bold px-3 py-1 rounded-lg ${getColorClass(idx)}`}>
                                                    {job.status === 'upcoming' ? "Sắp diễn ra" : job.status}
                                                </Badge>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors leading-tight">
                                                {job.title}
                                            </h3>
                                            <p className="mt-1.5 text-sm font-bold text-slate-500 uppercase tracking-wider">
                                                {job.profiles?.full_name || "Đơn vị ẩn danh"}
                                            </p>
                                            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-600">
                                                <span className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-1.5 text-slate-600">
                                                    <MapPin className="h-4 w-4 text-slate-400" /> {job.location || "Đang cập nhật"}
                                                </span>
                                                <span className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-1.5 text-slate-500 font-normal max-w-[200px] truncate">
                                                    {job.description || "Chưa có mô tả"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6 sm:mt-0 shrink-0">
                                        {renderActionButton(job)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
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