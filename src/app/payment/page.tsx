"use client";

import Link from "next/link";

const PLANS = [
  {
    slug: "standard",
    name: "스탠다드 10회",
    price: "29,000원",
    badge: "입문 추천",
    bullets: [
      "첨삭 10회",
      "핵심 피드백 키워드 3개/회",
      "48시간 내 반환",
    ],
  },
  {
    slug: "premium",
    name: "프리미엄 30회",
    price: "79,000원",
    badge: "베스트셀러",
    bullets: [
      "첨삭 30회",
      "심화 피드백 + 월간 요약 리포트",
      "24~48시간 내 반환",
    ],
    highlight: true,
  },
  {
    slug: "vip",
    name: "VIP 100회",
    price: "199,000원",
    badge: "장기 학습",
    bullets: [
      "첨삭 100회",
      "맞춤 커리큘럼 + 월간 컨설팅",
      "장기 성장 트래킹",
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
          Airabbit Inc.는 AI 논술 첨삭 서비스를 제공합니다.
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
            <li>결제 후, 마이페이지에서 과제를 업로드합니다.</li>
            <li>첨삭은 24~48시간 내에 반환됩니다(상품별 상이).</li>
            <li>리포트는 월 1회 요약본으로 제공됩니다(프리미엄 이상).</li>
          </ol>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">FAQ</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>Q. 환불은 가능한가요? → 네, 정책에 따라 단계별 환불이 가능합니다.</li>
            <li>Q. 과제 파일 형식은? → PDF, DOCX, HWP, 이미지(JPG/PNG) 지원.</li>
            <li>Q. 회차 소진 기한은? → 결제일로부터 12개월.</li>
          </ul>
        </div>
      </section>

      {/* Policy Links + Company Info */}
      <section className="border-t">
        <div className="max-w-5xl mx-auto px-6 py-6 text-xs text-gray-500 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex gap-4">
            <a href="/terms" className="hover:text-gray-700">이용약관</a>
            <a href="/refund" className="hover:text-gray-700">환불/취소 정책</a>
            <a href="/privacy" className="hover:text-gray-700">개인정보처리방침</a>
          </div>
          <div>
            사업자명: 주식회사 에어래빗 Airabbit Inc. · 사업자등록번호: 536-86-03683 · 통신판매업 신고번호: 제2025-서울-0000호 ·
            대표: 홍길동 · 주소: 광주광역시 남구 행암도동길 43-11, 1층 · 이메일: dr_phyllis@naver.com · 호스팅: Vercel Inc.
          </div>
        </div>
      </section>
    </main>
  );
} 