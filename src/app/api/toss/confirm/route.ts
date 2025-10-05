// /src/app/api/toss/confirm/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** ---------- 결제 플랜/수량 규칙 ---------- */
type Plan = "standard" | "premium" | "vip";
type PlanRule = { plan: Plan; qty: number };

function inferPlanByAmount(amount: number): PlanRule | null {
  // 금액-플랜 매핑
  if (amount === 29000) return { plan: "standard", qty: 10 };
  if (amount === 79000) return { plan: "premium", qty: 30 };
  if (amount === 199000) return { plan: "vip", qty: 100 };
  return null;
}

/** ---------- Supabase: 사용자 row 보장 ---------- */
async function ensureUserRow(email: string): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from("user_usage")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw new Error(`read user_usage failed: ${error.message}`);
  }

  if (!data) {
    const { error: insErr } = await supabaseAdmin.from("user_usage").insert({
      email,
      usage_count: 0,
      plan_type: "free",
      standard_count: 0,
      premium_count: 0,
      vip_count: 0,
      // window_end/usage_expiry_days는 DB 기본값 사용
    });
    if (insErr) {
      throw new Error(`init user_usage failed: ${insErr.message}`);
    }
  }
}

/** ---------- Supabase: 플랜 카운트 적립 ---------- */
async function addTickets(
  email: string,
  plan: Plan,
  qty: number
): Promise<void> {
  const column: "standard_count" | "premium_count" | "vip_count" =
    plan === "standard" ? "standard_count" : plan === "premium" ? "premium_count" : "vip_count";

  // 현재 값 읽기
const { data: currentRow, error: readErr } = await supabaseAdmin
  .from("user_usage")
  .select(`email, ${column}`)
  .eq("email", email)
  .maybeSingle();

if (readErr) {
  throw new Error(`read ${column} failed: ${readErr.message}`);
}

// ✅ TS가 안전하게 받아들이도록 캐스팅하여 키 접근
const rowObj = (currentRow ?? {}) as Partial<
  Record<"standard_count" | "premium_count" | "vip_count", number>
>;
const current = Number(rowObj[column] ?? 0);
const nextValue = current + qty;


  // 적립 + 유료 전환
  const { error: updateErr } = await supabaseAdmin
    .from("user_usage")
    .update({ [column]: nextValue, plan_type: "paid" })
    .eq("email", email);

  if (updateErr) {
    throw new Error(`update ${column} failed: ${updateErr.message}`);
  }
}

/** ---------- Toss Confirm 호출 ---------- */
type TossConfirmArgs = {
  paymentKey: string;
  orderId: string;
  amount: number;
};

type TossConfirmOK = {
  orderId: string;
  status: string;
  totalAmount: number;
};

type TossConfirmFail = {
  code: string;
  message: string;
};

async function callTossConfirm(args: TossConfirmArgs): Promise<TossConfirmOK> {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) throw new Error("Missing TOSS_SECRET_KEY");

  const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });

  // Toss는 실패도 JSON으로 내려줌
  const json = (await res.json()) as TossConfirmOK | TossConfirmFail;

  if (!res.ok) {
    const code = (json as TossConfirmFail).code ?? "TOSS_CONFIRM_ERROR";
    const message = (json as TossConfirmFail).message ?? "Unknown error";
    throw new Error(`${code}: ${message}`);
  }

  return json as TossConfirmOK;
}

/** ---------- API 핸들러 ---------- */
export async function POST(req: NextRequest) {
  try {
    // 1) 로그인 사용자
    const session = await getServerSession(authOptions);
    const email = session?.user?.email ?? "";
    if (!email) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    // 2) 파라미터
    const body = (await req.json()) as Partial<TossConfirmArgs>;
    const paymentKey = body.paymentKey;
    const orderId = body.orderId;
    const amount = body.amount;

    if (!paymentKey || !orderId || typeof amount !== "number") {
      return NextResponse.json(
        { ok: false, error: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    // 3) 금액으로 플랜/수량 산출
    const rule = inferPlanByAmount(amount);
    if (!rule) {
      return NextResponse.json(
        { ok: false, error: `UNSUPPORTED_AMOUNT_${amount}` },
        { status: 400 }
      );
    }

    // 4) Toss 결제확인
    const ok = await callTossConfirm({ paymentKey, orderId, amount });

    // 5) 사용자 row 보장 후 적립
    await ensureUserRow(email);
    await addTickets(email, rule.plan, rule.qty);

    // 6) 응답
    return NextResponse.json(
      { ok: true, orderId: ok.orderId, plan: rule.plan, qty: rule.qty },
      { status: 200 }
    );
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : typeof e === "string" ? e : "UNKNOWN_ERROR";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
} 