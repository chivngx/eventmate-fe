"use client"

import React, { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "@/lib/router"
import { supabase } from "@/lib/supabase"
import { getUserFacingMessage } from "@/lib/error"
import type { JobseekerRegisterValues } from "@/lib/schemas"
import { AuthSplitLayout } from "./components/AuthSplitLayout"
import { AuthSuccessCard } from "./components/AuthComponents"
import { SignUpProgressBar } from "./components/SignUpProgressBar"
import { Step1StudentInfo } from "./components/steps/Step1StudentInfo"
import { Step2StudentResume } from "./components/steps/Step2StudentResume"
import { JOBSEEKER_TESTIMONIALS, AUTH_HERO_IMAGES } from "@/lib/auth-constants"

export default function StudentSignUpView() {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    // 1: Personal Info, 2: Upload Resume
    const stepParam = searchParams.get("step")
    const initialStep = stepParam === "2" || stepParam === "resume" || stepParam === "final" ? 2 : 1
    const [step, setStep] = useState<number>(initialStep)

    // Intermediate form state
    const [step1Data, setStep1Data] = useState<JobseekerRegisterValues | null>(null)
    const [resumeFile, setResumeFile] = useState<File | null>(null)

    // UI Feedback & Loading states
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(step === 2 ? 1 : 0)

    useEffect(() => {
        if ((stepParam === "2" || stepParam === "resume" || stepParam === "final") && step !== 2) {
            setStep(2)
            setActiveTestimonialIdx(1)
        } else if (!stepParam && step !== 1 && !step1Data) {
            setStep(1)
            setActiveTestimonialIdx(0)
        }
    }, [stepParam])

    // Step 1 Completed -> advance to Step 2 (Upload Resume)
    const handleStep1Submit = (values: JobseekerRegisterValues) => {
        setErrorMessage(null)
        setStep1Data(values)
        setStep(2)
        setActiveTestimonialIdx(1)
        setSearchParams({ step: "2" })
    }

    // Step Back: From Step 2 to Step 1
    const handleStepBack = () => {
        setStep(1)
        setActiveTestimonialIdx(0)
        setSearchParams({})
    }

    // Finalize Account Creation with Supabase
    const handleFinalSubmit = async (includeResume: boolean) => {
        setErrorMessage(null)
        setSuccessMessage(null)
        setLoading(true)

        try {
            const fullName = step1Data?.fullName?.trim() || "Ứng viên"
            const email = step1Data?.email?.trim() || ""
            const password = step1Data?.password || ""

            if (!email || !password) {
                setErrorMessage("Vui lòng hoàn thành thông tin tài khoản ở Bước 1 trước.")
                setStep(1)
                setSearchParams({})
                setLoading(false)
                return
            }

            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        has_resume: includeResume && !!resumeFile,
                        role: "student",
                    },
                    emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
                },
            })

            if (signUpError) {
                setErrorMessage(getUserFacingMessage(signUpError, "Đăng ký không thành công. Vui lòng thử lại sau."))
                setLoading(false)
                return
            }

            if (data.user) {
                // Tải file CV lên storage bucket 'cvs' và liên kết profiles nếu có session
                if (includeResume && resumeFile) {
                    try {
                        const fileExt = resumeFile.name.split(".").pop() || "pdf"
                        const fileName = `${data.user.id}/${Date.now()}_cv.${fileExt}`
                        const { error: uploadError } = await supabase.storage
                            .from("cvs")
                            .upload(fileName, resumeFile, {
                                upsert: true,
                                contentType: resumeFile.type || "application/pdf",
                            })

                        if (!uploadError) {
                            const { data: publicUrlData } = supabase.storage
                                .from("cvs")
                                .getPublicUrl(fileName)

                            if (publicUrlData?.publicUrl) {
                                await supabase
                                    .from("profiles")
                                    .update({
                                        cv_url: publicUrlData.publicUrl,
                                    })
                                    .eq("id", data.user.id)
                            }
                        }
                    } catch (uploadErr) {
                        console.warn("Không thể tải file CV ngay lúc đăng ký:", uploadErr)
                    }
                }

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
                setGoogleLoading(false)
            }
        } catch (err: any) {
            setErrorMessage(err?.message || "Lỗi đăng nhập Google.")
            setGoogleLoading(false)
        }
    }

    const stepTitles = [
        {
            title: "Thông tin cá nhân",
            subtitle: "Vui lòng nhập thông tin cá nhân để thiết lập tài khoản và cá nhân hóa trải nghiệm của bạn.",
        },
        {
            title: "Tải lên CV ứng tuyển",
            subtitle: "Tải lên CV của bạn để tiếp cận các cơ hội việc làm sự kiện phù hợp nhất.",
        },
    ]
    const currentHeader = stepTitles[step - 1] || stepTitles[0]

    return (
        <AuthSplitLayout
            title={currentHeader.title}
            subtitle={currentHeader.subtitle}
            errorMessage={errorMessage}
            showBackButton={step > 1}
            onBack={handleStepBack}
            topElement={<SignUpProgressBar currentStep={step} totalSteps={2} />}
            activeTestimonialIdx={activeTestimonialIdx}
            onSelectTestimonialIdx={setActiveTestimonialIdx}
            testimonials={JOBSEEKER_TESTIMONIALS}
            heroImage={AUTH_HERO_IMAGES.jobseeker}
        >
            {successMessage ? (
                <AuthSuccessCard
                    title="Đăng ký tài khoản thành công!"
                    message={successMessage}
                    actionText="Đi đến trang Đăng nhập"
                    actionLink="/login"
                />
            ) : step === 1 ? (
                <Step1StudentInfo
                    defaultValues={step1Data || undefined}
                    onSubmit={handleStep1Submit}
                    onGoogleSignUp={handleGoogleSignUp}
                    googleLoading={googleLoading}
                />
            ) : (
                <Step2StudentResume
                    file={resumeFile}
                    onFileSelect={setResumeFile}
                    onError={setErrorMessage}
                    onFinish={handleFinalSubmit}
                    loading={loading}
                />
            )}
        </AuthSplitLayout>
    )
}

