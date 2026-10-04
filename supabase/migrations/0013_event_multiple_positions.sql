-- 0013_event_multiple_positions.sql
-- Hỗ trợ 1 sự kiện có nhiều vị trí tuyển dụng (Multiple Positions per Event)

-- 1. Tạo bảng event_positions
CREATE TABLE IF NOT EXISTS public.event_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slots_needed INTEGER NOT NULL DEFAULT 1,
    salary_amount NUMERIC NOT NULL DEFAULT 0,
    salary_type TEXT NOT NULL DEFAULT 'per_shift',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Đánh index tối ưu truy vấn theo event_id
CREATE INDEX IF NOT EXISTS idx_event_positions_event_id ON public.event_positions(event_id);

-- 3. Kích hoạt Row Level Security (RLS)
ALTER TABLE public.event_positions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Allow public read on event_positions" ON public.event_positions;
CREATE POLICY "Allow public read on event_positions"
ON public.event_positions FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow organizers to insert positions" ON public.event_positions;
CREATE POLICY "Allow organizers to insert positions"
ON public.event_positions FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = event_positions.event_id
        AND events.organizer_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Allow organizers to update positions" ON public.event_positions;
CREATE POLICY "Allow organizers to update positions"
ON public.event_positions FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = event_positions.event_id
        AND events.organizer_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = event_positions.event_id
        AND events.organizer_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Allow organizers to delete positions" ON public.event_positions;
CREATE POLICY "Allow organizers to delete positions"
ON public.event_positions FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = event_positions.event_id
        AND events.organizer_id = auth.uid()
    )
);

-- 5. Bổ sung position_id vào bảng applications
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS position_id UUID REFERENCES public.event_positions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_applications_position_id ON public.applications(position_id);

-- 6. Migrate dữ liệu các sự kiện hiện có sang bảng event_positions
INSERT INTO public.event_positions (event_id, title, slots_needed, salary_amount, salary_type)
SELECT 
    id, 
    COALESCE(NULLIF(TRIM(position_type), ''), 'Tình nguyện viên sự kiện'), 
    COALESCE(slots_needed, 1), 
    COALESCE(salary_amount, 0), 
    COALESCE(NULLIF(TRIM(salary_type), ''), 'per_shift')
FROM public.events e
WHERE NOT EXISTS (
    SELECT 1 FROM public.event_positions ep WHERE ep.event_id = e.id
);

-- 7. Cập nhật các đơn ứng tuyển hiện tại trỏ tới vị trí vừa tạo
UPDATE public.applications a
SET position_id = ep.id
FROM public.event_positions ep
WHERE a.event_id = ep.event_id
  AND a.position_id IS NULL;

-- 8. Phân quyền truy cập API (Grants) cho bảng event_positions
GRANT SELECT ON public.event_positions TO anon;
GRANT ALL ON TABLE public.event_positions TO authenticated, service_role, postgres;
