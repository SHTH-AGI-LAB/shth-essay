"use client";

import { useState } from "react";
import { UNIVERSITIES } from "@/data/universities";

type University = (typeof UNIVERSITIES)[number];

type Props = {
  slug: string;
  data?: {
    gradingScale?: (total: number) => string;
    criteria?: Record<string, number>;
    scale?: number;
    problemWeights?: Record<string, number>;
  };
};

function toGrade(total100: number) {
  if (total100 >= 95) return "A+";
  if (total100 >= 90) return "A";
  if (total100 >= 85) return "B+";
  if (total100 >= 80) return "B";
  if (total100 >= 75) return "C+";
  if (total100 >= 70) return "C";
  if (total100 >= 65) return "D+";
  if (total100 >= 60) return "D";
  return "F";
}

export default function AssessClient({ slug, data: _data }: Props) {
  // ✅ 훅을 함수 최상단으로 이동
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<null | {
    perCriterion: Record<string, number>;
    total100: number;
    grade: string;
    comments: string[];
  }>(null);

  // 그 다음 uni 계산 + 가드
  const uni = UNIVERSITIES.find((u) => u.slug === slug);
  if (!uni) {
    return <p className="p-4 text-red-500">대학 정보가 없습니다.</p>;
  }

  // 확정 변수 (유지: TypeScript 에러 방지용)
  const u = uni as University;

  function evaluate() {
    const perCriterion: Record<string, number> = {};
    let total = 0;

    Object.entries(u.criteria).forEach(([문제, { desc, weight }]) => {
      const text = answers[문제] || "";
      let score = 0;

      // 간단 평가 로직 (분량 + 키워드 확인)
      if (text.length > 200) score += 50;
      if (text.includes("비교") || text.includes("대조")) score += 20;
      if (text.includes("근거") || text.includes("사례") || text.includes("통계")) score += 20;
      if (text.includes("창의") || text.includes("대안")) score += 10;

      score = Math.min(100, score);
      perCriterion[문제] = score;

      total += (score * weight) / 100;
    });

    const comments: string[] = [];
    if (total < 60) comments.push("⚠️ 논리적 설득력이 부족합니다.");
    if (total >= 60 && total < 80) comments.push("👍 기본기는 있으나 근거/예시 보강 필요.");
    if (total >= 80) comments.push("🌟 우수합니다. 심화 논리와 창의적 접근을 더해보세요.");

    setResult({
      perCriterion,
      total100: Math.round(total),
      grade: toGrade(total),
      comments,
    });
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">{u.name} ({u.gradingType})</h1>
      <p className="text-gray-700 mb-4">만점: {u.scale}점</p>

      {Object.entries(u.criteria).map(([문제, { desc, weight }]) => (
        <div key={문제} className="mb-6">
          <h2 className="font-semibold">{문제} ({weight}%)</h2>
          <p className="text-sm text-gray-600 mb-2">{desc}</p>
          <textarea
            value={answers[문제] || ""}
            onChange={(e) =>
              setAnswers({ ...answers, [문제]: e.target.value })
            }
            placeholder={`${문제} 답안을 입력하세요...`}
            className="w-full border p-2 rounded"
            rows={5}
          />
        </div>
      ))}

      <div className="mt-4 flex gap-2 no-print">
        <button
          onClick={evaluate}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          채점하기
        </button>

        <button
          onClick={() => window.print()}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          인쇄 / PDF 저장
        </button>
      </div>

      {result && (
        <div className="mt-6 border-t pt-4">
          <h2 className="font-bold mb-2">📊 채점 결과</h2>
          <ul className="mb-3">
            {Object.entries(result.perCriterion).map(([문제, score]) => (
              <li key={문제}>
                {문제}: {score}점
              </li>
            ))}
          </ul>
          <p>
            <strong>총점:</strong> {result.total100}점 → {result.grade}
          </p>
          <p className="mt-2 text-sm text-gray-700">{u.bonus}</p>
          <div className="mt-3">
            {result.comments.map((c, i) => (
              <p key={i}>- {c}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}