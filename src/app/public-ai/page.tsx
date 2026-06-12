export default function PublicAIPage() {
  const universities = [
    {
      name: "가톨릭대",
      major: "철학과",
      lecture: "윤리학개론",
      question: "AI 시대 인간의 자유의지와 책임은 어떻게 변화하는가?",
      books: ["사피엔스", "멋진 신세계", "정의란 무엇인가"],
    },
    {
      name: "건국대",
      major: "사회학과",
      lecture: "현대사회이론",
      question: "탄소중립 정책은 지역사회에 어떤 영향을 미치는가?",
      books: ["침묵의 봄", "기후변화와 사회", "지구를 위한 경제학"],
    },
    {
      name: "경기대",
      major: "경영학과",
      lecture: "글로벌경영론",
      question: "플랫폼 경제 시대, 기업의 사회적 책임은 무엇인가?",
      books: ["국가는 왜 실패하는가", "21세기 자본론", "경제학 콘서트"],
    },
    {
      name: "경희대",
      major: "국제학과",
      lecture: "국제정치학",
      question: "미중 갈등 시대 한국의 외교 전략은 어떻게 해야 하는가?",
      books: ["총, 균, 쇠", "군주론", "세계화의 역습"],
    },
    {
      name: "고려대",
      major: "정치외교학과",
      lecture: "현대정치사상",
      question: "민주주의는 디지털 시대에 어떻게 진화해야 하는가?",
      books: ["정의란 무엇인가", "군주론", "민주주의의 위기"],
    },
    {
      name: "광운대",
      major: "경영학과",
      lecture: "경영학원론",
      question: "AI 기술 발전이 인간 노동의 의미를 어떻게 바꾸는가?",
      books: ["플랫폼 레볼루션", "일의 미래", "넷플릭스 효과"],
    },
    {
      name: "단국대",
      major: "생명윤리학과",
      lecture: "생명윤리학",
      question: "유전자 편집 기술, 어디까지 허용되어야 하는가?",
      books: ["사피엔스", "호모 데우스", "생명의 존엄"],
    },
    {
      name: "동국대",
      major: "불교학과",
      lecture: "불교와 현대사회",
      question: "불교적 관점에서 본 현대 사회의 물질주의 문제는?",
      books: ["무소유", "달라이 라마의 행복론", "생각에 관한 생각"],
    },
    {
      name: "부산대",
      major: "사회학과",
      lecture: "도시사회학",
      question: "기후위기 시대, 도시의 지속가능한 발전 방안은?",
      books: ["도시의 탄생", "인간과 도시", "기후위기와 자본주의"],
    },
    {
      name: "서강대",
      major: "영문학과",
      lecture: "현대문학이론",
      question: "디지털 시대, 문학의 역할은 무엇인가?",
      books: ["군주론", "국가는 왜 실패하는가", "정의란 무엇인가"],
    },
    {
      name: "서울여대",
      major: "여성학과",
      lecture: "젠더와 사회",
      question: "4차 산업혁명 시대, 여성의 사회적 지위는 어떻게 변화하는가?",
      books: ["젠더 트러블", "우리는 모두 페미니스트", "보이지 않는 여성"],
    },
    {
      name: "성균관대",
      major: "유학과",
      lecture: "동양철학특강",
      question: "유가 사상은 현대 사회 문제 해결에 어떤 시사점을 주는가?",
      books: ["논어", "군주론", "동양과 서양"],
    },
    {
      name: "세종대",
      major: "행정학과",
      lecture: "스마트정부론",
      question: "데이터 기반 행정이 민주주의에 미치는 영향은?",
      books: ["빅데이터 시대", "정부 3.0", "민주주의의 위기"],
    },
    {
      name: "성신여대",
      major: "디자인학과",
      lecture: "디지털디자인론",
      question: "AI가 디자인 창작의 주체가 될 수 있는가?",
      books: ["예술의 역사", "디자인의 디자인", "예술철학"],
    },
    {
      name: "숙명여대",
      major: "경영학과",
      lecture: "여성리더십론",
      question: "포스트 코로나 시대, 여성 리더십의 중요성은?",
      books: ["리더십의 조건", "그릿", "여성 리더십"],
    },
    {
      name: "숭실대",
      major: "철학과",
      lecture: "인공지능윤리",
      question: "AI 윤리 가이드라인은 어떻게 설계되어야 하는가?",
      books: ["사피엔스", "멋진 신세계", "기술과 문명"],
    },
    {
      name: "아주대",
      major: "경영학과",
      lecture: "조직행동론",
      question: "의료 AI 도입이 인간 사회에 미치는 영향은?",
      books: ["경제학 콘서트", "21세기 자본", "일의 미래"],
    },
    {
      name: "이화여대",
      major: "사회학과",
      lecture: "현대사회이론",
      question: "초연결 사회에서 개인의 정체성은 어떻게 형성되는가?",
      books: ["고독한 군중", "정의란 무엇인가", "인간관계론"],
    },
    {
      name: "인하대",
      major: "아태물류학과",
      lecture: "글로벌물류론",
      question: "글로벌 공급망 위기는 한국 경제에 어떤 교훈을 주는가?",
      books: ["총, 균, 쇠", "세계경제론", "무역의 조건"],
    },
    {
      name: "연세대",
      major: "심리학과",
      lecture: "인지심리학",
      question: "디지털 환경이 인간의 집중력과 정신건강에 미치는 영향은?",
      books: ["생각에 관한 생각", "팩트풀니스", "마음챙김의 기적"],
    },
    {
      name: "중앙대",
      major: "언론영상학과",
      lecture: "미디어이론",
      question: "가짜뉴스와 딥페이크 시대 미디어 리터러시 교육은 어떻게 해야 하는가?",
      books: ["팩트풀니스", "생각에 관한 생각", "넥서스"],
    },
    {
      name: "한국외대",
      major: "국제통상학과",
      lecture: "글로벌경제론",
      question: "탈세계화 시대, 한국 경제의 생존 전략은?",
      books: ["총, 균, 쇠", "국가는 왜 실패하는가", "세계경제의 미래"],
    },
    {
      name: "한양대",
      major: "철학과",
      lecture: "윤리학개론",
      question: "AI 시대 인간의 자유의지와 책임은 어떻게 변화하는가?",
      books: ["사피엔스", "멋진 신세계", "정의란 무엇인가"],
    },
    {
      name: "홍익대",
      major: "미술학과",
      lecture: "현대미술론",
      question: "AI 예술 시대, 인간 예술가의 역할은 무엇인가?",
      books: ["예술의 역사", "디자인의 디자인", "예술철학"],
    },
  ];

  return (
    <main className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-7xl">

        <h1 className="mb-4 text-center text-4xl font-bold">
          🌍 공공데이터 AI 입시정보관
        </h1>

        <p className="mb-12 text-center text-gray-600 leading-relaxed text-lg">          국가중점데이터(대학 강의계획서)와
          광주광역시 도서관 추천도서를 활용하여
          대학별 논술 특성과 탐구 주제를 제공합니다.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {universities.map((uni, index) => (
            <div
              key={index}
              className="rounded-2xl border p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <h3 className="mb-4 text-2xl font-semibold">
                🏫 {uni.name}
              </h3>

              <p className="mb-2 text-sm text-gray-500">
                전공 / 대표 강의
              </p>

              <p className="mb-4 text-gray-700">
                {uni.major} · {uni.lecture}
              </p>

              <p className="mb-2 text-sm text-gray-500">
                대표 탐구 주제
              </p>

              <p className="mb-4 text-gray-700 leading-relaxed">
                {uni.question}
              </p>

              <p className="mb-2 text-sm text-gray-500">
                추천도서
              </p>

              <ul className="mb-4 text-gray-700 text-sm">
                {uni.books.map((book, i) => (
                  <li key={i}>• {book}</li>
                ))}
              </ul>

              <div className="border-t pt-3 text-xs text-gray-500">
                공공데이터 활용
                <br />
                국가중점데이터(대학 강의계획서)
                <br />
                광주광역시 도서관 추천도서
              </div>
            </div>
          ))}

        </div>
      </div>
    </main>
  );
}