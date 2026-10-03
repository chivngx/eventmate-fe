"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/components/providers/AuthProvider"
import { isOrganizerRole } from "@/lib/utils"
import MainLayout from "@/components/layout/MainLayout"
import OrganizerHero from "./components/landing/OrganizerHero"
import OrganizerStats from "./components/landing/OrganizerStats"
import OrganizerPartnerCloud from "./components/landing/OrganizerPartnerCloud"
import OrganizerFeaturesGrid from "./components/landing/OrganizerFeaturesGrid"
import OrganizerTestimonialsSlider from "./components/landing/OrganizerTestimonialsSlider"
import OrganizerBottomCta from "./components/landing/OrganizerBottomCta"

export default function OrganizerLandingView() {
  const { user, profile, role, loading } = useUser()
  const router = useRouter()

  const currentRole = role || profile?.role
  const [isGuestMode, setIsGuestMode] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      if (params.get("guest") === "1" || params.get("mode") === "guest") {
        setIsGuestMode(true)
      }
    }
  }, [])

  // Block direct access for users logged in as student / jobseeker (unless in guest preview)
  useEffect(() => {
    if (!loading && user && !isOrganizerRole(currentRole) && !isGuestMode) {
      router.replace("/")
    }
  }, [user, currentRole, loading, router, isGuestMode])

  if (!loading && user && !isOrganizerRole(currentRole) && !isGuestMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
      </div>
    )
  }

  return (
    <MainLayout fullWidth={true}>
      {({ navbar }: { navbar: React.ReactNode }) => (
        <div className="w-full flex flex-col">
          <OrganizerHero navbar={navbar} />
          <OrganizerStats />
          <OrganizerPartnerCloud />
          <OrganizerFeaturesGrid />
          <OrganizerTestimonialsSlider />
          <OrganizerBottomCta />
        </div>
      )}
    </MainLayout>
  )
}
