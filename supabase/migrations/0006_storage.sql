-- =========================================================================
-- MIGRATION 0006: CẤU HÌNH SUPABASE STORAGE (BUCKETS & POLICIES)
-- =========================================================================

-- =========================================================================
-- 1. BUCKET 'avatars' (Lưu ảnh đại diện người dùng)
-- =========================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow public select on avatars" ON storage.objects;
CREATE POLICY "Allow public select on avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Allow authenticated insert on avatars" ON storage.objects;
DROP POLICY IF EXISTS "avatars_insert_owner" ON storage.objects;
CREATE POLICY "avatars_insert_owner"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Allow authenticated update on avatars" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update_owner" ON storage.objects;
CREATE POLICY "avatars_update_owner"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Allow authenticated delete on avatars" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete_owner" ON storage.objects;
CREATE POLICY "avatars_delete_owner"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );


-- =========================================================================
-- 2. BUCKET 'cvs' (Lưu trữ file hồ sơ PDF CV của sinh viên)
-- =========================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow public read cvs" ON storage.objects;
CREATE POLICY "Allow public read cvs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cvs');

DROP POLICY IF EXISTS "Allow authenticated uploads to cvs" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to cvs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'cvs' 
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Allow user update own cvs" ON storage.objects;
CREATE POLICY "Allow user update own cvs"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'cvs' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Allow user delete own cvs" ON storage.objects;
CREATE POLICY "Allow user delete own cvs"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'cvs' AND auth.uid() = owner);
