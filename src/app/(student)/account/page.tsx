"use client"

import { useState } from "react"
import { useUser } from "@/components/providers/AuthProvider"
import AccountSettingsView from "@/features/settings/AccountSettingsView"
import CVProfileView from "@/features/student/CVProfileView"
import { SkeletonGenericPage } from "@/components/ui/skeleton"
import { ShieldCheck, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

export default function StudentAccountPage() {
  const { user, loading } = useUser()
  const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile")

  if (loading || !user) return <SkeletonGenericPage />

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
      {/* Left Sidebar */}
      <div className="w-full lg:w-[280px] shrink-0 space-y-4 lg:sticky lg:top-6">
        <h2 className="text-xl font-bold text-slate-900 px-2">Cài đặt & Hồ sơ</h2>
        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1.5">
          <button
            onClick={() => setActiveTab("profile")}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 text-left font-medium border border-transparent outline-none focus-visible:ring-2 focus-visible:ring-zinc-900",
              activeTab === "profile"
                ? "bg-white text-slate-900 shadow-sm border-slate-200/60"
                : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
            )}
          >
            <FileText className="size-4.5" />
            <span>Hồ sơ năng lực (CV)</span>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 text-left font-medium border border-transparent outline-none focus-visible:ring-2 focus-visible:ring-zinc-900",
              activeTab === "settings"
                ? "bg-white text-slate-900 shadow-sm border-slate-200/60"
                : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
            )}
          >
            <ShieldCheck className="size-4.5" />
            <span>Tài khoản & Bảo mật</span>
          </button>
        </nav>
      </div>

      {/* Right Content */}
      <div className="flex-1 w-full min-w-0">
        {activeTab === "profile" ? (
          <CVProfileView embedded={true} />
        ) : (
          <AccountSettingsView embedded={true} />
        )}
      </div>
    </div>
  )
}
