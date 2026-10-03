-- =========================================================================
-- MIGRATION 0009: XÓA HOÀN TOÀN BẢNG VÀ LOGIC PHỎNG VẤN (INTERVIEWS)
-- =========================================================================

-- Drop bảng interviews và các ràng buộc, index liên quan
DROP TABLE IF EXISTS public.interviews CASCADE;
