// src/app/api/toss/confirm/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getSupabaseAdmin } from "@/lib/supabaseServer";

// 금액 → 상품 매핑
const PLAN_BY_AMOUNT: Record<number, { plan: "standard" | "premium" | "vip"; qty: number }> = {
  29000: { plan: "standard", qty: 10 },
  79000: { plan: "premium", qty: 30 },
  199000: { plan: "vip", qty: 100 },
};

// Toss 응답 타입(성공/실패 최소 필드만 정의)
type TossConfirmSuccess = {
  orderId: string;
  paymentKey: string;
  status: string; // "DONE" 등
  approvedAt?: string;
  [k: string]: unknown;
};
type TossError = { code?: string; message?: string };

// 요청 바디 타입
type ConfirmBody = { paymentKey?: string; orderId?: string; amount?: number };

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email ?? null;
    if (!email) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    const parsed = (await req.json().catch(() => null)) as ConfirmBody | null;
    const paymentKey = parsed?.paymentKey;
    const orderId = parsed?.orderId;
    const amount = Number(parsed?.amount);

    if (!paymentKey || !orderId || !Number.isFinite(amount)) {
      return NextResponse.json(
        { ok: false, error: "BAD_REQUEST", detail: "paymentKey/orderId/amount 필요" },
        { status: 400 }
      );
    }

    const secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ ok: false, error: "MISSING_TOSS_SECRET_KEY" }, { status: 500 });
    }

    // Toss confirm 호출
    const authHeader = "Basic " + Buffer.from(`${secretKey}:`, "utf-8").toString("base64");
    const tossRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: { Authorization: authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    const jsonUnknown = (await tossRes.json().catch(() => ({}))) as unknown;

    if (!tossRes.ok) {
      const err = jsonUnknown as TossError;
      return NextResponse.json(
        {
          ok: false,
          error: "TOSS_CONFIRM_FAILED",
          status: tossRes.status,
          tossCode: err.code,
          tossMessage: err.message,
          echo: { orderId, amount },
        },
        { status: 400 }
      );
    }

    const success = jsonUnknown as TossConfirmSuccess;

    // 결제 성공 → 상품 지급
    const mapping = PLAN_BY_AMOUNT[amount];
    if (!mapping) {
      return NextResponse.json({ ok: true, note: "금액 매핑 없음(지급 생략)", payment: success });
    }

    const admin = getSupabaseAdmin();
    const { data: row } = await admin
      .from("user_usage")
      .select("email, standard_count, premium_count, vip_count")
      .eq("email", email)
      .maybeSingle();

    const column =
      mapping.plan === "standard"
        ? "standard_count"
        : mapping.plan === "premium"
        ? "premium_count"
        : "vip_count";

    const current =
      row && typeof (row as Record<string, unknown>)[column] === "number"
        ? ((row as Record<string, unknown>)[column] as number)
        : 0;

    const { error: upErr } = await admin
      .from("user_usage")
      .upsert({ email, plan_type: "paid", [column]: current + mapping.qty }, { onConflict: "email" });

    if (upErr) {
      return NextResponse.json(
        { ok: false, error: "SUPABASE_UPDATE_FAILED", detail: upErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, plan: mapping.plan, qty: mapping.qty, payment: success });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: "SERVER_ERROR", detail: msg }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";