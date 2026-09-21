"use client"

import React, { useState, useRef } from "react"
import { Camera, X } from "lucide-react"

export interface Step3EmployerCompanyInfoProps {
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

export function Step3OrganizerCompanyInfo({
    onSubmit,
    onSkip,
    loading = false,
}: Step3EmployerCompanyInfoProps) {
    const [companyName, setCompanyName] = useState("")
    const [companyField, setCompanyField] = useState("")
    const [description, setDescription] = useState("")
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null)
    const [errors, setErrors] = useState<{ companyName?: string; description?: string }>({})

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setLogoFile(file)
            const preview = URL.createObjectURL(file)
            setLogoPreviewUrl(preview)
        }
    }

    const handleRemoveLogo = (e: React.MouseEvent) => {
        e.stopPropagation()
        setLogoFile(null)
        if (logoPreviewUrl) {
            URL.revokeObjectURL(logoPreviewUrl)
            setLogoPreviewUrl(null)
        }
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5 w-full" noValidate>
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
                    className="group relative size-[84px] sm:size-[88px] rounded-full bg-white border border-[#cbcbcb] hover:border-[#005DDC] flex items-center justify-center cursor-pointer transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md"
                    title="Nhấn để tải lên logo công ty"
                >
                    {logoPreviewUrl ? (
                        <>
                            <img
                                src={logoPreviewUrl}
                                alt="Logo Preview"
                                className="size-full object-cover rounded-full"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                                <button
                                    type="button"
                                    onClick={handleRemoveLogo}
                                    className="p-1.5 bg-white/90 hover:bg-white text-rose-600 rounded-full transition-colors shadow-sm"
                                    title="Xóa logo"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-slate-500 group-hover:text-[#005DDC] transition-colors">
                            <Camera className="w-6 h-6 stroke-[1.5]" />
                        </div>
                    )}
                </div>
                <label
                    htmlFor="company-logo-upload"
                    className="text-[12px] font-normal text-[#515151] hover:text-[#005DDC] cursor-pointer transition-colors select-none text-center"
                >
                    {logoPreviewUrl ? "Thay đổi logo" : "Tải lên logo của bạn"}
                </label>
            </div>

            {/* 2. Form Inputs */}
            <div className="flex flex-col gap-5 w-full">
                {/* Field 1: Company Name */}
                <div className="relative w-full">
                    <div
                        className={`relative h-[56px] w-full rounded-lg border transition-colors bg-white flex items-center px-4 ${
                            errors.companyName
                                ? "border-rose-500 ring-1 ring-rose-500"
                                : "border-[#a5a5a5] hover:border-slate-600 focus-within:border-[#005ddc] focus-within:ring-1 focus-within:ring-[#005ddc]"
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
                            className="w-full h-full bg-transparent border-none outline-none text-[#222] text-[14px] font-normal placeholder:text-[#757575] focus:outline-none focus:ring-0 shadow-none"
                        />
                    </div>
                    <label
                        htmlFor="company-name"
                        className="absolute -top-2.5 left-3 bg-white px-2 py-0.5 rounded-full text-[14px] font-medium text-[#222] flex items-center gap-0.5 select-none pointer-events-none z-10 leading-none"
                    >
                        <span>Tên đơn vị / Doanh nghiệp</span>
                        <span className="text-[#dc0000] font-semibold text-[16px] leading-none">*</span>
                    </label>
                    {errors.companyName && (
                        <p className="text-[12px] text-rose-600 mt-1 pl-1 font-medium animate-in fade-in duration-150">
                            {errors.companyName}
                        </p>
                    )}
                </div>

                {/* Field 2: Company Field */}
                <div className="relative w-full">
                    <div className="relative h-[56px] w-full rounded-lg border border-[#a5a5a5] hover:border-slate-600 focus-within:border-[#005ddc] focus-within:ring-1 focus-within:ring-[#005ddc] transition-colors bg-white flex items-center px-4">
                        <input
                            id="company-field"
                            type="text"
                            value={companyField}
                            onChange={(e) => setCompanyField(e.target.value)}
                            placeholder="Ví dụ: Sự kiện âm nhạc, Triển lãm, Workshop..."
                            className="w-full h-full bg-transparent border-none outline-none text-[#222] text-[14px] font-normal placeholder:text-[#757575] focus:outline-none focus:ring-0 shadow-none"
                        />
                    </div>
                    <label
                        htmlFor="company-field"
                        className="absolute -top-2.5 left-3 bg-white px-2 py-0.5 rounded-full text-[14px] font-medium text-[#222] select-none pointer-events-none z-10 leading-none"
                    >
                        Lĩnh vực hoạt động
                    </label>
                </div>

                {/* Field 3: Company Description */}
                <div className="relative w-full">
                    <div
                        className={`relative w-full rounded-lg border transition-colors bg-white flex flex-col p-4 ${
                            errors.description
                                ? "border-rose-500 ring-1 ring-rose-500"
                                : "border-[#a5a5a5] hover:border-slate-600 focus-within:border-[#005ddc] focus-within:ring-1 focus-within:ring-[#005ddc]"
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
                            className="w-full bg-transparent border-none outline-none text-[#222] text-[14px] font-normal placeholder:text-[#a5a5a5] focus:outline-none focus:ring-0 shadow-none resize-none min-h-[76px]"
                        />
                    </div>
                    <label
                        htmlFor="company-description"
                        className="absolute -top-2.5 left-3 bg-white px-2 py-0.5 rounded-full text-[14px] font-medium text-[#222] flex items-center gap-0.5 select-none pointer-events-none z-10 leading-none"
                    >
                        <span>Mô tả về đơn vị</span>
                        <span className="text-[#dc0000] font-semibold text-[16px] leading-none">*</span>
                    </label>

                    {/* Supporting Info & Line Limit */}
                    <div className="flex items-center justify-between text-[12px] px-1 pt-1.5 text-[#757575]">
                        <span className="text-[#a5a5a5] truncate">
                            Thông tin này sẽ hiển thị trên trang hồ sơ tổ chức
                        </span>
                        <span className="shrink-0 font-medium">
                            <strong className="font-semibold text-[#757575]">{description.length}</strong>
                            <span className="text-[#a5a5a5]">/512</span>
                        </span>
                    </div>

                    {errors.description && (
                        <p className="text-[12px] text-rose-600 mt-1 pl-1 font-medium animate-in fade-in duration-150">
                            {errors.description}
                        </p>
                    )}
                </div>
            </div>

            {/* 3. Action Buttons */}
            <div className="flex flex-col gap-2.5 items-center w-full pt-1">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[52px] sm:h-[56px] bg-[#282828] hover:bg-black text-white font-medium text-[17px] sm:text-[19px] rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm active:scale-98 cursor-pointer disabled:opacity-50"
                >
                    {loading ? (
                        <div className="flex items-center gap-2 text-base">
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Đang lưu thông tin...</span>
                        </div>
                    ) : (
                        "Hoàn tất đăng ký"
                    )}
                </button>

                {onSkip && (
                    <button
                        type="button"
                        onClick={onSkip}
                        disabled={loading}
                        className="text-[#515151] hover:text-[#222] text-[16px] font-medium text-center transition-colors cursor-pointer py-1"
                    >
                        Bỏ qua
                    </button>
                )}
            </div>
        </form>
    )
}

export { Step3OrganizerCompanyInfo as Step3EmployerCompanyInfo }
