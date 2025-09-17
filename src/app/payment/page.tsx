// ❌ "use client" 넣지 마세요 (서버 컴포넌트 유지)
import PaymentWidgetClient from "@/components/PaymentWidgetClient";

export const metadata = {
  title: "결제방식 | Dr-phyllis",
  description: "닥터필리스 결제수단 및 유의사항 안내",
};

const PLANS = [
  { label: "스탠다드 10회", price: 29000 },
  { label: "프리미엄 30회", price: 79000 },
  { label: "VIP 100회", price: 199000 },
];

export default function PaymentPage() {
  // 우선 테스트용으로 프리미엄 고정. (UI에서 선택 붙일 거면 props만 바꾸면 됨)
  const plan = PLANS[1];

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">결제 방식 안내</h1>
      {/* …여기 기존 안내/카드 UI 유지 가능… */}
      <section className="mt-8">
        <h2 className="text-lg font-medium mb-2">{plan.label}</h2>
        <PaymentWidgetClient amount={plan.price} orderName={plan.label} />
      </section>
    </main>
  );
}
