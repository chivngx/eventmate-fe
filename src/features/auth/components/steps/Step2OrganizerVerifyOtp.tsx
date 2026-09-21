"use client"

import React, { useState, useRef, useEffect } from "react"
import { Link } from "@/lib/router"
import { Info } from "lucide-react"

interface Step2EmployerVerifyOtpProps {
    email: string
    onVerify: (otp: string) => void
    onResend: () => void
    onBack?: () => void
    loading?: boolean
    resendCooldown?: number
}

export function Step2OrganizerVerifyOtp({
    email: _email,
    onVerify,
    onResend,
    onBack,
    loading = false,
    resendCooldown = 300, // 5 minutes
}: Step2EmployerVerifyOtpProps) {
    const [otp, setOtp] = useState<string[]>(["", "", "", ""])
    const [timeLeft, setTimeLeft] = useState<number>(resendCooldown)
    const [showResentToast, setShowResentToast] = useState(false)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Countdown Timer (format mm:ss)
    useEffect(() => {
        if (timeLeft <= 0) return
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
        }, 1000)
        return () => clearInterval(timer)
    }, [timeLeft])

    // Auto-focus first input on load
    useEffect(() => {
        inputRefs.current[0]?.focus()
    }, [])

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s < 10 ? "0" : ""}${s}`
    }

    const handleChange = (index: number, value: string) => {
        // Support paste of multiple digits
        if (value.length > 1) {
            const digits = value.replace(/\D/g, "").slice(0, 4).split("")
            const newOtp = [...otp]
            digits.forEach((d, i) => {
                newOtp[i] = d
            })
            setOtp(newOtp)
            const nextIdx = Math.min(digits.length, 3)
            inputRefs.current[nextIdx]?.focus()
            return
        }

        const digit = value.replace(/\D/g, "")
        const newOtp = [...otp]
        newOtp[index] = digit
        setOtp(newOtp)

        if (digit && index < 3) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handleResendCode = () => {
        if (timeLeft > 0) return
        onResend()
        setTimeLeft(resendCooldown)
        setShowResentToast(true)
        setTimeout(() => setShowResentToast(false), 4000)
    }

    const isComplete = otp.every((digit) => digit.length === 1)
    const otpString = otp.join("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (isComplete) {
            onVerify(otpString)
        }
    }

    return (
        <div className="flex flex-col items-center w-full relative">
            {/* Resent Status Toast matching Figma 6104:43449 */}
            {showResentToast && (
                <div className="mb-4 w-full bg-[#E4FFFF] border border-[#B3F5F5] p-3.5 rounded-[8px] flex items-center gap-2.5 text-[#044747] text-sm font-semibold animate-in fade-in duration-200">
                    <Info className="w-5 h-5 shrink-0 text-[#00AEAE]" />
                    <span>Mã xác thực mới đã được gửi lại vào email của bạn</span>
                </div>
            )}

            {/* Switcher link under logo matching Figma 6104:26616 */}
            <div className="flex items-center justify-center gap-1.5 text-center mb-6">
                <span className="text-sm font-medium text-[#757575]">
                    Bạn là người tìm việc?
                </span>
                <Link
                    to="/register"
                    className="text-sm font-semibold text-[#005DDC] hover:underline transition-colors"
                >
                    Bấm vào đây
                </Link>
            </div>

            {/* 4-Box OTP Input Form matching Figma 6104:26620 */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 items-center w-full">
                {/* 4 Square Inputs */}
                <div className="flex gap-4 sm:gap-5 justify-center items-center w-full">
                    {otp.map((digit, idx) => (
                        <input
                            key={idx}
                            ref={(el) => {
                                inputRefs.current[idx] = el
                            }}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(idx, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(idx, e)}
                            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[8px] border text-center text-2xl font-bold transition-all focus:outline-none ${
                                digit
                                    ? "border-[#005DDC] bg-blue-50/20 text-[#222222]"
                                    : "border-[#a5a5a5] bg-white text-[#222222] focus:border-[#005DDC] focus:ring-1 focus:ring-[#005DDC]"
                            }`}
                        />
                    ))}
                </div>

                {/* Expiration Timer matching Figma TextLogin (property1="sub") */}
                <div className="flex items-center justify-center gap-1.5 text-xs sm:text-[13px] text-center">
                    <span className="text-[#757575] font-normal">Mã xác thực sẽ hết hạn trong</span>
                    <span className="text-[#005ddc] font-semibold">{formatTime(timeLeft)}</span>
                </div>

                {/* Submit and Resend Actions matching Figma 6104:26627 */}
                <div className="flex flex-col gap-4 w-full mt-2">
                    <button
                        type="submit"
                        disabled={!isComplete || loading}
                        className={`w-full h-[56px] text-[18px] sm:text-[20px] font-medium rounded-[8px] flex items-center justify-center transition-all duration-200 shadow-sm ${
                            isComplete && !loading
                                ? "bg-[#282828] hover:bg-black text-white cursor-pointer active:scale-98"
                                : "bg-[#ededed] text-[#a5a5a5] cursor-not-allowed"
                        }`}
                    >
                        {loading ? "Đang xác thực..." : "Xác thực"}
                    </button>

                    <div className="flex items-center justify-center gap-1.5 text-xs sm:text-[13px] text-center">
                        <span className="text-[#757575] font-normal">Không nhận được mã?</span>
                        <button
                            type="button"
                            onClick={handleResendCode}
                            disabled={timeLeft > 0}
                            className={`font-semibold transition-colors ${
                                timeLeft > 0
                                    ? "text-slate-400 cursor-not-allowed"
                                    : "text-[#005ddc] hover:underline cursor-pointer"
                            }`}
                        >
                            Gửi lại
                        </button>
                    </div>

                    {onBack && (
                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={onBack}
                                className="text-xs text-slate-500 hover:text-slate-800 underline transition-colors cursor-pointer"
                            >
                                Quay lại chỉnh sửa thông tin
                            </button>
                        </div>
                    )}
                </div>
            </form>
        </div>
    )
}

export { Step2OrganizerVerifyOtp as Step2EmployerVerifyOtp }
