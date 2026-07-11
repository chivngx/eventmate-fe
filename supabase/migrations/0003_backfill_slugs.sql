-- =========================================================================
-- Migration 0003: Backfill slug cho job_positions + event_categories hiện có
--
-- Vấn đề: trigger generate_*_slug chỉ chạy trên INSERT/UPDATE mới.
-- Các row seed (từ db.sql Phần 1) được insert TRƯỚC khi trigger exist
-- → slug = NULL → frontend fallback slugify(name) nhưng backend query .eq(slug) fail.
--
-- Fix: chạy slugify() cho tất cả row hiện có + đảm bảo trigger apply cho update.
-- Idempotent — chạy nhiều lần OK.
-- =========================================================================

BEGIN;

-- Backfill slug cho job_positions
UPDATE public.job_positions
SET slug = public.slugify(name)
WHERE slug IS NULL OR slug = '';

-- Backfill slug cho event_categories
UPDATE public.event_categories
SET slug = public.slugify(name)
WHERE slug IS NULL OR slug = '';

-- Backfill slug cho events
UPDATE public.events
SET slug = public.slugify(title)
WHERE slug IS NULL OR slug = '';

-- Backfill slug cho profiles (organizer)
UPDATE public.profiles
SET slug = public.slugify(full_name)
WHERE role = 'organizer' AND (slug IS NULL OR slug = '');

COMMIT;

-- Verify (chạy trong SQL Editor output):
-- SELECT name, slug FROM public.job_positions;  -- phải không còn NULL
-- SELECT name, slug FROM public.event_categories;
-- =========================================================================
