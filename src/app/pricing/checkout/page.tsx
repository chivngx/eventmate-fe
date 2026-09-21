import type { Metadata } from "next"
import { Suspense } from "react"
import CheckoutView from "@/features/pricing/CheckoutView"

export const metadata: Metadata = {
  title: "Thanh Toán Gói Dịch Vụ — EventMate Đà Nẵng",
  description: "Thanh toán và kích hoạt gói tuyển dụng nhân sự sự kiện thông minh tại Đà Nẵng.",
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <CheckoutView />
    </Suspense>
  )
}
