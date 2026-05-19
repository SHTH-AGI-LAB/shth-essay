export default function PublicAIPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-5xl">
        {/* 제목 */}
        <h1 className="mb-4 text-center text-4xl font-bold">
          🌍 공공데이터 AI 입시정보관
        </h1>

        {/* 설명 */}
        <p className="mb-12 text-center text-gray-600 leading-relaxed text-lg">
          공공데이터와 AI를 활용하여<br />
          진로 탐색, 입시 정보, 사회문제 논술 탐구를 지원합니다.
        </p>

        {/* 메인 카드 영역 */}
        <div className="grid gap-6 md:grid-cols-3 mb-20">
          {/* 카드 1 */}
          <div className="rounded-2xl border p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <h2 className="mb-4 text-2xl font-semibold">🎓 진로·학과 탐색</h2>
            <p className="text-gray-600 leading-relaxed">
              공공데이터 기반으로<br />
              학과와 진로 정보를 탐색합니다.
            </p>
          </div>

          {/* 카드 2 */}
          <div className="rounded-2xl border p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <h2 className="mb-4 text-2xl font-semibold">📊 입시 데이터 분석</h2>
            <p className="text-gray-600 leading-relaxed">
              대학 및 입시 데이터를<br />
              AI와 함께 분석합니다.
            </p>
          </div>

          {/* 카드 3 */}
          <div className="rounded-2xl border p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <h2 className="mb-4 text-2xl font-semibold">🌍 사회문제 논술탐구</h2>
            <p className="text-gray-600 leading-relaxed">
              지역사회와 공공데이터를 기반으로<br />
              논술 주제를 탐구합니다.
            </p>
          </div>
        </div>

        {/* AI 진로·논술 탐구 예시 섹션 */}
        <section>
          <h2 className="mb-10 text-center text-3xl font-bold">
            🎓 AI 진로·논술 탐구 예시
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {/* 예시 1 */}
            <div className="rounded-2xl border p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <h3 className="mb-4 text-2xl font-semibold">🧠 철학과</h3>
              <p className="mb-3 text-sm text-gray-500">대표 강의: 윤리학개론</p>
              <p className="text-gray-700 leading-relaxed">
                탐구 주제:<br />
                <span className="font-medium">AI 시대 인간의 자유의지와 책임은 어떻게 변화하는가?</span>
              </p>
            </div>

            {/* 예시 2 */}
            <div className="rounded-2xl border p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <h3 className="mb-4 text-2xl font-semibold">🌱 환경공학과</h3>
              <p className="mb-3 text-sm text-gray-500">대표 강의: 기후변화개론</p>
              <p className="text-gray-700 leading-relaxed">
                탐구 주제:<br />
                <span className="font-medium">탄소중립 정책은 지역사회에 어떤 영향을 미치는가?</span>
              </p>
            </div>

            {/* 예시 3 */}
            <div className="rounded-2xl border p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <h3 className="mb-4 text-2xl font-semibold">📱 심리학과</h3>
              <p className="mb-3 text-sm text-gray-500">대표 강의: 인지심리학</p>
              <p className="text-gray-700 leading-relaxed">
                탐구 주제:<br />
                <span className="font-medium">디지털 환경은 인간의 집중력과 감정에 어떤 영향을 미치는가?</span>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}