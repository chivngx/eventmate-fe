-- =========================================================================
-- PHẦN 1: KHỞI TẠO CÁC BẢNG DỮ LIỆU (TABLES)
-- Thiết lập cấu trúc cơ bản cho hệ thống
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
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student', -- student hoặc organizer
    avatar_url TEXT,
    phone TEXT,
    university TEXT,
    bio TEXT,
    skills TEXT,
    cv_completion_percent INT DEFAULT 0, -- Tự động tính toán bằng Trigger
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Bảng EVENTS (Sự kiện & Vị trí tuyển dụng)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT, -- Số nhà / tên đường cụ thể
    ward_id INT REFERENCES public.danang_wards(id), -- Khóa ngoại liên kết địa giới hành chính Đà Nẵng
    event_date TIMESTAMP WITH TIME ZONE,
    application_deadline TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'upcoming', -- upcoming, ongoing, completed
    position_type TEXT DEFAULT 'Tình nguyện', -- Tình nguyện, Part-time, Freelance, CTV
    benefits TEXT DEFAULT 'Thỏa thuận',        -- Có Certificate, Phụ cấp, Thỏa thuận
    category TEXT DEFAULT 'Khác',             -- Lễ hội, Workshop, Thể thao, Công nghệ...
    slots_needed INT DEFAULT 1,               -- Số lượng nhân sự cần tuyển
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Bảng APPLICATIONS (Đơn ứng tuyển)
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_event_student UNIQUE (event_id, student_id)
);

-- 5. Bảng NOTIFICATIONS (Thông báo hệ thống)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Bảng EVENT_BOOKMARKS (Việc làm đã lưu)
CREATE TABLE IF NOT EXISTS public.event_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_student_bookmark UNIQUE (student_id, event_id)
);


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

-- Làm sạch luật cũ
DROP POLICY IF EXISTS "Cho phép mọi người xem danh sách Phường Xã" ON public.danang_wards;
DROP POLICY IF EXISTS "Cho phép mọi người đọc profile" ON public.profiles;
DROP POLICY IF EXISTS "Cho phép người dùng tự sửa profile của mình" ON public.profiles;
DROP POLICY IF EXISTS "Ai cũng có thể xem sự kiện" ON public.events;
DROP POLICY IF EXISTS "BTC được tạo sự kiện" ON public.events;
DROP POLICY IF EXISTS "BTC tự sửa sự kiện" ON public.events;
DROP POLICY IF EXISTS "BTC được xóa sự kiện" ON public.events;
DROP POLICY IF EXISTS "Xem đơn ứng tuyển" ON public.applications;
DROP POLICY IF EXISTS "Sinh viên nộp đơn" ON public.applications;
DROP POLICY IF EXISTS "BTC duyệt đơn" ON public.applications;
DROP POLICY IF EXISTS "Xem thông báo cá nhân" ON public.notifications;
DROP POLICY IF EXISTS "Bắn thông báo tự do" ON public.notifications;
DROP POLICY IF EXISTS "Đánh dấu đã đọc" ON public.notifications;
DROP POLICY IF EXISTS "Sinh viên xem danh sách đã lưu" ON public.event_bookmarks;
DROP POLICY IF EXISTS "Sinh viên thao tác lưu/hủy lưu" ON public.event_bookmarks;

-- Thiết lập các Policies mới
CREATE POLICY "Cho phép mọi người xem danh sách Phường Xã" ON public.danang_wards FOR SELECT USING (true);

CREATE POLICY "Cho phép mọi người đọc profile" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Cho phép người dùng tự sửa profile của mình" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Ai cũng có thể xem sự kiện" ON public.events FOR SELECT USING (true);
CREATE POLICY "BTC được tạo sự kiện" ON public.events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "BTC tự sửa sự kiện" ON public.events FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "BTC được xóa sự kiện" ON public.events FOR DELETE USING (auth.uid() = organizer_id);

CREATE POLICY "Xem đơn ứng tuyển" ON public.applications FOR SELECT USING (true);
CREATE POLICY "Sinh viên nộp đơn" ON public.applications FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "BTC duyệt đơn" ON public.applications FOR UPDATE USING (auth.uid() IN (SELECT organizer_id FROM public.events WHERE id = event_id));

