"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Users, Calendar, Building2, CheckCircle2 } from "lucide-react"

export default function AboutSection() {
  const [stats, setStats] = useState({
    events: 0,
    organizers: 0,
    students: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchStats = async () => {
      try {
        const [
          { count: eventCount },
          { count: organizerCount },
          { count: studentCount },
        ] = await Promise.all([
          supabase
            .from("events")
            .select("*", { count: "exact", head: true })
            .is("deleted_at", null),
          supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("role", "organizer"),
          supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("role", "student"),
        ])

        if (isMounted) {
          setStats({
            events: eventCount ?? 0,
            organizers: organizerCount ?? 0,
            students: studentCount ?? 0,
          })
        }
      } catch (err) {
        console.error("Lỗi khi tải thống kê:", err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchStats()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section
      className="w-full bg-white rounded-xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs"
      aria-label="Giới thiệu EventMate"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-4 border-b border-gray-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D9488] mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>NỀN TẢNG TIÊU CHUẨN</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Về nền tảng EventMate
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-0 max-w-md">
          Giải pháp toàn diện giúp doanh nghiệp tối ưu chi phí tuyển dụng và điều phối nhân sự sự kiện.
        </p>
      </div>

      {/* Description */}
      <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal mb-8 max-w-3xl">
        EventMate là nền tảng kết nối nhân sự và cơ hội việc làm sự kiện hàng đầu dành cho các bạn trẻ và doanh nghiệp tại Đà Nẵng. Hệ thống hỗ trợ sàng lọc hồ sơ, xác thực danh tính và quản lý ca làm việc chuyên nghiệp, giúp nhà tổ chức an tâm vận hành sự kiện thành công.
      </p>

      {/* 3 Stats Highlights (Clean, Corporate, Mint/Slate) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* Stat 1: Việc làm sự kiện */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50/70 border border-gray-200/70">
          <div className="w-12 h-12 rounded-lg bg-teal-50 text-[#0D9488] border border-teal-100 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {loading ? (
                <span className="inline-block h-6 w-16 bg-slate-200 rounded animate-pulse" />
              ) : (
                stats.events.toLocaleString("vi-VN")
              )}
            </span>
            <span className="text-xs font-medium text-slate-500 mt-0.5">
              Sự kiện đã kết nối
            </span>
          </div>
        </div>

        {/* Stat 2: Ban tổ chức & Doanh nghiệp */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50/70 border border-gray-200/70">
          <div className="w-12 h-12 rounded-lg bg-teal-50 text-[#0D9488] border border-teal-100 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {loading ? (
                <span className="inline-block h-6 w-16 bg-slate-200 rounded animate-pulse" />
              ) : (
                stats.organizers.toLocaleString("vi-VN")
              )}
            </span>
            <span className="text-xs font-medium text-slate-500 mt-0.5">
              Doanh nghiệp & Ban tổ chức
            </span>
          </div>
        </div>

        {/* Stat 3: Nhân sự sẵn sàng nhận show */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50/70 border border-gray-200/70">
          <div className="w-12 h-12 rounded-lg bg-teal-50 text-[#0D9488] border border-teal-100 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {loading ? (
                <span className="inline-block h-6 w-16 bg-slate-200 rounded animate-pulse" />
              ) : (
                stats.students.toLocaleString("vi-VN")
              )}
            </span>
            <span className="text-xs font-medium text-slate-500 mt-0.5">
              Nhân sự đã xác thực
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
