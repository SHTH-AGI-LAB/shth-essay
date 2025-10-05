// src/app/api/me/usage/consume/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
const supabaseAdmin = getSupabaseAdmin();
const FREE_TRIAL_LIMIT = Number(process.env.FREE_TRIAL_LIMIT ?? 3);

export async function POST() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? null;
  if (!email) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  // 현재 잔여 조회
  const { data: row, error } = await supabaseAdmin
    .from("user_usage")
    .select("usage_count, premium_count, vip_count, plan_type, window_end")
    .eq("email", email)
    .maybeSingle();

  if (error || !row) {
    return NextResponse.json({ error: "READ_FAILED", detail: error?.message }, { status: 500 });
  }

  // 차감 우선순위: VIP > PREMIUM > FREE
  if ((row.vip_count ?? 0) > 0) {
    const { error: upErr } = await supabaseAdmin
      .from("user_usage")
      .update({ vip_count: (row.vip_count ?? 0) - 1 })
      .eq("email", email);
    if (upErr) return NextResponse.json({ error: "DECREMENT_FAILED", detail: upErr.message }, { status: 500 });
    return NextResponse.json({ ok: true, used: "vip" });
  }

  if ((row.premium_count ?? 0) > 0) {
    const { error: upErr } = await supabaseAdmin
      .from("user_usage")
      .update({ premium_count: (row.premium_count ?? 0) - 1 })
      .eq("email", email);
    if (upErr) return NextResponse.json({ error: "DECREMENT_FAILED", detail: upErr.message }, { status: 500 });
    return NextResponse.json({ ok: true, used: "premium" });
  }

  // FREE: 윈도우/리밋 체크
  const inWindow =
    row.window_end ? new Date(row.window_end).getTime() >= Date.now() : true;
  const canUseFree = inWindow && (row.usage_count ?? 0) < FREE_TRIAL_LIMIT;

  if (canUseFree) {
    const { error: upErr } = await supabaseAdmin
      .from("user_usage")
      .update({ usage_count: (row.usage_count ?? 0) + 1 })
      .eq("email", email);
    if (upErr) return NextResponse.json({ error: "DECREMENT_FAILED", detail: upErr.message }, { status: 500 });
    return NextResponse.json({ ok: true, used: "free" });
  }

  // 전부 소진
  return NextResponse.json({ error: "NO_CREDITS", message: "잔여 횟수가 없습니다." }, { status: 402 });
}