"use client";
import { loadTossPayments } from "@tosspayments/payment-sdk";

type Props = {
  amount: number;
  orderName: string; // "standard" | "premium" | "vip" 처럼 사용 중
};

export default function PayButton({ amount, orderName }: Props) {
  const onClick = async () => {
    const tossPayments = await loadTossPayments(
      process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY as string
    );

    // ✅ 매 결제마다 고유한 orderId (중복 금지)
    const orderId = `drphy-${orderName}-${Date.now()}`;

    // ✅ successUrl/ failUrl 에 "파라미터 붙이지 마세요"
    //    (토스가 자동으로 paymentKey, orderId, amount 붙여줌)
    await tossPayments.requestPayment("카드", {
      amount,
      orderId,
      orderName,
      successUrl: `${window.location.origin}/toss/confirm`,
      failUrl: `${window.location.origin}/toss/fail`,
    });
  };

  return (
    <button
      onClick={onClick}
      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
    >
      결제하기
    </button>
  );
} 