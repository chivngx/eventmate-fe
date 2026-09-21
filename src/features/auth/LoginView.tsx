"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate, useSearchParams } from "@/lib/router"
import { supabase } from "@/lib/supabase"
import { getUserFacingMessage } from "@/lib/error"
import { loginSchema, type LoginValues } from "@/lib/schemas"
import { FloatingBadgeInput } from "./components/FloatingBadgeInput"
import { AuthSplitLayout } from "./components/AuthSplitLayout"
import { GoogleAuthButton, AuthDivider } from "./components/AuthComponents"
import {
    EMPLOYER_TESTIMONIALS,
    JOBSEEKER_TESTIMONIALS,
    AUTH_HERO_IMAGES,
    isOrganizerRole,
} from "@/lib/auth-constants"

export default function LoginView() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const roleParam = searchParams.get("role") || searchParams.get("type")
    const isEmployer = isOrganizerRole(roleParam)

    const redirectTo = searchParams.get("redirect") || (isEmployer ? "/for-employers" : "/")

    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0)

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

    // Role-based dynamic text and configurations
    const title = isEmployer ? "Đăng nhập Ban tổ chức" : "Đăng nhập"
    const subtitle = isEmployer
        ? "Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục quản lý sự kiện và tuyển dụng nhân sự."
        : "Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục quản lý và ứng tuyển công việc sự kiện."

    const emailLabel = isEmployer ? "Email doanh nghiệp / tổ chức" : "Email"
    const emailPlaceholder = isEmployer ? "name@company.com" : "name@example.com"
    const registerLink = isEmployer ? "/register?role=organizer" : "/register"
    const forgotPasswordLink = isEmployer ? "/reset-password?role=organizer" : "/reset-password"

    const switchPrompt = isEmployer ? "Bạn là người tìm việc?" : "Bạn là nhà tuyển dụng?"
    const switchLink = isEmployer ? "/login" : "/login?role=organizer"
    const switchLinkText = "Đăng nhập tại đây"
    const registerPrompt = isEmployer ? "Chưa có tài khoản Ban tổ chức?" : "Chưa có tài khoản?"

    const submitBtnClass = isEmployer
        ? "bg-[#282828] hover:bg-black"
        : "bg-[#005ddc] hover:bg-[#004bb3]"

    return (
        <AuthSplitLayout
            title={title}
            subtitle={subtitle}
            errorMessage={errorMessage}
            activeTestimonialIdx={activeTestimonialIdx}
            onSelectTestimonialIdx={setActiveTestimonialIdx}
            testimonials={isEmployer ? EMPLOYER_TESTIMONIALS : JOBSEEKER_TESTIMONIALS}
            heroImage={isEmployer ? AUTH_HERO_IMAGES.employer : AUTH_HERO_IMAGES.jobseeker}
        >
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

                {/* 2. Password */}
                <div className="flex flex-col gap-1.5 w-full">
                    <FloatingBadgeInput
                        label="Mật khẩu"
                        placeholder="Nhập mật khẩu của bạn"
                        required
                        isPassword
                        autoComplete="current-password"
                        error={errors.password?.message}
                        {...register("password")}
                    />

                    {/* Remember me & Forgot password */}
                    <div className="flex items-center justify-between text-[12.5px] sm:text-[13px] px-1 pt-0.5">
                        <label className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                className="w-3.5 h-3.5 rounded text-[#005ddc] border-slate-300 focus:ring-[#005ddc] cursor-pointer"
                            />
                            <span>Ghi nhớ đăng nhập</span>
                        </label>
                        <Link
                            to={forgotPasswordLink}
                            className="text-[#005ddc] font-medium hover:text-[#004bb3] hover:underline transition-colors"
                        >
                            Quên mật khẩu?
                        </Link>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 sm:gap-3.5 mt-1">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full h-[52px] text-white font-medium text-base rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm active:scale-98 cursor-pointer disabled:opacity-50 ${submitBtnClass}`}
                    >
                        {loading ? (
                            <div className="flex items-center gap-2 text-sm">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Đang đăng nhập...</span>
                            </div>
                        ) : (
                            "Đăng nhập"
                        )}
                    </button>

                    <AuthDivider />

                    <GoogleAuthButton
                        onClick={handleGoogleSignIn}
                        loading={googleLoading}
                        label="Đăng nhập với Google"
                    />

                    <div className="flex flex-col items-center gap-2 text-[13px] sm:text-[13.5px] text-center pt-1">
                        <div className="flex items-center justify-center gap-1.5">
                            <span className="text-slate-500 font-normal">{registerPrompt}</span>
                            <Link
                                to={registerLink}
                                className="text-[#005ddc] font-semibold underline hover:text-[#004bb3] transition-colors"
                            >
                                Đăng ký ngay
                            </Link>
                        </div>
                        <div className="text-slate-500 text-[12.5px]">
                            {switchPrompt}{" "}
                            <Link to={switchLink} className="text-[#005ddc] font-medium hover:underline">
                                {switchLinkText}
                            </Link>
                        </div>
                    </div>
                </div>
            </form>
        </AuthSplitLayout>
    )
}