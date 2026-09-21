"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import FigmaHero from "./components/FigmaHero"
import NewestEvents from "./components/NewestEvents"
import HowItWorksSteps from "./components/HowItWorksSteps"
import TopOrganizers from "./components/TopOrganizers"
import EventBlogSection from "./components/EventBlogSection"
import OrganizerCtaBanner from "./components/OrganizerCtaBanner"
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
      const { data } = await supabase
        .from("events")
        .select("*, profiles(id, full_name, avatar_url, slug), danang_wards(name)")
        .order("created_at", { ascending: false })
        .limit(6)
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
      setLoadingEvents(false)
    }
    fetchLatestEvents()
  }, [user])

  const handleSearch = (term?: string, ward?: string) => {
    const activeSearch = (typeof term === "string" ? term : searchTerm).trim()
    const activeWard = typeof ward === "string" ? ward : wardIdTerm
    const params = new URLSearchParams()
    if (activeSearch) params.set("search", activeSearch)
    if (activeWard) params.set("ward", activeWard)
    const queryString = params.toString()
    router.push(queryString ? `/events?${queryString}` : "/events")
  }


  const toggleBookmark = async (id: string) => {
    if (!user) {
      window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode: "login" } }))
      return
    }
    const isBookmarked = !!bookmarkedEvents[id]
    if (isBookmarked) {
      await supabase.from("event_bookmarks").delete().eq("student_id", user.id).eq("event_id", id)
      setBookmarkedEvents(prev => ({ ...prev, [id]: false }))
    } else {
      await supabase.from("event_bookmarks").insert([{ student_id: user.id, event_id: id }])
      setBookmarkedEvents(prev => ({ ...prev, [id]: true }))
    }
  }

  return (
    <div className="w-full animate-in fade-in duration-300">
      {/* 1. TOP HERO CONTAINER (Figma node 7182:22144) - #EFF5FF background encloses Navbar & Hero (Full Viewport) */}
      <div className="w-full min-h-screen flex flex-col justify-between bg-[#EFF5FF] relative overflow-hidden">
        {/* Floating Navbar inside the Hero's top area or Spacer */}
        {navbar ? (
          <div className="pt-6 sm:pt-8 lg:pt-10 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto w-full relative z-30 shrink-0">
            {navbar}
          </div>
        ) : (
          <div className="h-[92px] sm:h-[96px] shrink-0" />
        )}

        {/* Hero Section Content (Vertically centered) */}
        <div className="flex-1 flex items-center w-full">
          <FigmaHero
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            wardIdTerm={wardIdTerm}
            setWardIdTerm={setWardIdTerm}
            activeWards={wards}
            onSearch={handleSearch}
          />
        </div>
      </div>

      {/* MAIN CONTENT SECTIONS BELOW HERO (Figma 88px rhythm) */}
      <div className="w-full flex flex-col gap-12 sm:gap-16 lg:gap-[88px] pt-8 sm:pt-10 lg:pt-[48px] px-4 sm:px-6 lg:px-8">

        {/* 3. NEWEST JOBS FOR YOU */}
        <NewestEvents
          events={featuredEvents}
          loading={loadingEvents}
          bookmarkedEvents={bookmarkedEvents}
          onToggleBookmark={toggleBookmark}
          onNavigateToJob={(jobId) => router.push(`/events/${jobId}`)}
        />

        {/* 4. STEPS TO YOUR DREAM JOB */}
        <HowItWorksSteps />

        {/* 5. TOP COMPANIES / ORGANIZERS */}
        <TopOrganizers />

        {/* 6. OUR BLOG: CAREER SUCCESS */}
        <EventBlogSection />
      </div>

      {/* 8. ARE YOU EMPLOYER? CTA BANNER (Figma node 5875:29524: Full-width #EFF5FF section) */}
      {!user && (
        <div className="mt-12 sm:mt-16 lg:mt-[88px]">
          <OrganizerCtaBanner />
        </div>
      )}
    </div>
  )
}

