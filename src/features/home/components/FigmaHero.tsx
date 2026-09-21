"use client"

import { useState, useEffect } from "react"
import SearchBar from "@/components/common/SearchBar"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/components/providers/AuthProvider"

interface FigmaHeroProps {
  searchTerm: string
  setSearchTerm: (val: string) => void
  wardIdTerm: string
  setWardIdTerm: (val: string) => void
  activeWards: any[]
  onSearch?: (term?: string, ward?: string) => void
}

export default function FigmaHero({
  searchTerm,
  setSearchTerm,
  wardIdTerm,
  setWardIdTerm,
  activeWards = [],
  onSearch,
}: FigmaHeroProps) {
  const { user, role } = useUser()
  const [localSearch, setLocalSearch] = useState(searchTerm)

  // Real Database Stats
  const [candidatesCount, setCandidatesCount] = useState<number>(0)
  const [totalJobs, setTotalJobs] = useState<number>(0)
  const [pendingCount, setPendingCount] = useState<number>(0)
  const [approvedCount, setApprovedCount] = useState<number>(0)
  const [rejectedCount, setRejectedCount] = useState<number>(0)
  const [hiredCount, setHiredCount] = useState<number>(0)
  const [candidateAvatars, setCandidateAvatars] = useState<string[]>([])

  useEffect(() => {
    let isMounted = true

    const fetchRealHeroStats = async () => {
      try {
        // 1. Fetch total student candidate profiles
        const { count: studentCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "student")

        // 2. Fetch candidate avatars
        const { data: studentProfiles } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("role", "student")
          .not("avatar_url", "is", null)
          .limit(3)

        // 3. Fetch total active events/jobs
        const { count: jobCount } = await supabase
          .from("events")
          .select("*", { count: "exact", head: true })

        // 4. Fetch applications stats (personal for student with apps, or platform-wide)
        let pending = 0
        let approved = 0
        let rejected = 0

        const { data: allApps } = await supabase.from("applications").select("status, student_id")
        const uniqueApprovedStudents = new Set(
          allApps?.filter((a) => a.status === "approved").map((a) => a.student_id) || []
        ).size

        if (user && role === "student") {
          const { data: userApps } = await supabase
            .from("applications")
            .select("status")
            .eq("student_id", user.id)

          if (userApps && userApps.length > 0) {
            pending = userApps.filter((a) => a.status === "pending" || !a.status).length
            approved = userApps.filter((a) => a.status === "approved").length
            rejected = userApps.filter((a) => a.status === "rejected").length
          } else if (allApps) {
            pending = allApps.filter((a) => a.status === "pending" || !a.status).length
            approved = allApps.filter((a) => a.status === "approved").length
            rejected = allApps.filter((a) => a.status === "rejected").length
          }
        } else if (allApps) {
          pending = allApps.filter((a) => a.status === "pending" || !a.status).length
          approved = allApps.filter((a) => a.status === "approved").length
          rejected = allApps.filter((a) => a.status === "rejected").length
        }

        if (isMounted) {
          setCandidatesCount(studentCount || 0)
          setTotalJobs(jobCount || 0)
          setPendingCount(pending)
          setApprovedCount(approved)
          setRejectedCount(rejected)
          setHiredCount(uniqueApprovedStudents)
          if (studentProfiles && studentProfiles.length > 0) {
            const urls = studentProfiles.map((p) => p.avatar_url).filter(Boolean) as string[]
            if (urls.length > 0) setCandidateAvatars(urls)
          }
        }
      } catch (err) {
        console.error("Error fetching hero real data:", err)
      }
    }

    fetchRealHeroStats()
    return () => {
      isMounted = false
    }
  }, [user, role])

  const handleSearchSubmit = () => {
    setSearchTerm(localSearch)
    if (onSearch) {
      onSearch(localSearch, wardIdTerm)
    } else {
      const el = document.getElementById("newest-jobs") || document.getElementById("events-grid")
      if (el) el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="relative w-full py-4 sm:py-6 lg:py-8">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Main Headline + Subtitle + Search Bar + Social Proof */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7 text-left">
            {/* Main Headline (Figma node 7182:22146) */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-[68px] xl:text-[72px] font-['Inter'] font-extrabold tracking-tight text-[#222222] leading-[1.12]">
                Khởi đầu tương lai <br className="hidden sm:inline" />
                cùng <span className="text-[#005DDC]">EventMate!</span>
              </h1>
              <p className="text-base sm:text-lg lg:text-[19px] xl:text-[20px] text-[#757575] font-['Inter'] font-medium leading-relaxed max-w-xl">
                Khám phá các việc làm sự kiện phù hợp với kỹ năng và đam mê của bạn. Tìm kiếm và trải nghiệm ngay!
              </p>
            </div>

            {/* Search Box (Figma node 7182:22171) */}
            <SearchBar
              searchTerm={localSearch}
              onSearchChange={setLocalSearch}
              selectedLocation={wardIdTerm}
              onLocationChange={setWardIdTerm}
              wards={activeWards}
              placeholder="Vị trí, kỹ năng hoặc từ khóa"
              searchButtonText="Tìm kiếm"
              onSearchSubmit={handleSearchSubmit}
              className="mx-0 max-w-[608px]"
            />

            {/* Social Proof (Figma node 7182:22164) */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex -space-x-3.5 overflow-hidden">
                {(candidateAvatars.length > 0
                  ? candidateAvatars
                  : [
                      "/images/home/avatar-figma-1.png",
                      "/images/home/avatar-figma-2.png",
                      "/images/home/avatar-figma-3.png",
                    ]
                )
                  .slice(0, 3)
                  .map((src, i) => (
                    <img
                      key={i}
                      className="inline-block h-8 w-8 rounded-full border border-[#CBCBCB] object-cover"
                      src={src}
                      alt={`Ứng viên ${i + 1}`}
                      onError={(e) => {
                        ;(e.currentTarget as HTMLImageElement).src = `/images/home/avatar-figma-${(i % 3) + 1}.png`
                      }}
                    />
                  ))}
              </div>
              <p className="text-xs sm:text-[13px] font-['Inter'] font-medium text-[#222222]">
                Hơn{" "}
                <span className="text-[#005DDC] font-bold">
                  {(hiredCount > 0 ? hiredCount : candidatesCount) >= 1000
                    ? `${((hiredCount > 0 ? hiredCount : candidatesCount) / 1000).toFixed(1)}k+`
                    : (hiredCount > 0 ? hiredCount : candidatesCount) > 0
                    ? `${hiredCount > 0 ? hiredCount : candidatesCount}+`
                    : "0"}
                </span>{" "}
                ứng viên đã tìm được việc thành công
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Circular Hero Visual & 3 Floating Badges (Figma node 7182:22148) */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[460px] sm:min-h-[520px] lg:min-h-[560px]">
            {/* Scaling container that maintains exact proportions from Figma */}
            <div className="relative w-[484px] h-[484px] scale-[0.7] sm:scale-[0.85] lg:scale-100 origin-center">
              
              {/* Center Circular Backdrop (Figma node 7182:22148, Ellipse 2) */}
              <div className="absolute inset-0 rounded-full bg-[#F9F9F9] shadow-[0_12px_40px_rgba(0,93,220,0.06)]" />

              {/* Girl posing cutout image (Figma node 7182:22149, expressive-young-girl-posing 2) */}
              <div className="-translate-x-1/2 absolute h-[591px] left-1/2 -top-[130.5px] w-[694px] overflow-hidden pointer-events-none z-10">
                <img
                  alt="Ứng viên EventMate"
                  className="absolute h-[100.03%] left-[-24.93%] max-w-none top-[-0.02%] w-[127.81%] object-cover pointer-events-none"
                  src="/images/home/hero-girl-figma.png"
                />
              </div>

              {/* Floating Badge 1: Ứng viên hỗ trợ (on her right hand / viewer's left) */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="absolute -left-[128px] top-[81.5px] bg-white rounded-[8px] p-[16px] flex items-center gap-[14px] shadow-[2px_4px_16px_rgba(1,70,177,0.08)] border border-slate-100/80 z-20"
              >
                <div className="bg-[#005DDC] rounded-[12px] size-[40px] flex items-center justify-center text-white shrink-0 shadow-xs">
                  <img
                    src="/images/home/calendar-icon.svg"
                    alt="Lịch sự kiện"
                    className="size-[24px]"
                  />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[18px] font-['Inter'] font-semibold text-[#595959] leading-none">
                    {candidatesCount >= 1000
                      ? `${(candidatesCount / 1000).toFixed(1)}k+`
                      : candidatesCount > 0
                      ? `${candidatesCount}+`
                      : "0"}
                  </span>
                  <span className="text-[12px] font-['Inter'] font-semibold text-[#515151] mt-1 whitespace-nowrap">
                    Ứng viên hỗ trợ
                  </span>
                </div>
              </motion.div>

              {/* Floating Badge 2: Donut Chart Job Status (on her left hand / viewer's right) */}
              {(() => {
                const totalApps = pendingCount + approvedCount + rejectedCount
                const radius = 28
                const circumference = 2 * Math.PI * radius
                const pendingLen = totalApps > 0 ? (pendingCount / totalApps) * circumference : 0
                const approvedLen = totalApps > 0 ? (approvedCount / totalApps) * circumference : 0
                const rejectedLen = totalApps > 0 ? (rejectedCount / totalApps) * circumference : 0

                return (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                    className="absolute left-[390px] top-[54.5px] bg-white rounded-[8px] p-[8px] flex items-center gap-[6px] shadow-[2px_4px_16px_rgba(1,70,177,0.08)] border border-slate-100/80 z-20 w-[214px] h-[96px]"
                  >
                    {/* Donut chart meter */}
                    <div className="relative size-[76px] shrink-0 flex items-center justify-center p-[10px]">
                      <svg viewBox="0 0 76 76" className="absolute inset-0 size-full -rotate-90">
                        {/* Background ring */}
                        <circle
                          cx="38"
                          cy="38"
                          r={radius}
                          fill="none"
                          stroke="#EDF4FF"
                          strokeWidth="6"
                        />
                        {/* Pending slice */}
                        {pendingLen > 0 && (
                          <circle
                            cx="38"
                            cy="38"
                            r={radius}
                            fill="none"
                            stroke="#004EB7"
                            strokeWidth="6"
                            strokeDasharray={`${pendingLen} ${circumference - pendingLen}`}
                            strokeDashoffset="0"
                            strokeLinecap="round"
                          />
                        )}
                        {/* Approved slice */}
                        {approvedLen > 0 && (
                          <circle
                            cx="38"
                            cy="38"
                            r={radius}
                            fill="none"
                            stroke="#6EABFF"
                            strokeWidth="6"
                            strokeDasharray={`${approvedLen} ${circumference - approvedLen}`}
                            strokeDashoffset={-(pendingLen)}
                            strokeLinecap="round"
                          />
                        )}
                        {/* Rejected slice */}
                        {rejectedLen > 0 && (
                          <circle
                            cx="38"
                            cy="38"
                            r={radius}
                            fill="none"
                            stroke="#CFE3FF"
                            strokeWidth="6"
                            strokeDasharray={`${rejectedLen} ${circumference - rejectedLen}`}
                            strokeDashoffset={-(pendingLen + approvedLen)}
                            strokeLinecap="round"
                          />
                        )}
                      </svg>
                      <div className="relative flex flex-col items-center justify-center text-center">
                        <span className="text-[12px] font-['Inter'] font-semibold text-[#222222] leading-none">
                          {totalJobs}
                        </span>
                        <span className="text-[8px] font-['Inter'] font-semibold text-[#515151] leading-none mt-1">
                          Việc làm
                        </span>
                      </div>
                    </div>

                    {/* Status Legend list */}
                    <div className="flex items-center gap-[8px] flex-1">
                      <div className="flex flex-col gap-[12px] shrink-0 w-[8px]">
                        <span className="w-full h-[8px] rounded-full bg-[#004EB7]" />
                        <span className="w-full h-[8px] rounded-full bg-[#6EABFF]" />
                        <span className="w-full h-[8px] rounded-full bg-[#CFE3FF]" />
                      </div>
                      <div className="flex flex-col gap-[8px] text-[10px] font-['Inter'] font-medium text-[#515151] flex-1 whitespace-nowrap">
                        <span>Đang duyệt</span>
                        <span>Được nhận</span>
                        <span>Đã từ chối</span>
                      </div>
                      <div className="flex flex-col gap-[8px] text-[10px] font-['Inter'] font-normal text-[#222222]">
                        <span>{pendingCount}</span>
                        <span>{approvedCount}</span>
                        <span>{rejectedCount}</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })()}


            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
