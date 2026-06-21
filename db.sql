-- =========================================================================
-- PHẦN 1: KHỞI TẠO CÁC BẢNG DỮ LIỆU (TABLES)
-- Thiết lập cấu trúc cơ bản cho hệ thống dựa trên thông tin thực tế từ database
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
    cv_completion_percent INT DEFAULT 0 -- Tự động tính toán bằng Trigger
);

-- 3. Bảng EVENTS (Sự kiện & Vị trí tuyển dụng)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    event_date TIMESTAMP WITH TIME ZONE,
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

-- Seed data cho danh mục sự kiện
INSERT INTO public.event_categories (name, icon, color) VALUES
('Lễ hội Âm nhạc', 'Music', 'text-rose-500 bg-rose-50 dark:bg-rose-950/20'),
('Hội thảo / Workshop', 'Users2', 'text-blue-500 bg-blue-50 dark:bg-blue-950/20'),
('Giải đấu Thể thao', 'Trophy', 'text-amber-500 bg-amber-50 dark:bg-amber-950/20'),
('Giao lưu Văn hóa', 'Compass', 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'),
('Triển lãm / Hội chợ', 'Landmark', 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20'),
('Sự kiện Công nghệ', 'Cpu', 'text-purple-500 bg-purple-50 dark:bg-purple-950/20')
ON CONFLICT (name) DO UPDATE SET
  icon = EXCLUDED.icon,
  color = EXCLUDED.color;

-- 11. Bảng JOB_POSITIONS (Vị trí công việc tuyển dụng)
CREATE TABLE IF NOT EXISTS public.job_positions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    slug TEXT UNIQUE
);

-- Seed data cho vị trí công việc
INSERT INTO public.job_positions (name) VALUES
('Tình nguyện viên'),
('Điều phối viên (Coordinator)'),
('CTV Truyền thông'),
('Hậu cần & Setup'),
('MC / Hoạt náo viên'),
('Hỗ trợ khách mời')
ON CONFLICT (name) DO NOTHING;


-- =========================================================================
-- PHẦN 2: BẢO MẬT & PHÂN QUYỀN TRUY CẬP (RLS & POLICIES)
-- =========================================================================

-- Kích hoạt Row Level Security (RLS) cho tất cả các bảng
ALTER TABLE public.danang_wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_positions ENABLE ROW LEVEL SECURITY;

-- Tạo các Policy tương ứng từ Policies.csv
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Cho phép mọi người đọc profile" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Cho phép người dùng tự sửa profile của mình" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow select for reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow insert for reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Ai cũng có thể xem sự kiện" ON public.events FOR SELECT USING (true);
CREATE POLICY "BTC được tạo sự kiện" ON public.events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "BTC tự sửa sự kiện" ON public.events FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "BTC được xóa sự kiện" ON public.events FOR DELETE USING (auth.uid() = organizer_id);

CREATE POLICY "Xem đơn ứng tuyển" ON public.applications FOR SELECT USING (true);
CREATE POLICY "Sinh viên nộp đơn" ON public.applications FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "BTC duyệt đơn" ON public.applications FOR UPDATE USING (auth.uid() IN (SELECT events.organizer_id FROM events WHERE events.id = applications.event_id));

CREATE POLICY "Cho phép mọi người xem danh mục" ON public.event_categories FOR SELECT USING (true);
CREATE POLICY "Cho phép mọi người xem vị trí công việc" ON public.job_positions FOR SELECT USING (true);

CREATE POLICY "Xem thông báo cá nhân" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Bắn thông báo tự do" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Đánh dấu đã đọc" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Sinh viên xem danh sách đã lưu" ON public.event_bookmarks FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Sinh viên thao tác lưu/hủy lưu" ON public.event_bookmarks FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "Cho phép mọi người xem danh sách Phường Xã" ON public.danang_wards FOR SELECT USING (true);

CREATE POLICY "Allow select for chat participants" ON public.chats FOR SELECT USING ((auth.uid() = student_id) OR (auth.uid() = organizer_id));
CREATE POLICY "Allow insert for chat participants" ON public.chats FOR INSERT WITH CHECK ((auth.uid() = student_id) OR (auth.uid() = organizer_id));

CREATE POLICY "Allow select for message participants" ON public.messages FOR SELECT USING (((auth.uid() IN (SELECT chats.student_id FROM chats WHERE (chats.id = messages.chat_id))) OR (auth.uid() IN (SELECT chats.organizer_id FROM chats WHERE (chats.id = messages.chat_id)))));
CREATE POLICY "Allow insert for message sender" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);


-- =========================================================================
-- PHẦN 3: HÀM XỬ LÝ LƯU TRỮ (STORED FUNCTIONS)
-- =========================================================================

-- 1. Hàm tự động đồng bộ tài khoản mới đăng ký sang profiles (Security Definer)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, avatar_url)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)), 
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'), 
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- 2. Hàm tự động tính toán % hoàn thiện hồ sơ CV
CREATE OR REPLACE FUNCTION public.calculate_cv_completion()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
DECLARE
    _score INT := 0;
