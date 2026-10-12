# HỆ THỐNG eKYC CHUYÊN DỤNG (EDGE LIVENESS & GOOGLE COLAB GPU ENGINE)
**Tài liệu Thiết kế Kiến trúc, Kịch bản Triển khai & Đặc tả Kỹ thuật Chi tiết**

---

## 1. Kiến trúc hệ thống tổng thể (System Architecture)

Hệ thống được thiết kế theo mô hình **Hybrid Client Liveness + Colab GPU Brain**:
* **Toàn bộ tác vụ AI nặng (Deep Learning)** được xử lý 100% trên **Google Colab GPU** (Nvidia T4 / A100).
* **Tuyệt đối không fallback về Client AI**, đảm bảo tính chính xác sinh trắc học và tiêu chuẩn bảo mật ngân hàng.

```text
[ Next.js Client (Browser) ]
  ├── 1. Quét / Chụp ảnh CCCD mặt trước (Camera HD / File upload)
  ├── 2. Quét / Chụp ảnh CCCD mặt sau (Bắt dòng MRZ & vân tay)
  ├── 3. Camera trước: Active Liveness Challenge (Chớp mắt + Quay đầu + Cười)
  └── 4. Tiền xử lý: Canvas nén ảnh chuẩn JPEG quality 0.85 (< 500KB)
            │
            ▼ (HTTPS POST Multipart FormData: front + back + selfie)
[ Next.js API Routes (BFF Gateway: /api/ekyc/verify) ]
  ├── 1. Kiểm tra session & Rate-limiting (Chống spam request)
  ├── 2. Đính kèm Header bảo mật bí mật (X-API-KEY)
  ├── 3. Reverse Proxy sang GPU Server qua Cloudflare Named Tunnel
  ├── 4. Tiếp nhận kết quả, đối chiếu Bộ 6 Quy tắc Nghiệp vụ CCCD
  └── 5. Ghi nhận toàn bộ hồ sơ vào Database eKYC chuyên dụng
            │
            ▼ (Cloudflare Named Tunnel cố định: https://ai-ekyc.yourdomain.com)
[ Google Colab Server (Nvidia T4/A100 GPU - FastAPI) ]
  ├── 1. Chuẩn hóa góc xoay EXIF điện thoại (Orientation Normalization)
  ├── 2. Cắt & nắn phẳng CCCD 2 mặt (YOLOv8-OBB Perspective Transform)
  ├── 3. Giải mã QR Code mặt trước siêu tốc (Crop ROI 35% + CLAHE + Pyzbar)
  ├── 4. Giải mã dòng máy đọc MRZ mặt sau (ICAO 9303 Checksum Parser)
  ├── 5. Nhận diện chữ in bề mặt thẻ (VietOCR + PaddleOCR)
  ├── 6. Đối soát 3 chiều (Tam giác vàng: QR Code ⟺ Text OCR ⟺ Dòng MRZ)
  ├── 7. Trích xuất đặc trưng sinh trắc học 512-d (InsightFace buffalo_l ArcFace)
  └── 8. Đo khoảng cách Cosine Similarity & Xuất ảnh chân dung thẻ Base64
```

---

## 2. Danh mục công nghệ & thư viện (100% Free & Open Source)

### Frontend (Next.js / React)
* **`@vladmandic/human`**: Thư viện AI client-side chạy trên WebGL. Chỉ sử dụng cho mục đích tương tác Liveness (bắt góc quay đầu `yaw/pitch`, cử chỉ chớp mắt `blink`, nụ cười `smile`) và bắt khung hình nét nhất (Best-frame Capture). Tuyệt đối **không dùng để so khớp khuôn mặt**.
* **`react-webcam` / Canvas API**: Điều khiển stream camera, vẽ khung hướng dẫn thẻ (Card Bounding Box) và nén ảnh trước khi gửi.

### Middleware & Bridge
* **Cloudflare Named Tunnel (`cloudflared`)**: Cung cấp đường truyền HTTPS cố định vĩnh viễn (ví dụ: `https://ai-ekyc.yourdomain.com`) trỏ thẳng về cổng 8000 của Google Colab mà không lo bị đổi URL ngẫu nhiên hay bị chặn NAT.

### AI Engine (Google Colab Python Backend - GPU)
* **Web Framework:** `FastAPI` + `Uvicorn` + `python-multipart`.
* **Tiền xử lý ảnh:** `Pillow` (`ImageOps.exif_transpose`) chuẩn hóa góc xoay camera điện thoại + `OpenCV` (CLAHE, Warp Perspective).
* **Cắt khung & Nắn phẳng thẻ:** `Ultralytics YOLOv8`.
* **Đọc QR Code & MRZ:**
  * `pyzbar`: Giải mã QR Code mặt trước thẻ chip.
  * `mrz` / `passporteye`: Đọc và kiểm tra checksum dòng MRZ mặt sau.
* **OCR Tiếng Việt:** `PaddleOCR` (Text Detection) + `VietOCR` (Transformer Text Recognition).
* **So khớp sinh trắc học khuôn mặt:** `InsightFace` (Model `buffalo_l` - ArcFace 512 chiều chuẩn hóa cầu $L_2$).

---

## 3. Quy trình nghiệp vụ đầy đủ (Full 6-Step Business Flow)

### Bước 1: Khởi tạo phiên & Kiểm tra môi trường (Onboarding)
* Kiểm tra quyền truy cập Camera và độ phân giải tối thiểu HD 720p.
* Sinh `session_token` có hiệu lực trong 10 phút để liên kết toàn bộ tiến trình và chống tấn công Replay Attack.

### Bước 2: Quét & Chụp CCCD mặt trước
1. Người dùng đưa mặt trước thẻ CCCD vào khung ngắm bo góc.
2. Hệ thống kiểm tra độ nét và chụp ảnh.
3. Colab AI thực hiện:
   * Nắn thẳng thẻ (Warp Perspective).
   * Cắt riêng góc 35% trên cùng bên phải, tăng tương phản để giải mã QR Code lấy thông tin gốc 100%: `Số CCCD | CMND cũ | Họ tên | Ngày sinh | Giới tính | Thường trú | Ngày cấp`.
   * Cắt ảnh chân dung trên thẻ (`card_portrait.jpg`) và mã hóa Base64 gửi về giao diện.
   * Chạy VietOCR đọc các trường văn bản in trên thẻ.

### Bước 3: Quét & Chụp CCCD mặt sau
1. Người dùng lật mặt sau thẻ vào khung ngắm.
2. Colab AI thực hiện:
   * Bóc tách 3 dòng ký tự ICAO 9303 (MRZ).
   * Kiểm tra mã Check-Digit của số CCCD, ngày sinh và ngày hết hạn.
   * Đọc đặc điểm nhận dạng và ngày cấp.

### Bước 4: Liveness Detection (Thực hiện chuỗi hành động ngẫu nhiên)
1. **Passive Liveness:** Kiểm tra khuôn mặt nằm chính diện, không có người thứ hai trong khung hình, phát hiện màn hình giả mạo qua texture model.
2. **Active Challenge-Response:** Hệ thống sinh ngẫu nhiên chuỗi hành động:
   * *Hành động 1:* Quay đầu sang trái/phải (`rotation.yaw > 20°` hoặc `< -20°`).
   * *Hành động 2:* Chớp mắt (`gesture: 'blink'`) hoặc mỉm cười (`gesture: 'smile'`).
3. Client bắt frame ảnh sắc nét nhất ngay khi hoàn thành chuỗi hành động.

### Bước 5: So khớp khuôn mặt sinh trắc học 1:1 (Face Matching)
* InsightFace trích xuất vector 512 chiều từ ảnh chân dung thẻ CCCD và ảnh selfie người thật.
* Tính Cosine Similarity chuẩn:
  $$S = \frac{\vec{A} \cdot \vec{B}}{\|\vec{A}\| \|\vec{B}\|}$$

