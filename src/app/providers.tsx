"use client"

import { useEffect } from "react"
import { ToastProvider } from "@/components/ui/ToastProvider"
import OnboardingOverlay from "@/components/ui/OnboardingOverlay"

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Dọn dẹp hash fragment sau khi Supabase OAuth redirect (tránh token lưu trong URL)
    const cleanHash = () => {
      if (window.location.href.includes("#")) {
        // Đợi 300ms để Supabase Auth đọc và xử lý token fragment trước khi xóa
        setTimeout(() => {
          window.history.replaceState(
            null,
            "",
            window.location.pathname + window.location.search
          )
        }, 300)
      }
    }
    cleanHash()
    window.addEventListener("hashchange", cleanHash)
    return () => window.removeEventListener("hashchange", cleanHash)
  }, [])

  return (
    <ToastProvider>
      <OnboardingOverlay />
      {children}
    </ToastProvider>
  )
}
