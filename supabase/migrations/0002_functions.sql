-- =========================================================================
-- MIGRATION 0002: HÀM LƯU TRỮ HỆ THỐNG (STORED FUNCTIONS)
-- =========================================================================

-- 1. Hàm helper chuyển đổi Tiếng Việt có dấu thành chuỗi Slug không dấu
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

-- 2. Hàm tự động đồng bộ tài khoản mới đăng ký sang profiles (Security Definer)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role, 
    avatar_url
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1),
      'Thành viên mới'
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'role',
      'student'
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url);

  RETURN NEW;
END;
$$;

-- 3. Hàm tự động tính toán % hoàn thiện hồ sơ CV
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

-- 4. Hàm tự động bắn thông báo cho Nhà tuyển dụng khi có đơn ứng tuyển mới
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

-- 5. Hàm tự động bắn thông báo cho Sinh viên khi được Duyệt / Từ chối đơn
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

-- 6. Hàm tự động cập nhật số lượng slot cần tuyển (slots_needed) khi đơn nộp được duyệt / hủy duyệt
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

-- 7. Hàm tự động sinh slug cho profiles (có hậu tố random 4 ký tự tránh trùng lặp)
CREATE OR REPLACE FUNCTION public.generate_profile_slug()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.role = 'organizer' AND (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.full_name IS DISTINCT FROM OLD.full_name)) THEN
    NEW.slug := public.slugify(NEW.full_name) || '-' || substring(md5(random()::text) from 1 for 4);
  END IF;
  RETURN NEW;
END;
$$;

-- 8. Hàm tự động sinh slug cho events (có hậu tố random 6 ký tự tránh trùng lặp)
CREATE OR REPLACE FUNCTION public.generate_event_slug()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.title IS DISTINCT FROM OLD.title) THEN
    NEW.slug := public.slugify(NEW.title) || '-' || substring(md5(random()::text) from 1 for 6);
  END IF;
  RETURN NEW;
END;
$$;

-- 9. Hàm chặn người dùng tự nâng cấp gói VIP (chỉ service_role/webhook mới được cập nhật)
CREATE OR REPLACE FUNCTION public.prevent_self_premium_update()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
    IF auth.uid() = NEW.id
       AND (NEW.is_premium IS DISTINCT FROM OLD.is_premium
            OR NEW.premium_until IS DISTINCT FROM OLD.premium_until) THEN
        RAISE EXCEPTION 'Không thể tự thay đổi trạng thái VIP. Vui lòng mua gói dịch vụ.';
    END IF;
    RETURN NEW;
END;
$$;
