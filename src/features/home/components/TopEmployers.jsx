"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Building2, CheckCircle2 } from "lucide-react"
import { VerifiedBadge } from "@/components/ui/verified-badge"
import { supabase } from "@/lib/supabase"

export default function TopEmployers() {
  const router = useRouter()
  const [employers, setEmployers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchEmployers = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, slug, reliability_score, is_verified")
          .eq("role", "organizer")
          .eq("is_verified", true)
          .order("reliability_score", { ascending: false, nullsFirst: false })

        if (!error && data && isMounted) {
          setEmployers(data)
        }
      } catch (err) {
        console.error("Lỗi khi tải nhà tuyển dụng:", err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchEmployers()

    return () => {
      isMounted = false
    }
  }, [])

  const handleEmployerClick = (emp) => {
    if (emp.slug || emp.id) {
      router.push(`/companies/${emp.slug || emp.id}`)
    } else if (emp.full_name) {
      router.push(`/events?search=${encodeURIComponent(emp.full_name)}`)
    }
  }

  // Chỉ kích hoạt hiệu ứng cuộn Marquee khi có từ 6 đối tác trở lên để tránh lặp hình ảnh
  const isMarquee = employers.length >= 6
  const displayItems = isMarquee ? [...employers, ...employers] : employers

  return (
    <section
      className="w-full bg-white rounded-xl border border-gray-200/90 shadow-2xs overflow-hidden"
      aria-label="Ban tổ chức tiêu biểu"
    >
      {/* Header */}
      <div className="pt-6 pb-4 px-6 md:px-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Ban tổ chức & Nhà tuyển dụng tiêu biểu tại Đà Nẵng
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Các đơn vị tổ chức, trung tâm hội nghị và đối tác hợp tác chính thức
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 self-start sm:self-auto">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#0D9488]" />
          100% Xác thực pháp lý
        </span>
      </div>

      {/* Content: Skeleton / Empty State / Real Data */}
      <div
        className={`h-[150px] relative w-full group bg-slate-50/40 ${
          isMarquee ? "overflow-hidden" : "overflow-x-auto"
        }`}
      >
        {loading ? (
          <div className="flex items-center">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="w-[160px] min-w-[160px] h-[150px] border-r border-gray-100 flex flex-col items-center justify-center px-3 shrink-0 animate-pulse"
              >
                <div className="w-[52px] h-[52px] rounded-lg bg-slate-200" />
                <div className="h-3.5 bg-slate-200 rounded w-20 mt-3" />
              </div>
            ))}
          </div>
        ) : employers.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
              <Building2 className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Chưa có ban tổ chức được xác thực</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Danh sách các đơn vị tổ chức và nhà tuyển dụng đã được duyệt tick xanh bởi Admin sẽ hiển thị tại đây.
            </p>
          </div>
        ) : (
          <div
            className={`flex items-center ${
              isMarquee
                ? "animate-marquee-scroll group-hover:[animation-play-state:paused]"
                : ""
            }`}
          >
            {displayItems.map((emp, index) => (
              <div
                key={`${emp.id}-${index}`}
                onClick={() => handleEmployerClick(emp)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleEmployerClick(emp)
                  }
                }}
                className="w-[160px] min-w-[160px] h-[150px] border-r border-gray-200/60 hover:bg-white transition-colors flex flex-col items-center justify-center px-3 cursor-pointer shrink-0 select-none"
                title={emp.full_name}
              >
                {/* Logo Box */}
                <div className="w-[56px] h-[56px] relative flex items-center justify-center rounded-lg overflow-hidden border border-gray-200/80 bg-white p-1 shadow-2xs">
                  {emp.avatar_url ? (
                    <img
                      src={emp.avatar_url}
                      alt={emp.full_name}
                      width={52}
                      height={52}
                      className="max-w-[50px] max-h-[50px] w-auto h-auto object-contain rounded"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full rounded bg-slate-50 flex items-center justify-center text-slate-400">
                      <Building2 className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {/* Employer Name with Verified Badge */}
                <div className="w-full text-center mt-2.5 px-1">
                  <div className="flex items-center justify-center gap-1 max-w-full">
                    <p className="m-0 text-xs font-semibold text-slate-800 truncate">
                      {emp.full_name}
                    </p>
                    <VerifiedBadge className="size-3.5 shrink-0" text="Đã xác thực" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
