"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import AuthModal, { type AuthModalMode, type UserRole } from "@/features/auth/components/AuthModal"

export interface OpenLoginOptions {
    role?: UserRole
    redirectPath?: string
    message?: string
}

export interface OpenRegisterOptions {
    role?: UserRole
    redirectPath?: string
}

interface AuthModalContextType {
    isOpen: boolean
    mode: AuthModalMode
    role: UserRole
    openLogin: (options?: OpenLoginOptions) => void
    openRegister: (options?: OpenRegisterOptions) => void
    openForgotPassword: () => void
    closeModal: () => void
    setMode: (mode: AuthModalMode) => void
    setRole: (role: UserRole) => void
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined)

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [mode, setMode] = useState<AuthModalMode>("login")
    const [role, setRole] = useState<UserRole>("student")
    const [redirectPath, setRedirectPath] = useState<string | undefined>(undefined)
    const [customMessage, setCustomMessage] = useState<string | undefined>(undefined)

    const openLogin = useCallback((options?: OpenLoginOptions) => {
        setMode("login")
        if (options?.role) setRole(options.role)
        setRedirectPath(options?.redirectPath)
        setCustomMessage(options?.message)
        setIsOpen(true)
    }, [])

    const openRegister = useCallback((options?: OpenRegisterOptions) => {
        setMode("register")
        if (options?.role) setRole(options.role)
        setRedirectPath(options?.redirectPath)
        setCustomMessage(undefined)
        setIsOpen(true)
    }, [])

    const openForgotPassword = useCallback(() => {
        setMode("forgot")
        setIsOpen(true)
    }, [])

    const closeModal = useCallback(() => {
        setIsOpen(false)
        setCustomMessage(undefined)
        if (typeof window !== "undefined") {
            const url = new URL(window.location.href)
            if (url.searchParams.has("auth") || url.searchParams.has("mode")) {
                url.searchParams.delete("auth")
                url.searchParams.delete("mode")
                const newQuery = url.searchParams.toString()
                window.history.replaceState({}, "", url.pathname + (newQuery ? `?${newQuery}` : ""))
            }
        }
    }, [])

    // URL-based trigger: Automatically open modal when ?auth=login|register|forgot exists
    useEffect(() => {
        if (typeof window === "undefined") return

        const checkUrlAuth = () => {
            const params = new URLSearchParams(window.location.search)
            const authParam = params.get("auth") || params.get("mode")
            const roleParam = params.get("role") || params.get("type")
            const redirectParam = params.get("redirect")

            if (authParam === "login") {
                openLogin({
                    role: roleParam === "organizer" || roleParam === "employer" ? "organizer" : "student",
                    redirectPath: redirectParam || undefined,
                })
            } else if (authParam === "register" || authParam === "signup") {
                openRegister({
                    role: roleParam === "organizer" || roleParam === "employer" ? "organizer" : "student",
                    redirectPath: redirectParam || undefined,
                })
            } else if (authParam === "forgot" || authParam === "reset-password") {
                openForgotPassword()
            }
        }

        checkUrlAuth()
        window.addEventListener("popstate", checkUrlAuth)
        return () => window.removeEventListener("popstate", checkUrlAuth)
    }, [openLogin, openRegister, openForgotPassword])

    // Global event listeners for triggering modal across app
    useEffect(() => {
        const handleOpenAuthModal = (e: CustomEvent) => {
            const detail = e.detail || {}
            if (detail.mode === "register") {
                openRegister({ role: detail.role, redirectPath: detail.redirectPath })
            } else if (detail.mode === "forgot") {
                openForgotPassword()
            } else {
                openLogin({ role: detail.role, redirectPath: detail.redirectPath, message: detail.message })
            }
        }

        const handleRequireAuth = (e: CustomEvent) => {
            const detail = e.detail || {}
            openLogin({
                role: detail.role,
                redirectPath: detail.redirectPath,
                message: detail.message || "Vui lòng đăng nhập để tiếp tục",
            })
        }

        window.addEventListener("open-auth-modal" as any, handleOpenAuthModal)
        window.addEventListener("require-auth" as any, handleRequireAuth)

        return () => {
            window.removeEventListener("open-auth-modal" as any, handleOpenAuthModal)
            window.removeEventListener("require-auth" as any, handleRequireAuth)
        }
    }, [openLogin, openRegister, openForgotPassword])

    return (
        <AuthModalContext.Provider
            value={{
                isOpen,
                mode,
                role,
                openLogin,
                openRegister,
                openForgotPassword,
                closeModal,
                setMode,
                setRole,
            }}
        >
            {children}
            <AuthModal
                isOpen={isOpen}
                mode={mode}
                role={role}
                redirectPath={redirectPath}
                customMessage={customMessage}
                onClose={closeModal}
                onModeChange={setMode}
                onRoleChange={setRole}
            />
        </AuthModalContext.Provider>
    )
}

export function useAuthModal() {
    const context = useContext(AuthModalContext)
    if (!context) {
        throw new Error("useAuthModal must be used within an AuthModalProvider")
    }
    return context
}
