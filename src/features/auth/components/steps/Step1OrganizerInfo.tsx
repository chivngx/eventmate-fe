"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "@/lib/router"
import { employerRegisterSchema, type EmployerRegisterValues } from "@/lib/schemas"
import { FloatingBadgeInput } from "../FloatingBadgeInput"
import { GoogleAuthButton, AuthDivider } from "../AuthComponents"

interface Step1EmployerInfoProps {
    defaultValues?: Partial<EmployerRegisterValues>
    onSubmit: (values: EmployerRegisterValues) => void
    onGoogleSignUp: () => void
    googleLoading?: boolean
}

export function Step1OrganizerInfo({
    defaultValues,
    onSubmit,
    onGoogleSignUp,
    googleLoading = false,
}: Step1EmployerInfoProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<EmployerRegisterValues>({
        resolver: zodResolver(employerRegisterSchema),
        defaultValues: {
            fullName: defaultValues?.fullName || "",
            role: defaultValues?.role || "",
            email: defaultValues?.email || "",
            password: defaultValues?.password || "",
            confirmPassword: defaultValues?.confirmPassword || "",
        },
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:gap-5" noValidate>
            {/* 1. Họ và tên người đại diện */}
            <FloatingBadgeInput
                label="Họ và tên"
                placeholder="Ví dụ: Nguyễn Văn An"
                required
                autoComplete="name"
                error={errors.fullName?.message}
                {...register("fullName")}
            />

            {/* 2. Chức vụ / Vị trí trong ban tổ chức */}
            <FloatingBadgeInput
                label="Chức vụ"
                placeholder="Ví dụ: Trưởng ban nhân sự / Giám đốc sự kiện"
                required
                error={errors.role?.message}
                {...register("role")}
            />

            {/* 3. Email doanh nghiệp / tổ chức */}
            <FloatingBadgeInput
                label="Email"
                type="email"
                placeholder="contact@company.com / name@event.vn"
                required
                autoComplete="email"
                error={errors.email?.message}
                {...register("email")}
            />

            {/* 4. Mật khẩu */}
            <FloatingBadgeInput
                label="Mật khẩu"
                placeholder="Tối thiểu 6 ký tự"
                required
                isPassword
                autoComplete="new-password"
                error={errors.password?.message}
                {...register("password")}
            />

            {/* 5. Xác nhận mật khẩu */}
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
            <div className="flex flex-col gap-3.5 sm:gap-4 mt-2">
                {/* Submit button matching Figma Buttons 5875:24067 (bg-[#282828] h-[56px] rounded-[8px] text-[20px]) */}
                <button
                    type="submit"
                    className="w-full h-[56px] bg-[#282828] hover:bg-black text-white text-[18px] sm:text-[20px] font-medium rounded-[8px] flex items-center justify-center transition-all duration-200 shadow-sm active:scale-98 cursor-pointer"
                >
                    Tiếp tục
                </button>

                <AuthDivider />

                <GoogleAuthButton
                    onClick={onGoogleSignUp}
                    loading={googleLoading}
                    label="Đăng ký với Google"
                />

                <div className="flex items-center justify-center gap-1.5 text-[14px] text-center pt-1">
                    <span className="text-[#757575] font-normal">Bạn đã có tài khoản?</span>
                    <Link to="/login" className="text-[#005ddc] font-semibold hover:underline transition-colors">
                        Đăng nhập
                    </Link>
                </div>
            </div>
        </form>
    )
}

export { Step1OrganizerInfo as Step1EmployerInfo }
