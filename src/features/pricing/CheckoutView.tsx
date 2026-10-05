"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import MainLayout from "@/components/layout/MainLayout"
import PaymentForm from "./components/PaymentForm"
import PaymentOrderSummary from "./components/PaymentOrderSummary"
import ReceiptPrinterAnimation from "@/components/common/ReceiptPrinterAnimation"
import { useToast } from "@/components/providers/ToastProvider"
import { useUser } from "@/components/providers/AuthProvider"
import Breadcrumb from "@/components/common/Breadcrumb"

export default function CheckoutView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  const { refreshProfile, isPremium, profile } = useUser()

  const planId = searchParams.get("plan") || "standard"
  const billingCycle = "monthly"

  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [transactionId, setTransactionId] = useState<string | null>(null)

  const isEnterprise =
    planId === "enterprise" || planId === "standard" || planId === "agency"
  const totalRaw = isEnterprise ? 499000 : 99000
  const planPriceDisplay = `${totalRaw.toLocaleString("vi-VN")}đ`

  const handlePaymentSuccess = async (data: { orderCode?: number; transactionId?: string }) => {
    if (data?.transactionId) {
      setTransactionId(data.transactionId)
    }
    if (refreshProfile) {
      try {
        await refreshProfile()
      } catch {}
    }
    setIsSuccess(true)
    const isSingle = planId === "single_event"
    showToast({
      type: "success",
      title: "Thanh toán thành công!",
      message: isSingle
        ? "Đã kích hoạt thành công 1 lượt đăng Sự Kiện Nhanh (99.000đ)!"
        : "Đã kích hoạt thành công gói Doanh Nghiệp VIP (Theo tháng).",
    })
  }

  // Chặn mua trùng lặp nếu tài khoản đã kích hoạt gói Doanh Nghiệp VIP
  useEffect(() => {
    const status = searchParams.get("status")
    const isDemo = searchParams.get("demo") === "receipt"
    if (isEnterprise && isPremium && status !== "success" && !isDemo && !isSuccess) {
      showToast({
        type: "info",
        title: "Gói VIP đang kích hoạt",
        message: `Bạn hiện đang sử dụng gói Doanh Nghiệp VIP${profile?.premium_until ? ` (Hạn dùng: ${new Date(profile.premium_until).toLocaleDateString("vi-VN")})` : ""}. Không cần mua lại!`,
      })
      router.push("/dashboard")
    }
  }, [isEnterprise, isPremium, searchParams, isSuccess, router, showToast, profile?.premium_until])

  // Tự động kiểm tra nếu URL chứa status=success từ payOS redirect hoặc demo=receipt
  useEffect(() => {
    const status = searchParams.get("status")
    const orderCode = searchParams.get("orderCode")
    const isDemo = searchParams.get("demo") === "receipt" || status === "success"

    if (isDemo && !isSuccess) {
      setIsSuccess(true)
    }

    if (status === "success" && orderCode) {
      fetch(`/api/payment/check-status?orderCode=${orderCode}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "completed") {
            handlePaymentSuccess({ orderCode: Number(orderCode), transactionId: data.transactionId })
          }
        })
        .catch(() => {})
    }
  }, [searchParams])

  return (
    <MainLayout fullWidth={true} className="bg-zinc-50 relative overflow-hidden">
      {/* Background ambient gradient */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-100/40 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-zinc-200/50 blur-[100px]" />
      </div>

      <div className="w-full min-h-screen pt-4 sm:pt-8 pb-16 sm:pb-24 relative z-10 animate-in fade-in duration-300">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col">
          
          {/* Top: Breadcrumb */}
          {!isSuccess && (
            <div className="w-full mb-6">
              <Breadcrumb
                items={[
                  { label: "Bảng giá", href: "/pricing" },
                  { label: "Thanh toán gói dịch vụ" },
                ]}
              />
            </div>
          )}

          {/* Checkout Title & Subtitle */}
          {!isSuccess && (
            <div className="flex flex-col gap-4 w-full mb-12 lg:mb-16 text-center lg:text-left">
              <h1 className="font-semibold text-4xl sm:text-5xl text-zinc-950 leading-tight tracking-tight">
                Thanh Toán
              </h1>
              <p className="text-[16px] text-zinc-500 leading-relaxed max-w-[500px] mx-auto lg:mx-0">
                Xem lại thông tin đơn hàng và quét mã VietQR để hoàn tất giao dịch tự động.
              </p>
            </div>
          )}

          {isSuccess ? (
            /* Success State with 3D Receipt Printer Animation */
            <div className="w-full flex justify-center py-4 sm:py-8 animate-in zoom-in-95 duration-300">
              <ReceiptPrinterAnimation
                planId={planId}
                billingCycle={billingCycle}
                amountFormatted={planPriceDisplay}
                transactionId={transactionId}
                onDone={() => router.push("/dashboard")}
              />
            </div>
          ) : (
            /* 2-Column Checkout Layout */
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start justify-between w-full">
              
              {/* Left Column: Payment Details Form */}
              <PaymentForm
                planId={planId}
                billingCycle={billingCycle}
                amountFormatted={planPriceDisplay}
                onPaymentSuccess={handlePaymentSuccess}
                isProcessing={isProcessing}
              />

              {/* Right Column: Plan Order Summary */}
              <PaymentOrderSummary
                planId={planId}
                billingCycle={billingCycle}
              />

            </div>
          )}

        </div>
      </div>
    </MainLayout>
  )
}
