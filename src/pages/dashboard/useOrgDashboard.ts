import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { supabase } from "@/lib/supabase"

export function useOrgDashboard() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [events, setEvents] = useState<any[]>([])

    // Cấu trúc form dữ liệu nâng cao + Trường ngày tháng mới
    const [title, setTitle] = useState("")
    const [desc, setDesc] = useState("")
    const [location, setLocation] = useState("")
    const [positionType, setPositionType] = useState("Tình nguyện viên")
    const [benefits, setBenefits] = useState("Cấp chứng nhận")
    const [category, setCategory] = useState("Lễ hội Âm nhạc")
    const [slotsNeeded, setSlotsNeeded] = useState("1")
    const [eventDate, setEventDate] = useState("")
    const [applicationDeadline, setApplicationDeadline] = useState("")

    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)

    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    const [selectedEvent, setSelectedEvent] = useState<any | null>(null)
    const [applications, setApplications] = useState<any[]>([])
    const [loadingApps, setLoadingApps] = useState(false)
    const [viewingCV, setViewingCV] = useState<any | null>(null)

    // STATE CHO QUẢN LÝ ỨNG VIÊN CHUYÊN BIỆT
    const [allApplications, setAllApplications] = useState<any[]>([])
    const [loadingAllApps, setLoadingAllApps] = useState(false)
    const [selectedFilterEventId, setSelectedFilterEventId] = useState<string>("all")

    const activeTab = searchParams.get("tab") || "events"

    const fetchMyEvents = async () => {
        setFetching(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
            .from("events")
            .select("*")
            .eq("organizer_id", user.id)
            .order("created_at", { ascending: false })

        if (!error && data) {
            setEvents(data)
            if (activeTab === "applications") {
                fetchAllApplications(data)
            }
        }
        setFetching(false)
    }

    const fetchAllApplications = async (eventList = events) => {
        if (eventList.length === 0) {
            setAllApplications([])
            return
        }
        setLoadingAllApps(true)
        const eventIds = eventList.map(e => e.id)
        
        const { data, error } = await supabase
            .from("applications")
            .select(`
                id, status, applied_at, student_id, event_id,
                events (id, title),
                profiles!applications_student_id_fkey (id, full_name, email, avatar_url, phone, university, bio, skills)
            `)
            .in("event_id", eventIds)
            .order("applied_at", { ascending: false })

        if (!error && data) {
            setAllApplications(data)
        }
        setLoadingAllApps(false)
    }

    useEffect(() => {
        fetchMyEvents()
    }, [activeTab])

    useEffect(() => {
        if (searchParams.get("action") === "create") {
            setShowForm(true)
        }
    }, [searchParams])

    const resetForm = () => {
        setTitle("")
        setDesc("")
        setLocation("")
        setPositionType("Tình nguyện viên")
        setBenefits("Cấp chứng nhận")
        setCategory("Lễ hội Âm nhạc")
        setSlotsNeeded("1")
        setEventDate("")
        setApplicationDeadline("")
        setEditingId(null)
        setShowForm(false)
        setSearchParams({})
    }

    const handleSubmitEvent = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !desc || !location || !eventDate || !applicationDeadline) {
            alert("Vui lòng điền đầy đủ thông tin và chọn thời hạn!")
            return
        }
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const eventPayload = {
                title,
                description: desc,
                location,
                position_type: positionType,
                benefits,
                category,
                slots_needed: parseInt(slotsNeeded) || 1,
                event_date: eventDate ? new Date(eventDate).toISOString() : null,
                application_deadline: applicationDeadline ? new Date(applicationDeadline).toISOString() : null
            }

            if (editingId) {
                // UPDATE
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
                // INSERT
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
        setLocation(ev.location)
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
        setSelectedEvent(event)
        setLoadingApps(true)
        const { data, error } = await supabase
            .from("applications")
            .select(`
                id, status, applied_at, student_id, 
                profiles!applications_student_id_fkey (id, full_name, email, avatar_url, phone, university, bio, skills)
            `)
            .eq("event_id", event.id)
            .order("applied_at", { ascending: false })

        if (!error && data) setApplications(data)
        setLoadingApps(false)
    }

    const handleUpdateStatus = async (appId: string, newStatus: string) => {
        const { error } = await supabase.from("applications").update({ status: newStatus }).eq("id", appId)

        if (!error) {
            setApplications(apps => apps.map(app => app.id === appId ? { ...app, status: newStatus } : app))
            setAllApplications(apps => apps.map(app => app.id === appId ? { ...app, status: newStatus } : app))
        } else {
            alert("Lỗi khi cập nhật trạng thái: " + error.message)
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
        selectedEvent,
        setSelectedEvent,
        applications,
        loadingApps,
        viewingCV,
        setViewingCV,
        allApplications,
        loadingAllApps,
        selectedFilterEventId,
        setSelectedFilterEventId,
        activeTab,
        handleSubmitEvent,
        handleEditClick,
        handleDeleteEvent,
        handleViewApplications,
        handleUpdateStatus,
        resetForm,
        totalEvents,
        activeEvents
    }
}
