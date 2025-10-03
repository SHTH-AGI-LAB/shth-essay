// src/app/api/toss/confirm/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabaseServer";

const TOSS_SECRET = process.env.TOSS_SECRET_KEY ?? "";

/**
 * orderId 규칙 권장:
 *   drphy-std-<timestamp>  => standard(10)
 *   drphy-pre-<timestamp>  => premium(30)
 *   drphy-vip-<timestamp>  => vip(100)
 *  (클라이언트에서 결제 시작할 때 이렇게 생성해 주세요)
 */
function parsePlan(orderId: string, amount: number) {
  // orderId에서 우선 판정
  const lower = orderId.toLowerCase();
  if (lower.includes("-std-")) return { plan: "standard" as const, qty: 10 };
  if (lower.includes("-pre-")) return { plan: "premium" as const, qty: 30 };
  if (lower.includes("-vip-")) return { plan: "vip" as const, qty: 100 };

  // (백업) 금액으로 판정 — 실제 금액으로 바꿔주세요!
  if (amount === 29000) return { plan: "standard" as const, qty: 10 };
  if (amount === 69000) return { plan: "premium" as const, qty: 30 };
  if (amount === 199000) return { plan: "vip" as const, qty: 100 };

  throw new Error("Cannot determine plan from orderId/amount");
}

export async function POST(req: NextRequest) {
  try {
    // 로그인 사용자
    const session = await getServerSession(authOptions);
    const email = session?.user?.email ?? null;
    if (!email) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { paymentKey, orderId, amount } = await req.json();

    // 1) Toss 결제 확정
    const authHeader = "Basic " + Buffer.from(`${TOSS_SECRET}:`).toString("base64");
    const tossRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
      // 중요: 서버에서만 호출
      cache: "no-store",
    });

    if (!tossRes.ok) {
      const err = await tossRes.json().catch(() => ({}));
      return NextResponse.json({ ok: false, step: "toss_confirm", err }, { status: 400 });
    }

    // 2) 플랜/지급수량 판정
    const { plan, qty } = parsePlan(String(orderId), Number(amount));

    // 3) 현재 보유치 읽기 (없으면 생성)
    const { data: current, error: readErr } = await supabaseAdmin
      .from("user_usage")
      .select("email, standard_count, premium_count, vip_count, plan_type")
      .eq("email", email)
      .maybeSingle();

    if (readErr) throw readErr;

    if (!current) {
      // 최초 구매: 레코드 새로 만들고 해당 플랜 수량 세팅
      const base = { email, usage_count: 0, plan_type: "free", standard_count: 0, premium_count: 0, vip_count: 0 };
      const init = { ...base, [`${plan}_count`]: qty } as any;

      const { error: insErr } = await supabaseAdmin.from("user_usage").insert(init);
      if (insErr) throw insErr;
    } else {
      // 4) 기존 레코드 업데이트 (가산)
      const next = {
        standard_count: current.standard_count ?? 0,
        premium_count : current.premium_count ?? 0,
        vip_count     : current.vip_count ?? 0,
      };
      if (plan === "standard") next.standard_count += qty;
      if (plan === "premium")  next.premium_count  += qty;
      if (plan === "vip")      next.vip_count      += qty;

      const { error: updErr } = await supabaseAdmin
        .from("user_usage")
        .update(next)
        .eq("email", email);
      if (updErr) throw updErr;
    }

    // 5) 성공 응답 (프론트에서 /success 페이지로 라우팅 가능)
    return NextResponse.json({ ok: true, plan, qty });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}