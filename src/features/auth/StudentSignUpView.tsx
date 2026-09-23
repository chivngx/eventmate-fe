"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "@/lib/router"
import { supabase } from "@/lib/supabase"
import { getUserFacingMessage } from "@/lib/error"
import { jobseekerRegisterSchema, type JobseekerRegisterValues } from "@/lib/schemas"
import { AuthSplitLayout } from "./components/AuthSplitLayout"
import {
    AuthSuccessCard,
    AuthSubmitButton,
    GoogleAuthButton,
    AuthDivider,
    FloatingBadgeInput,
    RoleSwitcherTabs,
} from "./components/AuthComponents"

export default function StudentSignUpView() {
    const navigate = useNavigate()

    // UI Feedback & Loading states
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<JobseekerRegisterValues>({
        resolver: zodResolver(jobseekerRegisterSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    // Handle Form Submit -> Create account via Supabase
    const handleFormSubmit = async (values: JobseekerRegisterValues) => {
        setErrorMessage(null)
        setSuccessMessage(null)
        setLoading(true)

        try {
            const fullName = values.fullName.trim()
            const email = values.email.trim()
            const password = values.password

            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: "student",
                    },
                    emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
                },
            })

            if (signUpError) {
                setErrorMessage(getUserFacingMessage(signUpError, "Đăng ký không thành công. Vui lòng thử lại sau."))
                return
            }

            if (data.user) {
                if (data.session) {
                    navigate("/")
                } else {
                    setSuccessMessage("Đăng ký tài khoản thành công! Vui lòng kiểm tra email của bạn để xác thực tài khoản.")
                }
            }
        } catch (err: any) {
            setErrorMessage(err?.message || "Đã xảy ra lỗi ngoài ý muốn. Vui lòng thử lại.")
        } finally {
            setLoading(false)
        }
    }

    // Google Sign Up
    const handleGoogleSignUp = async () => {
        setErrorMessage(null)
        setGoogleLoading(true)
        try {
            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            })
            if (oauthError) {
                setErrorMessage(getUserFacingMessage(oauthError, "Không thể kết nối với Google. Vui lòng thử lại."))
            }
        } catch (err: any) {
            setErrorMessage(err?.message || "Lỗi đăng nhập Google.")
        } finally {
            setGoogleLoading(false)
        }
    }

    return (
        <AuthSplitLayout
            title="Đăng ký tài khoản Ứng viên"
            subtitle="Tạo tài khoản để ứng tuyển các cơ hội việc làm sự kiện hàng đầu tại Đà Nẵng."
            errorMessage={errorMessage}
        >
            {successMessage ? (
                <AuthSuccessCard
                    title="Đăng ký tài khoản thành công!"
                    message={successMessage}
                    actionText="Đi đến trang Đăng nhập"
                    actionLink="/login"
                />
            ) : (
                <>
                    {/* Role Switcher Tabs */}
                    <RoleSwitcherTabs
                        activeRole="student"
                        mode="register"
                    />

                    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-3.5 sm:gap-4" noValidate>
                        <FloatingBadgeInput
                            label="Họ và tên"
                            placeholder="Ví dụ: Nguyễn Văn An"
                            required
                            autoComplete="name"
                            error={errors.fullName?.message}
                            {...register("fullName")}
                        />
                        <FloatingBadgeInput
                            label="Email"
                            type="email"
                            placeholder="name@example.com"
                            required
                            autoComplete="email"
                            error={errors.email?.message}
                            {...register("email")}
                        />
                        <FloatingBadgeInput
                            label="Mật khẩu"
                            placeholder="Tối thiểu 6 ký tự"
                            required
                            isPassword
                            autoComplete="new-password"
                            error={errors.password?.message}
                            {...register("password")}
                        />
                        <FloatingBadgeInput
                            label="Xác nhận mật khẩu"
                            placeholder="Nhập lại mật khẩu vừa tạo"
                            required
                            isPassword
                            autoComplete="new-password"
                            error={errors.confirmPassword?.message}
                            {...register("confirmPassword")}
                        />

                        <div className="flex flex-col gap-3 sm:gap-3.5 mt-1">
                            <AuthSubmitButton loading={loading} loadingText="Đang tạo tài khoản...">
                                Đăng ký
                            </AuthSubmitButton>
                            <AuthDivider />
                            <GoogleAuthButton
                                onClick={handleGoogleSignUp}
                                loading={googleLoading}
                                label="Đăng ký với Google"
                            />
                            <div className="flex items-center justify-center gap-1.5 text-[13px] text-center pt-1.5">
                                <span className="text-zinc-500 font-normal">Bạn đã có tài khoản?</span>
                                <Link to="/login" className="text-zinc-900 font-semibold hover:underline transition-colors">
                                    Đăng nhập
                                </Link>
                            </div>
                        </div>
                    </form>
                </>
            )}
        </AuthSplitLayout>
    )
}
