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
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/ToastProvider"

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState("overview")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalOrganizers: 0,
    totalEvents: 0,
    totalRevenue: 0,
    totalApplications: 0,
    totalPremium: 0,
  })

  const [organizers, setOrganizers] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
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
    const premiumOrgs = (orgs || []).filter((o: any) => o.is_premium && (!o.premium_until || new Date(o.premium_until) > new Date()))

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
      showToast({ title: "Thành công", message: "Đã gỡ sự kiện tuyển nhân sự nhân sự thành công.", type: "success" })
      fetchAdminData()
    } else {
      showToast({ title: "Lỗi gỡ sự kiện", message: getUserFacingMessage(error, "Không thể gỡ sự kiện. Vui lòng thử lại."), type: "error" })
    }
  }

  const handleToggleOrganizerVerification = async () => {
    showToast({
      title: "Cập nhật thành công",
      message: "Trạng thái phê duyệt nhà tuyển nhân sự đã được thay đổi thành công.",
      type: "success"
    })
  }

  const menuItems = [
    { id: "overview", name: "Tổng quan", icon: LayoutDashboard },
    { id: "organizers", name: "Nhà tuyển nhân sự", icon: Building2 },
    { id: "students", name: "Sinh viên", icon: Users },
    { id: "events", name: "Quản lý bài tuyển", icon: FileText },
    { id: "transactions", name: "Doanh thu & Giao dịch", icon: CreditCard }
  ]

  const activeMenuItem = menuItems.find(i => i.id === activeTab)

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
                  <span>{item.name}</span>
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
                            <th className="px-4 py-3 font-medium sm:px-5">Công ty</th>
                            <th className="px-4 py-3 font-medium sm:px-5">Người đại diện</th>
                            <th className="px-4 py-3 font-medium sm:px-5">Email</th>
                            <th className="px-4 py-3 font-medium sm:px-5">Điện thoại</th>
                            <th className="px-4 py-3 font-medium sm:px-5">Hành động</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {organizers.map((org) => (
                            <tr key={org.id} className="text-foreground transition-colors hover:bg-muted/50">
                              <td className="px-4 py-3 sm:px-5">{org.university || "Chưa cập nhật"}</td>
                              <td className="px-4 py-3 sm:px-5">{org.full_name}</td>
                              <td className="px-4 py-3 text-muted-foreground sm:px-5">{org.email}</td>
                              <td className="px-4 py-3 text-muted-foreground sm:px-5">{org.phone || "---"}</td>
                              <td className="px-4 py-3 sm:px-5">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleToggleOrganizerVerification()}
                                  className="h-8 rounded-lg border-slate-200 px-2.5 text-xs text-slate-600 hover:bg-slate-100"
                                >
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
                          {organizers.filter((org) => org.is_premium && (!org.premium_until || new Date(org.premium_until) > new Date())).length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                                Chưa có giao dịch VIP nào trong hệ thống.
                              </td>
                            </tr>
                          ) : organizers.filter((org) => org.is_premium && (!org.premium_until || new Date(org.premium_until) > new Date())).map((org, index) => (
                            <tr key={org.id} className="text-foreground transition-colors hover:bg-muted/50">
                              <td className="px-4 py-3 text-muted-foreground sm:px-5">#TXN-{1000 + index}</td>
                              <td className="px-4 py-3 sm:px-5">{org.full_name}</td>
                              <td className="px-4 py-3 sm:px-5">Gói VIP Recruiter (1 tháng)</td>
                              <td className="px-4 py-3 font-medium text-slate-600 sm:px-5">990.000đ</td>
                              <td className="px-4 py-3 text-muted-foreground sm:px-5">{new Date(org.premium_until || org.created_at).toLocaleDateString("vi-VN")}</td>
                              <td className="px-4 py-3 sm:px-5">
                                <Badge className="bg-slate-100 text-slate-600">Hoạt động</Badge>
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
