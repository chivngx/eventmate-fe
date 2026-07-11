-- =========================================================================
-- Migration 0002: Phase 1 Task 3 — VIP/premium chuyển từ localStorage sang DB
--   1. Thêm cột is_premium + premium_until cho profiles
--   2. Trigger ngăn user tự UPDATE is_premium/premium_until của chính mình
--      (chỉ service_role — qua payment webhook — mới set được)
--
-- Idempotent. Chạy trong Supabase Dashboard → SQL Editor.
-- =========================================================================

BEGIN;

-- 1. Thêm cột is_premium + premium_until
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS premium_until TIMESTAMPTZ;

-- 2. Trigger: chặn self-update is_premium / premium_until
--    RLS policy "Users can update own profile" (auth.uid() = id) cho phép user
--    update toàn bộ cột → có thể tự set is_premium = true để bypass VIP.
--    Trigger này kiểm tra: nếu auth.uid() = NEW.id (self update) VÀ
--    is_premium/premium_until thay đổi → raise exception.
--    Service_role (payment webhook) có auth.uid() = null → pass.
CREATE OR REPLACE FUNCTION public.prevent_self_premium_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF auth.uid() = NEW.id
       AND (NEW.is_premium IS DISTINCT FROM OLD.is_premium
            OR NEW.premium_until IS DISTINCT FROM OLD.premium_until) THEN
        RAISE EXCEPTION 'Không thể tự thay đổi trạng thái VIP. Vui lòng mua gói dịch vụ.';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_self_premium_update ON public.profiles;
CREATE TRIGGER trg_prevent_self_premium_update
    BEFORE UPDATE OF is_premium, premium_until ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.prevent_self_premium_update();

COMMIT;

-- =========================================================================
-- HẾT MIGRATION 0002
-- =========================================================================
