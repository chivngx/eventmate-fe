import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { supabase } from "@/lib/supabase"

export function useStudentDashboard() {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const [events, setEvents] = useState<any[]>([])
    const [myApplications, setMyApplications] = useState<Record<string, string>>({})
    const [applyingId, setApplyingId] = useState<string | null>(null)
    const [loadingData, setLoadingData] = useState(true)

    const [userProfile, setUserProfile] = useState<any>(null)
    const [cvProgress, setCvProgress] = useState(0)

    const [searchTerm, setSearchTerm] = useState("")
    const [locationTerm, setLocationTerm] = useState("")
    const [benefitTerm, setBenefitTerm] = useState("")

    const [bookmarkedEvents, setBookmarkedEvents] = useState<Record<string, boolean>>({})
    const [currentPage, setCurrentPage] = useState(1)
    const [showSuggestion, setShowSuggestion] = useState(true)

    // Đọc các bộ lọc truyền từ Mega Menu điều hướng xuống URL
    const positionParam = searchParams.get("position") || ""
    const categoryParam = searchParams.get("category") || ""
    const filterParam = searchParams.get("filter") || ""

    const fetchEventsAndApplications = async () => {
        setLoadingData(true)

        const { data: eventsData } = await supabase
            .from("events")
            .select("*, profiles(full_name)")
            .order("created_at", { ascending: false })

        if (eventsData) setEvents(eventsData)

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: profileData } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .maybeSingle()

            if (profileData) {
                setUserProfile(profileData)
                let score = 0
                if (profileData.full_name) score += 20
                if (profileData.avatar_url) score += 20
                if (profileData.phone) score += 20
                if (profileData.university) score += 20
                if (profileData.skills) score += 20
                setCvProgress(score)
            }

            const { data: appsData } = await supabase
                .from("applications")
                .select("event_id, status")
                .eq("student_id", user.id)

            if (appsData) {
                const appMap: Record<string, string> = {}
                appsData.forEach(app => { appMap[app.event_id] = app.status })
                setMyApplications(appMap)
            }

            const { data: bookmarksData } = await supabase
                .from("event_bookmarks")
                .select("event_id")
                .eq("student_id", user.id)

            if (bookmarksData) {
                const bookmarkMap: Record<string, boolean> = {}
                bookmarksData.forEach(b => { bookmarkMap[b.event_id] = true })
                setBookmarkedEvents(bookmarkMap)
            }
        }

        setLoadingData(false)
    }

    useEffect(() => {
        fetchEventsAndApplications()
    }, [searchParams])

    // ĐÃ SỬA: Thêm dấu gạch dưới _organizerId và _eventTitle để tránh lỗi TS6133 khi dọn dẹp lệnh notify thủ công
    const handleApply = async (eventId: string, _organizerId?: string, _eventTitle?: string) => {
        setApplyingId(eventId)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode: "login" } }))
            setApplyingId(null)
            return
        }

        const { error: appError } = await supabase.from("applications").insert([
            { event_id: eventId, student_id: user.id }
        ])

        if (!appError) {
            // ĐÃ XÓA: Khối lệnh insert thông báo thủ công tại đây vì Database Trigger đã gánh trọn vẹn tự động!
            setMyApplications(prev => ({ ...prev, [eventId]: 'pending' }))
        } else {
            alert("Lỗi: " + appError.message)
        }
        setApplyingId(null)
    }

    const toggleBookmark = async (eventId: string) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode: "login" } }))
            return
        }

        const isCurrentlyBookmarked = !!bookmarkedEvents[eventId]

        if (isCurrentlyBookmarked) {
            const { error } = await supabase
                .from("event_bookmarks")
                .delete()
                .eq("student_id", user.id)
                .eq("event_id", eventId)

            if (!error) setBookmarkedEvents(prev => ({ ...prev, [eventId]: false }))
        } else {
            const { error } = await supabase
                .from("event_bookmarks")
                .insert([{ student_id: user.id, event_id: eventId }])

            if (!error) setBookmarkedEvents(prev => ({ ...prev, [eventId]: true }))
        }
    }

    const clearParamFilter = (paramName: string) => {
        searchParams.delete(paramName)
        setSearchParams(searchParams)
        setCurrentPage(1)
    }

    const firstName = userProfile?.full_name ? userProfile.full_name.split(' ').pop() : "bạn mới"

    // LOGIC LỌC TÍCH HỢP ĐỘNG
    const filteredEvents = events.filter(job => {
        const matchesSearch = searchTerm === "" ||
            job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesLocation = locationTerm === "" ||
            (job.location && job.location.toLowerCase().includes(locationTerm.toLowerCase()));

        const matchesPosition = positionParam === "" ||
            (job.position_type && job.position_type === positionParam);

        const matchesCategory = categoryParam === "" ||
            (job.category && job.category === categoryParam);

        const matchesSaved = filterParam !== "saved" || !!bookmarkedEvents[job.id];

        const matchesBenefit = benefitTerm === "" ||
            (job.benefits && job.benefits === benefitTerm);

        return matchesSearch && matchesLocation && matchesPosition && matchesCategory && matchesSaved && matchesBenefit;
    })

    const itemsPerPage = 6
    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage) || 1
    const paginatedEvents = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    return {
        navigate,
        searchParams,
        setSearchParams,
        events,
        myApplications,
        applyingId,
        loadingData,
        userProfile,
        cvProgress,
        searchTerm,
        setSearchTerm,
        locationTerm,
        setLocationTerm,
        benefitTerm,
        setBenefitTerm,
        bookmarkedEvents,
        currentPage,
        setCurrentPage,
        showSuggestion,
        setShowSuggestion,
        positionParam,
        categoryParam,
        filterParam,
        handleApply,
        toggleBookmark,
        clearParamFilter,
        firstName,
        filteredEvents,
        totalPages,
        itemsPerPage,
        paginatedEvents
    }
}