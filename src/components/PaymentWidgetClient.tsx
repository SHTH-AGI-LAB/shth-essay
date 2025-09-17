"use client";

import { useEffect, useState } from "react";
import { loadPaymentWidget, type PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";

type Props = {
  amount: number;     // 예: 29000 | 79000 | 199000
  orderName: string;  // 예: "스탠다드 10회"
};

export default function PaymentWidgetClient({ amount, orderName }: Props) {
  const [widget, setWidget] = useState<PaymentWidgetInstance | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!clientKey) {
        console.error("❗NEXT_PUBLIC_TOSS_CLIENT_KEY가 설정되지 않았어요 (.env.local 확인)");
        return;
      }

      // 1) 위젯 로드
      const w = await loadPaymentWidget(clientKey, "ANONYMOUS");
      if (!mounted) return;

      // 2) 결제수단/약관 UI 렌더 (CSS 셀렉터 사용)
      await w.renderPaymentMethods("#payment-methods", { value: amount });
      await w.renderAgreement("#agreements");

      setWidget(w);
    })();

    return () => { mounted = false; };
  }, [amount]);

  const onPay = async () => {
    if (!widget) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    // V2: amount는 렌더/세팅으로 관리 → requestPayment에 넣지 않음
    await widget.requestPayment({
      orderId: `order-${Date.now()}`,
      orderName,
      successUrl: `${origin}/success`,
      failUrl: `${origin}/fail`,
    });
  };

  return (
    <div>
      {/* 셀렉터 기준 렌더 */}
      <div id="payment-methods" />
      <div id="agreements" className="mt-4" />

      <button
        type="button"
        onClick={onPay}
        className="mt-6 px-4 py-2 rounded bg-blue-600 text-white"
      >
        결제하기
      </button>
    </div>
  );
}
