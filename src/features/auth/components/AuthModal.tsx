"use client"

import React, { useEffect, useCallback } from "react"
import { X } from "lucide-react"
import LoginView from "../LoginView"
import StudentSignUpView from "../StudentSignUpView"
import OrganizerSignUpView from "../OrganizerSignUpView"
import ResetPasswordView from "../ResetPasswordView"

export type UserRole = "student" | "organizer"
export type AuthModalMode = "login" | "register" | "forgot"

export interface AuthModalProps {
    isOpen: boolean
    mode: AuthModalMode
    role?: UserRole
    redirectPath?: string
    customMessage?: string
    onClose: () => void
    onModeChange: (mode: AuthModalMode) => void
    onRoleChange: (role: UserRole) => void
    onSuccess?: () => void
}

export default function AuthModal({
    isOpen,
    mode,
    role = "student",
    redirectPath,
    customMessage,
    onClose,
    onModeChange,
    onRoleChange,
    onSuccess,
}: AuthModalProps) {
    // Handle ESC key to close modal
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose()
            }
        },
        [onClose]
    )

    useEffect(() => {
        if (!isOpen) return

        // Prevent body scroll when modal is open
        const originalStyle = window.getComputedStyle(document.body).overflow
        document.body.style.overflow = "hidden"
        window.addEventListener("keydown", handleKeyDown)

        return () => {
            document.body.style.overflow = originalStyle
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [isOpen, handleKeyDown])

    if (!isOpen) return null

    const handleSuccess = () => {
        if (onSuccess) {
            onSuccess()
        }
        onClose()
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Card Wrapper */}
            <div
                className="relative z-10 w-full flex items-center justify-center py-6 sm:py-10 pointer-events-none"
            >
                <div
                    className="relative w-full max-w-[440px] sm:max-w-[460px] flex justify-center pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-2 sm:right-4 top-2 sm:top-4 z-30 p-2 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-400"
                        aria-label="Đóng cửa sổ"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Dynamic View Component */}
                    {mode === "login" && (
                        <LoginView
                            isModal
                            initialRole={role}
                            redirectPath={redirectPath}
                            customMessage={customMessage}
                            onRegisterClick={() => onModeChange("register")}
                            onForgotPasswordClick={() => onModeChange("forgot")}
                            onRoleChange={onRoleChange}
                            onSuccess={handleSuccess}
                        />
                    )}

                    {mode === "register" && role === "organizer" && (
                        <OrganizerSignUpView
                            isModal
                            redirectPath={redirectPath}
                            onLoginClick={() => onModeChange("login")}
                            onRoleChange={onRoleChange}
                            onSuccess={handleSuccess}
                        />
                    )}

                    {mode === "register" && role !== "organizer" && (
                        <StudentSignUpView
                            isModal
                            redirectPath={redirectPath}
                            onLoginClick={() => onModeChange("login")}
                            onRoleChange={onRoleChange}
                            onSuccess={handleSuccess}
                        />
                    )}

                    {mode === "forgot" && (
                        <ResetPasswordView
                            isModal
                            onLoginClick={() => onModeChange("login")}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
