"use client"

import { ToastProvider } from "@/components/providers/ToastProvider"
import { AuthProvider } from "@/components/providers/AuthProvider"
import { AuthModalProvider } from "@/components/providers/AuthModalProvider"
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ReactQueryProvider>
            <AuthProvider>
                <AuthModalProvider>
                    <ToastProvider>
                        {children}
                    </ToastProvider>
                </AuthModalProvider>
            </AuthProvider>
        </ReactQueryProvider>
    )
}