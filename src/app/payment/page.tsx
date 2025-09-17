"use client"; 

import { useState } from "react";
import PaymentWidgetClient from "@/components/PaymentWidgetClient";

export const metadata = {
  title: "결제방식 | Dr-phyllis",
  description: "닥터필리스 결제수단 및 유의사항 안내",
};

type Plan = { label: string; price: number };
const PLANS: Plan[] = [
  { label: "스탠다드 10회", price: 29000 },
  { label: "프리미엄 30회", price: 79000 },
  { label: "VIP 100회",    price: 199000 },
];

export default function PaymentPage() {
  const [selected, setSelected] = useState<Plan | null>(null);

  return (
    <main className="mx-auto max-w-3xl p-6 sm:p-10">
      <h1 className="text-2xl font-bold mb-6">결제 방식 안내</h1>

      {/* 결제수단 */}
      <section className="space-y-3 mb-8">
        <h2 className="text-lg font-semibold">지원 결제수단</h2>
        <ul className="list-disc pl-6 space-y-1 text-gray-700">
          <li>신용/체크카드 (국내 주요 카드사)</li>
          <li>카카오페이 · 네이버페이 · 토스페이</li>
          <li>삼성페이 (지원 단말기 한정)</li>
        </ul>
        <p className="text-sm text-gray-500">
          ※ 결제수단은 심사 진행 상황에 따라 순차 오픈됩니다.
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
          {PLANS.map((p) => (
            <div key={p.label} className={`border rounded-lg p-4 shadow-sm hover:shadow-md transition ${selected?.label === p.label ? "ring-2 ring-indigo-500" : ""}`}>
              <h3 className="font-bold text-lg">{p.label}</h3>
              <p className="text-gray-600 mt-2">
                {p.label === "스탠다드 10회" && "부담 없이 시작하기 좋은 입문용"}
                {p.label === "프리미엄 30회" && "꾸준히 학습하며 성과를 내는 베스트셀러"}
                {p.label === "VIP 100회" && "자기주도 학습 · 학원/교사 활용"}
              </p>
              <p className="text-xl font-bold mt-3">
                {p.price.toLocaleString()}원
              </p>
              <button
                onClick={() => setSelected(p)}
                className="mt-4 block w-full text-center bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
              >
                선택하기
              </button>
            </div>
          ))}
        </div>

        {selected && (
          <PaymentWidgetClient amount={selected.price} orderName={selected.label} />
        )}
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
          <p>서비스명: 닥터필리스 대입논술AI첨삭</p>
          <p>사업자명: 주식회사 에어래빗 AIrabbit Inc.</p>
          <p>사업자등록번호: 536-86-03683</p>
          <p>대표자명: 주헌영</p>
          <p>사업장 주소: 광주광역시 남구 행암도동길 43-11, 1층</p>
        </div>
      </section>
    </main>
  );
}