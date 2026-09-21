-- =========================================================================
-- MIGRATION 0002: HÀM LƯU TRỮ HỆ THỐNG (STORED FUNCTIONS & RPCS)
-- =========================================================================

-- 1. Hàm helper chuyển đổi chuỗi tiếng Việt có dấu thành Slug không dấu
CREATE OR REPLACE FUNCTION public.slugify(t TEXT)
RETURNS TEXT AS $$
DECLARE
  val TEXT;
BEGIN
  val := lower(t);
  val := regexp_replace(val, '[àáạảãâầấậẩẫăằắặẳẵ]', 'a', 'g');
  val := regexp_replace(val, '[èéẹẻẽêềếệểễ]', 'e', 'g');
  val := regexp_replace(val, '[ìíịỉĩ]', 'i', 'g');
  val := regexp_replace(val, '[òóọỏõôồốộổỗơờớợởỡ]', 'o', 'g');
  val := regexp_replace(val, '[ùúụủũưừứựửữ]', 'u', 'g');
  val := regexp_replace(val, '[ỳýỵỷỹ]', 'y', 'g');
  val := regexp_replace(val, '[đ]', 'd', 'g');
  val := regexp_replace(val, '[^a-z0-9\s-]', '', 'g');
  val := regexp_replace(val, '[\s-]+', '-', 'g');
  val := trim(both '-' from val);
  RETURN val;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Tự động đồng bộ tài khoản mới từ auth.users sang profiles
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

-- 3. Tự động tính toán % hoàn thiện hồ sơ CV
CREATE OR REPLACE FUNCTION public.calculate_cv_completion()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
DECLARE
    _score INT := 0;
BEGIN
    IF NEW.full_name IS NOT NULL AND NEW.full_name != '' THEN _score := _score + 15; END IF;
    IF NEW.avatar_url IS NOT NULL AND NEW.avatar_url != '' THEN _score := _score + 25; END IF;
    IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN _score := _score + 20; END IF;
    IF NEW.university IS NOT NULL AND NEW.university != '' THEN _score := _score + 15; END IF;
    IF NEW.experiences IS NOT NULL AND jsonb_array_length(NEW.experiences) > 0 THEN _score := _score + 15; END IF;
    IF NEW.skills IS NOT NULL AND NEW.skills != '' THEN _score := _score + 5; END IF;
    IF (NEW.bio IS NOT NULL AND NEW.bio != '') OR (NEW.cv_url IS NOT NULL AND NEW.cv_url != '') THEN _score := _score + 5; END IF;
    
    NEW.cv_completion_percent := LEAST(_score, 100);
    RETURN NEW;
END;
$$;

-- 4. Bắn thông báo cho Nhà tuyển dụng khi có đơn ứng tuyển mới
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

-- 5. Bắn thông báo cho Sinh viên khi được Duyệt / Từ chối đơn
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

-- 6. Quản lý slots_needed khi đơn nộp được duyệt / hủy duyệt
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

-- 7. Tự động tạo slug cho profiles
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

-- 8. Tự động tạo slug cho events
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

-- 9. Chặn người dùng tự nâng VIP (chỉ cho phép qua cờ checkout)
CREATE OR REPLACE FUNCTION public.prevent_self_premium_update()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
    IF current_setting('eventmate.checkout_in_progress', true) = 'true' THEN
        RETURN NEW;
    END IF;

    IF auth.uid() = NEW.id
       AND (NEW.is_premium IS DISTINCT FROM OLD.is_premium
            OR NEW.premium_until IS DISTINCT FROM OLD.premium_until) THEN
        RAISE EXCEPTION 'Không thể tự thay đổi trạng thái VIP. Vui lòng mua gói dịch vụ.';
    END IF;
    RETURN NEW;
END;
$$;

-- 10. Helper RPC ghi nhận lượt xem hồ sơ sinh viên (tránh spam trong ngày)
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
    
    IF v_viewer_id IS NULL OR v_viewer_id = p_student_id THEN
        RETURN FALSE;
    END IF;

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

