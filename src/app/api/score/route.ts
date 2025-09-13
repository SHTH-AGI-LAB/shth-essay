import { NextRequest, NextResponse } from "next/server";
import { UNIVERSITIES as UNIVERSITIES_RAW } from "../../../data/universities";
import crypto from "crypto";

/** ===== 설정값 ===== */
const API_VERSION = "score-api v3";          // 배포 확인용 태그
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

/** 무료 체험 제한 */
const COOKIE_NAME = "ar_usage_v1";           // 쿠키 키
const FREE_TRIAL_LIMIT = 3;                  // 무료 허용 횟수
const TRIAL_WINDOW_DAYS = 30;                // 윈도우(일)
const PAYWALL_SECRET = process.env.PAYWALL_SECRET ?? ""; // HMAC 비밀(반드시 .env에 설정 권장)

/** ===== 타입 ===== */
type Criterion = { desc: string; weight: number };
type UniversityEntry = {
  name: string;
  slug: string;
  scale: number;          // 100 / 1000 등
  gradingType: string;    // "100점제" / "1000점제"
  criteria: Partial<Record<string, Criterion>>;
  bonus?: string;
};

type Edit = { original: string; revision: string };
type OpenAIChoice = { message?: { content?: string } };
type OpenAIResponse = { choices?: OpenAIChoice[] };

const UNIVERSITIES = UNIVERSITIES_RAW as unknown as UniversityEntry[];

/** ===== 유틸: criteria 접근 ===== */
function getCriterion(u: UniversityEntry, key: string): Criterion | undefined {
  const map = u.criteria as Record<string, Criterion | undefined>;
  return map[key];
}

function findUniversity(slugOrName: string): UniversityEntry | null {
  const key = String(slugOrName).trim();
  for (const u of UNIVERSITIES) {
    if (u.slug === key || u.name === key) return u;
  }
  return null;
}

/** "문제1" / "1" / "q1" → 실제 키("문제1") */
function normalizeQuestionKey(
  u: UniversityEntry,
  questionId: string
): string | null {
  const raw = String(questionId).trim();

  if (getCriterion(u, raw)) return raw;

  const m = raw.match(/^q?(\d+)$/i);
  if (m) {
    const guess = `문제${Number(m[1])}`;
    if (getCriterion(u, guess)) return guess;
  }
  return null;
}

function formatWeight(weight?: number) {
  if (typeof weight !== "number") return "—";
  return `${weight}%`;
}

