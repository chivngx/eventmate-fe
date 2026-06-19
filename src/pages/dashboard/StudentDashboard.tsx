import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import StudentHero from "@/components/dashboard/StudentHero"
import EventCard from "@/components/dashboard/EventCard"
import CVSuggestionCard from "@/components/dashboard/CVSuggestionCard"
import QuickFilters from "@/components/dashboard/QuickFilters"
import Pagination from "@/components/dashboard/Pagination"
import TrendingCategoriesSlider from "@/components/dashboard/TrendingCategoriesSlider"
import FeaturedOrganizers from "@/components/dashboard/FeaturedOrganizers"
import { useStudentDashboard } from "./useStudentDashboard"

export default function StudentDashboard() {
    const {
        navigate,
        setSearchParams,
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
        myApplications,
        events
    } = useStudentDashboard()

    return (
        <div className="space-y-8 pb-10 animate-in fade-in duration-300">
            {/* 1. BANNER PHẲNG & TÌM KIẾM */}
            <StudentHero
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                locationTerm={locationTerm}
                setLocationTerm={setLocationTerm}
            />

            {/* DANH MỤC NỔI BẬT KHỔ RỘNG */}
            <TrendingCategoriesSlider
                events={events}
                setCurrentPage={setCurrentPage}
            />

            {/* 2. BỐ CỤC NỘI DUNG */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

                {/* CỘT CHÍNH */}
                <div className="space-y-6 lg:col-span-8">
                    <div className="bg-white rounded-2xl border-2 border-slate-100 p-5 space-y-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                                    {filterParam === 'saved' ? "Việc làm đã lưu ❤️" : <>Việc làm <span className="text-emerald-600">tốt nhất</span></>}
                                </h2>
                                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                                    ⚡ Đề xuất bởi EventMate AI
                                </span>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-4">
                                <button
                                    onClick={() => {
                                        setSearchTerm("")
                                        setLocationTerm("")
                                        setBenefitTerm("")
                                        setSearchParams({})
                                        setCurrentPage(1)
                                    }}
                                    className="text-xs font-extrabold text-slate-500 hover:text-emerald-600 transition-colors"
                                >
                                    Xem tất cả
                                </button>
                                <div className="flex items-center gap-1">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 disabled:opacity-50 disabled:hover:text-slate-400 disabled:hover:border-slate-200 transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 disabled:opacity-50 disabled:hover:text-slate-400 disabled:hover:border-slate-200 transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* BỘ LỌC NHANH & ACTIVE BADGES */}
                        <QuickFilters
                            filterParam={filterParam}
                            positionParam={positionParam}
                            categoryParam={categoryParam}
                            benefitTerm={benefitTerm}
                            locationTerm={locationTerm}
                            setLocationTerm={setLocationTerm}
                            setBenefitTerm={setBenefitTerm}
                            clearParamFilter={clearParamFilter}
                            setCurrentPage={setCurrentPage}
                            showSuggestion={showSuggestion}
                            setShowSuggestion={setShowSuggestion}
                        />
                    </div>

                    {/* DANH SÁCH EVENT CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
                        {loadingData ? (
                            <div className="col-span-full text-center py-10 text-slate-500 font-medium">Đang tải sự kiện...</div>
                        ) : paginatedEvents.length === 0 ? (
                            <div className="col-span-full text-center py-12 px-6 bg-white rounded-[1.5rem] border-2 border-dashed border-slate-200">
                                <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-slate-900">Không tìm thấy kết quả</h3>
                                <p className="text-slate-500 font-medium mt-1">Thử thay đổi từ khóa hoặc địa điểm tìm kiếm xem sao.</p>
                                <Button onClick={() => { setSearchTerm(""); setLocationTerm(""); setBenefitTerm(""); setSearchParams({}); setCurrentPage(1); }} variant="link" className="text-emerald-600 font-bold mt-2">Xóa bộ lọc</Button>
                            </div>
                        ) : (
                            paginatedEvents.map((job, idx) => (
                                <EventCard
                                    key={job.id}
                                    job={job}
                                    idx={idx}
                                    isBookmarked={!!bookmarkedEvents[job.id]}
                                    onToggleBookmark={toggleBookmark}
                                    myApplicationStatus={myApplications[job.id]}
                                    onApply={handleApply}
                                    applyingId={applyingId}
                                    onNavigateToJob={(jobId) => navigate(`/jobs/${jobId}`)}
                                    userSkills={userProfile?.skills}
                                />
                            ))
                        )}
                    </div>

                    {/* PHÂN TRANG */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        setCurrentPage={setCurrentPage}
                        totalItems={filteredEvents.length}
                        itemsPerPage={itemsPerPage}
                    />
                </div>

                {/* CỘT PHỤ BÊN PHẢI (CV & GỢI Ý & NHÀ TỔ CHỨC TIÊU BIỂU) */}
                <div className="space-y-6 lg:col-span-4 lg:pl-2 mt-2">
                    <CVSuggestionCard
                        userProfile={userProfile}
                        cvProgress={cvProgress}
                        firstName={firstName}
                        onNavigate={navigate}
                    />
                    
                    <FeaturedOrganizers
                        events={events}
                    />
                </div>

            </div>
        </div>
    )
}