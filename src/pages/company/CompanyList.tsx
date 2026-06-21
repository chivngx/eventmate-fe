import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import MainLayout from "@/components/layout/MainLayout"
import { Building2, Search, MapPin, Mail, Phone, CalendarDays, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function CompanyList() {
    const navigate = useNavigate()
    const [organizers, setOrganizers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [userRole, setUserRole] = useState("guest")

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)

            // Fetch user role
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
                if (profile) setUserRole(profile.role)
            }

            // Fetch organizer profiles & their events to count
            const { data, error } = await supabase
                .from("profiles")
                .select(`
                    id,
                    full_name,
                    avatar_url,
                    bio,
                    slug,
                    university,
                    email,
                    phone,
                    events (id)
                `)
                .eq("role", "organizer")

            if (error) {
                console.error("Lỗi tải danh sách BTC:", error)
            } else if (data) {
                setOrganizers(data)
            }
            setLoading(false)
        }

        fetchData()
    }, [])

    const filteredOrganizers = organizers.filter(org => {
        const nameMatch = org.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
        const bioMatch = org.bio?.toLowerCase().includes(searchTerm.toLowerCase())
        const uniMatch = org.university?.toLowerCase().includes(searchTerm.toLowerCase())
        return nameMatch || bioMatch || uniMatch
    })

    return (
        <MainLayout role={userRole}>
            <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header Section */}
                <div className="mb-10 text-center md:text-left bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-transparent p-8 md:p-12 rounded-[2rem] border-2 border-emerald-500/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 dark:bg-emerald-950/20 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3 opacity-55"></div>
                    
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 flex items-center justify-center md:justify-start gap-3">
                        <Building2 className="w-10 h-10 text-emerald-500 shrink-0" />
                        Danh sách Ban Tổ Chức
                    </h1>
                    <p className="text-slate-500 font-medium mt-3 max-w-xl">
                        Kết nối với các nhà tổ chức sự kiện uy tín tại Đà Nẵng, xem hồ sơ hoạt động và khám phá các cơ hội cống hiến mới.
                    </p>

                    <div className="mt-8 max-w-md">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Tìm kiếm ban tổ chức, trường học, mô tả..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-4 h-12 bg-white rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 font-bold text-sm shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                {loading ? (
                    <div className="flex justify-center items-center py-24 text-slate-500 font-bold">
                        Đang tải danh sách các Ban tổ chức...
                    </div>
                ) : filteredOrganizers.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Không tìm thấy Ban tổ chức nào</h3>
                        <p className="text-slate-400 text-sm mt-1">Hãy thử tìm kiếm với từ khóa khác.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredOrganizers.map((org, index) => {
                            const eventCount = org.events?.length || 0;
                            const displayName = org.full_name || "Ban tổ chức ẩn danh";
                            const orgLink = `/companies/${org.slug || org.id}`;

                            return (
                                <div
                                    key={org.id}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                    className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-100 dark:border-slate-800 p-6 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-300 flex flex-col justify-between group animate-in fade-in slide-in-from-bottom-3"
                                >
                                    <div>
                                        {/* Avatar & Badges */}
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <Avatar className="h-16 w-16 rounded-2xl border-2 border-slate-50 mt-1 shrink-0">
                                                <AvatarImage src={org.avatar_url} />
                                                <AvatarFallback className="rounded-2xl bg-slate-100 text-2xl font-black text-slate-700">
                                                    {displayName.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            
                                            <Badge className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30 hover:bg-emerald-100/50 font-bold px-3 py-1 text-xs flex items-center gap-1">
                                                <CalendarDays className="w-3.5 h-3.5" />
                                                {eventCount} sự kiện
                                            </Badge>
                                        </div>

                                        {/* Info */}
                                        <h3
                                            onClick={() => navigate(orgLink)}
                                            className="text-lg font-black text-slate-950 dark:text-slate-50 hover:text-emerald-600 transition-colors cursor-pointer line-clamp-1 mb-1"
                                        >
                                            {displayName}
                                        </h3>

                                        {org.university && (
                                            <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mb-3">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                {org.university}
                                            </p>
                                        )}

                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-3 mb-5">
                                            {org.bio || "Chưa có bài giới thiệu chi tiết về ban tổ chức này."}
                                        </p>
                                    </div>

                                    {/* Contact & Action Button */}
                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                                        {org.email && (
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500">
                                                <Mail className="w-3.5 h-3.5 shrink-0" />
                                                <span className="truncate" title={org.email}>{org.email}</span>
                                            </div>
                                        )}
                                        {org.phone && (
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500">
                                                <Phone className="w-3.5 h-3.5 shrink-0" />
                                                <span>{org.phone}</span>
                                            </div>
                                        )}
                                        
                                        <Button
                                            onClick={() => navigate(orgLink)}
                                            className="w-full mt-3 rounded-xl bg-slate-55 hover:bg-emerald-600 dark:bg-slate-800 dark:hover:bg-emerald-600 text-slate-700 dark:text-slate-300 hover:text-white dark:hover:text-white font-bold h-10 px-4 flex items-center justify-between border-0 transition-all shadow-none group/btn"
                                        >
                                            <span>Xem trang chi tiết</span>
                                            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </MainLayout>
    )
}
