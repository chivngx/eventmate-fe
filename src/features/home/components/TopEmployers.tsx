"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Building2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Employer {
  id: string
  full_name: string
  avatar_url: string | null
  slug: string | null
}

export default function TopEmployers() {
  const router = useRouter()
  const [employers, setEmployers] = useState<Employer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchEmployers = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, slug, reliability_score")
          .eq("role", "organizer")
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

  if (!loading && employers.length === 0) {
    return null
  }

  const handleEmployerClick = (emp: Employer) => {
    if (emp.slug || emp.id) {
      router.push(`/companies/${emp.slug || emp.id}`)
    } else if (emp.full_name) {
      router.push(`/events?search=${encodeURIComponent(emp.full_name)}`)
    }
  }

  // Ensure sufficient items to create seamless infinite loop animation
  const repeatCount = employers.length > 0 ? Math.max(1, Math.ceil(8 / employers.length)) : 0
  const baseItems = Array(repeatCount).fill(employers).flat()
  const marqueeItems = [...baseItems, ...baseItems]

  return (
    <section
      className="w-full bg-white rounded-2xl shadow-xs overflow-hidden"
      aria-label="Việc làm từ Nhà tuyển dụng tiêu biểu"
    >
      {/* Header */}
      <div className="pt-4 md:pt-5 pb-3 px-5 md:px-6">
        <h2 className="text-[18px] md:text-[20px] font-bold text-[#222222] leading-[28px]">
          Việc làm từ Nhà tuyển dụng tiêu biểu
        </h2>
      </div>

      {/* Infinite Horizontal Marquee Track */}
      <div className="border-t border-[#f4f4f4] h-[176px] overflow-hidden relative w-full group">
        {loading ? (
          <div className="flex items-center">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="w-[160px] min-w-[160px] h-[176px] border-r border-[#f4f4f4] flex flex-col items-center justify-start px-3 shrink-0 animate-pulse"
              >
                <div className="w-[100px] h-[100px] p-[22px] flex items-center justify-center shrink-0">
                  <div className="w-[56px] h-[56px] rounded-lg bg-gray-100" />
                </div>
                <div className="w-full flex flex-col items-center gap-1.5 px-2">
                  <div className="h-4 bg-gray-100 rounded w-20" />
                  <div className="h-3 bg-gray-100 rounded w-14" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center animate-marquee-scroll group-hover:[animation-play-state:paused]">
            {marqueeItems.map((emp, index) => (
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
                className="w-[160px] min-w-[160px] h-[176px] border-r border-[#f4f4f4] hover:bg-gray-50/80 transition-colors flex flex-col items-center justify-start px-3 cursor-pointer shrink-0 select-none group/item"
                title={emp.full_name}
              >
                {/* Logo Box (100px square with 22px padding, image max 56px) */}
                <div className="w-[100px] h-[100px] p-[22px] flex items-center justify-center shrink-0">
                  <div className="w-[56px] h-[56px] relative flex items-center justify-center rounded-lg overflow-hidden">
                    {emp.avatar_url ? (
                      <img
                        src={emp.avatar_url}
                        alt={emp.full_name}
                        width={56}
                        height={56}
                        className="max-w-[56px] max-h-[56px] w-auto h-auto object-contain rounded-lg group-hover/item:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-[56px] h-[56px] rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover/item:scale-105 transition-transform duration-200">
                        <Building2 className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Employer Name in 2 lines */}
                <div className="w-full text-center flex flex-col items-center justify-center text-[#595959] text-[14px] sm:text-[15px] font-medium leading-[20px] sm:leading-[22px] px-1">
                  <p className="m-0 line-clamp-2 overflow-hidden text-ellipsis max-w-[136px]">
                    {emp.full_name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