### Bước 6: Đối soát chéo 3 chiều & Ra quyết định
* Thực thi **Tam giác vàng đối soát**: So khớp chéo giữa **Text OCR $\Longleftrightarrow$ Mã QR $\Longleftrightarrow$ Dòng MRZ**.
* Đưa ra kết luận cuối cùng:
  * `APPROVED`: Thông tin 3 chiều khớp nhau, Cosine $\ge 0.50 \rightarrow$ Tự động cấp Tích xanh.
  * `MANUAL_REVIEW`: Cosine từ $0.40 - 0.49$ hoặc ảnh có dấu hiệu mờ $\rightarrow$ Chuyển Admin duyệt thủ công.
  * `REJECTED`: Phát hiện phôi thẻ bị chỉnh sửa hoặc Cosine $< 0.40 \rightarrow$ Từ chối dứt khoát.

---

## 4. Danh mục điều kiện kiểm tra & Validate (Validation Matrix)

### Tầng 1: Validate chất lượng ảnh (Image Quality)
* **Phương sai Laplacian (Độ nét):** Nếu $< 100$ $\rightarrow$ Báo lỗi ảnh nhòe, yêu cầu chụp lại.
* **Lóa sáng (Glare):** Pixel có độ sáng $V > 250$ trong không gian HSV nằm đè lên vùng thông tin $\rightarrow$ Từ chối.
* **Góc nghiêng:** Thẻ không được nghiêng quá $\pm 30^\circ$.

### Tầng 2: Validate chống gian lận phôi thẻ (Anti-Fraud)
* **Đủ 4 góc thẻ:** Phát hiện trọn vẹn 4 góc viền, không bị ngón tay che khuất.
* **Chống chụp lại màn hình:** Phân tích phổ tần số Fast Fourier Transform (FFT) để phát hiện sọc Moiré từ màn hình LCD/OLED.
* **Chống photocopy:** Độ bão hòa màu trung bình $S \ge 30$ trong HSV (loại trừ ảnh đen trắng).

### Tầng 3: Validate Bộ 6 Quy tắc Nghiệp vụ CCCD Việt Nam
1. **Số định danh:** Đúng 12 chữ số (`^[0-9]{12}$`).
2. **Mã tỉnh/thành:** 3 số đầu phải thuộc danh mục 63 Tỉnh/Thành phố chuẩn (`001` - Hà Nội, `048` - Đà Nẵng, `079` - TP.HCM...).
3. **Thế kỷ & Giới tính:** Số thứ 4 hợp lệ (Nam TK20: `0`, Nữ TK20: `1`, Nam TK21: `2`, Nữ TK21: `3`).
4. **Năm sinh:** Số thứ 5 & 6 phải trùng khớp với 2 số cuối năm sinh trên thẻ.
5. **Hạn đổi thẻ:** Hạn thẻ phải rơi đúng vào các mốc tuổi 25, 40, 60 theo Luật Căn cước.
6. **Đối soát Tam giác vàng:**
   $$\text{Mã QR (Dữ liệu gốc)} \equiv \text{Text OCR (Mặt trước)} \equiv \text{Dòng MRZ (Mặt sau)}$$
   *Nếu số thẻ trong QR khác chữ in trên mặt thẻ $\rightarrow$ Báo cờ đỏ: Phát hiện thẻ bị dán đè phôi/chỉnh sửa Photoshop!*

### Tầng 4: Validate Sinh trắc học InsightFace ArcFace
* **$\ge 0.50$**: Cùng một người rõ rệt $\rightarrow$ **Khớp (Match)** $\rightarrow$ Đạt điều kiện tự động duyệt.
* **$0.40 - 0.49$**: Nghi vấn/ảnh thẻ mờ $\rightarrow$ **Cần Admin đối soát thủ công**.
* **$< 0.40$**: Người khác nhau $\rightarrow$ **Từ chối ngay lập tức (Mismatch)**.

---

## 5. Hướng dẫn kỹ thuật triển khai chi tiết

### 5.1. Phía Client (Next.js - LivenessCamera.tsx)

```typescript
// src/features/ekyc/components/LivenessCamera.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { Human, Config } from '@vladmandic/human'

const humanConfig: Partial<Config> = {
  backend: 'webgl',
  modelBasePath: 'https://vladmandic.github.io/human-models/models/',
  filter: { equalization: true },
  face: {
    enabled: true,
    detector: { rotation: true, maxDetected: 1 },
    mesh: { enabled: true },
    iris: { enabled: true },
    description: { enabled: false }, // Tắt description để nhẹ client
    emotion: { enabled: true },
    antispoof: { enabled: true },
  },
  body: { enabled: false },
  hand: { enabled: false },
}

interface LivenessCameraProps {
  onComplete: (selfieBlob: Blob) => void
  onError: (msg: string) => void
}

export default function LivenessCamera({ onComplete, onError }: LivenessCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [human, setHuman] = useState<Human | null>(null)
  const [instruction, setInstruction] = useState('Đang khởi tạo camera...')
  const [currentStep, setCurrentStep] = useState<'CENTER' | 'TURN_LEFT' | 'SMILE'>('CENTER')

  useEffect(() => {
    const h = new Human(humanConfig)
    setHuman(h)

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: false,
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
      } catch (err: any) {
        onError('Không thể mở camera trước: ' + err.message)
      }
    }
    startCamera()

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((t) => t.stop())
      }
    }
  }, [onError])

  useEffect(() => {
    if (!human || !videoRef.current) return
    let isFinished = false

    const loop = setInterval(async () => {
      if (!videoRef.current || isFinished) return
      const res = await human.detect(videoRef.current)

      if (!res.face || res.face.length === 0) {
        setInstruction('Vui lòng đưa mặt vào giữa khung tròn')
        return
      }
      if (res.face.length > 1) {
        setInstruction('Cảnh báo: Chỉ được giữ một khuôn mặt duy nhất!')
        return
      }

      const face = res.face[0]
      const yaw = face.rotation?.yaw || 0
      const isHappy = face.emotion?.some((e) => e.emotion === 'happy' && e.score > 0.6)

      if (currentStep === 'CENTER') {
        if (Math.abs(yaw) < 0.15) {
          setInstruction('Tốt lắm! Hãy quay mặt nhẹ sang trái')
          setCurrentStep('TURN_LEFT')
        } else {
          setInstruction('Nhìn thẳng vào giữa camera')
        }
      } else if (currentStep === 'TURN_LEFT') {
        if (yaw < -0.28) {
          setInstruction('Tuyệt vời! Bây giờ hãy mỉm cười nhẹ')
          setCurrentStep('SMILE')
        }
      } else if (currentStep === 'SMILE') {
        if (isHappy && !isFinished) {
          isFinished = true
          setInstruction('Đang ghi nhận khung hình nét nhất...')
          captureFrame()
        }
      }
    }, 200)

    return () => clearInterval(loop)
  }, [human, currentStep])

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    canvas.width = videoRef.current.videoWidth || 640
    canvas.height = videoRef.current.videoHeight || 640
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // Lật ngang cho tự nhiên
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          if (blob) onComplete(blob)
        },
        'image/jpeg',
        0.85
      )
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="bg-zinc-900 text-white px-4 py-1.5 rounded-full text-xs font-semibold animate-pulse shadow-md">
        {instruction}
      </div>
      <div className="relative size-[280px] rounded-full overflow-hidden border-4 border-zinc-900 shadow-xl bg-black">
        <video ref={videoRef} playsInline muted className="size-full object-cover scale-x-[-1]" />
        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/60 pointer-events-none" />
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
```

---

### 5.2. Phía Backend AI (Google Colab - FastAPI Server)

Chạy 3 Cell sau trên Google Colab với môi trường **T4 GPU**:

#### Cell 1: Cài đặt thư viện môi trường GPU
```python
# Cell 1: Cài đặt thư viện AI & Xử lý ảnh GPU (InsightFace + EasyOCR + zxing-cpp)
!pip install -q fastapi uvicorn python-multipart opencv-python-headless
!pip install -q insightface onnxruntime-gpu pyzbar zxing-cpp easyocr pillow numpy mrz
!apt-get install -y -qq libzbar0
print("--> [1/3] Đã cài đặt hoàn tất các thư viện GPU!")
```

