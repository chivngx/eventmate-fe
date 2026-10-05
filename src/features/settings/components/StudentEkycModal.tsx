"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Camera, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { Html5Qrcode } from "html5-qrcode"
import jsQR from "jsqr"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/providers/ToastProvider"

interface StudentEkycModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface ParsedEkycData {
  idCardNumber: string
  oldIdCardNumber: string
  fullName: string
  dob: string
  gender: string
  address: string
  issueDate: string
}

export default function StudentEkycModal({ isOpen, onClose, onSuccess }: StudentEkycModalProps) {
  const { showToast } = useToast()
  
  const [step, setStep] = useState<"SELECT_METHOD" | "SCANNING" | "REVIEW" | "LOADING">("SELECT_METHOD")
  const [method, setMethod] = useState<"CAMERA" | "IMAGE" | null>(null)
  const [parsedData, setParsedData] = useState<ParsedEkycData | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)

  // Cleanup on unmount or when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopScanner()
      setStep("SELECT_METHOD")
      setMethod(null)
      setParsedData(null)
      setErrorMsg(null)
    }
    return () => {
      stopScanner()
    }
  }, [isOpen])

  const stopScanner = () => {
    if (html5QrCodeRef.current) {
      try {
        html5QrCodeRef.current.stop().then(() => {
          html5QrCodeRef.current?.clear()
          html5QrCodeRef.current = null
        }).catch(() => {})
      } catch (e) {}
    }
  }

  const parseQRString = (qrString: string): ParsedEkycData | null => {
    // Format CCCD: Số CCCD|Số CMND cũ|Họ và tên|Ngày sinh(ddmmyyyy)|Giới tính|Nơi thường trú|Ngày cấp(ddmmyyyy)
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

  const handleScanSuccess = (decodedText: string) => {
    stopScanner()
    try {
      const data = parseQRString(decodedText)
      if (!data || !data.idCardNumber || !data.fullName) {
        throw new Error("Mã QR không đúng định dạng CCCD Việt Nam.")
      }
      setParsedData(data)
      setStep("REVIEW")
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi khi giải mã QR.")
      setStep("SELECT_METHOD")
    }
  }

  const startCamera = async () => {
    setMethod("CAMERA")
    setStep("SCANNING")
    setErrorMsg(null)

    setTimeout(() => {
      try {
        html5QrCodeRef.current = new Html5Qrcode("reader")
        html5QrCodeRef.current.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            handleScanSuccess(decodedText)
          },
          (errorMessage) => {
            // ignore continuous scanning errors
          }
        ).catch((err) => {
          setErrorMsg("Không thể truy cập camera: " + err.message)
          setStep("SELECT_METHOD")
        })
      } catch (err: any) {
        setErrorMsg("Lỗi khởi tạo camera: " + err.message)
        setStep("SELECT_METHOD")
      }
    }, 200)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0]
    if (!file) return

    setMethod("IMAGE")
    setStep("SCANNING")
    setErrorMsg(null)

    try {
      let bitmap: ImageBitmap
      try {
        bitmap = await createImageBitmap(file)
      } catch (err: any) {
        // Có thể là HEIC đội lốt JPG
        try {
          const heic2any = (await import("heic2any")).default
          const convertedBlob = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.8,
          })
          const blobArr = Array.isArray(convertedBlob) ? convertedBlob : [convertedBlob]
          file = new File(blobArr, file.name.replace(/\.[^/.]+$/, "") + "_converted.jpg", { type: "image/jpeg" })
          bitmap = await createImageBitmap(file)
        } catch (convertErr: any) {
          throw new Error(`Trình duyệt từ chối đọc file này (Tên: ${file.name}, Kích thước: ${file.size} bytes). Lý do: ${err.message || err}. Vui lòng thử ảnh khác.`)
        }
      }

      let finalDecodedText: string | null = null

      // 1. Thử BarcodeDetector (Native API - Nhanh & Chính xác nhất)
      if ("BarcodeDetector" in window) {
        try {
          const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] })
          const codes = await detector.detect(bitmap)
          if (codes.length > 0) {
            finalDecodedText = codes[0].rawValue
          }
        } catch (e) {
          console.warn("BarcodeDetector fallback", e)
        }
      }

      // 2. Thử Html5Qrcode trên file gốc
      if (!finalDecodedText) {
        try {
          const html5QrCode = new Html5Qrcode("hidden-reader")
          finalDecodedText = await html5QrCode.scanFile(file, false)
        } catch (e) {
          console.warn("Html5Qrcode fallback", e)
        }
      }

      // 3. Chiến lược Multi-pass với jsQR (Cắt cúp & Thu phóng)
      // Cực kỳ hiệu quả cho CCCD vì QR chiếm diện tích rất nhỏ trong ảnh lớn
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

          const scales = [1, 0.5, 0.25, 0.125] // Thu nhỏ dần để giảm nhiễu hạt
          for (const scale of scales) {
            // Quét toàn ảnh
            finalDecodedText = scanRegion(scale, 0, 0, bitmap.width, bitmap.height)
            if (finalDecodedText) break

            // Quét góc 1/4 trên bên phải (CCCD chụp ngang)
            finalDecodedText = scanRegion(scale, bitmap.width / 2, 0, bitmap.width / 2, bitmap.height / 2)
            if (finalDecodedText) break

            // Quét góc 1/4 trên bên trái (CCCD bị lật)
            finalDecodedText = scanRegion(scale, 0, 0, bitmap.width / 2, bitmap.height / 2)
            if (finalDecodedText) break

            // Quét góc 1/4 dưới bên phải
            finalDecodedText = scanRegion(scale, bitmap.width / 2, bitmap.height / 2, bitmap.width / 2, bitmap.height / 2)
            if (finalDecodedText) break

            // Quét góc 1/4 dưới bên trái
            finalDecodedText = scanRegion(scale, 0, bitmap.height / 2, bitmap.width / 2, bitmap.height / 2)
            if (finalDecodedText) break
          }
        }
      }

      if (finalDecodedText) {
        setStep("LOADING")
        await new Promise((resolve) => setTimeout(resolve, 50)) // Chờ giao diện update sang Đang xử lý
        try {
          const parsedTemp = parseQRString(finalDecodedText)
          if (parsedTemp && parsedTemp.idCardNumber) {
            let Tesseract;
            try {
              Tesseract = await import("tesseract.js")
            } catch (e: any) {
              throw new Error("Lỗi tải tesseract.js: " + (e?.message || e))
            }
            
            let worker;
            try {
              worker = await Tesseract.createWorker("eng", 1, {
                workerPath: "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/worker.min.js",
                langPath: "https://tessdata.projectnaptha.com/4.0.0",
                corePath: "https://cdn.jsdelivr.net/npm/tesseract.js-core@5.0.0",
              })
            } catch (e: any) {
              throw new Error("Lỗi khởi tạo worker OCR: " + (e?.message || e))
            }

            let text = "";
            try {
              const result = await worker.recognize(file)
              text = result.data.text
              await worker.terminate()
            } catch (e: any) {
              await worker.terminate().catch(() => {})
              throw new Error("Lỗi khi đọc ảnh (recognize): " + (e?.message || e))
            }
            
            console.log("--- KẾT QUẢ AI ĐỌC ĐƯỢC TỪ ẢNH ---", text)
            
            const cleanOcr = text.replace(/[\s\-\.]/g, "").replace(/[Oo]/g, "0").replace(/[Il]/g, "1")
            
            if (!cleanOcr.includes(parsedTemp.idCardNumber)) {
              console.warn("AI TÌM SỐ NÀY:", parsedTemp.idCardNumber, "TRONG CHUỖI NÀY:", cleanOcr)
              throw new Error(`AI không thể tìm thấy số CCCD (${parsedTemp.idCardNumber}) trên mặt thẻ. Vui lòng chụp rõ nét hơn, không bị bóng lóa và chứa toàn bộ thẻ.`)
            } else {
              console.log("✅ ĐÃ KHỚP! AI đã tìm thấy số CCCD", parsedTemp.idCardNumber, "trên mặt thẻ.")
            }
          }
        } catch (ocrErr: any) {
          console.error("OCR Check Error:", ocrErr)
          const errMsg = ocrErr?.message || (typeof ocrErr === 'string' ? ocrErr : "Lỗi AI đối chiếu ảnh thẻ.")
          throw new Error(errMsg)
        }
        
        handleScanSuccess(finalDecodedText)
      } else {
        throw new Error("Tất cả các phương pháp quét đều thất bại.")
      }
    } catch (err: any) {
      console.error(err)
      const msg = err instanceof Error ? err.message : "Lỗi không xác định."
      setErrorMsg(`Lỗi: ${msg} (Hãy thử chụp cận cảnh phần mã QR và không lóa sáng)`)
      setStep("SELECT_METHOD")
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
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
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
  }

  const handleSubmit = async () => {
    if (!parsedData) return
    setStep("LOADING")
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Bạn chưa đăng nhập.")

      const idHash = await sha256(parsedData.idCardNumber.trim())
      
      const updatePayload = {
        is_verified: true,
        id_card_hash: idHash,
        gender: parsedData.gender,
        birth_year: extractYear(parsedData.dob),
        full_name: parsedData.fullName,
      }

      const { error } = await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("id", user.id)

      if (error) {
        if (error.code === '23505') { // unique violation
          throw new Error("CCCD này đã được sử dụng để xác thực một tài khoản khác.")
        }
        throw error
      }

      showToast({
        title: "Xác thực thành công",
        message: "Hồ sơ của bạn đã được xác thực danh tính.",
        type: "success",
      })
      onSuccess()
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || "Đã xảy ra lỗi khi xác thực.")
      setStep("REVIEW") // back to review so they see the error
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Xác thực Danh tính (eKYC)
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 overflow-y-auto flex-1">
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-red-700 dark:text-red-400 text-sm">
                <AlertCircle className="size-5 shrink-0 mt-0.5" />
                <p>{errorMsg}</p>
              </div>
            )}

            {step === "SELECT_METHOD" && (
              <div className="space-y-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center mb-6">
                  Vui lòng chuẩn bị Thẻ Căn cước công dân gắn chip (hoặc Thẻ Căn cước mới) và chọn phương thức quét mã QR ở mặt trước.
                </p>
                
                <button
                  onClick={startCamera}
                  className="w-full flex items-center p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                >
                  <div className="size-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <Camera className="size-6" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">Dùng Camera</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">Quét trực tiếp qua camera thiết bị</div>
                  </div>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group"
                >
                  <div className="size-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <ImageIcon className="size-6" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">Tải ảnh lên</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">Chọn ảnh mặt trước CCCD có mã QR</div>
                  </div>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            )}

            {step === "SCANNING" && (
              <div className="flex flex-col items-center justify-center py-8">
                {method === "CAMERA" ? (
                  <div className="relative w-full max-w-[280px] aspect-square rounded-2xl overflow-hidden bg-black mb-4">
                    <div id="reader" className="w-full h-full" />
                    <div className="absolute inset-0 border-4 border-blue-500/50 rounded-2xl pointer-events-none" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8">
                    <Loader2 className="size-10 text-blue-500 animate-spin mb-4" />
                    <p className="text-zinc-600 dark:text-zinc-400">Đang phân tích ảnh...</p>
                  </div>
                )}
                {method === "CAMERA" && (
                  <p className="text-sm text-zinc-500 text-center">Đưa mã QR vào khung hình</p>
                )}
              </div>
            )}

            {step === "REVIEW" && parsedData && (
              <div className="space-y-4">
                <div className="flex items-center justify-center mb-6">
                  <div className="size-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="size-8" />
                  </div>
                </div>
                
                <h3 className="font-bold text-center text-zinc-900 dark:text-zinc-100 text-lg mb-4">
                  Đọc mã QR thành công
                </h3>

                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm text-zinc-500">Số CCCD:</span>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 col-span-2">
                      {parsedData.idCardNumber.substring(0, 3)}********{parsedData.idCardNumber.substring(10)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm text-zinc-500">Họ và tên:</span>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 col-span-2 uppercase">
                      {parsedData.fullName}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm text-zinc-500">Giới tính:</span>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 col-span-2">
                      {parsedData.gender}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm text-zinc-500">Ngày sinh:</span>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 col-span-2">
                      {formatDate(parsedData.dob)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm text-zinc-500">Địa chỉ:</span>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 col-span-2 line-clamp-2">
                      {parsedData.address}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-500 text-center mt-4">
                  Chúng tôi không lưu trữ số CCCD chi tiết của bạn mà chỉ lưu mã định danh an toàn để đảm bảo mỗi người dùng là duy nhất.
                </p>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setParsedData(null)
                      setStep("SELECT_METHOD")
                    }}
                    className="flex-1 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Quét lại
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 h-11 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            )}

            {step === "LOADING" && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="size-10 text-blue-500 animate-spin mb-4" />
                <p className="text-zinc-600 dark:text-zinc-400 font-medium">Đang xử lý xác thực...</p>
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Hidden div required by html5-qrcode for file scanning */}
        <div id="hidden-reader" style={{ display: "none" }}></div>
      </div>
    </AnimatePresence>
  )
}
