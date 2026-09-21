-- =========================================================================
-- MIGRATION 0001: KHỞI TẠO CÁC BẢNG DỮ LIỆU & CHỈ MỤC (TABLES & INDEXES)
-- =========================================================================

-- 1. Bảng DANANG_WARDS (Danh mục Phường/Xã Đà Nẵng)
CREATE TABLE IF NOT EXISTS public.danang_wards (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Bảng PROFILES (Hồ sơ người dùng)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- student hoặc organizer
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    university TEXT,
    bio TEXT,
    skills TEXT,
    slug TEXT UNIQUE,
    cv_completion_percent INT DEFAULT 0, -- Tự động tính toán bằng Trigger
    mst TEXT,
    website TEXT,
    scale TEXT,
    address TEXT,
    company_images TEXT,
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    premium_until TIMESTAMPTZ,
    reliability_score NUMERIC DEFAULT 100,
    is_verified BOOLEAN DEFAULT FALSE,
    cv_url TEXT,
    shirt_size TEXT DEFAULT 'M',
    height INT
);

-- 3. Bảng EVENTS (Sự kiện & Vị trí tuyển dụng)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    event_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    start_time TIME WITHOUT TIME ZONE DEFAULT '07:30:00'::time,
    end_time TIME WITHOUT TIME ZONE DEFAULT '17:00:00'::time,
    salary_amount NUMERIC DEFAULT 0,
    salary_type TEXT DEFAULT 'per_shift', -- per_shift, per_hour, per_event, volunteer
    payment_method TEXT DEFAULT 'cash_after_event', -- cash_after_event, bank_transfer
    zalo_group_link TEXT,
    status TEXT DEFAULT 'upcoming'::text, -- upcoming, ongoing, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    application_deadline TIMESTAMP WITH TIME ZONE,
    position_type TEXT DEFAULT 'Tình nguyện viên'::text,
    benefits TEXT DEFAULT 'Cấp chứng nhận'::text,
    category TEXT DEFAULT 'Lễ hội Âm nhạc'::text,
    slots_needed INT DEFAULT 1,
    ward_id INT REFERENCES public.danang_wards(id),
    slug TEXT UNIQUE
);

-- 4. Bảng APPLICATIONS (Đơn ứng tuyển)
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending'::text, -- pending, approved, rejected
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    attendance_status TEXT DEFAULT 'pending_event'::text, -- pending_event, checked_in, completed, no_show
    student_note TEXT,
    CONSTRAINT unique_event_student UNIQUE (event_id, student_id)
);

-- 5. Bảng CHATS (Cuộc trò chuyện)
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT unique_chat UNIQUE (event_id, student_id, organizer_id)
);

-- 6. Bảng MESSAGES (Tin nhắn)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 7. Bảng NOTIFICATIONS (Thông báo hệ thống)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 8. Bảng EVENT_BOOKMARKS (Việc làm đã lưu)
CREATE TABLE IF NOT EXISTS public.event_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT unique_student_bookmark UNIQUE (student_id, event_id)
);

-- 9. Bảng REVIEWS (Đánh giá)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT unique_review UNIQUE (event_id, reviewer_id, reviewee_id)
);

-- 10. Bảng EVENT_CATEGORIES (Danh mục sự kiện)
CREATE TABLE IF NOT EXISTS public.event_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    slug TEXT UNIQUE
);

-- 11. Bảng JOB_POSITIONS (Vị trí công việc tuyển dụng)
CREATE TABLE IF NOT EXISTS public.job_positions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    slug TEXT UNIQUE
);

-- 12. Bảng INTERVIEWS (Lịch phỏng vấn / thử việc)
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
    CONSTRAINT interviews_event_id_student_id_scheduled_at_key UNIQUE (event_id, student_id, scheduled_at)
);

-- Các Index hỗ trợ tối ưu hiệu năng truy vấn
CREATE INDEX IF NOT EXISTS idx_interviews_student_status ON public.interviews(student_id, status);
CREATE INDEX IF NOT EXISTS idx_interviews_organizer_status ON public.interviews(organizer_id, status);
CREATE INDEX IF NOT EXISTS idx_interviews_event ON public.interviews(event_id);
