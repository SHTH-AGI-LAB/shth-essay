// src/app/payment/PaymentWidgetClient.tsx
"use client";

import { useEffect, useRef } from "react";
import { loadPaymentWidget, type PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";

export default function PaymentWidgetClient() {
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

      // 결제수단/약관 UI 렌더 (id 셀렉터 사용)
      await widget.renderPaymentMethods("#payment-widget", { value: 79000 });
      await widget.renderAgreement("#agreement");
    })();
  }, []);

  const onPay = async () => {
    if (!widgetRef.current) return;
    await widgetRef.current.requestPayment({
      orderId: "order-" + Date.now(),
      orderName: "프리미엄 30회",
      successUrl: `${window.location.origin}/success`, // 경로 실제와 일치시킬 것
      failUrl: `${window.location.origin}/fail`,
    });
  };

  return (
    <div>
      <div id="payment-widget" className="mb-4" />
      <div id="agreement" className="mb-6" />
      <button onClick={onPay} className="px-4 py-2 rounded bg-blue-600 text-white">
        결제하기
      </button>
    </div>
  );
}