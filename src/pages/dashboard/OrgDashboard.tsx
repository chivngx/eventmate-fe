import EventFormModal from "@/components/dashboard/EventFormModal"
import CVViewModal from "@/components/dashboard/CVViewModal"
import OrgApplicationsTab from "@/components/dashboard/OrgApplicationsTab"
import OrgEventsTab from "@/components/dashboard/OrgEventsTab"
import { useOrgDashboard } from "./useOrgDashboard"

export default function OrgDashboard() {
    const {
        events,
        title,
        setTitle,
        desc,
        setDesc,
        location,
        setLocation,
        positionType,
        setPositionType,
        benefits,
        setBenefits,
        category,
        setCategory,
        slotsNeeded,
        setSlotsNeeded,
        eventDate,
        setEventDate,
        applicationDeadline,
        setApplicationDeadline,
        loading,
        fetching,
        showForm,
        setShowForm,
        editingId,
        selectedEvent,
        setSelectedEvent,
        applications,
        loadingApps,
        viewingCV,
        setViewingCV,
        allApplications,
        loadingAllApps,
        selectedFilterEventId,
        setSelectedFilterEventId,
        activeTab,
        handleSubmitEvent,
        handleEditClick,
        handleDeleteEvent,
        handleViewApplications,
        handleUpdateStatus,
        resetForm,
        totalEvents,
        activeEvents
    } = useOrgDashboard()

    return (
        <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            {activeTab === "applications" ? (
                <OrgApplicationsTab
                    events={events}
                    selectedFilterEventId={selectedFilterEventId}
                    setSelectedFilterEventId={setSelectedFilterEventId}
                    loadingAllApps={loadingAllApps}
                    allApplications={allApplications}
                    setViewingCV={setViewingCV}
                    handleUpdateStatus={handleUpdateStatus}
                />
            ) : (
                <OrgEventsTab
                    events={events}
                    fetching={fetching}
                    showForm={showForm}
                    setShowForm={setShowForm}
                    resetForm={resetForm}
                    totalEvents={totalEvents}
                    activeEvents={activeEvents}
                    selectedEvent={selectedEvent}
                    setSelectedEvent={setSelectedEvent}
                    loadingApps={loadingApps}
                    applications={applications}
                    setViewingCV={setViewingCV}
                    handleUpdateStatus={handleUpdateStatus}
                    handleEditClick={handleEditClick}
                    handleDeleteEvent={handleDeleteEvent}
                    handleViewApplications={handleViewApplications}
                />
            )}

            {/* POPUP TẠO/SỬA SỰ KIỆN */}
            <EventFormModal
                showForm={showForm}
                editingId={editingId}
                resetForm={resetForm}
                handleSubmitEvent={handleSubmitEvent}
                title={title}
                setTitle={setTitle}
                location={location}
                setLocation={setLocation}
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

            {/* POPUP XEM CV */}
            <CVViewModal
                viewingCV={viewingCV}
                onClose={() => setViewingCV(null)}
            />
        </div>
    )
}