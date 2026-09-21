-- =========================================================================
-- MIGRATION 0005: PHÂN QUYỀN API TOÀN DIỆN (GRANTS)
-- =========================================================================

-- 1. Thu hồi toàn bộ quyền của anon trên mọi bảng
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

-- 2. Cấp lại SELECT cho anon trên public-read tables
GRANT SELECT ON public.danang_wards TO anon;
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.events TO anon;
GRANT SELECT ON public.applications TO anon;
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT ON public.event_categories TO anon;
GRANT SELECT ON public.job_positions TO anon;

-- 3. authenticated + service_role + postgres giữ ALL (RLS sẽ enforce ở row level)
GRANT ALL ON TABLE public.danang_wards TO authenticated, service_role, postgres;
GRANT ALL ON TABLE public.profiles TO authenticated, service_role, postgres;
GRANT ALL ON TABLE public.events TO authenticated, service_role, postgres;
GRANT ALL ON TABLE public.applications TO authenticated, service_role, postgres;
GRANT ALL ON TABLE public.notifications TO authenticated, service_role, postgres;
GRANT ALL ON TABLE public.event_bookmarks TO authenticated, service_role, postgres;
GRANT ALL ON TABLE public.chats TO authenticated, service_role, postgres;
GRANT ALL ON TABLE public.messages TO authenticated, service_role, postgres;
GRANT ALL ON TABLE public.reviews TO authenticated, service_role, postgres;
GRANT ALL ON TABLE public.event_categories TO authenticated, service_role, postgres;
GRANT ALL ON TABLE public.job_positions TO authenticated, service_role, postgres;
GRANT ALL ON TABLE public.interviews TO authenticated, service_role, postgres;
