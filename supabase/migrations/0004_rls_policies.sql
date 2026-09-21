-- =========================================================================
-- MIGRATION 0004: CHÍNH SÁCH BẢO MẬT HÀNG (ROW LEVEL SECURITY & POLICIES)
-- =========================================================================

-- Bật Row Level Security (RLS) cho tất cả 16 bảng dữ liệu
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
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------------
-- 1. Bảng DANANG_WARDS
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Cho phép mọi người xem danh sách Phường Xã" ON public.danang_wards;
CREATE POLICY "Cho phép mọi người xem danh sách Phường Xã" 
  ON public.danang_wards FOR SELECT USING (true);

-- -------------------------------------------------------------------------
-- 2. Bảng PROFILES
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." 
  ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- -------------------------------------------------------------------------
-- 3. Bảng EVENTS
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Ai cũng có thể xem sự kiện" ON public.events;
CREATE POLICY "Ai cũng có thể xem sự kiện" 
  ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "BTC được tạo sự kiện" ON public.events;
CREATE POLICY "BTC được tạo sự kiện" 
  ON public.events FOR INSERT WITH CHECK (auth.uid() = organizer_id);

DROP POLICY IF EXISTS "BTC tự sửa sự kiện" ON public.events;
CREATE POLICY "BTC tự sửa sự kiện" 
  ON public.events FOR UPDATE USING (auth.uid() = organizer_id);

DROP POLICY IF EXISTS "BTC được xóa sự kiện" ON public.events;
CREATE POLICY "BTC được xóa sự kiện" 
  ON public.events FOR DELETE USING (auth.uid() = organizer_id);

-- -------------------------------------------------------------------------
-- 4. Bảng APPLICATIONS
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read on applications" ON public.applications;
CREATE POLICY "Allow public read on applications" 
  ON public.applications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow students to insert their own applications" ON public.applications;
CREATE POLICY "Allow students to insert their own applications" 
  ON public.applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Allow students to delete their own applications" ON public.applications;
CREATE POLICY "Allow students to delete their own applications" 
  ON public.applications FOR DELETE TO authenticated USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "applications_update_organizer_only" ON public.applications;
CREATE POLICY "applications_update_organizer_only" 
  ON public.applications FOR UPDATE TO authenticated 
  USING (auth.uid() IN (SELECT events.organizer_id FROM public.events WHERE events.id = applications.event_id))
  WITH CHECK (auth.uid() IN (SELECT events.organizer_id FROM public.events WHERE events.id = applications.event_id));

-- -------------------------------------------------------------------------
-- 5. Bảng CHATS
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow select for chat participants" ON public.chats;
CREATE POLICY "Allow select for chat participants" 
  ON public.chats FOR SELECT USING ((auth.uid() = student_id) OR (auth.uid() = organizer_id));

DROP POLICY IF EXISTS "Allow insert for chat participants" ON public.chats;
CREATE POLICY "Allow insert for chat participants" 
  ON public.chats FOR INSERT WITH CHECK ((auth.uid() = student_id) OR (auth.uid() = organizer_id));

-- -------------------------------------------------------------------------
-- 6. Bảng MESSAGES
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow select for message participants" ON public.messages;
CREATE POLICY "Allow select for message participants" 
  ON public.messages FOR SELECT USING (
    (auth.uid() IN (SELECT chats.student_id FROM public.chats WHERE chats.id = messages.chat_id)) OR 
    (auth.uid() IN (SELECT chats.organizer_id FROM public.chats WHERE chats.id = messages.chat_id))
  );

DROP POLICY IF EXISTS "Allow insert for message sender" ON public.messages;
CREATE POLICY "Allow insert for message sender" 
  ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Allow delete for message participants" ON public.messages;
CREATE POLICY "Allow delete for message participants" 
  ON public.messages FOR DELETE USING (
    (auth.uid() IN (SELECT chats.student_id FROM public.chats WHERE chats.id = messages.chat_id)) OR 
    (auth.uid() IN (SELECT chats.organizer_id FROM public.chats WHERE chats.id = messages.chat_id))
  );

-- -------------------------------------------------------------------------
-- 7. Bảng NOTIFICATIONS
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Xem thông báo cá nhân" ON public.notifications;
CREATE POLICY "Xem thông báo cá nhân" 
  ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert_authenticated" ON public.notifications;
CREATE POLICY "notifications_insert_authenticated" 
  ON public.notifications FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Đánh dấu đã đọc" ON public.notifications;
CREATE POLICY "Đánh dấu đã đọc" 
  ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_delete_self" ON public.notifications;
CREATE POLICY "notifications_delete_self"
  ON public.notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- -------------------------------------------------------------------------