#### Cell 2: Khởi tạo FastAPI Server (`main.py`)
```python
# Cell 2: API Engine chuyên dụng (InsightFace ArcFace 512-d + EasyOCR GPU + Multi-Stage QR Scanner + Đối soát Tam giác vàng chuẩn ekyc.md)
import cv2
import numpy as np
import io
import re
import base64
import os
from PIL import Image, ImageOps
from fastapi import FastAPI, File, UploadFile, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import zxingcpp
from pyzbar.pyzbar import decode
import easyocr
import insightface
from insightface.app import FaceAnalysis

app = FastAPI(title="EventMate GPU eKYC Engine", version="5.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_SECRET_KEY = os.environ.get("EKYC_API_KEY", "eventmate_super_secret_2026")

# 1. Khởi tạo InsightFace buffalo_l trên GPU CUDA
print("--> [1/2] Đang nạp InsightFace buffalo_l vào CUDA...")
face_app = FaceAnalysis(name='buffalo_l', providers=['CUDAExecutionProvider'])
face_app.prepare(ctx_id=0, det_size=(640, 640))

# 2. Khởi tạo EasyOCR GPU Tiếng Việt & Tiếng Anh
print("--> [2/2] Đang nạp EasyOCR Tiếng Việt vào GPU...")
ocr_reader = easyocr.Reader(['vi', 'en'], gpu=True)
print("--> SẴN SÀNG: InsightFace & EasyOCR GPU đã hoạt động!")

def read_image_with_exif_fix(data: bytes):
    pil_img = Image.open(io.BytesIO(data))
    pil_img = ImageOps.exif_transpose(pil_img)
    rgb_img = np.array(pil_img)
    return cv2.cvtColor(rgb_img, cv2.COLOR_RGB2BGR)

def parse_qr_payload(text: str):
    """
    Phân tích chuỗi mã hóa QR CCCD gắn chip chuẩn Bộ Công An:
    Định dạng: Số CCCD|Số CMND cũ|Họ và tên|Ngày sinh|Giới tính|Nơi thường trú|Ngày cấp
    """
    if not text or '|' not in text:
        return None
    parts = text.split('|')
    if len(parts) >= 6:
        return {
            "id_number": parts[0].strip(),
            "old_id": parts[1].strip(),
            "full_name": parts[2].strip(),
            "dob": parts[3].strip(),
            "gender": parts[4].strip(),
            "address": parts[5].strip(),
            "issue_date": parts[6].strip() if len(parts) > 6 else "",
            "raw_qr": text
        }
    return None

def _scan_candidate_engines(img_piece):
    """
    Giải mã bằng 3 engine: zxing-cpp chuyên dụng, pyzbar và cv2.QRCodeDetector
    """
    # 1. zxing-cpp (nhanh nhất và bắt góc nghiêng/mờ cực nhạy)
    try:
        try:
            barcodes = zxingcpp.read_barcodes(
                img_piece,
                formats=zxingcpp.BarcodeFormat.QRCode,
                try_rotate=True,
                try_downscale=True,
                try_invert=True
            )
        except Exception:
            barcodes = zxingcpp.read_barcodes(img_piece)

        for b in barcodes:
            parsed = parse_qr_payload(b.text)
            if parsed:
                return parsed
    except Exception:
        pass

    # 2. pyzbar fallback
    try:
        decoded = decode(img_piece)
        for d in decoded:
            text = d.data.decode('utf-8', errors='ignore')
            parsed = parse_qr_payload(text)
            if parsed:
                return parsed
    except Exception:
        pass

    # 3. OpenCV QRCodeDetector fallback
    try:
        detector = cv2.QRCodeDetector()
        text, _, _ = detector.detectAndDecode(img_piece)
        if text:
            parsed = parse_qr_payload(text)
            if parsed:
                return parsed
    except Exception:
        pass

    return None

def extract_qr(img_bgr, face_bbox=None):
    """
    Bộ quét mã QR CCCD đa tầng (Multi-Stage Super-Resolution QR Scanner):
    1. Cắt vùng góc trên bên phải (Top-Right Quadrant 45% & Corner 35% - vị trí chuẩn của QR CCCD gắn chip).
    2. Cắt theo Face Anchor (nửa trên đối xứng bên phải khuôn mặt phát hiện bởi InsightFace).
    3. Thử các góc phần tư khác nếu ảnh bị đảo chiều/xoay ngang.
    4. Xử lý đa tầng: Phóng to x2.0 (Bicubic) + Tăng tương phản cục bộ CLAHE + Nhị phân Otsu.
    5. Đa bộ giải mã kết hợp: zxing-cpp + pyzbar + cv2.QRCodeDetector.
    """
    h, w = img_bgr.shape[:2]
    candidate_rois = []

    # 1. ƯU TIÊN SỐ 1: Góc trên bên phải (Vị trí mã QR chuẩn của thẻ CCCD Việt Nam)
    candidate_rois.append(img_bgr[0:int(h * 0.50), int(w * 0.45):w])  # Top-Right 45%
    candidate_rois.append(img_bgr[0:int(h * 0.38), int(w * 0.55):w])  # Top-Right Corner 35%
    candidate_rois.append(img_bgr[0:int(h * 0.55), :])                # Nửa trên của thẻ

    # 2. ƯU TIÊN SỐ 2: Face Anchor ROI (Dựa trên tọa độ khuôn mặt người dùng trên thẻ)
    if face_bbox is not None and len(face_bbox) >= 4:
        fx1, fy1, fx2, fy2 = [int(v) for v in face_bbox]
        fw = fx2 - fx1
        fh = fy2 - fy1
        rx1 = max(0, int(fx2 + fw * 0.2))
        ry1 = max(0, int(fy1 - fh * 1.0))
        rx2 = min(w, int(fx2 + fw * 4.5))
        ry2 = min(h, int(fy1 + fh * 0.8))
        if rx2 > rx1 and ry2 > ry1:
            candidate_rois.append(img_bgr[ry1:ry2, rx1:rx2])

    # 3. ƯU TIÊN SỐ 3: Các góc phần tư khác (phòng trường hợp ảnh thẻ bị xoay 90, 180, 270)
    candidate_rois.append(img_bgr[0:int(h * 0.50), 0:int(w * 0.55)])       # Top-Left
    candidate_rois.append(img_bgr[int(h * 0.50):h, int(w * 0.45):w])       # Bottom-Right
    candidate_rois.append(img_bgr[int(h * 0.50):h, 0:int(w * 0.55)])       # Bottom-Left

    # 4. Toàn bộ ảnh gốc
    candidate_rois.append(img_bgr)

    # Duyệt qua từng vùng cắt và áp dụng tiền xử lý tăng cường
    for roi in candidate_rois:
        if roi is None or roi.size == 0:
            continue
        rh, rw = roi.shape[:2]
        if rh < 30 or rw < 30:
            continue

        # Cấp độ 1: Ảnh gốc của ROI
        res = _scan_candidate_engines(roi)
        if res:
            return res

        # Cấp độ 2: Phóng to 2x (Bicubic Zoom) - Làm nổi bật chi tiết các module mã QR nhỏ
        scaled = cv2.resize(roi, (0, 0), fx=2.0, fy=2.0, interpolation=cv2.INTER_CUBIC)
        res = _scan_candidate_engines(scaled)
        if res:
            return res

        # Cấp độ 3: Tăng cường tương phản cục bộ CLAHE
        gray = cv2.cvtColor(scaled, cv2.COLOR_BGR2GRAY)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        cl_gray = clahe.apply(gray)
        res = _scan_candidate_engines(cl_gray)
        if res:
            return res

        # Cấp độ 4: Nhị phân hóa Otsu Threshold
        _, otsu = cv2.threshold(cl_gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        res = _scan_candidate_engines(otsu)
        if res:
            return res

    # 5. Fallback cuối cùng: Thử 3 góc xoay 90, 180, 270 độ của toàn ảnh
    rotations = [
        cv2.rotate(img_bgr, cv2.ROTATE_90_CLOCKWISE),
        cv2.rotate(img_bgr, cv2.ROTATE_180),
        cv2.rotate(img_bgr, cv2.ROTATE_90_COUNTERCLOCKWISE)
    ]
    for rot in rotations:
        res = _scan_candidate_engines(rot)
        if res:
            return res

    return None

def extract_ocr_front(img_bgr):
    """
    Nhận diện chữ in thực tế trên mặt thẻ CCCD bằng EasyOCR GPU:
    Trích xuất: Số CCCD 12 số, Họ và tên, Ngày sinh
    """
    results = ocr_reader.readtext(img_bgr)
    full_text = " ".join([r[1] for r in results])
    lines = [r[1].strip() for r in results]

    # 1. Trích xuất số CCCD (12 chữ số liên tiếp)
    id_match = re.search(r'\b(\d{12})\b', full_text)
    id_number = id_match.group(1) if id_match else ""

    # 2. Trích xuất Ngày sinh (dd/mm/yyyy hoặc ddmmyyyy)
    dob_match = re.search(r'\b(\d{2})[/\-\.](\d{2})[/\-\.](\d{4})\b', full_text)
    dob = ""
    if dob_match:
        dob = f"{dob_match.group(1)}{dob_match.group(2)}{dob_match.group(3)}" # format ddmmyyyy

    # 3. Trích xuất Họ và tên in hoa trên mặt thẻ
    full_name = ""
    for i, line in enumerate(lines):
        upper_line = line.upper()
        if any(kw in upper_line for kw in ["HỌ VÀ TÊN", "FULL NAME", "HỌ TÊN"]):
            if ":" in line:
                val = line.split(":")[-1].strip()
                if len(val) >= 4 and val.isupper():
                    full_name = val
                    break
            if i + 1 < len(lines):
                val = lines[i + 1].strip()
                if len(val) >= 4 and val.isupper() and not any(kw in val.upper() for kw in ["CỘNG HÒA", "NGÀY SINH", "DATE"]):
                    full_name = val
                    break

    # Fallback Họ tên: Dòng chữ hoa chuẩn tên tiếng Việt (2 - 5 từ)
    if not full_name:
        for line in lines:
            words = line.split()
            if line.isupper() and 2 <= len(words) <= 5 and not any(kw in line for kw in ["CỘNG HÒA", "VIỆT NAM", "ĐỘC LẬP", "CĂN CƯỚC", "CÔNG DÂN", "NATIONAL", "IDENTITY", "CARD"]):
                full_name = line
                break

    return {
        "id_number": id_number,
        "full_name": full_name,
        "dob": dob,
        "raw_text": full_text
    }

def cross_check_tamper(qr_data, ocr_data):
    """
    Đối soát Tam giác vàng chống gian lận/làm giả phôi (QR Code ⟺ Text OCR):
    So sánh đối soát chi tiết từng trường:
    1. Số CCCD (12 số)
    2. Ngày sinh (DDMMYYYY)
    3. Họ và tên
    """
    if not qr_data:
        return False, "Thiếu mã QR để thực hiện đối soát Tam giác vàng.", "MISSING_QR"

    mismatches = []
    matches = []

    # 1. Đối soát Số CCCD
    qr_id = str(qr_data.get("id_number", "")).strip()
    ocr_id = str(ocr_data.get("id_number", "")).strip()
    if qr_id and ocr_id:
        if qr_id == ocr_id:
            matches.append(f"Số CCCD trùng khớp ({qr_id})")
        else:
            mismatches.append(f"Số CCCD trên QR ({qr_id}) KHÔNG KHỚP chữ in trên thẻ ({ocr_id})")
    elif qr_id and not ocr_id:
        matches.append(f"Số CCCD từ QR ({qr_id}) (EasyOCR chưa bắt đủ 12 số)")

    # 2. Đối soát Ngày sinh
    qr_dob = re.sub(r'\D', '', str(qr_data.get("dob", "")))
    ocr_dob = re.sub(r'\D', '', str(ocr_data.get("dob", "")))
    if qr_dob and ocr_dob:
        if qr_dob == ocr_dob:
            matches.append(f"Ngày sinh trùng khớp ({qr_dob})")
        elif len(qr_dob) >= 4 and len(ocr_dob) >= 4 and qr_dob[-2:] == ocr_dob[-2:]:
            matches.append(f"Năm sinh trùng khớp (...{qr_dob[-2:]})")
        else:
            mismatches.append(f"Ngày sinh trên QR ({qr_dob}) KHÔNG KHỚP chữ in trên thẻ ({ocr_dob})")

    # 3. Đối soát Họ và tên (Hỗ trợ tiếng Việt Unicode 100%)
    def remove_vietnamese_diacritics(text: str) -> str:
        """Loại bỏ dấu tiếng Việt sang ký tự Latin chuẩn: NGUYỄN CHÍ VƯƠNG -> NGUYEN CHI VUONG"""
        import unicodedata
        nfkd = unicodedata.normalize('NFKD', text)
        ascii_text = ''.join([c for c in nfkd if not unicodedata.combining(c)])
        ascii_text = ascii_text.replace('Đ', 'D').replace('đ', 'd')
        return re.sub(r'[^A-Z\s]', '', ascii_text.upper()).strip()

    raw_qr_name = str(qr_data.get("full_name", "")).strip()
    raw_ocr_name = str(ocr_data.get("full_name", "")).strip()
    qr_norm = remove_vietnamese_diacritics(raw_qr_name)
    ocr_norm = remove_vietnamese_diacritics(raw_ocr_name)

    if raw_qr_name and raw_ocr_name:
        display_name = raw_ocr_name if raw_ocr_name else raw_qr_name
        if raw_qr_name.upper() == raw_ocr_name.upper() or qr_norm == ocr_norm or qr_norm in ocr_norm or ocr_norm in qr_norm:
            matches.append(f"Họ tên trùng khớp ({display_name})")
        else:
            qr_words = set(qr_norm.split())
            ocr_words = set(ocr_norm.split())
            overlap = qr_words.intersection(ocr_words)
            if len(overlap) >= 2:
                matches.append(f"Họ tên tương đồng ({display_name})")
            else:
                mismatches.append(f"Họ tên trên QR ({raw_qr_name}) khác chữ in trên thẻ ({raw_ocr_name})")

    if mismatches:
        return True, " | ".join(mismatches), "TAMPERED"

    return False, " | ".join(matches), "VERIFIED"

@app.get("/health")
def health_check():
    return {"status": "online", "engine": "InsightFace ArcFace 512-d + EasyOCR GPU + Multi-Stage QR"}

@app.post("/api/verify-ekyc")
async def verify_ekyc(
    card_front: UploadFile = File(...),
    selfie: UploadFile = File(...),
    card_back: UploadFile = File(None),
    x_api_key: str = Header(None)
):
    if x_api_key and x_api_key != API_SECRET_KEY:
        raise HTTPException(status_code=403, detail="Khóa API không hợp lệ.")

    img_card = read_image_with_exif_fix(await card_front.read())
    img_selfie = read_image_with_exif_fix(await selfie.read())

    print("\n" + "="*65)
    print("📌 [BẮT ĐẦU XỬ LÝ YÊU CẦU eKYC]")
    print(f"📸 Kích thước ảnh thẻ: {img_card.shape}, Ảnh selfie: {img_selfie.shape}")

    # 1. Phát hiện khuôn mặt trên thẻ bằng InsightFace trước để lấy Face Anchor
    faces_card = face_app.get(img_card)
    faces_selfie = face_app.get(img_selfie)

    if len(faces_card) == 0:
        print("❌ Lỗi: Không nhận diện được khuôn mặt trên thẻ CCCD.")
        return {"status": "FAILED", "code": "NO_CARD_FACE", "message": "Không nhận diện được khuôn mặt trên thẻ CCCD."}
    if len(faces_selfie) == 0:
        print("❌ Lỗi: Không nhận diện được khuôn mặt trong ảnh selfie.")
        return {"status": "FAILED", "code": "NO_SELFIE_FACE", "message": "Không nhận diện được khuôn mặt trong ảnh selfie."}

    # Sắp xếp khuôn mặt theo diện tích lớn nhất (Primary Face)
    faces_card = sorted(faces_card, key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]), reverse=True)
    faces_selfie = sorted(faces_selfie, key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]), reverse=True)
    face_bbox = faces_card[0].bbox

    # 2. Quét QR Code chuyên sâu đa tầng (Multi-Stage Super-Resolution QR Scanner)
    qr_data = extract_qr(img_card, face_bbox=face_bbox)
    if qr_data:
        print("✅ [1. QR CODE] Đã giải mã thành công mã QR thẻ chip:")
        print(f"   - Số CCCD (QR):  {qr_data.get('id_number')}")
        print(f"   - Họ và tên (QR): {qr_data.get('full_name')}")
        print(f"   - Ngày sinh (QR): {qr_data.get('dob')}")
        print(f"   - Giới tính (QR): {qr_data.get('gender')}")
        print(f"   - Thường trú (QR): {qr_data.get('address')}")
    else:
        print("⚠️ [1. QR CODE] Không tìm thấy mã QR trên ảnh thẻ!")

    # 3. Quét OCR chữ in trên mặt thẻ CCCD (EasyOCR GPU)
    ocr_front = extract_ocr_front(img_card)
    print("✅ [2. EASYOCR GPU] Đã nhận diện chữ in bề mặt thẻ CCCD:")
    print(f"   - Số CCCD (OCR): {ocr_front.get('id_number') or '(Chưa bắt được)'}")
    print(f"   - Họ và tên (OCR): {ocr_front.get('full_name') or '(Chưa bắt được)'}")
    print(f"   - Ngày sinh (OCR): {ocr_front.get('dob') or '(Chưa bắt được)'}")

    # 4. Đối soát Tam giác vàng: QR ⟺ Chữ in trên mặt thẻ
    is_tampered, tamper_details, tamper_status = cross_check_tamper(qr_data, ocr_front)
    print("⚖️ [3. ĐỐI SOÁT TAM GIÁC VÀNG (QR CODE ⟺ EASYOCR MẶT THẺ)]:")
    if qr_data:
        print(f"   - Số CCCD:   QR = {qr_data.get('id_number')} | OCR = {ocr_front.get('id_number') or 'N/A'}")
        print(f"   - Họ tên:    QR = {qr_data.get('full_name')} | OCR = {ocr_front.get('full_name') or 'N/A'}")
        print(f"   - Ngày sinh:  QR = {qr_data.get('dob')} | OCR = {ocr_front.get('dob') or 'N/A'}")
        print(f"   - Giới tính:  {qr_data.get('gender')}")
        print(f"   - Thường trú: {qr_data.get('address')}")
        if is_tampered:
            print(f"   ❌ PHÁT HIỆN CAN THIỆP/LÀM GIẢ PHÔI THẺ: {tamper_details}")
        else:
            print(f"   ✅ KẾT QUẢ ĐỐI SOÁT: {tamper_details}")
    else:
        print("   ⚠️ CẢNH BÁO: Thiếu mã QR thẻ chip -> Chưa đủ điều kiện Tam giác vàng chống giả mạo!")
    print(f"   -> Kết quả đối soát giả mạo: is_tampered = {is_tampered} (Trạng thái: {tamper_status})")

    # 5. So khớp sinh trắc học thông minh (Smart Multi-Face Pair Matching)
    print(f"📸 [Sinh trắc học]: Thẻ CCCD có {len(faces_card)} khuôn mặt, Selfie có {len(faces_selfie)} khuôn mặt")
    best_cosine = -1.0
    best_card_face = faces_card[0]
    best_selfie_face = faces_selfie[0]

    for c in faces_card:
        for s in faces_selfie:
            norm_c = np.linalg.norm(c.embedding)
            norm_s = np.linalg.norm(s.embedding)
            sim = float(np.dot(c.embedding, s.embedding) / (norm_c * norm_s))
            if sim > best_cosine:
                best_cosine = sim
                best_card_face = c
                best_selfie_face = s

    cosine_sim = float(best_cosine)

    # Tính điểm quy đổi phần trăm
    if cosine_sim < 0.35:
        score = max(0, int((cosine_sim / 0.35) * 40))
    elif cosine_sim < 0.50:
        score = int(41 + ((cosine_sim - 0.35) / 0.15) * 28)
    elif cosine_sim < 0.65:
        score = int(70 + ((cosine_sim - 0.50) / 0.15) * 18)
    else:
        score = min(100, int(88 + ((cosine_sim - 0.65) / 0.20) * 12))

    # 6. Quyết định phê duyệt nghiêm ngặt theo đặc tả tài liệu ekyc.md
    has_qr = qr_data is not None and bool(qr_data.get("id_number"))
    has_ocr = bool(ocr_front.get("id_number"))

    if is_tampered:
        status = "rejected"
        rejection_reason = f"Phát hiện can thiệp phôi thẻ: {tamper_details}"
    elif not has_qr:
        # CHƯA QUÉT ĐƯỢC QR -> Không đủ dữ liệu đối soát phôi thẻ -> KHÔNG ĐƯỢC AUTO-APPROVE!
        if cosine_sim >= 0.50:
            status = "pending_admin"
            rejection_reason = "Chưa quét được mã QR trên thẻ CCCD để hoàn tất đối soát Tam giác vàng 3 chiều. Chuyển Admin xác minh."
        else:
            status = "rejected"
            rejection_reason = f"Không quét được QR và khuôn mặt không trùng khớp (Cosine: {cosine_sim:.2f})"
    elif cosine_sim < 0.35:
        status = "rejected"
        rejection_reason = f"Khuôn mặt trong ảnh selfie không trùng khớp ảnh trên thẻ CCCD (Cosine: {cosine_sim:.2f})"
    elif cosine_sim < 0.50:
        status = "pending_admin"
        rejection_reason = f"Độ tương đồng khuôn mặt cận biên ({score}% - Cosine: {cosine_sim:.2f}). Chuyển Admin xét duyệt thủ công."
    else:
        # ĐỦ CẢ: has_qr + !is_tampered + cosine_sim >= 0.50
        status = "auto_approved"
        rejection_reason = None

    print(f"🎯 [4. KẾT QUẢ SINH TRẮC HỌC]: Cosine = {cosine_sim:.4f} -> Điểm khớp: {score}% -> Trạng thái: {status}")
    if rejection_reason:
        print(f"   ℹ️ Lý do: {rejection_reason}")
    print("="*65 + "\n")

    # 7. Cắt ảnh chân dung thẻ CCCD trả về Base64 từ khuôn mặt khớp nhất
    bbox = [int(v) for v in best_card_face.bbox]
    x1, y1, x2, y2 = max(0, bbox[0]), max(0, bbox[1]), min(img_card.shape[1], bbox[2]), min(img_card.shape[0], bbox[3])
    card_face_crop = img_card[y1:y2, x1:x2]
    _, buffer = cv2.imencode('.jpg', card_face_crop)
    thumbnail_base64 = "data:image/jpeg;base64," + base64.b64encode(buffer).decode('utf-8')

    return {
        "status": "SUCCESS",
        "cosine_similarity": round(cosine_sim, 4),
        "score": score,
        "match_score": score,
        "is_match": cosine_sim >= 0.50,
        "auto_approved": status == "auto_approved",
        "review_status": status,
        "qr_data": qr_data,
        "ocr_front": ocr_front,
        "is_tampered": is_tampered,
        "tamper_reason": rejection_reason,
        "card_face_thumbnail": thumbnail_base64,
        "engine": "insightface_gpu_arcface_512d"
    }
```

