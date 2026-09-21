"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useUser } from "@/components/providers/AuthProvider"
import MainLayout from "@/components/layout/MainLayout"
import HomeLandingView from "./HomeLandingView"

function HomeViewContent() {
    const { user, role, loading } = useUser()
    const router = useRouter()
    const searchParams = useSearchParams()
    const isJobseekerMode = searchParams.get("view") === "jobseeker" || searchParams.get("mode") === "jobseeker"

    // If an organizer visits the root "/" without explicitly requesting the jobseeker view,
    // redirect them to their dedicated home page at "/for-employers".
    useEffect(() => {
        if (!loading && user && role === "organizer" && !isJobseekerMode) {
            router.replace("/for-employers")
        }
    }, [user, role, loading, router, isJobseekerMode])

    if (loading || (user && role === "organizer" && !isJobseekerMode)) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#005DDC] border-t-transparent"></div>
            </div>
        )
    }

    return (
        <MainLayout role={user ? (role || "student") : "guest"}>
            <HomeLandingView />
        </MainLayout>
    )
}

export default function HomeView() {
    return (
        <Suspense
            fallback={
                <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#005DDC] border-t-transparent"></div>
                </div>
            }
        >
            <HomeViewContent />
        </Suspense>
    )
}
