-- =========================================================================
-- Migration 0004: Event Specialization (Chuyên biệt hóa nghiệp vụ sự kiện)
--   1. Bổ sung các trường về Thù lao, Khung giờ, Ca làm, Link Zalo cho bảng events
--   2. Bổ sung Size áo đồng phục, Chiều cao, Zalo, Điểm tín nhiệm cho bảng profiles
--   3. Bổ sung Điểm danh & Lời nhắn ứng tuyển cho bảng applications
--
-- Idempotent: Sử dụng ADD COLUMN IF NOT EXISTS, an toàn cho dữ liệu cũ.
-- =========================================================================

BEGIN;

-- 1. Bổ sung trường cho bảng EVENTS
ALTER TABLE public.events
    ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS start_time TIME DEFAULT '07:30:00',
    ADD COLUMN IF NOT EXISTS end_time TIME DEFAULT '17:00:00',
    ADD COLUMN IF NOT EXISTS salary_amount NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS salary_type TEXT DEFAULT 'per_shift',
    ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash_after_event',
    ADD COLUMN IF NOT EXISTS zalo_group_link TEXT;

-- 2. Bổ sung trường cho bảng PROFILES (Dành cho nhân sự sự kiện / sinh viên)
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS shirt_size TEXT DEFAULT 'M',
    ADD COLUMN IF NOT EXISTS height INT,
    ADD COLUMN IF NOT EXISTS zalo_phone TEXT,
    ADD COLUMN IF NOT EXISTS reliability_score NUMERIC DEFAULT 100;

-- 3. Bổ sung trường cho bảng APPLICATIONS (Điểm danh & Ghi chú ứng tuyển)
ALTER TABLE public.applications
    ADD COLUMN IF NOT EXISTS attendance_status TEXT DEFAULT 'pending_event',
    ADD COLUMN IF NOT EXISTS student_note TEXT;

-- Seed cập nhật một số giá trị thù lao và khung giờ mẫu cho các sự kiện hiện có (nếu có)
UPDATE public.events
SET 
    salary_amount = CASE 
        WHEN position_type = 'Tình nguyện viên' THEN 0
        WHEN position_type = 'MC / Hoạt náo viên' THEN 500000
        WHEN position_type = 'Điều phối viên (Coordinator)' THEN 350000
        WHEN position_type = 'Hậu cần & Setup' THEN 250000
        WHEN position_type = 'CTV Truyền thông' THEN 200000
        ELSE 150000
    END,
    salary_type = CASE 
        WHEN position_type = 'Tình nguyện viên' THEN 'volunteer'
        ELSE 'per_shift'
    END,
    payment_method = 'cash_after_event',
    start_time = COALESCE(start_time, '07:30:00'),
    end_time = COALESCE(end_time, '17:00:00')
WHERE salary_amount IS NULL OR salary_amount = 0;

COMMIT;
