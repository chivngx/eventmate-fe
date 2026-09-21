"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Star, ChevronRight, Building2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export interface TopOrganizersProps {
  organizers?: any[]
  loading?: boolean
}

export default function TopOrganizers({
  organizers: propOrganizers,
  loading: propLoading,
}: TopOrganizersProps) {
  const router = useRouter()
  const [organizers, setOrganizers] = useState<any[]>(propOrganizers || [])
  const [loading, setLoading] = useState(propLoading ?? !propOrganizers)

  useEffect(() => {
    if (propOrganizers !== undefined) {
      setOrganizers(propOrganizers)
      if (propLoading !== undefined) setLoading(propLoading)
      return
    }

    let isMounted = true
    const fetchTopOrganizers = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select(`
            id,
            full_name,
            avatar_url,
            bio,
            slug,
            university,
            scale,
            address,
            reliability_score,
            events (id, title, status)
          `)
          .eq("role", "organizer")
          .order("reliability_score", { ascending: false, nullsFirst: false })
          .limit(3)

        if (!error && data && isMounted) {
          setOrganizers(data)
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách ban tổ chức:", err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchTopOrganizers()
    return () => {
      isMounted = false
    }
  }, [propOrganizers, propLoading])

  const displayCompanies = organizers.slice(0, 3).map((org) => {
    const isHiring = org.events?.some(
      (e: any) => e.status === "upcoming" || e.status === "ongoing"
    ) || (org.events?.length > 0)

    const score = org.reliability_score || 98
    const starRating = (Math.min(5, Math.max(4.0, score / 20))).toFixed(1)

    const badges = []
    if (isHiring) {
      badges.push({ text: "Đang tuyển", color: "green" })
    }
    badges.push({ text: "Đối tác uy tín", color: "blue" })

    return {
      id: org.id,
      slug: org.slug,
      name: org.full_name || "Ban tổ chức sự kiện",
      location: org.address || org.university || "Đà Nẵng",
      star: starRating,
      logoUrl: org.avatar_url || null,
      badges,
      description: org.bio || "Đơn vị tổ chức sự kiện chuyên nghiệp, kết nối cơ hội việc làm và phát triển kỹ năng cho cộng tác viên.",
      jobs: org.events?.length || 0,
      reviews: `${score}%`,
      salaries: "Theo ca",
    }
  })

  return (
    <section
      id="top-organizers"
      className="w-full"
      data-node-id="5875:29423"
      data-name="Frame 2147225854"
    >
      <div className="max-w-[1232px] mx-auto px-4 sm:px-6 lg:px-0">
        {/* Section Header (Figma node 5875:29424: Titr home) */}
        <div
          className="relative flex flex-col items-center justify-center text-center mb-8 sm:mb-10"
          data-node-id="5875:29424"
          data-name="Titr home"
        >
          {/* Centered Title & Subtitle */}
          <div className="flex flex-col items-center gap-2 max-w-[600px] px-4">
            <h2
              className="font-['Inter'] font-semibold text-2xl sm:text-3xl lg:text-[36px] text-[#222222] tracking-tight leading-tight text-center"
              data-node-id="I5875:29424;874:9496"
            >
              Ban Tổ Chức Tiêu Biểu
            </h2>
            <p
              className="font-['Inter'] font-normal text-[15px] sm:text-[16px] text-[#757575] leading-[1.6] text-center"
              data-node-id="I5875:29424;874:9497"
            >
              Các đơn vị tổ chức sự kiện và doanh nghiệp uy tín hàng đầu tại Đà Nẵng
            </p>
          </div>

          {/* "Xem thêm >" Button on Right Corner */}
          <Link
            href="/companies"
            data-node-id="I5875:29424;3988:40331"
            className="sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2 mt-4 sm:mt-0 inline-flex items-center gap-1 text-[14px] font-medium text-[#005DDC] hover:text-[#004EB7] transition-colors group px-2 py-1 rounded-[8px]"
          >
            <span>Xem thêm</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px] w-full">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#EDEDED] rounded-[8px] p-[16px] h-[182px] flex gap-[8px] items-start animate-pulse"
              >
                <div className="w-16 h-16 rounded-[12px] bg-slate-100 shrink-0" />
                <div className="min-w-0 flex-1 flex flex-col justify-between h-full py-0.5">
                  <div className="space-y-1.5">
                    <div className="w-32 h-4 bg-slate-100 rounded" />
                    <div className="w-20 h-3 bg-slate-100 rounded" />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-16 h-5 bg-slate-100 rounded" />
                    <div className="w-16 h-5 bg-slate-100 rounded" />
                  </div>
                  <div className="w-full h-8 bg-slate-100 rounded" />
                  <div className="flex justify-between pt-1">
                    <div className="w-28 h-3 bg-slate-100 rounded" />
                    <div className="w-4 h-4 bg-slate-100 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayCompanies.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-[8px] border border-dashed border-slate-200">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-[16px] font-medium text-[#222222]">
              Chưa có thông tin ban tổ chức
            </p>
            <p className="text-[14px] text-[#757575] mt-1 max-w-md mx-auto">
              Danh sách các đơn vị tổ chức sự kiện tiêu biểu sẽ sớm được cập nhật tại đây.
            </p>
          </div>
        ) : (
          /* 3 Real Company Cards Grid (Figma node 5875:29425: Frame 1707479013) */
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-[16px] w-full"
            data-node-id="5875:29425"
          >
            {displayCompanies.map((company) => {
              const orgLink = `/companies/${company.slug || company.id}`

              return (
                <div
                  key={company.id}
                  onClick={() => router.push(orgLink)}
                  data-name="CompanyCardForCompanyPage"
                  className="bg-white border border-[#EDEDED] rounded-[8px] p-[16px] h-[182px] hover:border-[#005DDC]/50 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex gap-[8px] items-start group relative"
                >
                  {/* Logo Container (64x64, rounded 12px) */}
                  <div className="w-16 h-16 rounded-[12px] border border-[#EDEDED] overflow-hidden shrink-0 flex items-center justify-center bg-white p-1">
                    {company.logoUrl ? (
                      <img
                        src={company.logoUrl}
                        alt={company.name}
                        className="w-full h-full object-cover rounded-[10px]"
                      />
                    ) : (
                      <Building2 className="w-8 h-8 text-slate-300" />
                    )}
                  </div>

                  {/* Right Details (Width ~296px) */}
                  <div className="min-w-0 flex-1 flex flex-col justify-between h-full py-0.5">
                    {/* Top: Name + Location + Star Rating */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[20px] font-semibold text-[#222222] group-hover:text-[#005DDC] transition-colors leading-tight truncate">
                          {company.name}
                        </h3>
                        <p className="text-[12px] font-normal text-[#757575] leading-normal mt-0.5 truncate">
                          {company.location}
                        </p>
                      </div>

                      {/* Star Rating */}
                      <div className="flex items-center gap-1 shrink-0 pt-0.5">
                        <Star className="w-3.5 h-3.5 fill-[#F6B500] text-[#F6B500]" />
                        <span className="text-[12px] font-normal text-[#515151]">
                          {company.star}
                        </span>
                      </div>
                    </div>

                    {/* Outline Badges (h-[20px]) */}
                    <div className="flex items-center gap-[8px] h-[20px] overflow-hidden">
                      {company.badges.map((b, idx) => (
                        <span
                          key={idx}
                          className={`h-[20px] px-[8px] py-[4px] rounded-[4px] text-[12px] font-normal leading-none inline-flex items-center shrink-0 border ${
                            b.color === "green"
                              ? "border-[#009E00] text-[#009E00]"
                              : "border-[#005DDC] text-[#005DDC]"
                          }`}
                        >
                          {b.text}
                        </span>
                      ))}
                    </div>

                    {/* Description (Height 36px, 2 lines) */}
                    <p className="text-[12px] font-normal text-[#282828] leading-normal h-[36px] line-clamp-2 overflow-hidden text-ellipsis">
                      {company.description}
                    </p>

                    {/* Bottom Stats & Arrow Row */}
                    <div className="flex items-center justify-between w-full pt-1 text-[12px] text-[#515151]">
                      <div className="flex items-center gap-[16px] truncate">
                        <span>{company.jobs} việc làm</span>
                        <span>{company.reviews} uy tín</span>
                        <span>{company.salaries}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#005DDC] group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
