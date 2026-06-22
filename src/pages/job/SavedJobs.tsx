import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import MainLayout from "@/components/layout/MainLayout"
import { Bookmark, MapPin, Building2, Briefcase, Tag, Trash2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SkeletonGenericPage } from "@/components/ui/Skeleton"

export default function SavedJobs() {
    const navigate = useNavigate()
    const [bookmarks, setBookmarks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [role, setRole] = useState("student")

    const fetchMyBookmarks = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            navigate("/login")
            return
        }

        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
        if (profile) setRole(profile.role)

        const { data, error } = await supabase
            .from("event_bookmarks")
            .select(`
                id,
                event_id,
                events (
                    id, title, location, status, position_type, category, benefits, event_date, application_deadline, slug,
                    danang_wards (name),
                    profiles (id, full_name, avatar_url, slug)
                )
            `)
            .eq("student_id", user.id)
            .order("created_at", { ascending: false })

        if (error) {
            console.error("🚨 Lỗi truy vấn việc làm đã lưu:", error)
        } else if (data) {
            setBookmarks(data)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchMyBookmarks()
    }, [navigate])

    const handleRemoveBookmark = async (bookmarkId: string) => {
        const { error } = await supabase
            .from("event_bookmarks")
            .delete()
            .eq("id", bookmarkId)

        if (!error) {
            setBookmarks(prev => prev.filter(b => b.id !== bookmarkId))
        } else {
            alert("Lỗi khi bỏ lưu: " + error.message)
        }
    }

    if (loading) return <SkeletonGenericPage />

    return (
        <MainLayout role={role}>
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

                <div className="mb-8 bg-white p-8 rounded-[2rem] border-2 border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                            <Bookmark className="w-8 h-8 text-emerald-500 fill-emerald-500/10" />
                            Việc làm đã lưu
                        </h1>
                        <p className="text-slate-500 font-medium mt-2">
                            Xem và quản lý các cơ hội việc làm sự kiện bạn đã lưu để ứng tuyển sau.
                        </p>
                    </div>
                    <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none px-4 py-2 text-sm font-bold">
                        Tổng cộng: {bookmarks.length} việc làm
                    </Badge>
                </div>

                <div className="space-y-4">
                    {bookmarks.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bookmark className="w-10 h-10 text-slate-300" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Bạn chưa lưu việc làm nào</h2>
                            <p className="text-slate-500 font-medium mb-6">Hãy lướt xem các sự kiện tuyển dụng và lưu lại những vị trí bạn yêu thích.</p>
                            <Button onClick={() => navigate("/")} className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-8">
                                Khám phá ngay <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                    ) : (
                        bookmarks.map((b, idx) => {
                            const event = b.events
                            const organizer = event?.profiles

                            return (
                                <div key={b.id} className="bg-white rounded-[1.5rem] border-2 border-slate-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 50}ms` }}>

                                    <div className="flex gap-5 items-start flex-1 cursor-pointer min-w-0" onClick={() => navigate(`/jobs/${event?.slug || event?.id}`)}>
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
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-3 shrink-0 w-full sm:w-auto">
                                        <div className="flex items-center gap-2 w-full justify-end">
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((event?.location ? event.location + ', ' : '') + (event?.danang_wards?.name ? 'Phường ' + event.danang_wards.name + ', ' : '') + 'Đà Nẵng')}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex items-center gap-0.5 rounded-xl bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-100 transition-colors h-8"
                                            >
                                                🗺️ Bản đồ
                                            </a>
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleRemoveBookmark(b.id)
                                                }}
                                                variant="outline"
                                                className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold h-8 px-2.5 shadow-none flex items-center gap-1 text-xs"
                                                title="Bỏ lưu việc làm này"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                <span>Bỏ lưu</span>
                                            </Button>
                                        </div>
                                    </div>

                                </div>
                            )
                        })
                    )}
                </div>

            </div>
        </MainLayout>
    )
}
