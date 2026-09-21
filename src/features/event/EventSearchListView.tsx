"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/components/providers/AuthProvider"
import { useActiveWards, useEventCategories, useJobPositions } from "@/hooks/useLookups"
import MainLayout from "@/components/layout/MainLayout"
import JobSearchBar from "./components/EventSearchBar"
import EventCard, { JobItem } from "./components/EventCard"
import JobFilterSidebar, { JobFilterState } from "./components/EventFilterSidebar"
import Pagination from "@/components/common/Pagination"
import { Briefcase } from "lucide-react"
import { ResultCountHeader, EmptyState, ErrorState } from "@/components/common/States"
import { useSearchParams } from "@/lib/router"
import { useToast } from "@/components/providers/ToastProvider"

const ITEMS_PER_PAGE = 8

const POSITION_SLUG_MAP: Record<string, string> = {
  "mc": "MC sự kiện",
  "check-in": "Check-in",
  "hau-can": "Hậu cần",
  "le-tan": "Lễ tân",
  "dieu-phoi": "Điều phối",
  "pg-pb": "PG / PB",
  "media": "Media / Quay phim",
  "am-thanh-anh-sang": "Âm thanh ánh sáng",
  "tinh-nguyen-vien": "Tình nguyện viên",
  "an-ninh": "An ninh",
  "leader": "Trưởng nhóm"
}

interface EventSearchListProps {
  initialPosition?: string
}

