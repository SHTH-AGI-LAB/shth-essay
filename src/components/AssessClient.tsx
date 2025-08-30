"use client";

import { useState } from "react";

type Props = {
  slug: string;
  data?: {
    gradingScale: string[];
    criteria: Record<string, number>;
    scale?: number; // 가톨릭=100, 건국=1000, 경기=100
    problemWeights?: { "1": number; "2": number }; // 가톨릭=50/50, 건국=40/60, 경기=30/70
  };
};

const LABELS: Record<string, string> = {
  catholic: "가톨릭대",
  konkuk: "건국대",
  kyonggi: "경기대",
};

// 8등급 변환 (100점 기준)
function toGrade(total100: number) {
  if (total100 >= 95) return "A+";
  if (total100 >= 90) return "A";
  if (total100 >= 85) return "B+";
  if (total100 >= 80) return "B";
  if (total100 >= 75) return "C+";
  if (total100 >= 70) return "C";
  if (total100 >= 65) return "D+";
  if (total100 >= 60) return "D";
  return "D";
}

// 간이 평가기 (답안 → 항목별 0~100)
// - 가톨릭: 논제이해/구조와전개/논증과근거/표현/형식
// - 건국:   논제이해/분석/논증/창의성/표현
// - 경기:   논제 분석/비교대조/그래프/자료분석/논리력/표현·형식
function evaluateAnswer(answer: string, weights: Record<string, number>) {
  const text = (answer || "").trim();

  // 지표 추출
  const chars = text.length;
  const paras = text.split(/\n{2,}|\r\n{2,}/).filter(Boolean).length || (text ? 1 : 0);
  const sentences = text.split(/[.?!]\s+/).filter(s => s.trim().length > 0).length;
  const avgSentenceLen = sentences ? Math.round(chars / sentences) : 0;

  const transitions = ["첫째","둘째","셋째","요컨대","결론적으로","반면에","또한","따라서","그러므로","다만","즉","한편"];
  const transitionCount = transitions.reduce((acc, t) => acc + (text.includes(t) ? 1 : 0), 0);

  const compareMarkers = ["공통점","차이점","대조","비교","유사점","상이점"];
  const compareCount = compareMarkers.reduce((a, t) => a + (text.includes(t) ? 1 : 0), 0);

  const evidenceMarkers = ["예컨대","예시","근거","자료","통계","사례","인용","(",")"];
  const evidenceCount = evidenceMarkers.reduce((a, t) => a + (text.includes(t) ? 1 : 0), 0);

  const logicMarkers = ["왜냐하면","그러므로","따라서","가정하면","반례","모순","추론","귀납","연역"];
  const logicCount = logicMarkers.reduce((a, t) => a + (text.includes(t) ? 1 : 0), 0);

  const creativeMarkers = ["창의","새로운","대안","확장","통합","접목","모형","패러다임","반례","한계","재구성"];
  const creativityCount = creativeMarkers.reduce((a, t) => a + (text.includes(t) ? 1 : 0), 0);

  const dataMarkers = ["표","그래프","도표","자료","수치","통계","%","증가","감소"];
  const dataCount = dataMarkers.reduce((a, t) => a + (text.includes(t) ? 1 : 0), 0);

  // 항목별 점수(0~100)
  const perCriterion: Record<string, number> = {};

  // ── 공통: 논제 이해 / 또는 ‘논제 분석’
  if ("논제 이해" in weights) {
    perCriterion["논제 이해"] = Math.round(Math.min(
      100,
      (chars >= 600 ? 60 : (chars / 600) * 60) +
      Math.min(20, transitionCount * 6) +
      Math.min(20, compareCount * 10)
    ));
  }
  if ("논제 분석" in weights) {
    const scoreTopic = Math.min(
      100,
      (chars >= 600 ? 50 : (chars / 600) * 50) +  // 최소 분량
      Math.min(30, transitionCount * 12) +        // 구조 신호
      Math.min(20, compareCount * 10)             // 핵심 구분
    );
    perCriterion["논제 분석"] = Math.round(scoreTopic);
  }

  // ── 가톨릭 전용 축
  if ("구조와 전개" in weights) {
    perCriterion["구조와 전개"] = Math.round(Math.min(100,
      Math.min(40, paras * 12) + Math.min(60, transitionCount * 12)
    ));
  }
  if ("논증과 근거" in weights) {
    perCriterion["논증과 근거"] = Math.round(Math.min(100, Math.min(100, evidenceCount * 18)));
  }
  if ("표현" in weights) {
    let expr = 80;
    if (avgSentenceLen < 25) expr -= 10;
    if (avgSentenceLen > 120) expr -= 15;
    if (sentences < 5) expr -= 10;
    perCriterion["표현"] = Math.max(0, Math.min(100, Math.round(expr)));
  }
  if ("형식" in weights) {
    let form = 90;
    if (/[!?]{2,}|[~]{2,}/.test(text)) form -= 10;
    if (/[ㄱ-ㅎㅏ-ㅣ]/.test(text)) form -= 5;
    perCriterion["형식"] = Math.max(0, Math.min(100, Math.round(form)));
  }

  // ── 건국대 전용 축
  if ("분석" in weights) {
    const scoreAnalysis = Math.min(100,
      Math.min(40, compareCount * 15) +
      Math.min(40, evidenceCount * 15) +
      Math.min(20, logicCount * 10)
    );
    perCriterion["분석"] = Math.round(scoreAnalysis);
  }
  if ("논증" in weights) {
    const scoreReason = Math.min(100,
      Math.min(60, evidenceCount * 15) +
      Math.min(40, logicCount * 10)
    );
    perCriterion["논증"] = Math.round(scoreReason);
  }
  if ("창의성" in weights) {
    const scoreCreative = Math.min(100,
      50 + Math.min(30, creativityCount * 10) + Math.min(20, compareCount * 5)
    );
    perCriterion["창의성"] = Math.round(scoreCreative);
  }
  // 건국대 가벼운 보너스(사고 과정/창의 신호)
  if ("분석" in weights) perCriterion["분석"] = Math.min(100, (perCriterion["분석"] ?? 0) + Math.min(10, transitionCount * 2));
  if ("논증" in weights) perCriterion["논증"] = Math.min(100, (perCriterion["논증"] ?? 0) + Math.min(10, evidenceCount * 2));
  if ("창의성" in weights) perCriterion["창의성"] = Math.min(100, (perCriterion["창의성"] ?? 0) + Math.min(10, creativityCount * 2));

  // ── 경기대 전용 축
  if ("비교대조" in weights) {
    const scoreCompare = Math.min(100, Math.min(100, compareCount * 25));
    perCriterion["비교대조"] = Math.round(scoreCompare);
  }
  if ("그래프/자료분석" in weights) {
    const scoreData = Math.min(100,
      Math.min(60, dataCount * 18) +    // 표/그래프/통계/수치 언급
      Math.min(40, evidenceCount * 10)  // 자료를 근거로 쓰는지
    );
    perCriterion["그래프/자료분석"] = Math.round(scoreData);
  }
  if ("논리력" in weights) {
    const scoreLogic = Math.min(100,
      Math.min(60, logicCount * 12) +
      Math.min(40, transitionCount * 8)
    );
    perCriterion["논리력"] = Math.round(scoreLogic);
  }
  if ("표현/형식" in weights) {
    let form2 = 90;
    if (avgSentenceLen < 20) form2 -= 10;
    if (avgSentenceLen > 120) form2 -= 10;
    if (/[!?]{2,}|[~]{2,}/.test(text)) form2 -= 5;
    perCriterion["표현/형식"] = Math.max(0, Math.min(100, Math.round(form2)));
  }

  // 가중합(0~100)
  const total100 = Object.entries(weights).reduce((sum, [k, w]) => {
    const v = perCriterion[k] ?? 0;
    return sum + v * (w / 100);
  }, 0);

  // 첨삭 포인트/예시/총평
  const tips: string[] = [];
  const examples: string[] = [];
  if (compareCount === 0) {
    tips.push("비교·대조의 공통점/차이점을 명시적으로 구분하세요.");
    examples.push(`예: "공통점은 ○○, 차이점은 △△이다."`);
  }
  if (transitionCount < 2) {
    tips.push("첫째/둘째/결론적으로 등 전이표현으로 사고 과정을 드러내세요.");
    examples.push(`예: "첫째, … / 둘째, … / 결론적으로 …"`);
  }
  if (evidenceCount < 2) {
    tips.push("자료·사례·통계 등 근거를 2개 이상 제시하세요.");
    examples.push(`예: "예컨대 2024 통계청 자료에 따르면 …"`);
  }
  if (paras < 3) tips.push("서론-본론-결론의 3단 구성으로 문단을 분리하세요.");
  if (avgSentenceLen > 120) {
    tips.push("너무 긴 문장은 둘로 나눠 가독성을 높이세요.");
    examples.push(`예: "…한다. 또한 …한다."처럼 분할`);
  }

  const overall =
    `총평: ${compareCount > 0 ? "비교·대조의 방향은 보입니다" : "비교·대조가 충분히 드러나지 않습니다"}. ` +
    `${transitionCount >= 2 ? "전이표현 사용으로 구조가 비교적 안정적이며" : "전이표현이 부족해 전개가 평면적이며"} ` +
    `${evidenceCount >= 2 ? "근거 제시가 일정 수준 확보되었습니다" : "근거·예시가 부족해 설득력이 약합니다"}. ` +
    `해당 대학의 요구(정확 요약·충실 적용·사고 과정·자료 분석)를 강화하면 향상 여지가 큽니다.`;

  return {
    perCriterion,
    total100: Math.round(total100),
    tips,
    examples,
    overall,
  };
}

