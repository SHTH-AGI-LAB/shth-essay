"use client";
import { loadTossPayments } from "@tosspayments/payment-sdk";

type Props = {
  amount: number;
  orderName: string;
};

export default function PayButton({ amount, orderName }: Props) {
  const onClick = async () => {
    const tossPayments = await loadTossPayments(
      process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY as string
    );

    const orderId = `order-${Date.now()}`;

    await tossPayments.requestPayment("카드", {
      amount,
      orderId,
      orderName,
      successUrl: `${window.location.origin}/pay/success`,
      failUrl: `${window.location.origin}/pay/fail`,
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