-- 11. Thông báo tự động khi thay đổi trạng thái điểm danh (attendance_status)
CREATE OR REPLACE FUNCTION public.notify_student_on_attendance_change()
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
    IF OLD.attendance_status IS DISTINCT FROM NEW.attendance_status THEN
        SELECT title INTO _event_title FROM public.events WHERE id = NEW.event_id;
        
        IF NEW.attendance_status = 'checked_in' THEN
            _notif_title := '✅ Điểm danh thành công!';
            _notif_message := 'Bạn đã được xác nhận điểm danh có mặt tại sự kiện "' || COALESCE(_event_title, 'sự kiện') || '". Chúc bạn có một ngày làm việc hiệu quả!';
        ELSIF NEW.attendance_status = 'completed' THEN
            _notif_title := '🎉 Hoàn thành sự kiện xuất sắc!';
            _notif_message := 'Chúc mừng bạn đã hoàn thành nhiệm vụ tại "' || COALESCE(_event_title, 'sự kiện') || '". Bạn có thể xem chứng nhận và gửi đánh giá cho Ban tổ chức ngay bây giờ!';
        ELSIF NEW.attendance_status = 'no_show' THEN
            _notif_title := '⚠️ Thông báo vắng mặt';
            _notif_message := 'Hệ thống ghi nhận bạn đã không có mặt tại sự kiện "' || COALESCE(_event_title, 'sự kiện') || '". Hãy liên hệ Ban tổ chức nếu có nhầm lẫn.';
        END IF;

        IF _notif_title IS NOT NULL THEN
            INSERT INTO public.notifications (user_id, title, message)
            VALUES (NEW.student_id, _notif_title, _notif_message);
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

-- 12. RPC kích hoạt VIP và ghi nhận giao dịch trực tiếp
CREATE OR REPLACE FUNCTION public.complete_checkout_transaction(
    p_plan_id TEXT,
    p_billing_cycle TEXT,
    p_payment_method TEXT,
    p_amount NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_duration INTERVAL;
    v_until TIMESTAMPTZ;
    v_tx_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Bạn cần đăng nhập để thực hiện thanh toán.';
    END IF;

    IF p_billing_cycle = 'yearly' THEN
        v_duration := INTERVAL '365 days';
    ELSE
        v_duration := INTERVAL '30 days';
    END IF;

    v_until := NOW() + v_duration;

    PERFORM set_config('eventmate.checkout_in_progress', 'true', true);

    UPDATE public.profiles
    SET is_premium = TRUE,
        premium_until = v_until
    WHERE id = v_user_id;

    PERFORM set_config('eventmate.checkout_in_progress', 'false', true);

    INSERT INTO public.transactions (user_id, plan_id, billing_cycle, amount, payment_method, status)
    VALUES (v_user_id, p_plan_id, p_billing_cycle, p_amount, p_payment_method, 'completed')
    RETURNING id INTO v_tx_id;

    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', v_tx_id,
        'premium_until', v_until
    );
END;
$$;

-- 13. RPC xác nhận thanh toán PayOS webhook
CREATE OR REPLACE FUNCTION public.confirm_payos_payment(
    p_order_code BIGINT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tx RECORD;
    v_duration INTERVAL;
    v_until TIMESTAMPTZ;
    v_plan_title TEXT;
BEGIN
    SELECT * INTO v_tx 
    FROM public.transactions 
    WHERE order_code = p_order_code;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'Không tìm thấy giao dịch với mã: ' || p_order_code
        );
    END IF;

    IF v_tx.status = 'completed' THEN
        RETURN jsonb_build_object(
            'success', true, 
            'already_completed', true,
            'user_id', v_tx.user_id
        );
    END IF;

    IF v_tx.billing_cycle = 'yearly' THEN
        v_duration := INTERVAL '365 days';
    ELSE
        v_duration := INTERVAL '30 days';
    END IF;

    v_until := NOW() + v_duration;

    PERFORM set_config('eventmate.checkout_in_progress', 'true', true);

    UPDATE public.profiles
    SET is_premium = TRUE,
        premium_until = v_until
    WHERE id = v_tx.user_id;

    PERFORM set_config('eventmate.checkout_in_progress', 'false', true);

    UPDATE public.transactions
    SET status = 'completed'
    WHERE id = v_tx.id;

    v_plan_title := UPPER(v_tx.plan_id);
    INSERT INTO public.notifications (user_id, title, message, is_read)
    VALUES (
        v_tx.user_id,
        'Nâng cấp VIP thành công!',
        'Gói dịch vụ ' || v_plan_title || ' (' || (CASE WHEN v_tx.billing_cycle = 'yearly' THEN 'Theo năm' ELSE 'Theo tháng' END) || ') đã được kích hoạt thành công qua payOS. Hạn dùng đến: ' || TO_CHAR(v_until, 'DD/MM/YYYY') || '.',
        FALSE
    );

    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', v_tx.id,
        'user_id', v_tx.user_id,
        'plan_id', v_tx.plan_id,
        'premium_until', v_until
    );
END;
$$;
