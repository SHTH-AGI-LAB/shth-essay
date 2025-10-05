// /src/app/api/toss/confirm/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getSupabaseAdmin } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** ── 결제 플랜/수량 매핑 ─────────────────── */
type Plan = "standard" | "premium" | "vip";
type PlanRule = { plan: Plan; qty: number };

function inferPlanByAmount(amount: number): PlanRule | null {
  if (amount === 29000) return { plan: "standard", qty: 10 };
  if (amount === 79000) return { plan: "premium", qty: 30 };
  if (amount === 199000) return { plan: "vip", qty: 100 };
  return null;
}

/** ── Supabase Admin 인스턴스 ─────────────── */
const supabase = getSupabaseAdmin();

/** user_usage 스키마용 타입(필요 필드만) */
type UsageRow = {
  email: string;
  usage_count: number | null;
  plan_type: "free" | "paid";
  window_end: string | null;
  standard_count: number | null;
  premium_count: number | null;
  vip_count: number | null;
};

/** row가 없으면 기본 레코드 생성 */
async function ensureUsageRow(email: string): Promise<void> {
  // 이미 있는지 조회
  const resp = await supabase
    .from("user_usage")
    .select("email")
    .eq("email", email)
    .maybeSingle();
  if (resp.error) throw new Error(`init read failed: ${resp.error.message}`);
  if (resp.data) return;

  // 없으면 생성
  const { error: insErr } = await supabase.from("user_usage").insert({
    email,
    usage_count: 0,
    plan_type: "free",
    // window_end와 usage_expiry_days는 DB 기본값/트리거로 관리됨
    standard_count: 0,
    premium_count: 0,
    vip_count: 0,
  });
  if (insErr) throw new Error(`init user_usage failed: ${insErr.message}`);
}

/** 결제 수량 적립 + 유료 플래그 전환 */
type CountColumn = "standard_count" | "premium_count" | "vip_count";

async function addTickets(email: string, plan: Plan, qty: number): Promise<void> {
  const column: CountColumn =
    plan === "standard" ? "standard_count" : plan === "premium" ? "premium_count" : "vip_count";

  // 현재 수량 읽기
  const read = await supabase
    .from("user_usage")
    .select("email, standard_count, premium_count, vip_count")
    .eq("email", email)
    .maybeSingle();
  if (read.error) throw new Error(`read ${column} failed: ${read.error.message}`);
  const row = (read.data ?? null) as
    | Pick<UsageRow, "email" | "standard_count" | "premium_count" | "vip_count">
    | null;

  const current = (row?.[column] ?? 0) as number;
  const nextValue = current + qty;

  const { error: updateErr } = await supabase
    .from("user_usage")
    .update({ [column]: nextValue, plan_type: "paid" })
    .eq("email", email);

  if (updateErr) throw new Error(`update ${column} failed: ${updateErr.message}`);
}

/** ── Toss Confirm 호출 ───────────────────── */
async function callTossConfirm(args: {
  paymentKey: string;
  orderId: string;
  amount: number;
}) {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) throw new Error("TOSS_SECRET_KEY is missing");

  const authHeader = "Basic " + Buffer.from(`${secretKey}:`).toString("base64");

  const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (json?.message as string) || `Toss confirm failed (${res.status})`;
    const code = (json?.code as string) || "TOSS_CONFIRM_ERROR";
    return { ok: false as const, code, message: msg, raw: json };
  }
  return { ok: true as const, raw: json };
}

/** ── API 핸들러 ───────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email ?? null;
    if (!email) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      paymentKey?: string;
      orderId?: string;
      amount?: number;
    };

    const paymentKey = body?.paymentKey ?? "";
    const orderId = body?.orderId ?? "";
    const amount = Number(body?.amount ?? NaN);

    if (!paymentKey || !orderId || !Number.isFinite(amount)) {
      return NextResponse.json(
        { ok: false, error: "INVALID_PARAMS" },
        { status: 400 }
      );
    }

    const rule = inferPlanByAmount(amount);
    if (!rule) {
      return NextResponse.json(
        { ok: false, error: "UNKNOWN_AMOUNT" },
        { status: 400 }
      );
    }

    // 토스 승인
    const confirm = await callTossConfirm({ paymentKey, orderId, amount });
    if (!confirm.ok) {
      return NextResponse.json(
        { ok: false, error: `${confirm.code}: ${confirm.message}` },
        { status: 400 }
      );
    }

    // user_usage 보장 + 적립
    await ensureUsageRow(email);
    await addTickets(email, rule.plan, rule.qty);

    // (선택) payments 테이블에 기록
    await supabase.from("payments").insert({
      user_id: null, // 원하면 auth.users.uuid를 매핑해서 넣기
      order_id: orderId,
      amount: amount,
      // 필요한 추가 필드가 있으면 확장
    });

    return NextResponse.json({ ok: true, plan: rule.plan, qty: rule.qty });
  } catch (e: unknown) {
    const msg =
      e instanceof Error ? e.message : typeof e === "string" ? e : "UNKNOWN_ERROR";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
