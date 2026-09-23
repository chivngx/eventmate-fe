"use client"

import React, { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { QrCode, Copy, Check, Printer, ExternalLink } from "lucide-react"

interface EventCheckinQRModalProps {
  isOpen: boolean
  onClose: () => void
  event: {
    id: string
    title: string
    qr_checkin_code?: string | null
    event_date?: string | null
  }
}

export default function EventCheckinQRModal({
  isOpen,
  onClose,
  event,
}: EventCheckinQRModalProps) {
  const [copied, setCopied] = useState(false)

  const origin = typeof window !== "undefined" ? window.location.origin : ""
  const checkinCode = event.qr_checkin_code || event.id.substring(0, 6).toUpperCase()
  const checkinUrl = `${origin}/checkin?event=${event.id}&code=${checkinCode}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(checkinUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidthClassName="max-w-md"
      panelClassName="p-6 text-center"
      label="Mã QR Điểm Danh & Chấm Công"
    >
      <div className="space-y-4">
        {/* Header Icon & Titles */}
        <div className="flex flex-col items-center text-center">
          <div className="size-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
            <QrCode className="size-6" />
          </div>
          <h2 className="text-[18px] font-bold text-zinc-900 dark:text-zinc-100">
            Mã QR Điểm Danh & Chấm Công
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[320px] mt-1">
            Sinh viên trúng tuyển quét mã này bằng camera điện thoại hoặc Zalo để tự động ghi nhận có mặt.
          </p>
        </div>

        {/* Event Title pill */}
        <div className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">
          {event.title}
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs">
          <div className="p-3 bg-white rounded-xl shadow-xs border border-zinc-100">
            <QRCodeSVG
              value={checkinUrl}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* PIN Shortcode */}
          <div className="mt-4 flex flex-col items-center">
            <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Mã PIN Nhập Tay
            </span>
            <span className="text-[24px] font-mono font-bold text-zinc-900 dark:text-zinc-100 tracking-widest mt-0.5">
              {checkinCode}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <Button
            type="button"
            onClick={handleCopyLink}
            variant="outline"
            className="w-full h-10 text-xs font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="size-4 text-emerald-600" />
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Đã sao chép liên kết!</span>
              </>
            ) : (
              <>
                <Copy className="size-4 text-zinc-500" />
                <span>Sao chép link điểm danh</span>
              </>
            )}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              onClick={handlePrint}
              variant="outline"
              className="h-10 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="size-4 text-zinc-500" />
              <span>In mã QR này</span>
            </Button>

            <Button
              type="button"
              onClick={() => window.open(checkinUrl, "_blank")}
              className="h-10 text-xs font-semibold bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="size-4" />
              <span>Mở trang quét</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
