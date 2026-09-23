"use client"

import React from "react"
import { Link } from "@/lib/router"
import { EventMateLogo, AuthErrorAlert } from "./AuthComponents"
import { ArrowLeft } from "lucide-react"

export interface AuthSplitLayoutProps {
    title: string
    subtitle: string
    errorMessage?: string | null
    onBack?: () => void
    backLink?: string
    showBackButton?: boolean
    topElement?: React.ReactNode
    children: React.ReactNode
}

export function AuthSplitLayout({
    title,
    subtitle,
    errorMessage = null,
    onBack,
    backLink,
    showBackButton = false,
    topElement,
    children,
}: AuthSplitLayoutProps) {
    return (
        <main className="min-h-screen w-full bg-gradient-to-b from-zinc-50 via-slate-50 to-zinc-100/70 text-zinc-900 flex items-center justify-center p-4 sm:p-6 py-10 selection:bg-zinc-900 selection:text-white relative overflow-hidden">
            {/* Ambient subtle light glow */}
            <div
                aria-hidden="true"
                className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-zinc-200/50 to-transparent blur-3xl pointer-events-none"
            />

            {/* AUTH CONTENT CARD */}
            <div className="w-full max-w-[440px] sm:max-w-[450px] bg-white rounded-2xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 flex flex-col gap-4 sm:gap-5 my-auto relative z-10">
                {/* Optional Top Indicator (e.g. ProgressBar) */}
                {topElement}

                {/* Logo & Optional Back Button */}
                <div className="flex justify-center items-center relative pt-1">
                    {showBackButton && (
                        onBack ? (
                            <button
                                type="button"
                                onClick={onBack}
                                className="absolute left-0 p-1.5 text-zinc-400 hover:text-zinc-800 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
                                aria-label="Quay lại bước trước"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                        ) : backLink ? (
                            <Link
                                to={backLink}
                                className="absolute left-0 p-1.5 text-zinc-400 hover:text-zinc-800 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
                                aria-label="Quay lại"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                        ) : null
                    )}
                    <EventMateLogo />
                </div>

                {/* Header: Title & Subtitle */}
                <div className="flex flex-col items-center text-center gap-1.5">
                    <h1 className="text-[21px] sm:text-[23px] font-bold text-zinc-900 tracking-[-0.02em] leading-tight">
                        {title}
                    </h1>
                    <p className="text-[13px] sm:text-[13.5px] font-normal leading-relaxed text-zinc-500 max-w-[340px]">
                        {subtitle}
                    </p>
                </div>

                {/* Feedback Error Banner */}
                <AuthErrorAlert message={errorMessage} />

                {/* Main Form or State Content */}
                {children}
            </div>
        </main>
    )
}
