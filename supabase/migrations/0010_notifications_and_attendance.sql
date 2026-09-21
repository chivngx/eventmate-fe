-- =========================================================================
-- MIGRATION 0010: BỔ SUNG TRIGGER THÔNG BÁO ĐIỂM DANH & NÂNG CẤP RLS NOTIFICATIONS
-- =========================================================================

-- 1. Cập nhật RLS Policy cho notifications:
-- Cho phép bất kỳ user đã xác thực (authenticated) gửi thông báo (ví dụ giữa BTC và Ứng viên)
DROP POLICY IF EXISTS "notifications_insert_self" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_authenticated" ON public.notifications;
CREATE POLICY "notifications_insert_authenticated" 
  ON public.notifications FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "notifications_delete_self" ON public.notifications;
CREATE POLICY "notifications_delete_self"
  ON public.notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 2. Hàm kích hoạt thông báo tự động cho sinh viên khi điểm danh (attendance_status thay đổi)
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

DROP TRIGGER IF EXISTS trg_notify_student_on_attendance_change ON public.applications;
CREATE TRIGGER trg_notify_student_on_attendance_change
  AFTER UPDATE OF attendance_status ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.notify_student_on_attendance_change();
