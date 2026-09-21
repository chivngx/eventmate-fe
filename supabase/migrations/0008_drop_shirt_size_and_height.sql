-- =========================================================================
-- MIGRATION 0008: LOẠI BỎ CỘT SHIRT_SIZE VÀ HEIGHT KHỎI BẢNG PROFILES
-- =========================================================================

ALTER TABLE public.profiles
DROP COLUMN IF EXISTS shirt_size,
DROP COLUMN IF EXISTS height;
