"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Clock,
  IdCard,
  ScanFace,
  Eye,
  Trash2,
  Shield,
  ArrowRight,
  Cpu,
  Info,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/providers/ToastProvider"
import {
  getHumanInstance,
  detectLiveFace,
  detectCardFace,
} from "@/lib/human-service"
import {
  validateBcaCardTemplate,
  validateBcaBackCardTemplate,
  detectBcaQrCode,
  type BcaFrontValidationResult,
  type BcaBackValidationResult,
} from "@/lib/bca-template-detector"

export interface StudentEkycModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  currentKycStatus?: string | null
  rejectionReason?: string | null
}

export interface VerifiedResult {
  status: "auto_approved" | "pending_admin" | "rejected"
  is_verified: boolean
  cosine_similarity: number
  face_match_score: number
  masked_id_card: string
  full_name: string
  dob: string
  gender?: string
  address?: string
  card_face_thumbnail?: string
  rejection_reason?: string | null
}

type StepType =
  | "GUIDE"
  | "FRONT_CARD"
  | "BACK_CARD"
  | "SELFIE"
  | "REVIEW"
  | "SUBMITTING"
  | "SUCCESS"

export default function StudentEkycModal({
  isOpen,
  onClose,
  onSuccess,
  currentKycStatus,
  rejectionReason,
}: StudentEkycModalProps) {
  const { showToast } = useToast()

  const [step, setStep] = useState<StepType>("GUIDE")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // 1. Ảnh mặt trước CCCD (Raw HD)
  const [frontMethod, setFrontMethod] = useState<"CAMERA" | "UPLOAD">("CAMERA")
  const [isFrontCameraActive, setIsFrontCameraActive] = useState(false)
  const [frontImage, setFrontImage] = useState<string | null>(null)
  const [frontImageFile, setFrontImageFile] = useState<File | null>(null)
  const [clientQrData, setClientQrData] = useState<{
    id_number?: string
    full_name?: string
    dob?: string
    gender?: string
    address?: string
    issue_date?: string
    raw?: string
  } | null>(null)

  // Trạng thái đối chiếu 2 mẫu phôi Căn cước chuẩn Bộ Công An (Mẫu 2021 & Mẫu 2024)
  const [bcaResult, setBcaResult] = useState<BcaFrontValidationResult | null>(null)
  const [isCheckingTemplate, setIsCheckingTemplate] = useState(false)
  const [bcaBackResult, setBcaBackResult] = useState<BcaBackValidationResult | null>(null)
  const [isCheckingBackTemplate, setIsCheckingBackTemplate] = useState(false)
  const [backQrDetected, setBackQrDetected] = useState(false)
  const [showTemplateGuideModal, setShowTemplateGuideModal] = useState(false)
  const [templateGuideTab, setTemplateGuideTab] = useState<"cccd" | "cc">("cc")

  // 2. Ảnh mặt sau CCCD (Raw HD - MRZ)
  const [backMethod, setBackMethod] = useState<"CAMERA" | "UPLOAD">("CAMERA")
  const [isBackCameraActive, setIsBackCameraActive] = useState(false)
  const [backImage, setBackImage] = useState<string | null>(null)
  const [backImageFile, setBackImageFile] = useState<File | null>(null)

  // 3. Ảnh chân dung người thật (Edge Liveness Best Frame)
  const [selfieImage, setSelfieImage] = useState<string | null>(null)
  const [selfieImageFile, setSelfieImageFile] = useState<File | null>(null)
  const [isSelfieCameraActive, setIsSelfieCameraActive] = useState(false)
  const [faceInFrame, setFaceInFrame] = useState(false)
  const [isFacingCenter, setIsFacingCenter] = useState(false)
  const [blinkCount, setBlinkCount] = useState(0)
  const [isLivenessPassed, setIsLivenessPassed] = useState(false)

  // 4. Kết quả trả về thực tế từ Google Colab GPU Server
  const [verifiedResult, setVerifiedResult] = useState<VerifiedResult | null>(null)

  // 5. Pháp lý (Nghị định 13/2023/NĐ-CP)
  const [consentAgreed, setConsentAgreed] = useState(false)
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeletingKyc, setIsDeletingKyc] = useState(false)

  // Refs Camera
  const frontFileInputRef = useRef<HTMLInputElement>(null)
  const frontVideoRef = useRef<HTMLVideoElement>(null)
  const frontStreamRef = useRef<MediaStream | null>(null)

  const backFileInputRef = useRef<HTMLInputElement>(null)
  const backVideoRef = useRef<HTMLVideoElement>(null)
  const backStreamRef = useRef<MediaStream | null>(null)

  const selfieFileInputRef = useRef<HTMLInputElement>(null)
  const selfieVideoRef = useRef<HTMLVideoElement>(null)
  const selfieStreamRef = useRef<MediaStream | null>(null)

  // Liveness internal tracking (Client Edge AI)
  const isAnalyzingRef = useRef(false)
  const wasBlinkingRef = useRef(false)
  const blinkCountRef = useRef(0)
  const autoCapturedRef = useRef(false)
  const bestSelfieSnapshotRef = useRef<{ dataUrl: string; file: File; faceScore: number } | null>(null)

  // Tiền tải mô hình Human WebGL cho Edge Liveness
  useEffect(() => {
    if (isOpen) {
      getHumanInstance().catch(() => {})
    }
  }, [isOpen])

  // Dừng mọi Camera khi đóng Modal hoặc chuyển bước
  const stopAllCameras = useCallback(() => {
    if (frontStreamRef.current) {
      frontStreamRef.current.getTracks().forEach((t) => t.stop())
      frontStreamRef.current = null
    }
    setIsFrontCameraActive(false)

    if (backStreamRef.current) {
      backStreamRef.current.getTracks().forEach((t) => t.stop())
      backStreamRef.current = null
    }
    setIsBackCameraActive(false)

    if (selfieStreamRef.current) {
      selfieStreamRef.current.getTracks().forEach((t) => t.stop())
      selfieStreamRef.current = null
    }
    setIsSelfieCameraActive(false)
  }, [])

  // Reset khi mở/đóng Modal
  useEffect(() => {
    if (!isOpen) {
      stopAllCameras()
      setStep("GUIDE")
      setErrorMsg(null)
      setFrontImage(null)
      setFrontImageFile(null)
      setBackImage(null)
      setBackImageFile(null)
      setSelfieImage(null)
      setSelfieImageFile(null)
      setBlinkCount(0)
      setIsFacingCenter(false)
      setIsLivenessPassed(false)
      setVerifiedResult(null)
      setClientQrData(null)
      setBcaResult(null)
      setIsCheckingTemplate(false)
      setBcaBackResult(null)
      setIsCheckingBackTemplate(false)
      setBackQrDetected(false)
      setShowTemplateGuideModal(false)
      blinkCountRef.current = 0
      wasBlinkingRef.current = false
      autoCapturedRef.current = false
      bestSelfieSnapshotRef.current = null
    }
  }, [isOpen, stopAllCameras])

  // Quản lý dừng Camera theo từng Step
  useEffect(() => {
    if (step !== "FRONT_CARD") {
      if (frontStreamRef.current) {
        frontStreamRef.current.getTracks().forEach((t) => t.stop())
        frontStreamRef.current = null
      }
      setIsFrontCameraActive(false)
    }
    if (step !== "BACK_CARD") {
      if (backStreamRef.current) {
        backStreamRef.current.getTracks().forEach((t) => t.stop())
        backStreamRef.current = null
      }
      setIsBackCameraActive(false)
    }
    if (step !== "SELFIE") {
      if (selfieStreamRef.current) {
        selfieStreamRef.current.getTracks().forEach((t) => t.stop())
        selfieStreamRef.current = null
      }
      setIsSelfieCameraActive(false)
    }
  }, [step])

  // Nén ảnh Canvas chuẩn JPEG (< 500KB) theo mục 1 ekyc.md
  const compressImage = async (file: File, maxDim = 1280, quality = 0.85): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          } else {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
        }
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: "image/jpeg" }))
              } else {
                resolve(file)
              }
            },
            "image/jpeg",
            quality
          )
        } else {
          resolve(file)
        }
      }
      img.onerror = () => resolve(file)
      img.src = URL.createObjectURL(file)
    })
  }

  // Quét QR nền bằng Native BarcodeDetector (Chrome/Edge hỗ trợ 100%)
  const tryDetectQr = async (source: CanvasImageSource | Blob | File) => {
    try {
      if (typeof window !== "undefined" && "BarcodeDetector" in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] })
        let imgSource: any = source
        if (source instanceof Blob || source instanceof File) {
          imgSource = await createImageBitmap(source)
        }
        const barcodes = await detector.detect(imgSource)
        if (barcodes && barcodes.length > 0) {
          const raw = barcodes[0].rawValue || ""
          const parts = raw.split("|")
          if (parts.length >= 6) {
            const parsed = {
              id_number: parts[0]?.trim(),
              cmnd_old: parts[1]?.trim(),
              full_name: parts[2]?.trim(),
              dob: parts[3]?.trim(),
              gender: parts[4]?.trim(),
              address: parts[5]?.trim(),
              issue_date: parts[6]?.trim() || "",
              raw,
            }
            setClientQrData(parsed)
            return parsed
          }
        }
      }
    } catch {
      // Bỏ qua nếu môi trường chưa hỗ trợ BarcodeDetector
    }
    return null
  }

  // --- ĐỐI CHIẾU 2 MẪU PHÔI CĂN CƯỚC CHUẨN BỘ CÔNG AN TRƯỚC KHI GỬI ---
  const validateFrontCardTemplate = async (
    source: HTMLCanvasElement | HTMLImageElement,
    file: File
  ) => {
    setIsCheckingTemplate(true)
    setErrorMsg(null)

    try {
      const result = await validateBcaCardTemplate(source, file)
      setBcaResult(result)

      if (result.qrData) {
        setClientQrData(result.qrData)
      }

      if (!result.isValid) {
        const reason =
          result.primaryReason ||
          "Ảnh không khớp với quy chuẩn 2 mẫu phôi thẻ Căn cước hiện hành của Bộ Công An."
        setErrorMsg(reason)
        return false
      }
      return true
    } catch (err: any) {
      console.warn("Lỗi kiểm tra mẫu thẻ cục bộ:", err)
      return true
    } finally {
      setIsCheckingTemplate(false)
    }
  }

  // --- 1. MẶT TRƯỚC CCCD (Chụp & Ghi nhận) ---
  const startFrontCamera = async () => {
    setErrorMsg(null)
    setIsFrontCameraActive(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      frontStreamRef.current = stream
      if (frontVideoRef.current) {
        frontVideoRef.current.srcObject = stream
        await frontVideoRef.current.play()
      }
    } catch (err: any) {
      setErrorMsg("Không thể mở camera sau: " + err.message)
      setIsFrontCameraActive(false)
    }
  }

  const stopFrontCamera = () => {
    setIsFrontCameraActive(false)
    if (frontStreamRef.current) {
      frontStreamRef.current.getTracks().forEach((track) => track.stop())
      frontStreamRef.current = null
    }
  }

  const captureFrontPhoto = () => {
    if (frontVideoRef.current) {
      const video = frontVideoRef.current
      const canvas = document.createElement("canvas")
      canvas.width = video.videoWidth || 1280
      canvas.height = video.videoHeight || 720
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
        setFrontImage(dataUrl)
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `cccd_front_${Date.now()}.jpg`, { type: "image/jpeg" })
            setFrontImageFile(file)
            validateFrontCardTemplate(canvas, file)
          }
        }, "image/jpeg", 0.9)
        stopFrontCamera()
      }
    }
  }

  const handleFrontFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0]
    if (!file) return
    setErrorMsg(null)
    try {
      try {
        await createImageBitmap(file)
      } catch {
        const heic2any = (await import("heic2any")).default
        const convertedBlob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 })
        const blobArr = Array.isArray(convertedBlob) ? convertedBlob : [convertedBlob]
        file = new File(blobArr, file.name.replace(/\.[^/.]+$/, "") + "_converted.jpg", { type: "image/jpeg" })
      }
      const dataUrl = URL.createObjectURL(file)
      setFrontImage(dataUrl)
      setFrontImageFile(file)

      // Kiểm tra mẫu phôi Bộ Công An trên ảnh tải lên
      const img = new Image()
      img.onload = () => {
        validateFrontCardTemplate(img, file!)
      }
      img.src = dataUrl
      stopFrontCamera()
    } catch {
      setErrorMsg("Không thể đọc tệp ảnh mặt trước. Vui lòng thử lại.")
    } finally {
      if (frontFileInputRef.current) frontFileInputRef.current.value = ""
    }
  }

  // --- 2. MẶT SAU CCCD (Chụp & Ghi nhận) ---
  const startBackCamera = async () => {
    setErrorMsg(null)
    setIsBackCameraActive(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      backStreamRef.current = stream
      if (backVideoRef.current) {
        backVideoRef.current.srcObject = stream
        await backVideoRef.current.play()
      }
    } catch (err: any) {
      setErrorMsg("Không thể mở camera sau: " + err.message)
      setIsBackCameraActive(false)
    }
  }

  const stopBackCamera = () => {
    setIsBackCameraActive(false)
    if (backStreamRef.current) {
      backStreamRef.current.getTracks().forEach((track) => track.stop())
      backStreamRef.current = null
    }
  }

  const validateBackCard = async (
    source: HTMLCanvasElement | HTMLImageElement,
    file: File
  ) => {
    setIsCheckingBackTemplate(true)
    setErrorMsg(null)
    setBackQrDetected(false)

    try {
      // 1. Kiểm tra trùng file hoặc cùng nội dung với mặt trước
      if (frontImageFile && file) {
        if (
          frontImageFile.size === file.size &&
          frontImageFile.name === file.name &&
          file.size > 0
        ) {
          const errReason = "Ảnh mặt sau bị trùng hoàn toàn với ảnh mặt trước. Vui lòng lật thẻ và chụp đúng mặt sau!"
          setBcaBackResult({
            isValid: false,
            hasFaceError: false,
            hasEmblemError: false,
            isDuplicateFront: true,
            qrDetected: false,
            mrzDetected: false,
            reasons: [],
            reason: errReason,
          })
          setErrorMsg(errReason)
          return false
        }
      }

      // 2. Chạy bộ kiểm tra cấu trúc mặt sau chuẩn Bộ Công An
      const res = await validateBcaBackCardTemplate(source, frontImage)
      setBcaBackResult(res)

      if (res.qrData) {
        setClientQrData(res.qrData)
        setBackQrDetected(true)
      }

      if (!res.isValid) {
        const errReason = res.reason || "Ảnh không khớp với cấu trúc mặt sau thẻ Căn cước chuẩn Bộ Công An."
        setErrorMsg(errReason)
        return false
      }
      return true
    } catch (err: any) {
      console.warn("Lỗi đối chiếu mặt sau:", err)
      return true
    } finally {
      setIsCheckingBackTemplate(false)
    }
  }

  const captureBackPhoto = () => {
    if (backVideoRef.current) {
      const video = backVideoRef.current
      const canvas = document.createElement("canvas")
      canvas.width = video.videoWidth || 1280
      canvas.height = video.videoHeight || 720
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
        setBackImage(dataUrl)
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `cccd_back_${Date.now()}.jpg`, { type: "image/jpeg" })
            setBackImageFile(file)
            validateBackCard(canvas, file)
          }
        }, "image/jpeg", 0.9)
        stopBackCamera()
      }
    }
  }

  const handleBackFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0]
    if (!file) return
    setErrorMsg(null)
    try {
      try {
        await createImageBitmap(file)
      } catch {
        const heic2any = (await import("heic2any")).default
        const convertedBlob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 })
        const blobArr = Array.isArray(convertedBlob) ? convertedBlob : [convertedBlob]
        file = new File(blobArr, file.name.replace(/\.[^/.]+$/, "") + "_converted.jpg", { type: "image/jpeg" })
      }
      const dataUrl = URL.createObjectURL(file)
      setBackImage(dataUrl)
      setBackImageFile(file)

      const img = new Image()
      img.onload = () => {
        validateBackCard(img, file!)
      }
      img.src = dataUrl
      stopBackCamera()
    } catch {
      setErrorMsg("Không thể đọc ảnh mặt sau. Vui lòng chọn tệp JPG hoặc PNG.")
    } finally {
      if (backFileInputRef.current) backFileInputRef.current.value = ""
    }
  }

  // --- 3. LIVENESS CHÂN DUNG (Edge Human AI) ---
  const startSelfieCamera = async () => {
    setErrorMsg(null)
    setIsSelfieCameraActive(true)
    setBlinkCount(0)
    setIsLivenessPassed(false)
    blinkCountRef.current = 0
    wasBlinkingRef.current = false
    autoCapturedRef.current = false
    bestSelfieSnapshotRef.current = null

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
      setErrorMsg("Không thể mở camera trước: " + err.message + ". Vui lòng cấp quyền camera.")
      setIsSelfieCameraActive(false)
    }
  }

  const stopSelfieCamera = () => {
    setIsSelfieCameraActive(false)
    if (selfieStreamRef.current) {
      selfieStreamRef.current.getTracks().forEach((track) => track.stop())
      selfieStreamRef.current = null
    }
  }

  const captureSelfiePhoto = useCallback(async () => {
    if (bestSelfieSnapshotRef.current) {
      setSelfieImage(bestSelfieSnapshotRef.current.dataUrl)
      setSelfieImageFile(bestSelfieSnapshotRef.current.file)
    } else if (selfieVideoRef.current) {
      const video = selfieVideoRef.current
      const canvas = document.createElement("canvas")
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 640
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.translate(canvas.width, 0)
        ctx.scale(-1, 1)
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
        setSelfieImage(dataUrl)
        canvas.toBlob((blob) => {
          if (blob) {
            setSelfieImageFile(new File([blob], `selfie_${Date.now()}.jpg`, { type: "image/jpeg" }))
          }
        }, "image/jpeg", 0.9)
      }
    }

    stopSelfieCamera()
    setIsLivenessPassed(true)
    setStep("REVIEW")
  }, [])

  const handleSelfieFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelfieImageFile(file)
    setErrorMsg(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      setSelfieImage(event.target?.result as string)
      stopSelfieCamera()
      setIsLivenessPassed(true)
      setStep("REVIEW")
    }
    reader.readAsDataURL(file)
  }

  // Vòng lặp nhận diện khuôn mặt & Chớp mắt Liveness (Chỉ chạy trên Client để bắt best frame)
  useEffect(() => {
    if (step !== "SELFIE" || !isSelfieCameraActive || selfieImage) return

    let animationFrameId: number
    let isMounted = true

    const runLivenessLoop = async () => {
      if (!isMounted || autoCapturedRef.current) return

      if (
        selfieVideoRef.current &&
        selfieVideoRef.current.readyState >= 2 &&
        !isAnalyzingRef.current
      ) {
        isAnalyzingRef.current = true
        try {
          const liveResult = await detectLiveFace(selfieVideoRef.current)

          if (liveResult.hasFace && isMounted) {
            setFaceInFrame(true)
            setIsFacingCenter(liveResult.isFacingCenter)

            // Lưu snapshot nét nhất khi mở mắt nhìn thẳng
            if (!liveResult.isBlinking && liveResult.faceScore >= 45) {
              if (
                selfieVideoRef.current &&
                (!bestSelfieSnapshotRef.current ||
                  liveResult.faceScore > bestSelfieSnapshotRef.current.faceScore)
              ) {
                const video = selfieVideoRef.current
                const c = document.createElement("canvas")
                c.width = video.videoWidth || 640
                c.height = video.videoHeight || 640
                const ctx = c.getContext("2d")
                if (ctx) {
                  ctx.translate(c.width, 0)
                  ctx.scale(-1, 1)
                  ctx.drawImage(video, 0, 0, c.width, c.height)
                  const snapUrl = c.toDataURL("image/jpeg", 0.9)
                  c.toBlob((blob) => {
                    if (blob) {
                      bestSelfieSnapshotRef.current = {
                        dataUrl: snapUrl,
                        file: new File([blob], `selfie_${Date.now()}.jpg`, { type: "image/jpeg" }),
                        faceScore: liveResult.faceScore,
                      }
                    }
                  }, "image/jpeg", 0.9)
                }
              }
            }

            if (liveResult.isBlinking) {
              wasBlinkingRef.current = true
            } else if (wasBlinkingRef.current) {
              wasBlinkingRef.current = false
              blinkCountRef.current += 1
              setBlinkCount(blinkCountRef.current)

              // Đạt điều kiện: chớp mắt ít nhất 1 lần + nhìn thẳng
              if (
                blinkCountRef.current >= 1 &&
                liveResult.isFacingCenter &&
                !autoCapturedRef.current
              ) {
                autoCapturedRef.current = true
                setIsLivenessPassed(true)
                await captureSelfiePhoto()
                return
              }
            }
          } else if (isMounted) {
            setFaceInFrame(false)
            setIsFacingCenter(false)
          }
        } catch {
        } finally {
          isAnalyzingRef.current = false
        }
      }

      if (isMounted && !selfieImage && !autoCapturedRef.current) {
        animationFrameId = requestAnimationFrame(() => {
          setTimeout(runLivenessLoop, 130)
        })
      }
    }

    const timer = setTimeout(() => {
      runLivenessLoop()
    }, 400)

    return () => {
      isMounted = false
      clearTimeout(timer)
      cancelAnimationFrame(animationFrameId)
    }
  }, [step, isSelfieCameraActive, selfieImage, captureSelfiePhoto])

  // --- 4. GỬI ĐỐI SOÁT QUA GOOGLE COLAB GPU (ArcFace 512-d) ---
  const handleSubmit = async () => {
    if (!frontImage || !selfieImage) {
      setErrorMsg("Vui lòng chụp đủ ảnh mặt trước CCCD và ảnh chân dung.")
      return
    }
    setStep("SUBMITTING")
    setErrorMsg(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")

      // 1. Chuẩn bị file blobs
      let frontBlob: Blob | File | null = frontImageFile
      if (!frontBlob && frontImage) {
        const res = await fetch(frontImage)
        frontBlob = await res.blob()
      }

      let backBlob: Blob | File | null = backImageFile
      if (!backBlob && backImage) {
        const res = await fetch(backImage)
        backBlob = await res.blob()
      }

      let selfieBlob: Blob | File | null = selfieImageFile
      if (!selfieBlob && selfieImage) {
        const res = await fetch(selfieImage)
        selfieBlob = await res.blob()
      }

      if (!frontBlob || !selfieBlob) {
        throw new Error("Thiếu ảnh CCCD mặt trước hoặc ảnh chân dung để đối soát.")
      }

      // 2. Nén ảnh Canvas chuẩn JPEG chất lượng cao (< 500KB)
      let compressedFront: File | Blob = frontBlob
      if (frontBlob instanceof File) {
        compressedFront = await compressImage(frontBlob)
      }

      let compressedBack: File | Blob | null = null
      if (backBlob) {
        compressedBack = backBlob instanceof File ? await compressImage(backBlob) : backBlob
      }

      let compressedSelfie: File | Blob = selfieBlob
      if (selfieBlob instanceof File) {
        compressedSelfie = await compressImage(selfieBlob)
      }

      // 3. Upload tài liệu vào private storage kyc_documents
      const frontPath = `${user.id}/cccd_front_${Date.now()}.jpg`
      const { error: frontUploadErr } = await supabase.storage
        .from("kyc_documents")
        .upload(frontPath, compressedFront, { upsert: true })
      if (frontUploadErr) throw frontUploadErr

      let backPath: string | null = null
      if (compressedBack) {
        backPath = `${user.id}/cccd_back_${Date.now()}.jpg`
        const { error: backUploadErr } = await supabase.storage
          .from("kyc_documents")
          .upload(backPath, compressedBack, { upsert: true })
        if (backUploadErr) throw backUploadErr
      }

      const selfiePath = `${user.id}/selfie_${Date.now()}.jpg`
      const { error: selfieUploadErr } = await supabase.storage
        .from("kyc_documents")
        .upload(selfiePath, compressedSelfie, { upsert: true })
      if (selfieUploadErr) throw selfieUploadErr

      // 4. Chuyển tiếp Multipart FormData lên BFF Gateway /api/ekyc/verify
      const apiFormData = new FormData()
      apiFormData.append("card_front", compressedFront, "front.jpg")
      apiFormData.append("front_image", compressedFront, "front.jpg")
      if (compressedBack) {
        apiFormData.append("card_back", compressedBack, "back.jpg")
        apiFormData.append("back_image", compressedBack, "back.jpg")
      }
      apiFormData.append("selfie", compressedSelfie, "selfie.jpg")
      apiFormData.append("selfie_image", compressedSelfie, "selfie.jpg")
      apiFormData.append("consent_given", "true")
      apiFormData.append("front_url", frontPath)
      if (backPath) apiFormData.append("back_url", backPath)
      apiFormData.append("selfie_url", selfiePath)

      if (clientQrData) {
        apiFormData.append("qr_data", JSON.stringify(clientQrData))
        if (clientQrData.id_number) apiFormData.append("id_card_number", clientQrData.id_number)
        if (clientQrData.full_name) apiFormData.append("full_name", clientQrData.full_name)
        if (clientQrData.dob) apiFormData.append("dob", clientQrData.dob)
        if (clientQrData.gender) apiFormData.append("gender", clientQrData.gender)
        if (clientQrData.address) apiFormData.append("address", clientQrData.address)
      }

      const verifyRes = await fetch("/api/ekyc/verify", {
        method: "POST",
        body: apiFormData,
      })

      const verifyResult = await verifyRes.json()

      if (!verifyRes.ok) {
        throw new Error(verifyResult.error || verifyResult.message || `Lỗi máy chủ (${verifyRes.status})`)
      }

      if (verifyResult.status === "rejected") {
        throw new Error(verifyResult.message || "Hồ sơ xác thực sinh trắc học không trùng khớp.")
      }

      // Ghi nhận kết quả THỰC TẾ từ Colab GPU trả về
      setVerifiedResult({
        status: verifyResult.status,
        is_verified: verifyResult.is_verified,
        cosine_similarity: verifyResult.cosine_similarity,
        face_match_score: verifyResult.face_match_score,
        masked_id_card: verifyResult.masked_id_card,
        full_name: verifyResult.full_name,
        dob: verifyResult.dob,
        gender: verifyResult.gender,
        address: verifyResult.address,
        card_face_thumbnail: verifyResult.card_face_thumbnail,
        rejection_reason: verifyResult.rejection_reason,
      })

      if (verifyResult.status === "auto_approved") {
        showToast({
          title: "Xác thực thành công!",
          message: `Khuôn mặt trùng khớp ${verifyResult.face_match_score}%. Tài khoản đã được cấp Tích xanh!`,
          type: "success",
        })
      } else {
        showToast({
          title: "Đã tiếp nhận hồ sơ",
          message: "Hồ sơ của bạn đã được chuyển đến Ban quản trị đối soát.",
          type: "success",
        })
      }

      if (onSuccess) onSuccess()
      setStep("SUCCESS")
    } catch (err: any) {
      console.error("eKYC Error:", err)
      setErrorMsg(err.message || "Đã xảy ra lỗi khi gửi yêu cầu đối soát tới máy chủ AI GPU.")
      setStep("REVIEW")
    }
  }

  // --- 5. QUYỀN XÓA DỮ LIỆU (ĐIỀU 9 NGHỊ ĐỊNH 13) ---
  const handleDeleteKyc = async () => {
    setIsDeletingKyc(true)
    setErrorMsg(null)
    try {
      const res = await fetch("/api/ekyc/delete", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Không thể xóa dữ liệu.")

      showToast({
        title: "Đã xóa dữ liệu cá nhân",
        message: "Toàn bộ ảnh thẻ và dữ liệu sinh trắc học đã được xóa vĩnh viễn.",
        type: "success",
      })
      setShowDeleteConfirm(false)
      if (onSuccess) onSuccess()
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi khi xóa dữ liệu.")
    } finally {
      setIsDeletingKyc(false)
    }
  }

  const formatDate = (ddmmyyyy: string) => {
    if (!ddmmyyyy || ddmmyyyy.length !== 8) return ddmmyyyy
    return `${ddmmyyyy.substring(0, 2)}/${ddmmyyyy.substring(2, 4)}/${ddmmyyyy.substring(4, 8)}`
  }

  if (!isOpen) return null

  // Tiến trình 5 bước hiển thị
  const stepIndex =
    step === "GUIDE" ? 0 :
    step === "FRONT_CARD" ? 1 :
    step === "BACK_CARD" ? 2 :
    step === "SELFIE" ? 3 : 4

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4">
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
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-white shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold shadow-xs">
                  <ScanFace className="size-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-zinc-900">
                    Xác thực danh tính (eKYC)
                  </h2>
                  <p className="text-[11.5px] text-slate-500">
                    InsightFace GPU Engine &amp; Đối soát CCCD
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={step === "SUBMITTING"}
                className="size-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="size-4.5" />
              </button>
            </div>

            {/* Stepper Bar 5 giai đoạn */}
            {step !== "SUCCESS" && step !== "SUBMITTING" && (
              <div className="mt-3.5 flex items-center gap-1.5">
                {[
                  { label: "Bắt đầu" },
                  { label: "Mặt trước" },
                  { label: "Mặt sau" },
                  { label: "Khuôn mặt" },
                  { label: "Gửi đối soát" },
                ].map((s, idx) => (
                  <div key={s.label} className="flex-1">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx < stepIndex
                          ? "bg-emerald-500"
                          : idx === stepIndex
                          ? "bg-zinc-900"
                          : "bg-slate-100"
                      }`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
            {/* Lỗi cảnh báo nếu có */}
            {errorMsg &&
              (!bcaResult || bcaResult.isValid !== false) &&
              (!bcaBackResult || bcaBackResult.isValid !== false) && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-600" />
                  <p className="flex-1 leading-relaxed">{errorMsg}</p>
                </div>
              )}

            {/* Hồ sơ bị từ chối trước đó */}
            {currentKycStatus === "rejected" && step === "GUIDE" && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertCircle className="size-3.5 text-amber-600" />
                  Hồ sơ trước đó chưa được duyệt:
                </p>
                <p className="text-amber-700 italic pl-5">
                  &ldquo;{rejectionReason || "Hình ảnh không rõ ràng hoặc thông tin chưa khớp."}&rdquo;
                </p>
              </div>
            )}

            {/* BƯỚC 1: HƯỚNG DẪN & ĐỒNG THUẬN (NĐ 13/2023/NĐ-CP) */}
            {step === "GUIDE" && (
              <div className="space-y-4">
                {currentKycStatus === "verified" && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-900 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="size-4 text-emerald-600" />
                        Tài khoản hiện đã được cấp Tích xanh
                      </p>
                    </div>
                    <p className="text-[11.5px] text-emerald-700 leading-relaxed">
                      Thông tin căn cước của bạn đã được đối soát hợp lệ. Bạn có thể quét lại để cập nhật thẻ mới bất cứ lúc nào.
                    </p>
                  </div>
                )}

                {/* 3 bước quy trình chuẩn ekyc.md */}
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Quy trình thu thập tài liệu:
                  </p>

                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center shrink-0">
                        <IdCard className="size-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-zinc-900">1. Chụp mặt trước CCCD</p>
                        <p className="text-[11.5px] text-slate-500">Chụp rõ nét mặt trước thẻ chứa ảnh chân dung</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center shrink-0">
                        <RotateCcw className="size-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-zinc-900">2. Chụp mặt sau CCCD</p>
                        <p className="text-[11.5px] text-slate-500">Chụp dải mã máy đọc MRZ phục vụ chống gian lận phôi</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center shrink-0">
                        <ScanFace className="size-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-zinc-900">3. Xác thực khuôn mặt (Liveness)</p>
                        <p className="text-[11.5px] text-slate-500">Kiểm tra cử chỉ chớp mắt trước camera để bắt khung hình thật</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Checkbox Đồng thuận rõ ràng */}
                <div className="pt-1 border-t border-slate-100 space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={consentAgreed}
                      onChange={(e) => setConsentAgreed(e.target.checked)}
                      className="mt-0.5 size-4 rounded border-slate-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 leading-relaxed">
                      Tôi đồng ý với{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setShowConsentModal(true)
                        }}
                        className="text-zinc-900 font-semibold underline underline-offset-2 hover:text-emerald-700"
                      >
                        Quy chế xử lý dữ liệu sinh trắc học
                      </button>{" "}
                      (theo Nghị định 13/2023/NĐ-CP).
                    </span>
                  </label>
                </div>

                {/* CTA Bắt đầu */}
                <button
                  type="button"
                  disabled={!consentAgreed}
                  onClick={() => {
                    setErrorMsg(null)
                    setStep("FRONT_CARD")
                    setFrontMethod("CAMERA")
                    startFrontCamera()
                  }}
                  className={`w-full h-11 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xs ${
                    consentAgreed
                      ? "bg-zinc-900 hover:bg-black text-white cursor-pointer"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <span>Bắt đầu chụp tài liệu</span>
                  <ArrowRight className="size-4" />
                </button>

                {currentKycStatus === "verified" && (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-[11.5px] text-red-600 hover:text-red-700 font-medium inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="size-3" />
                      <span>Yêu cầu xóa dữ liệu căn cước của tôi</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* BƯỚC 2: CHỤP ẢNH MẶT TRƯỚC CCCD */}
            {step === "FRONT_CARD" && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Mặt trước thẻ Căn cước</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTemplateGuideTab("cc")
                      setShowTemplateGuideModal(true)
                    }}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/60 px-2 py-1 rounded-lg inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Info className="size-3 text-emerald-600" />
                    <span>Xem 2 mẫu thẻ chuẩn BCA</span>
                  </button>
                </div>

                {!frontImage ? (
                  <>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setFrontMethod("CAMERA")
                          startFrontCamera()
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          frontMethod === "CAMERA"
                            ? "bg-white text-zinc-900 shadow-xs"
                            : "text-slate-600 hover:text-zinc-900"
                        }`}
                      >
                        <Camera className="size-3.5" />
                        <span>Chụp Camera</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          stopFrontCamera()
                          setFrontMethod("UPLOAD")
                          frontFileInputRef.current?.click()
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          frontMethod === "UPLOAD"
                            ? "bg-white text-zinc-900 shadow-xs"
                            : "text-slate-600 hover:text-zinc-900"
                        }`}
                      >
                        <ImageIcon className="size-3.5" />
                        <span>Tải ảnh từ máy</span>
                      </button>
                    </div>

                    {frontMethod === "CAMERA" ? (
                      <div className="relative w-full aspect-[85.6/54] rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-lg flex items-center justify-center">
                        <video
                          ref={frontVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="size-full object-cover"
                        />

                        {/* 4 góc định vị reticle brackets */}
                        <div className="absolute inset-3 pointer-events-none">
                          <div className="absolute top-0 left-0 size-5 border-t-2 border-l-2 border-emerald-400 rounded-tl-md" />
                          <div className="absolute top-0 right-0 size-5 border-t-2 border-r-2 border-emerald-400 rounded-tr-md" />
                          <div className="absolute bottom-0 left-0 size-5 border-b-2 border-l-2 border-emerald-400 rounded-bl-md" />
                          <div className="absolute bottom-0 right-0 size-5 border-b-2 border-r-2 border-emerald-400 rounded-br-md" />
                        </div>

                        {/* Tia quét laser */}
                        <motion.div
                          animate={{ y: ["-120%", "180%"] }}
                          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_10px_rgba(52,211,153,0.8)] pointer-events-none"
                        />

                        {/* Nút chụp Shutter Button */}
                        <button
                          type="button"
                          onClick={captureFrontPhoto}
                          className="absolute bottom-2.5 left-1/2 -translate-x-1/2 size-10 rounded-full bg-white border-2 border-zinc-900 flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                        >
                          <div className="size-7 rounded-full bg-zinc-900" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => frontFileInputRef.current?.click()}
                        className="w-full aspect-[85.6/54] rounded-2xl border-2 border-dashed border-slate-300 hover:border-zinc-900 bg-slate-50 hover:bg-slate-100/60 transition-all flex flex-col items-center justify-center text-center p-4 cursor-pointer group"
                      >
                        <div className="size-11 rounded-full bg-white group-hover:bg-zinc-900 group-hover:text-white text-zinc-900 flex items-center justify-center shadow-xs transition-colors mb-2">
                          <ImageIcon className="size-5" />
                        </div>
                        <p className="text-xs font-semibold text-zinc-900">
                          Bấm để chọn ảnh mặt trước CCCD
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Hỗ trợ định dạng JPG, PNG, HEIC sắc nét
                        </p>
                      </div>
                    )}

                    <input
                      type="file"
                      ref={frontFileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleFrontFileUpload}
                    />

                    <p className="text-[11.5px] text-slate-500 text-center">
                      Căn chỉnh mặt trước thẻ nằm trọn vẹn trong khung hình, không bị chói lóa sáng.
                    </p>
                  </>
                ) : (
                  <div className="space-y-3.5">
                    {/* BẢNG ĐỐI CHIẾU 2 MẪU PHÔI CĂN CƯỚC BỘ CÔNG AN */}
                    {isCheckingTemplate ? (
                      <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2.5">
                        <Loader2 className="size-4 text-blue-600 animate-spin shrink-0" />
                        <span className="font-medium">Đang đối chiếu ảnh với 2 mẫu phôi thẻ Căn cước chuẩn Bộ Công An...</span>
                      </div>
                    ) : bcaResult?.isValid === true ? (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1.5">
                        <div className="flex items-center justify-between font-semibold">
                          <div className="flex items-center gap-1.5 text-emerald-800">
                            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                            <span>{bcaResult.cardTypeName}</span>
                          </div>
                          <span className="text-[10px] bg-emerald-200/90 text-emerald-900 px-2 py-0.5 rounded-md font-bold shrink-0">
                            HỢP LỆ {bcaResult.confidenceScore}% ✓
                          </span>
                        </div>
                        <div className="space-y-0.5 text-[11px] text-emerald-700">
                          {bcaResult.reasons.map((r, i) => (
                            <p key={i} className="flex items-start gap-1">
                              <span className="text-emerald-500 font-bold shrink-0">✓</span>
                              <span>{r}</span>
                            </p>
                          ))}
                        </div>
                      </div>
                    ) : bcaResult?.isValid === false ? (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1.5">
                        <div className="flex items-center justify-between font-semibold">
                          <div className="flex items-center gap-1.5 text-rose-800">
                            <AlertCircle className="size-4 text-rose-600 shrink-0" />
                            <span>Không khớp mẫu phôi thẻ Bộ Công An</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setTemplateGuideTab("cc")
                              setShowTemplateGuideModal(true)
                            }}
                            className="text-[10.5px] bg-rose-100 hover:bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded-md font-bold underline cursor-pointer"
                          >
                            Xem mẫu chuẩn
                          </button>
                        </div>
                        <p className="text-[11px] text-rose-700 leading-relaxed">
                          {bcaResult.primaryReason || "Vui lòng chụp rõ mặt trước thẻ Căn cước có ảnh chân dung và hoa văn chuẩn."}
                        </p>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <CheckCircle2 className="size-4 text-emerald-600" />
                          <span>Ảnh mặt trước đã sẵn sàng</span>
                        </div>
                        <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-medium">
                          Đã chụp ✓
                        </span>
                      </div>
                    )}

                    <div className="relative w-full aspect-[85.6/54] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={frontImage}
                        alt="Mặt trước CCCD"
                        className="size-full object-cover"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFrontImage(null)
                          setFrontImageFile(null)
                          setBcaResult(null)
                          setIsCheckingTemplate(false)
                          startFrontCamera()
                        }}
                        className="h-10 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <RotateCcw className="size-3.5" />
                        <span>Chụp lại</span>
                      </button>
                      <button
                        type="button"
                        disabled={isCheckingTemplate || bcaResult?.isValid === false}
                        onClick={() => {
                          setErrorMsg(null)
                          setStep("BACK_CARD")
                          setBackMethod("CAMERA")
                          startBackCamera()
                        }}
                        className={`flex-1 h-10 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs ${
                          isCheckingTemplate || bcaResult?.isValid === false
                            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                            : "bg-zinc-900 hover:bg-black text-white cursor-pointer"
                        }`}
                      >
                        <span>Tiếp: Chụp mặt sau</span>
                        <ChevronRight className="size-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* BƯỚC 3: CHỤP ẢNH MẶT SAU CCCD (DÒNG MRZ) */}
            {step === "BACK_CARD" && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Mặt sau thẻ Căn cước</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTemplateGuideTab("cc")
                      setShowTemplateGuideModal(true)
                    }}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/60 px-2 py-1 rounded-lg inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Info className="size-3 text-emerald-600" />
                    <span>Xem 2 mẫu thẻ chuẩn BCA</span>
                  </button>
                </div>

                {!backImage ? (
                  <>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setBackMethod("CAMERA")
                          startBackCamera()
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          backMethod === "CAMERA"
                            ? "bg-white text-zinc-900 shadow-xs"
                            : "text-slate-600 hover:text-zinc-900"
                        }`}
                      >
                        <Camera className="size-3.5" />
                        <span>Chụp Camera</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          stopBackCamera()
                          setBackMethod("UPLOAD")
                          backFileInputRef.current?.click()
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          backMethod === "UPLOAD"
                            ? "bg-white text-zinc-900 shadow-xs"
                            : "text-slate-600 hover:text-zinc-900"
                        }`}
                      >
                        <ImageIcon className="size-3.5" />
                        <span>Tải ảnh từ máy</span>
                      </button>
                    </div>

                    {backMethod === "CAMERA" ? (
                      <div className="relative w-full aspect-[85.6/54] rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-lg flex items-center justify-center">
                        <video
                          ref={backVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="size-full object-cover"
                        />

                        {/* 4 góc định vị reticle brackets */}
                        <div className="absolute inset-3 pointer-events-none">
                          <div className="absolute top-0 left-0 size-5 border-t-2 border-l-2 border-emerald-400 rounded-tl-md" />
                          <div className="absolute top-0 right-0 size-5 border-t-2 border-r-2 border-emerald-400 rounded-tr-md" />
                          <div className="absolute bottom-0 left-0 size-5 border-b-2 border-l-2 border-emerald-400 rounded-bl-md" />
                          <div className="absolute bottom-0 right-0 size-5 border-b-2 border-r-2 border-emerald-400 rounded-br-md" />
                        </div>

                        {/* Vùng hướng dẫn dải ký tự MRZ */}
                        <div className="absolute bottom-11 left-4 right-4 h-5 border border-dashed border-emerald-400/60 rounded-md flex items-center justify-center pointer-events-none">
                          <span className="text-[10px] text-emerald-300 font-mono tracking-wider">
                            &lt;&lt; Vùng chứa dòng mã MRZ &lt;&lt;
                          </span>
                        </div>

                        {/* Nút chụp Shutter Button */}
                        <button
                          type="button"
                          onClick={captureBackPhoto}
                          className="absolute bottom-2.5 left-1/2 -translate-x-1/2 size-10 rounded-full bg-white border-2 border-zinc-900 flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                        >
                          <div className="size-7 rounded-full bg-zinc-900" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => backFileInputRef.current?.click()}
                        className="w-full aspect-[85.6/54] rounded-2xl border-2 border-dashed border-slate-300 hover:border-zinc-900 bg-slate-50 hover:bg-slate-100/60 transition-all flex flex-col items-center justify-center text-center p-4 cursor-pointer group"
                      >
                        <div className="size-11 rounded-full bg-white group-hover:bg-zinc-900 group-hover:text-white text-zinc-900 flex items-center justify-center shadow-xs transition-colors mb-2">
                          <ImageIcon className="size-5" />
                        </div>
                        <p className="text-xs font-semibold text-zinc-900">
                          Bấm để tải ảnh mặt sau CCCD
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Chụp rõ nét phần dải mã ký tự máy đọc (MRZ)
                        </p>
                      </div>
                    )}

                    <input
                      type="file"
                      ref={backFileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleBackFileUpload}
                    />

                    <p className="text-[11.5px] text-slate-500 text-center">
                      Mặt sau chứa dải mã MRZ phục vụ đối soát 3 chiều (Tam giác vàng).
                    </p>
                  </>
                ) : (
                  <div className="space-y-3.5">
                    {/* BẢNG ĐỐI CHIẾU MẶT SAU THẺ CĂN CƯỚC CHUẨN BỘ CÔNG AN */}
                    {isCheckingBackTemplate ? (
                      <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2.5">
                        <Loader2 className="size-4 text-blue-600 animate-spin shrink-0" />
                        <span className="font-medium">Đang đối chiếu cấu trúc mặt sau chuẩn Bộ Công An...</span>
                      </div>
                    ) : bcaBackResult?.isValid === false ? (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1.5">
                        <div className="flex items-center justify-between font-semibold">
                          <div className="flex items-center gap-1.5 text-rose-800">
                            <AlertCircle className="size-4 text-rose-600 shrink-0" />
                            <span>Ảnh mặt sau không hợp lệ!</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setTemplateGuideTab("cc")
                              setShowTemplateGuideModal(true)
                            }}
                            className="text-[10.5px] bg-rose-100 hover:bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded-md font-bold underline cursor-pointer"
                          >
                            Xem mẫu chuẩn
                          </button>
                        </div>
                        <p className="text-[11px] text-rose-700 leading-relaxed">
                          {bcaBackResult.reason || "Vui lòng chụp đúng mặt sau thẻ Căn cước công dân."}
                        </p>
                      </div>
                    ) : bcaBackResult?.isValid === true ? (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1.5">
                        <div className="flex items-center justify-between font-semibold">
                          <div className="flex items-center gap-1.5 text-emerald-800">
                            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                            <span>{bcaBackResult.cardTypeName || "Mặt sau Thẻ Căn cước hợp lệ"}</span>
                          </div>
                          <span className="text-[10px] bg-emerald-200/90 text-emerald-900 px-2 py-0.5 rounded-md font-bold shrink-0">
                            HỢP LỆ BCA ✓
                          </span>
                        </div>
                        {bcaBackResult.reasons && bcaBackResult.reasons.length > 0 && (
                          <div className="space-y-0.5 text-[11px] text-emerald-700">
                            {bcaBackResult.reasons.map((r, i) => (
                              <p key={i} className="flex items-start gap-1">
                                <span className="text-emerald-500 font-bold shrink-0">✓</span>
                                <span>{r}</span>
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <CheckCircle2 className="size-4 text-emerald-600" />
                          <span>Ảnh mặt sau đã sẵn sàng</span>
                        </div>
                        <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-medium">
                          Đã chụp ✓
                        </span>
                      </div>
                    )}

                    <div className="relative w-full aspect-[85.6/54] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={backImage}
                        alt="Mặt sau CCCD"
                        className="size-full object-cover"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setBackImage(null)
                          setBackImageFile(null)
                          setBcaBackResult(null)
                          setIsCheckingBackTemplate(false)
                          setErrorMsg(null)
                          startBackCamera()
                        }}
                        className="h-10 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <RotateCcw className="size-3.5" />
                        <span>Chụp lại</span>
                      </button>
                      <button
                        type="button"
                        disabled={isCheckingBackTemplate || bcaBackResult?.isValid === false || !backImage}
                        onClick={() => {
                          if (isCheckingBackTemplate || bcaBackResult?.isValid === false || !backImage) return
                          setErrorMsg(null)
                          setStep("SELFIE")
                          startSelfieCamera()
                        }}
                        className={`flex-1 h-10 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs ${
                          isCheckingBackTemplate || bcaBackResult?.isValid === false || !backImage
                            ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                            : "bg-zinc-900 hover:bg-black text-white cursor-pointer"
                        }`}
                      >
                        <span>Tiếp: Xác thực khuôn mặt</span>
                        <ChevronRight className="size-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* BƯỚC 4: ACTIVE LIVENESS CHÂN DUNG (EDGE CLIENT) */}
            {step === "SELFIE" && (
              <div className="space-y-3.5">
                {!selfieImage ? (
                  isSelfieCameraActive ? (
                    <div className="space-y-3">
                      {/* Khung tròn Biometric Liveness */}
                      <div className="relative size-56 sm:size-60 mx-auto rounded-full overflow-hidden bg-black border-3 border-zinc-900 shadow-xl flex items-center justify-center">
                        <video
                          ref={selfieVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="size-full object-cover scale-x-[-1]"
                        />

                        {/* Vòng viền đổi màu khi nhận diện được mặt */}
                        <div
                          className={`absolute inset-0 rounded-full border-3 transition-colors duration-300 pointer-events-none ${
                            faceInFrame
                              ? "border-emerald-500 shadow-[inset_0_0_24px_rgba(16,185,129,0.3)]"
                              : "border-white/30 border-dashed"
                          }`}
                        />

                        {/* Dynamic Status HUD Pill */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] text-white flex items-center gap-1.5 whitespace-nowrap border border-white/10 shadow-md">
                          {isLivenessPassed ? (
                            <>
                              <CheckCircle2 className="size-3.5 text-emerald-400" />
                              <span className="text-emerald-300 font-semibold">Đã bắt khung hình nét nhất</span>
                            </>
                          ) : faceInFrame ? (
                            !isFacingCenter ? (
                              <>
                                <ScanFace className="size-3.5 text-amber-400" />
                                <span>Nhìn thẳng vào giữa camera</span>
                              </>
                            ) : (
                              <>
                                <Eye className="size-3.5 text-emerald-400 animate-pulse" />
                                <span>Chớp mắt nhẹ một lần</span>
                              </>
                            )
                          ) : (
                            <>
                              <ScanFace className="size-3.5 text-slate-300" />
                              <span>Đưa mặt vào khung tròn</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Nút chụp dự phòng */}
                      <div className="flex justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => captureSelfiePhoto()}
                          className="h-9 px-4 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <Camera className="size-3.5" />
                          <span>Chụp ngay</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => selfieFileInputRef.current?.click()}
                          className="h-9 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <ImageIcon className="size-3.5" />
                          <span>Tải ảnh</span>
                        </button>
                      </div>

                      <input
                        type="file"
                        ref={selfieFileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleSelfieFileUpload}
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-center py-4 space-y-1">
                        <p className="font-semibold text-sm text-zinc-900">
                          Chụp ảnh chân dung
                        </p>
                        <p className="text-xs text-slate-500">
                          Mở camera trước để AI kiểm tra người thật và bắt ảnh sắc nét.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={startSelfieCamera}
                          className="p-4 rounded-xl border border-slate-200 hover:border-zinc-900 bg-slate-50 hover:bg-slate-100/60 transition-all flex flex-col items-center text-center gap-1.5 cursor-pointer"
                        >
                          <Camera className="size-5 text-zinc-900" />
                          <span className="text-xs font-semibold text-zinc-900">Mở Camera</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => selfieFileInputRef.current?.click()}
                          className="p-4 rounded-xl border border-slate-200 hover:border-zinc-900 bg-slate-50 hover:bg-slate-100/60 transition-all flex flex-col items-center text-center gap-1.5 cursor-pointer"
                        >
                          <ImageIcon className="size-5 text-zinc-900" />
                          <span className="text-xs font-semibold text-zinc-900">Tải ảnh chân dung</span>
                        </button>
                      </div>

                      <input
                        type="file"
                        ref={selfieFileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleSelfieFileUpload}
                      />
                    </div>
                  )
                ) : (
                  <div className="space-y-3.5">
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <CheckCircle2 className="size-4 text-emerald-600" />
                        <span>Ảnh chân dung đã sẵn sàng</span>
                      </div>
                      <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-medium">
                        Liveness Passed ✓
                      </span>
                    </div>

                    <div className="size-36 mx-auto rounded-full overflow-hidden border-2 border-emerald-500 shadow-md bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selfieImage}
                        alt="Ảnh selfie"
                        className="size-full object-cover"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelfieImage(null)
                          setSelfieImageFile(null)
                          startSelfieCamera()
                        }}
                        className="h-10 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
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
                        <span>Tiếp: Xem lại 3 ảnh</span>
                        <ChevronRight className="size-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* BƯỚC 5: XEM LẠI 3 ẢNH & GỬI CHO AI GPU (CHƯA CÓ KẾT QUẢ ĐỐI SOÁT) */}
            {step === "REVIEW" && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-900">
                    <span className="flex items-center gap-1.5">
                      <Cpu className="size-4 text-emerald-600" />
                      Hồ sơ chuẩn bị gửi sang Colab GPU Server
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">InsightFace 512-d</span>
                  </div>

                  {/* 3 Ảnh thu nhỏ đã chụp */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1 text-center">
                      <span className="text-[10.5px] font-medium text-slate-500">Mặt trước</span>
                      <div className="w-full aspect-[85.6/54] rounded-lg overflow-hidden border border-slate-200 bg-white shadow-2xs">
                        {frontImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={frontImage} alt="Mặt trước" className="size-full object-cover" />
                        ) : (
                          <div className="size-full flex items-center justify-center text-[10px] text-slate-400">Trống</div>
                        )}
                      </div>
                      <span className="text-[10px] text-emerald-600 font-semibold block">Đã chụp ✓</span>
                    </div>

                    <div className="space-y-1 text-center">
                      <span className="text-[10.5px] font-medium text-slate-500">Mặt sau (MRZ)</span>
                      <div className="w-full aspect-[85.6/54] rounded-lg overflow-hidden border border-slate-200 bg-white shadow-2xs">
                        {backImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={backImage} alt="Mặt sau" className="size-full object-cover" />
                        ) : (
                          <div className="size-full flex items-center justify-center text-[10px] text-slate-400">Trống</div>
                        )}
                      </div>
                      <span className="text-[10px] text-emerald-600 font-semibold block">Đã chụp ✓</span>
                    </div>

                    <div className="space-y-1 text-center">
                      <span className="text-[10.5px] font-medium text-slate-500">Chân dung Live</span>
                      <div className="w-full aspect-[85.6/54] rounded-lg overflow-hidden border border-slate-200 bg-white shadow-2xs">
                        {selfieImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={selfieImage} alt="Chân dung" className="size-full object-cover" />
                        ) : (
                          <div className="size-full flex items-center justify-center text-[10px] text-slate-400">Trống</div>
                        )}
                      </div>
                      <span className="text-[10px] text-emerald-600 font-semibold block">Liveness ✓</span>
                    </div>
                  </div>
                </div>

                {/* Thông báo tiến trình đối soát */}
                <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 space-y-1.5 leading-relaxed">
                  <p className="font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="size-4 text-blue-600" />
                    Sẵn sàng phân tích AI trên Google Colab GPU:
                  </p>
                  <p className="text-[11.5px] text-blue-800">
                    Dữ liệu 3 ảnh sẽ được chuyển tiếp qua Gateway tới máy chủ Colab GPU để thực hiện: nắn phẳng thẻ, giải mã QR gốc, đọc OCR &amp; MRZ (Tam giác vàng), và trích xuất vector ArcFace 512 chiều.
                  </p>
                </div>

                {/* Nút hành động */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep("SELFIE")}
                    className="h-11 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Chụp lại
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 h-11 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Cpu className="size-4 text-emerald-400" />
                    <span>Gửi đối soát qua Colab AI GPU</span>
                  </button>
                </div>
              </div>
            )}

            {/* BƯỚC 6: ĐANG CHUYỂN TIẾP & XỬ LÝ TRÊN COLAB GPU */}
            {step === "SUBMITTING" && (
              <div className="flex flex-col items-center justify-center py-10 space-y-3.5 text-center">
                <Loader2 className="size-10 text-zinc-900 animate-spin" />
                <div className="space-y-1">
                  <p className="font-bold text-zinc-900 text-sm">
                    Đang gửi dữ liệu tới Google Colab GPU Server...
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                    InsightFace GPU đang thực hiện giải mã QR, đối soát Tam giác vàng và so khớp sinh trắc học ArcFace 512 chiều. Vui lòng chờ...
                  </p>
                </div>
              </div>
            )}

            {/* BƯỚC 7: KẾT QUẢ THỰC TẾ DO COLAB GPU TRẢ VỀ */}
            {step === "SUCCESS" && verifiedResult && (() => {
              const displayScore = verifiedResult.face_match_score > 0
                ? verifiedResult.face_match_score
                : (verifiedResult.cosine_similarity > 0.2
                    ? (verifiedResult.cosine_similarity < 0.35
                        ? Math.max(0, Math.round((verifiedResult.cosine_similarity / 0.35) * 40))
                        : verifiedResult.cosine_similarity < 0.50
                        ? Math.round(41 + ((verifiedResult.cosine_similarity - 0.35) / 0.15) * 28)
                        : verifiedResult.cosine_similarity < 0.65
                        ? Math.round(70 + ((verifiedResult.cosine_similarity - 0.50) / 0.15) * 18)
                        : Math.min(100, Math.round(88 + ((verifiedResult.cosine_similarity - 0.65) / 0.20) * 12)))
                    : 0)

              return (
                <div className="space-y-4 py-1">
                  {/* 2 Ảnh đối chiếu THỰC TẾ: Ảnh thẻ do Colab cắt & Ảnh selfie */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                      <span>Ảnh thẻ (AI GPU cắt)</span>
                      <span className="text-emerald-700 flex items-center gap-1 font-bold">
                        <Shield className="size-3 text-emerald-600" />
                        Độ khớp: {displayScore}%
                      </span>
                      <span>Ảnh chân dung Live</span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="w-[110px] aspect-[85.6/54] rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={verifiedResult.card_face_thumbnail || frontImage || ""}
                          alt="Ảnh thẻ do Colab cắt"
                          className="size-full object-cover"
                        />
                      </div>

                      <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="size-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                          <Sparkles className="size-4 text-emerald-600" />
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono mt-1">
                          Cos: {verifiedResult.cosine_similarity.toFixed(2)}
                        </span>
                      </div>

                      <div className="w-[110px] aspect-[85.6/54] rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selfieImage || ""}
                          alt="Ảnh selfie"
                          className="size-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Thông tin do Colab GPU giải mã từ QR & OCR */}
                  <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="text-slate-500">Số định danh:</span>
                      <span className="font-bold text-zinc-900 font-mono text-sm">
                        {verifiedResult.masked_id_card || "(Chưa quét được mã QR)"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Họ và tên:</span>
                      <span className="font-bold text-zinc-900 uppercase">
                        {verifiedResult.full_name || "(Chưa có thông tin)"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Ngày sinh:</span>
                      <span className="font-medium text-zinc-800">
                        {formatDate(verifiedResult.dob) || "(Chưa có thông tin)"}
                      </span>
                    </div>
                    {verifiedResult.gender && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Giới tính:</span>
                        <span className="font-medium text-zinc-800">
                          {verifiedResult.gender}
                        </span>
                      </div>
                    )}
                    {verifiedResult.address && (
                      <div className="flex justify-between items-start pt-1 border-t border-slate-100">
                        <span className="text-slate-500 shrink-0 mr-2">Thường trú:</span>
                        <span className="font-medium text-zinc-800 text-right leading-relaxed">
                          {verifiedResult.address}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Trạng thái duyệt */}
                  <div className="text-center space-y-1">
                    <h3 className="font-bold text-zinc-900 text-base">
                      {verifiedResult.status === "auto_approved"
                        ? "Kích hoạt Tích xanh thành công!"
                        : "Đã tiếp nhận hồ sơ eKYC"}
                    </h3>
                    <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                      {verifiedResult.status === "auto_approved" ? (
                        <>
                          Khuôn mặt trùng khớp{" "}
                          <strong className="text-emerald-700 font-semibold">{displayScore}%</strong> (Cosine &ge; 0.50). Tài khoản đã được cấp Tích xanh!
                        </>
                      ) : (
                        <span>
                          {verifiedResult.rejection_reason ||
                            `Độ tương đồng khuôn mặt ${displayScore}%. Hồ sơ đang ở trạng thái Chờ Admin đối soát.`}
                        </span>
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full h-11 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    Hoàn tất &amp; Đóng
                  </button>
                </div>
              )
            })()}
          </div>
        </motion.div>

        {/* Modal chi tiết Quy chế bảo vệ dữ liệu cá nhân */}
        {showConsentModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60">
            <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl space-y-3.5 border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm">
                  <ShieldCheck className="size-4.5 text-emerald-600" />
                  <span>Quy chế Bảo vệ Dữ liệu Cá nhân</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConsentModal(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                <p>
                  <strong>1. Mục đích:</strong> Dữ liệu chỉ dùng để xác minh danh tính người nhận ca sự kiện trên EventMate, phòng ngừa gian lận.
                </p>
                <p>
                  <strong>2. Bảo mật:</strong> Ảnh thẻ và sinh trắc học được mã hóa, lưu trữ trong phân vùng riêng tư. Tuyệt đối không chia sẻ cho bên thứ ba.
                </p>
                <p>
                  <strong>3. Quyền của bạn:</strong> Bạn có quyền yêu cầu xóa toàn bộ dữ liệu cá nhân bất cứ lúc nào theo Điều 9 Nghị định 13/2023/NĐ-CP.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowConsentModal(false)}
                className="w-full h-9 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-semibold"
              >
                Đã hiểu &amp; Đóng
              </button>
            </div>
          </div>
        )}

        {/* Modal xác nhận xóa dữ liệu eKYC */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60">
            <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl space-y-3.5 border border-slate-200">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <Trash2 className="size-4.5" />
                <span>Xóa dữ liệu căn cước của bạn?</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Toàn bộ ảnh chụp CCCD, ảnh chân dung và các dữ liệu liên quan sẽ bị xóa vĩnh viễn khỏi hệ thống. Trạng thái Tích xanh của bạn sẽ bị hủy bỏ.
              </p>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  disabled={isDeletingKyc}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 h-9 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={isDeletingKyc}
                  onClick={handleDeleteKyc}
                  className="flex-1 h-9 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  {isDeletingKyc ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <span>Xác nhận xóa</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Hướng dẫn 2 Mẫu Phôi Căn Cước Chuẩn Bộ Công An */}
        {showTemplateGuideModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <ShieldCheck className="size-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 leading-tight">
                      2 Mẫu Phôi Căn Cước Chuẩn Bộ Công An
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Quy chuẩn nhận diện hợp lệ trước khi gửi đối soát GPU
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTemplateGuideModal(false)}
                  className="size-8 rounded-lg text-slate-400 hover:text-zinc-900 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Tabs chuyển đổi giữa 2 mẫu thẻ hiện hành */}
              <div className="p-3 bg-slate-100/80 border-b border-slate-200/80 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setTemplateGuideTab("cc")}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    templateGuideTab === "cc"
                      ? "bg-white text-zinc-900 shadow-xs border border-slate-200/80"
                      : "text-slate-600 hover:text-zinc-900"
                  }`}
                >
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span>Mẫu Căn cước mới (TT 16/2024/TT-BCA)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTemplateGuideTab("cccd")}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    templateGuideTab === "cccd"
                      ? "bg-white text-zinc-900 shadow-xs border border-slate-200/80"
                      : "text-slate-600 hover:text-zinc-900"
                  }`}
                >
                  <span className="size-2 rounded-full bg-blue-500" />
                  <span>Mẫu CCCD gắn chip (TT 06/2021/TT-BCA)</span>
                </button>
              </div>

              {/* Nội dung chi tiết của từng mẫu thẻ */}
              <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
                {templateGuideTab === "cc" ? (
                  <div className="space-y-3">
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/images/phoi_cc.jpg"
                        alt="Phôi thẻ Căn cước mẫu 2024 của Bộ Công An"
                        className="w-full h-auto object-contain max-h-[260px] mx-auto"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 space-y-1.5">
                      <p className="font-bold text-xs flex items-center gap-1 text-emerald-800">
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                        Đặc điểm nhận diện thẻ Căn cước (Luật Căn cước 2024):
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] leading-relaxed pt-1">
                        <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                          <p className="font-semibold text-emerald-900">MẶT TRƯỚC:</p>
                          <ul className="list-disc list-inside space-y-0.5 text-emerald-800 mt-1">
                            <li>Tiêu đề chữ lớn: <strong>"CĂN CƯỚC"</strong></li>
                            <li>Ảnh chân dung ở <strong>bên trái</strong></li>
                            <li>In chìm hình bản đồ Việt Nam màu cam</li>
                            <li><strong className="text-amber-700">Không có mã QR</strong> ở mặt trước</li>
                          </ul>
                        </div>
                        <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                          <p className="font-semibold text-emerald-900">MẶT SAU:</p>
                          <ul className="list-disc list-inside space-y-0.5 text-emerald-800 mt-1">
                            <li><strong className="text-emerald-700">Mã QR ở góc trên bên phải</strong></li>
                            <li>Con chip điện tử ở bên trái</li>
                            <li>Dòng chữ: <strong>BỘ CÔNG AN</strong></li>
                            <li><strong className="text-slate-600">Bỏ 2 ô vân tay</strong> trên mặt thẻ</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/images/phoi_cccd.jpg"
                        alt="Phôi thẻ Căn cước công dân gắn chip 2021"
                        className="w-full h-auto object-contain max-h-[260px] mx-auto"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-950 space-y-1.5">
                      <p className="font-bold text-xs flex items-center gap-1 text-blue-800">
                        <CheckCircle2 className="size-3.5 text-blue-600" />
                        Đặc điểm nhận diện thẻ Căn cước công dân gắn chip (2021):
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] leading-relaxed pt-1">
                        <div className="bg-white/80 p-2 rounded-lg border border-blue-100">
                          <p className="font-semibold text-blue-900">MẶT TRƯỚC:</p>
                          <ul className="list-disc list-inside space-y-0.5 text-blue-800 mt-1">
                            <li>Tiêu đề: <strong>"CĂN CƯỚC CÔNG DÂN"</strong></li>
                            <li>Ảnh chân dung ở <strong>bên trái</strong></li>
                            <li><strong className="text-blue-700">Mã QR ở góc trên bên phải</strong></li>
                            <li>Quốc huy Việt Nam ở góc trên trái</li>
                          </ul>
                        </div>
                        <div className="bg-white/80 p-2 rounded-lg border border-blue-100">
                          <p className="font-semibold text-blue-900">MẶT SAU:</p>
                          <ul className="list-disc list-inside space-y-0.5 text-blue-800 mt-1">
                            <li>Con chip điện tử ở bên trái</li>
                            <li><strong>2 ô vân tay</strong> ngón trỏ bên phải</li>
                            <li>Dòng chữ: <strong>Cục CS QLHC về TTXH</strong></li>
                            <li>3 dòng mã máy đọc MRZ (ICAO) ở đáy</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Hệ thống hỗ trợ 100% cả 2 mẫu phôi hợp pháp.
                </span>
                <button
                  type="button"
                  onClick={() => setShowTemplateGuideModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Đã hiểu quy chuẩn
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  )
}
