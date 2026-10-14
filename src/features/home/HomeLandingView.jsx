"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import HeroSearchBanner from "./components/HeroSearchBanner"
import HomeBentoGrid from "./components/HomeBentoGrid"
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

export default function HomeLandingView({ navbar }) {
  const router = useRouter()
  const { user, role } = useUser()
  const isOrganizer = role === "organizer" || role === "employer"
  const { data: wards = [] } = useActiveWards()
  const [searchTerm, setSearchTerm] = useState("")
  const [wardIdTerm, setWardIdTerm] = useState("")
  const [featuredEvents, setFeaturedEvents] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [bookmarkedEvents, setBookmarkedEvents] = useState({})

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
            const bMap = {}
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

  const handleSearch = (term, ward) => {
    const activeSearch = (typeof term === "string" ? term : searchTerm).trim()
    const activeWard = typeof ward === "string" ? ward : wardIdTerm
    const params = new URLSearchParams()
    if (activeSearch) params.set("search", activeSearch)
    if (activeWard) params.set("ward", activeWard)

    const queryString = params.toString()
    router.push(queryString ? `/events?${queryString}` : "/events")
  }

  const toggleBookmark = async (id) => {
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
    <div className="w-full bg-white text-slate-900 min-h-screen">
      {/* 1. Top Navbar Container (Clean, Simple, Professional) */}
      {navbar && (
        <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-[1200px] mx-auto px-4 xl:px-0">{navbar}</div>
        </div>
      )}

      {/* 2. 2-Column Hero Section (Directly matching the Brim reference image) */}
      <HeroSearchBanner
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        wardIdTerm={wardIdTerm}
        setWardIdTerm={setWardIdTerm}
        activeWards={wards}
        onSearch={handleSearch}
      />

      {/* 3. Main Content Container (Clean white, structured B2B layout) */}
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 xl:px-0 py-8 md:py-12 flex flex-col gap-10 md:gap-14">
        {/* Bento Grid: Quy chuẩn nhân sự ("Build the Perfect Card" style) */}
        <HomeBentoGrid />

        {/* Popular Categories */}
        <PopularCategories />

        {/* Urgent Hiring Jobs */}
        {!isOrganizer && (
          <UrgentJobsSection
            bookmarkedEvents={bookmarkedEvents}
            onToggleBookmark={toggleBookmark}
            onNavigateToJob={(id) => router.push(`/events/${id}`)}
          />
        )}

        {/* Top Verified Employers / Event Venues */}
        <TopEmployers />

        {/* Latest Jobs Feed */}
        <LatestJobsFeed
          events={featuredEvents}
          loading={loadingEvents}
          bookmarkedEvents={bookmarkedEvents}
          onToggleBookmark={toggleBookmark}
          onNavigateToJob={(id) => router.push(`/events/${id}`)}
        />

        {/* For Employers & Organizers */}
        {(!user || isOrganizer) && <EmployerActionCards />}

        {/* Career Advice / Articles */}
        {!isOrganizer && <CareerAdviceSection />}

        {/* About EventMate Platform */}
        <AboutSection />
      </div>
    </div>
  )
}
