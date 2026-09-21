"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Volume2, VolumeX, ArrowRight } from "lucide-react"

export interface ReceiptPrinterProps {
  planId?: string
  billingCycle?: "monthly" | "yearly"
  amountFormatted?: string
  transactionId?: string | null
  onDone?: () => void
}

export default function ReceiptPrinterAnimation({
  planId = "standard",
  billingCycle = "monthly",
  amountFormatted,
  transactionId = null,
  onDone,
}: ReceiptPrinterProps) {
  const isEnterprise =
    planId === "enterprise" || planId === "standard" || planId === "agency"
  const defaultAmount = isEnterprise
    ? billingCycle === "yearly"
      ? "4.788.000đ"
      : "499.000đ"
    : "99.000đ"
  const displayAmount = amountFormatted || defaultAmount
  const planName = isEnterprise ? "DOANH NGHIỆP" : "SỰ KIỆN NHANH"
  const [currentMode, setCurrentMode] = useState<"smooth" | "classic">("smooth")
  const [isPrinting, setIsPrinting] = useState(false)
  const [isPrinted, setIsPrinted] = useState(false)
  const [isTorn, setIsTorn] = useState(false)
  const [cutterActive, setCutterActive] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [statusText, setStatusText] = useState({
    title: "Thanh Toán Thành Công!",
    sub: "Gói dịch vụ đã được kích hoạt — đang in hóa đơn...",
  })

  const [hasPrintedStage, setHasPrintedStage] = useState(false)

  const isPrintingRef = useRef(false)
  const isPrintedRef = useRef(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const paperRef = useRef<HTMLDivElement>(null)

  // Initialize Web Audio context
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx()
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume()
    }
  }, [])

  // Web Audio Synthesizer: Thermal printer motor hum + stepper clicks
  const playPrinterSound = useCallback(
    (mode: "smooth" | "classic", durationMs: number) => {
      if (!soundEnabled) return
      initAudio()
      const ctx = audioCtxRef.current
      if (!ctx) return

      const now = ctx.currentTime
      const duration = durationMs / 1000

      // Noise buffer for mechanical motor background
      const bufferSize = Math.floor(ctx.sampleRate * duration)
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const output = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1
      }

      const whiteNoise = ctx.createBufferSource()
      whiteNoise.buffer = buffer

      // Bandpass filter for thermal printer sound
      const filter = ctx.createBiquadFilter()
      filter.type = "bandpass"
      filter.frequency.setValueAtTime(mode === "classic" ? 850 : 600, now)
      filter.Q.setValueAtTime(3.5, now)

      const gainNode = ctx.createGain()
      const peakGain = mode === "classic" ? 0.07 : 0.04
      gainNode.gain.setValueAtTime(0.001, now)
      gainNode.gain.linearRampToValueAtTime(peakGain, now + 0.08)
      gainNode.gain.setValueAtTime(peakGain, now + duration - 0.12)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration)

      whiteNoise.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(ctx.destination)

      whiteNoise.start(now)
      whiteNoise.stop(now + duration)

      // Stepper pulse clicks for Classic mode
      if (mode === "classic") {
        const stepCount = 14
        const interval = (duration - 0.1) / stepCount

        for (let i = 0; i < stepCount; i++) {
          const stepTime = now + i * interval
          const osc = ctx.createOscillator()
          const stepGain = ctx.createGain()

          osc.type = "square"
          osc.frequency.setValueAtTime(210 + Math.random() * 60, stepTime)

          stepGain.gain.setValueAtTime(0.05, stepTime)
          stepGain.gain.exponentialRampToValueAtTime(0.001, stepTime + 0.02)

          osc.connect(stepGain)
          stepGain.connect(ctx.destination)

          osc.start(stepTime)
          osc.stop(stepTime + 0.02)
        }
      }
    },
    [soundEnabled, initAudio]
  )

  // Mechanical cutter blade tear sound
  const playTearSound = useCallback(() => {
    if (!soundEnabled) return
    initAudio()
    const ctx = audioCtxRef.current
    if (!ctx) return

    const now = ctx.currentTime
    const duration = 0.35
    const bufferSize = Math.floor(ctx.sampleRate * duration)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.06))
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = "highpass"
    filter.frequency.setValueAtTime(1400, now)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.22, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    noise.start(now)
    noise.stop(now + duration)
  }, [soundEnabled, initAudio])

  // Trigger Print Animation
  const triggerPrint = useCallback(() => {
    if (isPrintingRef.current) return
    isPrintingRef.current = true

    setIsPrinting(true)
    setIsPrinted(false)
    setIsTorn(false)
    setCutterActive(false)
    setHasPrintedStage(true)
    setStatusText({
      title: "Đang In Hóa Đơn...",
      sub: "Vui lòng đợi máy in xuất biên lai giao dịch",
    })

    const animDuration = 2500
    playPrinterSound(currentMode, animDuration)

    setTimeout(() => {
      isPrintingRef.current = false
      isPrintedRef.current = true
      setIsPrinting(false)
      setIsPrinted(true)
      setStatusText({
        title: "Thanh Toán & Kích Hoạt Thành Công!",
        sub: "Hóa đơn dịch vụ của bạn đã được xuất hoàn tất.",
      })
    }, animDuration)
  }, [currentMode, playPrinterSound])

  // Trigger Tear Animation
  const triggerTear = useCallback(() => {
    if (!isPrintedRef.current || isPrintingRef.current) return

    playTearSound()
    setCutterActive(true)
    setIsTorn(true)

    setStatusText({
      title: "Đã Xé Hóa Đơn",
      sub: "Bạn có thể in lại bản sao bất cứ lúc nào.",
    })

    setTimeout(() => {
      isPrintedRef.current = false
      setIsPrinted(false)
      setIsTorn(false)
      setCutterActive(false)
      setHasPrintedStage(false)
    }, 550)
  }, [playTearSound])

  // Auto-trigger print once on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerPrint()
    }, 350)
    return () => clearTimeout(timer)
  }, [triggerPrint])

  // Current formatted date
  const nowFormatted = new Date().toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
  const codeFormatted = transactionId
    ? `TXN-${transactionId.slice(0, 10).toUpperCase()}`
    : "TXN-8849204192"

  // Paper classes based on state
  let paperClasses = "receipt-paper-wrapper"
  if (isTorn) {
    paperClasses += " tearing"
  } else if (isPrinting) {
    paperClasses += currentMode === "classic" ? " printing-classic vibrating" : " printing-smooth"
  } else if (isPrinted) {
    paperClasses += " printed"
  } else {
    paperClasses += " retracted"
  }

  return (
    <div className="receipt-printer-root">
      {/* Top Options Control Bar */}
      <div className="centered-options-bar">
        <div className="option-group">
          <button
            type="button"
            className={`option-btn ${currentMode === "smooth" ? "active" : ""}`}
            onClick={() => setCurrentMode("smooth")}
          >
            <span className="dot" />
            <span>Smooth</span>
          </button>
          <button
            type="button"
            className={`option-btn ${currentMode === "classic" ? "active" : ""}`}
            onClick={() => setCurrentMode("classic")}
          >
            <span className="dot" />
            <span>Classic</span>
          </button>
        </div>

        <div className="divider" />

        {/* Sound Toggle */}
        <button
          type="button"
          className="icon-btn"
          onClick={() => {
            setSoundEnabled(!soundEnabled)
            if (!soundEnabled) initAudio()
          }}
          title={soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-amber-900" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>
      </div>

      {/* Main Stage */}
      <div className={`printer-stage ${hasPrintedStage ? "has-printed" : ""}`}>
        {/* Unified Metallic Gold 3D Dispenser Machine */}
        <div className="machine-unit">
          {/* Top 3D Metallic Hood Bar */}
          <div className="machine-hood-top">
            <div className="hood-highlight" />
          </div>

          {/* Dark Slit Mouth where receipt feeds out */}
          <div className="machine-slot-slit" />

          {/* Cutter Blade Flash Effect */}
          <div className={`cutter-blade-flash ${cutterActive ? "active" : ""}`} />

          {/* Bottom Machine Lip Base */}
          <div className="machine-hood-bottom">
            <div className="hood-shadow" />
          </div>

          {/* Paper Viewport Container */}
          <div className="paper-viewport">
            {/* Animated Paper Component */}
            <div ref={paperRef} className={paperClasses}>
              <div className="receipt-content">
                {/* Receipt Header & Brand Logo Stamp */}
                <div className="receipt-header">
                  <div className="header-brand-info">
                    <div className="brand-company-name">EVENTMATE PLATFORM</div>
                    <div className="payment-title">HÓA ĐƠN DỊCH VỤ NHÀ TUYỂN DỤNG</div>
                  </div>
                  <div className="logo-badge">
                    <img
                      src="/images/receipt-logo.jfif"
                      alt="EventMate Logo"
                      className="brand-logo-img"
                      onError={(e) => {
                        // Fallback to favicon if image fails
                        ;(e.target as HTMLImageElement).src = "/favicon.svg"
                      }}
                    />
                  </div>
                </div>

                {/* Big Total Display */}
                <div className="receipt-amount-section">
                  <div className="receipt-amount">{displayAmount}</div>
                  <div className="receipt-meta">
                    {nowFormatted} | PAYOS (ĐÃ THANH TOÁN)
                  </div>
                </div>

                <div className="receipt-divider" />

                {/* Items Breakdown */}
                <div className="receipt-items-list">
                  {isEnterprise ? (
                    <>
                      <div className="receipt-item-row">
                        <span className="item-name">
                          1X Gói {planName} ({billingCycle === "yearly" ? "12 Tháng" : "1 Tháng"})
                        </span>
                        <span className="item-price">{displayAmount}</span>
                      </div>
                      <div className="receipt-item-row">
                        <span className="item-name">1X Tối đa 5 sự kiện đồng thời</span>
                        <span className="item-price">0đ</span>
                      </div>
                      <div className="receipt-item-row">
                        <span className="item-name">1X Lên lịch phỏng vấn & Hỗ trợ VIP</span>
                        <span className="item-price">Bao gồm</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="receipt-item-row">
                        <span className="item-name">
                          1X Gói {planName} (1 Sự Kiện)
                        </span>
                        <span className="item-price">{displayAmount}</span>
                      </div>
                      <div className="receipt-item-row">
                        <span className="item-name">1X Ghim tin HOT & Tuyển Gấp 7 ngày</span>
                        <span className="item-price">0đ</span>
                      </div>
                      <div className="receipt-item-row">
                        <span className="item-name">1X Điểm danh QR & Cấp E-Certificate</span>
                        <span className="item-price">Bao gồm</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="receipt-divider" />

                {/* Subtotal & Grand Total */}
                <div className="receipt-totals-section">
                  <div className="total-row">
                    <span>Tạm tính</span>
                    <span>{displayAmount}</span>
                  </div>
                  <div className="total-row">
                    <span>Thuế VAT (0%)</span>
                    <span>0đ</span>
                  </div>

                  <div className="receipt-grand-total">
                    <span>TỔNG CỘNG</span>
                    <span>{displayAmount}</span>
                  </div>
                </div>

                {/* Footer Greeting & Barcode */}
                <div className="receipt-footer">
                  <div className="footer-msg">CẢM ƠN BẠN ĐÃ ĐỒNG HÀNH!</div>
                  <div className="barcode-graphic">
                    <div className="barcode-lines" />
                    <div className="barcode-num">{codeFormatted}</div>
                  </div>
                </div>
              </div>

              {/* Authentic Cutter Edge at Bottom */}
              <div className="serrated-edge" />
            </div>
          </div>
        </div>

        {/* Action Status & Centered Controls Below Machine */}
        <div className="stage-info">
          <h1 className="status-heading">{statusText.title}</h1>
          <p className="status-subtext">{statusText.sub}</p>

          {/* Centered Action Buttons */}
          <div className="centered-action-bar">
            <button
              type="button"
              className="print-action-btn"
              onClick={() => {
                initAudio()
                if (isPrintedRef.current) {
                  isPrintedRef.current = false
                  setIsPrinted(false)
                  setHasPrintedStage(false)
                  setTimeout(() => {
                    triggerPrint()
                  }, 250)
                } else {
                  triggerPrint()
                }
              }}
              disabled={isPrinting}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span>
                {isPrinting
                  ? "Đang in..."
                  : isPrinted
                  ? "In lại hóa đơn"
                  : "In hóa đơn"}
              </span>
            </button>

            {isPrinted && (
              <button
                type="button"
                className="secondary-action-btn"
                onClick={triggerTear}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <span>Xé hóa đơn</span>
              </button>
            )}

            {onDone && (
              <button
                type="button"
                className="dashboard-action-btn"
                onClick={onDone}
              >
                <span>Vào Bảng điều khiển</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
