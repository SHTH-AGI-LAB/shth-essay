// src/app/api/score/route.ts
import { NextRequest, NextResponse } from "next/server";
import { UNIVERSITIES as UNIVERSITIES_RAW } from "../../../data/universities";
import { supabaseAdmin } from "../../../lib/supabaseServer";

/** ===== 설정 ===== */
const API_VERSION = "score-api v4-db";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
const FREE_TRIAL_LIMIT = Number(process.env.FREE_TRIAL_LIMIT ?? "3") || 3; // 환경변수 or 기본값 3
const TRIAL_WINDOW_DAYS = 30;

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

/** ===== 유틸 ===== */
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

function normalizeQuestionKey(u: UniversityEntry, questionId: string): string | null {
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

/** ===== 프롬프트 (첨삭 5문장 강제) ===== */
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

/** ===== DB 로직: 사용자 사용량 ===== */
type UsageRow = {
  email: string;
  usage_count: number;
  plan_type: "free" | "paid";
  window_end: string | null; // ISO
};

function now() { return Date.now(); }
function daysFromNow(n: number) { return now() + n * 24 * 60 * 60 * 1000; }

async function getOrInitUsage(email: string): Promise<UsageRow> {
  const { data: row, error } = await supabaseAdmin
    .from("user_usage")
    .select("email, usage_count, plan_type, window_end")
    .eq("email", email)
    .maybeSingle();

  if (error) throw new Error(`DB read error: ${error.message}`);

  if (!row) {
    const newRow: UsageRow = {
      email,
      usage_count: 0,
      plan_type: "free",
      window_end: new Date(daysFromNow(TRIAL_WINDOW_DAYS)).toISOString(),
    };
    const { error: upErr } = await supabaseAdmin
      .from("user_usage")
      .upsert(newRow, { onConflict: "email" });
    if (upErr) throw new Error(`DB init error: ${upErr.message}`);
    return newRow;
  }

  if (row.plan_type === "free") {
    const expired =
      !row.window_end || new Date(row.window_end).getTime() <= now();
    if (expired) {
      const resetRow: UsageRow = {
        email: row.email,
        usage_count: 0,
        plan_type: "free",
        window_end: new Date(daysFromNow(TRIAL_WINDOW_DAYS)).toISOString(),
      };
      const { error: rstErr } = await supabaseAdmin
        .from("user_usage")
        .upsert(resetRow, { onConflict: "email" });
      if (rstErr) throw new Error(`DB reset window error: ${rstErr.message}`);
      return resetRow;
    }
  }

  return row as UsageRow;
}

async function incrementUsage(email: string): Promise<UsageRow | null> {
  const { data: current, error: readErr } = await supabaseAdmin
    .from("user_usage")
    .select("email, usage_count, plan_type, window_end")
    .eq("email", email)
    .maybeSingle();

  if (readErr || !current) {
    console.error("읽기 오류:", readErr);
    return null;
  }

  const { data: updated, error: updateErr } = await supabaseAdmin
    .from("user_usage")
    .update({
      usage_count: (current.usage_count ?? 0) + 1,
    })
    .eq("email", email)
    .select("email, usage_count, plan_type, window_end")
    .maybeSingle();

  if (updateErr) {
    console.error("업데이트 오류:", updateErr);
    return null;
  }

  return updated as UsageRow;
}

/** ===== API 핸들러 ===== */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      university: uniInput,
      questionId,
      answer,
      questionText,
      userEmail,
    }: {
      university?: string;
      questionId?: string;
      answer?: string;
      questionText?: string;
      userEmail?: string;
    } = body ?? {};

    if (!uniInput || !questionId || !answer || !userEmail) {
      return NextResponse.json(
        { error: "Missing required fields: university, questionId, answer, userEmail" },
        { status: 400 }
      );
    }

    const usage = await getOrInitUsage(userEmail);

    if (usage.plan_type !== "paid" && usage.usage_count >= FREE_TRIAL_LIMIT) {
      return NextResponse.json(
        {
          error: "PAYWALL_REQUIRED",
          message: `무료 체험 ${FREE_TRIAL_LIMIT}회를 모두 사용하였습니다.`,
          usageCount: usage.usage_count,
          remaining: 0,
          planType: usage.plan_type,
          },
        { status: 402 }
      );
    }

    const uni = findUniversity(uniInput);
    if (!uni) {
      return NextResponse.json({ error: `Unknown university: ${uniInput}` }, { status: 404 });
    }

    const qKey = normalizeQuestionKey(uni, questionId!);
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
      answer: answer!,
      questionText,
    });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

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
      return NextResponse.json({ error: `OpenAI error: ${resAI.status} ${text}` }, { status: 502 });
    }

    const data = (await resAI.json()) as OpenAIResponse;
    const content = data?.choices?.[0]?.message?.content;

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
      const firstSentence = String(answer).split(/[.!?。\n]/)[0]?.trim().slice(0, 120) || "원문 예시";
      edits = [
        {
          original: firstSentence,
          revision: `${firstSentence} — 핵심 논지와 비교근거(자료·통계·사례)를 한 문장으로 명확히 덧붙여 논리적 인과를 드러냅니다.`,
        },
      ];
    }

    let updatedUsage = usage;
    if (usage.plan_type === "free") {
      updatedUsage = (await incrementUsage(usage.email)) ?? usage;
    }

    const remaining =
      updatedUsage.plan_type === "paid"
        ? null
        : Math.max(0, FREE_TRIAL_LIMIT - updatedUsage.usage_count);

    return NextResponse.json(
      { 
        university: uni.slug,
        questionId: qKey,
        score,
        bonus,
        rationale: rationaleArr,
        evidence: evidenceArr,
        overall,
        edits,
        model: OPENAI_MODEL,
        usageCount: updatedUsage.usage_count,
        remaining,
        planType: updatedUsage.plan_type,
        windowEnd: updatedUsage.window_end,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Scoring failed: ${message}`, apiVersion: API_VERSION }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";