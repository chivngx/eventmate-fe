"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "@/lib/router"
import { supabase } from "@/lib/supabase"
import { getUserFacingMessage } from "@/lib/error"
import { useUser } from "@/components/providers/AuthProvider"
import MainLayout from "@/components/layout/MainLayout"
import { Bookmark, MapPin, Building2, Briefcase, Tag, Trash2, ArrowRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SkeletonGenericPage } from "@/components/ui/Skeleton"

export default function SavedJobs() {
  const navigate = useNavigate()
  const { user, role, loading: authLoading } = useUser()
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate("/login")
      return
    }
    const fetchMyBookmarks = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from("event_bookmarks")
        .select(`
          id,
          event_id,
          events (
            id, title, location, status, position_type, category, benefits, event_date, application_deadline, slug,
            danang_wards (name),
            profiles (id, full_name, avatar_url, slug)
          )
        `)
        .eq("student_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("🚨 Lỗi truy vấn việc làm đã lưu:", error)
      } else if (data) {
        setBookmarks(data)
      }
      setLoading(false)
    }
    fetchMyBookmarks()
  }, [user, authLoading, navigate])

  const handleRemoveBookmark = async (bookmarkId: string) => {
    const { error } = await supabase
      .from("event_bookmarks")
      .delete()
      .eq("id", bookmarkId)

    if (!error) {
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId))
    } else {
      alert(getUserFacingMessage(error, "Không thể bỏ lưu. Vui lòng thử lại."))
    }
  }

  if (loading) return <SkeletonGenericPage />

  return (
    <MainLayout role={role ?? undefined}>
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Page header — clean, flat */}
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 text-xl font-bold text-foreground sm:text-2xl">
                <Bookmark className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                Việc làm đã lưu
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Xem và quản lý các cơ hội việc làm sự kiện bạn đã lưu để ứng tuyển sau.
              </p>
            </div>
            <Badge className="shrink-0 bg-muted text-foreground hover:bg-muted px-3 py-1.5 text-xs font-semibold">
              {bookmarks.length} việc làm
            </Badge>
          </div>
        </header>

        {bookmarks.length === 0 ? (
          /* Empty state */
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center sm:p-16">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
              <Bookmark className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Bạn chưa lưu việc làm nào</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Hãy lướt xem các sự kiện tuyển dụng và lưu lại những vị trí bạn yêu thích.
            </p>
            <Button
              onClick={() => navigate("/")}
              className="mt-6 h-10 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Khám phá ngay
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          /* Saved jobs list — date block + info + remove */
          <ul className="space-y-3">
            {bookmarks.map((b, idx) => {
              const event = b.events
              const organizer = event?.profiles
              const eventDate = event?.event_date ? new Date(event.event_date) : null
              const isOpen = event?.status === "upcoming"

              return (
                <li
                  key={b.id}
                  className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:shadow-sm sm:flex-row sm:items-stretch sm:p-5 animate-in fade-in slide-in-from-bottom-3"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  {/* Date block — event ticket vibe */}
                  <button
                    onClick={() => navigate(`/jobs/${event?.slug || event?.id}`)}
                    className="flex w-full shrink-0 flex-row items-center gap-3 sm:w-16 sm:flex-col sm:justify-center sm:gap-1 sm:rounded-lg sm:bg-accent sm:p-2 sm:text-primary"
                  >
                    {eventDate ? (
                      <>
                        <span className="text-xl font-extrabold leading-none sm:text-2xl">
                          {String(eventDate.getDate()).padStart(2, "0")}
                        </span>
                        <span className="text-xs font-semibold uppercase text-muted-foreground sm:text-primary/70">
                          Th{eventDate.getMonth() + 1}
                        </span>
                      </>
                    ) : (
                      <Calendar className="h-6 w-6 text-muted-foreground sm:text-primary/70" />
                    )}
                  </button>

                  {/* Main info: title + organizer + tags */}
                  <button
                    onClick={() => navigate(`/jobs/${event?.slug || event?.id}`)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary sm:text-base">
                        {event?.title || "Sự kiện đã bị xóa"}
                      </h3>
                      {isOpen ? (
                        <Badge className="shrink-0 bg-accent text-xs font-semibold text-primary">
                          Đang mở
                        </Badge>
                      ) : (
                        <Badge className="shrink-0 bg-muted text-xs font-semibold text-muted-foreground">
                          Đã đóng
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{organizer?.full_name || "Đơn vị ẩn danh"}</span>
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-foreground">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate max-w-[160px]">
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
                    </div>
                  </button>

                  {/* Remove action */}
                  <div className="flex shrink-0 items-center sm:self-center">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveBookmark(b.id)
                      }}
                      variant="outline"
                      aria-label="Bỏ lưu việc làm này"
                      title="Bỏ lưu việc làm này"
                      className="h-9 rounded-lg border-border text-muted-foreground hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="ml-1.5 text-xs font-medium sm:hidden">Bỏ lưu</span>
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </MainLayout>
  )
}
