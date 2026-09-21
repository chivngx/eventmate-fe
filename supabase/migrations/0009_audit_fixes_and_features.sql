-- =========================================================================
-- MIGRATION 0009: BỔ SUNG CỘT HỒ SƠ SINH VIÊN, BẢNG THEO DÕI VÀ GIAO DỊCH VIP
-- =========================================================================

-- 1. Bổ sung các cột hồ sơ năng lực sinh viên vào bảng PROFILES
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS experiences JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS social_link TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS birth_year INT;

-- 2. Bảng COMPANY_FOLLOWS (Theo dõi công ty / nhà tổ chức sự kiện)
CREATE TABLE IF NOT EXISTS public.company_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_user_organizer_follow UNIQUE (user_id, organizer_id)
);

CREATE INDEX IF NOT EXISTS idx_company_follows_user ON public.company_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_company_follows_organizer ON public.company_follows(organizer_id);

-- Bật RLS cho company_follows
ALTER TABLE public.company_follows ENABLE ROW LEVEL SECURITY;

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

GRANT ALL ON TABLE public.company_follows TO authenticated, service_role, postgres;

-- 3. Bảng TRANSACTIONS (Lịch sử giao dịch & đăng ký gói VIP)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL,
    billing_cycle TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- Bật RLS cho transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

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

GRANT ALL ON TABLE public.transactions TO authenticated, service_role, postgres;

-- 4. Cập nhật hàm prevent_self_premium_update để cho phép RPC kích hoạt VIP
CREATE OR REPLACE FUNCTION public.prevent_self_premium_update()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
    -- Cho phép cập nhật nếu được gọi qua RPC có đặt biến cờ checkout
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

-- 5. Hàm RPC hoàn tất thanh toán & kích hoạt gói VIP an toàn
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

    -- Đặt biến cờ phiên làm việc để trigger cho phép cập nhật VIP
    PERFORM set_config('eventmate.checkout_in_progress', 'true', true);

    -- Cập nhật gói VIP cho người dùng
    UPDATE public.profiles
    SET is_premium = TRUE,
        premium_until = v_until
    WHERE id = v_user_id;

    -- Đặt lại biến cờ
    PERFORM set_config('eventmate.checkout_in_progress', 'false', true);

    -- Ghi nhận lịch sử giao dịch vào bảng transactions
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

GRANT EXECUTE ON FUNCTION public.complete_checkout_transaction(TEXT, TEXT, TEXT, NUMERIC) TO authenticated, service_role, postgres;

-- 6. Cho phép người tham gia cuộc trò chuyện xóa tin nhắn
DROP POLICY IF EXISTS "Allow delete for message participants" ON public.messages;
CREATE POLICY "Allow delete for message participants" 
  ON public.messages FOR DELETE USING (
    (auth.uid() IN (SELECT chats.student_id FROM public.chats WHERE chats.id = messages.chat_id)) OR 
    (auth.uid() IN (SELECT chats.organizer_id FROM public.chats WHERE chats.id = messages.chat_id))
  );
