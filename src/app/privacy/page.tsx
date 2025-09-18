export const metadata = {
  title: "개인정보 처리방침 | Dr-phyllis",
  description: "닥터필리스 개인정보 처리방침",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 sm:p-10 leading-7">
      <h1 className="text-2xl font-bold mb-6">개인정보 처리방침</h1>

      <section className="mb-6">
        <h2 className="font-semibold">1. 총칙</h2>
        <p>
          회사는 「개인정보 보호법」 등 관련 법령을 준수하며, 최소한의 개인정보만
          수집·이용합니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold">2. 수집 항목 및 이용 목적</h2>
        <ul className="list-disc pl-6">
          <li>필수: 이름, 이메일(로그인/식별), 결제정보(거래 처리)</li>
          <li>선택: 연락처(상담/안내)</li>
          <li>쿠키/접속기록: 서비스 개선, 보안</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold">3. 보유 및 이용기간</h2>
        <p>
          법령에 따른 보존기간 또는 이용 목적 달성 시까지 보관하며, 목적 달성 후
          지체 없이 파기합니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold">4. 제3자 제공 및 처리위탁</h2>
        <p>
          결제 처리를 위해 PG사(토스페이먼츠)에 필요한 정보가 제공·위탁될 수 있으며,
          위탁사는 개인정보 보호 관련 법령을 준수합니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold">5. 이용자 권리</h2>
        <p>
          이용자는 개인정보 열람·정정·삭제·처리를 제한할 권리가 있으며, 요청 시
          지체 없이 조치합니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold">6. 안전성 확보 조치</h2>
        <p>개인정보는 암호화·접근통제 등 안전성 확보 조치를 통해 보호됩니다.</p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold">7. 문의처</h2>
        <ul className="list-disc pl-6">
          <li>이메일/ dr-phyllis@naver.com</li>
          <li>대표번호/ 062-651-0922</li>
        </ul>
      </section>

      <p className="text-sm text-gray-600">시행일: 2025-09-01</p>
    </main>
  );
}