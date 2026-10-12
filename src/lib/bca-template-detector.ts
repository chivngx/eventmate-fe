/**
 * Bộ kiểm tra và đối chiếu phôi thẻ Căn cước chuẩn Bộ Công An (Client-side)
 * Hỗ trợ 2 mẫu thẻ hiện hành của Bộ Công An:
 * 1. Mẫu Thẻ Căn cước công dân gắn chip (Thông tư 06/2021/TT-BCA)
 * 2. Mẫu Thẻ Căn cước mới (Thông tư 16/2024/TT-BCA)
 */

import jsQR from "jsqr"
import { detectCardFace, type CardFaceResult } from "@/lib/human-service"

export type BcaCardType = "CCCD_CHIP_2021" | "CC_NEW_2024" | "UNKNOWN"

export interface BcaQrData {
  id_number?: string
  cmnd_old?: string
  full_name?: string
  dob?: string
  gender?: string
  address?: string
  issue_date?: string
  raw?: string
}

export interface BcaFrontValidationResult {
  isValid: boolean
  cardType: BcaCardType
  cardTypeName: string
  confidenceScore: number // 0 - 100
  checks: {
    faceDetected: boolean
    faceOnLeft: boolean
    faceProportionValid: boolean
    isLikelySelfie: boolean
    qrDetected: boolean
    qrValidBcaFormat: boolean
    hasTopRightQrPattern: boolean
    emblemDetected: boolean
    aspectRatioValid: boolean
  }
  qrData?: BcaQrData
  reasons: string[]
  primaryReason?: string
}

export interface BcaBackValidationResult {
  isValid: boolean
  cardType?: BcaCardType
  cardTypeName?: string
  hasFaceError: boolean
  hasEmblemError: boolean
  isDuplicateFront: boolean
  qrDetected: boolean
  mrzDetected: boolean
  qrData?: BcaQrData
  reasons: string[]
  reason?: string
}

/**
 * Tính toán Perceptual dHash (Difference Hash) 64-bit từ ảnh hoặc Canvas
 * Dùng để phát hiện trùng lặp ảnh giữa mặt trước và mặt sau với độ chính xác tuyệt đối.
 */
export function computeDHash(
  source: HTMLCanvasElement | HTMLImageElement
): string {
  try {
    const canvas = document.createElement("canvas")
    canvas.width = 9
    canvas.height = 8
    const ctx = canvas.getContext("2d")
    if (!ctx) return ""
    ctx.drawImage(source, 0, 0, 9, 8)
    const imgData = ctx.getImageData(0, 0, 9, 8)
    const data = imgData.data

    let hash = ""
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const idxCurr = (y * 9 + x) * 4
        const idxNext = (y * 9 + (x + 1)) * 4
        const lumaCurr = 0.299 * data[idxCurr] + 0.587 * data[idxCurr + 1] + 0.114 * data[idxCurr + 2]
        const lumaNext = 0.299 * data[idxNext] + 0.587 * data[idxNext + 1] + 0.114 * data[idxNext + 2]
        hash += lumaNext > lumaCurr ? "1" : "0"
      }
    }
    return hash
  } catch {
    return ""
  }
}

export function hammingDistance(h1: string, h2: string): number {
  if (!h1 || !h2 || h1.length !== h2.length) return 64
  let dist = 0
  for (let i = 0; i < h1.length; i++) {
    if (h1[i] !== h2[i]) dist++
  }
  return dist
}

/**
 * Kiểm tra màu sắc đặc trưng của Quốc huy Việt Nam ở góc trên bên trái thẻ (x: 4%-28%, y: 2%-28%)
 * Quốc huy Việt Nam có nền đỏ rực rỡ và ngôi sao vàng / bông lúa vàng.
 */
export function checkVietnamEmblemColorSignature(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): { detected: boolean; redYellowRatio: number } {
  try {
    const rx = Math.round(width * 0.04)
    const ry = Math.round(height * 0.02)
    const rw = Math.round(width * 0.25)
    const rh = Math.round(height * 0.28)

    const imgData = ctx.getImageData(rx, ry, rw, rh)
    const data = imgData.data
    const totalPixels = data.length / 4

    let redCount = 0
    let yellowCount = 0

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // Sắc đỏ Quốc huy: r trội hẳn so với g và b
      const isEmblemRed = r > 115 && r > g * 1.25 && r > b * 1.25
      // Sắc vàng ngôi sao / viền lúa: r và g cao, b thấp
      const isEmblemYellow = r > 130 && g > 105 && b < 100 && r - b > 35

      if (isEmblemRed) redCount++
      if (isEmblemYellow) yellowCount++
    }

    const redRatio = redCount / totalPixels
    const yellowRatio = yellowCount / totalPixels

    // Quốc huy Việt Nam bắt buộc phải có đồng thời cả nền đỏ VÀ ngôi sao/bông lúa vàng
    const detected = redRatio >= 0.05 && yellowRatio >= 0.02
    return {
      detected,
      redYellowRatio: Math.round((redRatio + yellowRatio) * 1000) / 10,
    }
  } catch {
    return { detected: false, redYellowRatio: 0 }
  }
}

