import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import MainLayout from "@/components/layout/MainLayout"
import StudentDashboard from "./dashboard/StudentDashboard"
import OrgDashboard from "./dashboard/OrgDashboard"

export default function Home() {
    const [loading, setLoading] = useState(true)
    const [role, setRole] = useState<string | null>(null)

    useEffect(() => {
        // ... (Giữ nguyên đoạn code fetchUserRole cũ của bạn) ...
        const fetchUserRole = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
                if (profile) setRole(profile.role)
            }
            setLoading(false)
        }
        fetchUserRole()
    }, [])

    if (loading) return <div className="flex h-screen w-screen items-center justify-center bg-slate-50"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div></div>
    if (!role) return <Navigate to="/login" replace />

    // Bọc MainLayout bên ngoài để hiển thị Navbar
    if (role === "student") {
        return (
            <MainLayout role={role}>
                <StudentDashboard />
            </MainLayout>
        )
    }

    if (role === "organizer") {
        return (
            <MainLayout role={role}>
                <OrgDashboard />
            </MainLayout>
        )
    }

    return <Navigate to="/login" replace />
}