CREATE POLICY "Xem thông báo cá nhân" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Bắn thông báo tự do" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Đánh dấu đã đọc" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Sinh viên xem danh sách đã lưu" ON public.event_bookmarks FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Sinh viên thao tác lưu/hủy lưu" ON public.event_bookmarks FOR ALL USING (auth.uid() = student_id);


-- =========================================================================
-- PHẦN 3: HÀM XỬ LÝ LƯU TRỮ (STORED FUNCTIONS)
-- =========================================================================

-- 1. Hàm tự động đồng bộ tài khoản mới đăng ký sang profiles
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
END;
$$; -- Đóng vai trò giữ cấu trúc trống (Logic notification đã chuyển sang xử lý động ở FE)

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
    -- Trường hợp UPDATE trạng thái ứng tuyển
    IF TG_OP = 'UPDATE' THEN
        -- Duyệt nhận -> Giảm slots cần tuyển
        IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'approved' THEN
            UPDATE public.events
            SET slots_needed = GREATEST(0, slots_needed - 1)
            WHERE id = NEW.event_id;
            
            UPDATE public.events
            SET status = 'completed'
            WHERE id = NEW.event_id AND slots_needed = 0;
            
        -- Hoàn tác duyệt -> Cộng lại slots cần tuyển
        ELSIF OLD.status = 'approved' AND NEW.status IS DISTINCT FROM 'approved' THEN
            UPDATE public.events
            SET slots_needed = slots_needed + 1
            WHERE id = NEW.event_id;
            
            UPDATE public.events
            SET status = 'upcoming'
            WHERE id = NEW.event_id AND status = 'completed';
        END IF;
        
    -- Trường hợp DELETE đơn ứng tuyển (Rút đơn)
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


-- =========================================================================
-- PHẦN 4: ĐĂNG KÝ CÁC TRÌNH KÍCH HOẠT TỰ ĐỘNG (TRIGGERS)
-- =========================================================================

-- Trigger 1: Tạo profile khi đăng ký auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger 2: Tính toán độ hoàn thiện CV
DROP TRIGGER IF EXISTS trg_calculate_cv_completion ON public.profiles;
CREATE TRIGGER trg_calculate_cv_completion
  BEFORE INSERT OR UPDATE OF full_name, avatar_url, phone, university, skills ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.calculate_cv_completion();

-- Trigger 3: Gửi thông báo kết quả duyệt đơn cho Sinh viên
DROP TRIGGER IF EXISTS trg_notify_student_on_status_change ON public.applications;
CREATE TRIGGER trg_notify_student_on_status_change
  AFTER UPDATE OF status ON public.applications
  FOR EACH ROW EXECUTE PROCEDURE public.notify_student_on_status_change();

-- Trigger 4: Điều chỉnh slots tuyển dụng khi duyệt ứng viên
DROP TRIGGER IF EXISTS trg_manage_slots_on_approval ON public.applications;
CREATE TRIGGER trg_manage_slots_on_approval
  AFTER UPDATE OF status OR DELETE ON public.applications
  FOR EACH ROW EXECUTE PROCEDURE public.manage_slots_on_approval();


-- =========================================================================
-- PHẦN 5: PHÂN QUYỀN API TOÀN DIỆN (GRANTS)
-- =========================================================================
GRANT ALL ON TABLE public.danang_wards TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.events TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.applications TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.notifications TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.event_bookmarks TO anon, authenticated, service_role;

-- Tạo bảng chats/conversations nếu chưa có
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_chat UNIQUE (event_id, student_id, organizer_id)
);

-- Tạo bảng messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tạo bảng reviews
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_review UNIQUE (event_id, reviewer_id, reviewee_id)
);

-- Kích hoạt RLS
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Thêm Policies
CREATE POLICY "Allow select for chat participants" ON public.chats FOR SELECT USING (auth.uid() = student_id OR auth.uid() = organizer_id);
CREATE POLICY "Allow insert for chat participants" ON public.chats FOR INSERT WITH CHECK (auth.uid() = student_id OR auth.uid() = organizer_id);

CREATE POLICY "Allow select for message participants" ON public.messages FOR SELECT USING (auth.uid() IN (SELECT student_id FROM public.chats WHERE id = chat_id) OR auth.uid() IN (SELECT organizer_id FROM public.chats WHERE id = chat_id));
CREATE POLICY "Allow insert for message sender" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Allow select for reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow insert for reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Cấp quyền
GRANT ALL ON TABLE public.chats TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.messages TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.reviews TO anon, authenticated, service_role;
