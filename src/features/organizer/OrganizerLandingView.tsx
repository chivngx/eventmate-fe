"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/components/providers/AuthProvider"
import { isOrganizerRole } from "@/lib/auth-constants"
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

  // Block direct access for users logged in as student / jobseeker
  useEffect(() => {
    if (!loading && user && !isOrganizerRole(currentRole)) {
      router.replace("/")
    }
  }, [user, currentRole, loading, router])

  if (!loading && user && !isOrganizerRole(currentRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#005DDC] border-t-transparent" />
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
