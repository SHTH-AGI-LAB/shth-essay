// src/app/payment/PaymentWidgetClient.tsx
"use client";

import { useEffect, useRef } from "react";
import { loadPaymentWidget, type PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";

type Props = {
  amount: number;      // 상품 가격 (숫자)
  orderName: string;   // 주문명 (상품 이름)
};

export default function PaymentWidgetClient({ amount, orderName }: Props) {
  const widgetRef = useRef<PaymentWidgetInstance | null>(null);

  useEffect(() => {
    (async () => {
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!clientKey) {
        console.error("❗ NEXT_PUBLIC_TOSS_CLIENT_KEY가 없습니다 (.env.local & Vercel 확인)");
        return;
      }

      const widget = await loadPaymentWidget(clientKey, "ANONYMOUS");
      widgetRef.current = widget;

      // 결제수단/약관 UI 렌더링
      await widget.renderPaymentMethods("#payment-widget", { value: amount });
      await widget.renderAgreement("#agreement");
    })();
  }, [amount]);

  const onPay = async () => {
    if (!widgetRef.current) return;

    await widgetRef.current.requestPayment({
      orderId: "order-" + Date.now(),
      orderName,
      successUrl: `${window.location.origin}/success`,
      failUrl: `${window.location.origin}/fail`,
    });
  };

  return (
    <div>
      <div id="payment-widget" className="mb-4" />
      <div id="agreement" className="mb-6" />
      <button
        onClick={onPay}
        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
      >
        {orderName} 결제하기
      </button>
    </div>
  );
}