// src/app/terms/page.tsx
export const metadata = {
  title: "이용약관 | Dr-phyllis",
  description: "닥터필리스 이용약관",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 sm:p-10 leading-7">
      <h1 className="text-2xl font-bold mb-6">이용약관</h1>

      <section className="mb-6">
        <h2 className="font-semibold">1. 목적</h2>
        <p>
          본 약관은 닥터필리스(이하 &quot;회사&quot;)가 제공하는 서비스의 이용과 관련하여
          회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold">2. 서비스 정의</h2>
        <p>
          회사는 AI 기반 대입논술 첨삭 및 총평 PDF 제공, 전문가 직접 첨삭 리포트,
          학생 맞춤형 컨설팅을 포함한 디지털/무형 서비스를 제공합니다.
        </p>
        <ul className="list-disc pl-6 mt-2">
          <li>
            <strong>AI 첨삭 서비스:</strong> 학생이 입력한 글에 대해 AI 기반 분석 및
            채점 결과를 즉시 제공합니다.
          </li>
          <li>
            <strong>프리미엄 상품:</strong> 결제 시 전문가 직접 첨삭 3회를 제공합니다.
            첨삭 결과는 네이버 블로그 오픈채팅 또는 이메일을 통해 PDF로 전달됩니다.
          </li>
          <li>
            <strong>VIP 상품:</strong> 전문가 직접 첨삭 5회(제공 방식 동일)와 종합
            커리큘럼 및 입시 컨설팅 1회를 제공합니다. 컨설팅은 오픈채팅 또는 이메일
            PDF 파일로 제공되며, 필요 시 전화 상담이 가능합니다.
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold">3. 계정 및 보안</h2>
        <p>
          이용자는 계정 정보를 정확히 관리할 책임이 있으며, 타인의 권리 침해 또는
          불법적 사용이 확인되면 서비스가 제한될 수 있습니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold">4. 결제 및 환불</h2>
        <p>
          결제는 토스페이먼츠 등 PG사를 통해 안전하게 처리됩니다. 환불은
          &quot;환불정책&quot; 페이지 기준을 따릅니다.
        </p>
        <p className="mt-2">
          단, 전문가 첨삭 및 컨설팅 서비스는 1회 이상 제공된 이후에는 환불이
          불가합니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold">5. 지식재산권</h2>
        <p>
          회사가 제공하는 콘텐츠 및 결과물(PDF 총평 포함)의 저작권은 회사에
          있습니다. 이용자는 개인 학습 목적 외 무단 복제, 배포, 상업적 이용을 할
          수 없습니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold">6. 서비스 변경 및 중단</h2>
        <p>
          회사는 서비스 품질 향상을 위해 일부 또는 전부를 변경·중단할 수 있으며,
          중요한 변경 시 사전 고지합니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold">7. 면책</h2>
        <p>
          회사는 천재지변, 통신 장애 등 불가항력 사유로 인한 손해에 대해서는
          책임을 지지 않습니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold">8. 준거법 및 분쟁해결</h2>
        <p>
          본 약관은 대한민국 법률에 따르며, 분쟁은 회사 본점 소재지 관할 법원을
          제1심 전속 관할 법원으로 합니다.
        </p>
      </section>

      <p className="text-sm text-gray-600">시행일: 2025-09-11</p>
    </main>
  );
}
