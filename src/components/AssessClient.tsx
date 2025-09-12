"use client";

import { useMemo, useState } from "react";
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

/** API 응답 타입 */
type ScoreResponse = {
  university: string;   // slug
  questionId: string;   // "문제1"
  score: number;        // uni.scale 기준 절대점수
  bonus: number;
  rationale: string[];
  evidence: string[];
  model: string;
};

export default function AssessClient({ slug }: Props) {
  const uni = useMemo<University | undefined>(() => UNIVERSITIES.find((u) => u.slug === slug), [slug]);

  if (!uni) {
    return <p className="p-4 text-red-500">대학 정보가 없습니다.</p>;
  }

  const u = uni as University; // 고정

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loadingKey, setLoadingKey] = useState<string | null>(null); // 문항별 로딩 or "ALL"
  const [perQuestionResult, setPerQuestionResult] = useState<Record<string, ScoreResponse>>({});
  const [summary, setSummary] = useState<null | { total100: number; grade: string }>(null);

  /** 문항 키 목록 (예: ["문제1","문제2", ...]) */
  const questionKeys = useMemo(() => Object.keys(u.criteria ?? {}), [u.criteria]);

  /** 한 문항 채점 */
  async function scoreOne(questionKey: string) {
    const answer = answers[questionKey] || "";
    if (!answer.trim()) {
      alert(`${questionKey} 답안을 입력해주세요.`);
      return;
    }

    setLoadingKey(questionKey);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          university: slug,     // ex: "kyunghee"
          questionId: questionKey, // ex: "문제1"
          answer,               // 해당 문항 답안
        }),
      });

      const data: ScoreResponse | { error: string } = await res.json();
      if (!res.ok) throw new Error((data as any).error || "채점 실패");

      setPerQuestionResult((prev) => ({ ...prev, [questionKey]: data as ScoreResponse }));
    } catch (err: any) {
      alert(err.message || "채점 서버 오류 발생!");
    } finally {
      setLoadingKey(null);
    }
  }

  /** 전체 채점 + 가중 합산(100점 환산) */
  async function scoreAll() {
    setLoadingKey("ALL");
    setSummary(null);
    try {
      const results: Record<string, ScoreResponse> = { ...perQuestionResult };
      for (const q of questionKeys) {
        const a = answers[q] || "";
        if (!a.trim()) continue; // 미입력 문항은 건너뜀

        const res = await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            university: slug,
            questionId: q,
            answer: a,
          }),
        });
        const data: ScoreResponse | { error: string } = await res.json();
        if (!res.ok) throw new Error((data as any).error || `채점 실패 (${q})`);
        results[q] = data as ScoreResponse;
      }
      setPerQuestionResult(results);

      // 가중 합산: 각 문항 (점수/만점) * weight% → 총 100점 환산
      let total100 = 0;
      for (const q of questionKeys) {
        const criterion = (u.criteria as any)[q];
        const weightPct: number = Number(criterion?.weight ?? 0); // 20, 40 등
        const r = results[q];
        if (!r) continue;
        const ratio = r.score / (u.scale || 100); // 0~1
        total100 += ratio * weightPct; // 가중치만큼 누적
      }
      total100 = Math.max(0, Math.min(100, Math.round(total100)));

      setSummary({ total100, grade: toGrade(total100) });
    } catch (err: any) {
      alert(err.message || "전체 채점 중 오류가 발생했습니다.");
    } finally {
      setLoadingKey(null);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">
        {u.name} ({u.gradingType})
      </h1>
      <p className="text-gray-700 mb-4">만점: {u.scale}점</p>

      {questionKeys.map((문제) => {
        const { desc, weight } = (u.criteria as any)[문제] || {};
        const r = perQuestionResult[문제];

        return (
          <div key={문제} className="mb-6 border-b pb-4">
            <h2 className="font-semibold">
              {문제} ({weight ?? 0}%)
            </h2>
            <p className="text-sm text-gray-600 mb-2">{desc}</p>
            <textarea
              value={answers[문제] || ""}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [문제]: e.target.value }))
              }
              placeholder={`${문제} 답안을 입력하세요...`}
              className="w-full border p-2 rounded"
              rows={5}
            />

            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => scoreOne(문제)}
                disabled={loadingKey === 문제}
                className="bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600"
              >
                {loadingKey === 문제 ? "채점 중..." : "이 문항 AI 채점"}
              </button>
              {r && (
                <span className="text-sm text-gray-700">
                  → 점수 {r.score} / {u.scale} (모델: {r.model})
                </span>
              )}
            </div>

            {r?.rationale?.length ? (
              <div className="mt-3 bg-gray-50 border rounded p-3">
                <h3 className="font-semibold mb-1">첨삭 코멘트</h3>
                {r.rationale.map((c, i) => (
                  <p key={i} className="text-sm">- {c}</p>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}

      <div className="mt-4 flex gap-2 no-print">
        <button
          onClick={scoreAll}
          disabled={loadingKey === "ALL"}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          {loadingKey === "ALL" ? "전체 채점 중..." : "전체 문항 AI 채점"}
        </button>

        <button
          onClick={() => window.print()}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          인쇄 / PDF 저장
        </button>
      </div>

      {summary && (
        <div className="mt-6 border-t pt-4">
          <h2 className="font-bold mb-2">📊 종합 결과</h2>
          <p>
            <strong>총점(100 환산):</strong> {summary.total100}점 → {summary.grade}
          </p>
          {u.bonus && <p className="mt-2 text-sm text-gray-700">{u.bonus}</p>}
        </div>
      )}
    </div>
  );
}
