"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

const HIDE_PATHS_EXACT = new Set([
  "/checkout",
  "/success",
  "/fail",
  "/refund",
  "/toss/confirm", 
  "/toss/fail", 
]);

const HIDE_PATH_PREFIX = ["/payment/"]; // /payment/[slug] 전체 차단

const DISMISS_KEY = "promo_dismissed_at";
const DISMISS_DAYS = 1; // 하루동안 안보기
const OPEN_DELAY_MS = 800;

export default function PromoPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);

  // 1) 결제 흐름 경로인지 판별
  const shouldHide = useMemo(() => {
    if (!pathname) return false;
    if (HIDE_PATHS_EXACT.has(pathname)) return true;
    return HIDE_PATH_PREFIX.some((p) => pathname.startsWith(p));
  }, [pathname]);

  // 2) 이미 닫았는지 확인
  useEffect(() => {
    if (shouldHide) return;
    const ts = localStorage.getItem(DISMISS_KEY);
    if (ts) {
      const last = Number(ts);
      const diffDays = (Date.now() - last) / (1000 * 60 * 60 * 24);
      if (diffDays < DISMISS_DAYS) return;
    }
    const t = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    return () => clearTimeout(t);
  }, [shouldHide]);

  // 3) 닫기
  const onClose = () => {
    if (dontShowToday) {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }
    setOpen(false);
  };

  if (shouldHide || !open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
  <div className="relative w-[90%] max-w-lg rounded-lg bg-white text-black shadow-xl p-6">
    {/* 닫기 버튼 */}
    <button
      onClick={onClose}
      className="absolute top-3 right-3 text-xl font-bold text-gray-500 hover:text-gray-800"
      aria-label="닫기"
    >
      ✕
    </button>

    {/* 이미지 */}
    <div className="mb-4">
      <Image
        src="/images/promo.jpg"
        alt="AIRABBIT 머그컵 프로모션"
        width={600}
        height={300}
        className="rounded"
      />
    </div>

    {/* 타이틀 */}
    <h2 className="text-xl font-bold mb-2 text-center">2027 대입논술 선착순 이벤트</h2>

    {/* 본문 */}
    <p className="text-sm mb-3 text-center">
      프리미엄 이상 가입 시 노트&머그컵 증정<br />
      AI 첨삭 합격 인증 시 도서문화상품권 (무료🆗)
    </p>

    {/* 안내 문구 */}
    <p className="text-xs text-gray-500 mb-2 text-center">
      이벤트 참여 시 개인정보 수집·이용에 동의한 것으로 간주
    </p>

    {/* 체크박스 + 버튼 */}
    <div className="flex items-center justify-between mt-4">
      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={dontShowToday}
          onChange={(e) => setDontShowToday(e.target.checked)}
        />
        오늘 하루 보지 않기
      </label>
      <div className="flex gap-2">
        <a className="px-3 py-1 bg-black text-white rounded text-xs" href="/terms" onClick={onClose}>이용안내</a>
        <a className="px-3 py-1 border border-gray-400 rounded text-xs" href="mailto:contact@ai-rabbit.com" onClick={onClose}>e-문의</a>
      </div>
    </div>
  </div>
</div>
  );
}