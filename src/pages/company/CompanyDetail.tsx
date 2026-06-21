import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import MainLayout from "@/components/layout/MainLayout"
import { Link as LinkIcon, Users, MapPin, Search, ChevronDown, ChevronUp, Copy, Heart, FileText, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function CompanyDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [company, setCompany] = useState<any>(null)
    const [companyEvents, setCompanyEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [role, setRole] = useState<string>("guest")
    const [isFollowed, setIsFollowed] = useState(false)
    const [activeTab, setActiveTab] = useState<"about" | "jobs">("about")

    // States for Trang chủ
    const [isIntroExpanded, setIsIntroExpanded] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [jobSearchTerm, setJobSearchTerm] = useState("")
    const [selectedLocation, setSelectedLocation] = useState("")

    // Floating banner trigger
    const [showFloatingBanner, setShowFloatingBanner] = useState(false)

    // Bookmarks state for job cards inside company details
    const [bookmarkedJobs, setBookmarkedJobs] = useState<Record<string, boolean>>({})

    const galleryImages = [
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&h=350&q=80",
        "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=600&h=350&q=80",
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&h=350&q=80"
    ]

    useEffect(() => {
        const fetchCompanyDetails = async () => {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
                if (profile) setRole(profile.role)

                // Fetch student bookmarks to show on job cards
                const { data: bookmarks } = await supabase
                    .from("event_bookmarks")
                    .select("event_id")
                    .eq("student_id", user.id)
                if (bookmarks) {
                    const bmMap: Record<string, boolean> = {}
                    bookmarks.forEach(bm => { bmMap[bm.event_id] = true })
                    setBookmarkedJobs(bmMap)
                }
            }

            // Fetch company profile details
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || "")
            let profileQuery = supabase.from("profiles").select("*")
            if (isUuid) {
                profileQuery = profileQuery.eq("id", id)
            } else {
                profileQuery = profileQuery.eq("slug", id)
            }
            const { data: profileData } = await profileQuery.maybeSingle()

            if (profileData) {
                setCompany(profileData)

                // Fetch events/jobs posted by this company
                const { data: eventsData } = await supabase
                    .from("events")
                    .select("*, danang_wards(name)")
                    .eq("organizer_id", profileData.id)
                    .order("created_at", { ascending: false })

                if (eventsData) {
                    setCompanyEvents(eventsData)
                }
            }

            setLoading(false)
        }

        fetchCompanyDetails()
    }, [id])

    // Scroll listener for floating follow banner
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 280) {
                setShowFloatingBanner(true)
            } else {
                setShowFloatingBanner(false)
            }
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    if (loading) {
        return (
            <MainLayout role="guest">
                <div className="flex justify-center items-center py-20 text-slate-500 font-medium font-sans">Đang tải thông tin công ty...</div>
            </MainLayout>
        )
    }

    if (!company) {
        return (
            <MainLayout role="guest">
                <div className="text-center py-20 font-sans">
                    <h2 className="text-2xl font-black text-slate-900">Không tìm thấy công ty</h2>
                    <p className="text-slate-500 mt-2">Công ty này có thể đã ngừng hoạt động hoặc không tồn tại.</p>
                    <Button onClick={() => navigate(-1)} className="mt-4 rounded-xl bg-slate-900 text-white">Quay lại</Button>
                </div>
            </MainLayout>
        )
    }

    const toggleBookmark = async (eventId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode: "login" } }))
            return
        }

        const isCurrentlyBookmarked = !!bookmarkedJobs[eventId]
        if (isCurrentlyBookmarked) {
            const { error } = await supabase
                .from("event_bookmarks")
                .delete()
                .eq("student_id", user.id)
                .eq("event_id", eventId)
            if (!error) setBookmarkedJobs(prev => ({ ...prev, [eventId]: false }))
        } else {
            const { error } = await supabase
                .from("event_bookmarks")
                .insert([{ student_id: user.id, event_id: eventId }])
            if (!error) setBookmarkedJobs(prev => ({ ...prev, [eventId]: true }))
        }
    }

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href)
        alert("Đã sao chép liên kết chia sẻ công ty thành công!")
    }

    const filteredJobs = companyEvents.filter((job) => {
        const matchesSearch = job.title.toLowerCase().includes(jobSearchTerm.toLowerCase())
        const matchesLocation = selectedLocation ? (job.danang_wards?.name || "").includes(selectedLocation) : true
        return matchesSearch && matchesLocation
    })

    const locationsList = Array.from(new Set(companyEvents.map(job => job.danang_wards?.name).filter(Boolean))) as string[]

    return (
        <MainLayout role={role}>
            <div className="max-w-6xl mx-auto py-4 px-4 font-sans text-[#212f3f] selection:bg-emerald-100">
                {/* Company Header Box (No Cover Banner) */}
                <div className="wrapper-company-cover bg-white rounded-2xl border border-slate-200 p-6 md:p-8 min-[1440px]:p-[24px_24px_0px] shadow-sm flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative min-[1440px]:w-[1140px] min-[1440px]:h-[230px] min-[1440px]:rounded-[16px] min-[1440px]:shadow-[0px_0px_14px_0px_rgba(0,0,0,0.03)] min-[1440px]:box-border">
                    <div className="company-cover-inner_header flex flex-col md:flex-row items-center md:items-start gap-6 w-full md:w-auto min-[1440px]:w-[1092px] min-[1440px]:h-[140px] min-[1440px]:gap-[16px] min-[1440px]:flex-row">
                        {/* Custom Square Box for Logo */}
                        <div className="company-image-logo border border-slate-200 rounded-2xl p-2 w-28 h-28 md:w-32 md:h-32 flex items-center justify-center bg-white shadow-sm shrink-0 min-[1440px]:w-[140px] min-[1440px]:h-[140px] min-[1440px]:rounded-[12px] min-[1440px]:border min-[1440px]:border-[#ddd] min-[1440px]:p-2 min-[1440px]:box-border">
                            <Avatar className="h-full w-full rounded-xl min-[1440px]:rounded-[8px]">
                                <AvatarImage src={company.avatar_url} className="object-contain" />
                                <AvatarFallback className="rounded-xl min-[1440px]:rounded-[8px] bg-emerald-50 text-[#00b14f] text-4xl font-black">
                                    {company.full_name?.charAt(0).toUpperCase() || "O"}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        {/* Title & Website & Follow button wrapped in company-detail-overview */}
                        <div className="company-detail-overview flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full min-[1440px]:w-[936px] min-[1440px]:h-[140px] min-[1440px]:gap-[16px] min-[1440px]:flex-row min-[1440px]:justify-between min-[1440px]:items-center">

                            <div className="box-detail text-center md:text-left pt-2 md:pt-4 flex flex-col items-center md:items-start gap-2.5 min-[1440px]:w-[748px] min-[1440px]:h-[60px] min-[1440px]:gap-[12px] min-[1440px]:items-start min-[1440px]:pt-0">
                                <h1 className="box-detail_company-name text-lg md:text-xl font-bold text-slate-800 leading-snug min-[1440px]:text-[20px] min-[1440px]:font-semibold min-[1440px]:leading-[28px] min-[1440px]:text-[#263a4d] min-[1440px]:font-sans min-[1440px]:tracking-[-0.2px]">
                                    {company.full_name}
                                </h1>
                                <div className="box-company-info flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 mt-1 text-xs font-bold text-slate-400 min-[1440px]:gap-[8px] min-[1440px]:mt-0">
                                    <div className="box-company-info_item flex items-center gap-1.5 min-[1440px]:gap-[8px]">
                                        <a href="https://www.pranfoods.net/" target="_blank" rel="noreferrer" className="box-company-info_item hover:text-[#00b14f] flex items-center gap-1.5 transition-colors min-[1440px]:text-[14px] min-[1440px]:text-[#7f878f] min-[1440px]:tracking-[0.14px] min-[1440px]:font-normal">
                                            <LinkIcon className="w-3.5 h-3.5 shrink-0" /> https://www.pranfoods.net/
                                        </a>
                                    </div>
                                    <span className="text-slate-200 min-[1440px]:hidden">|</span>
                                    <div className="box-company-info_item flex items-center gap-1.5 min-[1440px]:gap-[8px]">
                                        <span className="flex items-center gap-1.5 hover:text-[#00b14f] transition-colors min-[1440px]:text-[14px] min-[1440px]:text-[#7f878f] min-[1440px]:tracking-[0.14px] min-[1440px]:font-normal">
                                            <Users className="w-3.5 h-3.5 shrink-0" /> {isFollowed ? "3" : "2"} người theo dõi
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Follow Button Box */}
                            <div className="box-follow flex items-center gap-3 pt-2 md:pt-4 shrink-0 min-[1440px]:w-[172px] min-[1440px]:h-[42px] min-[1440px]:pt-0">
                                <Button
                                    onClick={() => setIsFollowed(!isFollowed)}
                                    className={`btn btn-follow btn-follow-js w-full rounded-full font-bold h-10 px-6 border text-xs transition-all min-[1440px]:h-[42px] min-[1440px]:rounded-[1000px] min-[1440px]:text-[14px] min-[1440px]:font-semibold min-[1440px]:py-[10px] min-[1440px]:px-0 min-[1440px]:justify-center min-[1440px]:gap-[8px] min-[1440px]:tracking-[0.175px] min-[1440px]:bg-[#00b14f] min-[1440px]:border-[#00b14f] ${isFollowed
                                            ? "bg-[#00b14f] hover:bg-[#009a44] text-white border-[#00b14f]"
                                            : "bg-[#00b14f] hover:bg-[#009a44] text-white border-[#00b14f]"
                                        }`}
                                >
                                    {isFollowed ? (
                                        <span>✓ Đang theo dõi</span>
                                    ) : (
                                        <>
                                            <i className="fa-regular fa-plus flex items-center justify-center w-5 h-5 min-[1440px]:w-[20px] min-[1440px]:h-[20px] min-[1440px]:p-[2px] min-[1440px]:text-[14px] text-white shrink-0">+</i>
                                            <span>Theo dõi công ty</span>
                                        </>
                                    )}
                                </Button>
                            </div>

                        </div>
                    </div>

                    {/* Tabs inside Header Box at bottom left */}
                    <div className="box-tab-link absolute bottom-0 left-6 md:left-8 flex gap-6 min-[1440px]:absolute min-[1440px]:bottom-0 min-[1440px]:left-[180px] min-[1440px]:w-[1092px] min-[1440px]:h-[42px] min-[1440px]:gap-[20px]">
                        <button
                            onClick={() => setActiveTab("about")}
                            className={`box-tab-link_item pb-3 font-extrabold text-xs relative transition-colors min-[1440px]:text-[14px] min-[1440px]:font-semibold min-[1440px]:py-[7px] min-[1440px]:px-0 min-[1440px]:pb-[13px] min-[1440px]:tracking-[0.175px] ${activeTab === "about" ? "active-link text-[#00b14f]" : "text-slate-500 hover:text-[#00b14f]"
                                }`}
                        >
                            Trang chủ
                            {activeTab === "about" && <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#00b14f] rounded-t-full" />}
                        </button>
                        <button
                            onClick={() => setActiveTab("jobs")}
                            className={`box-tab-link_item pb-3 font-extrabold text-xs relative transition-colors flex items-center gap-1 min-[1440px]:text-[14px] min-[1440px]:font-semibold min-[1440px]:py-[7px] min-[1440px]:px-0 min-[1440px]:pb-[13px] min-[1440px]:tracking-[0.175px] ${activeTab === "jobs" ? "active-link text-[#00b14f]" : "text-slate-500 hover:text-[#00b14f]"
                                }`}
                        >
                            Tin tuyển dụng ({companyEvents.length})
                            {activeTab === "jobs" && <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#00b14f] rounded-t-full" />}
                        </button>
                    </div>
                </div>

                {/* Subtitle heading when tab is Recruitment */}
                {activeTab === "jobs" && (
                    <h2 className="text-md font-bold text-slate-800 mt-8 mb-4">
                        Việc làm tại {company.full_name.toUpperCase()}
                    </h2>
                )}

                {/* Tab Contents */}
                {activeTab === "about" ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                        {/* Left Side (Giới thiệu, Hình ảnh, Tin tuyển dụng) */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Giới thiệu */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4">
                                <h2 className="text-base font-bold text-slate-800 border-l-[3.5px] border-[#00b14f] pl-3 leading-none">
                                    Giới thiệu công ty
                                </h2>
                                <div className="relative">
                                    <div className={`text-xs font-semibold text-slate-500 leading-relaxed transition-all duration-300 ${isIntroExpanded ? "" : "line-clamp-4"}`}>
                                        {company.bio || `${company.full_name} is a fast-growing company operating in the FMCG and F&B distribution sector in Vietnam. The company specializes in importing, distributing, and trading high-quality food and beverage products across the Vietnamese market. As a subsidiary of the multinational PRAN-RFL Group, one of the leading food and consumer goods corporations with a global presence, the company leverages international expertise, strong supply chains, and a wide product portfolio to expand its market footprint in Vietnam.`}
                                    </div>
                                    <button
                                        onClick={() => setIsIntroExpanded(!isIntroExpanded)}
                                        className="text-xs font-bold text-[#00b14f] hover:text-[#009a44] mt-3 flex items-center gap-1 transition-colors"
                                    >
                                        {isIntroExpanded ? (
                                            <>Thu gọn <ChevronUp className="w-3.5 h-3.5" /></>
                                        ) : (
                                            <>Xem thêm <ChevronDown className="w-3.5 h-3.5" /></>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Hình ảnh công ty (Gallery slider) */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-base font-bold text-slate-800 border-l-[3.5px] border-[#00b14f] pl-3 leading-none">
                                        Hình ảnh công ty
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                                            disabled={currentImageIndex === 0}
                                            className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#00b14f] hover:border-[#00b14f] disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-200 transition-colors"
                                        >
                                            &lt;
                                        </button>
                                        <button
                                            onClick={() => setCurrentImageIndex(prev => Math.min(galleryImages.length - 1, prev + 1))}
                                            disabled={currentImageIndex === galleryImages.length - 1}
                                            className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#00b14f] hover:border-[#00b14f] disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-200 transition-colors"
                                        >
                                            &gt;
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3 overflow-hidden rounded-xl">
                                    {galleryImages.map((imgUrl, idx) => (
                                        <div key={imgUrl} className="relative aspect-[4/3] rounded-lg overflow-hidden group">
                                            <img
                                                src={imgUrl}
                                                alt={`Company Gallery ${idx + 1}`}
                                                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${idx === currentImageIndex ? "ring-2 ring-[#00b14f]" : ""}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tin tuyển dụng */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-5">
                                <h2 className="text-base font-bold text-slate-800 border-l-[3.5px] border-[#00b14f] pl-3 leading-none">
                                    Tin tuyển dụng
                                </h2>

                                {/* Dynamic search filters */}
                                <div className="flex flex-col md:flex-row gap-3 pt-1">
                                    <div className="flex-1 flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2 bg-slate-50/50">
                                        <Search className="w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Tên công việc, vị trí tuyển dụng..."
                                            value={jobSearchTerm}
                                            onChange={(e) => setJobSearchTerm(e.target.value)}
                                            className="bg-transparent text-xs text-slate-700 outline-none w-full font-medium"
                                        />
                                    </div>
                                    <select
                                        value={selectedLocation}
                                        onChange={(e) => setSelectedLocation(e.target.value)}
                                        className="border border-slate-200 rounded-xl px-4 py-2 bg-white text-xs font-bold text-slate-600 focus:outline-none focus:border-[#00b14f] max-w-full md:max-w-[200px]"
                                    >
                                        <option value="">Tất cả tỉnh/thành phố</option>
                                        {locationsList.map(loc => (
                                            <option key={loc} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                    <button className="bg-[#00b14f] hover:bg-[#009a44] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all flex items-center justify-center shrink-0">
                                        Tìm kiếm
                                    </button>
                                </div>

                                {/* Openings lists */}
                                {filteredJobs.length === 0 ? (
                                    <div className="py-8 text-center text-slate-400 font-semibold text-xs">Hiện tại không tìm thấy tin tuyển dụng nào phù hợp.</div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredJobs.map((job) => (
                                            <div
                                                key={job.id}
                                                onClick={() => navigate(`/jobs/${job.slug || job.id}`)}
                                                className="p-4 rounded-xl border border-slate-100 hover:border-[#00b14f] hover:shadow-md transition-all flex items-start justify-between gap-4 cursor-pointer group bg-white"
                                            >
                                                <div className="flex gap-3">
                                                    <div className="border border-slate-200 rounded-xl p-1.5 w-16 h-16 flex items-center justify-center bg-white shadow-sm shrink-0">
                                                        <Avatar className="h-full w-full rounded-lg">
                                                            <AvatarImage src={company.avatar_url} className="object-contain" />
                                                            <AvatarFallback className="rounded-lg bg-emerald-50 text-[#00b14f] text-xl font-black">
                                                                {company.full_name?.charAt(0).toUpperCase() || "O"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-slate-800 group-hover:text-[#00b14f] transition-colors leading-tight line-clamp-2">
                                                            {job.title}
                                                        </h3>
                                                        <p className="text-[11px] text-slate-400 font-bold mt-1.5">{company.full_name}</p>
                                                        <div className="flex items-center gap-1.5 flex-wrap mt-2">
                                                            <span className="text-[10px] font-bold bg-[#f4f5f6] text-slate-600 px-2 py-0.5 rounded">
                                                                {job.danang_wards?.name ? `P. ${job.danang_wards.name}` : (job.location || "Đà Nẵng")}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end justify-between h-16 shrink-0">
                                                    <span className="text-xs font-bold text-[#00b14f]">{job.benefits || "Thỏa thuận"}</span>
                                                    <button
                                                        onClick={(e) => toggleBookmark(job.id, e)}
                                                        className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${bookmarkedJobs[job.id]
                                                                ? "bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100"
                                                                : "bg-white border-slate-200 text-slate-350 hover:text-rose-500 hover:border-rose-200"
                                                            }`}
                                                    >
                                                        <Heart className={`w-3.5 h-3.5 ${bookmarkedJobs[job.id] ? "fill-current" : ""}`} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Side (Thông tin chung, Địa điểm, Chia sẻ) */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Thông tin chung */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                                <h3 className="text-base font-bold text-slate-800">Thông tin chung</h3>
                                <div className="space-y-4 pt-1">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                                            <FileText className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-medium">Mã số thuế</p>
                                            <p className="text-xs text-slate-800 font-bold mt-0.5">0317906869</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                                            <Users className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-medium">Quy mô</p>
                                            <p className="text-xs text-slate-800 font-bold mt-0.5">100-499 nhân viên</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                                            <Briefcase className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-medium">Lĩnh vực hoạt động</p>
                                            <p className="text-xs text-slate-800 font-bold mt-0.5">Bán lẻ - Hàng tiêu dùng - FMCG</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Địa điểm công ty */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                                <h3 className="text-base font-bold text-slate-800">Địa điểm công ty</h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2 text-xs font-semibold text-slate-500 leading-snug">
                                        <MapPin className="w-4 h-4 text-slate-450 shrink-0 mt-0.5" />
                                        <span>31, Vo Van Van Street, Vinh Loc B, Binh Chanh</span>
                                    </div>
                                    {/* Mock Google Maps block */}
                                    <div className="border border-slate-100 rounded-xl overflow-hidden shadow-inner aspect-[4/3] bg-slate-50 relative flex items-center justify-center">
                                        <img
                                            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=350&h=260&q=80"
                                            alt="Map placeholder"
                                            className="w-full h-full object-cover opacity-80"
                                        />
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("31, Vo Van Van Street, Vinh Loc B, Binh Chanh")}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="absolute bg-white/95 text-[10px] font-bold text-[#00b14f] px-3 py-1.5 rounded-lg shadow border border-slate-200 hover:bg-white transition-colors"
                                        >
                                            🗺️ Mở trong Maps
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Chia sẻ công ty */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                                <h3 className="text-base font-bold text-slate-800">Chia sẻ công ty</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold mb-1.5">Sao chép đường dẫn</p>
                                        <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-2 bg-slate-50/50">
                                            <input
                                                type="text"
                                                readOnly
                                                value={window.location.href}
                                                className="bg-transparent text-[11px] text-slate-400 font-medium select-all outline-none w-full truncate"
                                            />
                                            <button
                                                onClick={handleCopyLink}
                                                className="p-1 text-slate-400 hover:text-[#00b14f] hover:bg-[#00b14f]/5 rounded transition-all shrink-0"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold mb-2">Chia sẻ qua mạng xã hội</p>
                                        <div className="flex items-center gap-2.5">
                                            <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                                                </svg>
                                            </button>
                                            <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-black hover:bg-slate-50 transition-colors">
                                                <span className="font-bold text-sm">𝕏</span>
                                            </button>
                                            <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors">
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                                    <rect x="2" y="9" width="4" height="12" />
                                                    <circle cx="4" cy="4" r="2" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Tin tuyển dụng Tab Content */
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
                        {/* Sidebar filters (left side) */}
                        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 h-fit">
                            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Danh mục nghề</h3>
                            <div className="space-y-4 pt-1">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#00b14f] cursor-pointer">
                                        <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#00b14f] focus:ring-[#00b14f]" />
                                        <span>Tất cả vị trí ({companyEvents.length})</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Search & Listings (right side) */}
                        <div className="lg:col-span-3 space-y-4">
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                                {/* Search bar */}
                                <div className="flex flex-col md:flex-row gap-3 pt-1">
                                    <div className="flex-1 flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2 bg-slate-50/50">
                                        <Search className="w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Tên công việc, vị trí ứng tuyển..."
                                            value={jobSearchTerm}
                                            onChange={(e) => setJobSearchTerm(e.target.value)}
                                            className="bg-transparent text-xs text-slate-700 outline-none w-full font-medium"
                                        />
                                    </div>
                                    <select
                                        value={selectedLocation}
                                        onChange={(e) => setSelectedLocation(e.target.value)}
                                        className="border border-slate-200 rounded-xl px-4 py-2 bg-white text-xs font-bold text-slate-600 focus:outline-none focus:border-[#00b14f] max-w-full md:max-w-[200px]"
                                    >
                                        <option value="">Tất cả khu vực</option>
                                        {locationsList.map(loc => (
                                            <option key={loc} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                    <button className="bg-[#00b14f] hover:bg-[#009a44] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all flex items-center justify-center shrink-0">
                                        Tìm kiếm
                                    </button>
                                </div>

                                {/* Full list */}
                                {filteredJobs.length === 0 ? (
                                    <div className="py-16 text-center text-slate-400 font-semibold text-xs">Không tìm thấy tin tuyển dụng nào phù hợp.</div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredJobs.map((job) => (
                                            <div
                                                key={job.id}
                                                onClick={() => navigate(`/jobs/${job.slug || job.id}`)}
                                                className="p-4 rounded-xl border border-slate-100 hover:border-[#00b14f] hover:shadow-md transition-all flex items-start justify-between gap-4 cursor-pointer group bg-white"
                                            >
                                                <div className="flex gap-3">
                                                    <div className="border border-slate-200 rounded-xl p-1.5 w-16 h-16 flex items-center justify-center bg-white shadow-sm shrink-0">
                                                        <Avatar className="h-full w-full rounded-lg">
                                                            <AvatarImage src={company.avatar_url} className="object-contain" />
                                                            <AvatarFallback className="rounded-lg bg-emerald-50 text-[#00b14f] text-xl font-black">
                                                                {company.full_name?.charAt(0).toUpperCase() || "O"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-slate-800 group-hover:text-[#00b14f] transition-colors leading-tight line-clamp-2">
                                                            {job.title}
                                                        </h3>
                                                        <p className="text-[11px] text-slate-400 font-bold mt-1.5">{company.full_name}</p>
                                                        <div className="flex items-center gap-1.5 flex-wrap mt-2">
                                                            <span className="text-[10px] font-bold bg-[#f4f5f6] text-slate-600 px-2 py-0.5 rounded">
                                                                {job.danang_wards?.name ? `P. ${job.danang_wards.name}` : (job.location || "Đà Nẵng")}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end justify-between h-16 shrink-0">
                                                    <span className="text-xs font-bold text-[#00b14f]">{job.benefits || "Thỏa thuận"}</span>
                                                    <button
                                                        onClick={(e) => toggleBookmark(job.id, e)}
                                                        className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${bookmarkedJobs[job.id]
                                                                ? "bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100"
                                                                : "bg-white border-slate-200 text-slate-350 hover:text-rose-500 hover:border-rose-200"
                                                            }`}
                                                    >
                                                        <Heart className={`w-3.5 h-3.5 ${bookmarkedJobs[job.id] ? "fill-current" : ""}`} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom Floating Follow Banner */}
                {showFloatingBanner && (
                    <div className="fixed bottom-4 left-4 right-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xl z-[100] flex items-center justify-between gap-4 animate-in slide-in-from-bottom-5 duration-300 max-w-4xl mx-auto border-t-4 border-[#00b14f]">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="border border-slate-200 rounded-xl p-1 w-12 h-12 flex items-center justify-center bg-white shrink-0">
                                <Avatar className="h-full w-full rounded-lg">
                                    <AvatarImage src={company.avatar_url} className="object-contain" />
                                    <AvatarFallback className="rounded-lg bg-emerald-50 text-[#00b14f] text-lg font-black">
                                        {company.full_name?.charAt(0).toUpperCase() || "O"}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-slate-500">Theo dõi để nhận thông báo việc làm mới nhất từ</p>
                                <p className="text-sm font-bold text-slate-800 truncate" title={company.full_name}>{company.full_name}</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setIsFollowed(!isFollowed)}
                            className={`rounded-lg font-bold h-10 px-5 text-xs transition-all shrink-0 ${isFollowed
                                    ? "bg-[#00b14f] hover:bg-[#009a44] text-white border-[#00b14f]"
                                    : "bg-[#00b14f] hover:bg-[#009a44] text-white border-[#00b14f]"
                                }`}
                        >
                            {isFollowed ? "✓ Đang theo dõi" : "+ Theo dõi ngay"}
                        </Button>
                    </div>
                )}
            </div>
        </MainLayout>
    )
}
