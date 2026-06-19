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

    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)

    const [showSuggestion, setShowSuggestion] = useState(true)

    const itemsPerPage = 6

    const positionParam = searchParams.get("position") || ""
    const categoryParam = searchParams.get("category") || ""
    const filterParam = searchParams.get("filter") || ""

    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, locationTerm, benefitTerm, positionParam, categoryParam, filterParam])

    const fetchEventsAndApplications = async () => {
        setLoadingData(true)

        const { data: { user } } = await supabase.auth.getUser()
        let bookmarkedIds: string[] = []

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
                bookmarkedIds = bookmarksData.map(b => b.event_id)
            }
        }

        let query = supabase
            .from("events")
            .select("*, profiles(full_name)", { count: "exact" })

        if (searchTerm) {
            query = query.ilike("title", `%${searchTerm}%`)
        }
        if (locationTerm) {
            query = query.ilike("location", `%${locationTerm}%`)
        }
        if (positionParam) {
            query = query.eq("position_type", positionParam)
        }
        if (categoryParam) {
            query = query.eq("category", categoryParam)
        }
        if (benefitTerm) {
            query = query.eq("benefits", benefitTerm)
        }
        if (filterParam === "saved") {
            if (bookmarkedIds.length > 0) {
                query = query.in("id", bookmarkedIds)
            } else {
                query = query.eq("id", "00000000-0000-0000-0000-000000000000")
            }
        }

        const from = (currentPage - 1) * itemsPerPage
        const to = from + itemsPerPage - 1

        query = query
            .order("created_at", { ascending: false })
            .range(from, to)

        const { data: eventsData, count, error } = await query

        if (!error && eventsData) {
            setEvents(eventsData)
            if (count !== null) {
                setTotalItems(count)
                setTotalPages(Math.ceil(count / itemsPerPage) || 1)
            }
        } else if (error) {
            console.error("Lỗi fetch events server-side:", error)
        }

        setLoadingData(false)
    }

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchEventsAndApplications()
        }, 300)

        return () => clearTimeout(delayDebounceFn)
    }, [searchTerm, locationTerm, benefitTerm, searchParams, currentPage])

    const handleApply = async (eventId: string, _organizerId?: string, _eventTitle?: string) => {
        setApplyingId(eventId)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode: "login" } }))
            setApplyingId(null)
            return
        }

        const targetEvent = events.find(e => e.id === eventId)
        if (targetEvent) {
            const isPastDeadline = targetEvent.application_deadline ? new Date() > new Date(targetEvent.application_deadline) : false;
            const isClosed = targetEvent.status !== 'upcoming';

            if (isPastDeadline || isClosed) {
                alert(isPastDeadline ? "🚨 Rất tiếc, chiến dịch tuyển dụng này đã quá hạn nhận hồ sơ ứng tuyển!" : "🚨 Ban tổ chức sự kiện này đã đóng cổng nhận hồ sơ ứng tuyển!")
                setApplyingId(null)
                return
            }
        }

        const { error: appError } = await supabase.from("applications").insert([
            { event_id: eventId, student_id: user.id }
        ])

        if (!appError) {
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

    const filteredEvents = { length: totalItems }
    const paginatedEvents = events

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
        paginatedEvents,
        totalItems
    }
}