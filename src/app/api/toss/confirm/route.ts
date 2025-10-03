// src/app/api/toss/confirm/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabaseServer";

const TOSS_SECRET = process.env.TOSS_SECRET_KEY ?? "";

type Plan = "standard" | "premium" | "vip";
type CounterKey = "standard_count" | "premium_count" | "vip_count";

/**
 * orderId 규칙 권장:
 *   drphy-std-<timestamp>  => standard(10)
 *   drphy-pre-<timestamp>  => premium(30)
 *   drphy-vip-<timestamp>  => vip(100)
 */
function parsePlan(orderId: string, amount: number): { plan: Plan; qty: number } {
  const lower = orderId.toLowerCase();
  if (lower.includes("-std-")) return { plan: "standard", qty: 10 };
  if (lower.includes("-pre-")) return { plan: "premium", qty: 30 };
  if (lower.includes("-vip-")) return { plan: "vip", qty: 100 };

  // (백업) 금액으로 판정 — 실제 금액과 동일하게 유지
  if (amount === 29_000) return { plan: "standard", qty: 10 };
  if (amount === 79_000) return { plan: "premium", qty: 30 }; // ← 79,000으로 일치
  if (amount === 199_000) return { plan: "vip", qty: 100 };

  throw new Error("Cannot determine plan from orderId/amount");
}

const toCounterKey = (plan: Plan): CounterKey =>
  (plan === "standard"
    ? "standard_count"
    : plan === "premium"
    ? "premium_count"
    : "vip_count");

export async function POST(req: NextRequest) {
  try {
    // 0) 로그인 확인
    const session = await getServerSession(authOptions);
    const email = session?.user?.email ?? null;
    if (!email) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json();
    const paymentKey: string = body.paymentKey;
    const orderId: string = String(body.orderId);
    const amount: number = Number(body.amount);

    // 1) Toss 결제 확정 (server-only)
    const authHeader = "Basic " + Buffer.from(`${TOSS_SECRET}:`).toString("base64");
    const tossRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
      cache: "no-store",
    });

    if (!tossRes.ok) {
      const errJson = await tossRes.json().catch(() => ({}));
      return NextResponse.json({ ok: false, step: "toss_confirm", err: errJson }, { status: 400 });
    }

    // 2) 플랜/수량 결정
    const { plan, qty } = parsePlan(orderId, amount);

    // 3) 현재 보유치 조회
    const { data: current, error: readErr } = await supabaseAdmin
      .from("user_usage")
      .select("email, standard_count, premium_count, vip_count, plan_type")
      .eq("email", email)
      .maybeSingle();

    if (readErr) {
      return NextResponse.json({ ok: false, step: "read_usage", detail: readErr.message }, { status: 500 });
    }

    if (!current) {
      // 최초 구매 → 새 레코드 생성 + 해당 카운터만 수량 세팅
      const initCounters: Record<CounterKey, number> = {
        standard_count: 0,
        premium_count: 0,
        vip_count: 0,
      };
      initCounters[toCounterKey(plan)] = qty;

      const insertPayload = {
        email,
        usage_count: 0,
        plan_type: "free",
        window_end: null as string | null,
        ...initCounters,
      };

      const { error: insErr } = await supabaseAdmin.from("user_usage").insert(insertPayload);
      if (insErr) {
        return NextResponse.json({ ok: false, step: "insert_usage", detail: insErr.message }, { status: 500 });
      }
    } else {
      // 기존 레코드 가산 업데이트
      const next: Record<CounterKey, number> = {
        standard_count: current.standard_count ?? 0,
        premium_count: current.premium_count ?? 0,
        vip_count: current.vip_count ?? 0,
      };
      next[toCounterKey(plan)] += qty;

      const { error: updErr } = await supabaseAdmin
        .from("user_usage")
        .update(next)
        .eq("email", email);

      if (updErr) {
        return NextResponse.json({ ok: false, step: "update_usage", detail: updErr.message }, { status: 500 });
      }
    }

    // 4) 성공
    return NextResponse.json({ ok: true, plan, qty });
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: detail }, { status: 500 });
  }
}