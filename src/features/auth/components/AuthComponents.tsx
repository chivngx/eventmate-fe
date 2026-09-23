"use client"

import React, { useState, forwardRef } from "react"
import { Link } from "@/lib/router"
import { Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { EventMateLogo as GlobalEventMateLogo } from "@/components/common/EventMateLogo"

// ==========================================
// 1. BRAND LOGO
// ==========================================
export function EventMateLogo({ className = "" }: { className?: string }) {
    return (
        <GlobalEventMateLogo
            isLink
            href="/"
            iconSize={38}
            idPrefix="auth"
            className={className}
        />
    )
}

// ==========================================
// 2. ROLE SWITCHER TABS (SEGMENTED CONTROL)
// ==========================================
export function RoleSwitcherTabs({
    activeRole,
    mode,
}: {
    activeRole: "student" | "organizer"
    mode: "login" | "register"
}) {
    const studentUrl = mode === "login" ? "/login" : "/register"
    const organizerUrl = mode === "login" ? "/login?role=organizer" : "/register?role=organizer"

    return (
        <div className="w-full grid grid-cols-2 p-1 bg-zinc-100/90 rounded-xl text-[13px] font-medium border border-zinc-200/60 mb-2 select-none">
            <Link
                to={studentUrl}
                className={`py-2 text-center rounded-lg transition-all duration-200 ${
                    activeRole === "student"
                        ? "bg-white text-zinc-900 font-semibold shadow-xs"
                        : "text-zinc-500 hover:text-zinc-900"
                }`}
            >
                Ứng viên
            </Link>
            <Link
                to={organizerUrl}
                className={`py-2 text-center rounded-lg transition-all duration-200 ${
                    activeRole === "organizer"
                        ? "bg-white text-zinc-900 font-semibold shadow-xs"
                        : "text-zinc-500 hover:text-zinc-900"
                }`}
            >
                Ban tổ chức
            </Link>
        </div>
    )
}

// ==========================================
// 3. PRIMARY ACTION SUBMIT BUTTON (Carbon theme)
// ==========================================
export interface AuthSubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean
    loadingText?: string
    children: React.ReactNode
}

