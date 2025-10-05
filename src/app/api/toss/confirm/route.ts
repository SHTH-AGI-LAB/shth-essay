// src/app/api/toss/confirm/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getSupabaseAdmin } from "@/lib/supabaseServer";

// 금액 -> 상품 매핑 (필요시 수정)
const PLAN_BY_AMOUNT: Record<number, { plan: "standard" | "premium" | "vip"; qty: number }> = {
  29000: { plan: "standard", qty: 10 },
  79000: { plan: "premium", qty: 30 },
  199000: { plan: "vip", qty: 100 },
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email ?? null;
    if (!email) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const paymentKey = body?.paymentKey as string | undefined;
    const orderId = body?.orderId as string | undefined;
    const amount = Number(body?.amount);

    if (!paymentKey || !orderId || !Number.isFinite(amount)) {
      return NextResponse.json(
        { ok: false, error: "BAD_REQUEST", detail: "paymentKey/orderId/amount 필요" },
        { status: 400 }
      );
    }

    // Toss confirm 호출
    const secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ ok: false, error: "MISSING_TOSS_SECRET_KEY" }, { status: 500 });
    }

    const authHeader =
      "Basic " + Buffer.from(`${secretKey}:`, "utf-8").toString("base64");

    const tossRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    const tossJson = await tossRes.json().catch(() => ({} as any));

    // ❗여기서 실패 사유를 그대로 프론트에 내려줌 (세션 만료/잘못된 값 등 즉시 확인 가능)
    if (!tossRes.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "TOSS_CONFIRM_FAILED",
          status: tossRes.status,
          tossCode: tossJson?.code,
          tossMessage: tossJson?.message,
          echo: { orderId, amount },
        },
        { status: 400 }
      );
    }

    // 결제 성공 → 상품 지급
    const mapping = PLAN_BY_AMOUNT[amount];
    if (!mapping) {
      // 금액이 매핑표에 없으면 그냥 성공만 알려주고 지급은 건너뜀(오입금 방지)
      return NextResponse.json({ ok: true, note: "금액 매핑 없음(지급 생략)", payment: tossJson });
    }

    const admin = getSupabaseAdmin();

    // 사용자 행 없으면 만들고, 있으면 업데이트
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
      row && typeof (row as any)[column] === "number" ? (row as any)[column] : 0;

    const { error: upErr } = await admin
      .from("user_usage")
      .upsert(
        {
          email,
          plan_type: "paid",
          [column]: current + mapping.qty,
        },
        { onConflict: "email" }
      );

    if (upErr) {
      return NextResponse.json(
        { ok: false, error: "SUPABASE_UPDATE_FAILED", detail: upErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      plan: mapping.plan,
      qty: mapping.qty,
      payment: tossJson,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", detail: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";