"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/components/providers/AuthProvider"
import { useActiveWards, useEventCategories, useJobPositions } from "@/hooks/useLookups"
import MainLayout from "@/components/layout/MainLayout"
import HeroSearchBanner from "@/features/home/components/HeroSearchBanner"
import EventCard, { JobItem } from "./components/EventCard"
import JobFilterSidebar, { JobFilterState } from "./components/EventFilterSidebar"
import Pagination from "@/components/common/Pagination"
import { Briefcase } from "lucide-react"
import { ResultCountHeader, EmptyState, ErrorState } from "@/components/common/States"
import { useSearchParams } from "@/lib/router"
import Breadcrumb from "@/components/common/Breadcrumb"

const ITEMS_PER_PAGE = 8


interface EventSearchListProps {
  initialPosition?: string
}

export default function EventSearchList({ initialPosition }: EventSearchListProps = {}) {
  const { user, role } = useUser()
  const userRole = user ? role || "student" : "guest"
  const [searchParams] = useSearchParams()

  // Selected position filter
  const [selectedPosition, setSelectedPosition] = useState<string>(() => initialPosition || "")

  // Master data
  const [jobs, setJobs] = useState<JobItem[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Lookups: Only wards that have active/valid events + categories + positions
  const { data: wards = [] } = useActiveWards()
  const { data: categories = [] } = useEventCategories()
  const { data: positions = [] } = useJobPositions()

  // Dynamically resolve position slug/name from DB job_positions
  const getPositionName = useCallback(
    (slugOrName: string) => {
      if (!slugOrName) return ""
      const query = slugOrName.toLowerCase().trim()
      const matched = positions.find(
        (p) => p.slug?.toLowerCase() === query || p.name?.toLowerCase() === query
      )
      if (matched) return matched.name
      return slugOrName.replace(/-/g, " ")
    },
    [positions]
  )

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
            is_urgent,
            is_featured,
            bumped_at,
            plan_tier,
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
          .is("deleted_at", null)
          .order("is_featured", { ascending: false, nullsFirst: false })
          .order("is_urgent", { ascending: false, nullsFirst: false })
          .order("bumped_at", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Lỗi khi tải danh sách việc làm sự kiện:", error)
          if (isMounted) setErrorMsg("Không thể tải danh sách việc làm. Vui lòng thử lại sau.")
        } else if (data && isMounted) {
          // Lọc các tin miễn phí đã quá hạn 7 ngày hiển thị
          const now = Date.now()
          const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
          const activeJobs = (data as any[]).filter((job) => {
            if (job.plan_tier === "free" && job.created_at) {
              const age = now - new Date(job.created_at).getTime()
              if (age > SEVEN_DAYS_MS) return false
            }
            return true
          })
          setJobs(activeJobs as JobItem[])
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
      const mappedFriendly = getPositionName(selectedPosition).toLowerCase()
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

  const handleHeroSearch = (term?: string, ward?: string, category?: string) => {
    if (typeof term === "string") setSearchTerm(term)
    if (typeof ward === "string") setSelectedLocation(ward)
    if (category) {
      setSidebarFilters((prev) => ({
        ...prev,
        positions: prev.positions.includes(category)
          ? prev.positions
          : [...prev.positions, category],
      }))
    }
  }

  return (
    <MainLayout role={userRole} fullWidth className="bg-[#F2F6FC]">
      {/* Hero Banner with events-specific title */}
      <HeroSearchBanner
        title={
          selectedPosition ? (
            <>
              Tuyển Dụng Vị Trí{" "}
              <span className="underline decoration-white/70 underline-offset-6">
                {getPositionName(selectedPosition)}
              </span>
            </>
          ) : (
            "Khám Phá Việc Làm Sự Kiện Hàng Đầu"
          )
        }
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        wardIdTerm={selectedLocation}
        setWardIdTerm={setSelectedLocation}
        activeWards={wards}
        onSearch={handleHeroSearch}
      />

      <div className="w-full min-h-[calc(100vh-80px)] pt-10 sm:pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
          {selectedPosition && (
            <div className="mb-6">
              <Breadcrumb
                items={[
                  { label: "Việc làm", href: "/events" },
                  {
                    label: getPositionName(selectedPosition),
                  },
                ]}
              />
            </div>
          )}

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
              events={jobs}
              isLoading={loading}
            />

            {/* Right Cards Grid (Figma node 6295:27390) */}
            <main className="flex-1 w-full min-w-0 max-w-[920px]">
              {/* Active Position Filter Chip */}
              {selectedPosition && (
                <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-900">
                  <span>Vị trí tuyển dụng: <strong>{getPositionName(selectedPosition)}</strong></span>
                  <button
                    type="button"
                    onClick={() => setSelectedPosition("")}
                    className="size-4 rounded-full bg-zinc-200 hover:bg-zinc-300 text-zinc-800 flex items-center justify-center text-[11px] font-bold cursor-pointer"
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
                      className="w-full min-h-[192px] p-4 bg-white rounded-[16px] border border-[#e8e8e8] animate-pulse flex gap-3 items-start"
                    >
                      <div className="size-[56px] min-w-[56px] rounded-[6px] bg-gray-100 shrink-0" />
                      <div className="flex-1 space-y-2.5">
                        <div className="h-4 bg-gray-100 rounded w-20" />
                        <div className="h-4 bg-gray-100 rounded w-4/5" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                        <div className="h-4 bg-gray-100 rounded w-1/3" />
                        <div className="h-3 bg-gray-100 rounded w-2/3" />
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
      </div>
    </MainLayout>
  )
}
