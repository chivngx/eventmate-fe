import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { payOS, isPayOSConfigured } from "@/lib/payos";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderCodeStr = searchParams.get("orderCode");

    if (!orderCodeStr) {
      return NextResponse.json({ error: "MISSING_ORDER_CODE" }, { status: 400 });
    }

    const orderCode = Number(orderCodeStr);
    const supabase = await createServerSupabaseClient();

    const { data: tx, error } = await (supabase.from("transactions") as any)
      .select("id, status, plan_id, billing_cycle, amount, created_at")
      .eq("order_code", orderCode)
      .maybeSingle();

    if (error || !tx) {
      return NextResponse.json({ status: "not_found" });
    }

    // Nếu giao dịch chưa completed và payOS đã cấu hình, chủ động kiểm tra trạng thái trên payOS API
    // Điều này đảm bảo khi test quét mã ở môi trường localhost (chưa có webhook ngrok), thanh toán vẫn nhận diện ngay lập tức
    if (tx.status !== "completed" && isPayOSConfigured()) {
      try {
        const paymentLink = await payOS.paymentRequests.get(orderCode);
        if (paymentLink && paymentLink.status === "PAID") {
          const { error: rpcError } = await (supabaseAdmin.rpc as any)(
            "confirm_payos_payment",
            { p_order_code: orderCode }
          );

          if (!rpcError) {
            tx.status = "completed";
          } else {
            console.error("Lỗi khi xác nhận giao dịch qua RPC:", rpcError);
          }
        }
      } catch (payOsErr: any) {
        // Ghi nhận cảnh báo nếu chưa thanh toán hoặc payOS API trả về trạng thái khác
        console.warn("Kiểm tra payOS:", payOsErr?.message);
      }
    }

    return NextResponse.json({
      status: tx.status,
      transactionId: tx.id,
      planId: tx.plan_id,
      billingCycle: tx.billing_cycle,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal error" }, { status: 500 });
  }
}
