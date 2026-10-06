-- =========================================================================
-- MIGRATION 0001: BẢNG DỮ LIỆU & CHỈ MỤC (TABLES & INDEXES)
-- =========================================================================

-- Bật extension hỗ trợ UUID & Crypto
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Bảng DANANG_WARDS (Danh mục Phường/Xã Đà Nẵng)
CREATE TABLE IF NOT EXISTS public.danang_wards (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Bảng PROFILES (Hồ sơ người dùng)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'student', -- student, organizer, admin
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    university TEXT,
    bio TEXT,
    skills TEXT,
    slug TEXT UNIQUE,
    cv_completion_percent INT DEFAULT 0,
    mst TEXT,
    website TEXT,
    address TEXT,
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    premium_until TIMESTAMPTZ,
    single_event_credits INT DEFAULT 0,
    reliability_score NUMERIC DEFAULT 100,
    is_verified BOOLEAN DEFAULT FALSE,
    id_card_hash TEXT UNIQUE,
    experiences JSONB DEFAULT '[]'::jsonb,
    social_link TEXT,
    gender TEXT,
    birth_year INT,
    map_embed_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles(slug);

-- 3. Bảng EVENT_CATEGORIES (Danh mục loại hình sự kiện)
CREATE TABLE IF NOT EXISTS public.event_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    slug TEXT UNIQUE
);

-- 4. Bảng JOB_POSITIONS (Vị trí chuyên môn trong sự kiện)
CREATE TABLE IF NOT EXISTS public.job_positions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    slug TEXT UNIQUE
);

-- 5. Bảng EVENTS (Sự kiện & Tin đăng tuyển dụng)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    ward_id INT REFERENCES public.danang_wards(id),
    event_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    start_time TIME WITHOUT TIME ZONE DEFAULT '07:30:00'::time,
    end_time TIME WITHOUT TIME ZONE DEFAULT '17:00:00'::time,
    salary_amount NUMERIC DEFAULT 0,
    salary_type TEXT DEFAULT 'per_shift', -- per_shift, per_hour, per_event, volunteer
    payment_method TEXT DEFAULT 'cash_after_event', -- cash_after_event, bank_transfer
    status TEXT DEFAULT 'upcoming'::text, -- upcoming, ongoing, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    application_deadline TIMESTAMP WITH TIME ZONE,
    position_type TEXT DEFAULT 'Tình nguyện viên'::text,
    benefits TEXT DEFAULT 'Cấp chứng nhận'::text,
    category TEXT DEFAULT 'Lễ hội Âm nhạc'::text,
    slots_needed INT DEFAULT 1,
    slug TEXT UNIQUE,
    is_urgent BOOLEAN DEFAULT FALSE,
    bumped_at TIMESTAMPTZ DEFAULT NULL,
    qr_checkin_code TEXT DEFAULT NULL,
    plan_tier TEXT DEFAULT 'free',
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_ward_id ON public.events(ward_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_ranking ON public.events (is_urgent DESC NULLS LAST, bumped_at DESC NULLS LAST, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_qr_code ON public.events (qr_checkin_code) WHERE qr_checkin_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_deleted_at ON public.events (deleted_at) WHERE deleted_at IS NULL;

-- 6. Bảng EVENT_POSITIONS (Các vị trí tuyển dụng chi tiết trong sự kiện)
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

CREATE INDEX IF NOT EXISTS idx_event_positions_event_id ON public.event_positions(event_id);

-- 7. Bảng APPLICATIONS (Đơn ứng tuyển sự kiện)
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    position_id UUID REFERENCES public.event_positions(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending'::text, -- pending, approved, rejected
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    attendance_status TEXT DEFAULT 'pending_event'::text, -- pending_event, checked_in, completed, no_show
    student_note TEXT,
    CONSTRAINT unique_event_student_position UNIQUE (event_id, student_id, position_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_event ON public.applications(event_id);
CREATE INDEX IF NOT EXISTS idx_applications_student ON public.applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_position_id ON public.applications(position_id);

-- 8. Bảng CHATS (Cuộc trò chuyện)
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT unique_chat UNIQUE (event_id, student_id, organizer_id)
);

CREATE INDEX IF NOT EXISTS idx_chats_student ON public.chats(student_id);
CREATE INDEX IF NOT EXISTS idx_chats_organizer ON public.chats(organizer_id);

-- 9. Bảng MESSAGES (Tin nhắn trao đổi)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_messages_chat_created ON public.messages(chat_id, created_at);

-- 10. Bảng NOTIFICATIONS (Thông báo hệ thống)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications(user_id, created_at DESC);

-- 11. Bảng EVENT_BOOKMARKS (Việc làm & sự kiện đã lưu)
CREATE TABLE IF NOT EXISTS public.event_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT unique_student_bookmark UNIQUE (student_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_event_bookmarks_student ON public.event_bookmarks(student_id);

-- 12. Bảng REVIEWS (Đánh giá uy tín hai chiều)
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

CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON public.reviews(reviewee_id);

-- 13. Bảng TRANSACTIONS (Lịch sử giao dịch & cổng thanh toán PayOS)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL,
    billing_cycle TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    order_code BIGINT UNIQUE,
    payment_link_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_order_code ON public.transactions(order_code);

-- 14. Bảng FEEDBACKS (Góp ý & phản hồi người dùng)
CREATE TABLE IF NOT EXISTS public.feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'guest',
    category TEXT NOT NULL DEFAULT 'general',
    rating INT CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    admin_note TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_feedbacks_user ON public.feedbacks(user_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON public.feedbacks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON public.feedbacks(status);

