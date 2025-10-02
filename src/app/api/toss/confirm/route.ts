import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { paymentKey, orderId, amount } = await req.json();

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json({ ok: false, error: { message: "필수 파라미터 누락" } }, { status: 400 });
    }

    const secret = process.env.TOSS_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ ok: false, error: { message: "서버 환경변수(TOSS_SECRET_KEY) 없음" } }, { status: 500 });
    }

    const auth = Buffer.from(`${secret}:`).toString("base64");

    const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount: Number(amount),
      }),
      // @ts-ignore – Next.js edge 환경에서도 node TLS 허용
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: data }, { status: res.status });
    }

    // ✅ 결제 승인 성공 → 유저 이용권 쿠키 발급(1년)
    const response = NextResponse.json({ ok: true, data }, { status: 200 });
    response.cookies.set("paid", "true", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    // (선택) 여기서 Supabase 등에 카운터/영수증 저장도 가능
    // await savePaymentToDB(userId, data);

    return response;
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: { message: e?.message ?? "서버 오류" } }, { status: 500 });
  }
}