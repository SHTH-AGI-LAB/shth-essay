"use client";

import { useEffect, useRef, useState } from "react";

type Testimonial = {
  quote: string;
  author: string;
  meta?: string; // (예: 고3/수험생 등)
};

const DEFAULTS: Testimonial[] = [
  {
    quote:
      "대학마다 채점 기준이 다른데, 여기서는 제 글이 어느 대학에서 더 유리한지 바로 확인할 수 있어요. 무료 3회 체험만으로도 제 강점이 보여요.",
    author: "정민",
    meta: "수험생",
  },
  {
    quote:
      "일반 첨삭보다 심리적 부담이 적고 속도가 빨라요. 디지털이 더 편한 제 세대에게 딱이에요.",
    author: "지안",
    meta: "고3",
  },
  {
    quote:
      "학교별 평가 비율(논제이해/논증 등)을 점수로 보여줘서, 어디를 강화해야 할지 명확했습니다.",
    author: "해린",
    meta: "N수생",
  },
  {
    quote:
      "PDF 저장/인쇄가 바로 돼서 담임 선생님과 공유하기도 편했어요. 부모님께도 설명하기 좋았습니다.",
    author: "유진",
    meta: "고3",
  },
];

export default function Testimonials({
  items = DEFAULTS,
  autoMs = 5000,
}: {
  items?: Testimonial[];
  autoMs?: number;
}) {
  const [idx, setIdx] = useState(0);
  const timer = useRef<number | null>(null);
  const total = items.length;

  useEffect(() => {
    start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, total]);

  const start = () => {
    stop();
    timer.current = window.setTimeout(
      () => setIdx((i) => (i + 1) % total),
      autoMs
    );
  };
  const stop = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
  };

  const go = (i: number) => setIdx((i + total) % total);

  return (
    <div
      className="mt-16 select-none"
      onMouseEnter={stop}
      onMouseLeave={start}
    >
      <h2 className="mb-6 text-center text-2xl font-semibold">실제 학생 후기</h2>

      <div className="relative mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* 본문 */}
        <p className="text-lg leading-8 text-gray-800">
          “{items[idx].quote}”
        </p>
        <div className="mt-4 text-right text-sm text-gray-600">
          — {items[idx].author}
          {items[idx].meta ? ` (${items[idx].meta})` : ""}
        </div>

        {/* 좌우 버튼 */}
        <button
          aria-label="이전 후기"
          onClick={() => go(idx - 1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border bg-white/90 px-3 py-1 text-sm shadow hover:bg-white"
        >
          ‹
        </button>
        <button
          aria-label="다음 후기"
          onClick={() => go(idx + 1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border bg-white/90 px-3 py-1 text-sm shadow hover:bg-white"
        >
          ›
        </button>

        {/* 점(도트) 인디케이터 */}
        <div className="mt-6 flex justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`후기 ${i + 1}`}
              className={`h-2 w-2 rounded-full transition ${
                i === idx ? "bg-gray-800" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      <p className="mt-2 text-center text-xs text-gray-500">
        자동으로 넘어가요(5초). 마우스를 올리면 일시정지됩니다.
      </p>
    </div>
  );
}