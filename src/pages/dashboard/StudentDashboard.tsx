import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import StudentHero from "@/components/dashboard/StudentHero"
import EventCard from "@/components/dashboard/EventCard"
import QuickFilters from "@/components/dashboard/QuickFilters"
import Pagination from "@/components/dashboard/Pagination"
import FeaturedOrganizers from "@/components/dashboard/FeaturedOrganizers"
import { useStudentDashboard } from "./useStudentDashboard"

export default function StudentDashboard() {
    const {
        navigate,
        setSearchParams,
        applyingId,
        loadingData,
        userProfile,
        searchTerm,
        setSearchTerm,
        benefitTerm,
        setBenefitTerm,
        wards,
        activeWards,
        wardIdTerm,
        setWardIdTerm,
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
        filteredEvents,
        totalPages,
        itemsPerPage,
        paginatedEvents,
        myApplications,
        events
    } = useStudentDashboard()

    return (
        <div className="space-y-10 pb-12 animate-in fade-in duration-300">
            {/* 1. BANNER PHẲNG & TÌM KIẾM DROPDOWN PHƯỜNG XÃ ĐÀ NẴNG */}
            <StudentHero
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                wardIdTerm={wardIdTerm}
                setWardIdTerm={setWardIdTerm}
                activeWards={activeWards}
            />

            {/* 2. KHỐI BỘ LỌC VÀ KHÔNG GIAN BÀI ĐĂNG TUYỂN DỤNG CHÍNH (Đã chuyển thành full-width dọc) */}
            <div className="space-y-6 w-full">
                <div className="bg-white rounded-2xl border-2 border-slate-100 p-5 space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h2 className="text-xl font-extrabold text-[#00b14f] tracking-tight">
                                {filterParam === 'saved' ? "Việc làm đã lưu ❤️" : "Việc làm sự kiện tốt nhất"}
                            </h2>
                            <span className="text-slate-350 font-light">|</span>
                            <div className="flex items-center gap-2">
                                <div className="relative w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#00b14f] bg-white">
                                    <div className="absolute inset-0.5 rounded-full border border-dashed border-black animate-spin" style={{ animationDuration: '8s' }} />
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#00b14f]" />
                                </div>
                                <div className="text-xs font-medium text-slate-500">
                                    Đề xuất bởi <span className="font-black text-slate-800">TOPPY</span><span className="font-black text-[#00b14f]">AI</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                            <button
                                onClick={() => {
                                    setSearchTerm("")
                                    setBenefitTerm("")
                                    setWardIdTerm("")
                                    setSearchParams({})
                                    setCurrentPage(1)
                                }}
                                className="text-xs font-extrabold text-slate-500 hover:text-[#00b14f] transition-colors underline decoration-slate-300 hover:decoration-[#00b14f] underline-offset-4"
                            >
                                Xem tất cả
                            </button>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                                        currentPage === 1
                                            ? "border-slate-100 text-slate-300 cursor-not-allowed opacity-50"
                                            : "border-[#00b14f] text-[#00b14f] hover:bg-[#00b14f]/5"
                                    }`}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                                        currentPage === totalPages
                                            ? "border-slate-100 text-slate-300 cursor-not-allowed opacity-50"
                                            : "border-[#00b14f] text-[#00b14f] hover:bg-[#00b14f]/5"
                                    }`}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* PHÂN HỆ BỘ LỌC NHANH SẠCH SẼ */}
                    <QuickFilters
                        filterParam={filterParam}
                        positionParam={positionParam}
                        categoryParam={categoryParam}
                        benefitTerm={benefitTerm}
                        wardIdTerm={wardIdTerm}
                        setWardIdTerm={setWardIdTerm}
                        wards={wards}
                        setBenefitTerm={setBenefitTerm}
                        clearParamFilter={clearParamFilter}
                        setCurrentPage={setCurrentPage}
                        showSuggestion={showSuggestion}
                        setShowSuggestion={setShowSuggestion}
                    />
                </div>

                {/* GRID DANH SÁCH BÀI ĐĂNG (ĐÃ TĂNG LÊN THÀNH 3 CỘT TRÊN MÀN HÌNH RỘNG ĐỂ TẬN DỤNG TRIỆT ĐỂ LAYOUT) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                    {loadingData ? (
                        <div className="col-span-full text-center py-12 text-slate-500 font-medium">Đang tải sự kiện Đà Nẵng...</div>
                    ) : paginatedEvents.length === 0 ? (
                        <div className="col-span-full text-center py-16 px-6 bg-white rounded-[1.5rem] border-2 border-dashed border-slate-200">
                            <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-slate-900">Không tìm thấy kết quả</h3>
                            <p className="text-slate-500 font-medium mt-1">Thử thay đổi từ khóa hoặc Phường/Xã tìm kiếm xem sao.</p>
                            <Button onClick={() => { setSearchTerm(""); setBenefitTerm(""); setWardIdTerm(""); setSearchParams({}); setCurrentPage(1); }} variant="link" className="text-emerald-600 font-bold mt-2">Xóa bộ lọc</Button>
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

                {/* THANH PHÂN TRANG CÂN ĐỐI TRUNG TÂM */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    setCurrentPage={setCurrentPage}
                    totalItems={filteredEvents.length}
                    itemsPerPage={itemsPerPage}
                />
            </div>

            {/* 3. ĐÃ SỬA: Khối Nhà tổ chức tiêu biểu đã được đưa ra khỏi grid ngang, đẩy độc lập xuống đáy trang */}
            <div className="pt-6 border-t border-slate-100 w-full">
                <FeaturedOrganizers
                    events={events}
                />
            </div>

        </div>
    )
}