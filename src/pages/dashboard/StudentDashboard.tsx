import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import StudentHero from "@/components/dashboard/StudentHero"
import EventCard from "@/components/event/EventCard"
import QuickFilters from "@/components/QuickFilters"
import Pagination from "@/components/Pagination"
import { useStudentDashboard } from "./useStudentDashboard"

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
        paginatedEvents
    } = useStudentDashboard()

    return (
        <div className="space-y-10 pb-12 animate-in fade-in duration-300">
            {/* 1. BANNER PHẲNG & TÌM KIẾM DROPDOWN PHƯỜNG XÃ ĐÀ NẴNG */}
            <div className="max-w-[1140px] mx-auto w-full">
                <StudentHero
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    wardIdTerm={wardIdTerm}
                    setWardIdTerm={setWardIdTerm}
                    activeWards={activeWards}
                />
            </div>

            {/* 2. KHỐI BỘ LỌC VÀ KHÔNG GIAN BÀI ĐĂNG TUYỂN DỤNG CHÍNH (Đã giới hạn rộng khớp với grid) */}
            <div className="space-y-6 max-w-[1140px] mx-auto w-full">
                {/* BỘ LỌC RIÊNG BIỆT KHÔNG CÓ KHUNG VIỀN */}
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

                {/* GRID DANH SÁCH BÀI ĐĂNG (Tối đa 3 cột, căn giữa và chia đều hợp lý) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 justify-items-center max-w-[1140px] mx-auto w-full">
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
                                onNavigateToJob={(jobId) => navigate(`/jobs/${jobId}`)}
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

        </div>
    )
}