BEGIN
    IF NEW.full_name IS NOT NULL AND NEW.full_name != '' THEN _score := _score + 20; END IF;
    IF NEW.avatar_url IS NOT NULL AND NEW.avatar_url != '' THEN _score := _score + 20; END IF;
    IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN _score := _score + 20; END IF;
    IF NEW.university IS NOT NULL AND NEW.university != '' THEN _score := _score + 20; END IF;
    IF NEW.skills IS NOT NULL AND NEW.skills != '' THEN _score := _score + 20; END IF;
    
    NEW.cv_completion_percent := _score;
    RETURN NEW;
END;
$$;

-- 3. Hàm tự động bắn thông báo cho Nhà tuyển dụng khi có đơn ứng tuyển mới
CREATE OR REPLACE FUNCTION public.notify_organizer_on_apply()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    _org_id UUID;
    _event_title TEXT;
BEGIN
    SELECT organizer_id, title INTO _org_id, _event_title FROM public.events WHERE id = NEW.event_id;
    
    INSERT INTO public.notifications (user_id, title, message)
    VALUES (
        _org_id,
        '📩 Có đơn ứng tuyển mới!',
        'Một ứng viên vừa nộp đơn vào sự kiện "' || _event_title || '". Hãy kiểm tra danh sách ngay!'
    );
    RETURN NEW;
END;
$$;

-- 4. Hàm tự động bắn thông báo cho Sinh viên khi được Duyệt / Từ chối đơn
CREATE OR REPLACE FUNCTION public.notify_student_on_status_change()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    _event_title TEXT;
    _notif_title TEXT;
    _notif_message TEXT;
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status != 'pending' THEN
        SELECT title INTO _event_title FROM public.events WHERE id = NEW.event_id;
        
        IF NEW.status = 'approved' THEN
            _notif_title := '🎉 Chúc mừng bạn trúng tuyển!';
            _notif_message := 'Đơn ứng tuyển của bạn vào chiến dịch "' || _event_title || '" đã được Ban tổ chức phê duyệt thành công.';
        ELSIF NEW.status = 'rejected' THEN
            _notif_title := '✉️ Thư cảm ơn hồ sơ';
            _notif_message := 'Cảm ơn bạn đã quan tâm đến "' || _event_title || '". Rất tiếc vị trí này đã nhận đủ số lượng, hẹn gặp bạn ở sự kiện sau nhé.';
        END IF;

        INSERT INTO public.notifications (user_id, title, message)
        VALUES (NEW.student_id, _notif_title, _notif_message);
    END IF;
    RETURN NEW;
END;
$$;

-- 5. Hàm tự động cập nhật số lượng slot cần tuyển (slots_needed) khi đơn nộp được duyệt / hủy duyệt
CREATE OR REPLACE FUNCTION public.manage_slots_on_approval()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'approved' THEN
            UPDATE public.events
            SET slots_needed = GREATEST(0, slots_needed - 1)
            WHERE id = NEW.event_id;
            
            UPDATE public.events
            SET status = 'completed'
            WHERE id = NEW.event_id AND slots_needed = 0;
            
        ELSIF OLD.status = 'approved' AND NEW.status IS DISTINCT FROM 'approved' THEN
            UPDATE public.events
            SET slots_needed = slots_needed + 1
            WHERE id = NEW.event_id;
            
            UPDATE public.events
            SET status = 'upcoming'
            WHERE id = NEW.event_id AND status = 'completed';
        END IF;
        
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.status = 'approved' THEN
            UPDATE public.events
            SET slots_needed = slots_needed + 1
            WHERE id = OLD.event_id;
            
            UPDATE public.events
            SET status = 'upcoming'
            WHERE id = OLD.event_id AND status = 'completed';
        END IF;
    END IF;
    
    RETURN NULL;
END;
$$;

-- 6. Hàm helper chuyển đổi Tiếng Việt có dấu thành chuỗi Slug không dấu
CREATE OR REPLACE FUNCTION public.slugify(t TEXT)
RETURNS TEXT AS $$
DECLARE
  val TEXT;
BEGIN
  val := lower(t);
  -- Thay thế ký tự tiếng Việt
  val := regexp_replace(val, '[àáạảãâầấậẩẫăằắặẳẵ]', 'a', 'g');
  val := regexp_replace(val, '[èéẹẻẽêềếệểễ]', 'e', 'g');
  val := regexp_replace(val, '[ìíịỉĩ]', 'i', 'g');
  val := regexp_replace(val, '[òóọỏõôồốộổỗơờớợởỡ]', 'o', 'g');
  val := regexp_replace(val, '[ùúụủũưừứựửữ]', 'u', 'g');
  val := regexp_replace(val, '[ỳýỵỷỹ]', 'y', 'g');
  val := regexp_replace(val, '[đ]', 'd', 'g');
  -- Loại bỏ ký tự đặc biệt, giữ lại chữ, số, dấu cách và dấu gạch ngang
  val := regexp_replace(val, '[^a-z0-9\s-]', '', 'g');
  val := regexp_replace(val, '[\s-]+', '-', 'g');
  val := trim(both '-' from val);
  RETURN val;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 7. Hàm tự động sinh slug cho profiles
