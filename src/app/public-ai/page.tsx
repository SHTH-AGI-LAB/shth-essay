export default function PublicAIPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-5xl">

        {/* 제목 */}
        <h1 className="mb-4 text-center text-4xl font-bold">
          🌍 공공데이터 AI 입시정보관
        </h1>

        {/* 설명 */}
        <p className="mb-12 text-center text-gray-600 leading-relaxed">
          공공데이터와 AI를 활용하여<br />
          진로 탐색, 입시 정보, 사회문제 논술 탐구를 지원합니다.
        </p>

        {/* 카드 영역 */}
        <div className="grid gap-6 md:grid-cols-3">

          {/* 카드 1 */}
          <div className="rounded-2xl border p-6 shadow-sm hover:shadow-md transition">
            <h2 className="mb-3 text-xl font-semibold">
              🎓 진로·학과 탐색
            </h2>

            <p className="text-sm text-gray-600 leading-relaxed">
              공공데이터 기반으로
              학과와 진로 정보를 탐색합니다.
            </p>
          </div>

          {/* 카드 2 */}
          <div className="rounded-2xl border p-6 shadow-sm hover:shadow-md transition">
            <h2 className="mb-3 text-xl font-semibold">
              📊 입시 데이터 분석
            </h2>

            <p className="text-sm text-gray-600 leading-relaxed">
              대학 및 입시 데이터를
              AI와 함께 분석합니다.
            </p>
          </div>

          {/* 카드 3 */}
          <div className="rounded-2xl border p-6 shadow-sm hover:shadow-md transition">
            <h2 className="mb-3 text-xl font-semibold">
              🌍 사회문제 논술탐구
            </h2>

            <p className="text-sm text-gray-600 leading-relaxed">
              지역사회와 공공데이터를 기반으로
              논술 주제를 탐구합니다.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}