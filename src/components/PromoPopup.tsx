// src/components/PromoPopup.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

const HIDE_PATHS_EXACT = new Set([
  "/checkout",
  "/success",
  "/fail",
  "/refund",
]);

const HIDE_PATH_PREFIX = ["/payment/"]; 

const DISMISS_KEY = "promo_dismissed_at";
const DISMISS_HOURS = 24; // 하루동안 차단
const OPEN_DELAY_MS = 800;

export default function PromoPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const shouldHide = useMemo(() => {
    if (!pathname) return false;
    if (HIDE_PATHS_EXACT.has(pathname)) return true;
    return HIDE_PATH_PREFIX.some((p) => pathname.startsWith(p));
  }, [pathname]);

  useEffect(() => {
    if (shouldHide) return;

    const ts = localStorage.getItem(DISMISS_KEY);
    if (ts) {
      const last = Number(ts);
      const diffHours = (Date.now() - last) / (1000 * 60 * 60);
      if (diffHours < DISMISS_HOURS) return; // 하루동안 차단
    }

    const t = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    return () => clearTimeout(t);
  }, [shouldHide]);

  const onClose = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setOpen(false);
  };

  if (shouldHide || !open) return null;

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="이벤트 안내">
      <div className="modal_box">
        <button className="modal_close" aria-label="팝업 닫기" onClick={onClose}>
          ✕
        </button>

        <div className="modal_image">
          <Image src="/images/promo.jpg" alt="AIRABBIT 머그컵 프로모션" width={960} height={480} />
        </div>

        <div className="modal_title">2026 대입논술 이벤트</div>
        <div className="modal_text">
          프리미어 이상 가입시 + 논술 노트 & 머그컵 증정(선착순).<br />
          AI첨삭 이용 합격 인증 + 도서문화상품권 5만원 지급 (무료도👌)
        </div>

        <ul className="modal_bullets">
          <li>이벤트 참여시 개인정보 수집·이용에 동의한 것으로 간주됩니다.</li>
        </ul>

        <div className="modal_actions">
          <a className="btn btn-primary" href="/terms" onClick={onClose}>이용안내 보기</a>
          <a className="btn" href="mailto:contact@ai-rabbit.com" onClick={onClose}>이벤트 문의</a>
        </div>

        {/* 안내 문구 */}
        <div className="modal_legal">
          ※ X 버튼을 누르면 오늘 하루는 팝업이 다시 표시되지 않습니다.
        </div>
      </div>
      <div className="modal_backdrop" onClick={onClose} />
    </div>
  );
}