// src/app/api/me/usage/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 환경변수 기본값(안전장치)
const FREE_TRIAL_LIMIT = Number(process.env.FREE_TRIAL_LIMIT ?? 3);
const TRIAL_WINDOW_DAYS = Number(process.env.TRIAL_WINDOW_DAYS ?? 30);   // 무료 체험 윈도우(미사용 시 30일)
const FALLBACK_EXPIRY_DAYS = Number(process.env.USAGE_EXPIRY_DAYS ?? 180); // DB에 값 없을 때 대비

// 날짜 유틸
const nowMs = () => Date.now();
const plusDaysISO = (d: number) =>
  new Date(nowMs() + d * 24 * 60 * 60 * 1000).toISOString();

export async function GET() {
  try {
    // 1) 로그인 확인
    const session = await getServerSession(authOptions);
    const email = session?.user?.email ?? null;
    if (!email) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    // 2) 현재 사용량 조회 (새 컬럼 포함!)
    const { data: current, error: readErr } = await supabaseAdmin
      .from("user_usage")
      .select(
        "email, usage_count, plan_type, window_end, usage_expiry_days, premium_count, vip_count, standard_count"
      )
      .eq("email", email)
      .maybeSingle();

    // 3) 없으면 무료 체험 윈도우로 초기 레코드 생성
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
        .select(
          "email, usage_count, plan_type, window_end, usage_expiry_days, premium_count, vip_count, standard_count"
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
        usageExpiryDays: created?.usage_expiry_days ?? FALLBACK_EXPIRY_DAYS,
      });
    }

    // 4) 만료 검사 (DB의 usage_expiry_days 사용; 없으면 FALLBACK_EXPIRY_DAYS)
    const expiryDays = Number(current.usage_expiry_days ?? FALLBACK_EXPIRY_DAYS);
    const isExpired =
      !current.window_end || new Date(current.window_end).getTime() <= nowMs();

    let row = current;

    if (isExpired) {
      // 정책: 만료 시 유료 카운트 소멸, 플랜 free로, 새 윈도우는 expiryDays 뒤
      const resetWindow = plusDaysISO(expiryDays);
      const { data: updated, error: upErr } = await supabaseAdmin
        .from("user_usage")
        .update({
          plan_type: "free",
          premium_count: 0,
          vip_count: 0,
          standard_count: 0,
          window_end: resetWindow,
          // usage_expiry_days는 유지 (정책 변경 시 여기서 조정 가능)
        })
        .eq("email", email)
        .select(
          "email, usage_count, plan_type, window_end, usage_expiry_days, premium_count, vip_count, standard_count"
        )
        .maybeSingle();

      if (upErr) {
        return NextResponse.json(
          { error: "EXPIRE_RESET_FAILED", detail: upErr.message },
          { status: 500 }
        );
      }
      row = updated ?? row;
    }

    // 5) 응답: 무료 잔여/유료 버킷
    const freeRemaining = Math.max(
      0,
      FREE_TRIAL_LIMIT - (row.usage_count ?? 0)
    );

    return NextResponse.json({
      email,
      plan: row.plan_type ?? "free",
      usageCount: row.usage_count ?? 0,
      freeLimit: FREE_TRIAL_LIMIT,
      freeRemaining,
      premiumCount: row.premium_count ?? 0,
      vipCount: row.vip_count ?? 0,
      standardCount: row.standard_count ?? 0,
      windowEnd: row.window_end ?? null,
      usageExpiryDays: row.usage_expiry_days ?? expiryDays,
    });
  } catch (e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  return NextResponse.json(
    { error: "SERVER_ERROR", detail: msg },
    { status: 500 }
  );
  }
}
