"use client"

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import StudentHero from "@/components/dashboard/StudentHero"
import EventCard from "@/components/event/EventCard"
import QuickFilters from "@/components/QuickFilters"
import Pagination from "@/components/Pagination"
import { useStudentDashboard } from "@/hooks/useStudentDashboard"
import { useEffect } from "react"

export default function StudentDashboard() {
  const {
    navigate,
    setSearchParams,
    loadingData,
    searchTerm,
    setSearchTerm,
    benefitTerm,
    setBenefitTerm,
    activeWards,
    activeCategories,
    activeBenefits,
    wardIdTerm,
    setWardIdTerm,
    bookmarkedEvents,
    currentPage,
    setCurrentPage,
    categoryTerm,
    setCategoryTerm,
    toggleBookmark,
    filteredEvents,
    totalPages,
    itemsPerPage,
    paginatedEvents,
    totalItems,
  } = useStudentDashboard()

  // Listen for category card clicks from StudentHero
  useEffect(() => {
    const handler = (e: Event) => {
      const cat = (e as CustomEvent).detail
      setCategoryTerm(cat)
      setCurrentPage(1)
    }
    window.addEventListener("category-select", handler)
    return () => window.removeEventListener("category-select", handler)
  }, [setCategoryTerm, setCurrentPage])

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* HERO + CATEGORIES */}
      <StudentHero
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        wardIdTerm={wardIdTerm}
        setWardIdTerm={setWardIdTerm}
        activeWards={activeWards}
        totalEvents={totalItems}
      />

      {/* EVENT LIST */}
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-base font-bold text-slate-900">
            {categoryTerm ? `Sự kiện: ${categoryTerm}` : searchTerm || wardIdTerm ? "Kết quả tìm kiếm" : "Sự kiện nổi bật"}
          </h2>
          <QuickFilters
            categoryTerm={categoryTerm}
            setCategoryTerm={setCategoryTerm}
            benefitTerm={benefitTerm}
            wardIdTerm={wardIdTerm}
            setWardIdTerm={setWardIdTerm}
            wards={activeWards}
            activeCategories={activeCategories}
            activeBenefits={activeBenefits}
            setBenefitTerm={setBenefitTerm}
            setCurrentPage={setCurrentPage}
          />
        </div>

        {/* EVENT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {loadingData ? (
            <div className="col-span-full text-center py-12 text-slate-500 font-medium">Đang tải sự kiện...</div>
          ) : paginatedEvents.length === 0 ? (
            <div className="col-span-full text-center py-16 px-6 bg-white rounded-xl border border-dashed border-slate-300">
              <Search className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">Không tìm thấy kết quả</h3>
              <p className="text-slate-500 font-medium mt-1">Thử thay đổi từ khóa hoặc bộ lọc.</p>
              <Button onClick={() => { setSearchTerm(""); setBenefitTerm(""); setWardIdTerm(""); setCategoryTerm(""); setSearchParams({}); setCurrentPage(1); }} variant="link" className="text-slate-600 font-bold mt-2">Xóa bộ lọc</Button>
            </div>
          ) : (
            paginatedEvents.map((job: any, idx: number) => (
              <EventCard
                key={job.id}
                job={job}
                idx={idx}
                isBookmarked={!!bookmarkedEvents[job.id]}
                onToggleBookmark={toggleBookmark}
                onNavigateToJob={(jobId: string) => navigate(`/jobs/${jobId}`)}
              />
            ))
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          totalItems={filteredEvents.length}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  )
}
