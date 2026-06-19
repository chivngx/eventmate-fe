-- =========================================================================
-- PHẦN 1: KHỞI TẠO & MỞ RỘNG CẤU TRÚC CÁC BẢNG (TABLES)
-- Đảm bảo chứa đầy đủ các trường thông tin hiển thị trên UI của bác
-- =========================================================================

-- 1. Bảng PROFILES (Hồ sơ người dùng)
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
    cv_completion_percent INT DEFAULT 0, -- [MỚI] Tự động tính toán bằng Trigger, Frontend không cần gán cứng nữa
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Bảng EVENTS (Sự kiện & Vị trí tuyển dụng)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    event_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'upcoming', -- upcoming, ongoing, completed
    
    -- [MỚI] Bổ sung các trường để khớp với bộ lọc dữ liệu thực tế trên Mega Menu và Card tuyển dụng
    position_type TEXT DEFAULT 'Tình nguyện', -- Tình nguyện, Part-time, Freelance, C CTV
    benefits TEXT DEFAULT 'Thỏa thuận',        -- Có Certificate, 500k/ngày, Thỏa thuận
    category TEXT DEFAULT 'Khác',             -- Lễ hội Âm nhạc, Workshop, Thể thao, Công nghệ...
    slots_needed INT DEFAULT 1,               -- Số lượng nhân sự cần tuyển
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Bảng APPLICATIONS (Đơn ứng tuyển)
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_event_student UNIQUE (event_id, student_id)
);

-- 4. Bảng NOTIFICATIONS (Thông báo hệ thống)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Bảng EVENT_BOOKMARKS [MỚI HOÀN TOÀN]
-- Phục vụ trực tiếp cho tính năng "Việc làm đã lưu" hiển thị trên Mega Menu của bác
CREATE TABLE IF NOT EXISTS public.event_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_student_bookmark UNIQUE (student_id, event_id) -- Chặn lưu trùng lặp
);


-- =========================================================================
-- PHẦN 2: KÍCH HOẠT BẢO MẬT PHÂN QUYỀN VÀ THIẾT LẬP LUẬT (RLS POLICIES)
-- =========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_bookmarks ENABLE ROW LEVEL SECURITY;

-- Làm sạch luật cũ để tránh xung đột hệ thống
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

-- Thực thi luật bảo mật mới công nghiệp
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
-- PHẦN 3: ĐỊNH NGHĨA CÁC HÀM XỬ LÝ LƯU TRỮ (STORED FUNCTIONS)
-- =========================================================================

-- Hàm 1: Tự động tạo Hồ sơ Public khi có tài khoản mới đăng ký
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

-- Hàm 2: Tự động tính toán % hoàn thiện CV mỗi khi Profile thay đổi dữ liệu
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

-- Hàm 3: Tự động bắn thông báo cho Nhà tuyển dụng khi có Sinh viên bấm Apply
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

-- Hàm 4: Tự động bắn thông báo cho Sinh viên khi Nhà tuyển dụng Duyệt/Từ chối đơn
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


-- =========================================================================
-- PHẦN 4: ĐĂNG KÝ CÁC TRÌNH KÍCH HOẠT TỰ ĐỘNG (TRIGGERS)
-- Vận hành đồng bộ toàn bộ logic hệ thống ngầm
-- =========================================================================

-- Trigger 1: Đồng bộ tài khoản auth sang table profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger 2: Tự động tính toán điểm CV trước khi lưu profile
DROP TRIGGER IF EXISTS trg_calculate_cv_completion ON public.profiles;
CREATE TRIGGER trg_calculate_cv_completion
  BEFORE INSERT OR UPDATE OF full_name, avatar_url, phone, university, skills ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.calculate_cv_completion();

-- Trigger 3: Tự động tạo thông báo cho BTC sau khi sinh viên nộp đơn
DROP TRIGGER IF EXISTS trg_notify_organizer_on_apply ON public.applications;
CREATE TRIGGER trg_notify_organizer_on_apply
  AFTER INSERT ON public.applications
  FOR EACH ROW EXECUTE PROCEDURE public.notify_organizer_on_apply();

-- Trigger 4: Tự động thông báo kết quả cho Sinh viên khi trạng thái đơn thay đổi
DROP TRIGGER IF EXISTS trg_notify_student_on_status_change ON public.applications;
CREATE TRIGGER trg_notify_student_on_status_change
  AFTER UPDATE OF status ON public.applications
  FOR EACH ROW EXECUTE PROCEDURE public.notify_student_on_status_change();


-- =========================================================================
-- PHẦN 5: CẤP QUYỀN API TUYỆT ĐỐI (GRANTS)
-- =========================================================================
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.events TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.applications TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.notifications TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.event_bookmarks TO anon, authenticated, service_role;

-- Thêm cột hạn chót nộp đơn vào bảng events (Cột ngày diễn ra sự kiện event_date đã có sẵn)
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS application_deadline TIMESTAMP WITH TIME ZONE;

-- 1. Định nghĩa hàm xử lý tăng/giảm slots_needed tự động
CREATE OR REPLACE FUNCTION public.manage_slots_on_approval()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Trường hợp 1: UPDATE trạng thái đơn ứng tuyển (Nhà tuyển dụng Duyệt / Từ chối / Hoàn tác)
    IF TG_OP = 'UPDATE' THEN
        -- Nếu trạng thái chuyển từ bất kỳ mốc nào SANG 'approved' -> Giảm slot cần tuyển
        IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'approved' THEN
            UPDATE public.events
            SET slots_needed = GREATEST(0, slots_needed - 1)
            WHERE id = NEW.event_id;
            
            -- Nếu slots_needed chạm mốc 0, tự động đổi status sự kiện sang 'completed' (Đã hoàn thành tuyển)
            UPDATE public.events
            SET status = 'completed'
            WHERE id = NEW.event_id AND slots_needed = 0;
            
        -- Nếu hoàn tác từ 'approved' QUAY VỀ trạng thái khác -> Cộng lại slot cần tuyển
        ELSIF OLD.status = 'approved' AND NEW.status IS DISTINCT FROM 'approved' THEN
            UPDATE public.events
            SET slots_needed = slots_needed + 1
            WHERE id = NEW.event_id;
            
            -- Nếu sự kiện đang ở 'completed' mà được phục hồi slot, chuyển lại về 'upcoming'
            UPDATE public.events
            SET status = 'upcoming'
            WHERE id = NEW.event_id AND status = 'completed';
        END IF;
        
    -- Trường hợp 2: DELETE dòng ứng tuyển (Sinh viên chủ động bấm Rút/Hủy đơn nộp)
    ELSIF TG_OP = 'DELETE' THEN
        -- Chỉ cộng lại slot nếu đơn ứng tuyển bị xóa đó ĐÃ ĐƯỢC DUYỆT trước đó
        IF OLD.status = 'approved' THEN
            UPDATE public.events
            SET slots_needed = slots_needed + 1
            WHERE id = OLD.event_id;
            
            UPDATE public.events
            SET status = 'upcoming'
            WHERE id = OLD.event_id AND status = 'completed';
        END IF;
    END IF;
    
    RETURN NULL; -- Trigger AFTER chỉ cần return NULL
END;
$$;

-- 2. Đăng ký Trigger liên kết trực tiếp vào bảng applications
DROP TRIGGER IF EXISTS trg_manage_slots_on_approval ON public.applications;
CREATE TRIGGER trg_manage_slots_on_approval
  AFTER UPDATE OF status OR DELETE ON public.applications
  FOR EACH ROW EXECUTE PROCEDURE public.manage_slots_on_approval();