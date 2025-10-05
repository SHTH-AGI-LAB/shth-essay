// src/app/api/toss/confirm/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabaseServer";

/**
 * 환경변수
 * - NEXT_PUBLIC_TOSS_CLIENT_KEY : 공개용(프런트)
 * - TOSS_SECRET_KEY             : 시크릿키(필수, 서버)
 */
const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || "";

type Plan = "standard" | "premium" | "vip";

function parsePlan(orderId?: string, amount?: number): { plan: Plan; qty: number } | null {
  // 1) orderId 접두로 판별(우선)
  //    예: drphy-std-XXXX, drphy-prm-XXXX, drphy-vip-XXXX
  const id = String(orderId || "").toLowerCase();
  if (id.startsWith("drphy-std")) return { plan: "standard", qty: 10 };
  if (id.startsWith("drphy-prm")) return { plan: "premium", qty: 30 };
  if (id.startsWith("drphy-vip")) return { plan: "vip", qty: 100 };

  // 2) 금액으로 판별(보조)
  switch (amount) {
    case 29000: return { plan: "standard", qty: 10 };
    case 79000: return { plan: "premium", qty: 30 };
    case 199000: return { plan: "vip", qty: 100 };
  }
  return null;
}

function b64(str: string) {
  return Buffer.from(str, "utf8").toString("base64");
}

export async function POST(req: NextRequest) {
  try {
    // 0) 로그인 확인
    const session = await getServerSession(authOptions);
    const email = session?.user?.email ?? null;
    if (!email) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    // 1) 파라미터 검증
    const { paymentKey, orderId, amount } = (await req.json()) as {
      paymentKey?: string;
      orderId?: string;
      amount?: number;
    };

    if (!paymentKey || !orderId || typeof amount !== "number" || Number.isNaN(amount)) {
      return NextResponse.json(
        { ok: false, error: "BAD_REQUEST: missing paymentKey/orderId/amount" },
        { status: 400 }
      );
    }
    if (!TOSS_SECRET_KEY) {
      return NextResponse.json(
        { ok: false, error: "SERVER_MISCONFIG: TOSS_SECRET_KEY missing" },
        { status: 500 }
      );
    }

    // 2) 토스 결제 승인 API 호출
    //    https://docs.tosspayments.com/reference#결제-승인
    const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${b64(`${TOSS_SECRET_KEY}:`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
      // 타임아웃 방어(옵션)
      // @ts-ignore
      cache: "no-store",
    });

    // 토스가 실패 응답을 주는 경우, 상세코드를 그대로 반환해 디버깅 쉽게
    if (!res.ok) {
      let detail: any = null;
      try { detail = await res.json(); } catch { /* ignore */ }
      return NextResponse.json(
        {
          ok: false,
          error: "TOSS_CONFIRM_FAILED",
          detail,                // 여기 code/message 나옴
        },
        { status: 400 }
      );
    }

    // 3) 우리 상품 구간 매핑
    const planInfo = parsePlan(orderId, amount);
    if (!planInfo) {
      return NextResponse.json(
        { ok: false, error: `PLAN_MAP_FAILED: orderId=${orderId}, amount=${amount}` },
        { status: 400 }
      );
    }
    const { plan, qty } = planInfo;

    // 4) 사용권 적립 (user_usage)
    //    - 컬럼: standard_count, premium_count, vip_count
    //    - plan_type은 'paid'로 승격
    //    - window_end/expiry는 기존 룰 유지(이미 180일 정책 운영)
    const { data: current, error: readErr } = await supabaseAdmin
      .from("user_usage")
      .select("email, standard_count, premium_count, vip_count, plan_type")
      .eq("email", email)
      .maybeSingle();

    if (readErr) {
      return NextResponse.json({ ok: false, error: `DB_READ_FAIL: ${readErr.message}` }, { status: 500 });
    }

    if (!current) {
      // 없는 사용자면 새로 생성해서 적립
      const base = { standard_count: 0, premium_count: 0, vip_count: 0 };
      const add = {
        standard: { standard_count: qty, premium_count: 0, vip_count: 0 },
        premium:  { standard_count: 0,  premium_count: qty, vip_count: 0 },
        vip:      { standard_count: 0,  premium_count: 0,  vip_count: qty },
      }[plan];

      const { error: insErr } = await supabaseAdmin
        .from("user_usage")
        .insert({
          email,
          usage_count: 0,
          plan_type: "paid",
          ...base,
          ...add,
          // window_end, usage_expiry_days 는 DB 기본값/트리거 적용
        });

      if (insErr) {
        return NextResponse.json({ ok: false, error: `DB_INSERT_FAIL: ${insErr.message}` }, { status: 500 });
      }
    } else {
      // 기존 사용자면 카운트 가산 + plan_type 승격
      const inc = {
        standard: { standard_count: (current.standard_count ?? 0) + qty },
        premium:  { premium_count:  (current.premium_count  ?? 0) + qty },
        vip:      { vip_count:      (current.vip_count      ?? 0) + qty },
      }[plan];

      const { error: upErr } = await supabaseAdmin
        .from("user_usage")
        .update({
          ...inc,
          plan_type: "paid",
        })
        .eq("email", email);

      if (upErr) {
        return NextResponse.json({ ok: false, error: `DB_UPDATE_FAIL: ${upErr.message}` }, { status: 500 });
      }
    }

    // (선택) payments 테이블 로깅 — 스키마 의무 컬럼 다르면 주석 유지
    // await supabaseAdmin.from("payments").insert({ user_id: ..., order_id: orderId, amount });

    return NextResponse.json({ ok: true, plan, qty });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: `SERVER_ERROR: ${e?.message ?? String(e)}` },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";