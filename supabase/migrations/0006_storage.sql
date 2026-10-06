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

DROP POLICY IF EXISTS "avatars_insert_owner" ON storage.objects;
CREATE POLICY "avatars_insert_owner"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

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

DROP POLICY IF EXISTS "avatars_delete_owner" ON storage.objects;
CREATE POLICY "avatars_delete_owner"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- =========================================================================
-- 2. BUCKET 'cvs' (Lưu trữ file hồ sơ PDF CV của ứng viên)
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

-- =========================================================================
-- 3. BUCKET 'kyc_documents' (Lưu ảnh CCCD & Chân dung eKYC kiểm duyệt)
-- =========================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc_documents', 'kyc_documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow authenticated uploads to kyc_documents" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to kyc_documents"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'kyc_documents');

DROP POLICY IF EXISTS "Allow select on kyc_documents" ON storage.objects;
CREATE POLICY "Allow select on kyc_documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'kyc_documents');
