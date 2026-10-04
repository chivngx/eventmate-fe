"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import HeroSearchBanner from "./components/HeroSearchBanner"
import PopularCategories from "./components/PopularCategories"
import UrgentJobsSection from "./components/UrgentJobsSection"
import TopEmployers from "./components/TopEmployers"
import LatestJobsFeed from "./components/LatestJobsFeed"
import EmployerActionCards from "./components/EmployerActionCards"
import CareerAdviceSection from "./components/CareerAdviceSection"
import AboutSection from "./components/AboutSection"
import { useActiveWards } from "@/hooks/useLookups"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/components/providers/AuthProvider"

export default function HomeLandingView({ navbar }: { navbar?: React.ReactNode }) {
  const router = useRouter()
  const { user } = useUser()
  const { data: wards = [] } = useActiveWards()
  const [searchTerm, setSearchTerm] = useState("")
  const [wardIdTerm, setWardIdTerm] = useState("")
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [bookmarkedEvents, setBookmarkedEvents] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchLatestEvents = async () => {
      setLoadingEvents(true)
      try {
        const { data } = await supabase
          .from("events")
          .select("*, profiles(id, full_name, avatar_url, slug), danang_wards(name)")
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(12)

        if (data) setFeaturedEvents(data)

        if (user) {
          const { data: bData } = await supabase
            .from("event_bookmarks")
            .select("event_id")
            .eq("student_id", user.id)

          if (bData) {
            const bMap: Record<string, boolean> = {}
            bData.forEach((b) => {
              bMap[b.event_id] = true
            })
            setBookmarkedEvents(bMap)
          }
        }
      } catch (err) {
        console.error("Error fetching home events:", err)
      } finally {
        setLoadingEvents(false)
      }
    }

    fetchLatestEvents()
  }, [user])

  const handleSearch = (term?: string, ward?: string, category?: string) => {
    const activeSearch = (typeof term === "string" ? term : searchTerm).trim()
    const activeWard = typeof ward === "string" ? ward : wardIdTerm
    const params = new URLSearchParams()
    if (activeSearch) params.set("search", activeSearch)
    if (activeWard) params.set("ward", activeWard)
    if (category) params.set("category", category)

    const queryString = params.toString()
    router.push(queryString ? `/events?${queryString}` : "/events")
  }

  const toggleBookmark = async (id: string) => {
    if (!user) {
      window.dispatchEvent(
        new CustomEvent("open-auth-modal", { detail: { mode: "login" } })
      )
      return
    }

    const isBookmarked = !!bookmarkedEvents[id]
    if (isBookmarked) {
      await supabase
        .from("event_bookmarks")
        .delete()
        .eq("student_id", user.id)
        .eq("event_id", id)
      setBookmarkedEvents((prev) => ({ ...prev, [id]: false }))
    } else {
      await supabase
        .from("event_bookmarks")
        .insert([{ student_id: user.id, event_id: id }])
      setBookmarkedEvents((prev) => ({ ...prev, [id]: true }))
    }
  }

  return (
    <div className="w-full bg-[#F2F6FC] text-gray-900 pb-4">
      {/* 1. Sticky / Top Navbar Container */}
      {navbar && (
        <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-[1200px] mx-auto px-4 xl:px-0">{navbar}</div>
        </div>
      )}

      {/* 2. Vieclamtot-style Blue Search Banner with Single Capsule */}
      <HeroSearchBanner
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        wardIdTerm={wardIdTerm}
        setWardIdTerm={setWardIdTerm}
        activeWards={wards}
        onSearch={handleSearch}
      />

      {/* 3. Main Content Container - Dense, scannable, white cards on soft gray */}
      <div className="w-full max-w-[1200px] mx-auto px-0 py-6 flex flex-col gap-6">
        {/* Popular Categories (8 Photo Tiles) */}
        <PopularCategories />

        {/* Urgent Hiring Jobs (Phản hồi 24h & Bold Red Salaries) */}
        <UrgentJobsSection
          bookmarkedEvents={bookmarkedEvents}
          onToggleBookmark={toggleBookmark}
          onNavigateToJob={(id) => router.push(`/events/${id}`)}
        />

        {/* Top Employers / Event Venues in Da Nang */}
        <TopEmployers />

        {/* Latest Jobs Feed (Chợ Tốt Style Cards) */}
        <LatestJobsFeed
          events={featuredEvents}
          loading={loadingEvents}
          bookmarkedEvents={bookmarkedEvents}
          onToggleBookmark={toggleBookmark}
          onNavigateToJob={(id) => router.push(`/events/${id}`)}
        />

        {/* For Employers & Organizers */}
        <EmployerActionCards />

        {/* Career Advice / Tư vấn việc làm */}
        <CareerAdviceSection />

        {/* About / Introduction */}
        <AboutSection />
      </div>
    </div>
  )
}
