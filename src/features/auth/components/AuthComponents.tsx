"use client"

import React from "react"
import { Link } from "@/lib/router"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

// ==========================================
// 1. BRAND LOGO
// ==========================================
export function EventMateLogo({ className = "" }: { className?: string }) {
    return (
        <Link
            to="/"
            className={`inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#005ddc] rounded-md ${className}`}
        >
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#005ddc] text-white flex items-center justify-center text-xs sm:text-sm font-black shadow-xs">
                EM
            </span>
            <span className="text-lg sm:text-xl xl:text-2xl font-black tracking-tight text-slate-900">
                Event<span className="text-[#005ddc]">Mate</span>
            </span>
        </Link>
    )
}

// ==========================================
// 2. PRIMARY ACTION SUBMIT BUTTON
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
            className={`w-full h-[46px] sm:h-[50px] rounded-xl bg-[#005ddc] hover:bg-[#004bb3] active:bg-[#063b82] text-white text-[15px] sm:text-[16px] font-semibold transition-all shadow-sm active:scale-[0.99] flex items-center justify-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
            {...props}
        >
            {loading ? (
                <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-white" />
                    <span className="text-[14px] sm:text-[15px]">{loadingText}</span>
                </span>
            ) : (
                children
            )}
        </button>
    )
}

// ==========================================
// 3. GOOGLE OAUTH BUTTON
// ==========================================
export interface GoogleAuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    onClick: () => void
    loading?: boolean
    label?: string
}

export function GoogleAuthButton({
    onClick,
    loading = false,
    label = "Đăng ký với Google",
    className = "",
    disabled,
    ...props
}: GoogleAuthButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={loading || disabled}
            className={`w-full h-[46px] sm:h-[50px] rounded-xl border border-slate-300 hover:border-slate-400 hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-[14px] sm:text-[15px] font-medium transition-all flex items-center justify-center gap-2.5 sm:gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
            {...props}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-[#005ddc]" />
            ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
// 4. AUTH DIVIDER ("HOẶC")
// ==========================================
export function AuthDivider({ text = "HOẶC" }: { text?: string }) {
    return (
        <div className="flex items-center gap-3.5 w-full my-0.5">
            <div className="flex-1 h-[1px] bg-slate-200" />
            <span className="text-slate-400 text-[12px] sm:text-[12.5px] font-medium tracking-wider">{text}</span>
            <div className="flex-1 h-[1px] bg-slate-200" />
        </div>
    )
}

// ==========================================
// 5. ERROR ALERT BANNER
// ==========================================
export function AuthErrorAlert({ message }: { message: string | null }) {
    if (!message) return null

    return (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[13px] sm:text-[13.5px] animate-in fade-in duration-200 w-full">
            <AlertCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 text-rose-600 mt-0.5" />
            <p className="flex-1 leading-snug">{message}</p>
        </div>
    )
}

// ==========================================
// 6. SUCCESS CONFIRMATION CARD
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
        <div className="flex flex-col items-center text-center gap-3.5 p-5 sm:p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 animate-in fade-in duration-200 w-full">
            <CheckCircle2 className="w-10 h-10 sm:w-11 sm:h-11 text-emerald-600" />
            <h2 className="text-[16px] sm:text-[17px] font-semibold text-emerald-900">{title}</h2>
            <p className="text-[13px] sm:text-[13.5px] leading-relaxed text-emerald-700">{message}</p>
            <Link
                to={actionLink}
                className="mt-1.5 inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#005ddc] hover:bg-[#004bb3] text-white font-semibold text-[14px] transition-colors shadow-sm"
            >
                {actionText}
            </Link>
        </div>
    )
}

