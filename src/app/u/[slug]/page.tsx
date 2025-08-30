// app/u/[slug]/page.tsx
import AssessClient from "@/components/AssessClient";
import { notFound } from "next/navigation";

type UniConfig = {
  criteria: Record<string, number>;
  scale?: number; // 건국=1000, 기본=100
  problemWeights?: { "1": number; "2": number }; // 문제1/문제2 가중치
};

// 대학별 채점 설정
const UNI: Record<string, UniConfig> = {
  // 가톨릭대 (100점, 문제1·2 = 50/50)
  catholic: {
    criteria: {
      "논제 이해": 40,
      "구조와 전개": 25,
      "논증과 근거": 20,
      "표현": 10,
      "형식": 5,
    },
    scale: 100,
    problemWeights: { "1": 50, "2": 50 },
  },

  // 건국대 (1000점, 문제1·2 = 40/60)
  konkuk: {
    criteria: {
      "논제 이해": 20,
      "분석": 30,
      "논증": 30,
      "창의성": 10,
      "표현": 10,
    },
    scale: 1000,
    problemWeights: { "1": 40, "2": 60 },
  },

  // 경기대 (100점, 문제1·2 = 30/70)
  kyonggi: {
    criteria: {
      "논제 분석": 20,
      "비교대조": 20,
      "그래프/자료분석": 25,
      "논리력": 20,
      "표현/형식": 15,
    },
    scale: 100,
    problemWeights: { "1": 30, "2": 70 },
  },

  // 고려대 (추가 예시, 임시 값)
  korea: {
    criteria: {
      "논제 이해": 30,
      "논증": 40,
      "표현": 20,
      "형식": 10,
    },
    scale: 100,
    problemWeights: { "1": 50, "2": 50 },
  },
};

export default function UniversityPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const data = UNI[slug];

  if (!data) {
    return notFound();
  }

  return (
    <main className="max-w-4xl mx-auto p-6 sm:p-8">
      <AssessClient slug={slug} data={data} />
    </main>
  );
}