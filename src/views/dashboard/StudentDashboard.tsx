"use client"

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import StudentHero from "@/components/dashboard/StudentHero"
import EventCard from "@/components/event/EventCard"
import QuickFilters from "@/components/QuickFilters"
import Pagination from "@/components/Pagination"
import { useStudentDashboard } from "@/hooks/useStudentDashboard"
import { useEventCategories } from "@/hooks/use-lookups"
import { Calendar, Music, Trophy, Compass, Landmark, Cpu, Users2 } from "lucide-react"

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Lễ hội Âm nhạc": Music,
  "Hội thảo / Workshop": Users2,
  "Giải đấu Thể thao": Trophy,
  "Giao lưu Văn hóa": Compass,
  "Triển lãm / Hội chợ": Landmark,
  "Sự kiện Công nghệ": Cpu,
}

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

  const { data: categories = [] } = useEventCategories()

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* 1. HERO + STATS + SEARCH */}
      <StudentHero
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        wardIdTerm={wardIdTerm}
        setWardIdTerm={setWardIdTerm}
        activeWards={activeWards}
        totalEvents={totalItems}
      />

      {/* 2. CATEGORY CARDS — event discovery feel */}
      {!searchTerm && !wardIdTerm && !categoryTerm && (
        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-3">Khám phá theo loại sự kiện</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat: any) => {
              const Icon = CATEGORY_ICONS[cat.name] || Calendar
              const slug = cat.slug || cat.name
              return (
                <button
                  key={slug}
                  onClick={() => {
                    setCategoryTerm(cat.name)
                    setCurrentPage(1)
                  }}
                  className="flex flex-col items-center gap-2 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center transition-colors">
                    <Icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <span className="text-xs font-medium text-slate-600 text-center leading-tight">{cat.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 3. FILTERS + EVENT GRID */}
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-sm font-bold text-slate-900">
            {categoryTerm ? `Sự kiện: ${categoryTerm}` : "Tất cả sự kiện"}
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
