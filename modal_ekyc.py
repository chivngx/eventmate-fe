import modal
import os

# 1. Định nghĩa ứng dụng Modal
app = modal.App("eventmate-ekyc")

# Hàm tải trước weights mô hình trong giai đoạn build Docker Image (giúp Container khởi động cực nhanh)
def download_model_weights():
    try:
        from insightface.app import FaceAnalysis
        print("--> [Build Step] Đang tải trước InsightFace buffalo_l...")
        fa = FaceAnalysis(name="buffalo_l", root="/root/.insightface")
        fa.prepare(ctx_id=-1, det_size=(640, 640))
    except Exception as e:
        print(f"Lưu ý khi tải trước InsightFace: {e}")

    try:
        import easyocr
        print("--> [Build Step] Đang tải trước EasyOCR Tiếng Việt & Anh...")
        easyocr.Reader(["vi", "en"], gpu=False, download_enabled=True)
    except Exception as e:
        print(f"Lưu ý khi tải trước EasyOCR: {e}")

# 2. Xây dựng môi trường Linux GPU tối ưu
ekyc_image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("libgl1", "libglib2.0-0", "libzbar0")
    .pip_install(
        "fastapi",
        "python-multipart",
        "opencv-python-headless",
        "insightface",
        "onnxruntime-gpu",
        "pyzbar",
        "zxing-cpp",
        "easyocr",
        "pillow",
        "numpy",
    )
    .run_function(download_model_weights)
)

