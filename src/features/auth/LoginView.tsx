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
} from "./components/AuthComponents"
import { isOrganizerRole } from "@/lib/auth-constants"

export default function LoginView() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const roleParam = searchParams.get("role") || searchParams.get("type")
    const isEmployer = isOrganizerRole(roleParam)

    const redirectTo = searchParams.get("redirect") || (isEmployer ? "/for-employers" : "/")

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
                const explicitRedirect = searchParams.get("redirect")
                if (explicitRedirect && explicitRedirect.startsWith("/") && explicitRedirect !== "/") {
                    navigate(explicitRedirect)
                    return
                }

                if (isEmployer) {
                    navigate("/for-employers")
                    return
                }

                // Check role from metadata or profile
                let userRole = data.user.user_metadata?.role
                if (!userRole) {
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("role")
                        .eq("id", data.user.id)
                        .maybeSingle()
                    userRole = profile?.role
                }

                if (isOrganizerRole(userRole)) {
                    navigate("/for-employers")
                } else {
                    navigate(explicitRedirect || "/")
                }
            }
        } catch (err: any) {
            setErrorMessage(err?.message || "Đã xảy ra lỗi ngoài ý muốn. Vui lòng thử lại.")
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setErrorMessage(null)
        setGoogleLoading(true)
        try {
            const targetRedirect = isEmployer
                ? `${window.location.origin}/auth/callback?role=organizer&redirect=${encodeURIComponent(redirectTo)}`
                : `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`

            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: targetRedirect,
                },
            })
            if (oauthError) {
                setErrorMessage(getUserFacingMessage(oauthError, "Không thể kết nối với Google. Vui lòng thử lại."))
                setGoogleLoading(false)
            }
        } catch (err: any) {
            setErrorMessage(err?.message || "Lỗi đăng nhập Google.")
            setGoogleLoading(false)
        }
    }

    const title = isEmployer ? "Đăng nhập Ban tổ chức" : "Đăng nhập"
    const subtitle = isEmployer
        ? "Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục quản lý sự kiện và tuyển dụng."
        : "Chào mừng trở lại! Vui lòng đăng nhập để tìm kiếm và ứng tuyển việc làm sự kiện."

    const emailLabel = isEmployer ? "Email tổ chức / doanh nghiệp" : "Email"
    const emailPlaceholder = isEmployer ? "contact@company.com" : "name@example.com"
    const registerLink = isEmployer ? "/register?role=organizer" : "/register"
    const forgotPasswordLink = isEmployer ? "/reset-password?role=organizer" : "/reset-password"

    return (
        <AuthSplitLayout
            title={title}
            subtitle={subtitle}
            errorMessage={errorMessage}
        >
            {/* Role Switcher Tabs */}
            <RoleSwitcherTabs
                activeRole={isEmployer ? "organizer" : "student"}
                mode="login"
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
                        <Link
                            to={forgotPasswordLink}
                            className="text-[12px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                        >
                            Quên mật khẩu?
                        </Link>
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
                        <Link
                            to={registerLink}
                            className="text-zinc-900 font-semibold hover:underline transition-colors"
                        >
                            Đăng ký ngay
                        </Link>
                    </div>
                </div>
            </form>
        </AuthSplitLayout>
    )
}