"use client"

import React, { useState } from "react"
import { Link } from "@/lib/router"
import { EventMateLogo, AuthErrorAlert } from "./AuthComponents"
import { AuthHeroTestimonial } from "./AuthHeroTestimonial"
import { ArrowLeft } from "lucide-react"

export interface AuthSplitLayoutProps {
    title: string
    subtitle: string
    errorMessage?: string | null
    onBack?: () => void
    backLink?: string
    showBackButton?: boolean
    topElement?: React.ReactNode
    activeTestimonialIdx?: number
    onSelectTestimonialIdx?: (idx: number) => void
    testimonials?: any[]
    heroImage?: string
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
    activeTestimonialIdx,
    onSelectTestimonialIdx,
    testimonials,
    heroImage,
    children,
}: AuthSplitLayoutProps) {
    const [localTestimonialIdx, setLocalTestimonialIdx] = useState(0)

    const resolvedIdx = activeTestimonialIdx !== undefined ? activeTestimonialIdx : localTestimonialIdx
    const resolvedSelectIdx = onSelectTestimonialIdx || setLocalTestimonialIdx

    return (
        <main className="min-h-screen w-full bg-white text-slate-900 flex flex-col lg:flex-row items-stretch justify-between p-3 sm:p-5 lg:p-4 xl:p-6 selection:bg-[#005ddc] selection:text-white">
            {/* LEFT COLUMN: AUTH CONTENT */}
            <div className="w-full lg:w-[460px] xl:w-[500px] 2xl:w-[540px] flex flex-col items-center justify-center py-4 sm:py-6 px-2 sm:px-6 lg:px-6 xl:px-10 shrink-0 mx-auto">
                <div className="w-full max-w-[380px] sm:max-w-[400px] flex flex-col gap-4 sm:gap-5 lg:gap-6 my-auto">
                    {/* Optional Top Indicator (e.g. ProgressBar) */}
                    {topElement}

                    {/* Logo & Optional Back Button */}
                    <div className="flex justify-center items-center relative">
                        {showBackButton && (
                            onBack ? (
                                <button
                                    type="button"
                                    onClick={onBack}
                                    className="absolute left-0 p-1.5 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                                    aria-label="Quay lại bước trước"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            ) : backLink ? (
                                <Link
                                    to={backLink}
                                    className="absolute left-0 p-1.5 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                                    aria-label="Quay lại"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                            ) : null
                        )}
                        <EventMateLogo />
                    </div>

                    {/* Header: Title & Subtitle */}
                    <div className="flex flex-col items-center text-center gap-2 sm:gap-2.5">
                        <h1 className="text-[24px] sm:text-[28px] xl:text-[30px] font-bold text-slate-900 tracking-tight leading-tight">
                            {title}
                        </h1>
                        <p className="text-[13.5px] sm:text-[14.5px] font-normal leading-relaxed text-slate-500 max-w-[360px]">
                            {subtitle}
                        </p>
                    </div>

                    {/* Feedback Error Banner */}
                    <AuthErrorAlert message={errorMessage} />

                    {/* Main Form or State Content */}
                    {children}
                </div>
            </div>

            {/* RIGHT COLUMN: HERO BANNER & TESTIMONIAL CAROUSEL */}
            <AuthHeroTestimonial
                activeIdx={resolvedIdx}
                onSelectIdx={resolvedSelectIdx}
                testimonials={testimonials}
                heroImage={heroImage}
            />
        </main>
    )
}