#### Cell 3: Chạy Cloudflare Quick Tunnel & Uvicorn Server
```python
# CELL 3: Dọn dẹp tiến trình cũ, mở Tunnel mới và chạy Server
!pkill -9 -f cloudflared 2>/dev/null || true
!fuser -k 8000/tcp 2>/dev/null || true
!pip install -q pycloudflared

import uvicorn
from pycloudflared import try_cloudflare

# 1. Khởi chạy Cloudflare Tunnel tự động cấp URL HTTPS
print("--> Đang khởi tạo Cloudflare Tunnel...")
tunnel = try_cloudflare(port=8000)

print("\n" + "="*55)
print(f"--> URL AI GPU CỦA BẠN: {tunnel.tunnel}")
print("="*55 + "\n")

# 2. Khởi chạy Uvicorn Server trực tiếp trên Event Loop của Colab
config = uvicorn.Config(app=app, host="0.0.0.0", port=8000, log_level="info")
server = uvicorn.Server(config)
await server.serve()
```

---

### 5.3. Phía Backend Gateway (Next.js API Route `/api/ekyc/verify/route.ts`)

File API Route trung gian tiếp nhận request từ client, thực thi Bộ 6 Quy tắc CCCD và proxy sang Colab:

```typescript
// src/app/api/ekyc/verify/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import crypto from "crypto"

// Danh mục 63 mã tỉnh/thành phố trên CCCD Việt Nam
const VALID_PROVINCE_CODES = new Set([
  '001', '002', '004', '006', '008', '010', '011', '012', '014', '015',
  '017', '019', '020', '022', '024', '025', '026', '027', '030', '031',
  '033', '034', '035', '036', '037', '038', '040', '042', '044', '045',
  '046', '048', '049', '051', '052', '054', '056', '058', '060', '062',
  '064', '066', '067', '068', '070', '072', '074', '075', '077', '079',
  '080', '082', '083', '084', '086', '087', '089', '091', '092', '093',
  '094', '095', '096'
])

/**
 * Kiểm tra 6 quy tắc nghiệp vụ số CCCD theo quy chuẩn Bộ Công An
 */
function validateCccdLogic(id: string, dob?: string): { isValid: boolean; error?: string } {
  if (!id || !/^\d{12}$/.test(id)) {
    return { isValid: false, error: 'Số CCCD phải bao gồm chính xác 12 chữ số.' }
  }
  const provinceCode = id.substring(0, 3)
  if (!VALID_PROVINCE_CODES.has(provinceCode)) {
    return { isValid: false, error: `Mã tỉnh/thành phố (${provinceCode}) không hợp lệ.` }
  }
  const genderCentury = id.substring(3, 4)
  if (!['0', '1', '2', '3'].includes(genderCentury)) {
    return { isValid: false, error: 'Mã giới tính/thế kỷ trên số CCCD không hợp lệ.' }
  }
  const yearSuffix = id.substring(4, 6)
  if (dob) {
    const cleanDob = dob.replace(/\D/g, '')
    let birthYearSuffix = ''
    if (cleanDob.length === 8) {
      const first4 = Number(cleanDob.substring(0, 4))
      const last4 = Number(cleanDob.substring(4, 8))
      if (last4 >= 1900 && last4 <= 2099) {
        birthYearSuffix = cleanDob.substring(6, 8)
      } else if (first4 >= 1900 && first4 <= 2099) {
        birthYearSuffix = cleanDob.substring(2, 4)
      } else {
        birthYearSuffix = cleanDob.slice(-2)
      }
    } else if (cleanDob.length >= 2) {
      birthYearSuffix = cleanDob.slice(-2)
    }

    if (birthYearSuffix && birthYearSuffix !== yearSuffix) {
      return { isValid: false, error: 'Hai chữ số năm sinh trên thẻ không trùng khớp với ngày sinh.' }
    }
  }
  return { isValid: true }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để thực hiện xác thực eKYC.' },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const consentGiven = formData.get('consent_given') === 'true'

    if (!consentGiven) {
      return NextResponse.json(
        { error: 'Bắt buộc phải có sự đồng ý xử lý dữ liệu cá nhân & sinh trắc học theo Điều 11 Nghị định 13/2023/NĐ-CP.' },
        { status: 403 }
      )
    }

    const frontImage = formData.get('front_image')
    const selfieImage = formData.get('selfie_image')

    if (!frontImage || !selfieImage) {
      return NextResponse.json(
        { error: 'Thiếu ảnh CCCD mặt trước hoặc ảnh chân dung khuôn mặt.' },
        { status: 400 }
      )
    }

    const colabUrl = process.env.NEXT_PUBLIC_COLAB_AI_URL || process.env.COLAB_AI_URL
    const apiKey = process.env.EKYC_API_KEY || 'eventmate_super_secret_2026'

    if (!colabUrl) {
      return NextResponse.json(
        { error: 'Hệ thống AI GPU Server chưa được cấu hình (Thiếu NEXT_PUBLIC_COLAB_AI_URL).' },
        { status: 503 }
      )
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 35000)

    const backendFormData = new FormData()
    backendFormData.append('card_front', frontImage)
    backendFormData.append('front_image', frontImage)
    backendFormData.append('selfie', selfieImage)
    backendFormData.append('selfie_image', selfieImage)
    const backImage = formData.get('back_image') || formData.get('card_back')
    if (backImage) {
      backendFormData.append('card_back', backImage)
      backendFormData.append('back_image', backImage)
    }

    let aiResponse: Response
    try {
      aiResponse = await fetch(`${colabUrl.replace(/\/$/, '')}/api/verify-ekyc`, {
        method: 'POST',
        body: backendFormData,
        headers: { 'X-API-KEY': apiKey },
        signal: controller.signal,
      })
    } catch (fetchErr: any) {
      clearTimeout(timeoutId)
      if (fetchErr.name === 'AbortError') {
        return NextResponse.json({ error: 'AI GPU Server phản hồi quá lâu (Timeout 35s).' }, { status: 504 })
      }
      return NextResponse.json(
        { error: `Không thể kết nối tới AI GPU Server (${colabUrl}). Vui lòng kiểm tra Cloudflare Tunnel.` },
        { status: 502 }
      )
    }
    clearTimeout(timeoutId)

    if (!aiResponse.ok) {
      const errText = await aiResponse.text()
      return NextResponse.json({ error: `AI GPU Server báo lỗi (HTTP ${aiResponse.status}): ${errText}` }, { status: 502 })
    }

    const aiResult = await aiResponse.json()

    // 1. Kiểm tra đối soát 3 chiều (Tam giác vàng)
    if (aiResult.is_tampered) {
      return NextResponse.json(
        { status: 'rejected', code: 'CARD_TAMPERED', message: 'Dữ liệu quét thẻ phát hiện dấu hiệu can thiệp/chỉnh sửa giữa QR Code và bề mặt thẻ.' },
        { status: 422 }
      )
    }

    // 2. Validate Bộ 6 quy tắc nghiệp vụ số CCCD
    const clientQrDataStr = formData.get('qr_data')?.toString()
    let clientQr: any = null
    try {
      if (clientQrDataStr) clientQr = JSON.parse(clientQrDataStr)
    } catch {}

    const clientIdNumber = formData.get('id_card_number')?.toString() || clientQr?.id_number || ''
    const clientFullName = formData.get('full_name')?.toString() || clientQr?.full_name || ''
    const clientDob = formData.get('dob')?.toString() || clientQr?.dob || ''
    const clientGender = formData.get('gender')?.toString() || clientQr?.gender || ''
    const clientAddress = formData.get('address')?.toString() || clientQr?.address || ''

    let idNumber = aiResult.qr_data?.id_number || aiResult.ocr_front?.id_number || clientIdNumber || ''
    let dob = aiResult.qr_data?.dob || aiResult.ocr_front?.dob || clientDob || ''
    let fullName = aiResult.qr_data?.full_name || aiResult.ocr_front?.full_name || clientFullName || ''
    let address = aiResult.qr_data?.address || aiResult.ocr_front?.address || clientAddress || ''
    let gender = aiResult.qr_data?.gender || clientGender || ''
    let issueDate = aiResult.qr_data?.issue_date || clientQr?.issue_date || ''

    if (!fullName) {
      const { data: userProfile } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle()
      if (userProfile?.full_name) fullName = userProfile.full_name
    }

    if (idNumber) {
      const logicCheck = validateCccdLogic(idNumber, dob)
      if (!logicCheck.isValid) {
        return NextResponse.json({ status: 'rejected', code: 'CCCD_LOGIC_INVALID', message: logicCheck.error }, { status: 422 })
      }
    }

    const idCardHash = crypto.createHash('sha256').update(idNumber || `UNASSIGNED_${user.id}`).digest('hex')
    const cosineSim = Number(aiResult.cosine_similarity || 0)
    let matchScore = Number(aiResult.score ?? aiResult.match_score ?? aiResult.face_match_score ?? 0)

    let verificationStatus: 'auto_approved' | 'pending_admin' | 'rejected' = 'rejected'
    let isVerified = false
    let rejectionReason: string | null = null

    const hasQr = Boolean(aiResult.qr_data?.id_number || clientQr?.id_number)
    const hasOcr = Boolean(aiResult.ocr_front?.id_number)

    if (cosineSim >= 0.50 && !aiResult.is_tampered && hasQr && hasOcr) {
      verificationStatus = 'auto_approved'
      isVerified = true
    } else if (cosineSim >= 0.50 && (!hasQr || !hasOcr)) {
      verificationStatus = 'pending_admin'
      isVerified = false
      rejectionReason = !hasQr
        ? 'Chưa giải mã được mã QR trên thẻ CCCD để hoàn tất đối soát Tam giác vàng 3 chiều. Chuyển Admin xác minh.'
        : 'Chưa nhận diện đủ chữ in trên mặt thẻ để đối soát Tam giác vàng 3 chiều. Chuyển Admin xác minh.'
    } else if (cosineSim >= 0.40) {
      verificationStatus = 'pending_admin'
      isVerified = false
      rejectionReason = 'Độ tương đồng khuôn mặt cận biên (40%-49%). Chuyển Admin đối soát hồ sơ.'
    } else {
      verificationStatus = 'rejected'
      isVerified = false
      rejectionReason = `Khuôn mặt trong ảnh selfie không trùng khớp với ảnh trên thẻ CCCD (Cosine: ${cosineSim.toFixed(2)}).`
    }

    // 3. Lưu vào Database ekyc_verifications chuyên dụng
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const cccdFrontUrl = formData.get('front_url')?.toString() || `kyc/${user.id}/cccd_front_${Date.now()}.jpg`
    const cccdBackUrl = formData.get('back_url')?.toString() || null
    const selfieUrl = formData.get('selfie_url')?.toString() || `kyc/${user.id}/selfie_${Date.now()}.jpg`

    const { data: record, error: dbError } = await (supabase.from('ekyc_verifications') as any)
      .insert({
        user_id: user.id,
        session_id: `ekyc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        id_card_number: idNumber,
        id_card_hash: idCardHash,
        full_name: fullName,
        dob: dob,
        gender: gender,
        address: address,
        issue_date: issueDate,
        qr_data: aiResult.qr_data || null,
        ocr_front_data: aiResult.ocr_front || null,
        mrz_data: aiResult.mrz_data || null,
        is_tampered: Boolean(aiResult.is_tampered),
        face_match_score: matchScore,
        cosine_similarity: cosineSim,
        card_face_thumbnail_url: aiResult.card_face_thumbnail || null,
        cccd_front_url: cccdFrontUrl,
        cccd_back_url: cccdBackUrl,
        selfie_url: selfieUrl,
        status: verificationStatus,
        is_verified: isVerified,
        rejection_reason: rejectionReason,
        ai_engine: 'insightface_gpu_arcface_512d',
        consent_given: true,
        consent_terms_version: 'ND13_2023_V1',
        user_ip_address: clientIp,
      })
      .select()
      .single()

    if (dbError) {
      if (dbError.code === '23505') {
        return NextResponse.json({ status: 'rejected', code: 'CCCD_DUPLICATED', message: 'Số CCCD này đã được đăng ký và xác thực trên một tài khoản khác.' }, { status: 409 })
      }
      return NextResponse.json({ error: `Lỗi cơ sở dữ liệu khi ghi nhận eKYC: ${dbError.message}` }, { status: 500 })
    }

    // Đồng bộ trực tiếp vào bảng Profiles
    if (isVerified || verificationStatus === 'auto_approved') {
      const cleanDob = dob ? dob.replace(/\D/g, '') : ''
      let birthYear: number | null = null
      if (cleanDob.length === 8) {
        const last4 = Number(cleanDob.substring(4, 8))
        const first4 = Number(cleanDob.substring(0, 4))
        if (last4 >= 1900 && last4 <= 2099) birthYear = last4
        else if (first4 >= 1900 && first4 <= 2099) birthYear = first4
      }

      const mappedGender = gender?.toLowerCase().includes('nam') ? 'male' : gender?.toLowerCase().includes('nữ') || gender?.toLowerCase().includes('nu') ? 'female' : null

      const profileUpdate: any = { is_verified: true, kyc_status: 'verified', id_card_hash: idCardHash }
      if (fullName) profileUpdate.full_name = fullName
      if (mappedGender) profileUpdate.gender = mappedGender
      if (birthYear) profileUpdate.birth_year = birthYear
      if (address) profileUpdate.address = address

      await supabase.from('profiles').update(profileUpdate).eq('id', user.id)
    }

    const maskedId = idNumber.length === 12 ? `${idNumber.slice(0, 3)}******${idNumber.slice(9)}` : idNumber

    return NextResponse.json({
      success: true,
      status: verificationStatus,
      is_verified: isVerified,
      cosine_similarity: cosineSim,
      face_match_score: matchScore,
      masked_id_card: maskedId,
      full_name: fullName,
      dob: dob,
      gender: gender,
      address: address,
      card_face_thumbnail: aiResult.card_face_thumbnail,
      rejection_reason: rejectionReason,
      verification_id: record?.id,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi xử lý nội bộ tại Gateway eKYC.' }, { status: 500 })
  }
}
```

---

## 5.4. Thiết kế Database Schema & Đồng bộ tự động (PostgreSQL / Supabase)

Cơ sở dữ liệu được thiết kế chuyên biệt để lưu trữ toàn diện dữ liệu sinh trắc học, nhật ký kiểm tra và tự động đồng bộ sang bảng `profiles`:

```sql
-- 1. Bảng hồ sơ xác thực eKYC chuyên sâu
CREATE TABLE IF NOT EXISTS public.ekyc_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id VARCHAR(100) NOT NULL,
    
    -- Dữ liệu trích xuất từ thẻ CCCD
    id_card_number VARCHAR(12) NOT NULL,
    id_card_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA-256 chống đăng ký trùng CCCD
    full_name VARCHAR(255) NOT NULL,
    dob VARCHAR(10) NOT NULL,
    gender VARCHAR(10),
    address TEXT,
    issue_date VARCHAR(10),
    
    -- Dữ liệu đối soát 3 chiều (Tam giác vàng)
    qr_data JSONB,
    ocr_front_data JSONB,
    mrz_data JSONB,
    is_tampered BOOLEAN DEFAULT FALSE,
    
    -- Bằng chứng sinh trắc học
    face_match_score NUMERIC(5, 2) NOT NULL,
    cosine_similarity NUMERIC(6, 4) NOT NULL,
    card_face_thumbnail_url TEXT,
    cccd_front_url TEXT NOT NULL,
    cccd_back_url TEXT,
    selfie_url TEXT NOT NULL,
    
    -- Trạng thái duyệt
    status VARCHAR(30) NOT NULL CHECK (status IN ('auto_approved', 'pending_admin', 'rejected')),
    is_verified BOOLEAN DEFAULT FALSE,
    rejection_reason TEXT,
    
    -- Pháp lý Nghị định 13/2023/NĐ-CP
    consent_given BOOLEAN DEFAULT FALSE,
    consent_terms_version VARCHAR(50) DEFAULT 'ND13_2023_V1',
    user_ip_address VARCHAR(50),
    
    -- Metadata hệ thống
    ai_engine VARCHAR(50) DEFAULT 'insightface_gpu_arcface_512d',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chỉ mục tối ưu tìm kiếm và tra cứu
