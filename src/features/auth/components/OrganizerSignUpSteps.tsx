"use client"

import React, { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "@/lib/router"
import { Camera, X } from "lucide-react"
import { employerRegisterSchema, type EmployerRegisterValues } from "@/lib/schemas"
import {
    FloatingBadgeInput,
    GoogleAuthButton,
    AuthDivider,
    AuthSubmitButton,
} from "./AuthComponents"

// ==========================================
// STEP 1: Basic Information
// ==========================================
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
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5 sm:gap-4" noValidate>
            {/* 1. Họ và tên người đại diện */}
            <FloatingBadgeInput
                label="Họ và tên người đại diện"
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
                label="Email tổ chức / doanh nghiệp"
                type="email"
                placeholder="contact@company.com"
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
            <div className="flex flex-col gap-3 sm:gap-3.5 mt-1">
                <AuthSubmitButton>
                    Tiếp tục
                </AuthSubmitButton>

                <AuthDivider />

                <GoogleAuthButton
                    onClick={onGoogleSignUp}
                    loading={googleLoading}
                    label="Đăng ký với Google"
                />

                <div className="flex items-center justify-center gap-1.5 text-[13px] text-center pt-1.5">
                    <span className="text-zinc-500 font-normal">Bạn đã có tài khoản?</span>
                    <Link to="/login?role=organizer" className="text-zinc-900 font-semibold hover:underline transition-colors">
                        Đăng nhập
                    </Link>
                </div>
            </div>
        </form>
    )
}

export { Step1OrganizerInfo as Step1EmployerInfo }

// ==========================================
// STEP 2: Company / Organization Details
// ==========================================
export interface Step2EmployerCompanyInfoProps {
    onSubmit: (values: {
        companyName: string
        companyField: string
        description: string
        logoFile: File | null
        logoPreviewUrl: string | null
    }) => void
    onSkip?: () => void
    loading?: boolean
}

export function Step2OrganizerCompanyInfo({
    onSubmit,
    onSkip,
    loading = false,
}: Step2EmployerCompanyInfoProps) {
    const [companyName, setCompanyName] = useState("")
    const [companyField, setCompanyField] = useState("")
    const [description, setDescription] = useState("")
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null)
    const [errors, setErrors] = useState<{ companyName?: string; description?: string }>({})

    const [logoError, setLogoError] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

