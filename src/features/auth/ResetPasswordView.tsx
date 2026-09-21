"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useSearchParams } from "@/lib/router"
import { supabase } from "@/lib/supabase"
import { getUserFacingMessage } from "@/lib/error"
import {
    forgotPasswordSchema,
    passwordChangeSchema,
    type ForgotPasswordValues,
    type PasswordChangeValues,
} from "@/lib/schemas"
import { FloatingBadgeInput } from "./components/FloatingBadgeInput"
import { AuthSplitLayout } from "./components/AuthSplitLayout"
import { AuthSuccessCard } from "./components/AuthComponents"
import { Loader2 } from "lucide-react"
import {
    EMPLOYER_TESTIMONIALS,
    JOBSEEKER_TESTIMONIALS,
    AUTH_HERO_IMAGES,
    isOrganizerRole,
} from "@/lib/auth-constants"

export default function ResetPasswordView() {
    const [searchParams] = useSearchParams()

    const roleParam = searchParams.get("role") || searchParams.get("type")
    const isEmployer = isOrganizerRole(roleParam)

    // Check if recovery mode (user arrived via recovery email link)
    const [isUpdateMode, setIsUpdateMode] = useState(false)
    const [checkingSession, setCheckingSession] = useState(true)

    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0)

    // Form 1: Forgot Password (Request reset email)
    const forgotForm = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" },
    })

    // Form 2: Update Password (New password)
    const updateForm = useForm<PasswordChangeValues>({
        resolver: zodResolver(passwordChangeSchema),
        defaultValues: { newPassword: "", confirmPassword: "" },
    })

    useEffect(() => {
        const checkRecoveryState = async () => {
            try {
                const modeParam = searchParams.get("mode")
                const typeParam = searchParams.get("type")

                const { data: { session } } = await supabase.auth.getSession()

                if (
                    modeParam === "update" ||
                    typeParam === "recovery" ||
                    (session && typeof window !== "undefined" && window.location.hash.includes("type=recovery"))
                ) {
                    setIsUpdateMode(true)
                } else if (session) {
                    setIsUpdateMode(true)
                }
            } finally {
                setCheckingSession(false)
            }
        }

        checkRecoveryState()
    }, [searchParams])

    // Handle Forgot Password Request
    const handleForgotSubmit = async (values: ForgotPasswordValues) => {
        setErrorMessage(null)
        setSuccessMessage(null)
        setLoading(true)

        try {
            const redirectUrl = isEmployer
                ? `${window.location.origin}/auth/callback?role=organizer&redirect=/reset-password?role=organizer&mode=update`
                : `${window.location.origin}/auth/callback?redirect=/reset-password&mode=update`

            const { error } = await supabase.auth.resetPasswordForEmail(values.email.trim(), {
                redirectTo: redirectUrl,
            })

            if (error) {
                setErrorMessage(getUserFacingMessage(error, "Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau."))
                setLoading(false)
                return
            }

            setSuccessMessage(
                "Đã gửi liên kết khôi phục mật khẩu! Vui lòng kiểm tra hộp thư email của bạn (bao gồm cả thư mục Spam)."
            )
        } catch (err: any) {
            setErrorMessage(err?.message || "Đã xảy ra lỗi ngoài ý muốn. Vui lòng thử lại.")
        } finally {
            setLoading(false)
        }
    }

    // Handle Set New Password
    const handleUpdateSubmit = async (values: PasswordChangeValues) => {
        setErrorMessage(null)
        setSuccessMessage(null)
        setLoading(true)

        try {
            const { error } = await supabase.auth.updateUser({
                password: values.newPassword,
            })

            if (error) {
                setErrorMessage(
                    getUserFacingMessage(
                        error,
                        "Không thể cập nhật mật khẩu mới. Liên kết có thể đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu lại liên kết mới."
                    )
                )
                setLoading(false)
                return
            }

            setSuccessMessage("Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.")
        } catch (err: any) {
            setErrorMessage(err?.message || "Đã xảy ra lỗi ngoài ý muốn. Vui lòng thử lại.")
        } finally {
            setLoading(false)
        }
    }

    if (checkingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white text-[#222222]">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin text-[#005ddc]" />
                    <span>Đang tải...</span>
                </div>
            </div>
        )
    }

    const loginLink = isEmployer ? "/login?role=organizer" : "/login"

    const title = isUpdateMode
        ? "Đặt lại mật khẩu mới"
        : isEmployer
        ? "Khôi phục mật khẩu Ban tổ chức"
        : "Khôi phục mật khẩu"

    const subtitle = isUpdateMode
        ? isEmployer
            ? "Vui lòng nhập mật khẩu mới bảo mật cho tài khoản Ban tổ chức của bạn."
            : "Vui lòng nhập mật khẩu mới bảo mật cho tài khoản EventMate của bạn."
        : isEmployer
        ? "Nhập email tài khoản Ban tổ chức / Doanh nghiệp để nhận hướng dẫn và liên kết khôi phục mật khẩu."
        : "Nhập email của bạn để nhận hướng dẫn và liên kết khôi phục mật khẩu."

    const emailLabel = isEmployer ? "Email doanh nghiệp / tổ chức" : "Email tài khoản"
    const emailPlaceholder = isEmployer ? "name@company.com" : "name@example.com"

    const submitBtnClass = isEmployer
        ? "bg-[#282828] hover:bg-black"
        : "bg-[#005ddc] hover:bg-[#004bb3]"

    return (
        <AuthSplitLayout
            title={title}
            subtitle={subtitle}
            errorMessage={errorMessage}
            showBackButton
            backLink={loginLink}
            activeTestimonialIdx={activeTestimonialIdx}
            onSelectTestimonialIdx={setActiveTestimonialIdx}
            testimonials={isEmployer ? EMPLOYER_TESTIMONIALS : JOBSEEKER_TESTIMONIALS}
            heroImage={isEmployer ? AUTH_HERO_IMAGES.employer : AUTH_HERO_IMAGES.jobseeker}
        >
            {successMessage ? (
                <AuthSuccessCard
                    title={isUpdateMode ? "Cập nhật mật khẩu thành công!" : "Đã gửi liên kết khôi phục!"}
                    message={successMessage}
                    actionText="Quay lại Đăng nhập"
                    actionLink={loginLink}
                />
            ) : isUpdateMode ? (
                /* Update Password Form */
                <form onSubmit={updateForm.handleSubmit(handleUpdateSubmit)} className="flex flex-col gap-3.5 sm:gap-4" noValidate>
                    {/* 1. New Password */}
                    <FloatingBadgeInput
                        label="Mật khẩu mới"
                        placeholder="Tối thiểu 6 ký tự"
                        required
                        isPassword
                        autoComplete="new-password"
                        error={updateForm.formState.errors.newPassword?.message}
                        {...updateForm.register("newPassword")}
                    />

                    {/* 2. Confirm Password */}
                    <FloatingBadgeInput
                        label="Xác nhận mật khẩu mới"
                        placeholder="Nhập lại mật khẩu mới vừa đặt"
                        required
                        isPassword
                        autoComplete="new-password"
                        error={updateForm.formState.errors.confirmPassword?.message}
                        {...updateForm.register("confirmPassword")}
                    />

                    {/* Actions */}
                    <div className="flex flex-col gap-3 sm:gap-3.5 mt-1">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full h-[52px] text-white font-medium text-base rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm active:scale-98 cursor-pointer disabled:opacity-50 ${submitBtnClass}`}
                        >
                            {loading ? "Đang lưu mật khẩu..." : "Lưu mật khẩu mới"}
                        </button>

                        <div className="flex items-center justify-center gap-1.5 text-[13px] sm:text-[13.5px] text-center pt-1">
                            <Link to={loginLink} className="text-[#005ddc] font-semibold underline hover:text-[#004bb3] transition-colors">
                                Hủy và quay lại Đăng nhập
                            </Link>
                        </div>
                    </div>
                </form>
            ) : (
                /* Forgot Password Request Form */
                <form onSubmit={forgotForm.handleSubmit(handleForgotSubmit)} className="flex flex-col gap-3.5 sm:gap-4" noValidate>
                    {/* 1. Email */}
                    <FloatingBadgeInput
                        label={emailLabel}
                        type="email"
                        placeholder={emailPlaceholder}
                        required
                        autoComplete="email"
                        error={forgotForm.formState.errors.email?.message}
                        {...forgotForm.register("email")}
                    />

                    {/* Actions */}
                    <div className="flex flex-col gap-3 sm:gap-3.5 mt-1">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full h-[52px] text-white font-medium text-base rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm active:scale-98 cursor-pointer disabled:opacity-50 ${submitBtnClass}`}
                        >
                            {loading ? "Đang gửi email..." : "Gửi liên kết khôi phục"}
                        </button>

                        <div className="flex items-center justify-center gap-1.5 text-[13px] sm:text-[13.5px] text-center pt-1">
                            <span className="text-slate-500 font-normal">Đã nhớ mật khẩu?</span>
                            <Link to={loginLink} className="text-[#005ddc] font-semibold underline hover:text-[#004bb3] transition-colors">
                                Đăng nhập
                            </Link>
                        </div>
                    </div>
                </form>
            )}
        </AuthSplitLayout>
    )
}
