-- =========================================================================
-- MIGRATION 0007: TÍNH NĂNG THEO GÓI DỊCH VỤ (PRICING TIERS & EVENT BOOST)
-- =========================================================================

-- 1. Bổ sung các cột phục vụ tính năng gói vào bảng events
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS bumped_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS qr_checkin_code TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'free';

-- 2. Chỉ mục tối ưu sắp xếp tin sự kiện (Ghim nổi bật -> Tuyển gấp -> Đẩy tin -> Ngày tạo)
CREATE INDEX IF NOT EXISTS idx_events_ranking 
  ON public.events (is_featured DESC NULLS LAST, is_urgent DESC NULLS LAST, bumped_at DESC NULLS LAST, created_at DESC);

-- 3. Chỉ mục tra cứu mã QR check-in
CREATE INDEX IF NOT EXISTS idx_events_qr_code 
  ON public.events (qr_checkin_code) 
  WHERE qr_checkin_code IS NOT NULL;

-- 4. RLS cho phép sinh viên đã trúng tuyển tự điểm danh (check-in)
DROP POLICY IF EXISTS "Allow student checkin" ON public.applications;
CREATE POLICY "Allow student checkin"
  ON public.applications FOR UPDATE TO authenticated
  USING (auth.uid() = student_id AND status = 'approved')
  WITH CHECK (auth.uid() = student_id AND status = 'approved');

