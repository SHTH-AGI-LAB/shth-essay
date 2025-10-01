// src/app/privacy/page.tsx
export const metadata = {
  title: "개인정보 처리방침 | Dr-phyllis",
  description: "닥터필리스(운영사: AIrabbit Inc.) 개인정보 처리방침",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 sm:p-10 leading-7">
      <h1 className="text-2xl font-bold mb-6">개인정보 처리방침</h1>

      <section className="mb-6">
        <h2 className="font-semibold">1. 총칙</h2>
        <p>
          본 서비스(브랜드: 닥터필리스, 운영사: <strong>AIrabbit Inc.</strong>)는
          「개인정보 보호법」 등 관련 법령을 준수하며, 서비스 제공에 필요한
          최소한의 개인정보만 수집·이용합니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold">2. 수집 항목 및 이용 목적</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>필수</strong>:
            이름, 이메일(로그인/식별), 주소(이벤트/증정), 결제정보(거래 처리),{" "}
            <u>학생이 제출한 글/과제</u>
            (AI 채점 및 <strong>에어래빗에서 직접 첨삭·리포트 제공</strong> 목적)
          </li>
          <li>
            <strong>선택</strong>:
            연락처(상담/안내),{" "}
            <u>성적 관련 참고 정보(내신·모의고사 등)</u> —{" "}
            <em>학생 본인이 자발적으로 입력한 범위만 수집</em>하며,
            생기부·증빙 사본은 수집하지 않습니다.
          </li>
          <li>
            <strong>쿠키/접속기록</strong>: 서비스 개선, 이용 통계, 보안
          </li>
        </ul>
        <p className="mt-3">
          수집된 정보는 이벤트 증정 및 에어래빗 첨삭(프리미엄/ VIP 포함)과 VIP
          <strong> 종합 멘토링(입시 전략 수립)</strong>의 품질 향상을 위한
          참고 목적으로 이용됩니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold">3. 보유 및 이용기간</h2>
        <p>
          법령상 보존기간 또는 이용 목적 달성 시까지 보관하며, 목적 달성 후
          지체 없이 파기합니다. 성적 <em>참고</em> 정보는 멘토링 완료 후 즉시
          삭제하거나 통계 분석 목적의 익명 처리만 수행합니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold">4. 제3자 제공 및 처리위탁</h2>
        <p className="mb-2">
          결제 처리를 위해 PG사(토스페이먼츠 등)에 필요한 정보가 제공·위탁될 수
          있으며, 위탁사는 관련 법령을 준수합니다.
        </p>
        <p className="text-sm text-gray-600">
          (인프라/호스팅: Vercel, 데이터베이스/SaaS: 필요한 범위 내 공급업체 —
          서비스 안정성 및 보안을 위한 처리위탁에 해당)
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold">5. 이용자 권리</h2>
        <p>
          이용자는 개인정보의 열람·정정·삭제·처리정지를 요구할 수 있으며, 회사는
          정당한 사유가 없는 한 지체 없이 조치합니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold">6. 안전성 확보 조치</h2>
        <p>
          회사는 암호화, 접근통제, 로그 모니터링 등 기술적·관리적 보호조치를
          적용하여 개인정보를 안전하게 보호합니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold">7. 문의처</h2>
        <ul className="list-disc pl-6">
          <li>이메일: contact@ai-rabbit.com</li>
          <li>대표번호: 062-651-0922</li>
        </ul>
      </section>

      <p className="text-sm text-gray-600">시행일: 2025-09-11</p>
    </main>
  );
}