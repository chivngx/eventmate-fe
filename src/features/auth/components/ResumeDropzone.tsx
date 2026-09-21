"use client"

import React, { useRef, useState } from "react"
import { UploadCloud, FileText, X } from "lucide-react"

interface ResumeDropzoneProps {
    file: File | null
    onFileSelect: (file: File | null) => void
    onError: (msg: string | null) => void
    maxSizeMB?: number
}

export function ResumeDropzone({
    file,
    onFileSelect,
    onError,
    maxSizeMB = 10,
}: ResumeDropzoneProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)

    const handleFile = (selectedFile?: File) => {
        if (!selectedFile) return

        if (selectedFile.size > maxSizeMB * 1024 * 1024) {
            onError(`File đính kèm vượt quá dung lượng cho phép (tối đa ${maxSizeMB} MB).`)
            return
        }

        onError(null)
        onFileSelect(selectedFile)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        handleFile(e.dataTransfer.files?.[0])
    }

    return (
        <div className="bg-white flex flex-col gap-3.5 sm:gap-4 items-center justify-center p-3.5 sm:p-5 rounded-2xl border border-slate-100 shadow-sm w-full">
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
            />

            <div className="flex flex-col gap-1 items-center justify-center text-center w-full">
                <h3 className="font-semibold text-slate-900 text-[16px] sm:text-[18px]">
                    Tải lên CV của bạn
                </h3>
                <p className="text-slate-500 text-[12px] sm:text-[12.5px] font-normal max-w-[280px] sm:max-w-none">
                    Đính kèm file CV để nhà tuyển dụng đánh giá hồ sơ của bạn nhanh chóng.
                </p>
            </div>

            {/* Drag & Drop Dashed Dropzone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full h-[150px] sm:h-[165px] rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-3 sm:p-4 text-center cursor-pointer select-none ${
                    isDragging
                        ? "border-[#005ddc] bg-blue-50/60 scale-[1.01]"
                        : file
                        ? "border-emerald-400 bg-emerald-50/40"
                        : "border-slate-300 hover:border-[#005ddc] hover:bg-slate-50/80"
                }`}
            >
                {file ? (
                    <div className="flex flex-col items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                            <FileText className="w-5 h-5" />
                        </div>
                        <p className="text-[13.5px] sm:text-[14px] font-medium text-slate-900 max-w-[240px] sm:max-w-[280px] truncate">
                            {file.name}
                        </p>
                        <p className="text-[11.5px] text-slate-500">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-1.5">
                        <div className="w-10 h-10 text-[#005ddc] flex items-center justify-center">
                            <UploadCloud className="w-9 h-9 stroke-[1.75]" />
                        </div>
                        <p className="text-[13px] sm:text-[14px] font-semibold text-slate-800">
                            Kéo thả hoặc Chọn file từ máy
                        </p>
                        <p className="text-[11.5px] sm:text-[12px] text-slate-400 font-medium">
                            Định dạng PDF (Tối đa {maxSizeMB} MB)
                        </p>
                    </div>
                )}
            </div>

            {/* File selection chip / Action button */}
            {file ? (
                <div className="flex items-center justify-between w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-[#005ddc] shrink-0" />
                        <span className="text-[13px] font-medium text-slate-900 truncate">
                            {file.name}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            onFileSelect(null)
                            if (fileInputRef.current) fileInputRef.current.value = ""
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                        aria-label="Gỡ file"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-[38px] sm:h-[42px] rounded-xl border border-[#005ddc] hover:bg-[#cfe3ff]/20 text-[#005ddc] text-[13.5px] sm:text-[14px] font-semibold transition-colors flex items-center justify-center cursor-pointer"
                >
                    Chọn file CV
                </button>
            )}
        </div>
    )
}

