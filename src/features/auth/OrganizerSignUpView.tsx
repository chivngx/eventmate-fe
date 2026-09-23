"use client"

import React, { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "@/lib/router"
import { supabase } from "@/lib/supabase"
import { getUserFacingMessage } from "@/lib/error"
import type { EmployerRegisterValues } from "@/lib/schemas"
import { AuthSplitLayout } from "./components/AuthSplitLayout"
import { AuthSuccessCard, RoleSwitcherTabs, SignUpProgressBar } from "./components/AuthComponents"
import {
    Step1OrganizerInfo,
    Step2OrganizerCompanyInfo,
} from "./components/OrganizerSignUpSteps"

export default function OrganizerSignUpView() {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    // Steps: 1 (Basic info), 2 (Company details)
    const stepParam = searchParams.get("step")
    const initialStep =
        stepParam === "2" || stepParam === "company"
            ? 2
            : 1
    const [step, setStep] = useState<number>(initialStep)

    // Intermediate form data
    const [step1Data, setStep1Data] = useState<EmployerRegisterValues | null>(null)

    // UI Feedback & Loading states
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    useEffect(() => {
        if ((stepParam === "2" || stepParam === "company") && step !== 2) {
            // If user jumped to step 2 without step1Data, keep them on step 1
            if (!step1Data) {
                setStep(1)
            } else {
                setStep(2)
            }
        } else if (!stepParam && step !== 1 && !step1Data) {
            setStep(1)
        }
    }, [stepParam, step1Data])

    // Step 1: Save basic organizer info and advance to step 2
    const handleStep1Submit = (values: EmployerRegisterValues) => {
        setErrorMessage(null)
        setStep1Data(values)
        setStep(2)
        setSearchParams({ role: "organizer", step: "2" })
    }

    // Step 2: Finalize registration with company details & trigger Supabase signup
    const handleFinalSubmit = async (companyData?: {
        companyName: string
        companyField: string
        description: string
        logoFile: File | null
        logoPreviewUrl: string | null
    }) => {
        if (!step1Data) {
            setErrorMessage("Vui lòng nhập thông tin người đại diện ở bước 1 trước.")
            setStep(1)
            setSearchParams({ role: "organizer", step: "1" })
            return
        }

        setErrorMessage(null)
        setSuccessMessage(null)
        setLoading(true)

        try {
            const orgName = companyData?.companyName?.trim() || step1Data.fullName.trim()
            const orgBio = companyData?.description?.trim() || ""
            const orgField = companyData?.companyField?.trim() || ""

            if (companyData?.logoPreviewUrl && typeof window !== "undefined") {
                try {
                    localStorage.setItem("pending_org_logo", companyData.logoPreviewUrl)
                } catch (e) {
                    console.warn("Failed to store pending logo in localStorage", e)
                }
            }

            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: step1Data.email,
                password: step1Data.password,
                options: {
                    data: {
                        full_name: orgName,
                        company_name: companyData?.companyName?.trim() || "",
                        representative_name: step1Data.fullName.trim(),
                        job_title: step1Data.role.trim(),
                        role: "organizer",
                        company_field: orgField,
                        scale: orgField,
                        description: orgBio,
                        bio: orgBio,
                    },
                    emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?role=organizer`,
                },
            })

            // If session is returned immediately, upload logo right away
            if (signUpData?.session?.user && companyData?.logoPreviewUrl) {
                try {
                    const parts = companyData.logoPreviewUrl.split(",")
                    const byteString = atob(parts[1] || "")
                    const mimeString = parts[0]?.split(":")[1]?.split(";")[0] || "image/jpeg"
                    const ab = new ArrayBuffer(byteString.length)
                    const ia = new Uint8Array(ab)
                    for (let i = 0; i < byteString.length; i++) {
                        ia[i] = byteString.charCodeAt(i)
                    }
                    const blob = new Blob([ab], { type: mimeString })
                    const fileExt = mimeString.split("/")[1] || "jpeg"
                    const fileName = `${signUpData.session.user.id}/${Date.now()}.${fileExt}`
                    const { error: uploadError } = await supabase.storage
                        .from("avatars")
                        .upload(fileName, blob, { contentType: mimeString, upsert: true })

                    if (!uploadError) {
                        const { data: { publicUrl } } = supabase.storage
                            .from("avatars")
                            .getPublicUrl(fileName)
                        await supabase
                            .from("profiles")
                            .update({ avatar_url: publicUrl })
                            .eq("id", signUpData.session.user.id)
                        localStorage.removeItem("pending_org_logo")
                    }
                } catch (e) {
                    console.warn("Failed to upload immediate logo", e)
                }
            }

            if (signUpError) {
                if (
                    signUpError.message?.toLowerCase().includes("already registered") ||
                    signUpError.message?.toLowerCase().includes("user already registered")
                ) {
                    setErrorMessage("Email này đã được đăng ký tài khoản. Vui lòng đăng nhập.")
                    setLoading(false)
                    return
                }
                throw signUpError
            }

            setSuccessMessage(
                `Đăng ký tài khoản thành công! Chúng tôi đã gửi email xác nhận đến ${step1Data.email}. Vui lòng kiểm tra hộp thư và nhấp vào liên kết xác nhận để kích hoạt tài khoản Ban tổ chức.`
            )
        } catch (err: any) {
            setErrorMessage(getUserFacingMessage(err, "Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại."))
        } finally {
            setLoading(false)
        }
    }

    // Step 2: Skip action
    const handleSkip = () => {
        handleFinalSubmit()
    }

    // Google OAuth Sign Up
    const handleGoogleSignUp = async () => {
        try {
            setErrorMessage(null)
            setGoogleLoading(true)
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?role=organizer`,
                    queryParams: {
                        access_type: "offline",
                        prompt: "consent",
                    },
                },
            })
            if (error) {
                setErrorMessage(getUserFacingMessage(error, "Không thể kết nối với Google. Vui lòng thử lại."))
                setGoogleLoading(false)
            }
        } catch (err: any) {
            setErrorMessage(getUserFacingMessage(err, "Đăng ký với Google thất bại."))
            setGoogleLoading(false)
        }
    }

    // 2-Step Progress indicator
    const progressBar = <SignUpProgressBar currentStep={step} totalSteps={2} />

    // Dynamic Title and Subtitle based on Step
    const title =
        step === 1
            ? "Đăng ký Ban tổ chức"
            : "Thông tin tổ chức / Doanh nghiệp"

    const subtitle =
        step === 1
            ? "Nhập thông tin người đại diện để thiết lập tài khoản và đăng tin tuyển dụng sự kiện."
            : "Vui lòng cung cấp thông tin đơn vị tổ chức hoặc doanh nghiệp của bạn để hoàn tất hồ sơ."

    return (
        <AuthSplitLayout
            title={title}
            subtitle={subtitle}
            errorMessage={errorMessage}
            showBackButton={step > 1 && !successMessage}
            onBack={() => {
                setStep(1)
                setSearchParams({ role: "organizer", step: "1" })
            }}
            topElement={!successMessage ? progressBar : undefined}
        >
            {successMessage ? (
                <AuthSuccessCard
                    title="Kiểm tra email của bạn"
                    message={successMessage}
                    actionText="Đi đến Đăng nhập"
                    actionLink="/login?role=organizer"
                />
            ) : step === 1 ? (
                <>
                    <RoleSwitcherTabs
                        activeRole="organizer"
                        mode="register"
                    />
                    <Step1OrganizerInfo
                        defaultValues={step1Data || undefined}
                        onSubmit={handleStep1Submit}
                        onGoogleSignUp={handleGoogleSignUp}
                        googleLoading={googleLoading}
                    />
                </>
            ) : (
                <Step2OrganizerCompanyInfo
                    onSubmit={handleFinalSubmit}
                    onSkip={handleSkip}
                    loading={loading}
                />
            )}
        </AuthSplitLayout>
    )
}
