import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"

export function useOrgDashboard() {
    const navigate = useNavigate()
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

    // [MỚI] State lưu trữ danh mục Phường/Xã phục vụ Tạo sự kiện mới
    const [wards, setWards] = useState<any[]>([])
    const [wardId, setWardId] = useState("")

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
    const [isPremium, setIsPremium] = useState<boolean>(() => {
        return localStorage.getItem("em_premium_recruiter") === "true"
    })

    const setActiveTab = (tab: string) => {
        setActiveTabState(tab)
        setSearchParams({ tab })
    }

    const handleBuyPremium = () => {
        setIsPremium(true)
        localStorage.setItem("em_premium_recruiter", "true")
    }

    const togglePremium = () => {
        const newVal = !isPremium
        setIsPremium(newVal)
        localStorage.setItem("em_premium_recruiter", String(newVal))
    }


    const [dbPositions, setDbPositions] = useState<string[]>([])
    const [dbCategories, setDbCategories] = useState<string[]>([])

    // [MỚI] Nạp toàn bộ danh sách Phường/Xã, Vị trí và Danh mục từ Database lên khi mở trang quản trị
    useEffect(() => {
        const fetchInitialData = async () => {
            const { data } = await supabase
                .from("danang_wards")
                .select("*")
                .order("name", { ascending: true })
            if (data) setWards(data)

            const { data: posData } = await supabase
                .from("job_positions")
                .select("name")
                .order("name", { ascending: true })
            if (posData && posData.length > 0) {
                const names = posData.map(p => p.name)
                setDbPositions(names)
                setPositionType(names[0])
            }

            const { data: catData } = await supabase
                .from("event_categories")
                .select("name")
                .order("name", { ascending: true })
            if (catData && catData.length > 0) {
                const names = catData.map(c => c.name)
                setDbCategories(names)
                setCategory(names[0])
            }
        }
        fetchInitialData()
    }, [])

    const fetchMyEvents = async () => {
        setFetching(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        setUserId(user.id)

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
        fetchMyEvents()
    }, [])

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
        const { data: { user } } = await supabase.auth.getUser()

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
                    alert("Lỗi khi cập nhật: " + error.message)
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
                    alert("Lỗi: " + error.message)
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
        setApplicationDeadline(ev.application_deadline ? ev.application_deadline.split('T')[0] : "")
        setShowForm(true)
    }

    const handleDeleteEvent = async (id: string) => {
        const isConfirmed = window.confirm("🚨 BẠN CÓ CHẮC CHẮN MUỐN XÓA SỰ KIỆN NÀY?\nToàn bộ đơn ứng tuyển của sinh viên cũng sẽ bị xóa vĩnh viễn!")
        if (!isConfirmed) return

        const { error } = await supabase.from("events").delete().eq("id", id)
        if (error) {
            alert("Lỗi khi xóa: " + error.message)
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
                id, status, applied_at, student_id, event_id,
                events (id, title, status, location, event_date, position_type),
                profiles!applications_student_id_fkey (id, full_name, email, avatar_url, phone, university, bio, skills)
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
            alert("Lỗi khi cập nhật trạng thái: " + error.message)
        }
    }

    const handleStartChatWithStudent = async (eventId: string, studentId: string) => {
        const { data: { user } } = await supabase.auth.getUser()
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
            alert("Lỗi khi tạo phòng chat: " + (createError?.message || "Lỗi không xác định"))
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
        wardId,        // Trả ra ngoài cho Form Modal đọc ghi nhận
        setWardId,     // Tràm hàm cập nhật ID Phường Xã
        wards,         // Trả danh sách toàn bộ xã phường Đà Nẵng
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
        handleStartChatWithStudent,
        resetForm,
        totalEvents,
        activeEvents,
        userId,
        activeTab,
        setActiveTab,
        isPremium,
        handleBuyPremium,
        togglePremium
    }
}