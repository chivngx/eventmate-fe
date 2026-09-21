"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useUser } from "@/components/providers/AuthProvider"
import { useToast } from "@/components/providers/ToastProvider"
import { supabase } from "@/lib/supabase"
import { getUserFacingMessage } from "@/lib/error"
import OrgEventsTab from "./components/manage-events/OrgEventsTab"
import OrgEventApplicationsDetail from "./components/manage-events/OrgEventApplicationsDetail"
import ReviewModal from "@/features/event/components/ReviewModal"
import CVViewModal from "@/features/student/components/CVViewModal"
import { SkeletonGenericPage } from "@/components/ui/skeleton"

export default function ManageEventsView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useUser()
  const { showToast } = useToast()

  const [events, setEvents] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)

  const [selectedEventForCandidates, setSelectedEventForCandidates] = useState<any | null>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [loadingApps, setLoadingApps] = useState(false)

  const [viewingCV, setViewingCV] = useState<any | null>(null)
  const [reviewingStudent, setReviewingStudent] = useState<{
    eventId: string
    studentId: string
    studentName: string
  } | null>(null)

  const fetchMyEvents = async () => {
    if (!user) return
    setFetching(true)

    const { data, error } = await supabase
      .from("events")
      .select("*, applications(id)")
      .eq("organizer_id", user.id)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setEvents(data)
    }
    setFetching(false)
  }

  useEffect(() => {
    if (authLoading) return
    fetchMyEvents()
  }, [user, authLoading])

  // Handle URL param eventId to open directly
  useEffect(() => {
    const eventIdParam = searchParams?.get("eventId")
    if (eventIdParam && events.length > 0 && !selectedEventForCandidates) {
      const found = events.find((e) => e.id === eventIdParam)
      if (found) {
        handleViewApplications(found)
      }
    }
  }, [searchParams, events])

  const handleViewApplications = async (eventObj: any) => {
    setSelectedEventForCandidates(eventObj)
    setLoadingApps(true)

    const { data, error } = await supabase
      .from("applications")
      .select(`
        id,
        status,
        attendance_status,
        applied_at,
        student_note,
        student_id,
        profiles (
          id,
          full_name,
          email,
          phone,
          avatar_url,
          university,
          skills,
          bio,
          reliability_score,
          cv_url,
          experiences,
          social_link,
          gender,
          birth_year
        )
      `)
      .eq("event_id", eventObj.id)
      .order("applied_at", { ascending: false })

    if (!error && data) {
      setApplications(data)
    }
    setLoadingApps(false)
  }

  const handleBackToEvents = () => {
    setSelectedEventForCandidates(null)
    setApplications([])
    fetchMyEvents()
  }

  const handleUpdateStatus = async (appId: string, status: string) => {
    const { error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", appId)

    if (error) {
      showToast({
        title: "Lỗi",
        message: getUserFacingMessage(error, "Không thể cập nhật trạng thái đơn ứng tuyển."),
        type: "error",
      })
    } else {
      showToast({
        title: "Thành công",
        message: "Đã cập nhật trạng thái ứng viên!",
        type: "success",
      })
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status } : app))
      )
    }
  }

  const handleUpdateAttendanceStatus = async (appId: string, attendance_status: string) => {
    const { error } = await supabase
      .from("applications")
      .update({ attendance_status })
      .eq("id", appId)

    if (error) {
      showToast({
        title: "Lỗi",
        message: getUserFacingMessage(error, "Không thể cập nhật trạng thái điểm danh."),
        type: "error",
      })
    } else {
      showToast({
        title: "Thành công",
        message: "Đã cập nhật điểm danh thành công!",
        type: "success",
      })
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, attendance_status } : app))
      )
    }
  }

  const handleStartChatWithStudent = async (eventId: string, studentId: string) => {
    if (!user) return

    try {
      const { data: existingChat } = await supabase
        .from("chats")
        .select("id")
        .eq("event_id", eventId)
        .eq("student_id", studentId)
        .eq("organizer_id", user.id)
        .maybeSingle()

      if (existingChat) {
        router.push(`/chat/${existingChat.id}`)
      } else {
        const { data: newChat, error } = await supabase
          .from("chats")
          .insert({
            event_id: eventId,
            student_id: studentId,
            organizer_id: user.id,
          })
          .select("id")
          .single()

        if (!error && newChat) {
          router.push(`/chat/${newChat.id}`)
        }
      }
    } catch (err) {
      showToast({
        title: "Lỗi",
        message: "Không thể kết nối trò chuyện với ứng viên.",
        type: "error",
      })
    }
  }

  const handleEditClick = (ev: any) => {
    router.push(`/post-job?edit=${ev.id}`)
  }

  const handleDeleteEvent = async (id: string) => {
    const isConfirmed = window.confirm(
      "🚨 BẠN CÓ CHẮC CHẮN MUỐN XÓA SỰ KIỆN NÀY?\nToàn bộ đơn đăng ký của sinh viên cũng sẽ bị xóa vĩnh viễn!"
    )
    if (!isConfirmed) return

    const { error } = await supabase.from("events").delete().eq("id", id)
    if (error) {
      showToast({
        title: "Lỗi",
        message: getUserFacingMessage(error, "Không thể xóa sự kiện."),
        type: "error",
      })
    } else {
      showToast({
        title: "Thành công",
        message: "Đã xóa sự kiện thành công!",
        type: "success",
      })
      fetchMyEvents()
    }
  }

  if (authLoading) {
    return <SkeletonGenericPage />
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200 w-full">
      {selectedEventForCandidates ? (
        <OrgEventApplicationsDetail
          event={selectedEventForCandidates}
          applications={applications}
          loadingApps={loadingApps}
          onBack={handleBackToEvents}
          setViewingCV={setViewingCV}
          handleUpdateStatus={handleUpdateStatus}
          handleUpdateAttendanceStatus={handleUpdateAttendanceStatus}
          onStartChatWithStudent={handleStartChatWithStudent}
          onRateStudent={(eventId, studentId, studentName) =>
            setReviewingStudent({ eventId, studentId, studentName })
          }
        />
      ) : (
        <OrgEventsTab
          fetching={fetching}
          events={events}
          onEditClick={handleEditClick}
          onDeleteEvent={handleDeleteEvent}
          onViewApplications={handleViewApplications}
          onCreateNew={() => router.push("/post-job")}
        />
      )}

      {reviewingStudent && user && (
        <ReviewModal
          isOpen={!!reviewingStudent}
          onClose={() => setReviewingStudent(null)}
          eventId={reviewingStudent.eventId}
          reviewerId={user.id}
          revieweeId={reviewingStudent.studentId}
          revieweeName={reviewingStudent.studentName}
        />
      )}

      <CVViewModal viewingCV={viewingCV} onClose={() => setViewingCV(null)} />
    </div>
  )
}
