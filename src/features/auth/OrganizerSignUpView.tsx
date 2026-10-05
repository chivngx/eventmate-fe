"use client"

import React, { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "@/lib/router"
import { supabase } from "@/lib/supabase"
import { getUserFacingMessage } from "@/lib/error"
import type { EmployerRegisterValues } from "@/lib/schemas"
import { AuthSplitLayout } from "./components/AuthSplitLayout"
import { AuthSuccessCard, RoleSwitcherTabs, SignUpProgressBar, signInWithGoogle } from "./components/AuthComponents"
import {
    Step1OrganizerInfo,
    Step2OrganizerCompanyInfo,
} from "./components/OrganizerSignUpSteps"

export interface OrganizerSignUpViewProps {
    isModal?: boolean
    redirectPath?: string
    onLoginClick?: () => void
    onRoleChange?: (role: "student" | "organizer") => void
    onSuccess?: () => void
}

export default function OrganizerSignUpView({
    isModal = false,
    redirectPath,
    onLoginClick,
    onRoleChange,
    onSuccess,
}: OrganizerSignUpViewProps = {}) {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    // Steps: 1 (Basic info), 2 (Company details)
    const stepParam = searchParams.get("step")
    const initialStep =
        !isModal && (stepParam === "2" || stepParam === "company")
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
        if (!isModal) {
            if ((stepParam === "2" || stepParam === "company") && step !== 2) {
                if (!step1Data) {
                    setStep(1)
                } else {
                    setStep(2)
                }
            } else if (!stepParam && step !== 1 && !step1Data) {
                setStep(1)
            }
        }
    }, [stepParam, step1Data, isModal, step])

    // Step 1: Save basic organizer info and advance to step 2
    const handleStep1Submit = (values: EmployerRegisterValues) => {
        setErrorMessage(null)
        setStep1Data(values)
        setStep(2)
        if (!isModal) {
            setSearchParams({ role: "organizer", step: "2" })
        }
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
            if (!isModal) {
                setSearchParams({ role: "organizer", step: "1" })
            }
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
                        bio: orgBio,
                    },
                    emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?role=organizer`,
                },
            })

            if (signUpError) {
                setErrorMessage(getUserFacingMessage(signUpError, "Đăng ký không thành công. Vui lòng thử lại sau."))
                return
            }

            if (signUpData.user) {
                if (companyData?.logoFile) {
                    try {
                        const fileExt = companyData.logoFile.name.split(".").pop()
                        const filePath = `${signUpData.user.id}/logo.${fileExt}`
                        const { error: uploadError } = await supabase.storage
                            .from("company-logos")
                            .upload(filePath, companyData.logoFile, { upsert: true })

                        if (!uploadError) {
                            const { data: urlData } = supabase.storage
                                .from("company-logos")
                                .getPublicUrl(filePath)

                            await (supabase as any)
                                .from("companies")
                                .update({ logo_url: urlData.publicUrl })
                                .eq("user_id", signUpData.user.id)
                        }
                    } catch (logoErr) {
                        console.warn("Failed to upload logo immediately:", logoErr)
                    }
                }

                if (signUpData.session) {
                    if (isModal) {
                        if (onSuccess) onSuccess()
                        navigate(redirectPath || "/")
                        return
                    }
                    navigate("/")
                } else {
                    setSuccessMessage(
                        "Đăng ký tài khoản Ban tổ chức thành công! Vui lòng kiểm tra email của bạn để xác thực tài khoản trước khi đăng nhập."
                    )
                }
            }
        } catch (err: any) {
            setErrorMessage(err?.message || "Đã xảy ra lỗi ngoài ý muốn. Vui lòng thử lại.")
        } finally {
            setLoading(false)
        }
    }

    const handleSkip = () => {
        handleFinalSubmit()
    }

    const handleGoogleSignUp = () => {
        signInWithGoogle({
            role: "organizer",
            redirectPath,
            setLoading: setGoogleLoading,
            onError: setErrorMessage,
        })
    }

    const progressBar = (
        <SignUpProgressBar
            currentStep={step}
            totalSteps={2}
        />
    )

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
                if (!isModal) {
                    setSearchParams({ role: "organizer", step: "1" })
                }
            }}
            topElement={!successMessage ? progressBar : undefined}
            isModal={isModal}
        >
            {successMessage ? (
                <AuthSuccessCard
                    title="Kiểm tra email của bạn"
                    message={successMessage}
                    actionText="Đi đến Đăng nhập"
                    actionLink="/?auth=login&role=organizer"
                    onActionClick={onLoginClick}
                />
            ) : step === 1 ? (
                <>
                    <RoleSwitcherTabs
                        activeRole="organizer"
                        mode="register"
                        onRoleChange={onRoleChange}
                    />
                    <Step1OrganizerInfo
                        defaultValues={step1Data || undefined}
                        onSubmit={handleStep1Submit}
                        onGoogleSignUp={handleGoogleSignUp}
                        googleLoading={googleLoading}
                        onLoginClick={onLoginClick}
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
