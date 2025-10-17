// src/components/PaymentWidgetClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  loadPaymentWidget,
  type PaymentWidgetInstance,
} from "@tosspayments/payment-widget-sdk";

type Props = {
  amount: number;
  orderName: string;
};

function toPlanCode(orderName: string, amount: number): "std" | "pre" | "vip" {
  const name = orderName.toLowerCase();
  if (name.includes("스탠다드") || name.includes("standard")) return "std";
  if (name.includes("프리미엄") || name.includes("premium")) return "pre";
  if (name.includes("vip")) return "vip";
  if (amount === 29000) return "std";
  if (amount === 79000) return "pre";
  return "vip";
}

export default function PaymentWidgetClient({ amount, orderName }: Props) {
  const [widget, setWidget] = useState<PaymentWidgetInstance | null>(null);

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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
await (w as any).renderPaymentMethods("#payment-methods", {
  value: amount,
  enabledPaymentMethods: ["CARD", "TRANSFER"], // ← 가상계좌 제거
});

      await w.renderAgreement("#agreements");
      setWidget(w);
    })();

    return () => {
      mounted = false;
    };
  }, [amount]);

  const onPay = async () => {
    if (!widget) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    await widget.requestPayment({
      orderId,
      orderName,
      successUrl: `${origin}/toss/confirm`,
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
        disabled={!widget}
        className="mt-6 px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
      >
        결제하기
      </button>
    </div>
  );
}