// src/app/api/payment/confirm/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    // 1) 로그인 사용자 확인
    const session = await getServerSession(authOptions);
    const email = session?.user?.email ?? null;
    if (!email) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    // 2) 클라이언트에서 보낸 orderName 확인
    const body = await req.json();
    const { orderName } = body; // 예: "스탠다드 10회" / "프리미어 30회" / "VIP 100회"

    // 3) DB에서 현재 사용자 찾기
    const { data: current, error: readErr } = await supabaseAdmin
      .from("user_usage")
      .select("email, standard_count, premium_count, vip_count")
      .eq("email", email)
      .maybeSingle();

    if (readErr) {
      return NextResponse.json({ error: "READ_FAILED", detail: readErr.message }, { status: 500 });
    }
    if (!current) {
      return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    }

    // 4) 플랜별 카운터 업데이트
    let updates: Record<string, number> = {};
    if (orderName.includes("스탠다드")) {
      updates.standard_count = (current.standard_count ?? 0) + 10;
    } else if (orderName.includes("프리미어")) {
      updates.premium_count = (current.premium_count ?? 0) + 30;
    } else if (orderName.includes("VIP")) {
      updates.vip_count = (current.vip_count ?? 0) + 100;
    }

    const { error: upErr } = await supabaseAdmin
      .from("user_usage")
      .update(updates)
      .eq("email", email);

    if (upErr) {
      return NextResponse.json({ error: "UPDATE_FAILED", detail: upErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, updates });
  } catch (err: any) {
    return NextResponse.json({ error: "SERVER_ERROR", detail: err.message }, { status: 500 });
  }
}