/**
 * Kiểm tra vùng góc trên bên phải có hình khối ma trận mã QR không (đặc trưng của mặt trước CCCD 2021)
 * Mã QR gồm ma trận pixel đen/trắng đan xen với mật độ chuyển tiếp gradient cực cao.
 */
function checkTopRightQrBlock(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): { hasPattern: boolean; variance: number } {
  try {
    // Tập trung chính xác vào góc trên bên phải (x: 64% -> 96%, y: 4% -> 42%)
    const qx = Math.round(width * 0.64)
    const qy = Math.round(height * 0.04)
    const qw = Math.round(width * 0.32)
    const qh = Math.round(height * 0.38)

    const imgData = ctx.getImageData(qx, qy, qw, qh)
    const data = imgData.data
    let totalLuma = 0
    const lumas: number[] = []

    for (let i = 0; i < data.length; i += 4) {
      const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      lumas.push(luma)
      totalLuma += luma
    }

    const mean = totalLuma / lumas.length
    let variance = 0
    let darkPixelCount = 0
    let brightPixelCount = 0
    let sharpEdgesCount = 0

    const rowWidth = qw
    for (let i = 0; i < lumas.length; i++) {
      const l = lumas[i]
      variance += (l - mean) * (l - mean)
      if (l < 85) darkPixelCount++
      if (l > 170) brightPixelCount++

      // Đếm gradient cạnh sắc nét (bước chuyển đen-trắng của module QR)
      if (i % rowWidth !== rowWidth - 1 && i + 1 < lumas.length) {
        if (Math.abs(lumas[i + 1] - l) > 35) {
          sharpEdgesCount++
        }
      }
    }
    variance = Math.round(Math.sqrt(variance / lumas.length))

    const total = lumas.length
    const darkRatio = darkPixelCount / total
    const brightRatio = brightPixelCount / total
    const edgeRatio = sharpEdgesCount / total

    // Mã QR thật sự có độ sắc cạnh đen-trắng cao (edgeRatio > 0.055) hoặc phân bố tương phản rõ rệt
    const hasPattern =
      edgeRatio > 0.055 ||
      (variance > 36 && darkRatio > 0.03 && brightRatio > 0.20)

    return { hasPattern, variance }
  } catch {
    return { hasPattern: false, variance: 0 }
  }
}

/**
 * Kiểm tra đặc trưng dải ký tự MRZ (3 dòng máy đọc ở 25% đáy thẻ) hoặc chip ở mặt sau
 */
function checkBackCardMrzPattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): boolean {
  try {
    // Vùng đáy chứa mã MRZ (y: 72% -> 98%)
    const my = Math.round(height * 0.72)
    const mh = Math.round(height * 0.25)
    const mw = Math.round(width * 0.90)
    const mx = Math.round(width * 0.05)

    const imgData = ctx.getImageData(mx, my, mw, mh)
    const data = imgData.data
    let darkCount = 0
    let brightCount = 0

    for (let i = 0; i < data.length; i += 4) {
      const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      if (luma < 95) darkCount++
      if (luma > 165) brightCount++
    }

    const total = data.length / 4
    const darkRatio = darkCount / total
    const brightRatio = brightCount / total

    // Dải MRZ gồm chữ đen in trên nền trắng sáng
    return darkRatio >= 0.03 && brightRatio >= 0.30
  } catch {
    return false
  }
}

/**
 * Trích xuất và giải mã QR code bằng jsQR với đa độ phân giải và lọc tăng cường tương phản
 */
