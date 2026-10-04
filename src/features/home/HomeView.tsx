"use client"

import { Suspense } from "react"
import { useUser } from "@/components/providers/AuthProvider"
import MainLayout from "@/components/layout/MainLayout"
import HomeLandingView from "./HomeLandingView"

function HomeViewContent() {
    const { user, role, loading } = useUser()

    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent"></div>
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
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent"></div>
                </div>
            }
        >
            <HomeViewContent />
        </Suspense>
    )
}
