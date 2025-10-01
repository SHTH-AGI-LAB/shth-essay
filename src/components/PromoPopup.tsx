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

const HIDE_PATH_PREFIX = ["/payment/"]; // /payment/[slug] 전체 차단

const DISMISS_KEY = "promo_dismissed_at";
const DISMISS_DAYS = 7;       // 닫으면 7일간 재등장 금지
const OPEN_DELAY_MS = 800;    // 들어온 뒤 0.8초 후 오픈

export default function PromoPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // ✅ 1) 홈에서만 + 결제/환불 경로는 숨김
  const shouldHide = useMemo(() => {
    if (!pathname) return true;
    if (pathname !== "/") return true;                    // 홈이 아니면 숨김
    if (HIDE_PATHS_EXACT.has(pathname)) return true;      // 안전망(사실 "/"라서 안맞음)
    return HIDE_PATH_PREFIX.some((p) => pathname.startsWith(p));
  }, [pathname]);

  // ✅ 2) 이미 닫았는지(유예기간 내) 체크
  useEffect(() => {
    if (shouldHide) return; // 보일 자격이 없으면 아무것도 하지 않음
    const ts = localStorage.getItem(DISMISS_KEY);
    if (ts) {
      const last = Number(ts);
      const diffDays = (Date.now() - last) / (1000 * 60 * 60 * 24);
      if (diffDays < DISMISS_DAYS) return; // 유예기간
    }
    const t = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    return () => clearTimeout(t);
  }, [shouldHide]);

  // ✅ 3) 닫기
  const onClose = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setOpen(false);
  };

  if (shouldHide || !open) return null;

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="이벤트 안내">
      <div className="modal_box modal_centered">
        <button className="modal_close" aria-label="팝업 닫기" onClick={onClose}>
          ✕
        </button>

        <div className="modal_image modal_image--center">
          <Image
            src="/images/promo.jpg"
            alt="AIRABBIT 머그컵 프로모션"
            width={1200}
            height={630}
            priority
            style={{ width: "100%", height: "auto" }}
          />
        </div>

        <h3 className="modal_title modal_title--center">2026 대입논술 이벤트</h3>

        <p className="modal_text modal_text--center">
          <strong>프리미엄 이상</strong> 가입 시 <strong>논술 노트 &amp; 머그컵</strong> 증정(선착순).
          <br />
          AI첨삭 이용 <strong>합격 인증</strong> 시 <strong>도서문화상품권 5만원</strong> 지급 (무료 이용자도 가능)
        </p>

        <ul className="modal_bullets modal_bullets--center">
          <li>이벤트 참여 시 개인정보 수집·이용에 동의한 것으로 간주됩니다.</li>
        </ul>

        <div className="modal_actions modal_actions--center">
          <a className="btn btn-primary" href="/terms" onClick={onClose}>
            이용안내 보기
          </a>
          <a className="btn" href="mailto:contact@ai-rabbit.com" onClick={onClose}>
            이벤트 문의
          </a>
        </div>
      </div>

      <div className="modal_backdrop" onClick={onClose} />
    </div>
  );
}