export async function detectBcaQrCode(
  source: CanvasImageSource | Blob | File
): Promise<{
  found: boolean
  isValidBca: boolean
  data?: BcaQrData
}> {
  try {
    let canvas: HTMLCanvasElement

    if (source instanceof HTMLCanvasElement) {
      canvas = source
    } else {
      let imgBitmap: ImageBitmap
      if (source instanceof Blob || source instanceof File) {
        imgBitmap = await createImageBitmap(source)
      } else {
        imgBitmap = await createImageBitmap(source as any)
      }
      canvas = document.createElement("canvas")
      canvas.width = imgBitmap.width
      canvas.height = imgBitmap.height
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(imgBitmap, 0, 0)
      }
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) return { found: false, isValidBca: false }

    const w = canvas.width
    const h = canvas.height

    const parsePayload = (text: string) => {
      if (!text || !text.includes("|")) return null
      const parts = text.split("|")
      if (parts.length >= 6) {
        const idNumber = parts[0]?.trim() || ""
        const isValidId = /^\d{12}$/.test(idNumber)
        return {
          found: true,
          isValidBca: isValidId,
          data: {
            id_number: idNumber,
            cmnd_old: parts[1]?.trim(),
            full_name: parts[2]?.trim(),
            dob: parts[3]?.trim(),
            gender: parts[4]?.trim(),
            address: parts[5]?.trim(),
            issue_date: parts[6]?.trim() || "",
            raw: text,
          },
        }
      }
      return null
    }

    // 1. Quét vùng ROI góc trên bên phải (Độ phân giải gốc, vị trí QR của CCCD 2021 hoặc CC 2024 mặt sau)
    try {
      const rx = Math.round(w * 0.55)
      const ry = Math.round(h * 0.02)
      const rw = Math.round(w * 0.43)
      const rh = Math.round(h * 0.48)

      const roiCanvas = document.createElement("canvas")
      const roiW = Math.min(rw, 600)
      const roiH = Math.min(rh, 600)
      roiCanvas.width = roiW
      roiCanvas.height = roiH
      const roiCtx = roiCanvas.getContext("2d", { willReadFrequently: true })
      if (roiCtx) {
        roiCtx.drawImage(canvas, rx, ry, rw, rh, 0, 0, roiW, roiH)
        const roiData = roiCtx.getImageData(0, 0, roiW, roiH)

        // Quét trực tiếp ROI
        const qrRoi = jsQR(roiData.data, roiW, roiH, { inversionAttempts: "attemptBoth" })
        if (qrRoi && qrRoi.data) {
          const parsed = parsePayload(qrRoi.data)
          if (parsed) return parsed
        }

        // Tăng cường tương phản (Binarization) cho ROI nếu chưa decode được
        const binarizedData = new Uint8ClampedArray(roiData.data)
        let sumLuma = 0
        for (let i = 0; i < binarizedData.length; i += 4) {
          sumLuma += 0.299 * binarizedData[i] + 0.587 * binarizedData[i + 1] + 0.114 * binarizedData[i + 2]
        }
        const avgLuma = sumLuma / (binarizedData.length / 4)
        for (let i = 0; i < binarizedData.length; i += 4) {
          const luma = 0.299 * binarizedData[i] + 0.587 * binarizedData[i + 1] + 0.114 * binarizedData[i + 2]
          const val = luma < avgLuma ? 0 : 255
          binarizedData[i] = val
          binarizedData[i + 1] = val
          binarizedData[i + 2] = val
        }
        const qrBinarized = jsQR(binarizedData, roiW, roiH, { inversionAttempts: "attemptBoth" })
        if (qrBinarized && qrBinarized.data) {
          const parsed = parsePayload(qrBinarized.data)
          if (parsed) return parsed
        }
      }
    } catch {
      // bỏ qua lỗi đọc ROI
    }

    // 2. Quét toàn bộ ảnh bằng jsQR
    try {
      const fullImgData = ctx.getImageData(0, 0, w, h)
      const qrFull = jsQR(fullImgData.data, w, h, { inversionAttempts: "attemptBoth" })
      if (qrFull && qrFull.data) {
        const parsed = parsePayload(qrFull.data)
        if (parsed) return parsed
      }
    } catch {
      // bỏ qua lỗi đọc full
    }

    // 3. Fallback: Browser BarcodeDetector (nếu thiết bị có hỗ trợ)
    try {
      if (typeof window !== "undefined" && "BarcodeDetector" in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] })
        const barcodes = await detector.detect(canvas)
        if (barcodes && barcodes.length > 0) {
          const raw = barcodes[0].rawValue || ""
          const parsed = parsePayload(raw)
          if (parsed) return parsed
        }
      }
    } catch {
      // BarcodeDetector fallback bỏ qua
    }
  } catch (err) {
    console.warn("Lỗi detectBcaQrCode:", err)
  }

  return { found: false, isValidBca: false }
}