-- 8. Bảng EVENT_BOOKMARKS
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow users to select their own bookmarks" ON public.event_bookmarks;
CREATE POLICY "Allow users to select their own bookmarks" 
  ON public.event_bookmarks FOR SELECT TO authenticated USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Allow users to insert their own bookmarks" ON public.event_bookmarks;
CREATE POLICY "Allow users to insert their own bookmarks" 
  ON public.event_bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Allow users to delete their own bookmarks" ON public.event_bookmarks;
CREATE POLICY "Allow users to delete their own bookmarks" 
  ON public.event_bookmarks FOR DELETE TO authenticated USING (auth.uid() = student_id);

-- -------------------------------------------------------------------------
-- 9. Bảng REVIEWS
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow select for reviews" ON public.reviews;
CREATE POLICY "Allow select for reviews" 
  ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert for reviews" ON public.reviews;
CREATE POLICY "Allow insert for reviews" 
  ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- -------------------------------------------------------------------------
-- 10. Bảng EVENT_CATEGORIES & JOB_POSITIONS
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Cho phép mọi người xem danh mục" ON public.event_categories;
CREATE POLICY "Cho phép mọi người xem danh mục" 
  ON public.event_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Cho phép mọi người xem vị trí công việc" ON public.job_positions;
CREATE POLICY "Cho phép mọi người xem vị trí công việc" 
  ON public.job_positions FOR SELECT USING (true);

-- -------------------------------------------------------------------------
-- 11. Bảng INTERVIEWS
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "interviews_select_participants" ON public.interviews;
CREATE POLICY "interviews_select_participants" 
  ON public.interviews FOR SELECT TO authenticated
  USING (auth.uid() = student_id OR auth.uid() = organizer_id);

DROP POLICY IF EXISTS "interviews_insert_organizer" ON public.interviews;
CREATE POLICY "interviews_insert_organizer" 
  ON public.interviews FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = organizer_id
    AND auth.uid() IN (SELECT organizer_id FROM public.events WHERE id = event_id)
  );

DROP POLICY IF EXISTS "interviews_update_participants" ON public.interviews;
CREATE POLICY "interviews_update_participants" 
  ON public.interviews FOR UPDATE TO authenticated
  USING (auth.uid() = student_id OR auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = student_id OR auth.uid() = organizer_id);

DROP POLICY IF EXISTS "interviews_delete_organizer" ON public.interviews;
CREATE POLICY "interviews_delete_organizer" 
  ON public.interviews FOR DELETE TO authenticated
  USING (auth.uid() = organizer_id);

-- -------------------------------------------------------------------------
-- 12. Bảng PROFILE_VIEWS
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their profile view stats or what they viewed" ON public.profile_views;
CREATE POLICY "Users can view their profile view stats or what they viewed"
  ON public.profile_views FOR SELECT
  USING (auth.uid() = student_id OR auth.uid() = viewer_id);

DROP POLICY IF EXISTS "Authenticated users can record a profile view" ON public.profile_views;
CREATE POLICY "Authenticated users can record a profile view"
  ON public.profile_views FOR INSERT
  WITH CHECK (auth.uid() = viewer_id AND auth.uid() != student_id);

-- -------------------------------------------------------------------------
-- 13. Bảng PROFILE_LIKES
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view profile likes" ON public.profile_likes;
CREATE POLICY "Users can view profile likes"
  ON public.profile_likes FOR SELECT
  USING (auth.uid() = student_id OR auth.uid() = organizer_id);

DROP POLICY IF EXISTS "Organizers can like a profile" ON public.profile_likes;
CREATE POLICY "Organizers can like a profile"
  ON public.profile_likes FOR INSERT
  WITH CHECK (auth.uid() = organizer_id AND auth.uid() != student_id);

DROP POLICY IF EXISTS "Organizers can unlike a profile" ON public.profile_likes;
CREATE POLICY "Organizers can unlike a profile"
  ON public.profile_likes FOR DELETE
  USING (auth.uid() = organizer_id);

-- -------------------------------------------------------------------------
-- 14. Bảng COMPANY_FOLLOWS
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view company follows" ON public.company_follows;
CREATE POLICY "Anyone can view company follows"
  ON public.company_follows FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can follow companies" ON public.company_follows;
CREATE POLICY "Users can follow companies"
  ON public.company_follows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unfollow companies" ON public.company_follows;
CREATE POLICY "Users can unfollow companies"
  ON public.company_follows FOR DELETE
  USING (auth.uid() = user_id);

-- -------------------------------------------------------------------------
-- 15. Bảng TRANSACTIONS
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own transactions or admin can view all" ON public.transactions;
CREATE POLICY "Users can view their own transactions or admin can view all"
  ON public.transactions FOR SELECT
  USING (
    auth.uid() = user_id 
    OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can insert transactions" ON public.transactions;
CREATE POLICY "Users can insert transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
