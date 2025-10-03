"use client";

import { useEffect, useMemo, useState } from "react";
import { loadPaymentWidget, type PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";

type Props = {
  amount: number;     // 29000 | 79000 | 199000
  orderName: string;  // "스탠다드 10회" | "프리미어 30회" | "VIP 100회"
};

function toPlanCode(orderName: string, amount: number): "std" | "pre" | "vip" {
  const name = orderName.toLowerCase();

  if (name.includes("스탠다드") || name.includes("standard")) return "std";
  if (name.includes("프리미어") || name.includes("프리미엄") || name.includes("premium")) return "pre";
  if (name.includes("vip")) return "vip";

  // 보조 판정(가격기반)
  if (amount === 29000) return "std";
  if (amount === 79000) return "pre";   // ✅ 69,000 → 79,000
  return "vip";
}

export default function PaymentWidgetClient({ amount, orderName }: Props) {
  const [widget, setWidget] = useState<PaymentWidgetInstance | null>(null);

  // drphy-<plan>-<timestamp>
  const orderId = useMemo(() => {
    const plan = toPlanCode(orderName, amount);
    return `drphy-${plan}-${Date.now()}`;
  }, [orderName, amount]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!clientKey) {
        console.error("❗ NEXT_PUBLIC_TOSS_CLIENT_KEY가 설정되지 않았어요 (.env.local / Vercel 환경변수 확인)");
        return;
      }

      const w = await loadPaymentWidget(clientKey, "ANONYMOUS");
      if (!mounted) return;

      await w.renderPaymentMethods("#payment-methods", { value: amount });
      await w.renderAgreement("#agreements");
      setWidget(w);
    })();

    return () => { mounted = false; };
  }, [amount]);

  const onPay = async () => {
    if (!widget) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    await widget.requestPayment({
     orderId,
     orderName,
     successUrl: `${origin}/toss/confirm?orderId=${orderId}&amount=${amount}&paymentKey={paymentKey}`, // ✅ 확실히 붙여줌
     failUrl: `${origin}/fail`,
     });
  };

  return (
    <div>
      <div id="payment-methods" />
      <div id="agreements" className="mt-4" />

      <button
        type="button"
        onClick={onPay}
        disabled={!widget}               // 작은 안정장치
        className="mt-6 px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
      >
        결제하기
      </button>
    </div>
  );
}