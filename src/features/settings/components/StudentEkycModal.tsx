"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Clock,
  IdCard,
} from "lucide-react"
import { Html5Qrcode } from "html5-qrcode"
import jsQR from "jsqr"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/providers/ToastProvider"

export interface StudentEkycModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  currentKycStatus?: string | null
  rejectionReason?: string | null
}

export interface ParsedEkycData {
  idCardNumber: string
  oldIdCardNumber: string
  fullName: string
  dob: string
  gender: string
  address: string
  issueDate: string
}

type StepType = "GUIDE" | "CARD_SCAN" | "SELFIE" | "REVIEW" | "SUBMITTING" | "SUCCESS"

export default function StudentEkycModal({
  isOpen,
  onClose,
  onSuccess,
  currentKycStatus,
  rejectionReason,
}: StudentEkycModalProps) {
  const { showToast } = useToast()

  const [step, setStep] = useState<StepType>("GUIDE")
  const [scanMethod, setScanMethod] = useState<"CAMERA" | "IMAGE" | null>(null)
  const [isScanningActive, setIsScanningActive] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Data states
  const [cardImage, setCardImage] = useState<string | null>(null)
  const [cardImageFile, setCardImageFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedEkycData | null>(null)

  const [selfieImage, setSelfieImage] = useState<string | null>(null)
  const [selfieImageFile, setSelfieImageFile] = useState<File | null>(null)
  const [isSelfieCameraActive, setIsSelfieCameraActive] = useState(false)

  // Camera references
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selfieFileInputRef = useRef<HTMLInputElement>(null)
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)
  const selfieVideoRef = useRef<HTMLVideoElement>(null)
  const selfieStreamRef = useRef<MediaStream | null>(null)

  // Reset when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      stopCardScanner()
      stopSelfieCamera()
      setStep("GUIDE")
      setScanMethod(null)
      setCardImage(null)
      setCardImageFile(null)
      setParsedData(null)
      setSelfieImage(null)
      setSelfieImageFile(null)
      setErrorMsg(null)
    }
  }, [isOpen])

  // Stop scanners when switching steps
  useEffect(() => {
    if (step !== "CARD_SCAN") {
      stopCardScanner()
    }
    if (step !== "SELFIE") {
      stopSelfieCamera()
    }
  }, [step])

  const stopCardScanner = () => {
    setIsScanningActive(false)
    if (html5QrCodeRef.current) {
      try {
        html5QrCodeRef.current.stop().then(() => {
          html5QrCodeRef.current?.clear()
          html5QrCodeRef.current = null
        }).catch(() => {})
      } catch {
        // ignore
      }
    }
  }

  const stopSelfieCamera = () => {
    setIsSelfieCameraActive(false)
    if (selfieStreamRef.current) {
      selfieStreamRef.current.getTracks().forEach((track) => track.stop())
      selfieStreamRef.current = null
    }
  }

  const parseQRString = (qrString: string): ParsedEkycData | null => {
    const parts = qrString.split("|")
    if (parts.length < 6) return null
    return {
      idCardNumber: parts[0] || "",
      oldIdCardNumber: parts[1] || "",
      fullName: parts[2] || "",
      dob: parts[3] || "",
      gender: parts[4] || "",
      address: parts[5] || "",
      issueDate: parts[6] || "",
    }
  }

  const startCardCamera = async () => {
    setScanMethod("CAMERA")
    setErrorMsg(null)
    setIsScanningActive(true)

    setTimeout(() => {
      try {
        html5QrCodeRef.current = new Html5Qrcode("card-camera-reader")
        html5QrCodeRef.current
          .start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 260, height: 260 },
              aspectRatio: 1.0,
            },
            (decodedText) => {
              handleCardScanSuccess(decodedText)
            },
            () => {}
          )
          .catch((err) => {
            setErrorMsg("Không thể truy cập camera sau: " + err.message)
            setIsScanningActive(false)
          })
      } catch (err: any) {
        setErrorMsg("Lỗi khởi tạo camera: " + err.message)
        setIsScanningActive(false)
      }
    }, 250)
  }

  const handleCardScanSuccess = (decodedText: string, imagePreviewUrl?: string, fileBlob?: File) => {
    stopCardScanner()
    try {
      const data = parseQRString(decodedText)
      if (!data || !data.idCardNumber || !data.fullName) {
        throw new Error("Mã QR không đúng định dạng CCCD gắn chip Việt Nam.")
      }
      setParsedData(data)
      if (imagePreviewUrl) {
        setCardImage(imagePreviewUrl)
      }
      if (fileBlob) {
        setCardImageFile(fileBlob)
      }
      setErrorMsg(null)
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi khi giải mã thông tin CCCD.")
    }
  }

  const handleCardFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0]
    if (!file) return

    setScanMethod("IMAGE")
    setErrorMsg(null)
    setIsScanningActive(true)

    try {
      let bitmap: ImageBitmap
      try {
        bitmap = await createImageBitmap(file)
      } catch (err: any) {
        try {
          const heic2any = (await import("heic2any")).default
          const convertedBlob = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.85,
          })
          const blobArr = Array.isArray(convertedBlob) ? convertedBlob : [convertedBlob]
          file = new File(blobArr, file.name.replace(/\.[^/.]+$/, "") + "_converted.jpg", { type: "image/jpeg" })
          bitmap = await createImageBitmap(file)
        } catch {
          throw new Error("Không thể đọc định dạng ảnh này. Vui lòng thử ảnh JPG hoặc PNG.")
        }
      }

      let finalDecodedText: string | null = null

      // 1. Thử BarcodeDetector native
      if ("BarcodeDetector" in window) {
        try {
          const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] })
          const codes = await detector.detect(bitmap)
          if (codes.length > 0) {
            finalDecodedText = codes[0].rawValue
          }
        } catch {}
      }

      // 2. Thử Html5Qrcode
      if (!finalDecodedText) {
        try {
          const html5QrCode = new Html5Qrcode("hidden-reader-card")
          finalDecodedText = await html5QrCode.scanFile(file, false)
        } catch {}
      }

      // 3. Multi-pass jsQR scan
      if (!finalDecodedText) {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d", { willReadFrequently: true })
        if (ctx) {
          const scanRegion = (scale: number, offsetX: number, offsetY: number, width: number, height: number) => {
            canvas.width = Math.floor(width * scale)
            canvas.height = Math.floor(height * scale)
            ctx.fillStyle = "white"
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(bitmap, offsetX, offsetY, width, height, 0, 0, canvas.width, canvas.height)
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const code = jsQR(imageData.data, imageData.width, imageData.height)
            return code ? code.data : null
          }

          const scales = [1, 0.75, 0.5, 0.25]
          for (const scale of scales) {
            finalDecodedText = scanRegion(scale, 0, 0, bitmap.width, bitmap.height)
            if (finalDecodedText) break
            // Góc 1/4 trên bên phải (CCCD chuẩn)
            finalDecodedText = scanRegion(scale, bitmap.width / 2, 0, bitmap.width / 2, bitmap.height / 2)
            if (finalDecodedText) break
            // Góc 1/4 trên bên trái
            finalDecodedText = scanRegion(scale, 0, 0, bitmap.width / 2, bitmap.height / 2)
            if (finalDecodedText) break
          }
        }
      }

      if (finalDecodedText) {
        const objectUrl = URL.createObjectURL(file)
        handleCardScanSuccess(finalDecodedText, objectUrl, file)
      } else {
        throw new Error("Không tìm thấy mã QR trên ảnh. Vui lòng chụp gần và nét hơn phần mã QR ở góc trên thẻ.")
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Không thể quét ảnh.")
    } finally {
      setIsScanningActive(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  // --- Selfie Camera Handlers ---
  const startSelfieCamera = async () => {
    setErrorMsg(null)
    setIsSelfieCameraActive(true)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      })
      selfieStreamRef.current = stream
      if (selfieVideoRef.current) {
        selfieVideoRef.current.srcObject = stream
        await selfieVideoRef.current.play()
      }
    } catch (err: any) {
      setErrorMsg("Không thể mở camera trước: " + err.message + ". Bạn có thể tải ảnh selfie từ thư viện.")
      setIsSelfieCameraActive(false)
    }
  }

  const captureSelfiePhoto = () => {
    if (!selfieVideoRef.current) return
    const video = selfieVideoRef.current
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth || 480
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Lật ngang ảnh để giống gương
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `selfie_${Date.now()}.jpg`, { type: "image/jpeg" })
          setSelfieImageFile(file)
          const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
          setSelfieImage(dataUrl)
          stopSelfieCamera()
        }
      },
      "image/jpeg",
      0.9
    )
  }

  const handleSelfieFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelfieImageFile(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      setSelfieImage(event.target?.result as string)
      stopSelfieCamera()
    }
    reader.readAsDataURL(file)
  }

  const formatDate = (ddmmyyyy: string) => {
    if (!ddmmyyyy || ddmmyyyy.length !== 8) return ddmmyyyy
    return `${ddmmyyyy.substring(0, 2)}/${ddmmyyyy.substring(2, 4)}/${ddmmyyyy.substring(4, 8)}`
  }

  const extractYear = (ddmmyyyy: string) => {
    if (!ddmmyyyy || ddmmyyyy.length !== 8) return null
    const year = parseInt(ddmmyyyy.substring(4, 8), 10)
    return isNaN(year) ? null : year
  }

  const sha256 = async (message: string) => {
    const msgBuffer = new TextEncoder().encode(message)
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

  const handleSubmit = async () => {
    if (!parsedData) {
      setErrorMsg("Thiếu dữ liệu CCCD.")
      return
    }
    setStep("SUBMITTING")
    setErrorMsg(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")

      // 1. Upload CCCD image nếu có file
      let cccdUrl = cardImage || ""
      if (cardImageFile) {
        const fileExt = cardImageFile.name.split(".").pop() || "jpg"
        const cccdPath = `${user.id}/cccd_${Date.now()}.${fileExt}`
        const { error: cccdUploadErr } = await supabase.storage
          .from("kyc_documents")
          .upload(cccdPath, cardImageFile, { upsert: true })

        if (!cccdUploadErr) {
          const { data: cccdPublic } = supabase.storage.from("kyc_documents").getPublicUrl(cccdPath)
          cccdUrl = cccdPublic.publicUrl
        }
      }

      // 2. Upload Selfie image nếu có file
      let selfieUrl = selfieImage || ""
      if (selfieImageFile) {
        const fileExt = selfieImageFile.name.split(".").pop() || "jpg"
        const selfiePath = `${user.id}/selfie_${Date.now()}.${fileExt}`
        const { error: selfieUploadErr } = await supabase.storage
          .from("kyc_documents")
          .upload(selfiePath, selfieImageFile, { upsert: true })

        if (!selfieUploadErr) {
          const { data: selfiePublic } = supabase.storage.from("kyc_documents").getPublicUrl(selfiePath)
          selfieUrl = selfiePublic.publicUrl
        }
      }

      const idHash = await sha256(parsedData.idCardNumber.trim())

      // 3. Cập nhật profiles với kyc_status: "pending" và kyc_data (CHỜ ADMIN DUYỆT)
      const kycPayload = {
        kyc_status: "pending",
        is_verified: false, // CHƯA DUYỆT!
        id_card_hash: idHash,
        gender: parsedData.gender || null,
        birth_year: extractYear(parsedData.dob),
        kyc_data: {
          id_card_number_masked: `${parsedData.idCardNumber.slice(0, 3)}******${parsedData.idCardNumber.slice(-3)}`,
          id_card_number_full: parsedData.idCardNumber,
          full_name: parsedData.fullName,
          dob: parsedData.dob,
          gender: parsedData.gender,
          address: parsedData.address,
          cccd_front_url: cccdUrl,
          selfie_url: selfieUrl,
          submitted_at: new Date().toISOString(),
        },
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update(kycPayload)
        .eq("id", user.id)

      if (updateError) {
        if (updateError.code === "23505") {
          throw new Error("CCCD này đã được sử dụng để xác thực một tài khoản khác trong hệ thống.")
        }
        throw updateError
      }

      showToast({
        title: "Đã gửi hồ sơ eKYC",
        message: "Hồ sơ xác thực đã được chuyển tới Ban quản trị để phê duyệt.",
        type: "success",
      })

      if (onSuccess) onSuccess()
      setStep("SUCCESS")
    } catch (err: any) {
      console.error("eKYC Submit Error:", err)
      setErrorMsg(err.message || "Đã xảy ra lỗi khi gửi yêu cầu xác thực.")
      setStep("REVIEW")
    }
  }

  if (!isOpen) return null

  // Indicator mapping
  const stepNumber =
    step === "GUIDE" ? 1 : step === "CARD_SCAN" ? 2 : step === "SELFIE" ? 3 : 4

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={step === "SUBMITTING" ? undefined : onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="size-4.5" />
                </div>
                <div>
                  <h2 className="text-[16px] font-bold text-zinc-900 leading-tight">
                    Xác thực Danh tính (eKYC)
                  </h2>
                  <p className="text-[11.5px] text-zinc-500">
                    Quy trình kiểm duyệt bởi Ban Quản Trị
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={step === "SUBMITTING"}
                className="size-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="size-4.5" />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            {step !== "SUCCESS" && (
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                {[
                  { num: 1, label: "Hướng dẫn" },
                  { num: 2, label: "Mặt trước CCCD" },
                  { num: 3, label: "Ảnh chân dung" },
                  { num: 4, label: "Gửi duyệt" },
                ].map((s, idx) => (
                  <div key={s.num} className="flex items-center gap-1.5 flex-1 last:flex-none">
                    <div
                      className={`size-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                        stepNumber === s.num
                          ? "bg-zinc-900 text-white shadow-xs"
                          : stepNumber > s.num
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {stepNumber > s.num ? "✓" : s.num}
                    </div>
                    <span
                      className={`text-[11.5px] font-medium hidden sm:inline ${
                        stepNumber === s.num
                          ? "text-zinc-900 font-semibold"
                          : stepNumber > s.num
                          ? "text-emerald-700"
                          : "text-slate-400"
                      }`}
                    >
                      {s.label}
                    </span>
                    {idx < 3 && (
                      <div
                        className={`h-0.5 flex-1 mx-1.5 rounded-full transition-colors ${
                          stepNumber > s.num ? "bg-emerald-500" : "bg-slate-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
                <AlertCircle className="size-4.5 shrink-0 mt-0.5 text-red-600" />
                <p className="flex-1 leading-relaxed">{errorMsg}</p>
              </div>
            )}

            {/* Rejection Notice if any */}
            {currentKycStatus === "rejected" && step === "GUIDE" && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertCircle className="size-4 text-amber-600" />
                  Hồ sơ trước đó đã bị Ban Quản Trị từ chối:
                </p>
                <p className="text-amber-700 italic pl-5">
                  &ldquo;{rejectionReason || "Ảnh chụp không rõ ràng hoặc thông tin chưa khớp."}&rdquo;
                </p>
                <p className="text-xs text-amber-600 pl-5 pt-0.5">
                  Vui lòng thực hiện lại theo đúng các lưu ý bên dưới.
                </p>
              </div>
            )}

            {/* STEP 1: HƯỚNG DẪN & CHUẨN BỊ */}
            {step === "GUIDE" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center shrink-0">
                      <IdCard className="size-4.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900 text-sm">
                        Yêu cầu chuẩn bị
                      </p>
                      <p className="text-xs text-slate-500">
                        Thẻ Căn cước công dân gắn chip (hoặc Căn cước mới)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200 text-xs text-slate-700">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Thẻ CCCD bản gốc, rõ nét, không bị bóng lóa hoặc che khuất mã QR.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Khuôn mặt chụp chân dung nhìn thẳng, đủ sáng, không đeo kính râm hay khẩu trang.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Chỉ Ban quản trị mới có quyền truy xuất ảnh đối soát nhằm bảo mật 100%.</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/70 text-blue-800 text-xs flex items-start gap-2">
                  <Sparkles className="size-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Sau khi hoàn tất, hồ sơ sẽ được chuyển tới Ban quản trị phê duyệt. Tài khoản sẽ nhận huy hiệu <strong className="font-semibold">Tích xanh KYC</strong> và tăng độ uy tín nhận việc.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null)
                    setStep("CARD_SCAN")
                  }}
                  className="w-full h-11 rounded-xl bg-zinc-900 hover:bg-black text-white font-semibold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Bắt đầu xác thực</span>
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}

            {/* STEP 2: QUÉT MẶT TRƯỚC CCCD & QR CODE */}
            {step === "CARD_SCAN" && (
              <div className="space-y-4">
                {/* Chưa quét được */}
                {!parsedData ? (
                  <>
                    <p className="text-xs sm:text-sm text-slate-600 text-center">
                      Chọn phương thức quét mã QR ở góc trên thẻ CCCD mặt trước:
                    </p>

                    {/* Camera view */}
                    {isScanningActive && scanMethod === "CAMERA" ? (
                      <div className="space-y-3">
                        <div className="relative w-full aspect-square max-w-[280px] mx-auto rounded-2xl overflow-hidden bg-black border-2 border-zinc-900 shadow-md">
                          <div id="card-camera-reader" className="size-full" />
                          <div className="absolute inset-0 border-2 border-emerald-500/60 rounded-2xl pointer-events-none flex items-center justify-center">
                            <span className="text-[11px] font-medium text-white/90 bg-black/60 px-2.5 py-1 rounded-full">
                              Căn chỉnh mã QR vào khung
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={stopCardScanner}
                          className="w-full h-9 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-100 transition-colors"
                        >
                          Dừng Camera &amp; Chọn cách khác
                        </button>
                      </div>
                    ) : isScanningActive && scanMethod === "IMAGE" ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="size-8 text-zinc-900 animate-spin mb-3" />
                        <p className="text-xs text-slate-600">Đang nhận diện mã QR...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={startCardCamera}
                          className="p-4 rounded-xl border border-slate-200 hover:border-zinc-900 hover:bg-slate-50 transition-all flex flex-col items-center text-center gap-2 group cursor-pointer"
                        >
                          <div className="size-11 rounded-full bg-slate-100 group-hover:bg-zinc-900 group-hover:text-white text-zinc-900 flex items-center justify-center transition-colors">
                            <Camera className="size-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-zinc-900">
                              Quét bằng Camera
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Dùng camera điện thoại/máy tính
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-4 rounded-xl border border-slate-200 hover:border-zinc-900 hover:bg-slate-50 transition-all flex flex-col items-center text-center gap-2 group cursor-pointer"
                        >
                          <div className="size-11 rounded-full bg-slate-100 group-hover:bg-zinc-900 group-hover:text-white text-zinc-900 flex items-center justify-center transition-colors">
                            <ImageIcon className="size-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-zinc-900">
                              Tải ảnh CCCD lên
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Chọn ảnh chụp mặt trước từ thư viện
                            </p>
                          </div>
                        </button>
                      </div>
                    )}

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleCardFileUpload}
                    />
                  </>
                ) : (
                  /* Đã quét thành công */
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                      <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
                      <span className="font-semibold">
                        Đã trích xuất thông tin mã QR CCCD thành công!
                      </span>
                    </div>

                    {cardImage && (
                      <div className="relative w-full h-[140px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cardImage}
                          alt="Ảnh mặt trước CCCD"
                          className="size-full object-cover"
                        />
                      </div>
                    )}

                    <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Số CCCD:</span>
                        <span className="font-semibold text-zinc-900">
                          {parsedData.idCardNumber.slice(0, 3)}******{parsedData.idCardNumber.slice(-3)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Họ và tên:</span>
                        <span className="font-semibold text-zinc-900 uppercase">
                          {parsedData.fullName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Ngày sinh:</span>
                        <span className="font-semibold text-zinc-900">
                          {formatDate(parsedData.dob)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setParsedData(null)
                          setCardImage(null)
                          setCardImageFile(null)
                        }}
                        className="flex-1 h-10 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="size-3.5" />
                        <span>Quét lại</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMsg(null)
                          setStep("SELFIE")
                        }}
                        className="flex-1 h-10 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <span>Tiếp: Chụp chân dung</span>
                        <ChevronRight className="size-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: CHỤP CHÂN DUNG KHUÔN MẶT (SELFIE) */}
            {step === "SELFIE" && (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-slate-600 text-center">
                  Chụp 1 tấm ảnh chân dung chính diện để Ban quản trị đối chiếu với ảnh CCCD:
                </p>

                {!selfieImage ? (
                  <div className="space-y-3">
                    {isSelfieCameraActive ? (
                      <div className="space-y-3">
                        <div className="relative w-[240px] h-[240px] mx-auto rounded-full overflow-hidden bg-black border-4 border-zinc-900 shadow-md">
                          <video
                            ref={selfieVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="size-full object-cover scale-x-[-1]"
                          />
                          <div className="absolute inset-0 border-2 border-dashed border-white/60 rounded-full pointer-events-none" />
                        </div>

                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={captureSelfiePhoto}
                            className="h-10 px-6 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                          >
                            <Camera className="size-4" />
                            <span>Bấm chụp ảnh</span>
                          </button>
                          <button
                            type="button"
                            onClick={stopSelfieCamera}
                            className="h-10 px-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-100 transition-colors"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={startSelfieCamera}
                          className="p-4 rounded-xl border border-slate-200 hover:border-zinc-900 hover:bg-slate-50 transition-all flex flex-col items-center text-center gap-2 group cursor-pointer"
                        >
                          <div className="size-11 rounded-full bg-slate-100 group-hover:bg-zinc-900 group-hover:text-white text-zinc-900 flex items-center justify-center transition-colors">
                            <Camera className="size-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-zinc-900">
                              Mở Camera trước
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Chụp trực tiếp qua camera máy
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => selfieFileInputRef.current?.click()}
                          className="p-4 rounded-xl border border-slate-200 hover:border-zinc-900 hover:bg-slate-50 transition-all flex flex-col items-center text-center gap-2 group cursor-pointer"
                        >
                          <div className="size-11 rounded-full bg-slate-100 group-hover:bg-zinc-900 group-hover:text-white text-zinc-900 flex items-center justify-center transition-colors">
                            <UserCheck className="size-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-zinc-900">
                              Tải ảnh chân dung
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Chọn ảnh selfie rõ mặt từ máy
                            </p>
                          </div>
                        </button>
                      </div>
                    )}

                    <input
                      type="file"
                      ref={selfieFileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleSelfieFileUpload}
                    />
                  </div>
                ) : (
                  /* Đã có ảnh selfie */
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                      <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
                      <span className="font-semibold">Đã ghi nhận ảnh chân dung rõ nét!</span>
                    </div>

                    <div className="size-[160px] mx-auto rounded-full overflow-hidden border-2 border-slate-200 shadow-sm bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selfieImage}
                        alt="Ảnh chân dung selfie"
                        className="size-full object-cover"
                      />
                    </div>

                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelfieImage(null)
                          setSelfieImageFile(null)
                        }}
                        className="flex-1 h-10 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="size-3.5" />
                        <span>Chụp lại</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMsg(null)
                          setStep("REVIEW")
                        }}
                        className="flex-1 h-10 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <span>Tiếp: Kiểm tra thông tin</span>
                        <ChevronRight className="size-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: ĐỐI SOÁT & GỬI DUYỆT */}
            {step === "REVIEW" && parsedData && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                  <Clock className="size-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Hồ sơ sẽ được chuyển tới Ban Quản Trị đối soát trong vòng 24h. Chỉ Admin mới có quyền truy xuất thông tin này.
                  </p>
                </div>

                {/* 2 ảnh đối chiếu song song */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium text-slate-500 uppercase">Mặt trước CCCD</p>
                    <div className="h-[95px] rounded-lg border border-slate-200 bg-slate-100 overflow-hidden">
                      {cardImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cardImage} alt="CCCD" className="size-full object-cover" />
                      ) : (
                        <div className="size-full flex items-center justify-center text-slate-400 text-xs">
                          Chưa có ảnh
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] font-medium text-slate-500 uppercase">Ảnh chân dung</p>
                    <div className="h-[95px] rounded-lg border border-slate-200 bg-slate-100 overflow-hidden">
                      {selfieImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={selfieImage} alt="Selfie" className="size-full object-cover" />
                      ) : (
                        <div className="size-full flex items-center justify-center text-slate-400 text-xs">
                          Chưa có ảnh
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bảng thông tin định danh */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2">
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-500">Số CCCD:</span>
                    <span className="col-span-2 font-semibold text-zinc-900">
                      {parsedData.idCardNumber.slice(0, 3)}******{parsedData.idCardNumber.slice(-3)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-500">Họ và tên:</span>
                    <span className="col-span-2 font-semibold text-zinc-900 uppercase">
                      {parsedData.fullName}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-500">Giới tính:</span>
                    <span className="col-span-2 font-semibold text-zinc-900">
                      {parsedData.gender}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-500">Ngày sinh:</span>
                    <span className="col-span-2 font-semibold text-zinc-900">
                      {formatDate(parsedData.dob)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-500">Nơi thường trú:</span>
                    <span className="col-span-2 font-medium text-zinc-800 line-clamp-2">
                      {parsedData.address}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep("SELFIE")}
                    className="h-11 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="size-3.5" />
                    <span>Quay lại</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 h-11 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  >
                    <ShieldCheck className="size-4" />
                    <span>Gửi yêu cầu xác thực tới Admin</span>
                  </button>
                </div>
              </div>
            )}

            {/* SUBMITTING STATE */}
            {step === "SUBMITTING" && (
              <div className="flex flex-col items-center justify-center py-10 space-y-3">
                <Loader2 className="size-9 text-zinc-900 animate-spin" />
                <p className="font-semibold text-zinc-900 text-sm">
                  Đang tải ảnh và gửi hồ sơ eKYC...
                </p>
                <p className="text-xs text-slate-500 text-center max-w-xs">
                  Vui lòng không đóng cửa sổ trong khi dữ liệu đang được gửi tới Ban quản trị.
                </p>
              </div>
            )}

            {/* SUCCESS STATE */}
            {step === "SUCCESS" && (
              <div className="space-y-4 py-2 text-center">
                <div className="size-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <Clock className="size-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-zinc-900 text-lg">
                    Đã gửi hồ sơ eKYC thành công!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Hồ sơ xác thực của bạn đang ở trạng thái <strong className="font-semibold text-amber-700">Chờ Admin duyệt</strong>. Ban quản trị sẽ tiến hành đối soát và phản hồi sớm nhất.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left space-y-1.5">
                  <p className="font-semibold text-zinc-900">Quyền lợi khi được duyệt:</p>
                  <p>✓ Nhận huy hiệu Tích xanh xác thực trên hồ sơ năng lực.</p>
                  <p>✓ Được ưu tiên xét duyệt đơn ứng tuyển sự kiện từ các Nhà tổ chức.</p>
                  <p>✓ Tăng điểm uy tín lên tối đa 100/100.</p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full h-11 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  Hoàn tất &amp; Đóng
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Hidden reader div for html5-qrcode file scan */}
        <div id="hidden-reader-card" className="hidden" />
      </div>
    </AnimatePresence>
  )
}
