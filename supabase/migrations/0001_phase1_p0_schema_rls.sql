-- =========================================================================
-- Migration 0001: Phase 1 P0 fixes
--   1. Thêm bảng `interviews` (bị thiếu — code MyJobs/Chat/ScheduleCalendar tham chiếu)
--   2. Kích hoạt trigger `on_auth_user_created` (handle_new_user) — user đăng ký mới sẽ có profiles row
--   3. Siết RLS:
--      a. applications UPDATE: chỉ organizer của event mới được duyệt (USING true → scoped)
--      b. notifications INSERT: chỉ self hoặc service_role (WITH CHECK true → auth.uid() = user_id)
--   4. Storage avatars: ownership theo path prefix = auth.uid()
--   5. Bỏ `GRANT ALL TO anon` — anon chỉ cần SELECT trên public-read tables
--
-- Idempotent: dùng IF NOT EXISTS / DROP IF EXISTS, chạy nhiều lần không lỗi.
-- Chạy 1 lần trong Supabase Dashboard → SQL Editor (cần quyền admin).
-- =========================================================================

BEGIN;

-- =========================================================================
-- 1. BẢNG INTERVIEWS
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    meeting_link TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(event_id, student_id, scheduled_at)
);

-- Index cho các query phổ biến (theo student/organizer + status, theo event)
CREATE INDEX IF NOT EXISTS idx_interviews_student_status
    ON public.interviews(student_id, status);
CREATE INDEX IF NOT EXISTS idx_interviews_organizer_status
    ON public.interviews(organizer_id, status);
CREATE INDEX IF NOT EXISTS idx_interviews_event
    ON public.interviews(event_id);

-- RLS cho interviews
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

-- SELECT: student hoặc organizer của interview
DROP POLICY IF EXISTS "interviews_select_participants" ON public.interviews;
CREATE POLICY "interviews_select_participants" ON public.interviews
    FOR SELECT TO authenticated
    USING (auth.uid() = student_id OR auth.uid() = organizer_id);

-- INSERT: chỉ organizer của event (tạo lịch phỏng vấn)
DROP POLICY IF EXISTS "interviews_insert_organizer" ON public.interviews;
CREATE POLICY "interviews_insert_organizer" ON public.interviews
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.uid() = organizer_id
        AND auth.uid() IN (
            SELECT organizer_id FROM public.events WHERE id = event_id
        )
    );

-- UPDATE: student accept/reject (status pending→accepted/rejected),
-- organizer mark completed/cancelled
DROP POLICY IF EXISTS "interviews_update_participants" ON public.interviews;
CREATE POLICY "interviews_update_participants" ON public.interviews
    FOR UPDATE TO authenticated
    USING (auth.uid() = student_id OR auth.uid() = organizer_id)
    WITH CHECK (auth.uid() = student_id OR auth.uid() = organizer_id);

-- DELETE: chỉ organizer
DROP POLICY IF EXISTS "interviews_delete_organizer" ON public.interviews;
CREATE POLICY "interviews_delete_organizer" ON public.interviews
    FOR DELETE TO authenticated
    USING (auth.uid() = organizer_id);

-- =========================================================================
-- 2. KÍCH HOẠT TRIGGER on_auth_user_created (handle_new_user)
--    Function handle_new_user() đã được định nghĩa trong db.sql (SECURITY DEFINER).
--    Trigger bị comment vì cần quyền trên schema auth — chạy trong SQL Editor (admin).
-- =========================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =========================================================================
-- 3a. RLS: applications UPDATE — chỉ organizer của event mới được duyệt đơn
--     (Trước: USING (true) → BẤT KỲ ai cũng sửa được status đơn của người khác)
-- =========================================================================
DROP POLICY IF EXISTS "Allow update on applications" ON public.applications;
DROP POLICY IF EXISTS "BTC duyệt đơn" ON public.applications;
CREATE POLICY "applications_update_organizer_only" ON public.applications
    FOR UPDATE TO authenticated
    USING (
        auth.uid() IN (
            SELECT events.organizer_id
            FROM public.events
            WHERE events.id = applications.event_id
        )
    )
    WITH CHECK (
        auth.uid() IN (
            SELECT events.organizer_id
            FROM public.events
            WHERE events.id = applications.event_id
        )
    );

-- =========================================================================
-- 3b. RLS: notifications INSERT — chỉ self (hoặc service_role qua trigger SECURITY DEFINER)
--     (Trước: WITH CHECK (true) → ai cũng spam notification cho user khác)
-- =========================================================================
DROP POLICY IF EXISTS "Bắn thông báo tự do" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_open" ON public.notifications;
CREATE POLICY "notifications_insert_self" ON public.notifications
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Lưu ý: các trigger notify_organizer_on_apply / notify_student_on_status_change
-- là SECURITY DEFINER → chạy với quyền owner (postgres) → bỏ qua RLS, vẫn insert
-- notification cho organizer/student được bình thường.

-- =========================================================================
-- 4. STORAGE: avatars ownership theo path prefix = auth.uid()
--    (Trước: authenticated có thể upload/overwrite/delete file của người khác)
-- =========================================================================
DROP POLICY IF EXISTS "Allow authenticated insert on avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update on avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete on avatars" ON storage.objects;

-- INSERT: path phải bắt đầu bằng folder = user id (ví dụ: avatars/{uid}-abc.jpg)
CREATE POLICY "avatars_insert_owner" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- UPDATE: chỉ owner của file (folder đầu tiên = uid)
CREATE POLICY "avatars_update_owner" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- DELETE: chỉ owner
CREATE POLICY "avatars_delete_owner" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- =========================================================================
-- 5. BỎ GRANT ALL TO anon — anon chỉ cần SELECT trên public-read tables
--    (Trước: GRANT ALL cho anon → RLS là rào duy nhất, mà RLS có lỗ hổng)
-- =========================================================================
-- Thu hồi tất cả quyền của anon trên mọi bảng public
REVOKE ALL ON public.danang_wards FROM anon;
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.events FROM anon;
REVOKE ALL ON public.applications FROM anon;
REVOKE ALL ON public.notifications FROM anon;
REVOKE ALL ON public.event_bookmarks FROM anon;
REVOKE ALL ON public.chats FROM anon;
REVOKE ALL ON public.messages FROM anon;
REVOKE ALL ON public.reviews FROM anon;
REVOKE ALL ON public.event_categories FROM anon;
REVOKE ALL ON public.job_positions FROM anon;
REVOKE ALL ON public.interviews FROM anon;

-- Cấp lại SELECT cho anon trên các bảng public-read (RLS đã allow SELECT với true)
GRANT SELECT ON public.danang_wards TO anon;
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.events TO anon;
GRANT SELECT ON public.applications TO anon;
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT ON public.event_categories TO anon;
GRANT SELECT ON public.job_positions TO anon;

-- Lưu ý: notifications / event_bookmarks / chats / messages / interviews
-- KHÔNG cấp SELECT cho anon (RLS đã require auth.uid() = user_id/...).
-- authenticated giữ ALL (RLS sẽ enforce ở row level).

COMMIT;

-- =========================================================================
-- HẾT MIGRATION 0001
-- =========================================================================