export function AuthSubmitButton({
    loading = false,
    loadingText = "Đang xử lý...",
    children,
    className = "",
    disabled,
    ...props
}: AuthSubmitButtonProps) {
    return (
        <button
            type="submit"
            disabled={loading || disabled}
            className={`w-full h-[46px] rounded-xl bg-zinc-900 hover:bg-zinc-800 active:bg-black text-white text-[15px] font-medium transition-all shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] active:scale-[0.99] flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            {...props}
        >
            {loading ? (
                <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span className="text-[14px]">{loadingText}</span>
                </span>
            ) : (
                children
            )}
        </button>
    )
}

// ==========================================
// 4. GOOGLE OAUTH BUTTON (Minimalist border)
// ==========================================
export interface GoogleAuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    onClick: () => void
    loading?: boolean
    label?: string
}

export function GoogleAuthButton({
    onClick,
    loading = false,
    label = "Tiếp tục với Google",
    className = "",
    disabled,
    ...props
}: GoogleAuthButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={loading || disabled}
            className={`w-full h-[46px] rounded-xl border border-zinc-200/90 hover:border-zinc-300 bg-white hover:bg-zinc-50/80 active:bg-zinc-100 text-zinc-700 text-[14px] font-medium transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs ${className}`}
            {...props}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-zinc-800" />
            ) : (
                <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
            )}
            <span>{label}</span>
        </button>
    )
}

// ==========================================
// 5. AUTH DIVIDER ("HOẶC")
// ==========================================
export function AuthDivider({ text = "HOẶC" }: { text?: string }) {
    return (
        <div className="flex items-center gap-3.5 w-full my-0.5">
            <div className="flex-1 h-[1px] bg-zinc-200/70" />
            <span className="text-zinc-400 text-[11px] font-medium tracking-wider">{text}</span>
            <div className="flex-1 h-[1px] bg-zinc-200/70" />
        </div>
    )
}

// ==========================================
// 6. ERROR ALERT BANNER
// ==========================================
export function AuthErrorAlert({ message }: { message: string | null }) {
    if (!message) return null

    return (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50/80 border border-rose-200/80 text-rose-700 text-[13px] animate-in fade-in duration-150 w-full text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <p className="flex-1 leading-snug">{message}</p>
        </div>
    )
}

// ==========================================
// 7. SUCCESS CONFIRMATION CARD
// ==========================================
export function AuthSuccessCard({
    title,
    message,
    actionText = "Đi đến trang Đăng nhập",
    actionLink = "/login",
}: {
    title: string
    message: string
    actionText?: string
    actionLink?: string
}) {
    return (
        <div className="flex flex-col items-center text-center gap-3.5 p-6 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-zinc-800 animate-in fade-in duration-200 w-full">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            <h2 className="text-[17px] font-semibold text-zinc-900">{title}</h2>
            <p className="text-[13px] leading-relaxed text-zinc-600">{message}</p>
            <Link
                to={actionLink}
                className="mt-1 inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-[14px] transition-colors shadow-xs"
            >
                {actionText}
            </Link>
        </div>
    )
}

// ==========================================
// 8. CLEAN MODERN INPUT (Replaces Floating Badge)
// ==========================================
export interface FloatingBadgeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string
    required?: boolean
    error?: string | null
    isPassword?: boolean
    rightAction?: React.ReactNode
}

export const FloatingBadgeInput = forwardRef<HTMLInputElement, FloatingBadgeInputProps>(
    function FloatingBadgeInput(
        { label, required = false, error, isPassword = false, type = "text", id, rightAction, className = "", ...props },
        ref
    ) {
        const [showPassword, setShowPassword] = useState(false)
        const inputId = id || props.name || label.toLowerCase().replace(/\s+/g, "-")
        const resolvedType = isPassword ? (showPassword ? "text" : "password") : type

        return (
            <div className="flex flex-col gap-1.5 w-full text-left">
                {/* Top Label Row */}
                <div className="flex items-center justify-between text-[13px] leading-none">
                    <label htmlFor={inputId} className="font-medium text-zinc-700 flex items-center gap-1 select-none">
                        <span>{label}</span>
                        {required && <span className="text-rose-500 leading-none">*</span>}
                    </label>
                    {rightAction}
                </div>

                {/* Input Container */}
                <div
                    className={`relative h-[46px] w-full rounded-xl border transition-all bg-zinc-50/50 hover:bg-white focus-within:bg-white flex items-center px-3.5 gap-2 ${
                        error
                            ? "border-rose-500 ring-3 ring-rose-500/10"
                            : "border-zinc-200 hover:border-zinc-300 focus-within:border-zinc-900 focus-within:ring-4 focus-within:ring-zinc-900/5"
                    } ${className}`}
                >
                    <input
                        ref={ref}
                        id={inputId}
                        type={resolvedType}
                        className="w-full h-full bg-transparent border-none outline-none text-zinc-900 text-[14px] font-normal placeholder:text-zinc-400 focus:outline-none focus:ring-0 shadow-none"
                        {...props}
                    />
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                            className="shrink-0 p-1 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer rounded focus:outline-none"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    )}
                </div>

                {/* Error message */}
                {error && (
                    <p className="text-[12px] text-rose-600 font-medium pl-0.5 mt-0.5 animate-in fade-in duration-150">
                        {error}
                    </p>
                )}
            </div>
        )
    }
)

export { FloatingBadgeInput as CleanAuthInput }

// ==========================================
// 9. SIGN UP PROGRESS BAR
// ==========================================
export function SignUpProgressBar({ currentStep, totalSteps = 2 }: { currentStep: number; totalSteps?: number }) {
    return (
        <div
            className="flex items-center justify-center gap-2 w-full max-w-[180px] sm:max-w-[200px] mx-auto mb-1"
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
                        className={`flex-1 h-[6px] rounded-full transition-all duration-300 ${
                            isCompletedOrActive ? "bg-zinc-900" : "bg-zinc-200"
                        }`}
                    />
                )
            })}
        </div>
    )
}
