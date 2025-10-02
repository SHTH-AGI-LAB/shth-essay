"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

const HIDE_PATHS_EXACT = new Set([
  "/checkout",
  "/success",
  "/fail",
  "/refund",
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
    <div className="modal-backdrop">
      <div className="modal">
        <button className="modal__close" onClick={onClose} aria-label="닫기">
          ✕
        </button>

        <div className="modal__image">
          <Image
            src="/images/promo.jpg"
            alt="AIRABBIT 머그컵 프로모션"
            width={960}
            height={480}
          />
        </div>

        <div className="modal__title">2026 대입논술 이벤트</div>
        <div className="modal__text">
          프리미엄 이상 가입 시 논술노트 & 머그컵 증정(선착순).<br />
          AI첨삭 이용 합격 인증 시 도서문화상품권 5만원 지급(무료도👌)
        </div>

        <ul className="modal__bullets">
          <li>이벤트 참여 시 개인정보 수집·이용에 동의한 것으로 간주됩니다.</li>
        </ul>

        {/* ✅ 체크박스 영역 */}
        <div className="flex items-center gap-2 mt-3">
          <input
            type="checkbox"
            id="dontShowToday"
            checked={dontShowToday}
            onChange={(e) => setDontShowToday(e.target.checked)}
          />
          <label htmlFor="dontShowToday" className="text-sm text-gray-300">
            체크 후 닫기를 누르면 하루 동안 보이지 않습니다.
          </label>
        </div>

        <div className="modal__actions">
          <a className="btn btn-primary" href="/terms" onClick={onClose}>
            이용안내 보기
          </a>
          <a className="btn" href="mailto:contact@ai-rabbit.com" onClick={onClose}>
            이벤트 문의
          </a>
        </div>
      </div>
    </div>
  );
}