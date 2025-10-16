"use client";

import Link from "next/link";

const PLANS = [
  {
    slug: "standard",
    name: "스탠다드 10회",
    price: "29,000원",
    badge: "입문 추천",
    bullets: [
      "AI첨삭 10회",
      "직관적 합격 점수 핵심 피드백",
      "논술 시험 직전 점검용 추천",
    ],
  },
  {
    slug: "premium",
    name: "프리미엄 30회",
    price: "79,000원",
    badge: "베스트셀러",
    bullets: [
      "AI첨삭 30회",
      "에어래빗 전체 전문 첨삭 분석 리포트 3회",
      "에어래빗에서 직접 첨삭 2일 이내 응답",
    ],
    highlight: true,
  },
  {
    slug: "vip",
    name: "VIP 100회",
    price: "199,000원",
    badge: "장기 학습",
    bullets: [
      "AI첨삭 100회",
      "논술전형 커리큘럼 및 종합 멘토링 1회",
      "에어래빗 전체 전문 첨삭 분석 리포트 5회",
    ],
  },
];

  export default function PaymentPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold">결제 방식 안내</h1>
        <p className="mt-3 text-gray-600">
          AIrabbit Inc.는 AI 논술 첨삭 서비스를 제공합니다.
          신용/체크카드 · 토스페이 · 네이버페이 · 카카오페이를 지원합니다.
        </p>
      </section>

      {/* Plans */}
      <section className="max-w-5xl mx-auto px-6 pb-8 grid md:grid-cols-3 gap-6">
        {PLANS.map((p) => (
          <div
            key={p.slug}
            className={[
              "rounded-2xl border p-6 flex flex-col",
              p.highlight ? "border-black shadow-lg bg-gray-50" : "border-gray-200 shadow-sm",
            ].join(" ")}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{p.name}</h2>
              <span className="text-xs px-2 py-1 rounded-full border">
                {p.badge}
              </span>
            </div>
            <p className="text-2xl font-bold mt-2">{p.price}</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              {p.bullets.map((b) => (
                <li key={b} className="flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-900" />
                  {b}
                </li>
              ))}
            </ul>
            <Link href={`/payment/${p.slug}`} className="mt-6">
              <button className="w-full py-2 rounded-lg bg-black text-white hover:opacity-90 transition">
                결제하기
              </button>
            </Link>
          </div>
        ))}
      </section>

      {/* 안내/FAQ */}
      <section className="max-w-5xl mx-auto px-6 pb-12 grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-3">이용 안내</h3>
          <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
            <li>결제 후, 첨삭받고 싶은 대학을 선택하고 글을 업로드합니다.</li>
            <li>AI첨삭은 로딩 시간 약 10초 후 즉시 형성됩니다.</li>
            <li>프리미어 이상 에어래빗 첨삭은 2일이내 문서로 제공됩니다.</li>
          </ol>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">FAQ</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>Q. 환불은 가능한가요? → 네, 정책에 따라 단계별 환불이 가능합니다.</li>
            <li>Q. 프리미엄이상 전체글 첨삭은 어떻게 받나요?
                 → 닥터필리스 블로그 오픈채팅, 또는 e-메일 통해 지원합니다.</li>
            <li>Q. 회차 소진 기한은? → 결제일로부터 6개월.</li>
          </ul>
        </div>
      </section>

      {/* Policy Links + Company Info */}
      <section className="border-t">
        <div className="max-w-5xl mx-auto px-6 py-6 text-xs text-gray-500 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-gray-700">이용약관</Link>
            <Link href="/refund" className="hover:text-gray-700">환불/취소</Link>
            <Link href="/privacy" className="hover:text-gray-700">개인정보</Link>
          </div>
          <div>
             닥터필리스 AI대입논술 첨삭  · 사업자/ 주식회사 에어래빗 AIrabbit Inc. · 사업자등록번호/ 536-86-03683 · 대표/ 주헌영 · 주소/ 광주광역시 남구 행암도동길 43-11 1층 
             · 이메일/ contact@ai-rabbit.com · 대표번호/ 062-651-0922
          </div>
        </div>
      </section>
    </main>
  );
} 