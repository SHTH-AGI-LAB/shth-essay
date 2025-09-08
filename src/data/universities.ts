// data/universities.ts
export const UNIVERSITIES = [
  {
    name: "가톨릭대",
    slug: "catholic",
    scale: 100,
    gradingType: "100점제",
    criteria: {
      문제1: { desc: "자료이해, 비교, 대조", weight: 20 },
      문제2: { desc: "정확한 내용 분석, 교과와 연관한 '개념어'", weight: 40 },
      문제3: { desc: "양면적 비판적 사고, 장단점 분류", weight: 40 },
    },
    bonus: "3개 문항 시간분배, 비판적 사고력",
  },
  {
    name: "건국대",
    slug: "konkuk",
    scale: 1000,
    gradingType: "1000점제",
    criteria: {
      문제1: { desc: "도표이해, 제시문들의 유기적 연결, 종합적 사고력", weight: 40 },
      문제2: { desc: "사고의 과정, 논증력, 창의력", weight: 60 },
    },
    bonus: "창의적인 사고, 표현력, 어휘력, 700점-900점까지 합격자 점수 폭이 넓음",
  },
  {
    name: "경기대",
    slug: "kyonggi",
    scale: 100,
    gradingType: "100점제",
    criteria: {
      문제1: { desc: "비교, 대조 내용이해", weight: 30 },
      문제2: { desc: "관점 선택형 논술, 자신있게 비판하라", weight: 70 },
    },
    bonus: "자신의 주장을 사회적 의의로 확장, 미래지향적 사고",
  },
  {
    name: "경희대",
    slug: "kyunghee",
    scale: 1000,
    gradingType: "1000점제",
    criteria: {
      문제1: { desc: "단순 요약 NO, 치밀한 어휘력, 문장력, 논리력", weight: 40 },
      문제2: { desc: "논리적 구성, 문장력으로 승부", weight: 60 },
    },
    bonus: "논리적 구성, 문장력, 어휘력, 맞춤법, 제시문 활용",
  },
  {
    name: "고려대",
    slug: "korea",
    scale: 100,
    gradingType: "100점제",
    criteria: {
      문제1: { desc: "제시문 이해, 요약, 요점 파악", weight: 50 },
      문제2: { desc: "논리적 구성력, 논증력, 어휘력, 창의력", weight: 50 },
    },
    bonus: "종합적 사고, 논증력, 창의력, 논리력, 문장력, 어휘력",
  },
  {
    name: "광운대",
    slug: "kw",
    scale: 100,
    gradingType: "100점제",
    criteria: {
      문제1: { desc: "제시문 이해, 요약 정리, 본문 키워드 사용", weight: 40 },
      문제2: { desc: "논리적 사고, 창의성, 본문 키워드 사용", weight: 60 },
    },
    bonus: "창의력, 시사적 이슈 연계, 구체적 사례, 제시문 인용",
  },
  {
    name: "단국대",
    slug: "dankook",
    scale: 100,
    gradingType: "100점제",
    criteria: {
      문제1: { desc: "3개 문제를 문단 바꿈으로 입력, 제시문 이해, 요약", weight: 40 },
      문제2: { desc: "3개 문제를 문단 바꿈으로 입력, 논리적 구성, 문장력", weight: 60 },
    },
    bonus: "6문제 시간분배, 3문제대 제시문 연관 활용, 논리적 구성",
  },
  {
  name: "동국대",
  slug: "dongguk",
  scale: 100,
  gradingType: "100점제",
  criteria: {
    문제1: { desc: "간결한 문장, 핵심 요지 정리", weight: 30 },
    문제2: { desc: "간결한 문장, 구체적 추론(가산점)", weight: 30 },
    문제3: { desc: "비교·대조, 논리 전개, 문장력", weight: 40 },
  },
  bonus: "전형적인 대치동 스타일 논술을 더 압축해서 작성",
  },
  {
    name: "부산대",
    slug: "pusan",
    scale: 100,
    gradingType: "100점제",
    criteria: {
      문제1: { desc: "제시문 이해, 요약", weight: 50 },
      문제2: { desc: "논리적 구성, 문장력, 어휘력", weight: 50 },
    },
    bonus: "논리적 구성, 문장력, 어휘력, 맞춤법, 제시문 활용",
  },
  {
    name: "서강대",
    slug: "sogang",
    scale: 100,
    gradingType: "100점제",
    criteria: {
      문제1: { desc: "제시문 이해, 비교, 대조", weight: 40 },
      문제2: { desc: "비판적 사고, 논증력", weight: 60 },
    },
    bonus: "창의적인 사고, 표현력, 어휘력",
  },
  {
    name: "서울여대",
    slug: "swu",
    scale: 100,
    gradingType: "100점제",
    criteria: {
      문제1: { desc: "제시문 이해, 요약", weight: 40 },
      문제2: { desc: "논리적 구성, 창의성", weight: 60 },
    },
    bonus: "시사적 연계, 구체 사례, 미래지향적 사고",
  },
  {
    name: "성균관대",
    slug: "skku",
    scale: 100,
    gradingType: "100점제",
    criteria: {
      문제1: { desc: "제시문 이해, 종합적 사고, 분석능력", weight: 30 },
      문제2: { desc: "비판적 사고, 논증력", weight: 70 },
    },
    bonus: "종합적 사고, 문장력, 어휘력",
  },
  {
    name: "성신여대",
    slug: "sungshin",
    scale: 100,
    gradingType: "100점제",
    criteria: {
      문제1: { desc: "제시문 요약, 이해", weight: 50 },
      문제2: { desc: "논리적 구성, 창의력", weight: 50 },
    },
    bonus: "표현력, 맞춤법, 제시문 인용",
  },
  {
  name: "세종대",
  slug: "sejong",
  scale: 700,
  gradingType: "700점제",
  criteria: {
    문제1: { desc: "비판적 사고력, 분석력, 분량 준수", weight: 35 },
    문제2: { desc: "창의적인 분석력, 분량 준수", weight: 65 },
  },
  bonus: "기서결 구성, 간결한 문장, 지문 분석력",
  },
  {
    name: "숙명여대",
    slug: "sookmyung",
    scale: 100,
    gradingType: "100점제",
    criteria: {
      문제1: { desc: "제시문 이해, 요약", weight: 40 },
      문제2: { desc: "논리적 구성, 문장력, 사회문제와 연결", weight: 60 },
    },
    bonus: "논리력, 맞춤법, 시사 연계",
  },
  {
    name: "숭실대",
    slug: "soongsil",
    scale: 100,
    gradingType: "100점제",
    criteria: {
      문제1: { desc: "제시문 분석, 이해", weight: 50 },
      문제2: { desc: "비판적 사고, 논증", weight: 50 },
    },
    bonus: "표현력, 구체 사례, 시간분배",
  },
  {
    name: "아주대",
    slug: "ajou",
    scale: 800,
    gradingType: "800점제",
    criteria: {
      문제1: { desc: "제시문 이해, 비교, 종합적 평가", weight: 40 },
      문제2: { desc: "창의적 사고, 논리력", weight: 60 },
    },
    bonus: "종합적 사고, 문장력, 어휘력",
  },
  {
    name: "이화여대",
    slug: "ewha",
    scale: 100,
    gradingType: "100점제",
    criteria: {
      문제1: { desc: "제시문 요약, 분석", weight: 40 },
      문제2: { desc: "비판적 사고, 주관적 관점, 사회적 의의", weight: 60 },
    },
    bonus: "미래지향적 사고, 사회적 의의",
  },
  {
  name: "인하대",
  slug: "inha",
  scale: 100,
  gradingType: "100점제",
  criteria: {
    문제1: { 
      desc: "반론-재반론 구성, 선택과 집중. 제시문은 활용만, (가)(나)(다) 요약 금지", 
      weight: 60 
    },
    문제2: { 
      desc: "수치 계산 금지. '기울기 높다/낮다, 커진다/작아진다' 식의 그래프 비교 이해", 
      weight: 40 
    },
  },
  bonus: "고교 주장형 글쓰기처럼 정해진 구성에 맞춰 자료와 그래프 활용",
  },
  {
    name: "연세대",
    slug: "yonsei",
    scale: 100,
    gradingType: "100점제",
    criteria: {
      문제1: { desc: "제시문 이해, 연결", weight: 50 },
      문제2: { desc: "논증력, 창의력, 표현력, 소논문 스타일", weight: 50 },
    },
    bonus: "표현력, 어휘력, 시사 연계",
  },
  {
    name: "중앙대",
    slug: "cau",
    scale: 100,
    gradingType: "100점제",
    criteria: {
      문제1: { desc: "도표 이해, 요약, 정돈 된 문장", weight: 40 },
      문제2: { desc: "논리적 구성, 비판적 사고", weight: 60 },
    },
    bonus: "창의성, 맞춤법, 제시문 활용",
  },
  {
    name: "한국외대",
    slug: "hufs",
    scale: 100,
    gradingType: "100점제",
    criteria: {
      문제1: { desc: "제시문 분석, 비교", weight: 30 },
      문제2: { desc: "주관적 관점, 논증력, 사회적 확장, 미래지향적 사고", weight: 70 },
    },
    bonus: "사회적 확장, 미래지향",
  },
  {
    name: "한양대",
    slug: "hanyang",
    scale: 100,
    gradingType: "100점제",
    criteria: {
      문제1: { desc: "제시문 이해, 요약", weight: 40 },
      문제2: { desc: "창의적 사고, 예증가능, 구성력 보다 문장력, 비판적 사고", weight: 60 },
    },
    bonus: "논리력, 어휘력, 구체 사례",
  },
  {
    name: "홍익대",
    slug: "hongik",
    scale: 100,
    gradingType: "100점제",
    criteria: {
      문제1: { desc: "제시문 이해, 비교", weight: 40 },
      문제2: { desc: "창의력, 논리적 구성", weight: 60 },
    },
    bonus: "문장력, 어휘력, 미래지향적 사고",
  },
];