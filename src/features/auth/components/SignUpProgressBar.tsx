"use client"

import React from "react"

interface SignUpProgressBarProps {
    currentStep: number
    totalSteps?: number
}

export function SignUpProgressBar({ currentStep, totalSteps = 2 }: SignUpProgressBarProps) {
    return (
        <div
            className="flex items-center gap-2 sm:gap-3 w-full"
            role="progressbar"
            aria-valuenow={currentStep}
            aria-valuemin={1}
            aria-valuemax={totalSteps}
            aria-label={`Đăng ký tài khoản - Bước ${currentStep} trên ${totalSteps}`}
        >
            {Array.from({ length: totalSteps }, (_, index) => {
                const stepNum = index + 1
                const isCompletedOrActive = stepNum <= currentStep

                return (
                    <div
                        key={stepNum}
                        className={`flex-1 h-[5px] sm:h-[6px] rounded-full transition-all duration-300 ${
                            isCompletedOrActive ? "bg-[#005ddc]" : "bg-slate-200"
                        }`}
                    />
                )
            })}
        </div>
    )
}

