import { NextResponse } from "next/server";
import { payOS, isPayOSConfigured } from "@/lib/payos";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder-anon-key";

const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseKey);


export async function POST(req: Request) {
  try {
    if (!isPayOSConfigured()) {
      return NextResponse.json(
        { error: "PAYOS_NOT_CONFIGURED", message: "payOS credentials not configured." },
        { status: 503 }
      );
    }

    const body = await req.json();

    // 1. Xác thực tính toàn vẹn và chữ ký số từ payOS
    const verifiedData = await payOS.webhooks.verify(body);

    if (!verifiedData) {
      return NextResponse.json(
        { error: "INVALID_SIGNATURE", message: "Chữ ký webhook không hợp lệ." },
        { status: 400 }
      );
    }

    const orderCode = verifiedData.orderCode;

    // 2. Kích hoạt gói VIP và hoàn tất giao dịch trong Supabase thông qua hàm RPC bảo mật
    const { data: rpcResult, error: rpcError } = await (supabaseAdmin.rpc as any)(
      "confirm_payos_payment",
      { p_order_code: orderCode }
    );

    if (rpcError) {
      console.error("Lỗi xác nhận thanh toán qua RPC:", rpcError);
      return NextResponse.json(
        { error: "RPC_EXECUTION_FAILED", message: rpcError.message },
        { status: 500 }
      );
    }

    console.log("Xử lý webhook payOS thành công cho đơn:", orderCode, rpcResult);

    return NextResponse.json({
      success: true,
      orderCode,
      result: rpcResult,
    });
  } catch (error: any) {
    console.error("Lỗi xử lý webhook payOS:", error);
    return NextResponse.json(
      {
        error: "WEBHOOK_VERIFICATION_FAILED",
        message: error?.message || "Xác thực webhook thất bại.",
      },
      { status: 400 }
    );
  }
}
