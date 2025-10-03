// src/app/api/me/usage/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabaseServer";

// 기본값(환경변수 없으면 안전)
const FREE_TRIAL_LIMIT = Number(process.env.FREE_TRIAL_LIMIT ?? 3);
const TRIAL_WINDOW_DAYS = Number(process.env.TRIAL_WINDOW_DAYS ?? 30);

export async function GET() {
  // 1) 로그인 확인
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? null;
  if (!email) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  // 2) user_usage 조회 (premium_count, vip_count, standard_count 포함)
  const { data: current, error: readErr } = await supabaseAdmin
    .from("user_usage")
    .select(
      "email, usage_count, plan_type, window_end, premium_count, vip_count, standard_count"
    )
    .eq("email", email)
    .maybeSingle();

  if (readErr) {
    return NextResponse.json(
      { error: "READ_FAILED", detail: readErr.message },
      { status: 500 }
    );
  }

  // 3) 레코드 없으면 기본 free로 생성
  if (!current) {
    const windowEnd = new Date();
    windowEnd.setDate(windowEnd.getDate() + TRIAL_WINDOW_DAYS);

    const { data: created, error: insErr } = await supabaseAdmin
      .from("user_usage")
      .insert({
        email,
        usage_count: 0,
        plan_type: "free",
        window_end: windowEnd.toISOString(),
        premium_count: 0,
        vip_count: 0,
        standard_count: 0,
      })
      .select(
        "email, usage_count, plan_type, window_end, premium_count, vip_count, standard_count"
      )
      .single();

    if (insErr) {
      return NextResponse.json(
        { error: "INIT_FAILED", detail: insErr.message },
        { status: 500 }
      );
    }

    const freeRemaining = Math.max(
      0,
      FREE_TRIAL_LIMIT - (created?.usage_count ?? 0)
    );

    return NextResponse.json({
      email,
      plan: created?.plan_type ?? "free",
      usageCount: created?.usage_count ?? 0,
      freeLimit: FREE_TRIAL_LIMIT,
      freeRemaining,
      premiumCount: created?.premium_count ?? 0,
      vipCount: created?.vip_count ?? 0,
      standardCount: created?.standard_count ?? 0,
      windowEnd: created?.window_end ?? null,
    });
  }

  // 4) 있으면 계산해서 반환
  const freeRemaining = Math.max(
    0,
    FREE_TRIAL_LIMIT - (current.usage_count ?? 0)
  );

  return NextResponse.json({
    email,
    plan: current.plan_type ?? "free",
    usageCount: current.usage_count ?? 0,
    freeLimit: FREE_TRIAL_LIMIT,
    freeRemaining,
    premiumCount: current.premium_count ?? 0,
    vipCount: current.vip_count ?? 0,
    standardCount: current.standard_count ?? 0,
    windowEnd: current.window_end ?? null,
  });
}