/** ===== 프롬프트 생성(5문장 첨삭 강제) ===== */
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
    "점수와 평가 근거를 제시하세요.",
    "첨삭 문장은 반드시 5개 이상 제시하며, 고급 어휘력과 논리적 연결어를 활용해 원문보다 학술적으로 세련되게 수정하세요.",
    "총평(Overall)은 3~4문장으로 작성하고, 마지막에는 학생이 바로 적용할 수 있는 글쓰기 전략 1가지를 제안하세요.",
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
        { "original": string, "revision": string },
        { "original": string, "revision": string },
        { "original": string, "revision": string },
        { "original": string, "revision": string },
        { "original": string, "revision": string }
      ]
    }`,
    "규칙:",
    "- JSON만 출력.",
    "- edits 배열은 반드시 5개 이상 포함.",
    "- revision은 고급 어휘와 학술적 표현을 사용.",
  ];
  return lines.filter(Boolean).join("\n\n");
}

/** ===== 서명 쿠키 유틸 ===== */
type UsagePayload = { c: number; exp: number }; // count, expiry(unixtime ms)

function b64u(str: string) {
  return Buffer.from(str).toString("base64url");
}
function ub64u(str: string) {
  return Buffer.from(str, "base64url").toString("utf8");
}
function sign(input: string) {
  if (!PAYWALL_SECRET) return ""; // 서명 비활성(개발용)
  return crypto.createHmac("sha256", PAYWALL_SECRET).update(input).digest("base64url");
}

function encodeUsage(u: UsagePayload): string {
  const payload = JSON.stringify(u);
  const p = b64u(payload);
  const s = sign(p);
  return s ? `${p}.${s}` : p; // 서명 없으면 payload만 (개발용)
}

function decodeUsage(v: string | undefined | null): UsagePayload | null {
  if (!v) return null;
  const [p, s] = v.split(".");
  try {
    if (PAYWALL_SECRET) {
      const expected = sign(p);
      if (s !== expected) return null; // 위조
    }
    const obj = JSON.parse(ub64u(p)) as UsagePayload;
    if (typeof obj.c !== "number" || typeof obj.exp !== "number") return null;
    return obj;
  } catch {
    return null;
  }
}

function now() {
  return Date.now();
}
function daysFromNow(n: number) {
  return now() + n * 24 * 60 * 60 * 1000;
}

/** 요청별 사용량 읽기 */
function readUsage(req: NextRequest): UsagePayload {
  const v = req.cookies.get(COOKIE_NAME)?.value;
  const decoded = decodeUsage(v);
  const fresh: UsagePayload =
    decoded && decoded.exp > now()
      ? decoded
      : { c: 0, exp: daysFromNow(TRIAL_WINDOW_DAYS) };
  return fresh;
}

/** 응답에 사용량 기록 쿠키 세팅 */
function withUsageCookie(res: NextResponse, usage: UsagePayload) {
  const value = encodeUsage(usage);
  res.cookies.set({
    name: COOKIE_NAME,
    value,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: true,
    expires: new Date(usage.exp),
  });
  return res;
}

/** ===== API 핸들러 ===== */
export async function POST(req: NextRequest) {
  try {
    // 1) 사용량 확인 (쿠키 기반)
    const usage = readUsage(req);
    if (usage.c >= FREE_TRIAL_LIMIT) {
      const res = NextResponse.json(
        {
          error: "PAYWALL_REQUIRED",
          message: `무료 체험 ${FREE_TRIAL_LIMIT}회를 모두 사용하였습니다.`,
          remaining: 0,
          apiVersion: API_VERSION,
        },
        { status: 402 } // Payment Required
      );
      return withUsageCookie(res, usage);
    }

    // 2) 바디 파싱
    const body = await req.json().catch(() => ({}));
    const {
      university: uniInput,
      questionId,
      answer,
      questionText,
    }: {
      university?: string;
      questionId?: string;
      answer?: string;
      questionText?: string;
    } = body ?? {};

    if (!uniInput || !questionId || !answer) {
      const res = NextResponse.json(
        { error: "Missing required fields: university, questionId, answer" },
        { status: 400 }
      );
      return withUsageCookie(res, usage);
    }

    // 3) 대학/문항 유효성
    const uni = findUniversity(uniInput);
    if (!uni) {
      const res = NextResponse.json(
        { error: `Unknown university: ${uniInput}` },
        { status: 404 }
      );
      return withUsageCookie(res, usage);
    }

    const qKey = normalizeQuestionKey(uni, questionId);
    if (!qKey) {
      const res = NextResponse.json(
        { error: `Unknown questionId for ${uni.name}: ${questionId}` },
        { status: 404 }
      );
      return withUsageCookie(res, usage);
    }

    const criterion = getCriterion(uni, qKey);
    if (!criterion) {
      const res = NextResponse.json(
        { error: `No criterion defined for ${uni.name} / ${qKey}` },
        { status: 404 }
      );
      return withUsageCookie(res, usage);
    }

    // 4) 프롬프트 생성
    const prompt = buildPrompt({
      university: uni,
      questionKey: qKey,
      criterion,
      answer,
      questionText,
    });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      const res = NextResponse.json(
        { error: "Missing OPENAI_API_KEY environment variable" },
        { status: 500 }
      );
      return withUsageCookie(res, usage);
    }

    // 5) OpenAI 호출
    const resAI = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
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

    if (!resAI.ok) {
      const text = await resAI.text();
      const res = NextResponse.json(
        { error: `OpenAI error: ${resAI.status} ${text}` },
        { status: 502 }
      );
      return withUsageCookie(res, usage);
    }

    const data = (await resAI.json()) as OpenAIResponse;
    const content = data?.choices?.[0]?.message?.content;

    // 6) 안전 파싱
    let parsed: Record<string, unknown> = {};
    try {
      parsed =
        typeof content === "string"
          ? (JSON.parse(content) as Record<string, unknown>)
          : ((content ?? {}) as unknown as Record<string, unknown>);
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

    // 7) 정규화
    const total = uni.scale ?? 100;
    const scoreRaw = Number(parsed.score ?? 0);
    const score = Number.isFinite(scoreRaw) ? Math.max(0, Math.min(total, scoreRaw)) : 0;
    const bonus = Number(parsed.bonus ?? 0) || 0;

    const rationaleArr =
      Array.isArray(parsed.rationale)
        ? (parsed.rationale as unknown[]).map((x) => String(x))
        : parsed.rationale != null
        ? [String(parsed.rationale)]
        : [];

    const evidenceArr =
      Array.isArray(parsed.evidence)
        ? (parsed.evidence as unknown[]).map((x) => String(x))
        : [];

    const overall = typeof parsed.overall === "string" ? parsed.overall : "";

    let edits: Edit[] = Array.isArray(parsed.edits)
      ? (parsed.edits as unknown[]).map((e) => ({
          original: String((e as { original?: unknown }).original ?? ""),
          revision: String((e as { revision?: unknown }).revision ?? ""),
        })).filter((e) => e.original && e.revision)
      : [];

    if (edits.length < 1) {
      const firstSentence =
        String(answer).split(/[.!?。\n]/)[0]?.trim().slice(0, 120) || "원문 예시";
      edits = [
        {
          original: firstSentence,
          revision:
            `${firstSentence} — 핵심 논지와 비교근거(자료·통계·사례)를 한 문장으로 명확히 덧붙여 논리적 인과를 드러냅니다.`,
        },
      ];
    }

    // 8) 사용량 1 증가 + 쿠키 저장
    const nextUsage: UsagePayload = { c: usage.c + 1, exp: usage.exp };
    const out = {
      apiVersion: API_VERSION,
      university: uni.slug,
      questionId: qKey,
      score,
      bonus,
      rationale: rationaleArr,
      evidence: evidenceArr,
      overall,
      edits,
      model: OPENAI_MODEL,
      remaining: Math.max(0, FREE_TRIAL_LIMIT - nextUsage.c),
    };

    const res = NextResponse.json(out, { status: 200 });
    return withUsageCookie(res, nextUsage);

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const res = NextResponse.json(
      { error: `Scoring failed: ${message}`, apiVersion: API_VERSION },
      { status: 500 }
    );
    return res;
  }
}

export const dynamic = "force-dynamic";