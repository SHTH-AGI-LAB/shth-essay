"use client";

import { useEffect, useRef, useState } from "react";
import { loadPaymentWidget, PaymentWidgetInstance } from "@tosspayments/tosspayments-sdk";

type Props = {
  amount: number;          // 결제 금액(원)
  orderName: string;       // 주문명
};

export default function PaymentWidgetClient({ amount, orderName }: Props) {
  const methodsRef = useRef<HTMLDivElement>(null);
  const agreeRef = useRef<HTMLDivElement>(null);
  const [widget, setWidget] = useState<PaymentWidgetInstance | null>(null);

  // 위젯 초기화 & 영역 렌더링
  useEffect(() => {
    let mounted = true;

    (async () => {
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;
      const customerKey = "test-customer-id"; // 샌드박스 고정 ID

      const w = await loadPaymentWidget(clientKey, customerKey);
      if (!mounted) return;

      setWidget(w);

      // 결제수단 / 약관 영역 렌더링
      await w.renderPaymentMethods(
        methodsRef.current!,
        { value: amount, currency: "KRW" },
        { variantKey: "DEFAULT" }
      );
      await w.renderAgreement(agreeRef.current!);
    })();

    return () => {
      mounted = false;
    };
  }, [amount]);

  async function handlePay() {
    if (!widget) return;

    await widget.requestPayment({
      orderId: "order-" + Date.now(),
      orderName,
      amount: { value: amount, currency: "KRW" },
      successUrl: `${window.location.origin}/payment/success`,
      failUrl: `${window.location.origin}/payment/fail`,
      customerName: "테스트 사용자",
    });
  }

  return (
    <div className="mt-6 space-y-4">
      <div ref={methodsRef} />
      <div ref={agreeRef} />
      <button
        onClick={handlePay}
        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
      >
        결제하기
      </button>
    </div>
  );
}