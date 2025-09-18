// src/app/payment/PaymentWidgetClient.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { loadPaymentWidget, type PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";

type Props = {
  amount: number;      // 결제 금액
  orderName: string;   // 주문명
};

export default function PaymentWidgetClient({ amount, orderName }: Props) {
  const widgetRef = useRef<PaymentWidgetInstance | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!clientKey) {
        console.error("❗ NEXT_PUBLIC_TOSS_CLIENT_KEY가 없습니다 (.env & Vercel 확인)");
        return;
      }

      const widget = await loadPaymentWidget(clientKey, "ANONYMOUS");
      if (!mounted) return;
      widgetRef.current = widget;

      // 위젯 렌더 (금액은 여기서 value로 설정)
      await widget.renderPaymentMethods("#payment-widget", { value: amount });
      await widget.renderAgreement("#agreement");

      if (mounted) setReady(true);
    })();

    return () => { mounted = false; };
  }, [amount]);

  const onPay = async () => {
    if (!widgetRef.current) return; 
    await widgetRef.current.requestPayment({
      orderId: "order-" + Date.now(),
      orderName,
      // V2에선 amount를 여기 넣지 않습니다.
      successUrl: `${window.location.origin}/success`,
      failUrl: `${window.location.origin}/fail`,
    });
  };

  return (
    <div>
      {/* 스켈레톤 (위젯 준비 전) */}
      {!ready && (
        <div className="mb-4 h-40 rounded-lg bg-gray-100 animate-pulse" />
      )}

      {/* 위젯 컨테이너: 준비 전에는 숨김, 레이아웃 튐 방지를 위해 최소 높이 부여 */}
      <div id="payment-widget" className={ready ? "mb-4" : "hidden"} style={{ minHeight: 160 }} />
      <div id="agreement" className={ready ? "mb-6" : "hidden"} style={{ minHeight: 80 }} />

      <button
        onClick={onPay}
        disabled={!ready}
        className={`px-4 py-2 rounded text-white transition ${
          ready ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {orderName} 결제하기
      </button>
    </div>
  );
}