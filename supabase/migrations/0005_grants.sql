-- =========================================================================
-- MIGRATION 0005: PHÂN QUYỀN TRUY CẬP API (GRANTS)
-- =========================================================================

-- 1. Thu hồi toàn bộ quyền của anon trên tất cả các bảng
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
REVOKE ALL ON public.profile_views FROM anon;
REVOKE ALL ON public.profile_likes FROM anon;
REVOKE ALL ON public.company_follows FROM anon;
REVOKE ALL ON public.transactions FROM anon;

-- 2. Cấp quyền SELECT cho anon trên các bảng public-read
GRANT SELECT ON public.danang_wards TO anon;
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.events TO anon;
GRANT SELECT ON public.applications TO anon;
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT ON public.event_categories TO anon;
GRANT SELECT ON public.job_positions TO anon;
GRANT SELECT ON public.company_follows TO anon;

-- 3. Cấp quyền đầy đủ cho authenticated, service_role, postgres (RLS thực thi bảo mật)
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
GRANT ALL ON TABLE public.profile_views TO authenticated, service_role, postgres;
GRANT ALL ON TABLE public.profile_likes TO authenticated, service_role, postgres;
GRANT ALL ON TABLE public.company_follows TO authenticated, service_role, postgres;
GRANT ALL ON TABLE public.transactions TO authenticated, service_role, postgres;

-- 4. Cấp quyền thực thi các hàm RPC
GRANT EXECUTE ON FUNCTION public.record_profile_view(UUID) TO authenticated, service_role, postgres;
GRANT EXECUTE ON FUNCTION public.complete_checkout_transaction(TEXT, TEXT, TEXT, NUMERIC) TO authenticated, service_role, postgres;
GRANT EXECUTE ON FUNCTION public.confirm_payos_payment(BIGINT) TO anon, authenticated, service_role, postgres;
