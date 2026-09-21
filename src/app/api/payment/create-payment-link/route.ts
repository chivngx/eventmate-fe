import { NextResponse } from "next/server";
import { payOS, isPayOSConfigured } from "@/lib/payos";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    if (!isPayOSConfigured()) {
      return NextResponse.json(
        {
          error: "PAYOS_NOT_CONFIGURED",
          message: "payOS chưa được cấu hình biến môi trường trên server.",
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { planId = "standard", billingCycle = "monthly" } = body;

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Vui lòng đăng nhập để thanh toán." },
        { status: 401 }
      );
    }

    // Giá theo gói mới:
    // - single_event (Sự Kiện Nhanh): 99.000đ
    // - enterprise (Doanh Nghiệp): 499.000đ/tháng, 399.000đ*12 = 4.788.000đ/năm
    let amount = 99000;
    if (planId === "enterprise" || planId === "standard" || planId === "agency") {
      amount = billingCycle === "yearly" ? 399000 * 12 : 499000;
    } else {
      amount = 99000;
    }

    // orderCode là số nguyên dương duy nhất
    const orderCode = Number(`${Date.now()}`.slice(-9));

    // description tối đa 25 ký tự không dấu theo chuẩn VietQR Napas
    const planTag = planId === "enterprise" || planId === "standard" ? "ENT" : "EVT";
    const cycleTag = billingCycle === "yearly" ? "1Y" : "1M";
    const description = `EM ${planTag} ${cycleTag} ${orderCode}`.slice(0, 25);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // 1. Lưu bản ghi giao dịch chờ thanh toán vào Supabase
    const { error: dbError } = await (supabase.from("transactions") as any).insert({
      user_id: user.id,
      plan_id: planId,
      billing_cycle: billingCycle,
      amount,
      payment_method: "payos",
      status: "pending",
      order_code: orderCode,
    });

    if (dbError) {
      console.error("Lỗi lưu transactions Supabase:", dbError);
    }

    // 2. Tạo link thanh toán qua payOS SDK
    const paymentLink = await payOS.paymentRequests.create({
      orderCode,
      amount,
      description,
      cancelUrl: `${appUrl}/pricing/checkout?plan=${encodeURIComponent(planId)}&billing=${encodeURIComponent(billingCycle)}&status=cancelled`,
      returnUrl: `${appUrl}/pricing/checkout?plan=${encodeURIComponent(planId)}&billing=${encodeURIComponent(billingCycle)}&status=success&orderCode=${orderCode}`,
    });

    // 3. Cập nhật paymentLinkId nếu có
    if (paymentLink.paymentLinkId) {
      await (supabase.from("transactions") as any)
        .update({ payment_link_id: paymentLink.paymentLinkId })
        .eq("order_code", orderCode);
    }

    return NextResponse.json({
      checkoutUrl: paymentLink.checkoutUrl,
      orderCode,
      paymentLinkId: paymentLink.paymentLinkId,
      qrCode: paymentLink.qrCode,
      accountNumber: paymentLink.accountNumber,
      accountName: paymentLink.accountName,
      bin: paymentLink.bin,
      amount,
      description: paymentLink.description || description,
    });
  } catch (error: any) {
    console.error("Lỗi create-payment-link:", error);
    return NextResponse.json(
      {
        error: "CREATE_PAYMENT_LINK_FAILED",
        message: error?.message || "Không thể tạo link thanh toán payOS.",
      },
      { status: 500 }
    );
  }
}
