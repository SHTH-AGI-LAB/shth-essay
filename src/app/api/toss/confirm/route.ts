import { NextResponse } from "next/server";

type ConfirmBody = {
  paymentKey: string;
  orderId: string;
  amount: number;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<ConfirmBody>;

    const paymentKey = typeof body.paymentKey === "string" ? body.paymentKey : "";
    const orderId = typeof body.orderId === "string" ? body.orderId : "";
    const amount = typeof body.amount === "number" ? body.amount : NaN;

    if (!paymentKey || !orderId || !Number.isFinite(amount)) {
      return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });
    }

    // 서버에서 금액 검증 (데모: 고정가)
    const serverAmount = 1000;
    if (amount !== serverAmount) {
      return NextResponse.json({ message: "금액 불일치" }, { status: 400 });
    }

    const secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ message: "서버 설정 오류(TOSS_SECRET_KEY 없음)" }, { status: 500 });
    }

    const basicToken = Buffer.from(`${secretKey}:`, "utf-8").toString("base64");

    const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount: serverAmount }),
    });

    const data = (await res.json()) as unknown;

    if (!res.ok) {
      const message =
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof (data as { message?: unknown }).message === "string"
          ? (data as { message: string }).message
          : "승인 실패";
      return NextResponse.json({ message }, { status: 400 });
    }

    // TODO: 성공 처리 (DB 저장/영수증 발송 등)
    return NextResponse.json({ ok: true, data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "서버 오류";
    return NextResponse.json({ message }, { status: 500 });
  }
}