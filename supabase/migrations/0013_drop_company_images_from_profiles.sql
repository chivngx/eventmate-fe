-- =========================================================================
-- MIGRATION 0013: LOẠI BỎ CỘT COMPANY_IMAGES KHỎI BẢNG PROFILES
-- =========================================================================

ALTER TABLE public.profiles
DROP COLUMN IF EXISTS company_images;