CREATE OR REPLACE FUNCTION public.generate_profile_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'organizer' AND (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.full_name IS DISTINCT FROM OLD.full_name)) THEN
    NEW.slug := public.slugify(NEW.full_name) || '-' || substring(md5(random()::text) from 1 for 4);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Hàm tự động sinh slug cho events
CREATE OR REPLACE FUNCTION public.generate_event_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.title IS DISTINCT FROM OLD.title) THEN
    NEW.slug := public.slugify(NEW.title) || '-' || substring(md5(random()::text) from 1 for 6);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =========================================================================
-- PHẦN 4: ĐĂNG KÝ CÁC TRÌNH KÍCH HOẠT TỰ ĐỘNG (TRIGGERS)
-- =========================================================================

-- Trigger 1: Tạo profile khi đăng ký auth (Trigger nằm trên schema auth của hệ thống Supabase)
-- (Câu lệnh drop/create này chỉ chạy thành công khi có quyền trên schema auth)
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger 2: Tính toán độ hoàn thiện CV
DROP TRIGGER IF EXISTS trg_calculate_cv_completion ON public.profiles;
CREATE TRIGGER trg_calculate_cv_completion
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.calculate_cv_completion();

-- Trigger 3: Gửi thông báo khi có sinh viên nộp đơn
DROP TRIGGER IF EXISTS trg_notify_organizer_on_apply ON public.applications;
CREATE TRIGGER trg_notify_organizer_on_apply
  AFTER INSERT ON public.applications
  FOR EACH ROW EXECUTE PROCEDURE public.notify_organizer_on_apply();

-- Trigger 4: Gửi thông báo kết quả duyệt đơn cho Sinh viên
DROP TRIGGER IF EXISTS trg_notify_student_on_status_change ON public.applications;
CREATE TRIGGER trg_notify_student_on_status_change
  AFTER UPDATE OF status ON public.applications
  FOR EACH ROW EXECUTE PROCEDURE public.notify_student_on_status_change();

-- Trigger 5: Điều chỉnh slots tuyển dụng khi duyệt ứng viên
DROP TRIGGER IF EXISTS trg_manage_slots_on_approval ON public.applications;
CREATE TRIGGER trg_manage_slots_on_approval
  AFTER UPDATE OF status OR DELETE ON public.applications
  FOR EACH ROW EXECUTE PROCEDURE public.manage_slots_on_approval();

-- Trigger 6: Tự động tạo slug cho Profiles
DROP TRIGGER IF EXISTS trg_generate_profile_slug ON public.profiles;
CREATE TRIGGER trg_generate_profile_slug
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.generate_profile_slug();

-- Trigger 7: Tự động tạo slug cho Events
DROP TRIGGER IF EXISTS trg_generate_event_slug ON public.events;
CREATE TRIGGER trg_generate_event_slug
  BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW EXECUTE PROCEDURE public.generate_event_slug();


-- =========================================================================
-- PHẦN 5: PHÂN QUYỀN API TOÀN DIỆN (GRANTS)
-- =========================================================================

GRANT ALL ON TABLE public.danang_wards TO anon, authenticated, service_role, postgres;
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role, postgres;
GRANT ALL ON TABLE public.events TO anon, authenticated, service_role, postgres;
GRANT ALL ON TABLE public.applications TO anon, authenticated, service_role, postgres;
GRANT ALL ON TABLE public.notifications TO anon, authenticated, service_role, postgres;
GRANT ALL ON TABLE public.event_bookmarks TO anon, authenticated, service_role, postgres;
GRANT ALL ON TABLE public.chats TO anon, authenticated, service_role, postgres;
GRANT ALL ON TABLE public.messages TO anon, authenticated, service_role, postgres;
GRANT ALL ON TABLE public.reviews TO anon, authenticated, service_role, postgres;
GRANT ALL ON TABLE public.event_categories TO anon, authenticated, service_role, postgres;
GRANT ALL ON TABLE public.job_positions TO anon, authenticated, service_role, postgres;


-- =========================================================================
-- PHẦN 6: CẤU HÌNH SUPABASE STORAGE (BUCKET & POLICIES)
-- Cấp quyền lưu trữ file ảnh đại diện (avatars)
-- =========================================================================

-- Tạo bucket 'avatars' nếu chưa tồn tại trong hệ thống storage của Supabase
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Làm sạch các policies cũ trên storage.objects nếu có
DROP POLICY IF EXISTS "Allow public select on avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated insert on avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update on avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete on avatars" ON storage.objects;

-- 1. Cho phép tất cả mọi người xem ảnh đại diện qua URL công khai
CREATE POLICY "Allow public select on avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 2. Cho phép người dùng đã đăng nhập tải ảnh đại diện lên
CREATE POLICY "Allow authenticated insert on avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- 3. Cho phép người dùng đã đăng nhập cập nhật lại ảnh của mình
CREATE POLICY "Allow authenticated update on avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- 4. Cho phép người dùng đã đăng nhập xóa ảnh của mình
CREATE POLICY "Allow authenticated delete on avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

