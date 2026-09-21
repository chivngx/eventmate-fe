"use client"

import React, { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { FloatingBadgeInput } from "../FloatingBadgeInput"

interface Step2EmployerCompanyInfoProps {
    onSubmit: (values: {
        companyName: string
        phone: string
        wardId: string
        website: string
        description: string
    }) => void
    onBack: () => void
    loading?: boolean
}

export function Step2OrganizerOrgInfo({
    onSubmit,
    onBack,
    loading = false,
}: Step2EmployerCompanyInfoProps) {
    const [companyName, setCompanyName] = useState("")
    const [phone, setPhone] = useState("")
    const [wardId, setWardId] = useState("")
    const [website, setWebsite] = useState("")
    const [description, setDescription] = useState("")
    const [validationError, setValidationError] = useState<string | null>(null)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!companyName.trim()) {
            setValidationError("Vui lòng nhập tên Ban tổ chức hoặc Tên công ty.")
            return
        }
        setValidationError(null)
        onSubmit({
            companyName: companyName.trim(),
            phone: phone.trim(),
            wardId,
            website: website.trim(),
            description: description.trim(),
        })
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5" noValidate>
            {validationError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                    {validationError}
                </div>
            )}

            {/* 1. Tên Ban tổ chức / Công ty */}
            <FloatingBadgeInput
                label="Tên đơn vị tổ chức"
                placeholder="Ví dụ: Da Nang Event Hub / Sun World"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
            />

            {/* 2. Số điện thoại liên hệ */}
            <FloatingBadgeInput
                label="Số điện thoại"
                type="tel"
                placeholder="Ví dụ: 0905 123 456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
            />

            {/* 3. Khu vực hoạt động chính tại Đà Nẵng */}
            <div className="relative flex flex-col justify-center">
                <select
                    value={wardId}
                    onChange={(e) => setWardId(e.target.value)}
                    className="w-full h-14 px-4 pt-4 pb-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#005DDC] focus:ring-1 focus:ring-[#005DDC] transition-all"
                >
                    <option value="">Chọn khu vực quận / huyện tại Đà Nẵng</option>
                    <option value="hai-chau">Quận Hải Châu</option>
                    <option value="son-tra">Quận Sơn Trà</option>
                    <option value="ngu-hanh-son">Quận Ngũ Hành Sơn</option>
                    <option value="thanh-khe">Quận Thanh Khê</option>
                    <option value="lien-chieu">Quận Liên Chiểu</option>
                    <option value="cam-le">Quận Cẩm Lệ</option>
                    <option value="hoa-vang">Huyện Hòa Vang</option>
                </select>
                <span className="absolute left-3 top-[-10px] bg-white px-2 py-0.5 rounded-full text-xs font-medium text-slate-800">
                    Khu vực hoạt động
                </span>
            </div>

            {/* 4. Website hoặc Fanpage */}
            <FloatingBadgeInput
                label="Website / Fanpage"
                placeholder="https://facebook.com/... hoặc https://company.vn"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
            />

            {/* 5. Giới thiệu ngắn về đơn vị */}
            <div className="relative flex flex-col justify-center">
                <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả ngắn về quy mô, loại hình sự kiện thường tổ chức..."
                    className="w-full px-4 pt-4 pb-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#005DDC] focus:ring-1 focus:ring-[#005DDC] transition-all resize-none"
                />
                <span className="absolute left-3 top-[-10px] bg-white px-2 py-0.5 rounded-full text-xs font-medium text-slate-800">
                    Giới thiệu ngắn
                </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={loading}
                    className="w-full sm:w-auto px-5 h-[52px] border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Quay lại</span>
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex-1 h-[52px] bg-[#282828] hover:bg-black text-white font-medium text-base rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm active:scale-98 cursor-pointer disabled:opacity-50"
                >
                    {loading ? "Đang tạo tài khoản..." : "Hoàn tất đăng ký"}
                </button>
            </div>
        </form>
    )
}

export { Step2OrganizerOrgInfo as Step2EmployerCompanyInfo }
