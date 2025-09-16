// src/app/payment/page.tsx
"use client";

export const metadata = {
  title: "결제방식 | Dr-phyllis",
  description: "닥터필리스 결제수단 및 유의사항 안내",
};

// 간단한 타입 선언(위젯 v2 요구 형태)
type TossPayRequest = {
  orderId: string;
  orderName: string;
  amount: number;
  successUrl: string;
  failUrl: string;
  customerName?: string;
};

async function pay(amount: number, orderName: string) {
  const { loadPaymentWidget } = await import("@tosspayments/payment-widget-sdk");

  const widget = await loadPaymentWidget(
    process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!,
    "test-customer-id"
  );

  const params: TossPayRequest = {
    orderId: "order-" + Date.now(),
    orderName,
    amount, // 숫자 그대로
    successUrl: `${window.location.origin}/payment/success`,
    failUrl: `${window.location.origin}/payment/fail`,
    customerName: "테스트 사용자",
  };

  // 타입 충돌 우회
  await (widget as any).requestPayment(params as any);
}

export default function PaymentPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 sm:p-10">
      <h1 className="text-2xl font-bold mb-6">결제 방식 안내</h1>

      {/* 결제수단 */}
      <section className="space-y-3 mb-8">
        <h2 className="text-lg font-semibold">지원 결제수단</h2>
        <ul className="list-disc pl-6 space-y-1 text-gray-700">
          <li>신용/체크카드 (국내 주요 카드사)</li>
          <li>카카오페이</li>
          <li>네이버페이</li>
          <li>토스페이</li>
          <li>삼성페이 (지원 단말기 한정)</li>
        </ul>
        <p className="text-sm text-gray-500">
          ※ 결제수단은 순차 오픈될 수 있으며, 심사 진행 상황에 따라 일부 결제는 한시적으로 비활성화될 수 있습니다.
        </p>
      </section>

      {/* 상품 카드 */}
      <section className="space-y-3 mb-8">
        <h2 className="text-lg font-semibold">상품 유형</h2>
        <p className="text-gray-700">
          닥터필리스는 <b>대입논술 AI 첨삭</b> 및 <b>대학별 맞춤 피드백</b>을 제공하는
          <b> 디지털/무형 서비스</b>입니다. (PDF 총평/피드백 제공)
        </p>

        <div className="grid gap-6 md:grid-cols-3 mt-6">
          {/* 10회 */}
          <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
            <h3 className="font-bold text-lg">스탠다드 10회</h3>
            <p className="text-gray-600 mt-2">부담 없이 시작하기 좋은 입문용</p>
            <p className="text-xl font-bold mt-3">29,000원</p>
            <p className="text-sm text-gray-500 mb-4">(1회 2,900원)</p>
            <button
              onClick={() => pay(29000, "스탠다드 10회")}
              className="block w-full text-center bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            >
              결제하기
            </button>
          </div>

          {/* 30회 */}
          <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition relative">
            <span className="absolute -top-3 left-3 bg-yellow-400 text-xs font-semibold px-2 py-1 rounded">
              ⭐ 가장 인기 많은 상품
            </span>
            <h3 className="font-bold text-lg">프리미엄 30회</h3>
            <p className="text-gray-600 mt-2">꾸준히 학습하며 성과를 내는 베스트셀러</p>
            <p className="text-xl font-bold mt-3">79,000원</p>
            <p className="text-sm text-gray-500 mb-4">(1회 약 2,633원)</p>
            <button
              onClick={() => pay(79000, "프리미엄 30회")}
              className="block w-full text-center bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            >
              결제하기
            </button>
          </div>

          {/* 100회 */}
          <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition relative">
            <span className="absolute -top-3 left-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
              👩🏫 교사 추천
            </span>
            <h3 className="font-bold text-lg">VIP 100회</h3>
            <p className="text-gray-600 mt-2">자기주도 학습, 최고의 가성비, 학원교사 활용</p>
            <p className="text-xl font-bold mt-3">199,000원</p>
            <p className="text-sm text-gray-500 mb-4">(1회 1,990원)</p>
            <button
              onClick={() => pay(199000, "VIP 100회")}
              className="block w-full text-center bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            >
              결제하기
            </button>
          </div>
        </div>
      </section>

      {/* 서비스 제공 기간 */}
      <section className="space-y-3 mb-8">
        <h2 className="text-lg font-semibold">서비스 제공(이용) 기간</h2>
        <ul className="list-disc pl-6 space-y-1 text-gray-700">
          <li>단건 첨삭권: 결제 후 <b>7일 이내</b> 초안 제출, 제출일로부터 <b>최대 5일 이내</b> 피드백 제공</li>
          <li>패키지(다회권): 결제일로부터 <b>12개월 이내</b> 사용</li>
        </ul>
      </section>

      {/* 고객센터 */}
      <section className="space-y-3 mb-8">
        <h2 className="text-lg font-semibold">문의 / 고객센터</h2>
        <ul className="list-disc pl-6 space-y-1 text-gray-700">
          <li>대표번호: 062-651-0922 / 010-2734-5261</li>
          <li>이메일: dr-phyllis@naver.com</li>
          <li>운영시간: 평일 10:00~18:00 (주말/공휴일 휴무)</li>
        </ul>
      </section>

      {/* 사업자 정보 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">사업자 정보</h2>
        <div className="text-gray-700">
          <p>서비스명: 닥터필리스 대입논술AI첨삭 </p>
          <p>사업자명: 주식회사 에어래빗 AIrabbit Inc.</p>
          <p>사업자등록번호: 536-86-03683</p>
          <p>대표자명: 주헌영</p>
          <p>사업장 주소: 광주광역시 남구 행암도동길 43-11, 1층</p>
        </div>
      </section>
    </main>
  );
} 