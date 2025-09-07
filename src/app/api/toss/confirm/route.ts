import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { paymentKey, orderId, amount } = await req.json();

    // 서버에서 금액/상품 검증 (예: DB 가격 조회)
    const serverAmount = 1000; // 데모: 고정 가격
    if (Number(amount) !== serverAmount) {
      return NextResponse.json({ message: "금액 불일치" }, { status: 400 });
    }

    const secretKey = process.env.TOSS_SECRET_KEY!;
    const basicToken = Buffer.from(`${secretKey}:`, "utf-8").toString("base64");

    const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount: serverAmount }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ message: data.message || "승인 실패" }, { status: 400 });
    }

    // TODO: 결제 성공 처리 (DB 저장, 영수증 메일 등)
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || "서버 오류" }, { status: 500 });
  }
}