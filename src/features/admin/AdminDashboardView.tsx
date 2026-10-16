"use client"

import { useState, useEffect, useMemo } from "react"
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
  ShieldCheck,
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
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  Award,
  SlidersHorizontal,
  X,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  DollarSign,
  Briefcase,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/providers/ToastProvider"
import { useUser } from "@/components/providers/AuthProvider"
import { EventMateLogoIcon } from "@/components/common/EventMateLogo"
import AdminKycReviewModal from "./components/AdminKycReviewModal"

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { role, profile, loading: authLoading } = useUser()

  const [activeTab, setActiveTab] = useState("overview")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // System stats
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalOrganizers: 0,
    totalEvents: 0,
    totalRevenue: 0,
    totalApplications: 0,
    totalPremium: 0,
    totalFeedbacks: 0,
    pendingFeedbacks: 0,
    pendingKycCount: 0,
    avgRating: 5.0,
  })

  // Data collections
  const [organizers, setOrganizers] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [selectedKycStudent, setSelectedKycStudent] = useState<any | null>(null)
  const [events, setEvents] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Organizers tab filters
  const [organizerSearch, setOrganizerSearch] = useState("")
  const [organizerStatusFilter, setOrganizerStatusFilter] = useState("all") // "all" | "verified" | "unverified" | "premium"

  // Students tab filters
  const [studentSearch, setStudentSearch] = useState("")
  const [studentKycFilter, setStudentKycFilter] = useState("all") // "all" | "pending" | "approved" | "rejected" | "none"

  // Events tab filters
  const [eventSearch, setEventSearch] = useState("")
  const [eventStatusFilter, setEventStatusFilter] = useState("all") // "all" | "upcoming" | "completed"

  // Transactions tab search
  const [transactionSearch, setTransactionSearch] = useState("")

  // Feedback tab filters
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState("all")
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState("all")
  const [feedbackSearch, setFeedbackSearch] = useState("")
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState("")

  const fetchAdminData = async () => {
    setLoading(true)
    setIsRefreshing(true)

    try {
      const [
        { data: orgs },
        { data: studs },
        { data: evs },
        { count: appCount },
        { data: txs },
        { data: fbs },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("role", "organizer")
          .order("created_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("*")
          .eq("role", "student")
          .order("created_at", { ascending: false }),
        supabase
          .from("events")
          .select("*, profiles(id, full_name, avatar_url)")
          .order("created_at", { ascending: false }),
        supabase
          .from("applications")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("transactions")
          .select("*, profiles:user_id(id, full_name, email, avatar_url)")
          .order("created_at", { ascending: false }),
        supabase
          .from("feedbacks")
          .select("*, profiles:user_id(id, full_name, email, avatar_url, role)")
          .order("created_at", { ascending: false }),
      ])

      if (orgs) setOrganizers(orgs)
      if (studs) setStudents(studs)
      if (evs) setEvents(evs)
      if (txs) setTransactions(txs)
      if (fbs) setFeedbacks(fbs)

      const premiumOrgs = (orgs || []).filter(
        (o: any) =>
          o.is_premium &&
          (!o.premium_until || new Date(o.premium_until) > new Date())
      )

      const realRevenue = (txs || []).reduce(
        (acc: number, curr: any) => acc + (Number(curr.amount) || 0),
        0
      )

      const pendingFbs = (fbs || []).filter((f: any) => f.status === "pending").length
      const ratedFbs = (fbs || []).filter(
        (f: any) => typeof f.rating === "number" && f.rating > 0
      )
      const avgScore =
        ratedFbs.length > 0
          ? ratedFbs.reduce((acc: number, f: any) => acc + f.rating, 0) /
          ratedFbs.length
          : 5.0

      const pendingKycs = (studs || []).filter(
        (s: any) => s.kyc_status === "pending"
      ).length

      setStats({
        totalStudents: studs?.length || 0,
        totalOrganizers: orgs?.length || 0,
        totalEvents: evs?.length || 0,
        totalRevenue:
          realRevenue > 0 ? realRevenue : premiumOrgs.length * 699000,
        totalApplications: appCount || 0,
        totalPremium: premiumOrgs.length,
        totalFeedbacks: fbs?.length || 0,
        pendingFeedbacks: pendingFbs,
        pendingKycCount: pendingKycs,
        avgRating: Number(avgScore.toFixed(1)),
      })
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu quản trị:", err)
      showToast({
        title: "Lỗi đồng bộ",
        message: "Không thể làm mới toàn bộ dữ liệu quản trị.",
        type: "error",
      })
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (role === "admin") {
      fetchAdminData()
    }
  }, [role])

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn gỡ/xóa bài đăng này khỏi hệ thống?"))
      return
    const { error } = await supabase.from("events").delete().eq("id", id)
    if (!error) {
      showToast({
        title: "Thành công",
        message: "Đã gỡ chiến dịch tuyển nhân sự thành công.",
        type: "success",
      })
      fetchAdminData()
    } else {
      showToast({
        title: "Lỗi gỡ sự kiện",
        message: getUserFacingMessage(
          error,
          "Không thể gỡ sự kiện. Vui lòng thử lại."
        ),
        type: "error",
      })
    }
  }

  const handleToggleOrganizerVerification = async (
    orgId: string,
    currentStatus: boolean | null
  ) => {
    const nextStatus = !currentStatus
    const { error } = await supabase
      .from("profiles")
      .update({ is_verified: nextStatus })
      .eq("id", orgId)

    if (error) {
      showToast({
        title: "Lỗi cập nhật",
        message: getUserFacingMessage(
          error,
          "Không thể thay đổi trạng thái xác minh."
        ),
        type: "error",
      })
    } else {
      setOrganizers((prev) =>
        prev.map((o) =>
          o.id === orgId ? { ...o, is_verified: nextStatus } : o
        )
      )
      showToast({
        title: "Cập nhật thành công",
        message: nextStatus
          ? "Đã cấp tích xanh KYC cho nhà tuyển dụng."
          : "Đã hủy xác thực nhà tuyển dụng.",
        type: "success",
      })
    }
  }

  const handleApproveStudentKyc = async (
    studentId: string,
    updatedData: any
  ) => {
    const { error } = await supabase
      .from("profiles")
      .update(updatedData)
      .eq("id", studentId)

    if (error) {
      showToast({
        title: "Lỗi phê duyệt",
        message: getUserFacingMessage(error, "Không thể duyệt hồ sơ eKYC."),
        type: "error",
      })
    } else {
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, ...updatedData } : s))
      )
      setStats((prev) => ({
        ...prev,
        pendingKycCount: Math.max(0, prev.pendingKycCount - 1),
      }))
      showToast({
        title: "Phê duyệt thành công",
        message: "Đã duyệt eKYC & kích hoạt Tích xanh ứng viên chính danh.",
        type: "success",
      })
    }
  }

  const handleRejectStudentKyc = async (
    studentId: string,
    reason: string
  ) => {
    const currentStudent = students.find((s) => s.id === studentId)
    const currentKycData = currentStudent?.kyc_data || {}
    const updatedKycData = {
      ...currentKycData,
      rejection_reason: reason,
      rejected_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        is_verified: false,
        kyc_status: "rejected",
        kyc_data: updatedKycData,
      })
      .eq("id", studentId)

    if (error) {
      showToast({
        title: "Lỗi cập nhật",
        message: getUserFacingMessage(error, "Không thể từ chối hồ sơ."),
        type: "error",
      })
    } else {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? {
              ...s,
              is_verified: false,
              kyc_status: "rejected",
              kyc_data: updatedKycData,
            }
            : s
        )
      )
      setStats((prev) => ({
        ...prev,
        pendingKycCount: Math.max(0, prev.pendingKycCount - 1),
      }))
      showToast({
        title: "Đã từ chối eKYC",
        message: "Hồ sơ đã được lưu trạng thái Từ chối có kèm lý do.",
        type: "success",
      })
    }
  }

  const handleUpdateFeedbackStatus = async (
    feedbackId: string,
    nextStatus: string
  ) => {
    const { error } = await supabase
      .from("feedbacks")
      .update({ status: nextStatus })
      .eq("id", feedbackId)

    if (error) {
      showToast({
        title: "Lỗi cập nhật",
        message: getUserFacingMessage(
          error,
          "Không thể cập nhật trạng thái phản hồi."
        ),
        type: "error",
      })
    } else {
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === feedbackId ? { ...f, status: nextStatus } : f))
      )
      setStats((prev) => ({
        ...prev,
        pendingFeedbacks: feedbacks.filter((f) =>
          f.id === feedbackId ? nextStatus === "pending" : f.status === "pending"
        ).length,
      }))
      showToast({
        title: "Thành công",
        message: `Đã đổi trạng thái sang "${nextStatus === "resolved"
            ? "Đã giải quyết"
            : nextStatus === "reviewed"
              ? "Đã xem"
              : "Chờ xử lý"
          }".`,
        type: "success",
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
        type: "error",
      })
    } else {
      setFeedbacks((prev) =>
        prev.map((f) =>
          f.id === feedbackId ? { ...f, admin_note: noteText.trim() || null } : f
        )
      )
      setEditingNoteId(null)
      setNoteText("")
      showToast({
        title: "Thành công",
        message: "Đã lưu ghi chú quản trị viên.",
        type: "success",
      })
    }
  }

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phản hồi này khỏi hệ thống?"))
      return

    const { error } = await supabase
      .from("feedbacks")
      .delete()
      .eq("id", feedbackId)

    if (error) {
      showToast({
        title: "Lỗi xóa phản hồi",
        message: getUserFacingMessage(error, "Không thể xóa phản hồi."),
        type: "error",
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
        type: "success",
      })
    }
  }

  // Filtered lists
  const filteredOrganizers = useMemo(() => {
    return organizers.filter((org) => {
      const matchSearch =
        !organizerSearch.trim() ||
        (org.full_name && org.full_name.toLowerCase().includes(organizerSearch.toLowerCase())) ||
        (org.university && org.university.toLowerCase().includes(organizerSearch.toLowerCase())) ||
        (org.email && org.email.toLowerCase().includes(organizerSearch.toLowerCase())) ||
        (org.phone && org.phone.includes(organizerSearch))

      if (!matchSearch) return false

      if (organizerStatusFilter === "verified") return Boolean(org.is_verified)
      if (organizerStatusFilter === "unverified") return !org.is_verified
      if (organizerStatusFilter === "premium") return Boolean(org.is_premium)
      return true
    })
  }, [organizers, organizerSearch, organizerStatusFilter])

  const filteredStudents = useMemo(() => {
    return students.filter((stud) => {
      const matchSearch =
        !studentSearch.trim() ||
        (stud.full_name && stud.full_name.toLowerCase().includes(studentSearch.toLowerCase())) ||
        (stud.university && stud.university.toLowerCase().includes(studentSearch.toLowerCase())) ||
        (stud.email && stud.email.toLowerCase().includes(studentSearch.toLowerCase()))

      if (!matchSearch) return false

      if (studentKycFilter === "pending") return stud.kyc_status === "pending"
      if (studentKycFilter === "approved")
        return stud.is_verified || stud.kyc_status === "approved"
      if (studentKycFilter === "rejected") return stud.kyc_status === "rejected"
      if (studentKycFilter === "none")
        return !stud.kyc_status && !stud.is_verified
      return true
    })
  }, [students, studentSearch, studentKycFilter])

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchSearch =
        !eventSearch.trim() ||
        (ev.title && ev.title.toLowerCase().includes(eventSearch.toLowerCase())) ||
        (ev.position_type && ev.position_type.toLowerCase().includes(eventSearch.toLowerCase())) ||
        (ev.profiles?.full_name &&
          ev.profiles.full_name.toLowerCase().includes(eventSearch.toLowerCase()))

      if (!matchSearch) return false

      if (eventStatusFilter === "upcoming") return ev.status === "upcoming"
      if (eventStatusFilter === "completed") return ev.status === "completed"
      return true
    })
  }, [events, eventSearch, eventStatusFilter])

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (!transactionSearch.trim()) return true
      const q = transactionSearch.toLowerCase()
      return (
        tx.id.toLowerCase().includes(q) ||
        (tx.profiles?.full_name && tx.profiles.full_name.toLowerCase().includes(q)) ||
        (tx.profiles?.email && tx.profiles.email.toLowerCase().includes(q)) ||
        (tx.plan_id && tx.plan_id.toLowerCase().includes(q))
      )
    })
  }, [transactions, transactionSearch])

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((fb) => {
      if (feedbackStatusFilter !== "all" && fb.status !== feedbackStatusFilter)
        return false
      if (
        feedbackCategoryFilter !== "all" &&
        fb.category !== feedbackCategoryFilter
      )
        return false
      if (feedbackSearch.trim()) {
        const q = feedbackSearch.toLowerCase()
        const matchName = (fb.full_name || fb.profiles?.full_name || "").toLowerCase().includes(q)
        const matchEmail = (fb.email || fb.profiles?.email || "").toLowerCase().includes(q)
        const matchContent = (fb.content || "").toLowerCase().includes(q)
        return matchName || matchEmail || matchContent
      }
      return true
    })
  }, [feedbacks, feedbackStatusFilter, feedbackCategoryFilter, feedbackSearch])

  const menuItems = [
    {
      id: "overview",
      name: "Tổng quan",
      icon: LayoutDashboard,
      badge: stats.pendingKycCount > 0 ? `${stats.pendingKycCount} KYC` : undefined,
      badgeColor: "bg-emerald-500",
    },
    {
      id: "organizers",
      name: "Nhà tuyển dụng",
      icon: Building2,
      count: stats.totalOrganizers,
    },
    {
      id: "students",
      name: "Ứng viên & KYC",
      icon: Users,
      badge: stats.pendingKycCount > 0 ? stats.pendingKycCount : undefined,
      badgeColor: "bg-emerald-500",
      count: stats.totalStudents,
    },
    {
      id: "events",
      name: "Tin tuyển dụng",
      icon: FileText,
      count: stats.totalEvents,
    },
    {
      id: "transactions",
      name: "Doanh thu",
      icon: CreditCard,
    },
    {
      id: "feedbacks",
      name: "Góp ý",
      icon: MessageSquare,
      badge: stats.pendingFeedbacks > 0 ? stats.pendingFeedbacks : undefined,
      badgeColor: "bg-amber-500",
      count: stats.totalFeedbacks,
    },
  ]

  const activeMenuItem = menuItems.find((i) => i.id === activeTab)

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1116] text-slate-200">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-16 w-16 rounded-full border-2 border-emerald-400/20 border-t-emerald-400 animate-spin" />
          <EventMateLogoIcon size={36} variant="mint" />
        </div>
        <p className="mt-6 text-sm font-medium tracking-wide text-emerald-400/80 animate-pulse">
          Khởi tạo môi trường Quản trị EventMate...
        </p>
      </div>
    )
  }

  if (role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-radial from-[#0e171b] via-[#090e12] to-[#060a0c] px-4 text-slate-100">
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-emerald-500/20 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
          <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
            <ShieldAlert className="h-8 w-8 text-emerald-400" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Shield className="h-3 w-3" /> Khu Vực Bảo Mật Cấp Cao
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Cần Quyền Quản Trị Viên
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Trang này chỉ mở cho tài khoản có quyền Quản trị hệ thống (Admin). Tài khoản của bạn hiện tại chưa được cấp quyền truy cập bảng điều khiển này.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Button
              onClick={() => navigate("/")}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold h-11 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              Quay lại Trang chủ EventMate
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                supabase.auth.signOut()
                navigate("/login")
              }}
              className="w-full rounded-xl border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 text-xs h-10"
            >
              Đổi tài khoản đăng nhập
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F6F9F8] text-slate-800 antialiased font-sans">
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <div className="flex">
        {/* ==================== MINT MINERAL SIDEBAR ==================== */}
        <aside
          className={`fixed lg:sticky top-0 bottom-0 left-0 z-50 flex h-screen shrink-0 flex-col border-r border-emerald-950/30 bg-[#0B1215] text-slate-200 transition-all duration-300 shadow-xl ${isSidebarOpen
              ? "w-72 translate-x-0"
              : "w-72 -translate-x-full lg:translate-x-0"
            }`}
        >
          {/* Ambient Glow */}
          <div className="pointer-events-none absolute -top-12 -left-12 h-44 w-44 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="pointer-events-none absolute bottom-10 right-0 h-32 w-32 rounded-full bg-teal-500/10 blur-2xl" />

          {/* Brand header */}
          <div className="relative flex h-20 items-center justify-between border-b border-emerald-900/30 px-6">
            <div
              onClick={() => navigate("/")}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 p-0.5 shadow-md shadow-emerald-500/20 transition-transform group-hover:scale-105">
                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0B1215]">
                  <EventMateLogoIcon size={24} variant="mint" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-extrabold tracking-tight text-white font-heading">
                    Event<span className="text-emerald-400">Mate</span>
                  </span>
                  <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-500/40 tracking-wider">
                    ADMIN
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono tracking-tight">
                  Control Center v2.4
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Thu gọn menu"
              className="flex lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Admin User Mini Card */}
          <div className="relative mx-3 mt-4 mb-2 rounded-2xl border border-emerald-500/15 bg-gradient-to-b from-white/[0.04] to-transparent p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10 rounded-xl border border-emerald-400/40 shadow-sm">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-emerald-950 text-emerald-300 font-bold text-xs">
                    AD
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#0B1215]" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-xs font-semibold text-white">
                  {profile?.full_name || "Quản trị viên"}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
                  <span className="truncate text-[10px] text-emerald-300/80 font-mono">
                    Master Admin
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="px-3 pt-2 pb-1">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-300">
              Quản trị chuyên mục
            </span>
          </div>

          <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-1 scrollbar-none">
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
                  className={`group relative flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all duration-200 cursor-pointer ${isActive
                      ? "bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-teal-500/5 text-emerald-300 border-l-[3px] border-emerald-400 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.25)] font-semibold"
                      : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                    }`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${isActive
                        ? "bg-emerald-400/20 text-emerald-300"
                        : "text-slate-400 group-hover:text-emerald-400 group-hover:bg-emerald-400/10"
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="flex-1 text-left truncate">{item.name}</span>

                  {item.badge ? (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-xs ${item.badgeColor || "bg-emerald-500"
                        }`}
                    >
                      {item.badge}
                    </span>
                  ) : item.count !== undefined ? (
                    <span className="text-[11px] font-mono text-slate-300">
                      {item.count}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </nav>

          {/* Quick Stats Widget in Sidebar */}
          <div className="mx-3 my-2 rounded-xl border border-emerald-500/15 bg-emerald-950/20 p-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Doanh thu VIP:</span>
              <span className="font-bold text-emerald-400 font-mono">
                {stats.totalRevenue.toLocaleString("vi-VN")}đ
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Độ tin cậy:</span>
              <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
                ★ {stats.avgRating} / 5.0
              </span>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="space-y-1 border-t border-emerald-900/30 p-3 bg-[#080E10]">
            <button
              onClick={() => navigate("/")}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-slate-400 hover:bg-white/[0.05] hover:text-slate-200 transition-colors"
            >
              <Home className="h-4 w-4 text-emerald-400" />
              <span>Về trang chủ EventMate</span>
            </button>
            <button
              onClick={() => {
                supabase.auth.signOut()
                navigate("/")
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Đăng xuất Quản trị</span>
            </button>
          </div>
        </aside>

        {/* ==================== MAIN CONTENT AREA ==================== */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* TOPBAR — Glassmorphic Mint Minimalist */}
          <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between border-b border-emerald-950/10 bg-white/80 px-4 sm:px-8 backdrop-blur-md">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <button
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Mở menu"
                className="shrink-0 rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 lg:hidden cursor-pointer"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-base sm:text-lg font-bold text-slate-900 font-heading">
                    {activeMenuItem?.name || "Bảng quản trị"}
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Hệ thống trực tuyến
                  </span>
                </div>
              </div>
            </div>

            {/* Topbar Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={fetchAdminData}
                disabled={isRefreshing}
                title="Đồng bộ dữ liệu mới nhất"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer shadow-2xs"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-emerald-600" : "text-slate-500"
                    }`}
                />
                <span className="hidden md:inline">
                  {isRefreshing ? "Đang đồng bộ..." : "Làm mới dữ liệu"}
                </span>
              </button>

              {stats.pendingKycCount > 0 && (
                <button
                  onClick={() => {
                    setActiveTab("students")
                    setStudentKycFilter("pending")
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-2 text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Duyệt eKYC</span>
                  <span className="ml-0.5 rounded-full bg-emerald-700 px-1.5 py-0.5 text-[10px] font-bold">
                    {stats.pendingKycCount}
                  </span>
                </button>
              )}
            </div>
          </header>

          {/* MAIN PAGE BODY */}
          <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
            {loading ? (
              <div className="py-24 text-center">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-slate-100 text-emerald-600 mb-4">
                  <EventMateLogoIcon size={32} variant="mint" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">
                  Đang đồng bộ dữ liệu quản trị...
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Vui lòng đợi giây lát trong khi chúng tôi trích xuất số liệu thời gian thực.
                </p>
              </div>
            ) : (
              <div className="space-y-6">

                {/* ========================================================= */}
                {/* 1. OVERVIEW TAB */}
                {/* ========================================================= */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Attention Notice: Only shown when action is required */}
                    {(stats.pendingKycCount > 0 || stats.pendingFeedbacks > 0) && (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-slate-800">
                        <div className="flex items-center gap-2.5">
                          <AlertCircle className="h-4 w-4 text-amber-700 shrink-0" />
                          <span className="text-xs font-semibold text-slate-900">Cần xử lý:</span>
                          <span className="text-xs text-slate-600">
                            {[
                              stats.pendingKycCount > 0 && `${stats.pendingKycCount} eKYC`,
                              stats.pendingFeedbacks > 0 && `${stats.pendingFeedbacks} góp ý`,
                            ]
                              .filter(Boolean)
                              .join(" • ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {stats.pendingKycCount > 0 && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setActiveTab("students")
                                setStudentKycFilter("pending")
                              }}
                              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-3 h-7 cursor-pointer shadow-xs"
                            >
                              Duyệt eKYC ({stats.pendingKycCount})
                            </Button>
                          )}
                          {stats.pendingFeedbacks > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setActiveTab("feedbacks")
                                setFeedbackStatusFilter("pending")
                              }}
                              className="rounded-lg border-amber-300 bg-white hover:bg-amber-100/50 text-amber-900 font-medium text-xs px-3 h-7 cursor-pointer shadow-xs"
                            >
                              Xem góp ý ({stats.pendingFeedbacks})
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Primary KPI Metrics */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-colors hover:border-slate-300">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-medium text-slate-500">
                              Sinh viên
                            </span>
                            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 font-heading">
                              {stats.totalStudents.toLocaleString("vi-VN")}
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                              {stats.totalStudents - stats.pendingKycCount} đã kích hoạt
                            </p>
                          </div>
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                            <Users className="h-5 w-5" />
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-colors hover:border-slate-300">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-medium text-slate-500">
                              Nhà tuyển dụng
                            </span>
                            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 font-heading">
                              {stats.totalOrganizers.toLocaleString("vi-VN")}
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                              {stats.totalPremium} gói VIP
                            </p>
                          </div>
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                            <Building2 className="h-5 w-5" />
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-colors hover:border-slate-300">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-medium text-slate-500">
                              Tin tuyển dụng
                            </span>
                            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 font-heading">
                              {stats.totalEvents.toLocaleString("vi-VN")}
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                              {stats.totalApplications.toLocaleString("vi-VN")} hồ sơ ứng tuyển
                            </p>
                          </div>
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                            <FileText className="h-5 w-5" />
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-colors hover:border-slate-300">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-medium text-slate-500">
                              Doanh thu
                            </span>
                            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 font-heading">
                              {stats.totalRevenue.toLocaleString("vi-VN")} ₫
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                              VietQR tự động
                            </p>
                          </div>
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                            <CreditCard className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Operational Health Metrics */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="rounded-xl border border-slate-200/80 bg-white p-3.5">
                        <p className="text-[11px] font-medium text-slate-500">Tỷ lệ eKYC</p>
                        <div className="mt-1 flex items-baseline justify-between">
                          <span className="text-lg font-bold text-slate-900">
                            {stats.totalStudents > 0
                              ? Math.round(
                                ((stats.totalStudents - stats.pendingKycCount) /
                                  stats.totalStudents) *
                                100
                              )
                              : 100}
                            %
                          </span>
                          <span className="text-[11px] text-emerald-600 font-medium">Chính danh</span>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200/80 bg-white p-3.5">
                        <p className="text-[11px] font-medium text-slate-500">Đánh giá người dùng</p>
                        <div className="mt-1 flex items-baseline justify-between">
                          <span className="text-lg font-bold text-slate-900">
                            {stats.avgRating.toFixed(1)} <span className="text-xs font-normal text-slate-400">/ 5.0</span>
                          </span>
                          <span className="text-[11px] text-amber-600 font-medium">Khảo sát</span>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200/80 bg-white p-3.5">
                        <p className="text-[11px] font-medium text-slate-500">Hồ sơ ứng tuyển</p>
                        <div className="mt-1 flex items-baseline justify-between">
                          <span className="text-lg font-bold text-slate-900">
                            {stats.totalApplications.toLocaleString("vi-VN")}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">Toàn hệ thống</span>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200/80 bg-white p-3.5">
                        <p className="text-[11px] font-medium text-slate-500">Phản hồi tồn đọng</p>
                        <div className="mt-1 flex items-baseline justify-between">
                          <span className="text-lg font-bold text-slate-900">
                            {stats.pendingFeedbacks} <span className="text-xs font-normal text-slate-400">/ {stats.totalFeedbacks}</span>
                          </span>
                          <span className={`text-[11px] font-medium ${stats.pendingFeedbacks > 0 ? "text-amber-600" : "text-slate-400"}`}>
                            {stats.pendingFeedbacks > 0 ? "Cần xử lý" : "Ổn định"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Operational Workspace: Events Table (Left 8) + Actions & Feedbacks (Right 4) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Left: Recent Events Table */}
                      <div className="lg:col-span-8 rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
                          <h3 className="text-sm font-semibold text-slate-900">
                            Tin tuyển dụng gần đây
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveTab("events")}
                            className="text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 h-8 cursor-pointer"
                          >
                            Xem tất cả ({stats.totalEvents}) →
                          </Button>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500">
                                <th className="px-5 py-3">Chiến dịch</th>
                                <th className="px-5 py-3">Đơn vị</th>
                                <th className="px-5 py-3">Vị trí</th>
                                <th className="px-5 py-3">Thời gian</th>
                                <th className="px-5 py-3 text-right">Trạng thái</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {events.slice(0, 5).map((ev) => (
                                <tr key={ev.id} className="hover:bg-slate-50/60 transition-colors">
                                  <td className="px-5 py-3 font-medium text-slate-900 max-w-[200px] truncate">
                                    {ev.title}
                                  </td>
                                  <td className="px-5 py-3 text-slate-600">
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-5 w-5 rounded-md border border-slate-200">
                                        <AvatarImage src={ev.profiles?.avatar_url} />
                                        <AvatarFallback className="text-[9px] bg-slate-100">
                                          {ev.profiles?.full_name?.charAt(0) || "B"}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="truncate max-w-[120px]">
                                        {ev.profiles?.full_name || "Ban tổ chức"}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-5 py-3 text-slate-600">
                                    <span className="truncate max-w-[100px] block">
                                      {ev.position_type || "Cộng tác viên"}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3 text-slate-500 font-mono text-[11px]">
                                    {ev.event_date
                                      ? new Date(ev.event_date).toLocaleDateString("vi-VN")
                                      : "---"}
                                  </td>
                                  <td className="px-5 py-3 text-right">
                                    <span
                                      className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-medium border ${ev.status === "upcoming"
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                          : "bg-slate-50 text-slate-600 border-slate-200"
                                        }`}
                                    >
                                      {ev.status === "upcoming" ? "Đang mở tuyển" : "Hoàn tất"}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                              {events.length === 0 && (
                                <tr>
                                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                                    Chưa có chiến dịch nào được đăng tải.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Right: Quick shortcuts & Recent Feedbacks */}
                      <div className="lg:col-span-4 space-y-6">
                        {/* Quick Shortcuts */}
                        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                            Thao tác quản trị
                          </h3>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => {
                                setActiveTab("students")
                                setStudentKycFilter("pending")
                              }}
                              className="flex flex-col items-start gap-1 p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-emerald-50/50 hover:border-emerald-200 transition-colors text-left cursor-pointer"
                            >
                              <ShieldCheck className="h-4 w-4 text-emerald-600" />
                              <span className="text-xs font-medium text-slate-800">Duyệt eKYC</span>
                              <span className="text-[10px] text-slate-400">
                                {stats.pendingKycCount} hồ sơ chờ
                              </span>
                            </button>

                            <button
                              onClick={() => setActiveTab("organizers")}
                              className="flex flex-col items-start gap-1 p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300 transition-colors text-left cursor-pointer"
                            >
                              <Building2 className="h-4 w-4 text-slate-700" />
                              <span className="text-xs font-medium text-slate-800">Đối tác</span>
                              <span className="text-[10px] text-slate-400">
                                {stats.totalOrganizers} doanh nghiệp
                              </span>
                            </button>

                            <button
                              onClick={() => setActiveTab("transactions")}
                              className="flex flex-col items-start gap-1 p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300 transition-colors text-left cursor-pointer"
                            >
                              <CreditCard className="h-4 w-4 text-slate-700" />
                              <span className="text-xs font-medium text-slate-800">Giao dịch VIP</span>
                              <span className="text-[10px] text-slate-400">VietQR tự động</span>
                            </button>

                            <button
                              onClick={() => setActiveTab("feedbacks")}
                              className="flex flex-col items-start gap-1 p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-amber-50/50 hover:border-amber-200 transition-colors text-left cursor-pointer"
                            >
                              <MessageSquare className="h-4 w-4 text-amber-600" />
                              <span className="text-xs font-medium text-slate-800">Góp ý & Báo lỗi</span>
                              <span className="text-[10px] text-slate-400">
                                {stats.pendingFeedbacks} chưa xem
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Recent Feedbacks */}
                        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Góp ý mới nhất
                            </h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setActiveTab("feedbacks")}
                              className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 h-7 px-2 cursor-pointer"
                            >
                              Hộp thư →
                            </Button>
                          </div>

                          <div className="divide-y divide-slate-100">
                            {feedbacks.slice(0, 3).map((fb) => (
                              <div key={fb.id} className="py-2.5 space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-medium text-slate-900 truncate">
                                    {fb.full_name || fb.profiles?.full_name || "Thành viên"}
                                  </span>
                                  <span
                                    className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${fb.status === "resolved"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : fb.status === "reviewed"
                                          ? "bg-blue-50 text-blue-700 border-blue-200"
                                          : "bg-amber-50 text-amber-700 border-amber-200"
                                      }`}
                                  >
                                    {fb.status === "resolved"
                                      ? "Đã xử lý"
                                      : fb.status === "reviewed"
                                        ? "Đã xem"
                                        : "Chờ xử lý"}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-1">
                                  {fb.content}
                                </p>
                              </div>
                            ))}
                            {feedbacks.length === 0 && (
                              <p className="py-4 text-center text-xs text-slate-400">
                                Chưa có phản hồi nào.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* 2. ORGANIZERS TAB */}
                {/* ========================================================= */}
                {activeTab === "organizers" && (
                  <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                    {/* Header & Filters */}
                    <div className="border-b border-slate-100 p-4 sm:p-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-emerald-600" />
                          Nhà tuyển dụng ({organizers.length})
                        </h3>

                        {/* Search and Filter bar */}
                        <div className="flex flex-wrap items-center gap-2.5">
                          <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Tìm tên, trường, email, SĐT..."
                              value={organizerSearch}
                              onChange={(e) => setOrganizerSearch(e.target.value)}
                              className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                            {organizerSearch && (
                              <button
                                onClick={() => setOrganizerSearch("")}
                                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                            {[
                              { id: "all", label: "Tất cả" },
                              { id: "verified", label: "Đã xác thực" },
                              { id: "unverified", label: "Chưa xác thực" },
                              { id: "premium", label: "Gói VIP" },
                            ].map((tab) => (
                              <button
                                key={tab.id}
                                onClick={() => setOrganizerStatusFilter(tab.id)}
                                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${organizerStatusFilter === tab.id
                                    ? "bg-white text-emerald-700 font-bold shadow-2xs"
                                    : "text-slate-600 hover:text-slate-900"
                                  }`}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Organizers Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500">
                            <th className="px-5 py-3">Đơn vị</th>
                            <th className="px-5 py-3">Đại diện</th>
                            <th className="px-5 py-3">Gói VIP</th>
                            <th className="px-5 py-3">Xác thực</th>
                            <th className="px-5 py-3 text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredOrganizers.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-12 text-center text-slate-400">
                                Không tìm thấy nhà tuyển dụng nào khớp bộ lọc.
                              </td>
                            </tr>
                          ) : (
                            filteredOrganizers.map((org) => (
                              <tr
                                key={org.id}
                                className="hover:bg-emerald-50/30 transition-colors"
                              >
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 rounded-xl border border-slate-200">
                                      <AvatarImage src={org.avatar_url} />
                                      <AvatarFallback className="bg-emerald-100 text-emerald-800 font-bold">
                                        {org.full_name?.charAt(0) || "O"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                        <span>
                                          {org.university || org.full_name || "Chưa đặt tên"}
                                        </span>
                                        {org.is_verified && (
                                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                        )}
                                      </div>
                                      <span className="text-[11px] text-slate-500">
                                        {org.address || "Đà Nẵng"}
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-5 py-3.5 text-slate-600">
                                  <div className="font-medium text-slate-800">
                                    {org.full_name}
                                  </div>
                                  <div className="text-[11px] text-slate-400 font-mono">
                                    {org.email}
                                  </div>
                                  {org.phone && (
                                    <div className="text-[11px] text-emerald-700 font-mono">
                                      📞 {org.phone}
                                    </div>
                                  )}
                                </td>

                                <td className="px-5 py-3.5">
                                  {org.is_premium ? (
                                    <span className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-100 to-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-300">
                                      <Award className="h-3 w-3 text-amber-700" /> VIP Recruiter
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-[11px]">Cơ bản (Free)</span>
                                  )}
                                </td>

                                <td className="px-5 py-3.5">
                                  {org.is_verified ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/80">
                                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Đã xác thực
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                                      Chưa duyệt
                                    </span>
                                  )}
                                </td>

                                <td className="px-5 py-3.5 text-right">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleToggleOrganizerVerification(
                                        org.id,
                                        org.is_verified
                                      )
                                    }
                                    className={`h-8 rounded-xl px-3 text-xs font-semibold cursor-pointer transition-all ${org.is_verified
                                        ? "border border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
                                        : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xs"
                                      }`}
                                  >
                                    {org.is_verified ? "Thu hồi tích xanh" : "Cấp Tích Xanh"}
                                  </Button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* 3. STUDENTS & eKYC TAB */}
                {/* ========================================================= */}
                {activeTab === "students" && (
                  <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                    {/* Header & Filter */}
                    <div className="border-b border-slate-100 p-4 sm:p-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                          <Users className="h-4 w-4 text-emerald-600" />
                          Ứng viên ({students.length})
                        </h3>

                        {/* Search and Filters */}
                        <div className="flex flex-wrap items-center gap-2.5">
                          <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Tìm sinh viên, trường, email..."
                              value={studentSearch}
                              onChange={(e) => setStudentSearch(e.target.value)}
                              className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                            {studentSearch && (
                              <button
                                onClick={() => setStudentSearch("")}
                                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                            {[
                              { id: "all", label: "Tất cả" },
                              {
                                id: "pending",
                                label: "Chờ duyệt",
                                count: stats.pendingKycCount,
                              },
                              { id: "approved", label: "Đã xác thực" },
                              { id: "rejected", label: "Từ chối" },
                              { id: "none", label: "Chưa gửi" },
                            ].map((tab) => (
                              <button
                                key={tab.id}
                                onClick={() => setStudentKycFilter(tab.id)}
                                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${studentKycFilter === tab.id
                                    ? "bg-white text-emerald-700 font-bold shadow-2xs"
                                    : "text-slate-600 hover:text-slate-900"
                                  }`}
                              >
                                <span>{tab.label}</span>
                                {tab.count ? (
                                  <span className="rounded-full bg-emerald-600 px-1.5 py-0.2 text-[9px] font-bold text-white">
                                    {tab.count}
                                  </span>
                                ) : null}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500">
                            <th className="px-5 py-3">Ứng viên</th>
                            <th className="px-5 py-3">Trường</th>
                            <th className="px-5 py-3">Email</th>
                            <th className="px-5 py-3">Tín nhiệm</th>
                            <th className="px-5 py-3">eKYC</th>
                            <th className="px-5 py-3 text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredStudents.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-12 text-center text-slate-400">
                                Không tìm thấy sinh viên nào khớp tiêu chí lọc.
                              </td>
                            </tr>
                          ) : (
                            filteredStudents.map((stud) => (
                              <tr
                                key={stud.id}
                                className="hover:bg-emerald-50/30 transition-colors"
                              >
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8 rounded-xl border border-slate-200">
                                      <AvatarImage src={stud.avatar_url} />
                                      <AvatarFallback className="bg-emerald-100 text-emerald-800 font-bold text-xs">
                                        {stud.full_name?.charAt(0) || "S"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-bold text-slate-900 flex items-center gap-1">
                                        <span>{stud.full_name}</span>
                                        {stud.is_verified && (
                                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                        )}
                                      </div>
                                      <span className="text-[11px] text-slate-400 font-mono">
                                        #{stud.id.slice(0, 8)}
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-5 py-3.5 text-slate-600">
                                  <div className="flex items-center gap-1.5 font-medium">
                                    <GraduationCap className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                    <span className="truncate max-w-[160px]">
                                      {stud.university || "Chưa cập nhật"}
                                    </span>
                                  </div>
                                </td>

                                <td className="px-5 py-3.5 text-slate-500 font-mono">
                                  {stud.email}
                                </td>

                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                      <div
                                        className="h-full bg-emerald-500 rounded-full"
                                        style={{
                                          width: `${stud.reliability_score ?? 100}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-[11px] font-bold text-emerald-800 font-mono">
                                      {stud.reliability_score ?? 100}
                                    </span>
                                  </div>
                                </td>

                                <td className="px-5 py-3.5">
                                  {stud.is_verified || stud.kyc_status === "approved" ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Tích xanh
                                    </span>
                                  ) : stud.kyc_status === "pending" ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-300">
                                      <Clock className="h-3.5 w-3.5 text-amber-600" /> Chờ xét duyệt
                                    </span>
                                  ) : stud.kyc_status === "rejected" ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
                                      <AlertCircle className="h-3.5 w-3.5 text-rose-600" /> Đã từ chối
                                    </span>
                                  ) : (
                                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                                      Chưa nộp
                                    </span>
                                  )}
                                </td>

                                <td className="px-5 py-3.5 text-right">
                                  {stud.kyc_status === "pending" ? (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedKycStudent(stud)}
                                      className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1.5 text-xs font-bold text-white hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 cursor-pointer"
                                    >
                                      <ShieldCheck className="h-3.5 w-3.5" />
                                      <span>Xem &amp; Duyệt</span>
                                    </button>
                                  ) : stud.kyc_data ? (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedKycStudent(stud)}
                                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors cursor-pointer"
                                    >
                                      Xem hồ sơ
                                    </button>
                                  ) : (
                                    <span className="text-slate-300 text-xs italic">—</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* 4. EVENTS TAB */}
                {/* ========================================================= */}
                {activeTab === "events" && (
                  <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                    <div className="border-b border-slate-100 p-4 sm:p-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-emerald-600" />
                          Tin tuyển dụng ({events.length})
                        </h3>

                        {/* Search and Filter */}
                        <div className="flex flex-wrap items-center gap-2.5">
                          <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Tìm tiêu đề, đơn vị, vị trí..."
                              value={eventSearch}
                              onChange={(e) => setEventSearch(e.target.value)}
                              className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                            {eventSearch && (
                              <button
                                onClick={() => setEventSearch("")}
                                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                            {[
                              { id: "all", label: "Tất cả" },
                              { id: "upcoming", label: "Đang mở tuyển" },
                              { id: "completed", label: "Đã hoàn thành" },
                            ].map((tab) => (
                              <button
                                key={tab.id}
                                onClick={() => setEventStatusFilter(tab.id)}
                                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${eventStatusFilter === tab.id
                                    ? "bg-white text-emerald-700 font-bold shadow-2xs"
                                    : "text-slate-600 hover:text-slate-900"
                                  }`}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500">
                            <th className="px-5 py-3">Chiến dịch</th>
                            <th className="px-5 py-3">Đơn vị</th>
                            <th className="px-5 py-3">Vị trí</th>
                            <th className="px-5 py-3">Thời gian</th>
                            <th className="px-5 py-3">Trạng thái</th>
                            <th className="px-5 py-3 text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredEvents.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-12 text-center text-slate-400">
                                Không tìm thấy bài tuyển nào khớp yêu cầu.
                              </td>
                            </tr>
                          ) : (
                            filteredEvents.map((ev) => (
                              <tr
                                key={ev.id}
                                className="hover:bg-emerald-50/30 transition-colors"
                              >
                                <td className="px-5 py-3.5 font-bold text-slate-900 max-w-sm truncate">
                                  {ev.title}
                                </td>
                                <td className="px-5 py-3.5 text-slate-600">
                                  {ev.profiles?.full_name || "Ban tổ chức"}
                                </td>
                                <td className="px-5 py-3.5">
                                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
                                    {ev.position_type || "Cộng tác viên"}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5 text-slate-500 font-mono">
                                  {ev.event_date
                                    ? new Date(ev.event_date).toLocaleDateString("vi-VN")
                                    : "---"}
                                </td>
                                <td className="px-5 py-3.5">
                                  <Badge
                                    className={`text-[10px] ${ev.status === "upcoming"
                                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                        : "bg-slate-100 text-slate-600"
                                      }`}
                                  >
                                    {ev.status === "upcoming"
                                      ? "Đang mở"
                                      : "Hoàn tất"}
                                  </Badge>
                                </td>
                                <td className="px-5 py-3.5 text-right">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteEvent(ev.id)}
                                    className="h-8 rounded-xl px-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                                    Gỡ bài
                                  </Button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* 5. TRANSACTIONS TAB */}
                {/* ========================================================= */}
                {activeTab === "transactions" && (
                  <div className="space-y-6">
                    {/* Revenue Banner */}
                    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-[#0c1a18] via-[#091513] to-[#060e0d] p-6 text-white shadow-xl">
                      <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider">
                            DOANH THU HỆ THỐNG
                          </span>
                          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-heading mt-1">
                            {stats.totalRevenue.toLocaleString("vi-VN")} <span className="text-emerald-400 text-xl font-normal">VNĐ</span>
                          </h2>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-white/10 p-3 border border-white/10 text-center">
                            <span className="block text-[10px] text-slate-300 font-mono">ĐỐI TÁC VIP</span>
                            <span className="text-lg font-bold text-emerald-300 font-mono">{stats.totalPremium}</span>
                          </div>
                          <div className="rounded-xl bg-white/10 p-3 border border-white/10 text-center">
                            <span className="block text-[10px] text-slate-300 font-mono">GIAO DỊCH</span>
                            <span className="text-lg font-bold text-emerald-300 font-mono">{transactions.length || stats.totalPremium}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                      <div className="border-b border-slate-100 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <h3 className="text-base font-semibold text-slate-900">
                          Lịch sử giao dịch ({transactions.length})
                        </h3>
                        <div className="relative w-full sm:w-64">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Tìm mã đơn, tên, gói..."
                            value={transactionSearch}
                            onChange={(e) => setTransactionSearch(e.target.value)}
                            className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500">
                              <th className="px-5 py-3">Mã đơn</th>
                              <th className="px-5 py-3">Nhà tuyển dụng</th>
                              <th className="px-5 py-3">Gói</th>
                              <th className="px-5 py-3">Số tiền</th>
                              <th className="px-5 py-3">Thời gian</th>
                              <th className="px-5 py-3 text-right">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredTransactions.length > 0 ? (
                              filteredTransactions.map((tx: any) => (
                                <tr
                                  key={tx.id}
                                  className="hover:bg-emerald-50/30 transition-colors"
                                >
                                  <td className="px-5 py-3.5 font-mono text-xs text-emerald-800 font-semibold">
                                    #{tx.id.slice(0, 8).toUpperCase()}
                                  </td>
                                  <td className="px-5 py-3.5">
                                    <div className="font-bold text-slate-900">
                                      {tx.profiles?.full_name || "Nhà tuyển dụng"}
                                    </div>
                                    <div className="text-[11px] text-slate-400 font-mono">
                                      {tx.profiles?.email}
                                    </div>
                                  </td>
                                  <td className="px-5 py-3.5">
                                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                                      Gói {tx.plan_id?.toUpperCase()} (
                                      {tx.billing_cycle === "yearly"
                                        ? "1 năm"
                                        : "1 tháng"}
                                      )
                                    </span>
                                  </td>
                                  <td className="px-5 py-3.5 font-bold text-emerald-700 font-mono text-sm">
                                    {Number(tx.amount).toLocaleString("vi-VN")}đ
                                  </td>
                                  <td className="px-5 py-3.5 text-slate-500 font-mono">
                                    {new Date(tx.created_at).toLocaleDateString(
                                      "vi-VN"
                                    )}
                                  </td>
                                  <td className="px-5 py-3.5 text-right">
                                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                                      VietQR Thành công
                                    </Badge>
                                  </td>
                                </tr>
                              ))
                            ) : organizers.filter(
                              (org) =>
                                org.is_premium &&
                                (!org.premium_until ||
                                  new Date(org.premium_until) > new Date())
                            ).length === 0 ? (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="px-5 py-12 text-center text-slate-400"
                                >
                                  Chưa có giao dịch VIP nào trong hệ thống.
                                </td>
                              </tr>
                            ) : (
                              organizers
                                .filter(
                                  (org) =>
                                    org.is_premium &&
                                    (!org.premium_until ||
                                      new Date(org.premium_until) > new Date())
                                )
                                .map((org, index) => (
                                  <tr
                                    key={org.id}
                                    className="hover:bg-emerald-50/30 transition-colors"
                                  >
                                    <td className="px-5 py-3.5 font-mono text-slate-500">
                                      #TXN-{1000 + index}
                                    </td>
                                    <td className="px-5 py-3.5 font-bold text-slate-900">
                                      {org.full_name}
                                    </td>
                                    <td className="px-5 py-3.5">Gói Standard (1 tháng)</td>
                                    <td className="px-5 py-3.5 font-bold text-emerald-700 font-mono">
                                      699.000đ
                                    </td>
                                    <td className="px-5 py-3.5 text-slate-500 font-mono">
                                      {new Date(
                                        org.premium_until || org.created_at
                                      ).toLocaleDateString("vi-VN")}
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                      <Badge className="bg-emerald-100 text-emerald-800">
                                        Đang hoạt động
                                      </Badge>
                                    </td>
                                  </tr>
                                ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* 6. FEEDBACKS TAB */}
                {/* ========================================================= */}
                {activeTab === "feedbacks" && (
                  <div className="space-y-6">
                    {/* Stat cards for Feedbacks */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <HeroKpiCard
                        title="Tổng góp ý"
                        value={stats.totalFeedbacks.toString()}
                        subtext="Toàn hệ thống"
                        icon={<MessageSquare className="h-5 w-5 text-indigo-700" />}
                        badge="Phản hồi"
                        accentColor="teal"
                      />
                      <HeroKpiCard
                        title="Chờ xử lý"
                        value={stats.pendingFeedbacks.toString()}
                        subtext="Cần phản hồi"
                        icon={<AlertCircle className="h-5 w-5 text-amber-700" />}
                        badge="Pending"
                        accentColor="amber"
                      />
                      <HeroKpiCard
                        title="Đánh giá TB"
                        value={`${stats.avgRating} / 5.0`}
                        subtext="Khảo sát người dùng"
                        icon={<Star className="h-5 w-5 fill-amber-400 text-amber-500" />}
                        badge="Hài lòng"
                        accentColor="amber"
                      />
                      <HeroKpiCard
                        title="Đã xử lý"
                        value={feedbacks
                          .filter((f) => f.status === "resolved")
                          .length.toString()}
                        subtext="Hoàn tất ghi chú"
                        icon={<CheckCircle2 className="h-5 w-5 text-emerald-700" />}
                        badge="Resolved"
                        accentColor="emerald"
                      />
                    </div>

                    {/* Filter and Search Bar */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
                      <div className="flex flex-wrap items-center gap-2">
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
                            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${feedbackStatusFilter === tab.id
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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

                      <div className="flex items-center gap-2.5">
                        <select
                          value={feedbackCategoryFilter}
                          onChange={(e) => setFeedbackCategoryFilter(e.target.value)}
                          aria-label="Lọc theo thể loại góp ý"
                          className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="all">Mọi thể loại</option>
                          <option value="feature">Tính năng</option>
                          <option value="bug">Báo lỗi</option>
                          <option value="ux">Giao diện</option>
                          <option value="general">Góp ý khác</option>
                        </select>

                        <div className="relative w-full sm:w-56">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Tìm phản hồi..."
                            value={feedbackSearch}
                            onChange={(e) => setFeedbackSearch(e.target.value)}
                            className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Feedbacks list */}
                    <div className="space-y-4">
                      {filteredFeedbacks.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center text-slate-400">
                          Không có phản hồi nào khớp với tiêu chí tìm kiếm.
                        </div>
                      ) : (
                        filteredFeedbacks.map((fb) => (
                          <div
                            key={fb.id}
                            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 hover:border-emerald-200 transition-colors"
                          >
                            {/* Card Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 rounded-xl border border-slate-200">
                                  <AvatarImage src={fb.profiles?.avatar_url} />
                                  <AvatarFallback className="bg-emerald-100 text-emerald-800 font-bold text-xs">
                                    {(fb.full_name || fb.profiles?.full_name || "U").charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-900">
                                      {fb.full_name || fb.profiles?.full_name || "Thành viên ẩn danh"}
                                    </span>
                                    {fb.profiles?.role && (
                                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 font-medium">
                                        {fb.profiles.role === "organizer"
                                          ? "Nhà tuyển dụng"
                                          : fb.profiles.role === "student"
                                            ? "Sinh viên"
                                            : fb.profiles.role}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-400 font-mono">
                                    {fb.email || fb.profiles?.email || "Không cung cấp email"}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Badge className="text-[10px] bg-slate-100 text-slate-700">
                                  {fb.category === "bug"
                                    ? "🐛 Báo lỗi"
                                    : fb.category === "feature"
                                      ? "💡 Tính năng"
                                      : fb.category === "ux"
                                        ? "🎨 Giao diện"
                                        : "💬 Góp ý"}
                                </Badge>
                                {typeof fb.rating === "number" && fb.rating > 0 && (
                                  <span className="text-xs font-bold text-amber-500">
                                    ★ {fb.rating}
                                  </span>
                                )}
                                <span className="text-[11px] text-slate-400 font-mono">
                                  {new Date(fb.created_at).toLocaleDateString("vi-VN")}
                                </span>
                              </div>
                            </div>

                            {/* Content */}
                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                              {fb.content}
                            </p>

                            {/* Admin Note Box */}
                            <div>
                              {editingNoteId === fb.id ? (
                                <div className="space-y-2 rounded-xl bg-amber-50/80 border border-amber-200 p-3">
                                  <label className="text-[11px] font-bold text-amber-900 block">
                                    Ghi chú nội bộ cho phản hồi này:
                                  </label>
                                  <input
                                    type="text"
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                    placeholder="VD: Đã chuyển dev fix ở bản cập nhật tới..."
                                    className="w-full h-8 px-3 rounded-lg border border-amber-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                                  />
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setEditingNoteId(null)}
                                      className="h-7 text-xs rounded-lg"
                                    >
                                      Hủy
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      onClick={() => handleSaveAdminNote(fb.id)}
                                      className="h-7 text-xs rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                                    >
                                      Lưu ghi chú
                                    </Button>
                                  </div>
                                </div>
                              ) : fb.admin_note ? (
                                <div className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2.5 text-xs text-amber-900">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold">Ghi chú Quản trị:</span>
                                    <span>{fb.admin_note}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingNoteId(fb.id)
                                      setNoteText(fb.admin_note || "")
                                    }}
                                    className="text-amber-800 hover:text-amber-950 font-bold ml-2 underline text-[11px] cursor-pointer"
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
                                  className="text-slate-400 hover:text-emerald-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Thêm ghi chú nội bộ</span>
                                </button>
                              )}
                            </div>

                            {/* Footer Actions */}
                            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-400 font-medium">
                                  Chuyển trạng thái:
                                </span>
                                {fb.status !== "reviewed" && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateFeedbackStatus(fb.id, "reviewed")}
                                    className="h-7 px-2.5 rounded-lg border border-slate-200 bg-white text-[11px] font-semibold text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                                  >
                                    Đánh dấu đã xem
                                  </button>
                                )}
                                {fb.status !== "resolved" && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateFeedbackStatus(fb.id, "resolved")}
                                    className="h-7 px-2.5 rounded-lg border border-emerald-200 bg-emerald-50 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300 transition-colors cursor-pointer"
                                  >
                                    Đã giải quyết
                                  </button>
                                )}
                                {fb.status !== "pending" && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateFeedbackStatus(fb.id, "pending")}
                                    className="h-7 px-2.5 rounded-lg border border-slate-200 bg-white text-[11px] font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                                  >
                                    Chuyển về chờ xử lý
                                  </button>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteFeedback(fb.id)}
                                className="h-7 px-2 text-[11px] text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer flex items-center gap-1 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Xóa</span>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

              </div>
            )}
          </main>
        </div>
      </div>

      {/* Admin eKYC Review Modal */}
      <AdminKycReviewModal
        isOpen={Boolean(selectedKycStudent)}
        student={selectedKycStudent}
        onClose={() => setSelectedKycStudent(null)}
        onApprove={handleApproveStudentKyc}
        onReject={handleRejectStudentKyc}
      />
    </div>
  )
}

/* ========================================================================= */
/* CLEAN MINIMAL HERO KPI CARD COMPONENT                                     */
/* ========================================================================= */
interface HeroKpiCardProps {
  title: string
  value: string
  subtext: string
  icon: React.ReactNode
  badge?: string
  accentColor?: "emerald" | "teal" | "cyan" | "amber"
}

function HeroKpiCard({
  title,
  value,
  subtext,
  icon,
  badge,
}: HeroKpiCardProps) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-colors hover:border-slate-300">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-slate-500">
            {title}
          </span>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 font-heading">
            {value}
          </div>
          <p className="mt-1 text-xs text-slate-500">{subtext}</p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
          {icon}
        </div>
      </div>

      {badge && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Phân loại:</span>
          <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-600 text-[10px]">
            {badge}
          </span>
        </div>
      )}
    </div>
  )
}
