-- =========================================================================
-- MIGRATION 0008: SOFT DELETE VÀ CHỐNG TRỤC LỢI HẠN MỨC ĐĂNG TIN (QUOTA PROTECTION)
-- =========================================================================

-- 1. Bổ sung cột deleted_at cho bảng events để hỗ trợ Soft Delete
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Chỉ mục tối ưu cho truy vấn lọc các tin chưa bị xóa
CREATE INDEX IF NOT EXISTS idx_events_deleted_at 
  ON public.events (deleted_at) 
  WHERE deleted_at IS NULL;

-- 3. Chặn người dùng thường / BTC xóa cứng dữ liệu qua Supabase Client API
-- Chỉ cho phép người dùng thao tác xóa mềm qua UPDATE (cập nhật deleted_at = NOW())
-- Admin / Developer vẫn có thể xóa trực tiếp trong Supabase Studio / Table Editor (vì bypass RLS)
DROP POLICY IF EXISTS "BTC được xóa sự kiện" ON public.events;
