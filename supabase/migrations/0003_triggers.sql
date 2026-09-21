-- =========================================================================
-- MIGRATION 0003: TRÌNH KÍCH HOẠT TỰ ĐỘNG (TRIGGERS)
-- =========================================================================

-- Trigger 1: Tạo profile khi đăng ký tài khoản (auth.users)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger 2: Tính toán độ hoàn thiện CV
DROP TRIGGER IF EXISTS trg_calculate_cv_completion ON public.profiles;
CREATE TRIGGER trg_calculate_cv_completion
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.calculate_cv_completion();

-- Trigger 3: Gửi thông báo khi có sinh viên nộp đơn
DROP TRIGGER IF EXISTS trg_notify_organizer_on_apply ON public.applications;
CREATE TRIGGER trg_notify_organizer_on_apply
  AFTER INSERT ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.notify_organizer_on_apply();

-- Trigger 4: Gửi thông báo kết quả duyệt đơn cho Sinh viên
DROP TRIGGER IF EXISTS trg_notify_student_on_status_change ON public.applications;
CREATE TRIGGER trg_notify_student_on_status_change
  AFTER UPDATE OF status ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.notify_student_on_status_change();

-- Trigger 5: Điều chỉnh slots tuyển dụng khi duyệt/hủy ứng viên
DROP TRIGGER IF EXISTS trg_manage_slots_on_approval ON public.applications;
CREATE TRIGGER trg_manage_slots_on_approval
  AFTER DELETE OR UPDATE OF status ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.manage_slots_on_approval();

-- Trigger 6: Tự động tạo slug cho Profiles
DROP TRIGGER IF EXISTS trg_generate_profile_slug ON public.profiles;
CREATE TRIGGER trg_generate_profile_slug
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.generate_profile_slug();

-- Trigger 7: Tự động tạo slug cho Events
DROP TRIGGER IF EXISTS trg_generate_event_slug ON public.events;
CREATE TRIGGER trg_generate_event_slug
  BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.generate_event_slug();

-- Trigger 8: Chặn người dùng tự nâng VIP
DROP TRIGGER IF EXISTS trg_prevent_self_premium_update ON public.profiles;
CREATE TRIGGER trg_prevent_self_premium_update
  BEFORE UPDATE OF is_premium, premium_until ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_self_premium_update();