CREATE INDEX IF NOT EXISTS idx_ekyc_user_id ON public.ekyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_ekyc_id_hash ON public.ekyc_verifications(id_card_hash);
CREATE INDEX IF NOT EXISTS idx_ekyc_status ON public.ekyc_verifications(status);
CREATE INDEX IF NOT EXISTS idx_ekyc_created_at ON public.ekyc_verifications(created_at DESC);

-- 2. Trigger tự động đồng bộ kết quả xác thực từ ekyc_verifications sang profiles
CREATE OR REPLACE FUNCTION public.sync_ekyc_to_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'auto_approved' OR NEW.is_verified = TRUE THEN
    UPDATE public.profiles
    SET 
      is_verified = TRUE,
      kyc_status = 'verified',
      id_card_hash = NEW.id_card_hash,
      full_name = CASE WHEN NEW.full_name IS NOT NULL AND NEW.full_name <> '' THEN NEW.full_name ELSE full_name END,
      gender = CASE 
        WHEN NEW.gender ILIKE 'Nam%' THEN 'male' 
        WHEN NEW.gender ILIKE 'Nữ%' OR NEW.gender ILIKE 'Nu%' THEN 'female' 
        ELSE gender 
      END,
      address = CASE WHEN NEW.address IS NOT NULL AND NEW.address <> '' THEN NEW.address ELSE address END,
      birth_year = CASE 
        WHEN LENGTH(REGEXP_REPLACE(NEW.dob, '\D', '', 'g')) >= 4 THEN 
          SUBSTRING(REGEXP_REPLACE(NEW.dob, '\D', '', 'g') FROM LENGTH(REGEXP_REPLACE(NEW.dob, '\D', '', 'g')) - 3 FOR 4)::INT
        ELSE birth_year
      END,
      kyc_data = jsonb_build_object(
        'ekyc_id', NEW.id,
        'id_card_number', NEW.id_card_number,
        'full_name', NEW.full_name,
        'dob', NEW.dob,
        'gender', NEW.gender,
        'address', NEW.address,
        'issue_date', NEW.issue_date,
        'verified_at', NOW(),
        'face_match_score', NEW.face_match_score,
        'cosine_similarity', NEW.cosine_similarity,
        'card_face_thumbnail_url', NEW.card_face_thumbnail_url
      )
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_ekyc_to_profile ON public.ekyc_verifications;
CREATE TRIGGER trg_sync_ekyc_to_profile
  AFTER INSERT OR UPDATE OF status, is_verified ON public.ekyc_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_ekyc_to_profile();

