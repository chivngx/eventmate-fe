import { useState } from "react"
import { useOrgDashboard } from "./useOrgDashboard"
import MainLayout from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Calendar, Briefcase } from "lucide-react"
import OrgEventsTab from "@/components/event/OrgEventsTab"
import OrgApplicationsTab from "@/components/organizer/OrgApplicationsTab"
import EventFormModal from "@/components/event/EventFormModal"
import ReviewModal from "@/components/ReviewModal"

export default function OrgDashboard() {
    const [reviewingStudent, setReviewingStudent] = useState<{ eventId: string; studentId: string; studentName: string } | null>(null)
    const {
        events, title, setTitle, desc, setDesc, location, setLocation,
        wardId, setWardId, wards,
        positionType, setPositionType, benefits, setBenefits,
        category, setCategory, slotsNeeded, setSlotsNeeded,
        eventDate, setEventDate, applicationDeadline, setApplicationDeadline,
        loading, fetching, showForm, setShowForm, editingId,
        selectedEvent, setSelectedEvent, applications, loadingApps,
        viewingCV, setViewingCV, allApplications, loadingAllApps,
        selectedFilterEventId, setSelectedFilterEventId, activeTab,
        handleSubmitEvent, handleEditClick, handleDeleteEvent,
        handleViewApplications, handleUpdateStatus, handleStartChatWithStudent, resetForm,
        totalEvents, activeEvents, userId
    } = useOrgDashboard()

    return (
        <MainLayout role="organizer">
            <div className="space-y-8 pb-10">
                {/* KHỐI BANNER THỐNG KÊ TRÊN ĐỈNH */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-[2rem] text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Bảng quản trị tuyển dụng</h1>
                        <p className="text-slate-400 font-medium mt-1">Quản lý chiến dịch, duyệt hồ sơ ứng viên chuyên biệt tại Đà Nẵng.</p>
                    </div>
                    <Button onClick={() => setShowForm(true)} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black h-12 px-6 shrink-0 shadow-md shadow-emerald-900/20">
                        <Plus className="w-5 h-5 mr-1.5" /> Tạo chiến dịch mới
                    </Button>
                </div>

                {/* KHỐI THÈ SỐ LIỆU NHANH */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800/80 flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400"><Briefcase className="w-6 h-6" /></div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">Tổng bài đăng</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">{totalEvents}</h3>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800/80 flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400"><Calendar className="w-6 h-6" /></div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">Chiến dịch đang mở</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">{activeEvents}</h3>
                        </div>
                    </div>
                </div>

                {/* KHỐI TABS PHÂN CHIA QUẢN LÝ */}
                <Tabs value={activeTab} onValueChange={(val) => window.history.replaceState(null, "", `?tab=${val}`)} className="w-full space-y-6">
                    <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl h-12 border border-slate-200/60 dark:border-slate-700/80 max-w-md grid grid-cols-2">
                        <TabsTrigger value="events" className="rounded-lg font-bold text-sm text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100">📋 Bài đăng tuyển dụng</TabsTrigger>
                        <TabsTrigger value="applications" className="rounded-lg font-bold text-sm text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100">📩 Danh sách ứng viên</TabsTrigger>
                    </TabsList>

                    <TabsContent value="events" className="mt-0 outline-none">
                        <OrgEventsTab
                            fetching={fetching}
                            events={events}
                            onEditClick={handleEditClick}
                            onDeleteEvent={handleDeleteEvent}
                            onViewApplications={handleViewApplications}
                            selectedEvent={selectedEvent}
                            loadingApps={loadingApps}
                            applications={applications}
                            onUpdateStatus={handleUpdateStatus}
                            onStartChatWithStudent={handleStartChatWithStudent}
                            viewingCV={viewingCV}
                            setViewingCV={setViewingCV}
                            onCloseAppsModal={() => setSelectedEvent(null)}
                        />
                    </TabsContent>

                    <TabsContent value="applications" className="mt-0 outline-none">
                        <OrgApplicationsTab
                            loadingAllApps={loadingAllApps}
                            allApplications={allApplications}
                            events={events}
                            selectedFilterEventId={selectedFilterEventId}
                            setSelectedFilterEventId={setSelectedFilterEventId}
                            handleUpdateStatus={handleUpdateStatus}
                            onStartChatWithStudent={handleStartChatWithStudent}
                            setViewingCV={setViewingCV}
                            onRateStudent={(eventId, studentId, studentName) => setReviewingStudent({ eventId, studentId, studentName })}
                        />
                    </TabsContent>
                </Tabs>

                <EventFormModal
                    showForm={showForm}
                    editingId={editingId}
                    resetForm={resetForm}
                    handleSubmitEvent={handleSubmitEvent}
                    title={title}
                    setTitle={setTitle}
                    location={location}
                    setLocation={setLocation}
                    wardId={wardId}
                    setWardId={setWardId}
                    wards={wards}
                    eventDate={eventDate}
                    setEventDate={setEventDate}
                    applicationDeadline={applicationDeadline}
                    setApplicationDeadline={setApplicationDeadline}
                    positionType={positionType}
                    setPositionType={setPositionType}
                    category={category}
                    setCategory={setCategory}
                    benefits={benefits}
                    setBenefits={setBenefits}
                    slotsNeeded={slotsNeeded}
                    setSlotsNeeded={setSlotsNeeded}
                    desc={desc}
                    setDesc={setDesc}
                    loading={loading}
                />
            </div>

            {reviewingStudent && userId && (
                <ReviewModal
                    isOpen={!!reviewingStudent}
                    onClose={() => setReviewingStudent(null)}
                    eventId={reviewingStudent.eventId}
                    reviewerId={userId}
                    revieweeId={reviewingStudent.studentId}
                    revieweeName={reviewingStudent.studentName}
                />
            )}
        </MainLayout>
    )
}