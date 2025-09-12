import { NextRequest, NextResponse } from "next/server";

// 🔹 data/universities.ts : named export + 배열
import { UNIVERSITIES } from "../../../data/universities";

/** 데이터 타입 (네 스키마에 맞춤) */
type Criterion = { desc: string; weight: number }; // weight: 20 | 40 | 60 같은 '퍼센트 값'
type UniversityEntry = {
  name: string;                 // "가톨릭대"
  slug: string;                 // "catholic"
  scale: number;                // 만점 (100, 1000 등)
  gradingType: string;          // "100점제", "1000점제"
  // 대학마다 "문제3"이 없을 수 있으므로 부분 맵으로 선언
  criteria: Partial<Record<string, Criterion>>; // { "문제1": {desc, weight}, ... }
  bonus?: string;               // 보너스 설명(문장)
};

/** 배열에서 대학 찾기 (slug 또는 name 모두 허용) */
function findUniversity(slugOrName: string): UniversityEntry | null {
  const key = String(slugOrName).trim();
  return UNIVERSITIES.find(u => u.slug === key)
      ?? UNIVERSITIES.find(u => u.name === key)
      ?? null;
}

/** "문제1" / "1" / "q1" 등 → 실제 키("문제1")로 정규화 */
function normalizeQuestionKey(u: UniversityEntry, questionId: string): string | null {
  const raw = String(questionId).trim();

  // 1) 정확히 있는 키면 그대로
  if (u.criteria[raw]) return raw;

  // 2) 숫자만 전달되거나 q 접두어가 올 수 있음 → "문제{n}"로 변환
  const m = raw.match(/^q?(\d+)$/i);
  if (m) {
    const guess = `문제${Number(m[1])}`;
    if (u.criteria[guess]) return guess;
  }
  return null;
}

/** weight(20,40) → 퍼센트 그대로 사용. 만점 scale과 별개로 '문항 가중치'의 비율 정보를 제공 */
function formatWeight(weight?: number) {
  if (typeof weight !== "number") return "—";
  return `${weight}%`;
}

/** 프롬프트 생성 (네 스키마에 맞춰 구성) */
function buildPrompt(params: {
  university: UniversityEntry;
  questionKey: string;
  criterion: Criterion;
  answer: string;
  questionText?: string;
}) {
  const { university, questionKey, criterion, answer, questionText } = params;

  const lines: string[] = [
    "당신은 한국 대학 논술 첨삭 전문가입니다.",
    `대학: ${university.name} (slug: ${university.slug})`,
    `평가 체계: ${university.gradingType} (만점 ${university.scale})`,
    `문항: ${questionKey}`,
    `문항 배점 비율: ${formatWeight(criterion.weight)}`,
    `문항 평가 포인트: ${criterion.desc}`,
    university.bonus ? `보너스 고려 사항(참고): ${university.bonus}` : "",
    questionText ? `문제 지문:\n${questionText}` : "",
    `---- 수험생 답안 ----\n${answer}\n---------------------`,
    // 출력 포맷 강제(모델 안정성↑)
    `출력 형식(JSON): {"score": number(0~${university.scale}), "bonus": number, "rationale": string[], "evidence": string[]}`,
    `주의: 반드시 JSON만 출력하세요. 불필요한 설명 금지.`,
  ];
  return lines.filter(Boolean).join("\n\n");
}

/** 🔐 OpenAI 설정 */
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      university: uniInput,     // "catholic" 또는 "가톨릭대"
      questionId,               // "문제1" | "1" | "q1"
      answer,                   // 수험생 답안
      questionText,             // (선택) 문제 지문
    } = body ?? {};

    if (!uniInput || !questionId || !answer) {
      return NextResponse.json(
        { error: "Missing required fields: university, questionId, answer" },
        { status: 400 }
      );
    }

    const uni = findUniversity(uniInput);
    if (!uni) {
      return NextResponse.json(
        { error: `Unknown university: ${uniInput}` },
        { status: 404 }
      );
    }

    const qKey = normalizeQuestionKey(uni, questionId);
    if (!qKey) {
      return NextResponse.json(
        { error: `Unknown questionId for ${uni.name}: ${questionId}` },
        { status: 404 }
      );
    }

    const criterion = uni.criteria[qKey];
    if (!criterion) {
      return NextResponse.json(
        { error: `No criterion defined for ${uni.name} / ${qKey}` },
        { status: 404 }
      );
    }

    const prompt = buildPrompt({
      university: uni,
      questionKey: qKey,
      criterion,
      answer,
      questionText,
    });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY environment variable" },
        { status: 500 }
      );
    }

    // 🧠 OpenAI 호출
    const res = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: "You are a strict but fair Korean university essay grader." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `OpenAI error: ${res.status} ${text}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const content =
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.message;

    let parsed: any = {};
    try {
      parsed = typeof content === "string" ? JSON.parse(content) : content;
    } catch {
      parsed = { score: 0, bonus: 0, rationale: [String(content ?? "")], evidence: [] };
    }

    // 점수 보정(안전)
    const total = uni.scale ?? 100;
    let score = Number(parsed.score ?? 0);
    if (Number.isNaN(score)) score = 0;
    score = Math.max(0, Math.min(total, score));

    const out = {
      university: uni.slug,
      questionId: qKey,
      score,
      bonus: Number(parsed.bonus ?? 0) || 0,
      rationale: Array.isArray(parsed.rationale) ? parsed.rationale : [String(parsed.rationale ?? "")],
      evidence: Array.isArray(parsed.evidence) ? parsed.evidence : [],
      model: OPENAI_MODEL,
    };

    return NextResponse.json(out, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Scoring failed: ${err?.message ?? String(err)}` },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
