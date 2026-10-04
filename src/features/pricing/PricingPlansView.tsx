"use client"

import { useRouter } from "next/navigation"
import MainLayout from "@/components/layout/MainLayout"
import PricingHeroTabs from "./components/PricingHeroTabs"
import PricingCardsGrid from "./components/PricingCardsGrid"
import PricingFaqAccordion from "./components/PricingFaqAccordion"
import { useUser } from "@/components/providers/AuthProvider"
import { useAuthModal } from "@/components/providers/AuthModalProvider"
import { useToast } from "@/components/providers/ToastProvider"

export default function PricingPlansView() {
  const router = useRouter()
  const { user, isPremium, singleEventCredits, profile } = useUser()
  const { openRegister } = useAuthModal()
  const { showToast } = useToast()

  const handleSelectPlan = (planId: string) => {
    if (planId === "enterprise" && isPremium) {
      showToast({
        type: "info",
        title: "Gói VIP đang kích hoạt",
        message: `Bạn hiện đang sử dụng gói Doanh Nghiệp VIP${profile?.premium_until ? ` (Hạn dùng đến: ${new Date(profile.premium_until).toLocaleDateString("vi-VN")})` : ""}. Không cần mua lại!`,
      })
      router.push("/dashboard")
      return
    }

    if (planId === "free") {
      if (!user) {
        showToast({
          type: "info",
          title: "Bắt đầu miễn phí",
          message: "Vui lòng đăng ký tài khoản Ban tổ chức để bắt đầu tạo sự kiện.",
        })
        openRegister({ role: "organizer" })
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

    // Paid plans (Enterprise / Single Event): Navigate directly to checkout page
    router.push(`/pricing/checkout?plan=${encodeURIComponent(planId)}`)
  }

  return (
    <MainLayout fullWidth={true} className="bg-[#FAFAFA]">
      <div className="w-full bg-[#FAFAFA] min-h-screen pt-6 sm:pt-10 pb-20 animate-in fade-in duration-300">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-14 sm:gap-20">

          {/* Section 1: Hero Header */}
          <PricingHeroTabs />

          {/* Section 2: 3 Pricing Cards Grid */}
          <PricingCardsGrid
            onSelectPlan={handleSelectPlan}
            isPremium={isPremium}
            premiumUntil={profile?.premium_until}
            singleEventCredits={singleEventCredits || 0}
          />

          {/* Section 3: FAQs Accordion */}
          <PricingFaqAccordion />

        </div>
      </div>
    </MainLayout>
  )
}
