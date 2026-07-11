"use client"

import { useUser } from"@/components/providers/AuthProvider"
import MainLayout from"@/components/layout/MainLayout"
import StudentDashboard from"./dashboard/StudentDashboard"
import OrgDashboard from"./dashboard/OrgDashboard"

export default function Home() {
 // 🔒 P1.1: auth + role từ context (thay getUser() + profiles.select lặp)
 const { user, role, loading } = useUser()

 if (loading) return (
 <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
 <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
 </div>
 )

 if (user && role ==="organizer") {
 return <OrgDashboard />
 }

 return (
 <MainLayout role={user ? (role ||"student") :"guest"}>
 <StudentDashboard />
 </MainLayout>
 )
}
