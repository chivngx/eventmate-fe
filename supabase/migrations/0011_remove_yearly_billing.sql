-- 0011_remove_yearly_billing.sql
-- Remove 12-month yearly subscription logic; lock subscriptions to monthly (30 days) and per-event credits.

CREATE OR REPLACE FUNCTION public.activate_premium_or_credits(
    p_plan_id TEXT,
    p_billing_cycle TEXT,
    p_amount BIGINT,
    p_payment_method TEXT
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

    -- Subscriptions are strictly monthly (30 days) for event organizers
    v_duration := INTERVAL '30 days';
    v_until := NOW() + v_duration;

    PERFORM set_config('eventmate.checkout_in_progress', 'true', true);

    UPDATE public.profiles
    SET is_premium = TRUE,
        premium_until = v_until
    WHERE id = v_user_id;

    PERFORM set_config('eventmate.checkout_in_progress', 'false', true);

    INSERT INTO public.transactions (user_id, plan_id, billing_cycle, amount, payment_method, status)
    VALUES (v_user_id, p_plan_id, 'monthly', p_amount, p_payment_method, 'completed')
    RETURNING id INTO v_tx_id;

    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', v_tx_id,
        'premium_until', v_until
    );
END;
$$;

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
    v_is_single_event BOOLEAN;
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

    v_is_single_event := (v_tx.plan_id = 'single_event');

    PERFORM set_config('eventmate.checkout_in_progress', 'true', true);

    IF v_is_single_event THEN
        -- Gói Sự Kiện Nhanh (99k / 1 tin): Cộng 1 lượt đăng Sự Kiện Nhanh
        UPDATE public.profiles
        SET single_event_credits = COALESCE(single_event_credits, 0) + 1
        WHERE id = v_tx.user_id;

        INSERT INTO public.notifications (user_id, title, message, is_read)
        VALUES (
            v_tx.user_id,
            'Kích hoạt Sự Kiện Nhanh thành công!',
            'Bạn đã kích hoạt thành công 1 lượt đăng Sự Kiện Nhanh (99.000đ). Khi đăng tin, sự kiện sẽ được ghim Tuyển Gấp và cấp mã QR Điểm danh tự động.',
            FALSE
        );
    ELSE
        -- Gói Doanh Nghiệp (499k / tháng)
        v_duration := INTERVAL '30 days';
        v_until := NOW() + v_duration;

        UPDATE public.profiles
        SET is_premium = TRUE,
            premium_until = v_until
        WHERE id = v_tx.user_id;

        v_plan_title := UPPER(v_tx.plan_id);
        INSERT INTO public.notifications (user_id, title, message, is_read)
        VALUES (
            v_tx.user_id,
            'Nâng cấp VIP thành công!',
            'Gói dịch vụ ' || v_plan_title || ' (Theo tháng) đã được kích hoạt thành công qua payOS. Hạn dùng đến: ' || TO_CHAR(v_until, 'DD/MM/YYYY') || '.',
            FALSE
        );
    END IF;

    PERFORM set_config('eventmate.checkout_in_progress', 'false', true);

    UPDATE public.transactions
    SET status = 'completed'
    WHERE id = v_tx.id;

    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', v_tx.id,
        'user_id', v_tx.user_id,
        'plan_id', v_tx.plan_id,
        'is_single_event', v_is_single_event
    );
END;
$$;
