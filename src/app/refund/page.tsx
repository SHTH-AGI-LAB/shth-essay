export const metadata = {
  title: "환불정책 | Dr-phyllis",
  description: "닥터필리스 환불정책 안내",
};

export default function RefundPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 sm:p-10 leading-7">
      <h1 className="text-2xl font-bold mb-6">환불정책</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">1. 서비스 유형</h2>
        <p>
          닥터필리스는 <b>디지털/무형 서비스</b>로서, 대입논술 AI 첨삭 및
          맞춤형 총평 PDF를 제공합니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">2. 환불 기준</h2>
        <ul className="list-disc pl-6">
          <li>결제 후 <b>7일 이내</b> 초안 미제출: <b>전액 환불</b></li>
          <li>초안 제출 후, 담당 첨삭 시작 전: 결제금액의 <b>70%</b> 환불</li>
          <li>초안 분석/부분 피드백 제공 이후: 진행 단계에 따라 <b>0~50%</b> 환불</li>
          <li>최종 총평(PDF) 제공 후: <b>환불 불가</b></li>
        </ul>
        <p className="text-sm text-gray-600 mt-2">
          ※ 「전자상거래 등에서의 소비자보호에 관한 법률」에 따라, 디지털 콘텐츠
          제공 개시 후에는 환불이 제한될 수 있습니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">3. 이용(제출) 기한</h2>
        <ul className="list-disc pl-6">
          <li>단건 첨삭권: 결제 후 <b>7일 이내</b> 초안 제출, 제출일로부터 <b>5일 이내</b> 결과 제공</li>
          <li>패키지(다회권): 결제일로부터 <b>12개월 이내</b> 사용</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">4. 환불 접수 방법</h2>
        <ul className="list-disc pl-6">
          <li>이메일: <b>dr-phyllis@naver.com</b></li>
          <li>대표번호: <b>062-651-0922 / 010-3217-8192</b></li>
          <li>접수 시: 주문번호, 결제일, 성함, 연락처, 사유를 함께 보내주세요.</li>
        </ul>
        <p className="text-sm text-gray-600 mt-2">
          환불 승인 후 결제수단사 정책에 따라 <b>영업일 기준 3~7일</b> 이내 환급됩니다.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">5. 사업자 정보</h2>
        <div>
          <p>닥터필리스 대입논술AI첨삭</p>

          <p>사업자명: 주식회사 에어래빗 AIrabbit Inc.</p>
          <p>사업자등록번호: 536-86-03683</p>
          <p>대표자명: 주헌영</p>
          <p>사업장 주소: 광주광역시 남구 행암도동길 43-11 1층</p>
          <p>고객센터: 062-651-0922 / 010-3217-8192</p>
        </div>
      </section>
    </main>
  );
}