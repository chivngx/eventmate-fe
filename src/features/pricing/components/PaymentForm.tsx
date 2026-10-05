"use client"

import { useEffect, useState, useCallback } from "react"
import { Loader2, Copy, Check } from "lucide-react"
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
      className="inline-flex items-center gap-1 text-[12px] font-medium text-zinc-900 hover:text-black bg-zinc-100 hover:bg-zinc-200 px-2 py-0.5 rounded transition-colors cursor-pointer"
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
      } catch { }
    }, 2500)

    return () => clearInterval(interval)
  }, [payLinkData?.orderCode, onPaymentSuccess, showToast])

  const accountNumber = payLinkData?.accountNumber || "0888805042005"
  const accountName = payLinkData?.accountName || "NGUYEN CHI VUONG"
  const transferMemo = payLinkData?.description || ""
  const amountNumber = payLinkData?.amount || 2000
  const formattedAmount = amountFormatted

  // Ảnh VietQR chuẩn quốc gia do cổng VietQR tạo
  const vietQrImageUrl = `https://img.vietqr.io/image/${payLinkData?.bin || "970422"}-${accountNumber}-compact2.png?amount=${amountNumber}&addInfo=${encodeURIComponent(transferMemo)}&accountName=${encodeURIComponent(accountName)}`

  return (
    <div className="flex-1 w-full max-w-[520px]">
      {loading && (
        <div className="bg-white rounded-2xl ring-1 ring-zinc-200/80 p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-zinc-900 animate-spin" />
          <p className="text-[14px] text-slate-500 font-medium">Đang tạo mã VietQR...</p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-white rounded-2xl ring-1 ring-rose-200 p-8 text-center space-y-3">
          <p className="text-[14px] text-rose-600 font-medium">{error}</p>
          <button
            type="button"
            onClick={fetchPaymentLink}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium rounded-lg transition-colors cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && payLinkData && (
        <div className="bg-white rounded-2xl ring-1 ring-zinc-200/80 shadow-sm p-8 sm:p-10 space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-900 tracking-tight">
              Thanh toán VietQR
            </h2>
            <p className="text-[15px] text-zinc-500 mt-2 leading-relaxed">
              Mở app ngân hàng bất kỳ để quét mã VietQR. Hệ thống sẽ tự động duyệt trong 3-5 giây.
            </p>
          </div>

          {/* Khung ảnh VietQR chuẩn */}
          <div className="flex flex-col items-center justify-center p-6 bg-zinc-50 rounded-2xl ring-1 ring-zinc-200/50">
            <div className="relative p-2 bg-white rounded-xl shadow-sm ring-1 ring-zinc-200/50">
              <img
                src={vietQrImageUrl}
                alt="Mã VietQR thanh toán"
                className="w-[260px] h-[260px] object-contain rounded-lg bg-white"
              />
            </div>

            <div className="flex items-center gap-2 mt-5 text-[14px] text-emerald-700 bg-emerald-50 px-4 py-1.5 rounded-full ring-1 ring-emerald-200/50">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="font-medium">Đang chờ nhận tiền...</span>
            </div>
          </div>

          {/* Thông tin chuyển khoản thủ công */}
          <div className="space-y-5 pt-2">
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] text-zinc-500 font-medium">Ngân hàng hưởng thụ</span>
              <span className="font-semibold text-zinc-900 text-[15px]">MBBank (Ngân hàng Quân Đội)</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] text-zinc-500 font-medium">Tên tài khoản</span>
              <span className="font-semibold text-zinc-900 text-[15px]">{accountName}</span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2 items-start">
                <span className="text-[13px] text-zinc-500 font-medium">Số tài khoản</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-semibold text-zinc-900 text-[16px] tracking-wide">{accountNumber}</span>
                  <CopyBtn text={accountNumber} label="Số tài khoản" />
                </div>
              </div>

              <div className="flex flex-col gap-2 items-start">
                <span className="text-[13px] text-zinc-500 font-medium">Số tiền</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-zinc-900 text-[16px] tracking-wide">{amountNumber.toLocaleString("vi-VN")}đ</span>
                  <CopyBtn text={String(amountNumber)} label="Số tiền" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 items-start pt-2">
              <span className="text-[13px] text-zinc-500 font-medium">Nội dung chuyển khoản (Bắt buộc)</span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-semibold text-zinc-900 bg-zinc-100 px-3 py-1.5 rounded-md text-[15px] tracking-wider select-all ring-1 ring-zinc-200/50">
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
