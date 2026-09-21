-- 0011_payos_transactions.sql
-- Tích hợp cổng thanh toán payOS vào EventMate

-- 1. Bổ sung các cột lưu mã đơn hàng và ID link thanh toán của payOS
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS order_code BIGINT UNIQUE,
ADD COLUMN IF NOT EXISTS payment_link_id TEXT;

CREATE INDEX IF NOT EXISTS idx_transactions_order_code ON public.transactions(order_code);

-- 2. Hàm RPC xác nhận thanh toán payOS thành công (được gọi từ Webhook hoặc Server Action)
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
    -- Tìm giao dịch theo order_code
    SELECT * INTO v_tx 
    FROM public.transactions 
    WHERE order_code = p_order_code;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'Không tìm thấy giao dịch với mã: ' || p_order_code
        );
    END IF;

    -- Nếu giao dịch đã được xác nhận hoàn tất trước đó (Idempotency)
    IF v_tx.status = 'completed' THEN
        RETURN jsonb_build_object(
            'success', true, 
            'already_completed', true,
            'user_id', v_tx.user_id
        );
    END IF;

    -- Tính thời hạn gói dịch vụ
    IF v_tx.billing_cycle = 'yearly' THEN
        v_duration := INTERVAL '365 days';
    ELSE
        v_duration := INTERVAL '30 days';
    END IF;

    v_until := NOW() + v_duration;

    -- Cho phép trigger bỏ qua kiểm tra cập nhật VIP
    PERFORM set_config('eventmate.checkout_in_progress', 'true', true);

    -- Cập nhật trạng thái VIP cho tài khoản
    UPDATE public.profiles
    SET is_premium = TRUE,
        premium_until = v_until
    WHERE id = v_tx.user_id;

    -- Tắt cờ phiên làm việc
    PERFORM set_config('eventmate.checkout_in_progress', 'false', true);

    -- Cập nhật trạng thái giao dịch
    UPDATE public.transactions
    SET status = 'completed'
    WHERE id = v_tx.id;

    -- Tạo thông báo hệ thống cho người dùng
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

GRANT EXECUTE ON FUNCTION public.confirm_payos_payment(BIGINT) TO anon, authenticated, service_role, postgres;
