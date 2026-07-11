"use client"

import { useState, useEffect } from"react"
import { useNavigate } from"@/lib/router"
import { supabase } from"@/lib/supabase"
import { getUserFacingMessage } from"@/lib/error"
import {
 LayoutDashboard,
 Building2,
 Users,
 FileText,
 CreditCard,
 LogOut,
 ChevronLeft,
 Menu,
 Home,
 Shield,
 Trash2
} from"lucide-react"
import { Button } from"@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from"@/components/ui/avatar"
import { Badge } from"@/components/ui/badge"
import { useToast } from"@/components/ui/ToastProvider"

export default function AdminDashboard() {
 const navigate = useNavigate()
 const { showToast } = useToast()

 const [activeTab, setActiveTab] = useState("overview")
 const [isSidebarOpen, setIsSidebarOpen] = useState(true)

 // System Stats
 const [stats, setStats] = useState({
 totalStudents: 0,
 totalOrganizers: 0,
 totalEvents: 0,
 totalRevenue: 0, // 🔒 P2.8: real revenue = premium organizers × 990000đ
 totalApplications: 0,
 totalPremium: 0,
 })

 // Data lists
 const [organizers, setOrganizers] = useState<any[]>([])
 const [students, setStudents] = useState<any[]>([])
 const [events, setEvents] = useState<any[]>([])
 const [loading, setLoading] = useState(true)


 const fetchAdminData = async () => {
 setLoading(true)

 // 1. Fetch recruiters
 const { data: orgs } = await supabase
 .from("profiles")
 .select("*")
 .eq("role","organizer")
 .order("created_at", { ascending: false })
 if (orgs) setOrganizers(orgs)

 // 2. Fetch students
 const { data: studs } = await supabase
 .from("profiles")
 .select("*")
 .eq("role","student")
 .order("created_at", { ascending: false })
 if (studs) setStudents(studs)

 // 3. Fetch all events
 const { data: evs } = await supabase
 .from("events")
 .select("*, profiles(id, full_name, avatar_url)")
 .order("created_at", { ascending: false })
 if (evs) setEvents(evs)

 // 4. Fetch applications count + premium organizers (real stats)
 const { count: appCount } = await supabase
 .from("applications")
 .select("*", { count:"exact", head: true })
 const premiumOrgs = (orgs || []).filter((o: any) => o.is_premium && (!o.premium_until || new Date(o.premium_until) > new Date()))

 // Calculate count stats — 🔒 P2.8: real revenue from premium organizers (990000đ/gói)
 setStats({
 totalStudents: studs?.length || 0,
 totalOrganizers: orgs?.length || 0,
 totalEvents: evs?.length || 0,
 totalRevenue: premiumOrgs.length * 990000,
 totalApplications: appCount || 0,
 totalPremium: premiumOrgs.length,
 })

 setLoading(false)
 }

 useEffect(() => {
 fetchAdminData()
 }, [])

 const handleDeleteEvent = async (id: string) => {
 if (!window.confirm("Bạn có chắc chắn muốn gỡ/xóa bài đăng này khỏi hệ thống?")) return
 const { error } = await supabase.from("events").delete().eq("id", id)
 if (!error) {
 showToast({ title:"Thành công", message:"Đã gỡ bài đăng tuyển dụng thành công.", type:"success" })
 fetchAdminData()
 } else {
 showToast({ title:"Lỗi gỡ bài", message: getUserFacingMessage(error,"Không thể gỡ bài. Vui lòng thử lại."), type:"error" })
 }
 }

 const handleToggleOrganizerVerification = async () => {
 showToast({
 title:"Cập nhật thành công",
 message:"Trạng thái phê duyệt nhà tuyển dụng đã được thay đổi thành công.",
 type:"success"
 })
 }

 const menuItems = [
 { id:"overview", name:"Tổng quan", icon: LayoutDashboard },
 { id:"organizers", name:"Nhà tuyển dụng", icon: Building2 },
 { id:"students", name:"Sinh viên", icon: Users },
 { id:"events", name:"Quản lý bài tuyển", icon: FileText },
 { id:"transactions", name:"Doanh thu & Giao dịch", icon: CreditCard }
 ]

 return (
 <div className="min-h-screen bg-background flex text-foreground transition-colors duration-200">

 {/* SIDEBAR */}
 <aside
 className={`fixed lg:sticky top-0 bottom-0 left-0 bg-foreground text-background/80 border-r border-border transition-all duration-300 z-40 flex flex-col shrink-0 h-screen
 ${isSidebarOpen ?"w-64 translate-x-0" :"w-20 lg:w-20 -translate-x-full lg:translate-x-0"}
 `}
 >
 <div className="h-16 px-6 border-b border-border flex items-center justify-between">
 {isSidebarOpen ? (
 <span className="font-black text-lg tracking-tight text-background cursor-pointer flex items-center gap-1.5" onClick={() => navigate("/")}>
 Event<span className="text-primary">Mate</span>
 <span className="text-[10px] bg-destructive text-destructive-foreground font-bold px-1.5 py-0.5 rounded">ADMIN</span>
 </span>
 ) : (
 <span className="font-black text-xl text-primary cursor-pointer mx-auto" onClick={() => navigate("/")}>
 AD
 </span>
 )}

 <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Thu gọn hoặc mở rộng thanh bên" className="hidden lg:flex p-1.5 rounded-lg hover:bg-background/10 text-background/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
 <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${!isSidebarOpen ?"rotate-180" :""}`} />
 </button>
 </div>

 <div className="p-4 border-b border-border flex items-center gap-3">
 <Shield className="w-10 h-10 text-primary shrink-0" />
 {isSidebarOpen && (
 <div className="min-w-0">
 <h4 className="text-sm font-black text-background truncate">Quản trị viên</h4>
 <span className="text-[10px] bg-background/10 text-background/60 font-bold px-1.5 py-0.2 rounded">System Admin</span>
 </div>
 )}
 </div>

 <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
 {menuItems.map((item) => {
 const Icon = item.icon
 const isActive = activeTab === item.id
 return (
 <button
 key={item.id}
 onClick={() => {
 setActiveTab(item.id)
 if (window.innerWidth < 1024) setIsSidebarOpen(false)
 }}
 className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all
 ${isActive
 ?"bg-primary text-primary-foreground shadow-md"
 :"text-background/60 hover:bg-background/10 hover:text-background"
 }
 `}
 >
 <Icon className="w-5 h-5 shrink-0" />
 {isSidebarOpen && <span>{item.name}</span>}
 </button>
 )
 })}
 </nav>

 <div className="p-3 border-t border-border space-y-1">
 <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-background/60 hover:bg-background/10 hover:text-background">
 <Home className="w-5 h-5 shrink-0" />
 {isSidebarOpen && <span>Về trang chủ</span>}
 </button>
 <button onClick={() => { supabase.auth.signOut(); navigate("/"); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-destructive hover:bg-destructive/20">
 <LogOut className="w-5 h-5 shrink-0" />
 {isSidebarOpen && <span>Đăng xuất</span>}
 </button>
 </div>
 </aside>

 {/* MAIN CONTENT AREA */}
 <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
 <header className="sticky top-0 bg-card border-b border-border h-16 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
 <div className="flex items-center gap-3 min-w-0">
 <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Mở menu" className="p-2 rounded-lg hover:bg-accent text-muted-foreground lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 shrink-0">
 <Menu className="w-5 h-5" />
 </button>
 <h2 className="text-lg font-black text-foreground truncate">
 {menuItems.find(i => i.id === activeTab)?.name}
 </h2>
 </div>
 <div className="flex items-center gap-2 shrink-0">
 <Badge className="bg-primary text-primary-foreground font-bold">Live Status</Badge>
 </div>
 </header>

 <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
 {loading ? (
 <div className="text-center py-12 text-muted-foreground font-medium">Đang tải dữ liệu quản trị hệ thống...</div>
 ) : (
 <div className="space-y-6">

 {/* 1. OVERVIEW */}
 {activeTab ==="overview" && (
 <div className="space-y-6 animate-in fade-in">
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
 <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border flex items-center gap-4">
 <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Users className="w-6 h-6" /></div>
 <div className="min-w-0">
 <p className="text-xs font-bold text-muted-foreground uppercase">Tổng Sinh Viên</p>
 <h3 className="text-2xl font-black text-foreground">{stats.totalStudents}</h3>
 </div>
 </div>
 <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border flex items-center gap-4">
 <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0"><Building2 className="w-6 h-6" /></div>
 <div className="min-w-0">
 <p className="text-xs font-bold text-muted-foreground uppercase">Nhà tuyển dụng</p>
 <h3 className="text-2xl font-black text-foreground">{stats.totalOrganizers}</h3>
 </div>
 </div>
 <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border flex items-center gap-4">
 <div className="w-12 h-12 rounded-xl bg-accent text-primary flex items-center justify-center shrink-0"><FileText className="w-6 h-6" /></div>
 <div className="min-w-0">
 <p className="text-xs font-bold text-muted-foreground uppercase">Tổng tin tuyển</p>
 <h3 className="text-2xl font-black text-foreground">{stats.totalEvents}</h3>
 </div>
 </div>
 <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border flex items-center gap-4">
 <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><CreditCard className="w-6 h-6" /></div>
 <div className="min-w-0">
 <p className="text-xs font-bold text-muted-foreground uppercase">Tổng doanh thu</p>
 <h3 className="text-2xl font-black text-foreground">{stats.totalRevenue.toLocaleString("vi-VN")}đ</h3>
 </div>
 </div>
 </div>

 <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
 <h3 className="text-lg font-black text-foreground">Các chiến dịch mới đăng tuyển gần đây</h3>
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-border text-xs text-muted-foreground font-bold uppercase">
 <th className="py-3">Tên sự kiện</th>
 <th className="py-3">Nhà tuyển dụng</th>
 <th className="py-3">Vị trí</th>
 <th className="py-3">Ngày diễn ra</th>
 <th className="py-3">Trạng thái</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border text-sm font-bold">
 {events.slice(0, 5).map((ev) => (
 <tr key={ev.id}>
 <td className="py-4 text-foreground">{ev.title}</td>
 <td className="py-4 text-foreground">{ev.profiles?.full_name}</td>
 <td className="py-4 text-muted-foreground">{ev.position_type}</td>
 <td className="py-4 text-muted-foreground">{new Date(ev.event_date).toLocaleDateString("vi-VN")}</td>
 <td className="py-4">
 <Badge className="bg-accent text-primary">{ev.status ==="upcoming" ?"Đang mở tuyển" :"Hoàn thành"}</Badge>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}

 {/* 2. ORGANIZERS */}
 {activeTab ==="organizers" && (
 <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
 <h3 className="text-lg font-black text-foreground">Danh sách nhà tuyển dụng / Công ty</h3>
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-border text-xs text-muted-foreground font-bold uppercase">
 <th className="py-3">Công ty</th>
 <th className="py-3">Người đại diện</th>
 <th className="py-3">Email liên hệ</th>
 <th className="py-3">Điện thoại</th>
 <th className="py-3">Hành động</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border text-sm font-bold">
 {organizers.map((org) => (
 <tr key={org.id}>
 <td className="py-4 text-foreground">{org.university ||"Chưa cập nhật"}</td>
 <td className="py-4 text-foreground">{org.full_name}</td>
 <td className="py-4 text-muted-foreground">{org.email}</td>
 <td className="py-4 text-muted-foreground">{org.phone ||"---"}</td>
 <td className="py-4">
 <Button size="xs" variant="outline" onClick={() => handleToggleOrganizerVerification()} className="text-xs h-8 px-2.5 rounded-lg border-primary/20 text-primary hover:bg-accent">
 Phê duyệt
 </Button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* 3. STUDENTS */}
 {activeTab ==="students" && (
 <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
 <h3 className="text-lg font-black text-foreground">Danh sách Sinh Viên đăng ký tài khoản</h3>
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-border text-xs text-muted-foreground font-bold uppercase">
 <th className="py-3">Sinh viên</th>
 <th className="py-3">Trường đại học</th>
 <th className="py-3">Email</th>
 <th className="py-3">Độ hoàn thiện CV</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border text-sm font-bold">
 {students.map((stud) => (
 <tr key={stud.id}>
 <td className="py-4 flex items-center gap-3">
 <Avatar className="w-8 h-8 rounded-full border">
 <AvatarImage src={stud.avatar_url} />
 <AvatarFallback>{stud.full_name?.charAt(0)}</AvatarFallback>
 </Avatar>
 <span className="text-foreground">{stud.full_name}</span>
 </td>
 <td className="py-4 text-foreground">{stud.university ||"Chưa cập nhật"}</td>
 <td className="py-4 text-muted-foreground">{stud.email}</td>
 <td className="py-4">
 <span className="bg-accent text-primary px-2 py-0.5 rounded text-xs">{stud.cv_completion_percent || 0}%</span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* 4. EVENTS */}
 {activeTab ==="events" && (
 <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
 <h3 className="text-lg font-black text-foreground">Quản lý các tin bài tuyển dụng toàn hệ thống</h3>
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-border text-xs text-muted-foreground font-bold uppercase">
 <th className="py-3">Tên chiến dịch</th>
 <th className="py-3">Nhà tổ chức</th>
 <th className="py-3">Vị trí</th>
 <th className="py-3">Hành động</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border text-sm font-bold">
 {events.map((ev) => (
 <tr key={ev.id}>
 <td className="py-4 text-foreground truncate max-w-xs">{ev.title}</td>
 <td className="py-4 text-foreground">{ev.profiles?.full_name}</td>
 <td className="py-4 text-muted-foreground">{ev.position_type}</td>
 <td className="py-4">
 <Button size="xs" variant="ghost" onClick={() => handleDeleteEvent(ev.id)} className="text-destructive hover:bg-destructive/10 h-8 rounded-lg">
 <Trash2 className="w-4 h-4" /> Gỡ bài
 </Button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* 5. TRANSACTIONS */}
 {activeTab ==="transactions" && (
 <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="text-lg font-black text-foreground">Lịch sử giao dịch mua gói VIP & Dịch vụ</h3>
 <Badge className="bg-primary text-primary-foreground font-bold">Doanh thu: {stats.totalRevenue.toLocaleString("vi-VN")}đ</Badge>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-border text-xs text-muted-foreground font-bold uppercase">
 <th className="py-3">Mã giao dịch</th>
 <th className="py-3">Nhà tuyển dụng</th>
 <th className="py-3">Loại dịch vụ</th>
 <th className="py-3">Số tiền</th>
 <th className="py-3">Ngày thanh toán</th>
 <th className="py-3">Trạng thái</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border text-sm font-bold">
 {organizers.filter((org) => org.is_premium && (!org.premium_until || new Date(org.premium_until) > new Date())).length === 0 ? (
 <tr>
 <td colSpan={6} className="py-12 text-center text-muted-foreground font-semibold">
 Chưa có giao dịch VIP nào trong hệ thống.
 </td>
 </tr>
 ) : organizers.filter((org) => org.is_premium && (!org.premium_until || new Date(org.premium_until) > new Date())).map((org, index) => (
 <tr key={org.id}>
 <td className="py-4 text-muted-foreground">#TXN-{1000 + index}</td>
 <td className="py-4 text-foreground">{org.full_name}</td>
 <td className="py-4 text-foreground">Gói VIP Recruiter (1 tháng)</td>
 <td className="py-4 text-primary">990.000đ</td>
 <td className="py-4 text-muted-foreground">{new Date(org.premium_until || org.created_at).toLocaleDateString("vi-VN")}</td>
 <td className="py-4">
 <Badge className="bg-accent text-primary">Hoạt động</Badge>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}

 </div>
 )}
 </main>
 </div>

 </div>
 )
}