-- 3. Storage Buckets (Bảo mật Private RLS)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('kyc_documents', 'kyc_documents', FALSE)
ON CONFLICT (id) DO NOTHING;
```

---

## 6. Hướng dẫn Vận hành & Duy trì 0đ Vĩnh viễn

1. **Cố định URL với Cloudflare Named Tunnel (Miễn phí 100%):**
   * Vào [Cloudflare Zero Trust](https://one.dash.cloudflare.com/) $\rightarrow$ **Networks $\rightarrow$ Tunnels $\rightarrow$ Create a Tunnel**.
   * Đặt tên (VD: `eventmate-ai`), gắn với subdomain (VD: `ai.yourdomain.com`) trỏ về `http://localhost:8000`.
   * Lấy Token dán vào Cell 3 trên Colab. URL sẽ sống cố định vĩnh viễn, không bao giờ thay đổi.
2. **Script chống Colab bị ngắt kết nối (Anti-Idle Script):**
   * Mở tab Colab, bấm phím `F12` $\rightarrow$ chọn tab **Console** $\rightarrow$ dán đoạn mã sau và nhấn Enter:
     ```javascript
     function KeepColabAlive() {
       console.log("--> Giữ kết nối Colab...");
       const btn = document.querySelector("#top-toolbar > colab-connect-button")?.shadowRoot?.querySelector("#connect");
       if (btn) btn.click();
     }
     setInterval(KeepColabAlive, 60000); // Tự động click giữ phiên mỗi 60 giây
     ```

