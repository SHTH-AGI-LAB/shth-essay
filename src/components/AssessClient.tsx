// src/components/AssessClient.tsx
"use client";

import { useMemo, useState } from "react";
import { UNIVERSITIES } from "@/data/universities";

type University = (typeof UNIVERSITIES)[number];
type Criterion = { desc: string; weight: number };
type Props = { slug: string };

 type ScoreResponse = {
  apiVersion?: string;
  university: string;
  questionId: string;
  score: number;
  bonus: number;
  rationale: string[];
  evidence: string[];
  overall?: string;
  edits?: { original: string; revision: string }[];
  model?: string;
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
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

 function weightedMax(u: University, weightPct: number) {
  const max = u.scale || 100;
  return Math.round(max * (weightPct / 100));
}
function weightedScore(u: University, weightPct: number, absoluteScore: number) {
  const max = u.scale || 100;
  const ratio = max > 0 ? absoluteScore / max : 0;
  return Math.round(ratio * (max * (weightPct / 100)));
}

export default function AssessClient({ slug }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [perQuestion, setPerQuestion] = useState<Record<string, ScoreResponse>>({});
  const [summary, setSummary] = useState<{ total100: number; grade: string } | null>(null);

  const uni = useMemo<University | undefined>(() => UNIVERSITIES.find((u) => u.slug === slug), [slug]);
  const questionKeys = useMemo<string[]>(() => (uni ? Object.keys(uni.criteria ?? {}) : []), [uni]);

  if (!uni) return <p className="p-4 text-red-500">대학 정보가 없습니다.</p>;
  const u = uni as University;

  /** 한 문항 채점 */
  async function scoreOne(questionKey: string, a: string): Promise<ScoreResponse | null> {
    const res = await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ university: slug, questionId: questionKey, answer: a }),
    });
    const raw = await res.json();
    if (!res.ok) throw new Error(typeof raw?.error === "string" ? raw.error : "채점 실패");
    return raw as ScoreResponse;
  }

  /** 입력된 문항만 순차 채점(버튼 1개) */
  async function scoreAll(): Promise<void> {
    if (loading) return;
    setLoading(true);
    setSummary(null);
    try {
      const next: Record<string, ScoreResponse> = { ...perQuestion };
      const filled = questionKeys.filter((q) => (answers[q] ?? "").trim().length > 0);
      if (filled.length === 0) {
        alert("답안을 입력한 문항이 없습니다.");
        return;
      }

      for (const q of filled) {
        try {
          const a = (answers[q] ?? "").trim();
          const r = await scoreOne(q, a);
          if (r) next[q] = r;
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          if (/429|rate/i.test(msg)) {
            alert("요청이 너무 빨라 잠시 대기합니다… 다시 시도할게요.");
          } else {
            alert(`채점 실패 (${q}): ${msg}`);
          }
        }
        await sleep(900); // ← 429 방지: 문항 사이 딜레이
      }

      setPerQuestion(next);

      // 가중 합산
      let total100 = 0;
      for (const q of questionKeys) {
        const criterion = (u.criteria as Partial<Record<string, Criterion>>)[q];
        const weightPct = Number(criterion?.weight ?? 0);
        const r = next[q];
        if (!r) continue;
        const denom = u.scale || 100;
        const ratio = denom > 0 ? r.score / denom : 0;
        total100 += ratio * weightPct;
      }
      total100 = Math.max(0, Math.min(100, Math.round(total100)));
      setSummary({ total100, grade: toGrade(total100) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">{u.name} ({u.gradingType})</h1>
      <p className="text-gray-700 mb-4">만점: {u.scale}점</p>

      {questionKeys.map((문제) => {
        const criterion = (u.criteria as Partial<Record<string, Criterion>>)[문제];
        const desc = criterion?.desc ?? "";
        const weight = Number(criterion?.weight ?? 0);
        const r = perQuestion[문제];
        const maxW = weightedMax(u, weight);
        const weighted = r ? weightedScore(u, weight, r.score) : 0;

        return (
          <div key={문제} className="mb-6 border-b pb-4">
            <h2 className="font-semibold">{문제} ({weight}%)</h2>
            <p className="text-sm text-gray-600 mb-2">{desc}</p>
            <textarea
              value={answers[문제] || ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [문제]: e.target.value }))}
              placeholder={`${문제} 답안을 입력하세요...`}
              className="w-full border p-2 rounded"
              rows={5}
            />

            {r && (
              <div className="mt-2 text-sm text-gray-700">
                → 점수 {weighted} / {maxW}
                {r.apiVersion ? <span className="ml-2 text-gray-400">[{r.apiVersion}]</span> : null}
              </div>
            )}

            {r?.rationale?.length ? (
              <div className="mt-3 bg-gray-50 border rounded p-3">
                <h3 className="font-semibold mb-1">첨삭 코멘트</h3>
                {r.rationale.map((c, i) => (
                  <p key={i} className="text-sm">- {c}</p>
                ))}

                {r.overall ? (
                  <div className="mt-3">
                    <h4 className="font-semibold">총평</h4>
                    <p className="text-sm whitespace-pre-wrap">{r.overall}</p>
                  </div>
                ) : null}

                {Array.isArray(r.edits) && r.edits.length > 0 ? (
                  <div className="mt-3">
                    <h4 className="font-semibold">문장 수정 예시</h4>
                    <ul className="text-sm list-disc pl-5 space-y-1">
                      {r.edits.map((e, i) => (
                        <li key={i}>
                          <span className="font-medium">원문:</span> {e.original}
                          <br />
                          <span className="font-medium">수정:</span> {e.revision}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}

      <div className="mt-4 no-print">
        <button
          onClick={scoreAll}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "AI 채점 중…" : "AI 채점"}
        </button>
        <button
          onClick={() => window.print()}
          className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          인쇄 / PDF 저장
        </button>
      </div>

      {summary && (
        <div className="mt-6 border-t pt-4">
          <h2 className="font-bold mb-2">📊 종합 결과</h2>
          <p><strong>총점(100 환산):</strong> {summary.total100}점 → {summary.grade}</p>
          {u.bonus && <p className="mt-2 text-sm text-gray-700">{u.bonus}</p>}
        </div>
      )}
    </div>
  );
}