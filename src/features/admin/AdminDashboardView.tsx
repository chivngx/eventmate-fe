"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "@/lib/router"
import { supabase } from "@/lib/supabase"
import { getUserFacingMessage } from "@/lib/error"
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
  ShieldAlert,
  CheckCircle2,
  Trash2,
  MessageSquare,
  Star,
  Sparkles,
  Bug,
  Layout,
  AlertCircle,
  Clock,
  Check,
  Edit3,
  Search,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/providers/ToastProvider"
import { useUser } from "@/components/providers/AuthProvider"

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { role, loading: authLoading } = useUser()

  const [activeTab, setActiveTab] = useState("overview")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalOrganizers: 0,
    totalEvents: 0,
    totalRevenue: 0,
    totalApplications: 0,
    totalPremium: 0,
    totalFeedbacks: 0,
    pendingFeedbacks: 0,
    avgRating: 5.0,
  })

  const [organizers, setOrganizers] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState("all")
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState("all")
  const [feedbackSearch, setFeedbackSearch] = useState("")
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState("")
  const [loading, setLoading] = useState(true)


  const fetchAdminData = async () => {
    setLoading(true)

    const { data: orgs } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "organizer")
      .order("created_at", { ascending: false })
    if (orgs) setOrganizers(orgs)

    const { data: studs } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "student")
      .order("created_at", { ascending: false })
    if (studs) setStudents(studs)

    const { data: evs } = await supabase
      .from("events")
      .select("*, profiles(id, full_name, avatar_url)")
      .order("created_at", { ascending: false })
    if (evs) setEvents(evs)

    const { count: appCount } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })

    const { data: txs } = await supabase
      .from("transactions")
      .select("*, profiles:user_id(id, full_name, email, avatar_url)")
      .order("created_at", { ascending: false })
    if (txs) setTransactions(txs)

    const { data: fbs } = await supabase
      .from("feedbacks")
      .select("*, profiles:user_id(id, full_name, email, avatar_url, role)")
      .order("created_at", { ascending: false })
    if (fbs) setFeedbacks(fbs)

    const premiumOrgs = (orgs || []).filter((o: any) => o.is_premium && (!o.premium_until || new Date(o.premium_until) > new Date()))

    const realRevenue = (txs || []).reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0)

    const pendingFbs = (fbs || []).filter((f: any) => f.status === "pending").length
    const ratedFbs = (fbs || []).filter((f: any) => typeof f.rating === "number" && f.rating > 0)
    const avgScore = ratedFbs.length > 0
      ? ratedFbs.reduce((acc: number, f: any) => acc + f.rating, 0) / ratedFbs.length
      : 5.0

    setStats({
      totalStudents: studs?.length || 0,
      totalOrganizers: orgs?.length || 0,
      totalEvents: evs?.length || 0,
      totalRevenue: realRevenue > 0 ? realRevenue : premiumOrgs.length * 699000,
      totalApplications: appCount || 0,
      totalPremium: premiumOrgs.length,
      totalFeedbacks: fbs?.length || 0,
      pendingFeedbacks: pendingFbs,
      avgRating: Number(avgScore.toFixed(1)),
    })

    setLoading(false)
  }

  useEffect(() => {
    if (role === "admin") {
      fetchAdminData()
    }
  }, [role])

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn gỡ/xóa bài đăng này khỏi hệ thống?")) return
    const { error } = await supabase.from("events").delete().eq("id", id)
    if (!error) {
      showToast({ title: "Thành công", message: "Đã gỡ sự kiện tuyển nhân sự nhân sự thành công.", type: "success" })
      fetchAdminData()
    } else {
      showToast({ title: "Lỗi gỡ sự kiện", message: getUserFacingMessage(error, "Không thể gỡ sự kiện. Vui lòng thử lại."), type: "error" })
    }
  }

  const handleToggleOrganizerVerification = async (orgId: string, currentStatus: boolean | null) => {
    const nextStatus = !currentStatus
    const { error } = await supabase
      .from("profiles")
      .update({ is_verified: nextStatus })
      .eq("id", orgId)

    if (error) {
      showToast({
        title: "Lỗi cập nhật",
        message: getUserFacingMessage(error, "Không thể thay đổi trạng thái xác minh."),
        type: "error"
      })
    } else {
      setOrganizers((prev) =>
        prev.map((o) => (o.id === orgId ? { ...o, is_verified: nextStatus } : o))
      )
      showToast({
        title: "Cập nhật thành công",
        message: nextStatus
          ? "Đã phê duyệt xác thực KYC cho nhà tuyển dụng."
          : "Đã hủy phê duyệt xác thực nhà tuyển dụng.",
        type: "success"
      })
    }
  }

  const handleUpdateFeedbackStatus = async (feedbackId: string, nextStatus: string) => {
    const { error } = await supabase
      .from("feedbacks")
      .update({ status: nextStatus })
      .eq("id", feedbackId)

    if (error) {
      showToast({
        title: "Lỗi cập nhật",
        message: getUserFacingMessage(error, "Không thể cập nhật trạng thái phản hồi."),
        type: "error"
      })
    } else {
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === feedbackId ? { ...f, status: nextStatus } : f))
      )
      setStats((prev) => ({
        ...prev,
        pendingFeedbacks: feedbacks.filter((f) => (f.id === feedbackId ? nextStatus === "pending" : f.status === "pending")).length,
      }))
      showToast({
        title: "Thành công",
        message: `Đã cập nhật trạng thái sang "${
          nextStatus === "resolved" ? "Đã xử lý" : nextStatus === "reviewed" ? "Đã xem" : "Chờ xử lý"
        }".`,
        type: "success"
      })
    }
  }

  const handleSaveAdminNote = async (feedbackId: string) => {
    const { error } = await supabase
      .from("feedbacks")
      .update({ admin_note: noteText.trim() || null })
      .eq("id", feedbackId)

    if (error) {
      showToast({
        title: "Lỗi lưu ghi chú",
        message: getUserFacingMessage(error, "Không thể lưu ghi chú."),
        type: "error"
      })
    } else {
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === feedbackId ? { ...f, admin_note: noteText.trim() || null } : f))
      )
      setEditingNoteId(null)
      setNoteText("")
      showToast({
        title: "Thành công",
        message: "Đã lưu ghi chú quản trị viên.",
        type: "success"
      })
    }
  }

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phản hồi này khỏi hệ thống?")) return

    const { error } = await supabase
      .from("feedbacks")
      .delete()
      .eq("id", feedbackId)

    if (error) {
      showToast({
        title: "Lỗi xóa phản hồi",
        message: getUserFacingMessage(error, "Không thể xóa phản hồi."),
        type: "error"
      })
    } else {
      setFeedbacks((prev) => prev.filter((f) => f.id !== feedbackId))
      setStats((prev) => ({
        ...prev,
        totalFeedbacks: Math.max(0, prev.totalFeedbacks - 1),
      }))
      showToast({
        title: "Đã xóa",
        message: "Đã xóa phản hồi thành công.",
        type: "success"
      })
    }
  }

  const menuItems = [
    { id: "overview", name: "Tổng quan", icon: LayoutDashboard },
    { id: "organizers", name: "Nhà tuyển nhân sự", icon: Building2 },
    { id: "students", name: "Sinh viên", icon: Users },
    { id: "events", name: "Quản lý bài tuyển", icon: FileText },
    { id: "transactions", name: "Doanh thu & Giao dịch", icon: CreditCard },
    {
      id: "feedbacks",
      name: "Ý kiến phản hồi",
      icon: MessageSquare,
      badge: stats.pendingFeedbacks > 0 ? stats.pendingFeedbacks : undefined
    }
  ]

  const activeMenuItem = menuItems.find(i => i.id === activeTab)

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm font-medium animate-pulse">
        Đang xác thực quyền quản trị...
      </div>
    )
  }

  if (role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-md space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-100 text-rose-600 mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Truy cập bị giới hạn</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Khu vực này chỉ dành riêng cho Quản trị viên hệ thống (Admin). Tài khoản hiện tại của bạn không có quyền truy cập.
          </p>
          <div className="pt-2">
            <Button
              onClick={() => navigate("/")}
              className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold h-11 cursor-pointer"
            >
              Về trang chủ
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-foreground/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <div className="flex">
        {/* SIDEBAR — dark inverted theme for admin */}
        <aside
          className={`fixed lg:sticky top-0 bottom-0 left-0 z-40 flex h-screen shrink-0 flex-col border-r border-border bg-foreground text-background transition-all duration-300 ${isSidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:translate-x-0"}`}
        >
          {/* Brand */}
          <div className="flex h-16 items-center justify-between border-b border-background/10 px-4 sm:px-6">
            <span
              onClick={() => navigate("/")}
              className="flex cursor-pointer items-center gap-1.5 text-lg font-bold tracking-tight text-background"
            >
              Event<span className="text-slate-600">Mate</span>
              <span className="rounded bg-destructive px-1.5 py-0.5 text-xs font-semibold text-destructive-foreground">ADMIN</span>
            </span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Thu gọn thanh bên"
              className="hidden rounded-lg p-1.5 text-background/60 hover:bg-background/10 lg:flex"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          {/* Profile widget */}
          <div className="flex items-center gap-3 border-b border-background/10 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background/10 text-slate-600">
              <Shield className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h4 className="truncate text-sm font-semibold text-background">Quản trị viên</h4>
              <span className="rounded bg-background/10 px-1.5 py-0.5 text-xs text-background/60">System Admin</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
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
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-background/70 hover:bg-background/10 hover:text-background"
                    }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="flex-1 text-left">{item.name}</span>
                  {item.badge ? (
                    <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="space-y-1 border-t border-background/10 p-3">
            <button
              onClick={() => navigate("/")}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-background/70 hover:bg-background/10 hover:text-background"
            >
              <Home className="h-5 w-5 shrink-0" />
              <span>Về trang chủ</span>
            </button>
            <button
              onClick={() => { supabase.auth.signOut(); navigate("/"); }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/20"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Mở menu điều hướng"
                className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-slate-100 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h2 className="truncate text-lg font-semibold text-foreground">
                {activeMenuItem?.name || "Bảng quản trị"}
              </h2>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge className="bg-slate-100 font-medium text-slate-600">Live</Badge>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
            {loading ? (
              <div className="py-16 text-center text-sm text-muted-foreground">
                Đang tải dữ liệu quản trị hệ thống...
              </div>
            ) : (
              <div className="space-y-6">

                {/* 1. OVERVIEW */}
                {activeTab === "overview" && (
                  <div className="space-y-6 animate-in fade-in">
                    {/* Stat cards — 4 cols responsive, flat */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <StatCard icon={<Users className="h-5 w-5" />} label="Tổng Sinh Viên" value={stats.totalStudents.toString()} />
                      <StatCard icon={<Building2 className="h-5 w-5" />} label="Nhà tuyển nhân sự" value={stats.totalOrganizers.toString()} />
                      <StatCard icon={<FileText className="h-5 w-5" />} label="Tổng tin tuyển" value={stats.totalEvents.toString()} />
                      <StatCard icon={<CreditCard className="h-5 w-5" />} label="Tổng doanh thu" value={`${stats.totalRevenue.toLocaleString("vi-VN")}đ`} />
                    </div>

                    {/* Recent events table */}
                    <div className="rounded-xl border border-border bg-card shadow-sm">
                      <div className="border-b border-border p-4 sm:p-5">
                        <h3 className="text-base font-semibold text-foreground">Chiến dịch mới tuyển nhân sự gần đây</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">5 sự kiện gần nhất trên hệ thống</p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                              <th className="px-4 py-3 font-medium sm:px-5">Tên sự kiện</th>
                              <th className="px-4 py-3 font-medium sm:px-5">Nhà tuyển nhân sự</th>
                              <th className="px-4 py-3 font-medium sm:px-5">Vị trí</th>
                              <th className="px-4 py-3 font-medium sm:px-5">Ngày diễn ra</th>
                              <th className="px-4 py-3 font-medium sm:px-5">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {events.slice(0, 5).map((ev) => (
                              <tr key={ev.id} className="text-foreground transition-colors hover:bg-muted/50">
                                <td className="px-4 py-3 sm:px-5">{ev.title}</td>
                                <td className="px-4 py-3 text-muted-foreground sm:px-5">{ev.profiles?.full_name}</td>
                                <td className="px-4 py-3 text-muted-foreground sm:px-5">{ev.position_type}</td>
                                <td className="px-4 py-3 text-muted-foreground sm:px-5">{new Date(ev.event_date).toLocaleDateString("vi-VN")}</td>
                                <td className="px-4 py-3 sm:px-5">
                                  <Badge className="bg-slate-100 text-slate-600">
                                    {ev.status === "upcoming" ? "Đang mở đăng ký" : "Hoàn thành"}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Recent Feedbacks Card */}
                    <div className="rounded-xl border border-border bg-card shadow-sm">
                      <div className="border-b border-border p-4 sm:p-5 flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-foreground">Ý kiến đóng góp mới nhất</h3>
                          <p className="mt-0.5 text-xs text-muted-foreground">Phản hồi và báo lỗi từ người dùng gần đây</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveTab("feedbacks")}
                          className="text-xs text-primary cursor-pointer hover:bg-primary/10"
                        >
                          Xem tất cả ({stats.totalFeedbacks}) →
                        </Button>
                      </div>
                      <div className="p-4 sm:p-5">
                        {feedbacks.length === 0 ? (
                          <p className="text-center text-xs text-muted-foreground py-6">Chưa có ý kiến phản hồi nào.</p>
                        ) : (
                          <div className="divide-y divide-border/60">
                            {feedbacks.slice(0, 3).map((fb) => (
                              <div key={fb.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-foreground">{fb.full_name || fb.profiles?.full_name || "Khách"}</span>
                                    <Badge className="text-[10px] bg-slate-100 text-slate-700">
                                      {fb.category === "bug" ? "🐛 Báo lỗi" : fb.category === "feature" ? "💡 Tính năng" : fb.category === "ux" ? "🎨 Giao diện" : "💬 Góp ý"}
                                    </Badge>
                                    {typeof fb.rating === "number" && (
                                      <span className="text-xs text-amber-500 font-medium">★ {fb.rating}</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-1">{fb.content}</p>
                                </div>
                                <Badge className={fb.status === "resolved" ? "bg-emerald-100 text-emerald-700 text-[10px]" : "bg-amber-100 text-amber-700 text-[10px]"}>
                                  {fb.status === "resolved" ? "Đã giải quyết" : fb.status === "reviewed" ? "Đã xem" : "Chờ xử lý"}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. ORGANIZERS */}
                {activeTab === "organizers" && (
                  <div className="rounded-xl border border-border bg-card shadow-sm animate-in fade-in">
                    <div className="border-b border-border p-4 sm:p-5">
                      <h3 className="text-base font-semibold text-foreground">Danh sách nhà tuyển nhân sự</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">{organizers.length} nhà tuyển nhân sự đã đăng ký</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                            <th className="px-4 py-3 font-medium sm:px-5">Đơn vị / Công ty</th>
                            <th className="px-4 py-3 font-medium sm:px-5">Người đại diện</th>
                            <th className="px-4 py-3 font-medium sm:px-5">Email</th>
                            <th className="px-4 py-3 font-medium sm:px-5">Điện thoại</th>
                            <th className="px-4 py-3 font-medium sm:px-5">Trạng thái KYC</th>
                            <th className="px-4 py-3 font-medium sm:px-5">Hành động</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {organizers.map((org) => (
                            <tr key={org.id} className="text-foreground transition-colors hover:bg-muted/50">
                              <td className="px-4 py-3 font-semibold sm:px-5">{org.university || org.full_name || "Chưa cập nhật"}</td>
                              <td className="px-4 py-3 sm:px-5">{org.full_name}</td>
                              <td className="px-4 py-3 text-muted-foreground sm:px-5">{org.email}</td>
                              <td className="px-4 py-3 text-muted-foreground sm:px-5">{org.phone || "---"}</td>
                              <td className="px-4 py-3 sm:px-5">
                                {org.is_verified ? (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đã xác thực
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                                    Chưa xác thực
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 sm:px-5">
                                <Button
                                  size="sm"
                                  variant={org.is_verified ? "outline" : "default"}
                                  onClick={() => handleToggleOrganizerVerification(org.id, org.is_verified)}
                                  className={`h-8 rounded-lg px-3 text-xs font-semibold cursor-pointer ${
                                    org.is_verified
                                      ? "border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                  }`}
                                >
                                  {org.is_verified ? "Hủy xác thực" : "Phê duyệt KYC"}
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
                {activeTab === "students" && (
                  <div className="rounded-xl border border-border bg-card shadow-sm animate-in fade-in">
                    <div className="border-b border-border p-4 sm:p-5">
                      <h3 className="text-base font-semibold text-foreground">Danh sách sinh viên</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">{students.length} sinh viên đã đăng ký</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                            <th className="px-4 py-3 font-medium sm:px-5">Sinh viên</th>
                            <th className="px-4 py-3 font-medium sm:px-5">Trường đại học</th>
                            <th className="px-4 py-3 font-medium sm:px-5">Email</th>
                            <th className="px-4 py-3 font-medium sm:px-5">Độ hoàn thiện CV</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {students.map((stud) => (
                            <tr key={stud.id} className="text-foreground transition-colors hover:bg-muted/50">
                              <td className="px-4 py-3 sm:px-5">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8 rounded-lg border border-border">
                                    <AvatarImage src={stud.avatar_url} />
                                    <AvatarFallback className="rounded-lg bg-muted text-xs font-semibold">{stud.full_name?.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">{stud.full_name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 sm:px-5">{stud.university || "Chưa cập nhật"}</td>
                              <td className="px-4 py-3 text-muted-foreground sm:px-5">{stud.email}</td>
                              <td className="px-4 py-3 sm:px-5">
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                  {stud.cv_completion_percent || 0}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. EVENTS */}
                {activeTab === "events" && (
                  <div className="rounded-xl border border-border bg-card shadow-sm animate-in fade-in">
                    <div className="border-b border-border p-4 sm:p-5">
                      <h3 className="text-base font-semibold text-foreground">Quản lý tin bài tuyển nhân sự</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">{events.length} bài đăng trên hệ thống</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                            <th className="px-4 py-3 font-medium sm:px-5">Tên chiến dịch</th>
                            <th className="px-4 py-3 font-medium sm:px-5">Nhà tổ chức</th>
                            <th className="px-4 py-3 font-medium sm:px-5">Vị trí</th>
                            <th className="px-4 py-3 font-medium sm:px-5">Hành động</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {events.map((ev) => (
                            <tr key={ev.id} className="text-foreground transition-colors hover:bg-muted/50">
                              <td className="max-w-xs truncate px-4 py-3 sm:px-5">{ev.title}</td>
                              <td className="px-4 py-3 sm:px-5">{ev.profiles?.full_name}</td>
                              <td className="px-4 py-3 text-muted-foreground sm:px-5">{ev.position_type}</td>
                              <td className="px-4 py-3 sm:px-5">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteEvent(ev.id)}
                                  className="h-8 rounded-lg text-xs text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Gỡ sự kiện
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
                {activeTab === "transactions" && (
                  <div className="rounded-xl border border-border bg-card shadow-sm animate-in fade-in">
                    <div className="flex flex-col gap-2 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                      <div>
                        <h3 className="text-base font-semibold text-foreground">Lịch sử giao dịch VIP</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">Các giao dịch mua gói VIP Recruiter</p>
                      </div>
                      <Badge className="bg-slate-100 font-medium text-slate-600">
                        Doanh thu: {stats.totalRevenue.toLocaleString("vi-VN")}đ
                      </Badge>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                            <th className="px-4 py-3 font-medium sm:px-5">Mã giao dịch</th>
                            <th className="px-4 py-3 font-medium sm:px-5">Nhà tuyển nhân sự</th>
                            <th className="px-4 py-3 font-medium sm:px-5">Loại dịch vụ</th>
                            <th className="px-4 py-3 font-medium sm:px-5">Số tiền</th>
                            <th className="px-4 py-3 font-medium sm:px-5">Ngày thanh toán</th>
                            <th className="px-4 py-3 font-medium sm:px-5">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {transactions.length > 0 ? (
                            transactions.map((tx: any) => (
                              <tr key={tx.id} className="text-foreground transition-colors hover:bg-muted/50">
                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground sm:px-5">
                                  #{tx.id.slice(0, 8).toUpperCase()}
                                </td>
                                <td className="px-4 py-3 sm:px-5">
                                  <div className="font-medium text-foreground">{tx.profiles?.full_name || "Nhà tuyển dụng"}</div>
                                  <div className="text-xs text-muted-foreground">{tx.profiles?.email}</div>
                                </td>
                                <td className="px-4 py-3 sm:px-5">
                                  Gói {tx.plan_id?.toUpperCase()} ({tx.billing_cycle === "yearly" ? "1 năm" : "1 tháng"})
                                </td>
                                <td className="px-4 py-3 font-semibold text-emerald-600 sm:px-5">
                                  {Number(tx.amount).toLocaleString("vi-VN")}đ
                                </td>
                                <td className="px-4 py-3 text-muted-foreground sm:px-5">
                                  {new Date(tx.created_at).toLocaleDateString("vi-VN")}
                                </td>
                                <td className="px-4 py-3 sm:px-5">
                                  <Badge className={tx.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}>
                                    {tx.payment_method === "vietqr" ? "VietQR" : "Thẻ"} - {tx.status === "completed" ? "Thành công" : tx.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))
                          ) : organizers.filter((org) => org.is_premium && (!org.premium_until || new Date(org.premium_until) > new Date())).length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                                Chưa có giao dịch VIP nào trong hệ thống.
                              </td>
                            </tr>
                          ) : organizers.filter((org) => org.is_premium && (!org.premium_until || new Date(org.premium_until) > new Date())).map((org, index) => (
                            <tr key={org.id} className="text-foreground transition-colors hover:bg-muted/50">
                              <td className="px-4 py-3 text-muted-foreground sm:px-5">#TXN-{1000 + index}</td>
                              <td className="px-4 py-3 sm:px-5">{org.full_name}</td>
                              <td className="px-4 py-3 sm:px-5">Gói Standard (1 tháng)</td>
                              <td className="px-4 py-3 font-medium text-slate-600 sm:px-5">699.000đ</td>
                              <td className="px-4 py-3 text-muted-foreground sm:px-5">{new Date(org.premium_until || org.created_at).toLocaleDateString("vi-VN")}</td>
                              <td className="px-4 py-3 sm:px-5">
                                <Badge className="bg-emerald-100 text-emerald-700">Hoạt động</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 6. FEEDBACKS / Ý KIẾN PHẢN HỒI */}
                {activeTab === "feedbacks" && (
                  <div className="space-y-6 animate-in fade-in">
                    {/* Stat cards for Feedbacks */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <StatCard
                        icon={<MessageSquare className="h-5 w-5 text-indigo-600" />}
                        label="Tổng lượt góp ý"
                        value={stats.totalFeedbacks.toString()}
                      />
                      <StatCard
                        icon={<AlertCircle className="h-5 w-5 text-rose-600" />}
                        label="Chờ phản hồi / xử lý"
                        value={stats.pendingFeedbacks.toString()}
                      />
                      <StatCard
                        icon={<Star className="h-5 w-5 text-amber-500 fill-amber-500" />}
                        label="Điểm hài lòng TB"
                        value={`${stats.avgRating} / 5.0`}
                      />
                      <StatCard
                        icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                        label="Đã tiếp nhận & Xử lý"
                        value={feedbacks.filter((f) => f.status === "resolved").length.toString()}
                      />
                    </div>

                    {/* Filter and Search Bar */}
                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status filter pills */}
                        {[
                          { id: "all", label: "Tất cả" },
                          { id: "pending", label: "Chờ xử lý" },
                          { id: "reviewed", label: "Đã xem" },
                          { id: "resolved", label: "Đã giải quyết" },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setFeedbackStatusFilter(tab.id)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                              feedbackStatusFilter === tab.id
                                ? "bg-primary text-white"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            {tab.label}
                            {tab.id === "pending" && stats.pendingFeedbacks > 0 && (
                              <span className="ml-1.5 rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] font-bold text-white">
                                {stats.pendingFeedbacks}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Category filter */}
                        <select
                          value={feedbackCategoryFilter}
                          onChange={(e) => setFeedbackCategoryFilter(e.target.value)}
                          aria-label="Lọc theo thể loại góp ý"
                          className="h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                        >
                          <option value="all">Mọi thể loại</option>
                          <option value="feature">💡 Ý tưởng / Tính năng</option>
                          <option value="bug">🐛 Báo lỗi sự cố</option>
                          <option value="ux">🎨 Giao diện & Trải nghiệm</option>
                          <option value="general">💬 Góp ý chung</option>
                        </select>

                        {/* Search input */}
                        <div className="relative w-full sm:w-56">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <input
                            type="text"
                            placeholder="Tìm phản hồi..."
                            value={feedbackSearch}
                            onChange={(e) => setFeedbackSearch(e.target.value)}
                            className="h-9 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Feedbacks list */}
                    <div className="space-y-4">
                      {(() => {
                        const filtered = feedbacks.filter((fb) => {
                          if (feedbackStatusFilter !== "all" && fb.status !== feedbackStatusFilter) return false
                          if (feedbackCategoryFilter !== "all" && fb.category !== feedbackCategoryFilter) return false
                          if (feedbackSearch.trim()) {
                            const q = feedbackSearch.toLowerCase()
                            const c = fb.content?.toLowerCase() || ""
                            const t = fb.title?.toLowerCase() || ""
                            const n = (fb.full_name || fb.profiles?.full_name || "").toLowerCase()
                            const em = (fb.email || fb.profiles?.email || "").toLowerCase()
                            if (!c.includes(q) && !t.includes(q) && !n.includes(q) && !em.includes(q)) return false
                          }
                          return true
                        })

                        if (filtered.length === 0) {
                          return (
                            <div className="rounded-xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
                              Không tìm thấy ý kiến phản hồi nào phù hợp với bộ lọc.
                            </div>
                          )
                        }

                        return filtered.map((fb) => {
                          const userProfile = fb.profiles
                          const senderName = fb.full_name || userProfile?.full_name || "Khách ẩn danh"
                          const senderEmail = fb.email || userProfile?.email || "Không cung cấp email"
                          const senderRole = userProfile?.role || fb.role || "guest"
                          const isEditing = editingNoteId === fb.id

                          return (
                            <div
                              key={fb.id}
                              className={`rounded-xl border bg-card p-5 shadow-xs transition-all ${
                                fb.status === "pending"
                                  ? "border-amber-300/80 bg-amber-50/20"
                                  : fb.status === "resolved"
                                  ? "border-border opacity-90"
                                  : "border-border"
                              }`}
                            >
                              {/* Top row: Sender info & badges */}
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-border/60 pb-3">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10 border border-slate-200">
                                    <AvatarImage src={userProfile?.avatar_url || ""} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                      {senderName.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-sm text-foreground">{senderName}</span>
                                      <Badge
                                        className={
                                          senderRole === "organizer"
                                            ? "bg-purple-100 text-purple-700 text-[10px]"
                                            : senderRole === "student"
                                            ? "bg-blue-100 text-blue-700 text-[10px]"
                                            : "bg-slate-100 text-slate-600 text-[10px]"
                                        }
                                      >
                                        {senderRole === "organizer" ? "Nhà tuyển dụng" : senderRole === "student" ? "Sinh viên" : "Khách vãng lai"}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{senderEmail}</p>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  {/* Category Badge */}
                                  <Badge
                                    className={
                                      fb.category === "bug"
                                        ? "bg-rose-100 text-rose-700 border-rose-200"
                                        : fb.category === "feature"
                                        ? "bg-purple-100 text-purple-700 border-purple-200"
                                        : fb.category === "ux"
                                        ? "bg-blue-100 text-blue-700 border-blue-200"
                                        : "bg-slate-100 text-slate-700 border-slate-200"
                                    }
                                  >
                                    {fb.category === "bug"
                                      ? "🐛 Báo lỗi"
                                      : fb.category === "feature"
                                      ? "💡 Tính năng"
                                      : fb.category === "ux"
                                      ? "🎨 Giao diện"
                                      : "💬 Góp ý chung"}
                                  </Badge>

                                  {/* Rating stars */}
                                  {typeof fb.rating === "number" && fb.rating > 0 && (
                                    <div className="flex items-center gap-0.5 rounded-md bg-amber-50 px-2 py-1 border border-amber-100">
                                      {[1, 2, 3, 4, 5].map((s) => (
                                        <Star
                                          key={s}
                                          className={`w-3.5 h-3.5 ${
                                            s <= fb.rating
                                              ? "fill-amber-400 text-amber-400"
                                              : "text-slate-200"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  )}

                                  {/* Status badge */}
                                  <Badge
                                    className={
                                      fb.status === "resolved"
                                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                        : fb.status === "reviewed"
                                        ? "bg-blue-100 text-blue-700 border-blue-200"
                                        : "bg-amber-100 text-amber-700 border-amber-200"
                                    }
                                  >
                                    {fb.status === "resolved"
                                      ? "Đã giải quyết"
                                      : fb.status === "reviewed"
                                      ? "Đã xem"
                                      : "Chờ xử lý"}
                                  </Badge>

                                  <span className="text-xs text-muted-foreground ml-1">
                                    {new Date(fb.created_at).toLocaleString("vi-VN", {
                                      dateStyle: "short",
                                      timeStyle: "short"
                                    })}
                                  </span>
                                </div>
                              </div>

                              {/* Content body */}
                              <div className="pt-3 space-y-2">
                                {fb.title && (
                                  <h4 className="text-sm font-bold text-foreground">
                                    {fb.title}
                                  </h4>
                                )}
                                <div className="rounded-lg bg-muted/40 p-3 text-xs sm:text-sm text-foreground whitespace-pre-wrap leading-relaxed border border-border/40">
                                  {fb.content}
                                </div>
                              </div>

                              {/* Admin internal note */}
                              <div className="pt-3">
                                {isEditing ? (
                                  <div className="rounded-lg bg-amber-50/70 border border-amber-200 p-3 space-y-2">
                                    <label className="text-xs font-semibold text-amber-800 block">
                                      Ghi chú nội bộ của Quản trị viên:
                                    </label>
                                    <input
                                      type="text"
                                      value={noteText}
                                      onChange={(e) => setNoteText(e.target.value)}
                                      placeholder="VD: Đã note lại cho dev fix ở bản cập nhật tới..."
                                      className="w-full h-8 px-2.5 rounded-md border border-amber-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                    />
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditingNoteId(null)}
                                        className="h-7 text-xs rounded-md"
                                      >
                                        Hủy
                                      </Button>
                                      <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => handleSaveAdminNote(fb.id)}
                                        className="h-7 text-xs rounded-md bg-amber-600 hover:bg-amber-700 text-white"
                                      >
                                        Lưu ghi chú
                                      </Button>
                                    </div>
                                  </div>
                                ) : fb.admin_note ? (
                                  <div className="flex items-center justify-between rounded-lg bg-amber-50/70 border border-amber-200 px-3 py-2 text-xs text-amber-800">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-amber-900">Ghi chú Admin:</span>
                                      <span>{fb.admin_note}</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingNoteId(fb.id)
                                        setNoteText(fb.admin_note || "")
                                      }}
                                      className="text-amber-700 hover:text-amber-900 font-medium ml-2 cursor-pointer underline text-[11px]"
                                    >
                                      Sửa
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingNoteId(fb.id)
                                      setNoteText("")
                                    }}
                                    className="text-muted-foreground hover:text-foreground text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    <span>Thêm ghi chú nội bộ</span>
                                  </button>
                                )}
                              </div>

                              {/* Footer Actions */}
                              <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Chuyển trạng thái:</span>
                                  {fb.status !== "reviewed" && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleUpdateFeedbackStatus(fb.id, "reviewed")}
                                      className="h-7 text-xs rounded-md cursor-pointer hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                                    >
                                      Đánh dấu đã xem
                                    </Button>
                                  )}
                                  {fb.status !== "resolved" && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleUpdateFeedbackStatus(fb.id, "resolved")}
                                      className="h-7 text-xs rounded-md cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                                    >
                                      Đã giải quyết
                                    </Button>
                                  )}
                                  {fb.status !== "pending" && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleUpdateFeedbackStatus(fb.id, "pending")}
                                      className="h-7 text-xs rounded-md cursor-pointer hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200"
                                    >
                                      Đặt lại chờ xử lý
                                    </Button>
                                  )}
                                </div>

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteFeedback(fb.id)}
                                  className="h-7 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-md cursor-pointer flex items-center gap-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Xóa</span>
                                </Button>
                              </div>
                            </div>
                          )
                        })
                      })()}
                    </div>
                  </div>
                )}

              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

/* ---------- small helper components (kept local for clarity) ---------- */

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 sm:h-12 sm:w-12">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 truncate text-xl font-semibold text-foreground sm:text-2xl">{value}</p>
      </div>
    </div>
  )
}
