// src/app/payment/PaymentWidgetClient.tsx
"use client";

import { useEffect, useRef } from "react";
import { loadPaymentWidget, PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";

export default function PaymentWidgetClient() {
  useEffect(() => {
    async function init() {
      const widget = await loadPaymentWidget(
        process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!, // .env.local에 저장된 공개 키
        "test-customer-id" // 실제 서비스에서는 고유 UUID 같은 값
      );

      // 결제 UI를 렌더링할 div에 결제수단 UI 넣기
      await widget.renderPaymentMethods("#payment-widget", { value: 1000 });
      await widget.renderAgreement("#agreement"); // 약관 UI
    }

    init();
  }, []);

  return (
    <div>
      <div id="payment-widget" />
      <div id="agreement" />
      <button
        onClick={async () => {
          const widget = await loadPaymentWidget(
            process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!,
            "test-customer-id"
          );
          await widget.requestPayment({
            orderId: "order-" + Date.now(),
            orderName: "테스트 결제",
            successUrl: `${window.location.origin}/payment/success`,
            failUrl: `${window.location.origin}/payment/fail`,
          });
        }}
      >
        결제하기
      </button>
    </div>
  );
}