# 3. Lớp dịch vụ Serverless AI Đỉnh cao (Nvidia T4 GPU - Dưới 1 giây, Siêu tiết kiệm)
@app.cls(
    image=ekyc_image,
    gpu="T4",             # Kích hoạt GPU Nvidia T4 chuyên dụng (tốc độ < 1 giây)
    timeout=120,
    scaledown_window=30,  # Tự động về 0 container sau 30s không có request để bảo toàn tối đa credit
)
class EkycEngine:
    @modal.enter()
    def setup_models(self):
        """Khởi tạo mô hình trực tiếp trong VRAM GPU Nvidia T4"""
        import warnings
        warnings.filterwarnings("ignore")

        import insightface
        from insightface.app import FaceAnalysis
        import easyocr

        print("--> [1/2] Đang nạp InsightFace buffalo_l vào Nvidia T4 GPU (CUDA)...")
        self.face_app = FaceAnalysis(
            name="buffalo_l",
            root="/root/.insightface",
            providers=["CUDAExecutionProvider", "CPUExecutionProvider"]
        )
        self.face_app.prepare(ctx_id=0, det_size=(640, 640))

        print("--> [2/2] Đang nạp EasyOCR Tiếng Việt vào GPU...")
        self.ocr_reader = easyocr.Reader(["vi", "en"], gpu=True)
        print("--> SẴN SÀNG: InsightFace & EasyOCR GPU T4 đã kích hoạt thành công!")

    @modal.asgi_app()
    def web(self):
        """Khởi tạo FastAPI Serverless Web Endpoint"""
        import warnings
        warnings.filterwarnings("ignore")

        import cv2
        import numpy as np
        import io
        import re
        import base64
        import unicodedata
        from PIL import Image, ImageOps
        from fastapi import FastAPI, File, UploadFile, Header, HTTPException
        from fastapi.middleware.cors import CORSMiddleware
        import zxingcpp
        from pyzbar.pyzbar import decode

        web_app = FastAPI(title="EventMate Serverless eKYC GPU Engine", version="5.0")

        web_app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        API_SECRET_KEY = os.environ.get("EKYC_API_KEY", "eventmate_super_secret_2026")

        def read_image_with_exif_fix(data: bytes):
            pil_img = Image.open(io.BytesIO(data))
            pil_img = ImageOps.exif_transpose(pil_img)
            rgb_img = np.array(pil_img)
            return cv2.cvtColor(rgb_img, cv2.COLOR_RGB2BGR)

        def parse_qr_payload(text: str):
            if not text or "|" not in text:
                return None
            parts = text.split("|")
            if len(parts) >= 6:
                return {
                    "id_number": parts[0].strip(),
                    "old_id": parts[1].strip(),
                    "full_name": parts[2].strip(),
                    "dob": parts[3].strip(),
                    "gender": parts[4].strip(),
                    "address": parts[5].strip(),
                    "issue_date": parts[6].strip() if len(parts) > 6 else "",
                    "raw_qr": text,
                }
            return None

        def scan_candidate_engines(img_piece):
            # 1. zxing-cpp
            try:
                try:
                    barcodes = zxingcpp.read_barcodes(
                        img_piece,
                        formats=zxingcpp.BarcodeFormat.QRCode,
                        try_rotate=True,
                        try_downscale=True,
                        try_invert=True,
                    )
                except Exception:
                    barcodes = zxingcpp.read_barcodes(img_piece)

                for b in barcodes:
                    parsed = parse_qr_payload(b.text)
                    if parsed:
                        return parsed
            except Exception:
                pass

            # 2. pyzbar
            try:
                decoded = decode(img_piece)
                for d in decoded:
                    parsed = parse_qr_payload(d.data.decode("utf-8", errors="ignore"))
                    if parsed:
                        return parsed
            except Exception:
                pass

            # 3. OpenCV
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
            h, w = img_bgr.shape[:2]
            candidate_rois = [
                img_bgr[0:int(h * 0.50), int(w * 0.45):w],  # Top-Right 45%
                img_bgr[0:int(h * 0.38), int(w * 0.55):w],  # Top-Right 35%
                img_bgr[0:int(h * 0.55), :],                # Nửa trên
            ]

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

            candidate_rois.extend([
                img_bgr[0:int(h * 0.50), 0:int(w * 0.55)],
                img_bgr[int(h * 0.50):h, int(w * 0.45):w],
                img_bgr[int(h * 0.50):h, 0:int(w * 0.55)],
                img_bgr,
            ])

            for roi in candidate_rois:
                if roi is None or roi.size == 0 or roi.shape[0] < 30 or roi.shape[1] < 30:
                    continue
                res = scan_candidate_engines(roi)
                if res:
                    return res
                scaled = cv2.resize(roi, (0, 0), fx=2.0, fy=2.0, interpolation=cv2.INTER_CUBIC)
                res = scan_candidate_engines(scaled)
                if res:
                    return res
                gray = cv2.cvtColor(scaled, cv2.COLOR_BGR2GRAY)
                clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
                cl_gray = clahe.apply(gray)
                res = scan_candidate_engines(cl_gray)
                if res:
                    return res
                _, otsu = cv2.threshold(cl_gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
                res = scan_candidate_engines(otsu)
                if res:
                    return res

            for rot in [
                cv2.rotate(img_bgr, cv2.ROTATE_90_CLOCKWISE),
                cv2.rotate(img_bgr, cv2.ROTATE_180),
                cv2.rotate(img_bgr, cv2.ROTATE_90_COUNTERCLOCKWISE),
            ]:
                res = scan_candidate_engines(rot)
                if res:
                    return res

            return None

        def extract_ocr_front(img_bgr):
            # Tối ưu kích thước: Resize về độ phân giải chuẩn max 960px giúp EasyOCR nhanh gấp 4 lần trên CPU
            h, w = img_bgr.shape[:2]
            max_dim = 960
            if max(h, w) > max_dim:
                scale = max_dim / float(max(h, w))
                ocr_input = cv2.resize(img_bgr, (0, 0), fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
            else:
                ocr_input = img_bgr

            results = self.ocr_reader.readtext(ocr_input, batch_size=4, detail=1)
            full_text = " ".join([r[1] for r in results])
            lines = [r[1].strip() for r in results]

            id_match = re.search(r'\b(\d{12})\b', full_text)
            id_number = id_match.group(1) if id_match else ""

            dob_match = re.search(r'\b(\d{2})[/\-\.](\d{2})[/\-\.](\d{4})\b', full_text)
            dob = f"{dob_match.group(1)}{dob_match.group(2)}{dob_match.group(3)}" if dob_match else ""

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
                "raw_text": full_text,
            }

        def remove_vietnamese_diacritics(text: str) -> str:
            nfkd = unicodedata.normalize('NFKD', text)
            ascii_text = ''.join([c for c in nfkd if not unicodedata.combining(c)])
            ascii_text = ascii_text.replace('Đ', 'D').replace('đ', 'd')
            return re.sub(r'[^A-Z\s]', '', ascii_text.upper()).strip()

        def cross_check_tamper(qr_data, ocr_data):
            if not qr_data:
                return False, "Thiếu mã QR để thực hiện đối soát Tam giác vàng.", "MISSING_QR"

            mismatches = []
            matches = []

            qr_id = str(qr_data.get("id_number", "")).strip()
            ocr_id = str(ocr_data.get("id_number", "")).strip()
            if qr_id and ocr_id:
                if qr_id == ocr_id:
                    matches.append(f"Số CCCD trùng khớp ({qr_id})")
                else:
                    mismatches.append(f"Số CCCD trên QR ({qr_id}) KHÔNG KHỚP chữ in trên thẻ ({ocr_id})")
            elif qr_id and not ocr_id:
                matches.append(f"Số CCCD từ QR ({qr_id}) (EasyOCR chưa bắt đủ 12 số)")

            qr_dob = re.sub(r'\D', '', str(qr_data.get("dob", "")))
            ocr_dob = re.sub(r'\D', '', str(ocr_data.get("dob", "")))
            if qr_dob and ocr_dob:
                if qr_dob == ocr_dob:
                    matches.append(f"Ngày sinh trùng khớp ({qr_dob})")
                elif len(qr_dob) >= 4 and len(ocr_dob) >= 4 and qr_dob[-2:] == ocr_dob[-2:]:
                    matches.append(f"Năm sinh trùng khớp (...{qr_dob[-2:]})")
                else:
                    mismatches.append(f"Ngày sinh trên QR ({qr_dob}) KHÔNG KHỚP chữ in trên thẻ ({ocr_dob})")

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

        @web_app.get("/health")
        def health_check():
            return {
                "status": "online",
                "engine": "Modal Serverless GPU - InsightFace ArcFace 512-d + EasyOCR + Multi-Stage QR",
            }

        @web_app.post("/api/verify-ekyc")
        @web_app.post("/verify")
        async def verify_ekyc(
            card_front: UploadFile = File(...),
            selfie: UploadFile = File(...),
            card_back: UploadFile = File(None),
            x_api_key: str = Header(None),
        ):
            if x_api_key and x_api_key != API_SECRET_KEY:
                raise HTTPException(status_code=403, detail="Khóa API không hợp lệ.")

            img_card = read_image_with_exif_fix(await card_front.read())
            img_selfie = read_image_with_exif_fix(await selfie.read())

            img_card_back = None
            if card_back is not None:
                try:
                    back_raw = await card_back.read()
                    if back_raw:
                        img_card_back = read_image_with_exif_fix(back_raw)
                        bh, bw = img_card_back.shape[:2]
                        if max(bh, bw) > 1280:
                            scale_b = 1280.0 / float(max(bh, bw))
                            img_card_back = cv2.resize(img_card_back, (0, 0), fx=scale_b, fy=scale_b, interpolation=cv2.INTER_AREA)
                except Exception as e:
                    print(f"⚠️ Không thể đọc ảnh mặt sau: {e}")

            # Chuẩn hóa kích thước tối đa 1280px (vừa siêu nét cho sinh trắc học, vừa tiết kiệm RAM và CPU)
            ch, cw = img_card.shape[:2]
            if max(ch, cw) > 1280:
                scale_c = 1280.0 / float(max(ch, cw))
                img_card = cv2.resize(img_card, (0, 0), fx=scale_c, fy=scale_c, interpolation=cv2.INTER_AREA)

            sh, sw = img_selfie.shape[:2]
            if max(sh, sw) > 1280:
                scale_s = 1280.0 / float(max(sh, sw))
                img_selfie = cv2.resize(img_selfie, (0, 0), fx=scale_s, fy=scale_s, interpolation=cv2.INTER_AREA)

            print("\n" + "="*65)
            print("📌 [BẮT ĐẦU XỬ LÝ YÊU CẦU eKYC]")
            print(f"📸 Kích thước ảnh thẻ mặt trước: {img_card.shape}, Ảnh selfie: {img_selfie.shape}")
            if img_card_back is not None:
                print(f"📸 Kích thước ảnh thẻ mặt sau: {img_card_back.shape}")

            faces_card = self.face_app.get(img_card)
            faces_selfie = self.face_app.get(img_selfie)

            if len(faces_card) == 0:
                print("❌ Lỗi: Không nhận diện được khuôn mặt trên thẻ CCCD.")
                return {"status": "FAILED", "code": "NO_CARD_FACE", "message": "Không nhận diện được khuôn mặt trên thẻ CCCD."}
            if len(faces_selfie) == 0:
                print("❌ Lỗi: Không nhận diện được khuôn mặt trong ảnh selfie.")
                return {"status": "FAILED", "code": "NO_SELFIE_FACE", "message": "Không nhận diện được khuôn mặt trong ảnh selfie."}

            faces_card = sorted(faces_card, key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]), reverse=True)
            faces_selfie = sorted(faces_selfie, key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]), reverse=True)
            face_bbox = faces_card[0].bbox

            # 1. Quét QR Code (Mặt trước cho mẫu CCCD 2021 hoặc Mặt sau cho mẫu Căn cước 2024)
            qr_data = extract_qr(img_card, face_bbox=face_bbox)
            if qr_data:
                print("✅ [1. QR CODE] Đã giải mã thành công mã QR mặt trước thẻ (Mẫu CCCD gắn chip 2021):")
                print(f"   - Số CCCD (QR):  {qr_data.get('id_number')}")
                print(f"   - Họ và tên (QR): {qr_data.get('full_name')}")
                print(f"   - Ngày sinh (QR): {qr_data.get('dob')}")
                print(f"   - Giới tính (QR): {qr_data.get('gender')}")
                print(f"   - Thường trú (QR): {qr_data.get('address')}")
            elif img_card_back is not None:
                print("ℹ️ [1. QR CODE] Không thấy mã QR mặt trước. Đang quét mặt sau thẻ (Quy chuẩn Thẻ Căn cước 2024)...")
                qr_data = extract_qr(img_card_back)
                if qr_data:
                    print("✅ [1. QR CODE] Đã giải mã thành công mã QR MẶT SAU THẺ (Mẫu Căn cước mới 2024):")
                    print(f"   - Số Căn cước (QR): {qr_data.get('id_number')}")
                    print(f"   - Họ và tên (QR):   {qr_data.get('full_name')}")
                    print(f"   - Ngày sinh (QR):   {qr_data.get('dob')}")
                    print(f"   - Giới tính (QR):   {qr_data.get('gender')}")
                    print(f"   - Nơi cư trú (QR):  {qr_data.get('address')}")
                else:
                    print("⚠️ [1. QR CODE] Không tìm thấy mã QR trên cả 2 mặt thẻ!")
            else:
                print("⚠️ [1. QR CODE] Không tìm thấy mã QR trên ảnh mặt trước!")

            # 2. Quét OCR chữ in trên mặt thẻ
            ocr_front = extract_ocr_front(img_card)
            print("✅ [2. EASYOCR] Đã nhận diện chữ in bề mặt thẻ CCCD:")
            print(f"   - Số CCCD (OCR): {ocr_front.get('id_number') or '(Chưa bắt được)'}")
            print(f"   - Họ và tên (OCR): {ocr_front.get('full_name') or '(Chưa bắt được)'}")
            print(f"   - Ngày sinh (OCR): {ocr_front.get('dob') or '(Chưa bắt được)'}")

            # 3. Đối soát Tam giác vàng
            is_tampered, tamper_details, tamper_status = cross_check_tamper(qr_data, ocr_front)
            print("⚖️ [3. ĐỐI SOÁT TAM GIÁC VÀNG (QR CODE ⟺ EASYOCR MẶT THẺ)]:")
            if qr_data:
                print(f"   - Số CCCD:   QR = {qr_data.get('id_number')} | OCR = {ocr_front.get('id_number') or 'N/A'}")
                print(f"   - Họ tên:    QR = {qr_data.get('full_name')} | OCR = {ocr_front.get('full_name') or 'N/A'}")
                print(f"   - Ngày sinh: QR = {qr_data.get('dob')} | OCR = {ocr_front.get('dob') or 'N/A'}")
                if is_tampered:
                    print(f"   ❌ PHÁT HIỆN CAN THIỆP/LÀM GIẢ PHÔI THẺ: {tamper_details}")
                else:
                    print(f"   ✅ KẾT QUẢ ĐỐI SOÁT: {tamper_details}")
            else:
                print("   ⚠️ CẢNH BÁO: Thiếu mã QR thẻ chip -> Chưa đủ điều kiện Tam giác vàng chống giả mạo!")
            print(f"   -> Kết quả giả mạo: is_tampered = {is_tampered} (Trạng thái: {tamper_status})")

            best_cosine = -1.0
            best_card_face = faces_card[0]

            for c in faces_card:
                for s in faces_selfie:
                    norm_c = np.linalg.norm(c.embedding)
                    norm_s = np.linalg.norm(s.embedding)
                    sim = float(np.dot(c.embedding, s.embedding) / (norm_c * norm_s))
                    if sim > best_cosine:
                        best_cosine = sim
                        best_card_face = c

            cosine_sim = float(best_cosine)

            if cosine_sim < 0.35:
                score = max(0, int((cosine_sim / 0.35) * 40))
            elif cosine_sim < 0.50:
                score = int(41 + ((cosine_sim - 0.35) / 0.15) * 28)
            elif cosine_sim < 0.65:
                score = int(70 + ((cosine_sim - 0.50) / 0.15) * 18)
            else:
                score = min(100, int(88 + ((cosine_sim - 0.65) / 0.20) * 12))

            has_qr = qr_data is not None and bool(qr_data.get("id_number"))

            if is_tampered:
                status = "rejected"
                rejection_reason = f"Phát hiện can thiệp phôi thẻ: {tamper_details}"
            elif not has_qr:
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
                status = "auto_approved"
                rejection_reason = None

            print(f"🎯 [4. KẾT QUẢ SINH TRẮC HỌC]: Cosine = {cosine_sim:.4f} -> Điểm khớp: {score}% -> Trạng thái: {status}")
            if rejection_reason:
                print(f"   ℹ️ Lý do: {rejection_reason}")
            print("="*65 + "\n")

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

        return web_app
