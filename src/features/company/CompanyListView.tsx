"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/components/providers/AuthProvider"
import { useWards, useEventCategories } from "@/hooks/useLookups"
import MainLayout from "@/components/layout/MainLayout"
import CompanyCard, { OrganizerProfile } from "./components/CompanyCard"
import CompanySearchBar, { QuickFilterType } from "./components/CompanySearchBar"
import CompanyFilterSidebar, { FilterState } from "./components/CompanyFilterSidebar"
import Pagination from "@/components/common/Pagination"
import { Building2 } from "lucide-react"
import { ResultCountHeader, EmptyState, ErrorState } from "@/components/common/States"
import { useToast } from "@/components/providers/ToastProvider"

const ITEMS_PER_PAGE = 6

export default function CompanyList() {
  const { user, role } = useUser()
  const { showToast } = useToast()
  const userRole = user ? role || "student" : "guest"

  // Master data
  const [organizers, setOrganizers] = useState<OrganizerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Lookups
  const { data: wards = [] } = useWards()
  const { data: categories = [] } = useEventCategories()

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [sidebarFilters, setSidebarFilters] = useState<FilterState>({
    onlyHiring: false,
    verifiedOnly: false,
    categories: [],
    sortBy: "popular",
  })

  // Followed company state (synced with Supabase public.company_follows)
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({})

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)

  // 1. Fetch real organizer profiles from Supabase (No mock data)
  useEffect(() => {
    let isMounted = true

    const fetchOrganizers = async () => {
      setLoading(true)
      setErrorMsg(null)

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select(`
            id,
            full_name,
            avatar_url,
            bio,
            slug,
            university,
            email,
            phone,
            scale,
            address,
            reliability_score,
            is_verified,
            is_premium,
            premium_until,
            events (
              id,
              title,
              status,
              category,
              ward_id,
              location,
              danang_wards (
                id,
                name
              )
            )
          `)
          .eq("role", "organizer")

        if (error) {
          console.error("Lỗi khi tải danh sách ban tổ chức:", error)
          if (isMounted) setErrorMsg("Không thể tải danh sách Ban tổ chức. Vui lòng thử lại sau.")
        } else if (data && isMounted) {
          setOrganizers(data as OrganizerProfile[])
        }
      } catch (err) {
        console.error("Lỗi kết nối Supabase:", err)
        if (isMounted) setErrorMsg("Đã xảy ra sự cố mạng. Vui lòng làm mới trang.")
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchOrganizers()

    return () => {
      isMounted = false
    }
  }, [])

  // 2. Fetch followed organizers from Supabase
  useEffect(() => {
    if (!user) {
      setBookmarkedIds({})
      return
    }

    let isMounted = true
    const fetchFollows = async () => {
      const { data, error } = await supabase
        .from("company_follows")
        .select("organizer_id")
        .eq("user_id", user.id)

      if (data && !error && isMounted) {
        const map: Record<string, boolean> = {}
        data.forEach((f: { organizer_id: string }) => {
          map[f.organizer_id] = true
        })
        setBookmarkedIds(map)
      }
    }

    fetchFollows()

    return () => {
      isMounted = false
    }
  }, [user])

  const handleToggleBookmark = useCallback(async (id: string) => {
    if (!user) {
      showToast({
        title: "Yêu cầu đăng nhập",
        message: "Vui lòng đăng nhập để theo dõi ban tổ chức này!",
        type: "info",
      })
      return
    }

    const isCurrentlyFollowed = !!bookmarkedIds[id]
    setBookmarkedIds((prev) => ({
      ...prev,
      [id]: !isCurrentlyFollowed,
    }))

    if (isCurrentlyFollowed) {
      const { error } = await supabase
        .from("company_follows")
        .delete()
        .eq("user_id", user.id)
        .eq("organizer_id", id)

      if (error) {
        setBookmarkedIds((prev) => ({ ...prev, [id]: true }))
        showToast({ title: "Lỗi", message: "Không thể bỏ theo dõi ban tổ chức.", type: "error" })
      } else {
        showToast({ title: "Đã bỏ theo dõi", message: "Đã xóa ban tổ chức khỏi danh sách theo dõi.", type: "info" })
      }
    } else {
      const { error } = await supabase
        .from("company_follows")
        .insert([{ user_id: user.id, organizer_id: id }])

      if (error) {
        setBookmarkedIds((prev) => ({ ...prev, [id]: false }))
        showToast({ title: "Lỗi", message: "Không thể theo dõi ban tổ chức.", type: "error" })
      } else {
        showToast({ title: "Đã theo dõi", message: "Đã lưu ban tổ chức vào danh sách theo dõi!", type: "success" })
      }
    }
  }, [user, bookmarkedIds, showToast])

  // 3. Reset filters handler
  const handleResetFilters = useCallback(() => {
    setSearchTerm("")
    setSelectedLocation("")
    setSidebarFilters({
      onlyHiring: false,
      verifiedOnly: false,
      categories: [],
      sortBy: "popular",
    })
    setCurrentPage(1)
  }, [])

  // 4. Filtering and Sorting logic on real data
  const filteredOrganizers = useMemo(() => {
    let result = [...organizers]

    // Search filter (keyword in name, bio, university, address, or organized event titles)
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim()
      result = result.filter(
        (org) =>
          org.full_name?.toLowerCase().includes(query) ||
          org.bio?.toLowerCase().includes(query) ||
          org.university?.toLowerCase().includes(query) ||
          org.address?.toLowerCase().includes(query) ||
          org.events?.some((e) => e.title?.toLowerCase().includes(query))
      )
    }

    // Location dropdown filter
    if (selectedLocation.trim()) {
      const loc = selectedLocation.toLowerCase().trim()
      result = result.filter(
        (org) =>
          org.address?.toLowerCase().includes(loc) ||
          org.university?.toLowerCase().includes(loc) ||
          org.events?.some(
            (e) =>
              e.danang_wards?.name?.toLowerCase().includes(loc) ||
              e.location?.toLowerCase().includes(loc) ||
              String(e.ward_id) === loc
          )
      )
    }

    // Sidebar hiring filter
    if (sidebarFilters.onlyHiring) {
      result = result.filter((org) =>
        org.events?.some(
          (e) => e.status === "upcoming" || e.status === "ongoing"
        )
      )
    }

    // Sidebar verified filter
    if (sidebarFilters.verifiedOnly) {
      result = result.filter((org) => Boolean(org.is_verified))
    }

    // Sidebar categories filter
    if (sidebarFilters.categories.length > 0) {
      result = result.filter((org) =>
        org.events?.some(
          (e) =>
            e.category &&
            sidebarFilters.categories.some(
              (c) => e.category?.toLowerCase() === c.toLowerCase()
            )
        )
      )
    }


    // Quick filter sorting
    switch (sidebarFilters.sortBy) {
      case "popular":
        result.sort((a, b) => {
          const scoreA = (a.events?.length || 0) * 10 + (a.reliability_score || 80)
          const scoreB = (b.events?.length || 0) * 10 + (b.reliability_score || 80)
          return scoreB - scoreA
        })
        break
      case "most_events":
        result.sort((a, b) => (b.events?.length || 0) - (a.events?.length || 0))
        break
      case "top_rated":
        result.sort(
          (a, b) => (b.reliability_score || 0) - (a.reliability_score || 0)
        )
        break
      case "viewed":
      default:
        // Keep natural ordering
        break
    }

    return result
  }, [organizers, searchTerm, selectedLocation, sidebarFilters])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedLocation, sidebarFilters])

  // Pagination calculations
  const totalItems = filteredOrganizers.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const paginatedOrganizers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredOrganizers.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredOrganizers, currentPage])

  const hasActiveFilters =
    Boolean(searchTerm) ||
    Boolean(selectedLocation) ||
    sidebarFilters.onlyHiring ||
    sidebarFilters.verifiedOnly ||
    sidebarFilters.categories.length > 0 ||
    sidebarFilters.sortBy !== "popular"

  return (
    <MainLayout role={userRole} fullWidth className="bg-[#f3f5f7]">
      <div className="w-full bg-[#f3f5f7] min-h-[calc(100vh-80px)] py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
          {/* HERO SECTION — Figma Discover the Best Workplaces (node 5875:24876) */}
        <section className="text-center mb-10 sm:mb-14 space-y-4">
          <h1 className="text-2xl sm:text-[32px] font-semibold text-[#222222] tracking-tight">
            Khám phá Ban Tổ Chức & Doanh Nghiệp
          </h1>
          <p className="text-sm sm:text-base text-[#515151] max-w-2xl mx-auto leading-relaxed">
            Kết nối với các nhà tổ chức sự kiện chuyên nghiệp, doanh nghiệp truyền thông uy tín và các câu lạc bộ hàng đầu tại Đà Nẵng.
          </p>

          {/* Search bar & quick filters */}
          <div className="pt-2">
            <CompanySearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
              wards={wards}
            />
          </div>
        </section>

        {/* MAIN BODY: SIDEBAR + RESULTS (Figma node 5875:24885) */}
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Left Sidebar Filter (Figma node 5875:24886) */}
          <CompanyFilterSidebar
            filters={sidebarFilters}
            onFilterChange={setSidebarFilters}
            onResetFilters={handleResetFilters}
            availableCategories={categories}
          />

          {/* Right Cards Content (Figma node 5875:24887) */}
          <main className="flex-1 w-full min-w-0 max-w-[920px]">
            {/* Header info / count */}
            <ResultCountHeader
              totalItems={totalItems}
              entityName="đơn vị tổ chức"
              hasActiveFilters={hasActiveFilters}
              onResetFilters={handleResetFilters}
            />

            {/* Content states */}
            {loading ? (
              /* Loading Skeletons */
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="h-32 bg-white border border-[#ededed] rounded-[8px] p-6 animate-pulse flex items-center gap-5"
                  >
                    <div className="w-[84px] h-[84px] rounded-[4px] bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-slate-200 rounded w-1/3" />
                      <div className="h-4 bg-slate-100 rounded w-2/3" />
                      <div className="flex gap-2">
                        <div className="h-5 bg-slate-100 rounded w-16" />
                        <div className="h-5 bg-slate-100 rounded w-20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : errorMsg ? (
              /* Error State */
              <ErrorState
                icon={<Building2 className="w-12 h-12 text-red-400 mx-auto mb-3" />}
                message={errorMsg}
                onRetry={() => window.location.reload()}
              />
            ) : filteredOrganizers.length === 0 ? (
              /* Empty State */
              <EmptyState
                title="Không tìm thấy Ban tổ chức nào"
                description="Không có đơn vị nào khớp với tiêu chí tìm kiếm hoặc bộ lọc hiện tại của bạn."
                onAction={handleResetFilters}
              />
            ) : (
              /* Real Organizers List */
              <div className="space-y-4">
                {paginatedOrganizers.map((org) => (
                  <CompanyCard
                    key={org.id}
                    organizer={org}
                    isBookmarked={!!bookmarkedIds[org.id]}
                    onToggleBookmark={handleToggleBookmark}
                  />
                ))}

                {/* Pagination (Figma node 5875:24895) */}
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
