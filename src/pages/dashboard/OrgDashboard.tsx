import { useState } from "react"
import { useOrgDashboard } from "./useOrgDashboard"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, Briefcase } from "lucide-react"
import OrgEventsTab from "@/components/event/OrgEventsTab"
import OrgEventApplicationsDetail from "@/components/organizer/OrgEventApplicationsDetail"
import EventFormModal from "@/components/event/EventFormModal"
import ReviewModal from "@/components/ReviewModal"
import CVViewModal from "@/components/cv/CVViewModal"

export default function OrgDashboard() {
    const [reviewingStudent, setReviewingStudent] = useState<{ eventId: string; studentId: string; studentName: string } | null>(null)
    const {
        events, title, setTitle, desc, setDesc, location, setLocation,
        wardId, setWardId, wards,
        positionType, setPositionType, benefits, setBenefits,
        category, setCategory, slotsNeeded, setSlotsNeeded,
        eventDate, setEventDate, applicationDeadline, setApplicationDeadline,
        loading, fetching, showForm, setShowForm, editingId,
        viewingCV, setViewingCV, applications, loadingApps,
        selectedEventForCandidates, handleBackToEvents,
        handleSubmitEvent, handleEditClick, handleDeleteEvent,
        handleViewApplications, handleUpdateStatus, handleStartChatWithStudent, resetForm,
        totalEvents, activeEvents, userId
    } = useOrgDashboard()

    return (
        <div className="space-y-8 pb-10">
            {selectedEventForCandidates ? (
                <OrgEventApplicationsDetail
                    event={selectedEventForCandidates}
                    applications={applications}
                    loadingApps={loadingApps}
                    onBack={handleBackToEvents}
                    setViewingCV={setViewingCV}
                    handleUpdateStatus={handleUpdateStatus}
                    onStartChatWithStudent={handleStartChatWithStudent}
                    onRateStudent={(eventId, studentId, studentName) => setReviewingStudent({ eventId, studentId, studentName })}
                />
            ) : (
                <>
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

                    <OrgEventsTab
                        fetching={fetching}
                        events={events}
                        onEditClick={handleEditClick}
                        onDeleteEvent={handleDeleteEvent}
                        onViewApplications={handleViewApplications}
                    />
                </>
            )}

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

            <CVViewModal viewingCV={viewingCV} onClose={() => setViewingCV(null)} />
        </div>
    )
}