export default function AssessClient({ slug, data }: Props) {
  const weights = data?.criteria || { "논제 이해": 40, "구조와 전개": 25, "논증과 근거": 20, "표현": 10, "형식": 5 };
  const totalScale = data?.scale ?? 100;                         // 건국=1000, 그 외=100
  const pWeights = data?.problemWeights ?? { "1": 50, "2": 50 }; // 건국=40/60, 경기=30/70, 가톨릭=50/50
  const isKonkuk = slug === "konkuk";

  const [answer1, setAnswer1] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [result, setResult] = useState<null | {
    p1: ReturnType<typeof evaluateAnswer> & { grade100: string; scoreScaled: number };
    p2: ReturnType<typeof evaluateAnswer> & { grade100: string; scoreScaled: number };
    overall: { score100: number; scoreScaled: number; grade: string };
  }>(null);

  function onAssess() {
    const p1 = evaluateAnswer(answer1, weights);
    const p2 = evaluateAnswer(answer2, weights);

    // 문제 가중치 합산 (가톨릭 50/50, 건국 40/60, 경기 30/70)
    const overall100 = Math.round(
      p1.total100 * (pWeights["1"] / 100) + p2.total100 * (pWeights["2"] / 100)
    );

    const toScaled = (x: number) => Math.round((x / 100) * totalScale);

    setResult({
      p1: { ...p1, grade100: toGrade(p1.total100), scoreScaled: toScaled(p1.total100) },
      p2: { ...p2, grade100: toGrade(p2.total100), scoreScaled: toScaled(p2.total100) },
      overall: { score100: overall100, scoreScaled: toScaled(overall100), grade: toGrade(overall100) },
    });
  }

  return (
    <div style={{ padding: 20, maxWidth: 860, margin: "0 auto" }}>
      <h1 style={{ fontWeight: 700, marginBottom: 12 }}>
        {(LABELS[slug] ?? slug)} 채점 기준
        {totalScale !== 100 && <span style={{ fontSize: 14, color: "#777", marginLeft: 8 }}>({totalScale}점 만점)</span>}
      </h1>

      <ul style={{ marginBottom: 8 }}>
        {Object.entries(weights).map(([k, v]) => (
          <li key={k}>{k}: {v}%</li>
        ))}
      </ul>
      {(pWeights["1"] !== 50 || pWeights["2"] !== 50) && (
        <div style={{ marginBottom: 16, color: "#555" }}>
          문제 가중치 — ① {pWeights["1"]}% · ② {pWeights["2"]}%
        </div>
      )}

      <hr style={{ margin: "16px 0" }} />

      {/* 문제 1 */}
      <h2 style={{ margin: "12px 0 6px" }}>문제 1 답안</h2>
      <textarea
        className="no-print"
        value={answer1}
        onChange={(e) => setAnswer1(e.target.value)}
        placeholder="문제 1 답안을 입력하세요..."
        style={{ width: "100%", height: 140, marginBottom: 12 }}
      />

      {/* 문제 2 */}
      <h2 style={{ margin: "12px 0 6px" }}>문제 2 답안</h2>
      <textarea
        className="no-print"
        value={answer2}
        onChange={(e) => setAnswer2(e.target.value)}
        placeholder="문제 2 답안을 입력하세요..."
        style={{ width: "100%", height: 140, marginBottom: 12 }}
      />

      <div className="no-print" style={{ display: "flex", gap: 8 }}>
        <button onClick={onAssess} style={{ padding: "10px 18px", fontWeight: 600 }}>
          채점하기
        </button>
        <button onClick={() => window.print()} style={{ padding: "10px 18px" }}>
          인쇄 / PDF 저장
        </button>
      </div>

      {result && (
        <div style={{ marginTop: 18 }}>
          <h3>결과</h3>

          {/* 문제1 */}
          <div className="print-card" style={{ marginTop: 8, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
            <strong>문제 1</strong> —{" "}
            {totalScale === 100
              ? (<>{result.p1.total100}점 → <strong>{result.p1.grade100}</strong></>)
              : (<><strong>{result.p1.scoreScaled}</strong>/{totalScale}</>)
            }
            <ul style={{ marginTop: 8 }}>
              {Object.entries(result.p1.perCriterion).map(([k, v]) => (
                <li key={k}>{k}: {v}점</li>
              ))}
            </ul>
            {result.p1.tips.length > 0 && (
              <>
                <div style={{ marginTop: 8, fontWeight: 600 }}>첨삭 포인트</div>
                <ul>{result.p1.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
              </>
            )}
            {result.p1.examples.length > 0 && (
              <>
                <div style={{ marginTop: 6, fontWeight: 600 }}>첨삭 예시</div>
                <ul>{result.p1.examples.map((ex, i) => <li key={i}>{ex}</li>)}</ul>
              </>
            )}
            <div style={{ marginTop: 6 }}>{result.p1.overall}</div>
          </div>

          {/* 문제2 */}
          <div className="print-card" style={{ marginTop: 12, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
            <strong>문제 2</strong> —{" "}
            {totalScale === 100
              ? (<>{result.p2.total100}점 → <strong>{result.p2.grade100}</strong></>)
              : (<><strong>{result.p2.scoreScaled}</strong>/{totalScale}</>)
            }
            <ul style={{ marginTop: 8 }}>
              {Object.entries(result.p2.perCriterion).map(([k, v]) => (
                <li key={k}>{k}: {v}점</li>
              ))}
            </ul>
            {result.p2.tips.length > 0 && (
              <>
                <div style={{ marginTop: 8, fontWeight: 600 }}>첨삭 포인트</div>
                <ul>{result.p2.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
              </>
            )}
            {result.p2.examples.length > 0 && (
              <>
                <div style={{ marginTop: 6, fontWeight: 600 }}>첨삭 예시</div>
                <ul>{result.p2.examples.map((ex, i) => <li key={i}>{ex}</li>)}</ul>
              </>
            )}
            <div style={{ marginTop: 6 }}>{result.p2.overall}</div>
          </div>

          {/* 종합 */}
          <div className="print-card" style={{ marginTop: 14, padding: 12, background: "#fafafa", borderRadius: 8 }}>
            <strong>종합</strong> —{" "}
            {totalScale === 100
              ? (<>{result.overall.score100}점 → <strong>{result.overall.grade}</strong></>)
              : (<><strong>{result.overall.scoreScaled}</strong>/{totalScale}</>)
            }
            <div style={{ marginTop: 6 }}>
              {totalScale === 100
                ? `해설: 문제 가중치(① ${pWeights["1"]}% · ② ${pWeights["2"]}%)를 적용하여 산출되었습니다.`
                : `해설: 문제 가중치(① ${pWeights["1"]}% · ② ${pWeights["2"]}%)를 적용하여 ${totalScale}점 만점으로 환산했습니다.`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
