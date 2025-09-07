// src/app/about/page.tsx
export const metadata = {
  title: "소개 | Dr-phyllis",
  description: "닥터필리스 AI 논술 첨삭 서비스 소개",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 sm:p-10">
      <h1 className="text-2xl font-bold mb-6">닥터필리스 소개</h1>

      <section className="space-y-4 mb-10">
        <p>
          닥터필리스는 <b>AI 기반 대입논술 첨삭 서비스</b>입니다. 
          대학별 기출 문제와 채점 기준을 반영하여, 학생 개개인의 글을 
          정확하고 신속하게 분석하고 피드백합니다.
        </p>
        <p>
          단순한 글 교정이 아니라 <b>사고력, 창의력, 문제해결능력</b>을 함께 키울 수 있도록 
          맞춤형 첨삭과 총평 PDF를 제공합니다.
        </p>
      </section>

      <section className="space-y-3 mb-10">
        <h2 className="text-lg font-semibold">왜 닥터필리스인가?</h2>
        <ul className="list-disc pl-6 space-y-1 text-gray-700">
          <li>15년 경력 논술 전문 강사의 노하우</li>
          <li>스프링거 네이처 논문 게재 경험으로 검증된 전문성</li>
          <li>한양대, 경희대, 고려대, 중앙대 등 주요 대학 합격생 다수 배출</li>
          <li>등록 시 무료 정시 라인 상담 제공</li>
          <li>조용한 전원주택 연구실(방3개, 화장실3개, 거실·파티룸) 기반</li>
        </ul>
      </section>

      <section className="space-y-3 mb-10">
        <h2 className="text-lg font-semibold">우리의 비전</h2>
        <p>
          4차 산업혁명과 AI 시대, 단순 암기가 아닌 <b>멘탈 관리와 창의융합적 사고</b>가 
          가장 중요한 경쟁력이 됩니다. 닥터필리스는 자기주도학습, 심리상담, 
          AI 논술 첨삭을 통해 아이들의 균형 있는 성장을 돕습니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">문의</h2>
        <ul className="list-disc pl-6 space-y-1 text-gray-700">
          <li>대표번호: 062-651-0922 / 010-2734-5261</li>
          <li>이메일: support@dr-phyllis.com</li>
        </ul>
      </section>
    </main>
  );
}