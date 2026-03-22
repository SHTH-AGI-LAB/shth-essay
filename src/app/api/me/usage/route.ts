// src/app/api/me/usage/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getSupabaseAdmin } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseAdmin = getSupabaseAdmin();

// 환경변수 기본값(없으면 안전장치)
const FREE_TRIAL_LIMIT = Number(process.env.FREE_TRIAL_LIMIT ?? 3);
const TRIAL_WINDOW_DAYS = Number(process.env.TRIAL_WINDOW_DAYS ?? 30);
const FALLBACK_EXPIRY_DAYS = Number(process.env.USAGE_EXPIRY_DAYS ?? 180);

const nowMs = () => Date.now();
const plusDaysISO = (d: number) =>
  new Date(Date.now() + d * 24 * 60 * 60 * 1000).toISOString();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email ?? null;
    if (!email) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    // 1) user_usage 기록 조회
    const { data: current, error: readErr } = await supabaseAdmin
      .from("user_usage")
      .select(
        `
        email,
        usage_count,
        plan_type,
        window_end,
        usage_expiry_days,
        premium_count,
        vip_count,
        standard_count
      `
      )
      .eq("email", email)
      .maybeSingle();

    // 2) 레코드 없으면 무료 윈도우 생성
    if (readErr) {
      return NextResponse.json(
        { error: "READ_FAILED", detail: readErr.message },
        { status: 500 }
      );
    }

    if (!current) {
      const windowEnd = plusDaysISO(TRIAL_WINDOW_DAYS);

      const { data: created, error: insErr } = await supabaseAdmin
        .from("user_usage")
        .insert({
          email,
          usage_count: 0,
          plan_type: "free",
          window_end: windowEnd,
          usage_expiry_days: FALLBACK_EXPIRY_DAYS,
          premium_count: 0,
          vip_count: 0,
          standard_count: 0,
        })
        .select("*")
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

      const totalRemaining =
        freeRemaining +
        (created?.premium_count ?? 0) +
        (created?.vip_count ?? 0) +
        (created?.standard_count ?? 0);

      return NextResponse.json({
        email,
        plan: created?.plan_type,
        usageCount: created?.usage_count,
        freeLimit: FREE_TRIAL_LIMIT,
        freeRemaining,
        premiumCount: created?.premium_count,
        vipCount: created?.vip_count,
        standardCount: created?.standard_count,
        totalRemaining,
        windowEnd: created?.window_end,
        usageExpiryDays: created?.usage_expiry_days,
      });
    }

    // 3) 만료 체크
    const expiryDays = Number(current.usage_expiry_days ?? FALLBACK_EXPIRY_DAYS);
    const isExpired =
      !current.window_end || new Date(current.window_end).getTime() <= nowMs();

    let row = current;

    if (isExpired) {
      const resetWindow = plusDaysISO(expiryDays);

      const { data: updated, error: upErr } = await supabaseAdmin
        .from("user_usage")
        .update({
          plan_type: "free",
          premium_count: 0,
          vip_count: 0,
          standard_count: 0,
          window_end: resetWindow,
        })
        .eq("email", email)
        .select("*")
        .maybeSingle();

      if (upErr) {
        return NextResponse.json(
          { error: "EXPIRE_RESET_FAILED", detail: upErr.message },
          { status: 500 }
        );
      }

      row = updated ?? row;
    }

    // 4) 무료 잔여 계산
    const freeRemaining = Math.max(
      0,
      FREE_TRIAL_LIMIT - (row.usage_count ?? 0)
    );

    // 5) 모든 버킷 포함한 전체 남은 횟수 계산 (핵심 FIX)
    const totalRemaining =
      freeRemaining +
      (row.vip_count ?? 0) +
      (row.premium_count ?? 0) +
      (row.standard_count ?? 0);

    // 6) 최종 응답
    return NextResponse.json({
      email,
      plan: row.plan_type ?? "free",
      usageCount: row.usage_count ?? 0,
      freeLimit: FREE_TRIAL_LIMIT,
      freeRemaining,
      premiumCount: row.premium_count ?? 0,
      vipCount: row.vip_count ?? 0,
      standardCount: row.standard_count ?? 0,
      totalRemaining, // ← UI는 이 값을 사용하면 됨
      windowEnd: row.window_end ?? null,
      usageExpiryDays: row.usage_expiry_days ?? expiryDays,
    });
  } catch (e: unknown) {
  const detail = e instanceof Error ? e.message : String(e);
  return NextResponse.json(
    { error: "SERVER_ERROR", detail },
    { status: 500 }
  );
}
}