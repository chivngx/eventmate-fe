"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

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
      className="w-full bg-white rounded-2xl p-5 md:p-6 shadow-xs"
      aria-label="Giới thiệu EventMate"
    >
      {/* Header */}
      <h2 className="text-[18px] md:text-[20px] font-bold text-[#222222] leading-[30px] mb-3">
        Giới thiệu
      </h2>

      {/* Description */}
      <p className="text-[14px] text-[#222222] leading-[22px] font-normal mb-5 w-full">
        EventMate là nền tảng kết nối nhân sự và cơ hội việc làm sự kiện hàng đầu dành cho sinh viên và ban tổ chức tại Đà Nẵng. Với sứ mệnh xây dựng môi trường làm việc minh bạch, năng động và an tâm cho người trẻ, EventMate cung cấp giải pháp trực tuyến{" "}
        <span className="font-bold text-[#306BD9]">Hiệu quả & Đáng tin cậy</span>{" "}
        cho Nhà tổ chức sự kiện và Lực lượng nhân sự năng động.
      </p>

      {/* 3 Stats Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 pt-1">
        {/* Stat 1: Việc làm sự kiện */}
        <div className="flex items-center gap-3">
          <div className="w-[72px] h-[72px] md:w-[80px] md:h-[80px] shrink-0 rounded-full overflow-hidden bg-[#F2F6FC] relative flex items-center justify-center">
            <img
              src="/images/about/jobs-stat.png"
              alt="Ca làm sự kiện kết nối"
              width={80}
              height={80}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[#306BD9] text-[20px] md:text-[22px] font-bold leading-[27px] min-h-[27px] flex items-center">
              {loading ? (
                <span className="inline-block h-5 w-14 bg-blue-100/70 rounded animate-pulse" />
              ) : (
                stats.events.toLocaleString("vi-VN")
              )}
            </span>
            <span className="text-[#222222] text-[14px] font-semibold leading-[21px] mt-0.5">
              Việc làm sự kiện
            </span>
          </div>
        </div>

        {/* Stat 2: Ban tổ chức & Doanh nghiệp */}
        <div className="flex items-center gap-3">
          <div className="w-[72px] h-[72px] md:w-[80px] md:h-[80px] shrink-0 rounded-full overflow-hidden bg-[#F2F6FC] relative flex items-center justify-center">
            <img
              src="/images/about/employers-stat.png"
              alt="Ban tổ chức & Doanh nghiệp"
              width={80}
              height={80}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[#306BD9] text-[20px] md:text-[22px] font-bold leading-[27px] min-h-[27px] flex items-center">
              {loading ? (
                <span className="inline-block h-5 w-14 bg-blue-100/70 rounded animate-pulse" />
              ) : (
                stats.organizers.toLocaleString("vi-VN")
              )}
            </span>
            <span className="text-[#222222] text-[14px] font-semibold leading-[21px] mt-0.5">
              Ban tổ chức & Doanh nghiệp
            </span>
          </div>
        </div>

        {/* Stat 3: Nhân sự sẵn sàng nhận show */}
        <div className="flex items-center gap-3">
          <div className="w-[72px] h-[72px] md:w-[80px] md:h-[80px] shrink-0 rounded-full overflow-hidden bg-[#F2F6FC] relative flex items-center justify-center">
            <img
              src="/images/about/traffic-stat.png"
              alt="Nhân sự sẵn sàng nhận show"
              width={80}
              height={80}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[#306BD9] text-[20px] md:text-[22px] font-bold leading-[27px] min-h-[27px] flex items-center">
              {loading ? (
                <span className="inline-block h-5 w-14 bg-blue-100/70 rounded animate-pulse" />
              ) : (
                stats.students.toLocaleString("vi-VN")
              )}
            </span>
            <span className="text-[#222222] text-[14px] font-semibold leading-[21px] mt-0.5">
              Nhân sự sẵn sàng nhận show
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
