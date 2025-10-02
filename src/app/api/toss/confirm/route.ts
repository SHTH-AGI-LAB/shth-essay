import { NextRequest, NextResponse } from "next/server";

type ConfirmBody = {
  paymentKey: string;
  orderId: string;
  amount: number;
};

// 토스 응답에서 실제로 쓰는 필드만 최소 정의
type TossConfirmResponse = {
  orderId: string;
  paymentKey: string;
  status: string;       // "DONE" 등
  totalAmount: number;
};

export async function POST(req: NextRequest) {
  try {
    const { paymentKey, orderId, amount } = (await req.json()) as Partial<ConfirmBody>;

    if (!paymentKey || !orderId || typeof amount !== "number") {
      return NextResponse.json(
        { ok: false, error: { message: "필수 파라미터 누락" } },
        { status: 400 }
      );
    }

    const secret = process.env.TOSS_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        { ok: false, error: { message: "TOSS_SECRET_KEY 미설정" } },
        { status: 500 }
      );
    }

    const auth = Buffer.from(`${secret}:`).toString("base64");

    const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    const data = (await res.json()) as TossConfirmResponse | Record<string, unknown>;

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: data }, { status: res.status });
    }

    // ✅ 승인 성공 → 이용권 쿠키 발급(1년)
    const response = NextResponse.json({ ok: true, data }, { status: 200 });
    response.cookies.set("paid", "true", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "서버 오류";
    return NextResponse.json({ ok: false, error: { message: msg } }, { status: 500 });
  }
}