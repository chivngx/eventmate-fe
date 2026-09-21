"use client"

import { ToastProvider } from "@/components/providers/ToastProvider"
import OnboardingOverlay from "@/components/ui/onboarding-overlay"
import { AuthProvider } from "@/components/providers/AuthProvider"
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider"

export function Providers({ children }: { children: React.ReactNode }) {
    // NOTE: The old hash-cleanup effect (stripping `#access_token=...` after
    // Supabase OAuth) was removed — we now use the PKCE code flow handled by
    // /auth/callback (Phase 1 Task 2), so tokens never land in the URL hash.

    return (
        <ReactQueryProvider>
            <AuthProvider>
                <ToastProvider>
                    <OnboardingOverlay />
                    {children}
                </ToastProvider>
            </AuthProvider>
        </ReactQueryProvider>
    )
}
