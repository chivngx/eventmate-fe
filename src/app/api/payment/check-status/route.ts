import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

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
