"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "@/lib/router"
import { jobseekerRegisterSchema, type JobseekerRegisterValues } from "@/lib/schemas"
import { FloatingBadgeInput } from "../FloatingBadgeInput"
import { AuthSubmitButton, GoogleAuthButton, AuthDivider } from "../AuthComponents"

interface Step1PersonalInfoProps {
    defaultValues?: Partial<JobseekerRegisterValues>
    onSubmit: (values: JobseekerRegisterValues) => void
    onGoogleSignUp: () => void
    googleLoading?: boolean
}

export function Step1StudentInfo({
    defaultValues,
    onSubmit,
    onGoogleSignUp,
    googleLoading = false,
}: Step1PersonalInfoProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<JobseekerRegisterValues>({
        resolver: zodResolver(jobseekerRegisterSchema),
        defaultValues: {
            fullName: defaultValues?.fullName || "",
            email: defaultValues?.email || "",
            password: defaultValues?.password || "",
            confirmPassword: defaultValues?.confirmPassword || "",
        },
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5 sm:gap-4" noValidate>
            {/* 1. Họ và tên */}
            <FloatingBadgeInput
                label="Họ và tên"
                placeholder="Ví dụ: Nguyễn Văn An"
                required
                autoComplete="name"
                error={errors.fullName?.message}
                {...register("fullName")}
            />

            {/* 2. Email */}
            <FloatingBadgeInput
                label="Email"
                type="email"
                placeholder="name@example.com"
                required
                autoComplete="email"
                error={errors.email?.message}
                {...register("email")}
            />

            {/* 3. Mật khẩu */}
            <FloatingBadgeInput
                label="Mật khẩu"
                placeholder="Tối thiểu 6 ký tự"
                required
                isPassword
                autoComplete="new-password"
                error={errors.password?.message}
                {...register("password")}
            />

            {/* 4. Xác nhận mật khẩu */}
            <FloatingBadgeInput
                label="Xác nhận mật khẩu"
                placeholder="Nhập lại mật khẩu vừa tạo"
                required
                isPassword
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
            />

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:gap-3.5 mt-1">
                <AuthSubmitButton>
                    Đăng ký
                </AuthSubmitButton>

                <AuthDivider />

                <GoogleAuthButton
                    onClick={onGoogleSignUp}
                    loading={googleLoading}
                    label="Đăng ký với Google"
                />

                <div className="flex items-center justify-center gap-1.5 text-[13px] sm:text-[13.5px] text-center pt-1">
                    <span className="text-slate-500 font-normal">Bạn đã có tài khoản?</span>
                    <Link to="/login" className="text-[#005ddc] font-semibold underline hover:text-[#004bb3] transition-colors">
                        Đăng nhập
                    </Link>
                </div>
            </div>
        </form>
    )
}

export { Step1StudentInfo as Step1PersonalInfo }

