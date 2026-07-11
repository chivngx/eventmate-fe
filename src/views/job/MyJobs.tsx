"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "@/lib/router"
import { supabase } from "@/lib/supabase"
import { getUserFacingMessage } from "@/lib/error"
import { useUser } from "@/components/providers/AuthProvider"
import MainLayout from "@/components/layout/MainLayout"
import { Briefcase, MapPin, Building2, CheckCircle, XCircle, Clock3, ArrowRight, CalendarDays, Tag, Trash2, Award, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ScheduleCalendar from "@/components/ScheduleCalendar"
import ReviewModal from "@/components/ReviewModal"
import { SkeletonGenericPage } from "@/components/ui/Skeleton"
import CertificateModal from "@/components/CertificateModal"
import { useToast } from "@/components/ui/ToastProvider"

export default function MyJobs() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user, role, profile, loading: authLoading } = useUser()
  const [applications, setApplications] = useState<any[]>([])
  const [interviews, setInterviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewingEvent, setReviewingEvent] = useState<{ eventId: string; organizerId: string; organizerName: string } | null>(null)
  const [studentName, setStudentName] = useState("Sinh viên")
  const [viewingCertificate, setViewingCertificate] = useState<{ studentName: string; eventTitle: string; position: string; eventDate: string; organizerName: string } | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate("/login")
      return
    }
    const fetchMyApplications = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from("applications")
        .select(`
          id, 
          status, 
          applied_at,
          events (
            id, title, location, status, position_type, category, benefits, event_date, application_deadline, ward_id, slug,
            danang_wards (name),
            profiles (id, full_name, avatar_url, slug)
          )
        `)
        .eq("student_id", user.id)
        .order("applied_at", { ascending: false })

      if (error) {
        console.error("🚨 Lỗi truy vấn đơn ứng tuyển:", error)
        showToast({ title: "Lỗi kết nối Database", message: getUserFacingMessage(error, "Đã xảy ra lỗi kết nối. Vui lòng thử lại."), type: "error" })
      } else if (data) {
        setApplications(data)
      }

      const { data: intData, error: intError } = await supabase
        .from("interviews")
        .select(`
          id,
          title,
          scheduled_at,
          meeting_link,
          status,
          events (id, title, location)
        `)
        .eq("student_id", user.id)
        .eq("status", "accepted")

      if (!intError && intData) {
        setInterviews(intData)
      }

      setLoading(false)
    }
    fetchMyApplications()
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (profile?.full_name) setStudentName(profile.full_name)
  }, [profile])

  const handleWithdraw = async (appId: string) => {
    const isConfirmed = window.confirm("Bạn có chắc chắn muốn rút đơn ứng tuyển sự kiện này không?\nHành động này không thể hoàn tác.")
    if (!isConfirmed) return

    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("id", appId)

    if (!error) {
      showToast({ title: "Thành công", message: "Đã rút đơn ứng tuyển thành công.", type: "success" })
      setApplications(prev => prev.filter(app => app.id !== appId))
    } else {
      showToast({ title: "Lỗi khi hủy ứng tuyển", message: getUserFacingMessage(error, "Không thể hủy ứng tuyển. Vui lòng thử lại."), type: "error" })
    }
  }

  if (loading) return <SkeletonGenericPage />

  // Status meta: token-only color classes
  const getStatusMeta = (status: string) => {
    if (status === "approved") {
      return { label: "Trúng tuyển", icon: <CheckCircle className="h-3.5 w-3.5" />, className: "bg-accent text-primary" }
    }
    if (status === "rejected") {
      return { label: "Chưa phù hợp", icon: <XCircle className="h-3.5 w-3.5" />, className: "bg-muted text-muted-foreground" }
    }
    return { label: "Đang chờ duyệt", icon: <Clock3 className="h-3.5 w-3.5" />, className: "bg-secondary text-secondary-foreground" }
  }

  return (
    <MainLayout role={role || "student"}>
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Page header — clean, flat */}
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 text-xl font-bold text-foreground sm:text-2xl">
                <Briefcase className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                Việc làm đã nộp
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Theo dõi trạng thái các đơn ứng tuyển và sự kiện bạn đã tham gia.
              </p>
            </div>
            <Badge className="shrink-0 bg-muted text-foreground hover:bg-muted px-3 py-1.5 text-xs font-semibold">
              {applications.length} đơn
            </Badge>
          </div>
        </header>

        {applications.length === 0 ? (
          /* Empty state */
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center sm:p-16">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Bạn chưa ứng tuyển sự kiện nào</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Hàng ngàn cơ hội đang chờ đón bạn ngoài kia. Hãy bắt đầu khám phá ngay!
            </p>
            <Button
              onClick={() => navigate("/")}
              className="mt-6 h-10 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Tìm việc ngay
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          /* Layout: application list left (lg:col-span-2) + schedule calendar right */
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8 lg:items-start">
            <div className="space-y-3 lg:col-span-2">
              {applications.map((app, idx) => {
                const event = app.events
                const organizer = event?.profiles
                const status = getStatusMeta(app.status)
                const isOpen = event?.status === "upcoming"
                const canReview = app.status === "approved" && event?.status === "completed"

                return (
                  <article
                    key={app.id}
                    className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:shadow-sm sm:p-5 animate-in fade-in slide-in-from-bottom-3"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    {/* Top row: organizer avatar + title/status */}
                    <div className="flex items-start gap-3 sm:gap-4">
                      <button
                        onClick={() => navigate(`/jobs/${event?.slug || event?.id}`)}
                        className="shrink-0"
                      >
                        <Avatar className="h-12 w-12 rounded-lg border border-border sm:h-14 sm:w-14">
                          <AvatarImage src={organizer?.avatar_url} />
                          <AvatarFallback className="rounded-lg bg-muted text-base font-semibold text-foreground">
                            {organizer?.full_name ? organizer.full_name.charAt(0).toUpperCase() : "O"}
                          </AvatarFallback>
                        </Avatar>
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <button
                            onClick={() => navigate(`/jobs/${event?.slug || event?.id}`)}
                            className="min-w-0 text-left"
                          >
                            <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary sm:text-base">
                              {event?.title || "Sự kiện đã bị xóa"}
                            </h3>
                            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Building2 className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{organizer?.full_name || "Đơn vị ẩn danh"}</span>
                            </p>
                          </button>
                          <div className="flex shrink-0 items-center gap-1.5">
                            {isOpen ? (
                              <Badge className="bg-accent text-xs font-semibold text-primary">Đang mở</Badge>
                            ) : (
                              <Badge className="bg-muted text-xs font-semibold text-muted-foreground">Đã đóng</Badge>
                            )}
                            <span className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${status.className}`}>
                              {status.icon}
                              {status.label}
                            </span>
                          </div>
                        </div>

                        {/* Tags row */}
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-foreground">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate max-w-[160px]" title={event?.location}>
                              {event?.danang_wards?.name ? `P. ${event.danang_wards.name}` : (event?.location || "Đà Nẵng")}
                            </span>
                          </span>
                          {event?.position_type && (
                            <span className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-foreground">
                              <Briefcase className="h-3 w-3 text-muted-foreground" />
                              <span className="truncate max-w-[120px]">{event.position_type}</span>
                            </span>
                          )}
                          {event?.category && (
                            <span className="flex items-center gap-1 rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-primary">
                              <Tag className="h-3 w-3" />
                              <span className="truncate max-w-[120px]">{event.category}</span>
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <CalendarDays className="h-3 w-3" />
                            Đã nộp: {new Date(app.applied_at).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom row: actions */}
                    <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-3">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((event?.location ? event.location + ", " : "") + (event?.danang_wards?.name ? "Phường " + event.danang_wards.name + ", " : "") + "Đà Nẵng")}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex h-8 items-center gap-1 rounded-lg border border-border px-2.5 text-xs font-medium text-foreground hover:bg-muted"
                      >
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        Bản đồ
                      </a>

                      {canReview && (
                        <>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              setViewingCertificate({
                                studentName: studentName,
                                eventTitle: event.title,
                                position: event.position_type || "Thành viên tham gia",
                                eventDate: event.event_date,
                                organizerName: event.profiles?.full_name || "Ban tổ chức"
                              })
                            }}
                            variant="outline"
                            className="h-8 rounded-lg border-primary/20 px-2.5 text-xs font-medium text-primary hover:bg-accent"
                          >
                            <Award className="h-3.5 w-3.5" />
                            Nhận chứng nhận
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              setReviewingEvent({
                                eventId: event.id,
                                organizerId: event.profiles?.id,
                                organizerName: event.profiles?.full_name || "Nhà tổ chức"
                              })
                            }}
                            variant="outline"
                            className="h-8 rounded-lg border-border px-2.5 text-xs font-medium text-foreground hover:bg-muted"
                          >
                            <Star className="h-3.5 w-3.5" />
                            Đánh giá BTC
                          </Button>
                        </>
                      )}

                      {app.status === "pending" && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleWithdraw(app.id)
                          }}
                          variant="outline"
                          title="Hủy ứng tuyển sự kiện này"
                          className="h-8 rounded-lg border-destructive/20 px-2.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Hủy đơn</span>
                        </Button>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>

            {/* Right column: schedule calendar */}
            <aside className="lg:col-span-1 lg:sticky lg:top-6 w-full">
              <ScheduleCalendar applications={applications} interviews={interviews} />
            </aside>
          </div>
        )}
      </div>

      {reviewingEvent && user && (
        <ReviewModal
          isOpen={!!reviewingEvent}
          onClose={() => setReviewingEvent(null)}
          eventId={reviewingEvent.eventId}
          reviewerId={user.id}
          revieweeId={reviewingEvent.organizerId}
          revieweeName={reviewingEvent.organizerName}
        />
      )}

      {viewingCertificate && (
        <CertificateModal
          isOpen={!!viewingCertificate}
          onClose={() => setViewingCertificate(null)}
          studentName={viewingCertificate.studentName}
          eventTitle={viewingCertificate.eventTitle}
          position={viewingCertificate.position}
          eventDate={viewingCertificate.eventDate}
          organizerName={viewingCertificate.organizerName}
        />
      )}
    </MainLayout>
  )
}
