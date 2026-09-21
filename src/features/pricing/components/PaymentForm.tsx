"use client"

import React, { useEffect, useState, useCallback } from "react"
import { Loader2, Copy, Check, Download } from "lucide-react"
import { useToast } from "@/components/providers/ToastProvider"

interface PaymentFormProps {
  planId: string
  billingCycle: "monthly" | "yearly"
  amountFormatted: string
  onPaymentSuccess: (data: { orderCode?: number; transactionId?: string }) => void
  isProcessing?: boolean
}

interface PayOSLinkData {
  checkoutUrl: string
  orderCode: number
  amount: number
  description: string
  accountNumber?: string
  accountName?: string
  bin?: string
  qrCode?: string
}

function CopyBtn({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const { showToast } = useToast()

  const handleCopy = () => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(true)
    showToast({
      type: "success",
      title: "Đã sao chép",
      message: `Đã sao chép ${label.toLowerCase()} vào bộ nhớ tạm.`,
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-[12px] font-medium text-[#005DDC] hover:text-[#0047AB] bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded transition-colors cursor-pointer"
      title={`Sao chép ${label}`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-emerald-700">Đã chép</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>Sao chép</span>
        </>
      )}
    </button>
  )
}

export default function PaymentForm({
  planId,
  billingCycle,
  amountFormatted,
  onPaymentSuccess,
}: PaymentFormProps) {
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [payLinkData, setPayLinkData] = useState<PayOSLinkData | null>(null)

  const fetchPaymentLink = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/payment/create-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, billingCycle }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.message || "Không thể tạo mã thanh toán.")
      }

      setPayLinkData(data)
    } catch (err: any) {
      setError(err?.message || "Đã xảy ra lỗi khi tạo mã thanh toán.")
    } finally {
      setLoading(false)
    }
  }, [planId, billingCycle])

  useEffect(() => {
    fetchPaymentLink()
  }, [fetchPaymentLink])

  // Polling tự động kiểm tra trạng thái thanh toán mỗi 2.5s
  useEffect(() => {
    if (!payLinkData?.orderCode) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/payment/check-status?orderCode=${payLinkData.orderCode}`
        )
        if (res.ok) {
          const result = await res.json()
          if (result.status === "completed" || result.status === "PAID") {
            clearInterval(interval)
            showToast({
              type: "success",
              title: "Thanh toán thành công!",
              message: "Gói VIP của bạn đã được kích hoạt.",
            })
            onPaymentSuccess({
              orderCode: payLinkData.orderCode,
              transactionId: result.transactionId,
            })
          }
        }
      } catch {}
    }, 2500)

    return () => clearInterval(interval)
  }, [payLinkData?.orderCode, onPaymentSuccess, showToast])

  const accountNumber = payLinkData?.accountNumber || "0888805042005"
  const accountName = payLinkData?.accountName || "NGUYEN CHI VUONG"
  const transferMemo = payLinkData?.description || ""
  const amountNumber = payLinkData?.amount || 0
  const formattedAmount =
    amountNumber > 0
      ? `${amountNumber.toLocaleString("vi-VN")} đ`
      : amountFormatted

  // Ảnh VietQR chuẩn quốc gia do cổng VietQR tạo
  const vietQrImageUrl = `https://img.vietqr.io/image/${payLinkData?.bin || "970422"}-${accountNumber}-compact2.png?amount=${amountNumber}&addInfo=${encodeURIComponent(transferMemo)}&accountName=${encodeURIComponent(accountName)}`

  return (
    <div className="flex-1 w-full max-w-[480px]">
      {loading && (
        <div className="bg-white rounded-[16px] border border-slate-200 p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[#005DDC] animate-spin" />
          <p className="text-[14px] text-slate-500 font-medium">Đang tạo mã VietQR...</p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-white rounded-[16px] border border-rose-200 p-8 text-center space-y-3">
          <p className="text-[14px] text-rose-600 font-medium">{error}</p>
          <button
            type="button"
            onClick={fetchPaymentLink}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && payLinkData && (
        <div className="bg-white rounded-[16px] border border-slate-200 p-6 sm:p-7 space-y-5">
          <div>
            <h2 className="text-[20px] font-semibold text-[#222222] tracking-tight">
              Thanh toán VietQR
            </h2>
            <p className="text-[13px] text-[#757575] mt-0.5">
              Mở app ngân hàng bất kỳ để quét mã VietQR bên dưới.
            </p>
          </div>

          {/* Khung ảnh VietQR chuẩn */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <img
              src={vietQrImageUrl}
              alt="Mã VietQR thanh toán"
              className="w-[280px] h-auto object-contain rounded-lg shadow-xs bg-white"
            />

            <div className="flex items-center gap-2 mt-3 text-[13px] text-slate-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#005DDC]" />
              <span>Chờ nhận tiền...</span>
            </div>
          </div>

          {/* Thông tin chuyển khoản thủ công */}
          <div className="space-y-2.5 text-[13px]">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-[#757575]">Ngân hàng</span>
              <span className="font-medium text-[#222222]">MBBank (Quân Đội)</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-[#757575]">Chủ tài khoản</span>
              <span className="font-medium text-[#222222]">{accountName}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-[#757575]">Số tài khoản</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium text-[#222222]">{accountNumber}</span>
                <CopyBtn text={accountNumber} label="Số tài khoản" />
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-[#757575]">Số tiền</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#005DDC]">{formattedAmount}</span>
                <CopyBtn text={String(amountNumber)} label="Số tiền" />
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-[#757575]">Nội dung</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium text-[#222222] bg-slate-100 px-2 py-0.5 rounded text-[12px] select-all">
                  {transferMemo}
                </span>
                <CopyBtn text={transferMemo} label="Nội dung" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
