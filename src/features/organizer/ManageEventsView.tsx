"use client"

import { useState, useEffect, useCallback } from "react"
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
  const { user, isPremium, loading: authLoading } = useUser()
  const { showToast } = useToast()

  const [events, setEvents] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)

  const [selectedEventForCandidates, setSelectedEventForCandidates] = useState<any | null>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [loadingApps, setLoadingApps] = useState(false)
  const [reviewsMap, setReviewsMap] = useState<Record<string, { rating: number; comment?: string }>>({})

  const [viewingCV, setViewingCV] = useState<any | null>(null)
  const [reviewingStudent, setReviewingStudent] = useState<{
    eventId: string
    studentId: string
    studentName: string
  } | null>(null)

  const fetchMyEvents = useCallback(async () => {
    if (!user) return
    setFetching(true)

    const { data, error } = await supabase
      .from("events")
      .select("*, applications(id, status, attendance_status), danang_wards(id, name)")
      .eq("organizer_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setEvents(data)
    }
    setFetching(false)
  }, [user])

  useEffect(() => {
    if (authLoading) return
    fetchMyEvents()
  }, [user, authLoading, fetchMyEvents])

  const handleViewApplications = async (eventObj: any) => {
    setSelectedEventForCandidates(eventObj)
    setLoadingApps(true)

    // Sync URL safely without full page reload
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.set("eventId", eventObj.id)
      window.history.pushState({}, "", url.toString())
    }

    try {
      // Fetch applications for this event
      const { data: appsData, error: appsError } = await supabase
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

      if (!appsError && appsData) {
        setApplications(appsData)
      }

      // Fetch existing reviews submitted by this organizer for this event
      if (user) {
        const { data: revData } = await supabase
          .from("reviews")
          .select("reviewee_id, rating, comment")
          .eq("event_id", eventObj.id)
          .eq("reviewer_id", user.id)

        if (revData && revData.length > 0) {
          const map: Record<string, { rating: number; comment?: string }> = {}
          revData.forEach((r) => {
            if (r.reviewee_id) {
              map[r.reviewee_id] = { rating: r.rating ?? 5, comment: r.comment || undefined }
            }
          })
          setReviewsMap(map)
        } else {
          setReviewsMap({})
        }
      }
    } catch {
      showToast({
        title: "Lỗi",
        message: "Không thể tải danh sách hồ sơ ứng viên.",
        type: "error",
      })
    } finally {
      setLoadingApps(false)
    }
  }

  // Handle URL param eventId to open directly or sync state
  useEffect(() => {
    const eventIdParam = searchParams?.get("eventId")
    if (eventIdParam && events.length > 0) {
      if (!selectedEventForCandidates || selectedEventForCandidates.id !== eventIdParam) {
        const found = events.find((e) => e.id === eventIdParam)
        if (found) {
          handleViewApplications(found)
        }
      }
    } else if (!eventIdParam && selectedEventForCandidates) {
      setSelectedEventForCandidates(null)
      setApplications([])
      setReviewsMap({})
    }
  }, [searchParams, events])

  const handleBackToEvents = () => {
    setSelectedEventForCandidates(null)
    setApplications([])
    setReviewsMap({})

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.delete("eventId")
      window.history.pushState({}, "", url.toString())
    }

    fetchMyEvents()
  }

  // Update single applicant status
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
        message: status === "approved" ? "Đã duyệt ứng viên trúng tuyển!" : "Đã cập nhật trạng thái ứng viên!",
        type: "success",
      })
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status } : app))
      )
      // Update local event applications count if needed
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === selectedEventForCandidates?.id
            ? {
                ...ev,
                applications: ev.applications?.map((a: any) =>
                  a.id === appId ? { ...a, status } : a
                ),
              }
            : ev
        )
      )
    }
  }

  // Bulk update applicant statuses
  const handleBulkUpdateStatus = async (appIds: string[], status: string) => {
    if (appIds.length === 0) return

    const { error } = await supabase
      .from("applications")
      .update({ status })
      .in("id", appIds)

    if (error) {
      showToast({
        title: "Lỗi",
        message: getUserFacingMessage(error, "Không thể cập nhật trạng thái hàng loạt."),
        type: "error",
      })
    } else {
      showToast({
        title: "Thành công",
        message: `Đã cập nhật ${appIds.length} ứng viên thành ${
          status === "approved" ? "Trúng tuyển" : status === "rejected" ? "Từ chối" : "Chờ duyệt"
        }!`,
        type: "success",
      })
      setApplications((prev) =>
        prev.map((app) => (appIds.includes(app.id) ? { ...app, status } : app))
      )
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === selectedEventForCandidates?.id
            ? {
                ...ev,
                applications: ev.applications?.map((a: any) =>
                  appIds.includes(a.id) ? { ...a, status } : a
                ),
              }
            : ev
        )
      )
    }
  }

  // Update attendance status (checked_in, completed, no_show, pending_event)
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

  // Update event status (e.g. active / paused / completed / closed)
  const handleUpdateEventStatus = async (eventId: string, newStatus: string) => {
    if (!user) return

    const { error } = await supabase
      .from("events")
      .update({ status: newStatus })
      .eq("id", eventId)
      .eq("organizer_id", user.id)

    if (error) {
      showToast({
        title: "Lỗi",
        message: getUserFacingMessage(error, "Không thể cập nhật trạng thái sự kiện."),
        type: "error",
      })
    } else {
      showToast({
        title: "Thành công",
        message: `Đã chuyển trạng thái sự kiện sang ${
          newStatus === "upcoming"
            ? "Đang mở nhận đơn"
            : newStatus === "closed"
            ? "Tạm dừng nhận đơn"
            : "Đã hoàn thành"
        }!`,
        type: "success",
      })
      setEvents((prev) =>
        prev.map((ev) => (ev.id === eventId ? { ...ev, status: newStatus } : ev))
      )
      if (selectedEventForCandidates?.id === eventId) {
        setSelectedEventForCandidates((prev: any) => ({ ...prev, status: newStatus }))
      }
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
    } catch {
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

    const { error } = await supabase
      .from("events")
      .update({ deleted_at: new Date().toISOString(), status: "closed" })
      .eq("id", id)
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
      if (selectedEventForCandidates?.id === id) {
        handleBackToEvents()
      }
    }
  }

  const handleBumpEvent = async (eventId: string) => {
    if (!isPremium) {
      showToast({
        title: "Tính năng VIP",
        message: "Tính năng Đẩy tin lên đầu dành riêng cho gói Doanh nghiệp VIP. Vui lòng nâng cấp!",
        type: "error",
      })
      router.push("/pricing")
      return
    }

    const { error } = await supabase
      .from("events")
      .update({ bumped_at: new Date().toISOString() })
      .eq("id", eventId)

    if (error) {
      showToast({
        title: "Lỗi",
        message: "Không thể đẩy tin. Vui lòng thử lại sau.",
        type: "error",
      })
    } else {
      showToast({
        title: "Thành công",
        message: "🚀 Đã đẩy tin lên đầu trang tìm kiếm thành công!",
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
          reviewsMap={reviewsMap}
          onBack={handleBackToEvents}
          setViewingCV={setViewingCV}
          handleUpdateStatus={handleUpdateStatus}
          handleBulkUpdateStatus={handleBulkUpdateStatus}
          handleUpdateAttendanceStatus={handleUpdateAttendanceStatus}
          onStartChatWithStudent={handleStartChatWithStudent}
          onRateStudent={(eventId, studentId, studentName) =>
            setReviewingStudent({ eventId, studentId, studentName })
          }
          isPremium={isPremium}
        />
      ) : (
        <OrgEventsTab
          fetching={fetching}
          events={events}
          onEditClick={handleEditClick}
          onDeleteEvent={handleDeleteEvent}
          onViewApplications={handleViewApplications}
          onUpdateStatus={handleUpdateEventStatus}
          onBumpEvent={handleBumpEvent}
          isPremium={isPremium}
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
          onReviewSuccess={() => {
            // Update local reviews map immediately
            setReviewsMap((prev) => ({
              ...prev,
              [reviewingStudent.studentId]: { rating: 5 },
            }))
          }}
        />
      )}

      <CVViewModal viewingCV={viewingCV} onClose={() => setViewingCV(null)} />
    </div>
  )
}
