"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import MainLayout from "@/components/layout/MainLayout"
import PaymentForm from "./components/PaymentForm"
import PaymentOrderSummary from "./components/PaymentOrderSummary"
import ReceiptPrinterAnimation from "@/components/common/ReceiptPrinterAnimation"
import { useToast } from "@/components/providers/ToastProvider"
import { useUser } from "@/components/providers/AuthProvider"
import { supabase } from "@/lib/supabase"

export default function CheckoutView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  const { user, refreshProfile } = useUser()

  const planId = searchParams.get("plan") || "standard"
  const billingCycle = (searchParams.get("billing") as "monthly" | "yearly") || "monthly"

  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [transactionId, setTransactionId] = useState<string | null>(null)

  const isEnterprise =
    planId === "enterprise" || planId === "standard" || planId === "agency"
  const totalRaw = isEnterprise
    ? billingCycle === "yearly"
      ? 399000 * 12
      : 499000
    : 99000
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
    showToast({
      type: "success",
      title: "Thanh toán thành công!",
      message: `Đã kích hoạt thành công gói ${planId.toUpperCase()} (${billingCycle === "yearly" ? "Theo năm" : "Theo tháng"}).`,
    })
  }

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

function ArrowLeftIcon({ className = "w-[24px] h-[24px]" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.7501 12C21.7501 12.414 21.4141 12.75 21.0001 12.75H4.81115L10.5311 18.47C10.8241 18.763 10.8241 19.238 10.5311 19.531C10.3851 19.677 10.1931 19.751 10.0011 19.751C9.80909 19.751 9.61706 19.678 9.47106 19.531L2.47106 12.531C2.40206 12.462 2.3472 12.3791 2.3092 12.2871C2.2332 12.1041 2.2332 11.8971 2.3092 11.7141C2.3472 11.6221 2.40206 11.539 2.47106 11.47L9.47106 4.46999C9.76406 4.17699 10.2391 4.17699 10.5321 4.46999C10.8251 4.76299 10.8251 5.23803 10.5321 5.53103L4.81213 11.251H21.0001C21.4141 11.25 21.7501 11.586 21.7501 12Z"
        fill="currentColor"
      />
    </svg>
  )
}

  return (
    <MainLayout fullWidth={true} className="bg-white">
      <div className="w-full bg-white pt-4 sm:pt-6 pb-16 sm:pb-24 animate-in fade-in duration-300">
        <div className="max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col">
          
          {/* Top: Back Button (Figma node 6240:25185) */}
          {!isSuccess && (
            <div className="w-full flex items-center justify-start">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-[8px] px-[16px] py-[8px] rounded-[8px] text-[#005DDC] hover:bg-blue-50 transition-colors cursor-pointer group"
              >
                <ArrowLeftIcon className="w-[24px] h-[24px] text-[#005DDC] transition-transform group-hover:-translate-x-0.5" />
                <span className="font-['Inter'] font-medium text-[18px] leading-normal text-[#005DDC]">
                  Quay lại
                </span>
              </Link>
            </div>
          )}

          {/* Titr home: Checkout Title & Subtitle (Figma node 6240:25184) */}
          {!isSuccess && (
            <div className="flex flex-col items-center justify-center gap-[8px] text-center w-full mt-2 sm:mt-4 mb-8 sm:mb-12">
              <h1 className="font-['Inter'] font-semibold text-[32px] sm:text-[36px] text-[#222222] leading-normal tracking-tight">
                Thanh Toán
              </h1>
              <p className="font-['Inter'] font-normal text-[15px] sm:text-[16px] text-[#757575] leading-[1.6] max-w-[500px]">
                Xem lại thông tin đơn hàng và hoàn tất thanh toán để kích hoạt gói dịch vụ của bạn.
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
            /* 2-Column Checkout Layout (Figma node 6240:25186) */
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-[120px] items-start justify-between w-full">
              
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
