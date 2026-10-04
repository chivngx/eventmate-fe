"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate, useSearchParams } from "@/lib/router"
import { supabase } from "@/lib/supabase"
import { getUserFacingMessage } from "@/lib/error"
import { loginSchema, type LoginValues } from "@/lib/schemas"
import { AuthSplitLayout } from "./components/AuthSplitLayout"
import {
    FloatingBadgeInput,
    AuthSubmitButton,
    GoogleAuthButton,
    AuthDivider,
    RoleSwitcherTabs,
    signInWithGoogle,
} from "./components/AuthComponents"
import { isOrganizerRole } from "@/lib/utils"

export interface LoginViewProps {
    isModal?: boolean
    initialRole?: "student" | "organizer"
    redirectPath?: string
    customMessage?: string
    onRegisterClick?: () => void
    onForgotPasswordClick?: () => void
    onRoleChange?: (role: "student" | "organizer") => void
    onSuccess?: () => void
}

export default function LoginView({
    isModal = false,
    initialRole,
    redirectPath,
    customMessage,
    onRegisterClick,
    onForgotPasswordClick,
    onRoleChange,
    onSuccess,
}: LoginViewProps = {}) {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const roleParam = searchParams.get("role") || searchParams.get("type")
    const isEmployer = initialRole ? initialRole === "organizer" : isOrganizerRole(roleParam)

    const redirectTo = redirectPath || searchParams.get("redirect") || "/"

    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    })

    const onSubmit = async (values: LoginValues) => {
        setErrorMessage(null)
        setLoading(true)

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: values.email,
                password: values.password,
            })

            if (error) {
                setErrorMessage(getUserFacingMessage(error, "Email hoặc mật khẩu không chính xác."))
                setLoading(false)
                return
            }

            if (data.user) {
                if (isModal) {
                    if (onSuccess) {
                        onSuccess()
                    }
                    const explicitRedirect = redirectPath || searchParams.get("redirect")
                    if (explicitRedirect && explicitRedirect.startsWith("/") && explicitRedirect !== "/") {
                        navigate(explicitRedirect)
                    } else {
                        window.location.reload()
                    }
                    return
                }

                const explicitRedirect = searchParams.get("redirect")
                if (explicitRedirect && explicitRedirect.startsWith("/") && explicitRedirect !== "/") {
                    navigate(explicitRedirect)
                    return
                }

                navigate(explicitRedirect || "/")
            }
        } catch (err: any) {
            setErrorMessage(err?.message || "Đã xảy ra lỗi ngoài ý muốn. Vui lòng thử lại.")
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignIn = () => {
        signInWithGoogle({
            role: isEmployer ? "organizer" : undefined,
            redirectPath: redirectTo,
            setLoading: setGoogleLoading,
            onError: setErrorMessage,
        })
    }

    const title = isEmployer ? "Đăng nhập Ban tổ chức" : "Đăng nhập"
    const subtitle = customMessage || (isEmployer
        ? "Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục quản lý sự kiện và tuyển dụng."
        : "Chào mừng trở lại! Vui lòng đăng nhập để tìm kiếm và ứng tuyển việc làm sự kiện.")

    const emailLabel = isEmployer ? "Email tổ chức / doanh nghiệp" : "Email"
    const emailPlaceholder = isEmployer ? "contact@company.com" : "name@example.com"
    const registerLink = isEmployer ? "/?auth=register&role=organizer" : "/?auth=register"
    const forgotPasswordLink = isEmployer ? "/?auth=forgot&role=organizer" : "/?auth=forgot"

    return (
        <AuthSplitLayout
            title={title}
            subtitle={subtitle}
            errorMessage={errorMessage}
            isModal={isModal}
        >
            {/* Role Switcher Tabs */}
            <RoleSwitcherTabs
                activeRole={isEmployer ? "organizer" : "student"}
                mode="login"
                onRoleChange={onRoleChange}
            />

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5 sm:gap-4" noValidate>
                {/* 1. Email */}
                <FloatingBadgeInput
                    label={emailLabel}
                    type="email"
                    placeholder={emailPlaceholder}
                    required
                    autoComplete="email"
                    error={errors.email?.message}
                    {...register("email")}
                />

                {/* 2. Password with inline Forgot Password action */}
                <FloatingBadgeInput
                    label="Mật khẩu"
                    placeholder="Nhập mật khẩu của bạn"
                    required
                    isPassword
                    autoComplete="current-password"
                    error={errors.password?.message}
                    rightAction={
                        onForgotPasswordClick ? (
                            <button
                                type="button"
                                onClick={onForgotPasswordClick}
                                className="text-[12px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
                            >
                                Quên mật khẩu?
                            </button>
                        ) : (
                            <Link
                                to={forgotPasswordLink}
                                className="text-[12px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                            >
                                Quên mật khẩu?
                            </Link>
                        )
                    }
                    {...register("password")}
                />

                {/* Actions */}
                <div className="flex flex-col gap-3 sm:gap-3.5 mt-1">
                    <AuthSubmitButton loading={loading} loadingText="Đang đăng nhập...">
                        Đăng nhập
                    </AuthSubmitButton>

                    <AuthDivider />

                    <GoogleAuthButton
                        onClick={handleGoogleSignIn}
                        loading={googleLoading}
                        label="Đăng nhập với Google"
                    />

                    <div className="flex items-center justify-center gap-1.5 text-[13px] text-center pt-1.5">
                        <span className="text-zinc-500 font-normal">
                            {isEmployer ? "Chưa có tài khoản Ban tổ chức?" : "Chưa có tài khoản?"}
                        </span>
                        {onRegisterClick ? (
                            <button
                                type="button"
                                onClick={onRegisterClick}
                                className="text-zinc-900 font-semibold hover:underline transition-colors cursor-pointer"
                            >
                                Đăng ký ngay
                            </button>
                        ) : (
                            <Link
                                to={registerLink}
                                className="text-zinc-900 font-semibold hover:underline transition-colors"
                            >
                                Đăng ký ngay
                            </Link>
                        )}
                    </div>
                </div>
            </form>
        </AuthSplitLayout>
    )
}