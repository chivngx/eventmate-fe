-- =========================================================================
-- MIGRATION 0007: TÍNH NĂNG LƯỢT XEM VÀ LƯỢT THÍCH HỒ SƠ ỨNG VIÊN
-- =========================================================================

-- 1. Bảng PROFILE_VIEWS (Ghi nhận lượt xem hồ sơ sinh viên từ nhà tuyển dụng)
CREATE TABLE IF NOT EXISTS public.profile_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    viewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index tối ưu truy vấn
CREATE INDEX IF NOT EXISTS idx_profile_views_student_id ON public.profile_views(student_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer_id ON public.profile_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_at ON public.profile_views(viewed_at DESC);

-- 2. Bảng PROFILE_LIKES (Lưu / Thích hồ sơ ứng viên từ nhà tuyển dụng)
CREATE TABLE IF NOT EXISTS public.profile_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_organizer_student_like UNIQUE (organizer_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_profile_likes_student_id ON public.profile_likes(student_id);
CREATE INDEX IF NOT EXISTS idx_profile_likes_organizer_id ON public.profile_likes(organizer_id);

-- 3. Bật RLS
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_likes ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies cho PROFILE_VIEWS
DROP POLICY IF EXISTS "Users can view their profile view stats or what they viewed" ON public.profile_views;
CREATE POLICY "Users can view their profile view stats or what they viewed"
ON public.profile_views FOR SELECT
USING (auth.uid() = student_id OR auth.uid() = viewer_id);

DROP POLICY IF EXISTS "Authenticated users can record a profile view" ON public.profile_views;
CREATE POLICY "Authenticated users can record a profile view"
ON public.profile_views FOR INSERT
WITH CHECK (auth.uid() = viewer_id AND auth.uid() != student_id);

-- 5. RLS Policies cho PROFILE_LIKES
DROP POLICY IF EXISTS "Users can view profile likes" ON public.profile_likes;
CREATE POLICY "Users can view profile likes"
ON public.profile_likes FOR SELECT
USING (auth.uid() = student_id OR auth.uid() = organizer_id);

DROP POLICY IF EXISTS "Organizers can like a profile" ON public.profile_likes;
CREATE POLICY "Organizers can like a profile"
ON public.profile_likes FOR INSERT
WITH CHECK (auth.uid() = organizer_id AND auth.uid() != student_id);

DROP POLICY IF EXISTS "Organizers can unlike a profile" ON public.profile_likes;
CREATE POLICY "Organizers can unlike a profile"
ON public.profile_likes FOR DELETE
USING (auth.uid() = organizer_id);

-- 6. Helper Function RPC để ghi nhận lượt xem tránh spam trong cùng 1 ngày
CREATE OR REPLACE FUNCTION public.record_profile_view(p_student_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_viewer_id UUID;
    v_already_viewed_today BOOLEAN;
BEGIN
    v_viewer_id := auth.uid();
    
    -- Không tự view chính mình và phải là user đăng nhập
    IF v_viewer_id IS NULL OR v_viewer_id = p_student_id THEN
        RETURN FALSE;
    END IF;

    -- Kiểm tra xem viewer đã xem student này trong ngày hôm nay chưa
    SELECT EXISTS (
        SELECT 1 FROM public.profile_views
        WHERE student_id = p_student_id
          AND viewer_id = v_viewer_id
          AND viewed_at >= CURRENT_DATE
    ) INTO v_already_viewed_today;

    IF NOT v_already_viewed_today THEN
        INSERT INTO public.profile_views (student_id, viewer_id, viewed_at)
        VALUES (p_student_id, v_viewer_id, NOW());
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$;

-- 7. Cấp quyền truy cập API (Grants)
GRANT ALL ON TABLE public.profile_views TO authenticated, service_role, postgres;
GRANT ALL ON TABLE public.profile_likes TO authenticated, service_role, postgres;
GRANT EXECUTE ON FUNCTION public.record_profile_view(UUID) TO authenticated, service_role, postgres;

