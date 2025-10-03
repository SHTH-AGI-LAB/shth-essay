// src/app/payment/[slug]/page.tsx
"use client";

import { notFound } from "next/navigation";
import PaymentWidgetClient from "@/components/PaymentWidgetClient";

const PLANS = {
  standard: { amount: 29000, orderName: "스탠다드 10회" },
  premium:  { amount: 79000, orderName: "프리미엄 30회" },
  vip:      { amount: 199000, orderName: "VIP 100회" },
} as const;

type Props = { params: { slug: keyof typeof PLANS } };

export default function PaymentPlanPage({ params }: Props) {
  const plan = PLANS[params.slug];
  if (!plan) return notFound();

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">{plan.orderName}</h1>

      {/* ✅ 여기서 props를 넘겨줌 */}
      <PaymentWidgetClient amount={plan.amount} orderName={plan.orderName} />
    </main>
  );
}