export default function EventSearchList({ initialPosition }: EventSearchListProps = {}) {
  const { user, role } = useUser()
  const { showToast } = useToast()
  const userRole = user ? role || "student" : "guest"
  const [searchParams] = useSearchParams()

  // Selected position filter
  const [selectedPosition, setSelectedPosition] = useState<string>(() => initialPosition || "")

  // Master data
  const [jobs, setJobs] = useState<JobItem[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [bookmarkedEvents, setBookmarkedEvents] = useState<Record<string, boolean>>({})

  // Fetch bookmarks
  useEffect(() => {
    if (!user) {
      setBookmarkedEvents({})
      return
    }

    let isMounted = true
    const fetchBookmarks = async () => {
      const { data, error } = await supabase
        .from("event_bookmarks")
        .select("event_id")
        .eq("student_id", user.id)

      if (data && !error && isMounted) {
        const map: Record<string, boolean> = {}
        data.forEach((b: { event_id: string }) => {
          map[b.event_id] = true
        })
        setBookmarkedEvents(map)
      }
    }

    fetchBookmarks()

    return () => {
      isMounted = false
    }
  }, [user])

  const handleToggleBookmark = useCallback(async (eventId: string) => {
    if (!user) {
      showToast({
        title: "Yêu cầu đăng nhập",
        message: "Vui lòng đăng nhập để lưu sự kiện này!",
        type: "info",
      })
      return
    }

    const isCurrentlyBookmarked = !!bookmarkedEvents[eventId]
    setBookmarkedEvents((prev) => ({
      ...prev,
      [eventId]: !isCurrentlyBookmarked,
    }))

    if (isCurrentlyBookmarked) {
      const { error } = await supabase
        .from("event_bookmarks")
        .delete()
        .eq("student_id", user.id)
        .eq("event_id", eventId)

      if (error) {
        setBookmarkedEvents((prev) => ({ ...prev, [eventId]: true }))
        showToast({ title: "Lỗi", message: "Không thể bỏ lưu sự kiện.", type: "error" })
      } else {
        showToast({ title: "Đã bỏ lưu", message: "Đã xóa sự kiện khỏi danh sách đã lưu.", type: "info" })
      }
    } else {
      const { error } = await supabase
        .from("event_bookmarks")
        .insert([{ student_id: user.id, event_id: eventId }])

      if (error) {
        setBookmarkedEvents((prev) => ({ ...prev, [eventId]: false }))
        showToast({ title: "Lỗi", message: "Không thể lưu sự kiện.", type: "error" })
      } else {
        showToast({ title: "Đã lưu", message: "Đã lưu sự kiện thành công!", type: "success" })
      }
    }
  }, [user, bookmarkedEvents, showToast])

  // Lookups: Only wards that have active/valid events + categories + positions
  const { data: wards = [] } = useActiveWards()
  const { data: categories = [] } = useEventCategories()
  const { data: positions = [] } = useJobPositions()

  // Search & Filter state initialized from URL
  const [searchTerm, setSearchTerm] = useState(
    () => searchParams.get("category") || searchParams.get("search") || ""
  )
  const [selectedLocation, setSelectedLocation] = useState(
    () => searchParams.get("ward") || ""
  )

  useEffect(() => {
    if (initialPosition) {
      setSelectedPosition(initialPosition)
    }
  }, [initialPosition])

  useEffect(() => {
    const cat = searchParams.get("category") || searchParams.get("search")
    if (cat !== null) setSearchTerm(cat)
    const ward = searchParams.get("ward")
    if (ward !== null) setSelectedLocation(ward)
  }, [searchParams])

  const [sidebarFilters, setSidebarFilters] = useState<JobFilterState>({
    categories: [],
    positions: [],
    salaryTypes: [],
    paymentMethods: [],
    dateRange: "all",
    wards: [],
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)

  // 1. Fetch real jobs from Supabase events table
  useEffect(() => {
    let isMounted = true

    const fetchJobs = async () => {
      setLoading(true)
      setErrorMsg(null)

      try {
        const { data, error } = await supabase
          .from("events")
          .select(`
            id,
            title,
            category,
            position_type,
            event_date,
            start_time,
            end_time,
            location,
            salary_amount,
            salary_type,
            payment_method,
            slug,
            created_at,
            organizer_id,
            slots_needed,
            benefits,
            profiles (
              id,
              full_name,
              avatar_url,
              slug
            ),
            danang_wards (
              id,
              name
            )
          `)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Lỗi khi tải danh sách việc làm sự kiện:", error)
          if (isMounted) setErrorMsg("Không thể tải danh sách việc làm. Vui lòng thử lại sau.")
        } else if (data && isMounted) {
          setJobs(data as JobItem[])
        }
      } catch (err) {
        console.error("Lỗi kết nối Supabase:", err)
        if (isMounted) setErrorMsg("Đã xảy ra sự cố mạng. Vui lòng làm mới trang.")
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchJobs()

    return () => {
      isMounted = false
    }
  }, [])

  // 2. Reset filters handler
  const handleResetFilters = useCallback(() => {
    setSelectedPosition("")
    setSearchTerm("")
    setSelectedLocation("")
    setSidebarFilters({
      categories: [],
      positions: [],
      salaryTypes: [],
      paymentMethods: [],
      dateRange: "all",
      wards: [],
    })
    setCurrentPage(1)
  }, [])

  // 4. Filtering logic
  const filteredJobs = useMemo(() => {
    let result = [...jobs]

    // Position filter (URL slug / initialPosition)
    if (selectedPosition.trim()) {
      const posQuery = selectedPosition.toLowerCase().trim().replace(/-/g, " ")
      const mappedFriendly = POSITION_SLUG_MAP[selectedPosition.toLowerCase()]?.toLowerCase()
      result = result.filter(
        (job) =>
          job.position_type?.toLowerCase().includes(posQuery) ||
          job.title?.toLowerCase().includes(posQuery) ||
          (mappedFriendly &&
            (job.position_type?.toLowerCase().includes(mappedFriendly) ||
              job.title?.toLowerCase().includes(mappedFriendly)))
      )
    }

    // Search filter (keyword in title, category, position_type, organizer name)
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim()
      result = result.filter(
        (job) =>
          job.title?.toLowerCase().includes(query) ||
          job.category?.toLowerCase().includes(query) ||
          job.position_type?.toLowerCase().includes(query) ||
          job.profiles?.full_name?.toLowerCase().includes(query)
      )
    }

    // Location dropdown filter
    if (selectedLocation.trim()) {
      const loc = selectedLocation.toLowerCase().trim()
      result = result.filter(
        (job) =>
          job.danang_wards?.name?.toLowerCase().includes(loc) ||
          job.location?.toLowerCase().includes(loc) ||
          String(job.danang_wards?.id) === loc
      )
    }

    // Sidebar Categories filter (event_categories)
    if (sidebarFilters.categories.length > 0) {
      result = result.filter((job) =>
        job.category && sidebarFilters.categories.some((c) =>
          job.category?.toLowerCase() === c.toLowerCase()
        )
      )
    }

    // Sidebar Positions filter (job_positions)
    if (sidebarFilters.positions.length > 0) {
      result = result.filter((job) =>
        job.position_type && sidebarFilters.positions.some((p) =>
          job.position_type?.toLowerCase().includes(p.toLowerCase()) ||
          p.toLowerCase().includes(job.position_type?.toLowerCase() || "")
        )
      )
    }

    // Sidebar Salary Types filter (per_shift, per_hour, per_event, volunteer)
    if (sidebarFilters.salaryTypes.length > 0) {
      result = result.filter((job) => {
        return sidebarFilters.salaryTypes.some((s) => {
          if (s === "volunteer") return job.salary_type === "volunteer" || !job.salary_amount || job.salary_amount === 0
          return job.salary_type === s
        })
      })
    }

    // Sidebar Payment Methods filter (cash_after_event, bank_transfer, after_project)
    if (sidebarFilters.paymentMethods.length > 0) {
      result = result.filter((job) =>
        job.payment_method && sidebarFilters.paymentMethods.includes(job.payment_method)
      )
    }

    // Sidebar Date Range filter (created_at)
    if (sidebarFilters.dateRange && sidebarFilters.dateRange !== "all") {
      const now = Date.now()
      const ranges: Record<string, number> = {
        "24h": 24 * 60 * 60 * 1000,
        "3d": 3 * 24 * 60 * 60 * 1000,
        "7d": 7 * 24 * 60 * 60 * 1000,
        "14d": 14 * 24 * 60 * 60 * 1000,
      }
      const limit = ranges[sidebarFilters.dateRange]
      if (limit) {
        result = result.filter((job) => {
          if (!job.created_at) return true
          const createdAtTime = new Date(job.created_at).getTime()
          return now - createdAtTime <= limit
        })
      }
    }

    // Sidebar Wards filter (danang_wards)
    if (sidebarFilters.wards.length > 0) {
      result = result.filter((job) => {
        return sidebarFilters.wards.some((w) => {
          const wardLower = w.toLowerCase()
          return (
            job.danang_wards?.name?.toLowerCase().includes(wardLower) ||
            job.location?.toLowerCase().includes(wardLower)
          )
        })
      })
    }

    return result
  }, [jobs, searchTerm, selectedLocation, selectedPosition, sidebarFilters])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedLocation, selectedPosition, sidebarFilters])

  // Pagination calculations
  const totalItems = filteredJobs.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredJobs.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredJobs, currentPage])

  const hasActiveFilters =
    Boolean(selectedPosition) ||
    Boolean(searchTerm) ||
    Boolean(selectedLocation) ||
    sidebarFilters.categories.length > 0 ||
    sidebarFilters.positions.length > 0 ||
    sidebarFilters.salaryTypes.length > 0 ||
    sidebarFilters.paymentMethods.length > 0 ||
    (sidebarFilters.dateRange && sidebarFilters.dateRange !== "all") ||
    sidebarFilters.wards.length > 0

  return (
    <MainLayout role={userRole}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in duration-300">
        {/* HERO SECTION — Figma Discover the Best Job (node 6295:27415) */}
        <section className="text-center mb-10 sm:mb-14 space-y-4">
          <h1 className="text-2xl sm:text-[32px] font-semibold text-[#222222] tracking-tight">
            {selectedPosition ? (
              <>Tuyển Dụng Vị Trí <span className="text-[#005DDC]">{POSITION_SLUG_MAP[selectedPosition.toLowerCase()] || selectedPosition.replace(/-/g, " ").toUpperCase()}</span></>
            ) : (
              "Khám phá Việc Làm Sự Kiện Hàng Đầu"
            )}
          </h1>
          <p className="text-sm sm:text-base text-[#515151] max-w-2xl mx-auto leading-relaxed">
            Hàng trăm vị trí tuyển dụng nhân sự sự kiện, lễ hội, hội nghị và giải trí hấp dẫn với mức thù lao minh bạch tại Đà Nẵng.
          </p>

          {/* Search bar */}
          <div className="pt-2">
            <JobSearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
              wards={wards}
            />
          </div>
        </section>

        {/* MAIN BODY: SIDEBAR + RESULTS (Figma node 6295:27388) */}
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Left Sidebar Filter (Figma node 6295:27389) */}
          <JobFilterSidebar
            filters={sidebarFilters}
            onFilterChange={setSidebarFilters}
            onResetFilters={handleResetFilters}
            availableWards={wards}
            availableCategories={categories}
            availablePositions={positions}
          />

          {/* Right Cards Grid (Figma node 6295:27390) */}
          <main className="flex-1 w-full min-w-0 max-w-[920px]">
            {/* Active Position Filter Chip */}
            {selectedPosition && (
              <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-medium text-[#005DDC]">
                <span>Vị trí tuyển dụng: <strong>{POSITION_SLUG_MAP[selectedPosition.toLowerCase()] || selectedPosition.replace(/-/g, " ")}</strong></span>
                <button
                  type="button"
                  onClick={() => setSelectedPosition("")}
                  className="size-4 rounded-full bg-blue-200/70 hover:bg-blue-300 text-blue-800 flex items-center justify-center text-[11px] font-bold cursor-pointer"
                  title="Xóa lọc vị trí"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Header info / count */}
            <ResultCountHeader
              totalItems={totalItems}
              entityName="vị trí việc làm"
              hasActiveFilters={hasActiveFilters}
              onResetFilters={handleResetFilters}
            />

            {/* Content states */}
            {loading ? (
              /* Loading Skeletons */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="h-44 bg-white border border-[#ededed] rounded-[8px] p-6 animate-pulse flex gap-4"
                  >
                    <div className="w-16 h-16 rounded-[8px] bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-2.5">
                      <div className="h-3.5 bg-slate-200 rounded w-1/3" />
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-4 bg-slate-100 rounded w-16" />
                      <div className="h-3 bg-slate-100 rounded w-1/2 pt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : errorMsg ? (
              /* Error State */
              <ErrorState
                icon={<Briefcase className="w-12 h-12 text-red-400 mx-auto mb-3" />}
                message={errorMsg}
                onRetry={() => window.location.reload()}
              />
            ) : filteredJobs.length === 0 ? (
              /* Empty State */
              <EmptyState
                title="Không tìm thấy việc làm phù hợp"
                description="Không có vị trí tuyển dụng nào khớp với tiêu chí tìm kiếm hoặc bộ lọc hiện tại của bạn."
                onAction={handleResetFilters}
              />
            ) : (
              /* 2-Column Real Jobs Grid (Figma node 6295:27392) */
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paginatedJobs.map((job) => (
                    <EventCard
                      key={job.id}
                      job={job}
                      isBookmarked={!!bookmarkedEvents[job.id]}
                      onToggleBookmark={handleToggleBookmark}
                    />
                  ))}
                </div>

                {/* Pagination (Figma node 6295:27413) */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={totalItems}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </MainLayout>
  )
}