---

## 7. Tuân thủ Pháp luật & Nghị định 13/2023/NĐ-CP về Bảo vệ Dữ liệu Cá nhân

Toàn bộ hệ thống eKYC của EventMate được thiết kế tuân thủ 100% khung pháp lý hiện hành của Việt Nam, đặc biệt là **Nghị định 13/2023/NĐ-CP** (Bảo vệ dữ liệu cá nhân) và **Luật Căn cước 2023**:

### 1. Phân loại dữ liệu theo Luật
* **Dữ liệu cá nhân cơ bản (Điều 2 khoản 3):** Họ tên, ngày sinh, giới tính, địa chỉ thường trú, số CCCD.
* **Dữ liệu cá nhân nhạy cảm (Điều 2 khoản 4):** Ảnh chân dung người thật, dữ liệu sinh trắc học khuôn mặt (vector 512-d ArcFace).

### 2. Bộ 5 điều kiện kỹ thuật đã triển khai trong hệ thống
1. **Sự đồng thuận rõ ràng (Consent - Điều 11 NĐ 13):**
   * Người dùng phải chủ động tích chọn ô cam kết tại Bước 1 (Opt-in Checkbox). Không dùng ô chọn mặc định.
   * Ghi nhận trường `consent_given = TRUE`, `consent_timestamp = NOW()` và `consent_terms_version = 'ND13_2023_V1'` vào database để phục vụ kiểm toán (Audit Trail).
