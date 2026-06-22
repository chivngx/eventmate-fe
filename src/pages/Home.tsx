import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import MainLayout from "@/components/layout/MainLayout"
import StudentDashboard from "./dashboard/StudentDashboard"
import OrgDashboard from "./dashboard/OrgDashboard"

export default function Home() {
    const [loading, setLoading] = useState(true)
    const [role, setRole] = useState<string | null>(null)
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                setIsLoggedIn(true)
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", user.id)
                    .maybeSingle()

                if (profile) setRole(profile.role)
            } else {
                setIsLoggedIn(false)
            }
            setLoading(false)
        }
        fetchUserData()
    }, [])

    if (loading) return (
        <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
        </div>
    )

    if (isLoggedIn && role === "organizer") {
        return <OrgDashboard />
    }

    return (
        <MainLayout role={isLoggedIn ? (role || "student") : "guest"}>
            <StudentDashboard />
        </MainLayout>
    )
}