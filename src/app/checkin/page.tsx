"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useUser } from "@/components/providers/AuthProvider"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import {
  CheckCircle2,
  AlertCircle,
  QrCode,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"

function CheckinContent() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get("event") || ""
  const codeParam = searchParams.get("code") || ""

  const { user, profile, loading: authLoading } = useUser()

  const [inputCode, setInputCode] = useState(codeParam)
  const [eventData, setEventData] = useState<any | null>(null)
  const [loadingEvent, setLoadingEvent] = useState(false)
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkinStatus, setCheckinStatus] = useState<"idle" | "success" | "already" | "not_approved" | "invalid_code" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Fetch event details
  useEffect(() => {
    if (!eventId) return
    const fetchEvent = async () => {
      setLoadingEvent(true)
      const { data, error } = await supabase
        .from("events")
        .select(`
          id,
          title,
          location,
          event_date,
          start_time,
          end_time,
          qr_checkin_code,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq("id", eventId)
        .maybeSingle()

      if (data && !error) {
        setEventData(data)
      } else {
        setErrorMessage("Không tìm thấy thông tin sự kiện này.")
      }
      setLoadingEvent(false)
    }

    fetchEvent()
  }, [eventId])

  // Auto check-in if code is already in query param and user is ready
  useEffect(() => {
    if (eventData && codeParam && user && checkinStatus === "idle") {
      performCheckin(codeParam)
    }
  }, [eventData, codeParam, user])

  const performCheckin = async (codeToVerify: string) => {
    if (!user) return
    if (!eventId) {
      setErrorMessage("Thiếu thông tin mã sự kiện.")
      return
    }

    setCheckingIn(true)
    setErrorMessage(null)

    try {
      // 1. Verify PIN code if event has one
      const expectedCode = eventData?.qr_checkin_code || eventId.substring(0, 6).toUpperCase()
      if (codeToVerify.trim().toUpperCase() !== expectedCode.toUpperCase()) {
        setCheckinStatus("invalid_code")
        setErrorMessage("Mã PIN điểm danh không chính xác. Vui lòng thử lại.")
        setCheckingIn(false)
        return
      }

      // 2. Check if student has approved application
      const { data: appData, error: appError } = await supabase
        .from("applications")
        .select("id, status, attendance_status")
        .eq("event_id", eventId)
        .eq("student_id", user.id)
        .maybeSingle()

      if (appError || !appData) {
        setCheckinStatus("not_approved")
        setErrorMessage("Bạn chưa đăng ký tham gia sự kiện này.")
        setCheckingIn(false)
        return
      }

      if (appData.status !== "approved") {
        setCheckinStatus("not_approved")
        setErrorMessage("Hồ sơ của bạn chưa được Ban tổ chức phê duyệt.")
        setCheckingIn(false)
        return
      }

      if (appData.attendance_status === "checked_in" || appData.attendance_status === "completed") {
        setCheckinStatus("already")
        setCheckingIn(false)
        return
      }

      // 3. Mark checked in
      const { error: updateError } = await supabase
        .from("applications")
        .update({ attendance_status: "checked_in" })
        .eq("id", appData.id)

      if (updateError) throw updateError

      setCheckinStatus("success")
    } catch (err: any) {
      setCheckinStatus("error")
      setErrorMessage(err.message || "Không thể hoàn tất điểm danh. Vui lòng thử lại.")
    } finally {
      setCheckingIn(false)
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputCode.trim()) return
    performCheckin(inputCode)
  }

  if (authLoading || loadingEvent) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="size-8 border-3 border-zinc-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-zinc-500">Đang xác thực điểm danh sự kiện...</p>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center">
          {checkinStatus === "success" ? (
            <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 animate-in zoom-in-50 duration-300">
              <CheckCircle2 className="size-9" />
            </div>
          ) : checkinStatus === "already" ? (
            <div className="size-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
              <ShieldCheck className="size-9" />
            </div>
          ) : checkinStatus === "not_approved" || checkinStatus === "invalid_code" || checkinStatus === "error" ? (
            <div className="size-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertCircle className="size-9" />
            </div>
          ) : (
            <div className="size-16 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center mb-4">
              <QrCode className="size-8" />
            </div>
          )}

          <h1 className="text-[20px] font-bold text-zinc-900">
            {checkinStatus === "success"
              ? "Điểm Danh Thành Công! 🎉"
              : checkinStatus === "already"
              ? "Bạn Đã Điểm Danh Rồi"
              : "Điểm Danh & Chấm Công"}
          </h1>

          <p className="text-xs text-zinc-500 mt-1 max-w-[280px]">
            {checkinStatus === "success"
              ? "Ca làm việc của bạn đã được ghi nhận. Chúc bạn có một ngày làm việc tuyệt vời!"
              : checkinStatus === "already"
              ? "Hệ thống đã ghi nhận trạng thái có mặt của bạn trước đó."
              : "Xác nhận có mặt tại sự kiện để ghi nhận chấm công và điểm uy tín."}
          </p>
        </div>

        {/* Event Card Info */}
        {eventData && (
          <div className="my-6 p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2 text-left">
            <h3 className="text-sm font-semibold text-zinc-900 line-clamp-1">
              {eventData.title}
            </h3>
            <p className="text-xs text-zinc-500 font-medium">
              Đơn vị tổ chức: {eventData.profiles?.full_name || "Ban tổ chức"}
            </p>
            <div className="flex items-center gap-3 text-xs text-zinc-600 pt-1 flex-wrap">
              {eventData.event_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="size-3 text-zinc-400" />
                  {new Date(eventData.event_date).toLocaleDateString("vi-VN")}
                </span>
              )}
              {eventData.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3 text-zinc-400" />
                  <span className="truncate max-w-[150px]">{eventData.location}</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Not logged in gate */}
        {!user ? (
          <div className="space-y-4 pt-2">
            <p className="text-xs text-zinc-600">
              Vui lòng đăng nhập bằng tài khoản sinh viên đã ứng tuyển để hoàn tất điểm danh.
            </p>
            <Link
              href={`/login?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname + window.location.search : "/checkin")}`}
              className="w-full h-10.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <span>Đăng nhập để điểm danh</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : checkinStatus === "success" || checkinStatus === "already" ? (
          <div className="pt-2">
            <Link
              href="/my-events"
              className="w-full h-10.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <span>Xem sự kiện của tôi</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-4 pt-2">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium text-left">
                {errorMessage}
              </div>
            )}

            <div>
              <label htmlFor="checkin-code" className="block text-xs font-semibold text-zinc-700 mb-1.5 text-left">
                Mã PIN Check-in (6 ký tự)
              </label>
              <input
                id="checkin-code"
                type="text"
                maxLength={8}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="VD: EV8924"
                required
                className="w-full h-11 text-center font-mono font-bold text-lg tracking-widest uppercase rounded-lg border border-zinc-300 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition"
              />
            </div>

            <Button
              type="submit"
              disabled={checkingIn || !inputCode.trim()}
              className="w-full h-10.5 bg-zinc-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {checkingIn ? (
                <>
                  <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Đang ghi nhận...</span>
                </>
              ) : (
                <span>Xác nhận điểm danh</span>
              )}
            </Button>
          </form>
        )}

      </div>
    </div>
  )
}

export default function CheckinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="size-8 border-3 border-zinc-900 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckinContent />
    </Suspense>
  )
}
