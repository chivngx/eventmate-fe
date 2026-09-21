"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import MainLayout from "@/components/layout/MainLayout"
import PricingHeroTabs from "./components/PricingHeroTabs"
import PricingCardsGrid from "./components/PricingCardsGrid"
import PricingFaqAccordion from "./components/PricingFaqAccordion"
import PricingTestimonials from "./components/PricingTestimonials"
import { useUser } from "@/components/providers/AuthProvider"
import { useToast } from "@/components/providers/ToastProvider"

export default function PricingPlansView() {
  const router = useRouter()
  const { user, role } = useUser()
  const { showToast } = useToast()
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  const handleSelectPlan = (planId: string) => {
    if (planId === "free") {
      if (!user) {
        showToast({
          type: "info",
          title: "Bắt đầu miễn phí",
          message: "Vui lòng đăng ký tài khoản Ban tổ chức để bắt đầu tạo sự kiện.",
        })
        router.push("/register?role=organizer")
      } else {
        showToast({
          type: "success",
          title: "Gói Miễn Phí",
          message: "Bạn đang sử dụng gói Free mặc định. Bạn có thể tạo sự kiện ngay trong Bảng điều khiển!",
        })
        router.push("/dashboard")
      }
      return
    }

    // Paid plans (Standard / Starter): Navigate directly to checkout page
    router.push(`/pricing/checkout?plan=${encodeURIComponent(planId)}&billing=${encodeURIComponent(billingCycle)}`)
  }

  return (
    <MainLayout fullWidth={true} className="bg-white">
      <div className="w-full bg-white pt-6 sm:pt-10 pb-4 animate-in fade-in duration-300">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-14 sm:gap-20">
          
          {/* Section 1: Hero Header & Monthly/Yearly Toggle */}
          <PricingHeroTabs
            billingCycle={billingCycle}
            setBillingCycle={setBillingCycle}
          />

          {/* Section 2: 3 Pricing Cards Grid */}
          <PricingCardsGrid
            billingCycle={billingCycle}
            onSelectPlan={handleSelectPlan}
          />

          {/* Section 3: FAQs Accordion */}
          <PricingFaqAccordion />

          {/* Section 4: Customer Reviews & Feedback */}
          <PricingTestimonials />

        </div>
      </div>
    </MainLayout>
  )
}