function resizeImageToDataUrl(file: File, maxSize = 512): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            const img = new Image()
            img.onload = () => {
                let width = img.width
                let height = img.height
                if (width > height) {
                    if (width > maxSize) {
                        height = Math.round((height * maxSize) / width)
                        width = maxSize
                    }
                } else {
                    if (height > maxSize) {
                        width = Math.round((width * maxSize) / height)
                        height = maxSize
                    }
                }
                const canvas = document.createElement("canvas")
                canvas.width = width
                canvas.height = height
                const ctx = canvas.getContext("2d")
                if (!ctx) {
                    resolve(e.target?.result as string)
                    return
                }
                ctx.drawImage(img, 0, 0, width, height)
                resolve(canvas.toDataURL("image/jpeg", 0.85))
            }
            img.onerror = reject
            img.src = e.target?.result as string
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setLogoError(null)

        if (!file.type.startsWith("image/")) {
            setLogoError("Vui lòng chọn tệp hình ảnh (PNG, JPG, WebP...).")
            if (fileInputRef.current) fileInputRef.current.value = ""
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setLogoError("Kích thước logo không được vượt quá 5MB.")
            if (fileInputRef.current) fileInputRef.current.value = ""
            return
        }

        setLogoFile(file)
        try {
            const dataUrl = await resizeImageToDataUrl(file, 512)
            setLogoPreviewUrl(dataUrl)
        } catch {
            setLogoError("Không thể xử lý tệp ảnh. Vui lòng thử lại.")
            setLogoFile(null)
            setLogoPreviewUrl(null)
        }
    }

    const handleRemoveLogo = (e: React.MouseEvent) => {
        e.stopPropagation()
        setLogoFile(null)
        setLogoPreviewUrl(null)
        setLogoError(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const newErrors: { companyName?: string; description?: string } = {}
        if (!companyName.trim()) {
            newErrors.companyName = "Vui lòng nhập tên công ty hoặc đơn vị tổ chức."
        }
        if (!description.trim()) {
            newErrors.description = "Vui lòng nhập mô tả giới thiệu về công ty/đơn vị."
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setErrors({})
        onSubmit({
            companyName: companyName.trim(),
            companyField: companyField.trim(),
            description: description.trim(),
            logoFile,
            logoPreviewUrl,
        })
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-4.5 w-full" noValidate>
            {/* 1. Logo Upload Box */}
            <div className="flex flex-col items-center gap-1.5">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="company-logo-upload"
                />
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative size-[80px] rounded-full bg-zinc-50 border border-zinc-200 hover:border-zinc-900 flex items-center justify-center cursor-pointer transition-all duration-200 overflow-hidden shadow-xs hover:shadow-sm"
                    title="Nhấn để tải lên logo công ty"
                >
                    {logoPreviewUrl ? (
                        <>
                            <img
                                src={logoPreviewUrl}
                                alt="Logo đơn vị"
                                className="size-full object-cover rounded-full"
                                onError={() => {
                                    setLogoPreviewUrl(null)
                                    setLogoFile(null)
                                    setLogoError("Hình ảnh không thể hiển thị. Vui lòng chọn tệp khác.")
                                }}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                                <button
                                    type="button"
                                    onClick={handleRemoveLogo}
                                    className="p-1.5 bg-white text-rose-600 rounded-full transition-colors shadow-xs"
                                    title="Xóa logo"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-zinc-400 group-hover:text-zinc-800 transition-colors">
                            <Camera className="w-5 h-5 stroke-[1.5]" />
                        </div>
                    )}
                </div>
                {logoError && (
                    <p className="text-[11px] text-rose-500 font-medium text-center">
                        {logoError}
                    </p>
                )}
                <label
                    htmlFor="company-logo-upload"
                    className="text-[12px] font-medium text-zinc-500 hover:text-zinc-900 cursor-pointer transition-colors select-none text-center"
                >
                    {logoPreviewUrl ? "Thay đổi logo" : "Tải lên logo đơn vị"}
                </label>
            </div>

            {/* 2. Form Inputs */}
            <div className="flex flex-col gap-3.5 w-full">
                {/* Field 1: Company Name */}
                <div className="flex flex-col gap-1.5 w-full text-left">
                    <label htmlFor="company-name" className="text-[13px] font-medium text-zinc-700 flex items-center gap-1">
                        <span>Tên đơn vị / Doanh nghiệp</span>
                        <span className="text-rose-500">*</span>
                    </label>
                    <div
                        className={`h-[46px] w-full rounded-xl border transition-all bg-zinc-50/50 hover:bg-white focus-within:bg-white flex items-center px-3.5 ${
                            errors.companyName
                                ? "border-rose-500 ring-3 ring-rose-500/10"
                                : "border-zinc-200 hover:border-zinc-300 focus-within:border-zinc-900 focus-within:ring-4 focus-within:ring-zinc-900/5"
                        }`}
                    >
                        <input
                            id="company-name"
                            type="text"
                            value={companyName}
                            onChange={(e) => {
                                setCompanyName(e.target.value)
                                if (errors.companyName) setErrors((prev) => ({ ...prev, companyName: undefined }))
                            }}
                            placeholder="Nhập tên công ty hoặc đơn vị tổ chức"
                            className="w-full h-full bg-transparent border-none outline-none text-zinc-900 text-[14px] placeholder:text-zinc-400 shadow-none"
                        />
                    </div>
                    {errors.companyName && (
                        <p className="text-[12px] text-rose-600 font-medium pl-0.5 mt-0.5 animate-in fade-in duration-150">
                            {errors.companyName}
                        </p>
                    )}
                </div>

                {/* Field 2: Company Field */}
                <div className="flex flex-col gap-1.5 w-full text-left">
                    <label htmlFor="company-field" className="text-[13px] font-medium text-zinc-700">
                        Lĩnh vực hoạt động
                    </label>
                    <div className="h-[46px] w-full rounded-xl border border-zinc-200 hover:border-zinc-300 focus-within:border-zinc-900 focus-within:ring-4 focus-within:ring-zinc-900/5 transition-all bg-zinc-50/50 hover:bg-white focus-within:bg-white flex items-center px-3.5">
                        <input
                            id="company-field"
                            type="text"
                            value={companyField}
                            onChange={(e) => setCompanyField(e.target.value)}
                            placeholder="Ví dụ: Sự kiện âm nhạc, Triển lãm, Workshop..."
                            className="w-full h-full bg-transparent border-none outline-none text-zinc-900 text-[14px] placeholder:text-zinc-400 shadow-none"
                        />
                    </div>
                </div>

                {/* Field 3: Company Description */}
                <div className="flex flex-col gap-1.5 w-full text-left">
                    <div className="flex items-center justify-between text-[13px]">
                        <label htmlFor="company-description" className="font-medium text-zinc-700 flex items-center gap-1">
                            <span>Mô tả về đơn vị</span>
                            <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[12px] text-zinc-400 font-mono">
                            {description.length}/512
                        </span>
                    </div>
                    <div
                        className={`w-full rounded-xl border transition-all bg-zinc-50/50 hover:bg-white focus-within:bg-white p-3 ${
                            errors.description
                                ? "border-rose-500 ring-3 ring-rose-500/10"
                                : "border-zinc-200 hover:border-zinc-300 focus-within:border-zinc-900 focus-within:ring-4 focus-within:ring-zinc-900/5"
                        }`}
                    >
                        <textarea
                            id="company-description"
                            rows={3}
                            maxLength={512}
                            value={description}
                            onChange={(e) => {
                                setDescription(e.target.value)
                                if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }))
                            }}
                            placeholder="Nhập thông tin giới thiệu ngắn về quy mô, loại hình sự kiện thường tổ chức..."
                            className="w-full bg-transparent border-none outline-none text-zinc-900 text-[14px] placeholder:text-zinc-400 shadow-none resize-none min-h-[70px]"
                        />
                    </div>
                    {errors.description && (
                        <p className="text-[12px] text-rose-600 font-medium pl-0.5 mt-0.5 animate-in fade-in duration-150">
                            {errors.description}
                        </p>
                    )}
                </div>
            </div>

            {/* 3. Action Buttons */}
            <div className="flex flex-col gap-2 items-center w-full pt-1">
                <AuthSubmitButton
                    type="submit"
                    disabled={loading}
                    loading={loading}
                    loadingText="Đang lưu thông tin..."
                >
                    Hoàn tất đăng ký
                </AuthSubmitButton>

                {onSkip && (
                    <button
                        type="button"
                        onClick={onSkip}
                        disabled={loading}
                        className="text-zinc-500 hover:text-zinc-900 text-[13.5px] font-medium text-center transition-colors cursor-pointer py-1"
                    >
                        Bỏ qua bước này
                    </button>
                )}
            </div>
        </form>
    )
}

export { Step2OrganizerCompanyInfo as Step3OrganizerCompanyInfo }
export { Step2OrganizerCompanyInfo as Step3EmployerCompanyInfo }