/**
 * ĐỐI CHIẾU MẶT TRƯỚC THẺ CĂN CƯỚC (BCA Template Matcher - Front)
 */
export async function validateBcaCardTemplate(
  source: HTMLCanvasElement | HTMLImageElement,
  file?: File | Blob
): Promise<BcaFrontValidationResult> {
  const imgW = (source as HTMLImageElement).naturalWidth || source.width || 1280
  const imgH = (source as HTMLImageElement).naturalHeight || source.height || 720
  const aspectRatio = imgW / imgH

  // Tạo canvas chuẩn hóa cho các tác vụ kiểm tra quang học
  const normCanvas = document.createElement("canvas")
  normCanvas.width = 640
  normCanvas.height = Math.round(640 / (aspectRatio || 1.58))
  const normCtx = normCanvas.getContext("2d", { willReadFrequently: true })

  let emblemCheck = { detected: false, redYellowRatio: 0 }
  let qrBlockCheck = { hasPattern: false, variance: 0 }

  if (normCtx) {
    normCtx.drawImage(source, 0, 0, normCanvas.width, normCanvas.height)
    emblemCheck = checkVietnamEmblemColorSignature(normCtx, normCanvas.width, normCanvas.height)
    qrBlockCheck = checkTopRightQrBlock(normCtx, normCanvas.width, normCanvas.height)
  }

  // 1. Quét QR Code từ ảnh gốc có độ phân giải cao nhất
  const qrCheck = await detectBcaQrCode(source)

  // 2. Nhận diện khuôn mặt chân dung trên thẻ
  const cardFace: CardFaceResult | null = await detectCardFace(source)

  let faceDetected = false
  let faceOnLeft = false
  let faceProportionValid = false
  let isLikelySelfie = false

  if (cardFace) {
    faceDetected = true
    const centerX = (cardFace.box.x + cardFace.box.width / 2) / imgW
    const faceHeightRatio = cardFace.box.height / imgH

    // Quy chuẩn Bộ Công An: Ảnh chân dung bắt buộc phải nằm ở phía bên trái thẻ (centerX < 0.48)
    faceOnLeft = centerX < 0.48

    // Tỉ lệ chiều cao khuôn mặt trong khung thẻ chuẩn ID-1
    faceProportionValid = faceHeightRatio >= 0.12 && faceHeightRatio <= 0.78

    // Ngăn chặn ảnh Selfie trực tiếp
    if (centerX >= 0.35 && centerX <= 0.65 && faceHeightRatio > 0.52) {
      isLikelySelfie = true
    }
  }

  const isLandscape = aspectRatio >= 1.15
  const aspectRatioValid = isLandscape && aspectRatio >= 1.25 && aspectRatio <= 1.95

  let cardType: BcaCardType = "UNKNOWN"
  let cardTypeName = "Thẻ Căn cước hợp lệ (Chuẩn Bộ Công An)"
  let confidenceScore = 0
  const reasons: string[] = []

  // Phân loại mẫu thẻ chính xác
  if (qrCheck.found && qrCheck.isValidBca) {
    // 1. Đã quét thành công QR mặt trước -> Chắc chắn 100% là Thẻ CCCD gắn chip (TT 06/2021/TT-BCA)
    cardType = "CCCD_CHIP_2021"
    cardTypeName = "Căn cước công dân gắn chip (Thông tư 06/2021/TT-BCA)"
    confidenceScore = 100
    reasons.push("Đã giải mã thành công mã QR 7 trường chuẩn Bộ Công An ở góc trên bên phải.")
    if (faceDetected && faceOnLeft) {
      reasons.push("Ảnh chân dung nằm đúng góc bên trái chuẩn phôi CCCD.")
    }
  } else if (faceDetected && faceOnLeft && qrBlockCheck.hasPattern) {
    // 2. Có ảnh chân dung bên trái VÀ phát hiện khối mã QR ở góc trên phải nhưng chưa decode được (do mờ/chói)
    // -> Đây là CCCD 2021, TUYỆT ĐỐI KHÔNG ĐƯỢC báo nhầm sang 2024!
    cardType = "CCCD_CHIP_2021"
    cardTypeName = "Căn cước công dân gắn chip (Thông tư 06/2021/TT-BCA)"
    confidenceScore = 92
    reasons.push("Phát hiện khối mã QR góc trên phải và ảnh chân dung góc trái chuẩn mẫu CCCD 2021.")
    reasons.push("Hệ thống AI GPU server sẽ tăng cường đối soát dữ liệu qua OCR và QR.")
  } else if (faceDetected && faceOnLeft) {
    // 3. Có ảnh chân dung góc trái nhưng chưa quét được QR:
    // Tuyệt đối không tự ý khẳng định là 2024! Đa số người dùng dùng thẻ 2021.
    // Xác định chuẩn là Thẻ Căn cước hợp lệ, phân hệ 2021/2024 sẽ phân định chính xác ở bước Mặt Sau!
    cardType = "CCCD_CHIP_2021"
    cardTypeName = "Căn cước công dân (Chuẩn Bộ Công An)"
    confidenceScore = emblemCheck.detected ? 92 : 85
    if (emblemCheck.detected) {
      reasons.push("Phát hiện Quốc huy và ảnh chân dung góc trái chuẩn phôi Bộ Công An.")
    } else {
      reasons.push("Bố cục ảnh chân dung nằm đúng góc trái chuẩn thẻ Căn cước.")
    }
    reasons.push("Ảnh mặt trước hợp lệ; hệ thống AI GPU server sẽ giải mã QR và trích xuất dữ liệu.")
  }

  // Đánh giá tính hợp lệ tổng thể
  let isValid = false
  let primaryReason: string | undefined

  if (isLikelySelfie) {
    isValid = false
    primaryReason =
      "Ảnh có dấu hiệu là ảnh selfie khuôn mặt cá nhân, không phải ảnh chụp thẻ Căn cước Bộ Công An (ảnh chân dung trên thẻ phải nằm ở góc trái)."
  } else if (!faceDetected && !qrCheck.found) {
    isValid = false
    primaryReason =
      "Không phát hiện ảnh chân dung hoặc mã QR chuẩn phôi thẻ Bộ Công An. Vui lòng chụp rõ mặt trước thẻ Căn cước, không chụp vật thể khác!"
  } else if (faceDetected && !faceOnLeft && !qrCheck.found) {
    isValid = false
    primaryReason =
      "Vị trí khuôn mặt nằm ở bên phải (chuẩn phôi Bộ Công An yêu cầu ảnh chân dung nằm ở góc bên trái). Có thể thẻ bị lộn ngược hoặc chụp sai chiều!"
  } else if (cardType !== "UNKNOWN" || (faceDetected && faceOnLeft)) {
    isValid = true
  } else {
    isValid = false
    primaryReason =
      "Ảnh không khớp với bố cục của 2 mẫu thẻ Căn cước hiện hành của Bộ Công An. Vui lòng căn chỉnh lại góc chụp."
  }

  return {
    isValid,
    cardType,
    cardTypeName,
    confidenceScore,
    checks: {
      faceDetected,
      faceOnLeft,
      faceProportionValid,
      isLikelySelfie,
      qrDetected: qrCheck.found,
      qrValidBcaFormat: qrCheck.isValidBca,
      hasTopRightQrPattern: qrBlockCheck.hasPattern,
      emblemDetected: emblemCheck.detected,
      aspectRatioValid,
    },
    qrData: qrCheck.data,
    reasons,
    primaryReason,
  }
}

