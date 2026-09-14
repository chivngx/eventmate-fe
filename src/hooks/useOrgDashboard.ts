"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "@/lib/router"
import { supabase } from "@/lib/supabase"
import { getUserFacingMessage } from "@/lib/error"
import { useUser } from "@/components/providers/AuthProvider"
import { useWards, useJobPositions, useEventCategories } from "@/hooks/use-lookups"

export function useOrgDashboard() {
  const navigate = useNavigate()
  // 🔒 P1.1: user + isPremium từ context (thay getUser() lặp 3 lần + profiles.select is_premium)
  const { user, isPremium: ctxIsPremium, loading: authLoading } = useUser()
  const [searchParams, setSearchParams] = useSearchParams()
  const [events, setEvents] = useState<any[]>([])

  // Cấu trúc form dữ liệu nâng cao
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [location, setLocation] = useState("") // Giữ vai trò lưu số nhà / tên đường cụ thể nếu cần
  const [positionType, setPositionType] = useState("")
  const [benefits, setBenefits] = useState("Cấp chứng nhận")
  const [category, setCategory] = useState("")
  const [slotsNeeded, setSlotsNeeded] = useState("1")
  const [eventDate, setEventDate] = useState("")
  const [applicationDeadline, setApplicationDeadline] = useState("")

  // [MỚI] State lưu trữ Phường/Xã đang chọn cho form (wards lấy từ useWards hook ở dưới)
  const [wardId, setWardId] = useState("")

  // [MỚI] Các trường chuyên sâu cho sự kiện (thù lao, ca làm, Zalo)
  const [salaryAmount, setSalaryAmount] = useState("200000")
  const [salaryType, setSalaryType] = useState("per_shift")
  const [paymentMethod, setPaymentMethod] = useState("cash_after_event")
  const [startTime, setStartTime] = useState("07:30")
  const [endTime, setEndTime] = useState("17:00")
  const [endDate, setEndDate] = useState("")
  const [zaloGroupLink, setZaloGroupLink] = useState("")

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [viewingCV, setViewingCV] = useState<any | null>(null)

  const [selectedEventForCandidates, setSelectedEventForCandidates] = useState<any | null>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [loadingApps, setLoadingApps] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const [activeTab, setActiveTabState] = useState<string>(() => {
    return searchParams.get("tab") || "feed"
  })
  // 🔒 SECURITY: is_premium được đọc từ DB (profiles.is_premium), không còn localStorage.
  // Trước đây user có thể `localStorage.setItem("em_premium_recruiter","true")` để bypass VIP.
  const [isPremium, setIsPremium] = useState<boolean>(false)

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab)
    setSearchParams({ tab })
  }

  // Demo-only: set state local (không persist). Khi reload sẽ reset về DB value.
  // Payment integration (PayOS/VNPay) sẽ thay thế handler này ở Phase 4.
  const handleBuyPremium = () => {
    setIsPremium(true)
  }


  // 🔒 P1.3: lookup data từ react-query cache (thay fetch thủ công 3 queries)
  const { data: wardsData = [] } = useWards()
  const wards = wardsData
  const { data: posData = [] } = useJobPositions()
  const dbPositions = posData.map(p => p.name)
  const { data: catData = [] } = useEventCategories()
  const dbCategories = catData.map(c => c.name)

  // Set default position + category khi data load xong
  useEffect(() => {
    if (dbPositions.length > 0 && !positionType) setPositionType(dbPositions[0])
    if (dbCategories.length > 0 && !category) setCategory(dbCategories[0])
  }, [dbPositions, dbCategories])

  const fetchMyEvents = async () => {
    if (!user) return
    setFetching(true)
    setUserId(user.id)
    // 🔒 P1.1: isPremium từ context (thay profiles.select is_premium fetch)
    setIsPremium(ctxIsPremium)

    const { data, error } = await supabase
      .from("events")
      .select("*, applications(id)")
      .eq("organizer_id", user.id)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setEvents(data)
    }
    setFetching(false)
  }

  useEffect(() => {
    if (authLoading) return
    fetchMyEvents()
  }, [user, authLoading])

  useEffect(() => {
    if (searchParams.get("action") === "create") {
      setShowForm(true)
    }
  }, [searchParams])

  const resetForm = () => {
    setTitle("")
    setDesc("")
    setLocation("")
    setWardId("") // Reset sạch ID phường xã cũ
    setPositionType(dbPositions.length > 0 ? dbPositions[0] : "")
    setBenefits("Cấp chứng nhận")
    setCategory(dbCategories.length > 0 ? dbCategories[0] : "")
    setSlotsNeeded("1")
    setEventDate("")
    setApplicationDeadline("")
    setSalaryAmount("200000")
    setSalaryType("per_shift")
    setPaymentMethod("cash_after_event")
    setStartTime("07:30")
    setEndTime("17:00")
    setEndDate("")
    setZaloGroupLink("")
    setEditingId(null)
    setShowForm(false)
    setSearchParams({})
  }

  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    // ĐÃ SỬA: Ép buộc phải chọn Dropdown Phường/Xã (wardId) khi tạo bài đăng mới
    if (!title || !desc || !wardId || !eventDate || !applicationDeadline) {
      alert("Vui lòng điền đầy đủ thông tin, chọn Phường/Xã địa điểm và thời hạn!")
      return
    }
    setLoading(true)

    if (user) {
      const eventPayload = {
        title,
        description: desc,
        location,
        ward_id: Number(wardId), // Ghi nhận ID Phường/Xã chuẩn xác vào Database
        position_type: positionType,
        benefits,
        category,
        slots_needed: parseInt(slotsNeeded) || 1,
        event_date: eventDate ? new Date(eventDate).toISOString() : null,
        end_date: endDate ? new Date(endDate).toISOString() : null,
        start_time: startTime || null,
        end_time: endTime || null,
        salary_amount: salaryAmount ? Number(salaryAmount) : 0,
        salary_type: salaryType,
        payment_method: paymentMethod,
        zalo_group_link: zaloGroupLink ? zaloGroupLink.trim() : null,
        application_deadline: applicationDeadline ? new Date(applicationDeadline).toISOString() : null
      }

      if (editingId) {
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
          alert(getUserFacingMessage(error, "Cập nhật thất bại. Vui lòng thử lại."))
        }
      } else {
        const { error } = await supabase.from("events").insert([
          { organizer_id: user.id, ...eventPayload, status: 'upcoming' }
        ])
        if (!error) {
          alert("Tạo sự kiện thành công!")
          resetForm()
          fetchMyEvents()
        } else {
          alert(getUserFacingMessage(error, "Đã xảy ra lỗi. Vui lòng thử lại."))
        }
      }
    }
    setLoading(false)
  }

  const handleEditClick = (ev: any) => {
    setEditingId(ev.id)
    setTitle(ev.title)
    setDesc(ev.description)
    setLocation(ev.location || "")
    setWardId(ev.ward_id ? String(ev.ward_id) : "") // Nạp dữ liệu Phường/Xã cũ lên form sửa
    setPositionType(ev.position_type || "Tình nguyện viên")
    setBenefits(ev.benefits || "Cấp chứng nhận")
    setCategory(ev.category || "Lễ hội Âm nhạc")
    setSlotsNeeded(String(ev.slots_needed || 1))
    setEventDate(ev.event_date ? ev.event_date.split('T')[0] : "")
    setEndDate(ev.end_date ? ev.end_date.split('T')[0] : "")
    setStartTime(ev.start_time || "07:30")
    setEndTime(ev.end_time || "17:00")
    setSalaryAmount(ev.salary_amount != null ? String(ev.salary_amount) : "0")
    setSalaryType(ev.salary_type || "per_shift")
    setPaymentMethod(ev.payment_method || "cash_after_event")
    setZaloGroupLink(ev.zalo_group_link || "")
    setApplicationDeadline(ev.application_deadline ? ev.application_deadline.split('T')[0] : "")
    setShowForm(true)
  }

  const handleDeleteEvent = async (id: string) => {
    const isConfirmed = window.confirm("🚨 BẠN CÓ CHẮC CHẮN MUỐN XÓA SỰ KIỆN NÀY?\nToàn bộ đơn đăng ký của sinh viên cũng sẽ bị xóa vĩnh viễn!")
    if (!isConfirmed) return

    const { error } = await supabase.from("events").delete().eq("id", id)
    if (error) {
      alert(getUserFacingMessage(error, "Không thể xóa. Vui lòng thử lại."))
    } else {
      alert("Đã xóa sự kiện thành công.")
      fetchMyEvents()
    }
  }

  const handleViewApplications = async (event: any) => {
    setActiveTab("candidates")
    setSelectedEventForCandidates(event)
    setLoadingApps(true)
    const { data, error } = await supabase
      .from("applications")
      .select(`
        id, status, applied_at, student_id, event_id, attendance_status, student_note,
        events (id, title, status, location, event_date, end_date, position_type, salary_amount, salary_type, start_time, end_time, zalo_group_link),
        profiles!applications_student_id_fkey (id, full_name, email, avatar_url, phone, university, bio, skills, shirt_size, height, zalo_phone, reliability_score)
      `)
      .eq("event_id", event.id)
      .order("applied_at", { ascending: false })

    if (!error && data) {
      setApplications(data)
    }
    setLoadingApps(false)
  }

  const handleBackToEvents = () => {
    setSelectedEventForCandidates(null)
    setApplications([])
    fetchMyEvents()
  }

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    const { error } = await supabase.from("applications").update({ status: newStatus }).eq("id", appId)

    if (!error) {
      setApplications((apps: any[]) => apps.map((app: any) => app.id === appId ? { ...app, status: newStatus } : app))
    } else {
      alert(getUserFacingMessage(error, "Không thể cập nhật trạng thái. Vui lòng thử lại."))
    }
  }

  const handleUpdateAttendanceStatus = async (appId: string, attendanceStatus: string) => {
    const { error } = await supabase.from("applications").update({ attendance_status: attendanceStatus }).eq("id", appId)

    if (!error) {
      setApplications((apps: any[]) => apps.map((app: any) => app.id === appId ? { ...app, attendance_status: attendanceStatus } : app))
    } else {
      alert(getUserFacingMessage(error, "Không thể cập nhật điểm danh. Vui lòng thử lại."))
    }
  }

  const handleStartChatWithStudent = async (eventId: string, studentId: string) => {
    if (!user) return

    const { data: existingChat } = await supabase
      .from("chats")
      .select("id")
      .eq("event_id", eventId)
      .eq("student_id", studentId)
      .eq("organizer_id", user.id)
      .maybeSingle()

    if (existingChat) {
      navigate(`/chat/${existingChat.id}`)
      return
    }

    const { data: newChat, error: createError } = await supabase
      .from("chats")
      .insert([
        {
          event_id: eventId,
          student_id: studentId,
          organizer_id: user.id
        }
      ])
      .select("id")
      .single()

    if (!createError && newChat) {
      navigate(`/chat/${newChat.id}`)
    } else {
      alert(getUserFacingMessage(createError, "Không thể tạo phòng chat. Vui lòng thử lại."))
    }
  }

  const totalEvents = events.length
  const activeEvents = events.filter(e => e.status === 'upcoming').length

  return {
    events,
    title,
    setTitle,
    desc,
    setDesc,
    location,
    setLocation,
    wardId, // Trả ra ngoài cho Form Modal đọc ghi nhận
    setWardId, // Tràm hàm cập nhật ID Phường Xã
    wards, // Trả danh sách toàn bộ xã phường Đà Nẵng
    positionType,
    setPositionType,
    benefits,
    setBenefits,
    category,
    setCategory,
    slotsNeeded,
    setSlotsNeeded,
    eventDate,
    setEventDate,
    endDate,
    setEndDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    salaryAmount,
    setSalaryAmount,
    salaryType,
    setSalaryType,
    paymentMethod,
    setPaymentMethod,
    zaloGroupLink,
    setZaloGroupLink,
    applicationDeadline,
    setApplicationDeadline,
    loading,
    fetching,
    showForm,
    setShowForm,
    editingId,
    viewingCV,
    setViewingCV,
    applications,
    loadingApps,
    selectedEventForCandidates,
    handleBackToEvents,
    handleSubmitEvent,
    handleEditClick,
    handleDeleteEvent,
    handleViewApplications,
    handleUpdateStatus,
    handleUpdateAttendanceStatus,
    handleStartChatWithStudent,
    resetForm,
    totalEvents,
    activeEvents,
    userId,
    activeTab,
    setActiveTab,
    isPremium,
    handleBuyPremium
  }
}
