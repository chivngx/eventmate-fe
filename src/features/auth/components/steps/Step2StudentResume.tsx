"use client"

import React from "react"
import { ResumeDropzone } from "../ResumeDropzone"
import { AuthSubmitButton } from "../AuthComponents"

interface Step2UploadResumeProps {
    file: File | null
    onFileSelect: (file: File | null) => void
    onError: (msg: string | null) => void
    onFinish: (includeResume: boolean) => void
    loading?: boolean
}

export function Step2StudentResume({
    file,
    onFileSelect,
    onError,
    onFinish,
    loading = false,
}: Step2UploadResumeProps) {
    return (
        <div className="flex flex-col gap-6">
            <ResumeDropzone
                file={file}
                onFileSelect={onFileSelect}
                onError={onError}
                maxSizeMB={10}
            />

            {/* Actions */}
            <div className="flex flex-col gap-4 mt-2">
                <AuthSubmitButton
                    type="button"
                    onClick={() => onFinish(true)}
                    loading={loading}
                    loadingText="Đang hoàn tất đăng ký..."
                >
                    Hoàn tất đăng ký
                </AuthSubmitButton>

                <button
                    type="button"
                    onClick={() => onFinish(false)}
                    disabled={loading}
                    className="w-full text-center text-[#515151] hover:text-[#222222] text-[16px] font-medium transition-colors py-2 cursor-pointer hover:underline disabled:opacity-60"
                >
                    Bỏ qua bước này
                </button>
            </div>
        </div>
    )
}

export { Step2StudentResume as Step2UploadResume }