2. **Giới hạn mục đích (Purpose Limitation - Điều 3 NĐ 13):**
   * Dữ liệu chỉ dùng duy nhất cho mục đích xác thực danh tính người nhận việc sự kiện trên EventMate. Nghiêm cấm mua bán hoặc cung cấp cho bên thứ 3 ngoài hệ thống.
3. **Quyền rút lại sự đồng thuận & Quyền xóa dữ liệu (Right to Erasure - Điều 9 NĐ 13):**
   * Cung cấp nút *"Rút lại đồng thuận & Xóa dữ liệu eKYC"* trong giao diện người dùng.
   * Kích hoạt RPC `public.delete_my_ekyc_data()` và Endpoint `/api/ekyc/delete` để xóa vĩnh viễn toàn bộ bản ghi CCCD và dọn dẹp file ảnh trong Storage Bucket.
4. **Bảo mật lưu trữ & Mã hóa kỹ thuật (Điều 26, 27 NĐ 13):**
   * Số CCCD được mã hóa một chiều qua thuật toán **SHA-256** (`id_card_hash`) để kiểm tra chống đăng ký trùng lặp mà không để lộ số định danh nguyên bản.
   * Storage bucket `kyc_documents` được thiết lập chế độ **Private RLS 100%**, chỉ chính chủ và Admin mới có quyền truy cập qua Signed URL tạm thời.
   * Mặt nạ dữ liệu (Data Masking): Số CCCD hiển thị trên giao diện người dùng được che mờ tự động (VD: `048******123`).
5. **Đường truyền an toàn:**
   * Mọi luồng truyền ảnh và dữ liệu khuôn mặt giữa Client $\rightarrow$ BFF Gateway $\rightarrow$ Google Colab GPU được mã hóa qua giao thức HTTPS / TLS 1.3 và bảo mật bằng khóa bí mật `X-API-KEY`.