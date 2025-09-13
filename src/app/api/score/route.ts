import { NextRequest, NextResponse } from "next/server";
import { UNIVERSITIES } from "../../../data/universities"; 

/** 데이터 타입 */
type Criterion = { desc: string; weight: number };
export type UniversityEntry = {
  name: string;
  slug: string;
  scale: number;
  gradingType: string;
  criteria: Partial<Record<string, Criterion>>;
  bonus?: string;
};

/** 안전한 criteria 접근 헬퍼 */
function getCriterion(u: UniversityEntry, key: string): Criterion | undefined {
  const map = u.criteria as Record<string, Criterion | undefined>;
  return map[key];
}

/** 배열에서 대학 찾기 (slug 또는 name 모두 허용) */
function findUniversity(slugOrName: string): UniversityEntry | null {
  const key = String(slugOrName).trim();
  return (
    UNIVERSITIES.find((u: UniversityEntry) => u.slug === key) ??
    UNIVERSITIES.find((u: UniversityEntry) => u.name === key) ??
    null
  );
}

/** "문제1" / "1" / "q1" 등 → 실제 키("문제1")로 정규화 */
function normalizeQuestionKey(
  u: UniversityEntry,
  questionId: string
): string | null {
  const raw = String(questionId).trim();

  // 1) 정확히 있는 키면 그대로
  if (getCriterion(u, raw)) return raw;

  // 2) 숫자 또는 q접두어 → "문제{n}"
  const m = raw.match(/^q?(\d+)$/i);
  if (m) {
    const guess = `문제${Number(m[1])}`;
    if (getCriterion(u, guess)) return guess;
  }
  return null;
}

/** weight(20,40) → 퍼센트 그대로 사용. 만점 scale과 별개 */
function formatWeight(weight?: number) {
  if (typeof weight !== "number") return "—";
  return `${weight}%`;
}

/** 프롬프트 생성 */
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
    "수험생의 답안을 평가하고, 점수/근거와 함께, 구체적인 문장 수정 예시를 '원문 → 수정문' 형식으로 반드시 1개 이상 제시하세요.",
    "총평(Overall)은 2~3문장으로 간결하게 작성하세요.",
    `대학: ${university.name} (slug: ${university.slug})`,
    `평가 체계: ${university.gradingType} (만점 ${university.scale})`,
    `문항: ${questionKey}`,
    `문항 배점 비율: ${formatWeight(criterion.weight)}`,
    `문항 평가 포인트: ${criterion.desc}`,
    university.bonus ? `보너스 고려 사항(참고): ${university.bonus}` : "",
    questionText ? `문제 지문:\n${questionText}` : "",
    `---- 수험생 답안 ----\n${answer}\n---------------------`,
    `출력 형식(JSON): {
      "score": number(0~${university.scale}),
      "bonus": number,
      "rationale": string[],
      "evidence": string[],
      "overall": string,
      "edits": [
        { "original": string, "revision": string }
      ]
    }`,
    `규칙:
- 반드시 JSON만 출력.
- edits 배열은 문항당 최소 1개 포함.
- original: 학생 원문 일부, revision: 개선된 문장.`,
  ];
  return lines.filter(Boolean).join("\n\n");
}

/** 🔐 OpenAI 설정 */
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

/** OpenAI 응답 타입(필요한 필드만) */
type OpenAIChoice = { message?: { content?: string } };
type OpenAIResponse = { choices?: OpenAIChoice[] };

/** 모델이 약속한 출력 형태(선언적) */
type ParsedDraft = {
  score?: unknown;
  bonus?: unknown;
  rationale?: unknown;
  evidence?: unknown;
  overall?: unknown;
  edits?: unknown;
};

type Edit = { original: string; revision: string };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      university: uniInput,
      questionId,
      answer,
      questionText,
    }: { university?: string; questionId?: string; answer?: string; questionText?: string } = body ?? {};

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

    const criterion = getCriterion(uni, qKey);
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
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a strict but fair Korean university essay grader.",
          },
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

    const data = (await res.json()) as OpenAIResponse;
    const content =
      data?.choices?.[0]?.message?.content ??
      (data?.choices?.[0]?.message as unknown as string | undefined);

    // 안전 파싱
    let parsed: ParsedDraft = {};
    try {
      parsed =
        typeof content === "string"
          ? (JSON.parse(content) as ParsedDraft)
          : ((content ?? {}) as unknown as ParsedDraft);
    } catch {
      parsed = {
        score: 0,
        bonus: 0,
        rationale: [String(content ?? "")],
        evidence: [],
        overall: "",
        edits: [],
      };
    }

    // 정규화
    const total = uni.scale ?? 100;

    const scoreRaw = Number(parsed.score ?? 0);
    const score = Number.isFinite(scoreRaw)
      ? Math.max(0, Math.min(total, scoreRaw))
      : 0;

    const bonus = Number(parsed.bonus ?? 0) || 0;

    const rationale = Array.isArray(parsed.rationale)
      ? (parsed.rationale as unknown[]).map((x) => String(x))
      : parsed.rationale != null
      ? [String(parsed.rationale)]
      : [];

    const evidence = Array.isArray(parsed.evidence)
      ? (parsed.evidence as unknown[]).map((x) => String(x))
      : [];

    const overall =
      typeof parsed.overall === "string" ? parsed.overall : "";

    // edits: 최소 1개 보장 로직
    let edits: Edit[] = Array.isArray(parsed.edits)
      ? (parsed.edits as unknown[]).map((e) => ({
          original: String((e as { original?: unknown }).original ?? ""),
          revision: String((e as { revision?: unknown }).revision ?? ""),
        })).filter((e) => e.original && e.revision)
      : [];

    if (edits.length < 1) {
      // 백업용 더미(혹시 모델이 미이행 시 대비)
      edits = [{ original: "원문 예시", revision: "수정 예시" }];
    }

    const out = {
      university: uni.slug,
      questionId: qKey,
      score,
      bonus,
      rationale,
      evidence,
      overall,
      edits,
      model: OPENAI_MODEL,
    };

    return NextResponse.json(out, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Scoring failed: ${message}` },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic"; 