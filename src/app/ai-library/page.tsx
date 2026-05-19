export default function AILibraryPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-5xl">

        {/* 제목 */}
        <h1 className="mb-4 text-center text-4xl font-bold">
          📚 광주 AI 독서탐구관
        </h1>

        {/* 설명 */}
        <p className="mb-12 text-center text-gray-600 leading-relaxed">
          광주 공공도서관 데이터를 기반으로<br />
          논술, 진로, 사회문제 탐구에 도움이 되는 도서를 추천합니다.
        </p>

        {/* 카드 영역 */}
        <div className="grid gap-6 md:grid-cols-3">

          {/* 카드 1 */}
          <div className="rounded-2xl border p-6 shadow-sm hover:shadow-md transition">
            <h2 className="mb-3 text-xl font-semibold">
              📖 논술 추천도서
            </h2>

            <p className="text-sm text-gray-600 leading-relaxed">
              논술 주제와 연계된 추천 도서를
              AI가 탐색하고 안내합니다.
            </p>
          </div>

          {/* 카드 2 */}
          <div className="rounded-2xl border p-6 shadow-sm hover:shadow-md transition">
            <h2 className="mb-3 text-xl font-semibold">
              🌍 사회문제 독서탐구
            </h2>

            <p className="text-sm text-gray-600 leading-relaxed">
              환경, AI, 교육, 지역사회 문제와
              연결된 독서를 탐구합니다.
            </p>
          </div>

          {/* 카드 3 */}
          <div className="rounded-2xl border p-6 shadow-sm hover:shadow-md transition">
            <h2 className="mb-3 text-xl font-semibold">
              🤖 AI 진로 독서추천
            </h2>

            <p className="text-sm text-gray-600 leading-relaxed">
              관심 분야와 진로 방향에 맞는
              도서를 추천합니다.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}