// src/app/public-ai/[slug]/page.tsx
import Link from "next/link";

interface UniversityDetail {
  name: string;
  fields: string[];
  lectures: string[];
  thinkingType: string;
  features: string[];
  grading: string;
  bonus: string;
  aiPoints: string[];
}

// TODO: 추후 데이터 파일 분리 예정
// → /data/universityDetails.ts 로 이동할 예정
const universityDetails: Record<string, UniversityDetail> = {
  hanyang: {
    name: "한양대학교",
    fields: ["인문학", "사회과학", "경영경제"],
    lectures: [
      "사회혁신과 창의적 사고",
      "비판철학",
      "경제와 사회변화"
    ],
    thinkingType: "비판적 사고형 · 창의융합형",
    features: [
      "자신의 견해를 처음부터 명확히 제시",
      "비판적 시각과 창의력이 동시에 드러남"
    ],
    grading: "자신의 견해·비판적 사고·창의력 중심 평가",
    bonus: "논리성보다 설득력과 에세이 완성도",
    aiPoints: [
      "첫 문장에서 입장이 드러나는가",
      "논거가 설득력 있는가",
      "비판적 시각이 있는가",
      "에세이 완성도가 있는가"
    ]
  },
  sogang: {
    name: "서강대학교",
    fields: ["인문학", "사회과학", "미디어커뮤니케이션"],
    lectures: [
      "현대 사회와 윤리",
      "글로벌 리더십",
      "디지털 시대의 커뮤니케이션"
    ],
    thinkingType: "통합적 사고형 · 윤리적 판단형",
    features: [
      "다양한 관점을 종합적으로 분석",
      "윤리적 판단과 사회적 책임 의식 강조"
    ],
    grading: "통합적 분석력과 윤리적 성찰 중심",
    bonus: "사회적 함의에 대한 깊이 있는 고찰",
    aiPoints: [
      "다양한 관점의 균형 잡힌 분석",
      "윤리적 딜레마에 대한 성찰",
      "사회적 맥락 이해도",
      "글로벌 시각의 반영"
    ]
  },
  korea: {
    name: "고려대학교",
    fields: ["인문학", "사회과학", "국제학"],
    lectures: [
      "현대 한국 사회 이해",
      "글로벌 거버넌스",
      "미래 사회와 기술"
    ],
    thinkingType: "전략적 사고형 · 국제적 시야형",
    features: [
      "장기적 관점에서의 전략 수립",
      "국제적 맥락에서 문제 해결"
    ],
    grading: "전략적 사고와 국제적 감각 중심",
    bonus: "미래 지향적 제안과 실현 가능성",
    aiPoints: [
      "전략적 사고의 깊이",
      "국제적 관점의 적용",
      "미래 지향적 제안",
      "논리적 설득력"
    ]
  },
  chungang: {
    name: "중앙대학교",
    fields: ["인문학", "사회과학", "예술"],
    lectures: [
      "문화와 사회",
      "창의적 표현과 비평",
      "미디어와 현대사회"
    ],
    thinkingType: "창의비판형 · 문화융합형",
    features: [
      "문화적 감수성과 비판적 시각",
      "예술적 표현과 사회적 통찰의 융합"
    ],
    grading: "창의성과 비판적 통찰 중심",
    bonus: "문화적·예술적 감수성",
    aiPoints: [
      "문화적 맥락 이해",
      "창의적 표현력",
      "비판적 분석 능력",
      "융합적 사고"
    ]
  },
  sungkyunkwan: {
    name: "성균관대학교",
    fields: ["유학", "인문학", "사회과학"],
    lectures: [
      "동아시아 유학 사상",
      "전통과 현대의 조화",
      "리더십과 윤리"
    ],
    thinkingType: "유교적 리더십형 · 조화융합형",
    features: [
      "전통 가치와 현대 사회의 조화",
      "인문적 소양과 실천적 리더십"
    ],
    grading: "인문적 소양과 실천적 적용력 중심",
    bonus: "전통과 현대를 아우르는 통찰",
    aiPoints: [
      "전통 가치의 현대적 해석",
      "조화로운 사고",
      "실천적 리더십",
      "인문적 깊이"
    ]
  }
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function UniversityDetailPage({ params }: PageProps) {
  const { slug } = await params;

  console.log("slug =", slug);

  const university = universityDetails[slug];

  console.log("university =", university);

  if (!university) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="text-6xl mb-6">🏫</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            준비 중인 대학입니다.
          </h1>
          <p className="text-gray-600 mb-8">
            해당 대학의 상세 정보는 곧 업데이트될 예정입니다.
          </p>
          
          <div className="bg-white rounded-3xl p-6 mb-8 text-left">
            <p className="font-medium text-gray-800 mb-3">현재 지원 대학</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              한양대학교, 서강대학교, 고려대학교,<br />
              중앙대학교, 성균관대학교
            </p>
          </div>

          <Link
            href="/public-ai"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            ← 대학 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-5xl">🏫</div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                {university.name}
              </h1>
              <p className="text-blue-100 mt-2 text-lg">
                공공데이터 AI 입시정보관
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-2 rounded-full text-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            입시 에세이 분석
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ① 대표 전공 분야 */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl">📚</div>
              <h2 className="text-2xl font-bold text-gray-800">대표 전공 분야</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {university.fields.map((field, idx) => (
                <div
                  key={idx}
                  className="bg-blue-50 text-blue-700 px-5 py-3 rounded-2xl font-medium text-sm"
                >
                  {field}
                </div>
              ))}
            </div>
          </div>

          {/* ② 대표 강의 예시 */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl">🎓</div>
              <h2 className="text-2xl font-bold text-gray-800">대표 강의 예시</h2>
            </div>
            <ul className="space-y-4">
              {university.lectures.map((lecture, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="text-amber-500 font-bold mt-0.5">•</span>
                  <span className="text-gray-700">{lecture}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ③ 요구하는 사고력 유형 */}
        <div className="mt-8 bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center text-2xl">🧠</div>
            <h2 className="text-2xl font-bold text-gray-800">요구하는 사고력 유형</h2>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-8 text-center">
            <p className="text-3xl font-semibold text-purple-800">
              {university.thinkingType}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* ④ 고득점 답안 특징 */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl">🏆</div>
              <h2 className="text-2xl font-bold text-gray-800">고득점 답안 특징</h2>
            </div>
            <ul className="space-y-4">
              {university.features.map((feature, idx) => (
                <li key={idx} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex-shrink-0 flex items-center justify-center text-emerald-600 text-sm font-bold mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-gray-700 leading-relaxed">{feature}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* ⑤ 주요 채점 기준 */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-rose-100 rounded-2xl flex items-center justify-center text-2xl">📝</div>
              <h2 className="text-2xl font-bold text-gray-800">주요 채점 기준</h2>
            </div>
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-7">
              <p className="text-rose-800 text-lg leading-relaxed font-medium">
                {university.grading}
              </p>
            </div>
          </div>
        </div>

        {/* ⑥ 가산점 포인트 */}
        <div className="mt-8 bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-yellow-100 rounded-2xl flex items-center justify-center text-2xl">⭐</div>
            <h2 className="text-2xl font-bold text-gray-800">가산점 포인트</h2>
          </div>
          <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-8">
            <p className="text-yellow-800 text-xl font-medium">
              {university.bonus}
            </p>
          </div>
        </div>

        {/* ⑦ AI 첨삭 핵심 평가 포인트 */}
        <div className="mt-8 bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-sky-100 rounded-2xl flex items-center justify-center text-2xl">🤖</div>
            <h2 className="text-2xl font-bold text-gray-800">AI 첨삭 핵심 평가 포인트</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {university.aiPoints.map((point, idx) => (
              <div
                key={idx}
                className="bg-sky-50 border border-sky-100 rounded-2xl p-6 flex gap-4"
              >
                <div className="text-sky-500 font-bold text-xl mt-0.5">0{idx + 1}</div>
                <p className="text-gray-700">{point}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 공공데이터 활용 정보 */}
        <div className="mt-10 bg-white/70 border border-gray-100 rounded-3xl p-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">공공데이터 활용</p>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <span className="text-blue-600">•</span>
              <div>
                <span className="font-medium">한국교육학술정보원 대학 강의계획서</span>
                <span className="text-gray-500 ml-2">(국가중점데이터)</span>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-blue-600">•</span>
              <div>
                <span className="font-medium">광주광역시 도서관 추천도서</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI 첨삭 바로가기 버튼 - Link로 변경 */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/login"
            className="group flex items-center gap-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-all text-white text-xl font-semibold px-12 py-6 rounded-3xl shadow-2xl shadow-indigo-500/30 active:scale-[0.97]"
          >
            <span>🤖 AI 첨삭 바로가기</span>
            <span className="text-3xl group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <div className="text-center mt-10">
          <Link
            href="/public-ai"
            className="text-gray-500 hover:text-gray-700 inline-flex items-center gap-2 text-sm"
          >
            ← 다른 대학 보기
          </Link>
        </div>
      </div>
    </div>
  );
}