"use client";

import { useMemo, useState } from "react";
import { UNIVERSITIES } from "@/data/universities";

type University = (typeof UNIVERSITIES)[number];

type Props = { slug: string };

type ScoreResponse = {
  university: string;   // slug
  questionId: string;   // "문제1"
  score: number;        // 절대점수 (uni.scale 기준)
  bonus: number;
  rationale: string[];
  evidence: string[];
  model: string;
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

export default function AssessClient({ slug }: Props) {
  /** 🔹 모든 훅은 조건문 밖, 최상단에서 호출 */
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loadingKey, setLoadingKey] = useState<string | null>(null); // 문항 키 or "ALL"
  const [perQuestion, setPerQuestion] = useState<Record<string, ScoreResponse>>({});
  const [summary, setSummary] = useState<{ total100: number; grade: string } | null>(null);

  const uni = useMemo<University | undefined>(() => {
    return UNIVERSITIES.find((u) => u.slug === slug);
  }, [slug]);

  /** 🔹 가드는 훅 다음에 */
  if (!uni) {
    return <p className="p-4 text-red-500">대학 정보가 없습니다.</p>;
  }
  const u = uni as University;

  /** 🔹 문항 키 목록 (예: ["문제1","문제2"]) */
  const questionKeys = useMemo(() => Object.keys(u.criteria ?? {}), [u.criteria]);

  /** 한 문항 채점 */
  async function scoreOne(questionKey: string) {
    const answer = answers[questionKey]?.trim() ?? "";
    if (!answer) {
      alert(`${questionKey} 답안을 입력해주세요.`);
      return;
    }

    setLoadingKey(questionKey);
    setSummary(null);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          university: slug,        // ex: "kyunghee"
          questionId: questionKey, // ex: "문제1"
          answer,                  // 해당 문항 답안
        }),
      });

      const data = (await res.json()) as ScoreResponse | { error?: string };
      if (!res.ok) {
        const msg = "error" in data && data.error ? data.error : "채점 실패";
        throw new Error(msg);
      }

      setPerQuestion((prev) => ({ ...prev, [questionKey]: data as ScoreResponse }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "채점 서버 오류 발생!";
      alert(msg);
    } finally {
      setLoadingKey(null);
    }
  }

  /** 전체 문항 채점 + 가중 합산(100점 환산) */
  async function scoreAll() {
    setLoadingKey("ALL");
    setSummary(null);
    try {
      const next: Record<string, ScoreResponse> = { ...perQuestion };

      for (const q of questionKeys) {
        const a = answers[q]?.trim() ?? "";
        if (!a) continue;

        const res = await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            university: slug,
            questionId: q,
            answer: a,
          }),
        });

        const data = (await res.json()) as ScoreResponse | { error?: string };
        if (!res.ok) {
          const msg = "error" in data && data.error ? data.error : `채점 실패 (${q})`;
          throw new Error(msg);
        }
        next[q] = data as ScoreResponse;
      }

      setPerQuestion(next);

      // 가중 합산: 각 문항 (점수/만점) * weight% → 총 100점 환산
      let total100 = 0;
      for (const q of questionKeys) {
        const criterion = (u.criteria as Partial<Record<string, { desc: string; weight: number }>>)[q];
        const weightPct = Number(criterion?.weight ?? 0); // 20, 40 등
        const r = next[q];
        if (!r) continue;

        const denom = u.scale || 100;
        const ratio = denom > 0 ? r.score / denom : 0;
        total100 += ratio * weightPct;
      }
      total100 = Math.max(0, Math.min(100, Math.round(total100)));

      setSummary({ total100, grade: toGrade(total100) });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "전체 채점 중 오류가 발생했습니다.";
      alert(msg);
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
        const criterion = (u.criteria as Partial<Record<string, { desc: string; weight: number }>>)[문제];
        const desc = criterion?.desc ?? "";
        const weight = criterion?.weight ?? 0;
        const r = perQuestion[문제];

        return (
          <div key={문제} className="mb-6 border-b pb-4">
            <h2 className="font-semibold">
              {문제} ({weight}%)
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