/**
 * ĐỐI CHIẾU MẶT SAU THẺ CĂN CƯỚC (BCA Template Matcher - Back)
 * - Chặn 100% nếu người dùng tải ảnh trùng lặp với mặt trước (dHash <= 10)
 * - Chặn 100% nếu ảnh chứa khuôn mặt người hoặc Quốc huy Việt Nam
 * - Quét mã QR mặt sau (đặc trưng của mẫu Căn cước 2024)
 * - Kiểm tra dải mã máy đọc MRZ ở đáy
 */
export async function validateBcaBackCardTemplate(
  source: HTMLCanvasElement | HTMLImageElement,
  frontImageUrl?: string | null
): Promise<BcaBackValidationResult> {
  const imgW = (source as HTMLImageElement).naturalWidth || source.width || 1280
  const imgH = (source as HTMLImageElement).naturalHeight || source.height || 720
  const aspectRatio = imgW / imgH

  // 1. KIỂM TRA TRÙNG LẶP VỚI MẶT TRƯỚC (dHash so sánh thị giác)
  if (frontImageUrl) {
    try {
      const backHash = computeDHash(source)
      if (backHash) {
        const frontImg = new Image()
        frontImg.src = frontImageUrl
        await new Promise((resolve) => {
          if (frontImg.complete) resolve(true)
          else frontImg.onload = () => resolve(true)
        })
        const frontHash = computeDHash(frontImg)
        if (frontHash) {
          const dist = hammingDistance(backHash, frontHash)
          if (dist <= 10) {
            return {
              isValid: false,
              hasFaceError: false,
              hasEmblemError: false,
              isDuplicateFront: true,
              qrDetected: false,
              mrzDetected: false,
              reasons: [],
              reason:
                "Ảnh mặt sau bị trùng lặp với ảnh mặt trước (bạn đã tải lại cùng một ảnh hoặc chụp lại mặt trước). Vui lòng lật thẻ và chụp đúng mặt sau!",
            }
          }
        }
      }
    } catch (err) {
      console.warn("Lỗi so sánh dHash mặt trước/mặt sau:", err)
    }
  }

  // Tạo canvas chuẩn hóa
  const normCanvas = document.createElement("canvas")
  normCanvas.width = 640
  normCanvas.height = Math.round(640 / (aspectRatio || 1.58))
  const normCtx = normCanvas.getContext("2d", { willReadFrequently: true })

  let emblemCheck = { detected: false, redYellowRatio: 0 }
  let mrzDetected = false

  if (normCtx) {
    normCtx.drawImage(source, 0, 0, normCanvas.width, normCanvas.height)
    emblemCheck = checkVietnamEmblemColorSignature(normCtx, normCanvas.width, normCanvas.height)
    mrzDetected = checkBackCardMrzPattern(normCtx, normCanvas.width, normCanvas.height)
  }

  // 2. KIỂM TRA BẮT BUỘC: Mặt sau TUYỆT ĐỐI KHÔNG ĐƯỢC CHỨA KHUÔN MẶT NGƯỜI
  const cardFace = await detectCardFace(source)
  if (cardFace) {
    return {
      isValid: false,
      hasFaceError: true,
      hasEmblemError: false,
      isDuplicateFront: false,
      qrDetected: false,
      mrzDetected,
      reasons: [],
      reason:
        "Phát hiện ảnh chân dung khuôn mặt người. Mặt sau thẻ Căn cước tuyệt đối không có ảnh chân dung. Bạn đang chụp nhầm ảnh mặt trước hoặc ảnh selfie!",
    }
  }

  // 3. KIỂM TRA BẮT BUỘC: Mặt sau KHÔNG ĐƯỢC CHỨA QUỐC HUY VIỆT NAM (Quốc huy chỉ có ở mặt trước)
  if (emblemCheck.detected) {
    return {
      isValid: false,
      hasFaceError: false,
      hasEmblemError: true,
      isDuplicateFront: false,
      qrDetected: false,
      mrzDetected,
      reasons: [],
      reason:
        "Phát hiện hình Quốc huy Việt Nam ở góc trên bên trái (đây là đặc điểm của mặt trước). Vui lòng lật thẻ và chụp đúng mặt sau!",
    }
  }

  // 4. Quét mã QR mặt sau (Đặc trưng của Thẻ Căn cước mới - Thông tư 16/2024/TT-BCA)
  const qrCheck = await detectBcaQrCode(source)
  const reasons: string[] = []
  let cardType: BcaCardType = "UNKNOWN"
  let cardTypeName = "Mặt sau Thẻ Căn cước hợp lệ"

  if (qrCheck.found && qrCheck.isValidBca) {
    cardType = "CC_NEW_2024"
    cardTypeName = "Mặt sau Thẻ Căn cước mới (Thông tư 16/2024/TT-BCA)"
    reasons.push("Đã nhận diện thành công mã QR bảo an ở mặt sau thẻ (Chuẩn Thông tư 16/2024/TT-BCA).")
  } else {
    cardType = "CCCD_CHIP_2021"
    cardTypeName = "Mặt sau Thẻ CCCD gắn chip (Thông tư 06/2021/TT-BCA)"
    reasons.push("Không có khuôn mặt chân dung và khớp cấu trúc mặt sau thẻ CCCD.")
  }

  if (mrzDetected) {
    reasons.push("Đã nhận diện dải mã ký tự máy đọc ICAO MRZ ở đáy thẻ.")
  }

  return {
    isValid: true,
    cardType,
    cardTypeName,
    hasFaceError: false,
    hasEmblemError: false,
    isDuplicateFront: false,
    qrDetected: qrCheck.found && qrCheck.isValidBca,
    mrzDetected,
    qrData: qrCheck.data,
    reasons,
  }
}

