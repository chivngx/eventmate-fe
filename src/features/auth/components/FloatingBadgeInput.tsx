"use client"

import React, { useState, forwardRef } from "react"
import { Eye, EyeOff } from "lucide-react"

export interface FloatingBadgeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string
    required?: boolean
    error?: string | null
    isPassword?: boolean
}

export const FloatingBadgeInput = forwardRef<HTMLInputElement, FloatingBadgeInputProps>(
    function FloatingBadgeInput(
        { label, required = false, error, isPassword = false, type = "text", id, className = "", ...props },
        ref
    ) {
        const [showPassword, setShowPassword] = useState(false)
        const inputId = id || props.name || label.toLowerCase().replace(/\s+/g, "-")

        const resolvedType = isPassword ? (showPassword ? "text" : "password") : type

        return (
            <div className="relative w-full">
                <div
                    className={`relative h-[48px] sm:h-[52px] w-full rounded-xl border transition-colors bg-white flex items-center px-3.5 sm:px-4 gap-2 ${
                        error
                            ? "border-rose-500 ring-1 ring-rose-500"
                            : "border-slate-300 hover:border-slate-400 focus-within:border-[#005ddc] focus-within:ring-1 focus-within:ring-[#005ddc]"
                    } ${className}`}
                >
                    <input
                        ref={ref}
                        id={inputId}
                        type={resolvedType}
                        className="w-full h-full bg-transparent border-none outline-none text-slate-900 text-[14px] sm:text-[15px] font-normal placeholder:text-slate-400 focus:outline-none focus:ring-0 shadow-none"
                        {...props}
                    />
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                            className="shrink-0 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-[#005ddc]"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> : <Eye className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
                        </button>
                    )}
                </div>
                <label
                    htmlFor={inputId}
                    className="absolute -top-2 left-3 bg-white px-1.5 py-0.5 rounded-full text-[12px] sm:text-[12.5px] font-medium text-slate-700 flex items-center gap-0.5 select-none pointer-events-none z-10 leading-none shadow-[0_0_2px_rgba(255,255,255,0.8)]"
                >
                    <span>{label}</span>
                    {required && <span className="text-rose-500 font-semibold text-[14px] leading-none">*</span>}
                </label>
                {error && (
                    <p className="text-[11.5px] sm:text-[12px] text-rose-600 mt-1 pl-1.5 font-medium animate-in fade-in duration-150">
                        {error}
                    </p>
                )}
            </div>
        )
    }
)

