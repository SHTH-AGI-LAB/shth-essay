// src/components/PromoPopup.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation"; 

const DISMISS_KEY = "promo_dismissed_at";
const DISMISS_DAYS = 7;
const OPEN_DELAY_MS = 800;

export default function PromoPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false); // 경로/스토리지 확정 뒤에만 판단

  // 홈에서만 노출
  const isHome = useMemo(() => pathname === "/", [pathname]);

  // 한 번 닫았는지 여부
  const dismissed = useMemo(() => {
    if (typeof window === "undefined") return false;
    const ts = localStorage.getItem(DISMISS_KEY);
    if (!ts) return false;
    const last = Number(ts);
    const diffDays = (Date.now() - last) / (1000 * 60 * 60 * 24);
    return diffDays < DISMISS_DAYS;
  }, [pathname]); // 경로 확정 후 재평가

  // 준비 완료 플래그 (경로와 storage가 준비된 다음에만 오픈 로직 실행)
  useEffect(() => {
    // hydration 끝난 다음 프레임에 ready=true
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // 오픈 로직
  useEffect(() => {
    if (!ready) return;
    if (!isHome) return;        // 홈에서만
    if (dismissed) return;      // 이미 닫음 → 노출 안 함

    const t = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    return () => clearTimeout(t); 
  }, [ready, isHome, dismissed]); 

   const onClose = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setOpen(false);
  };

  if (!isHome || !open) return null;

  return (
    <>
      <div className="modal_backdrop" onClick={onClose} />
      <div className="modal" role="dialog" aria-modal="true" aria-label="이벤트 안내">
        <div className="modal_box">
          <button className="modal_close" aria-label="팝업 닫기" onClick={onClose}>✕</button>

          <div className="modal_image">
            <Image
              src="/images/promo.jpg"
              alt="AIRABBIT 머그컵 프로모션"
              width={960}
              height={480}
              priority
            />
          </div>

          <div className="modal_title">2026 대입논술 이벤트</div>
          <div className="modal_text">
            <strong>프리미엄 이상</strong> 가입 시 논술노트 & 머그컵 증정(선착순).<br />
            AI첨삭 이용 합격 인증 시 <strong>도서문화상품권 5만원</strong> 지급(무료도 포함)
          </div>

          <ul className="modal_bullets">
            <li>이벤트 참여 시 개인정보 수집·이용에 동의한 것으로 간주됩니다.</li>
          </ul>

          <div className="modal_actions">
            <a className="btn btn-primary" href="/terms" onClick={onClose}>이용안내 보기</a>
            <a className="btn" href="mailto:contact@ai-rabbit.com" onClick={onClose}>이벤트 문의</a>
          </div>
        </div>
      </div>
    </>
  );
}