// src/components/PromoPopup.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

const HIDE_PATHS_EXACT = new Set(["/checkout","/success","/fail","/refund"]);
const HIDE_PATH_PREFIX = ["/payment/"];
const OPEN_DELAY_MS = 800;

export default function PromoPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // 홈에서만 보이도록 조건
  const shouldHide = useMemo(() => {
    if (!pathname) return false;
    if (pathname !== "/") return true;  // ✅ 홈에서만
    if (HIDE_PATHS_EXACT.has(pathname)) return true;
    return HIDE_PATH_PREFIX.some((p) => pathname.startsWith(p));
  }, [pathname]);

  // 0.8초 뒤 자동 열림
  useEffect(() => {
    if (shouldHide) return;
    const t = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    return () => clearTimeout(t);
  }, [shouldHide]);

  // 닫기(X) 누르면 당장은 닫히지만, 다음 새 로그인/새로고침 때 다시 보임
  const onClose = () => setOpen(false);

  if (shouldHide || !open) return null;

  // PromoPopup.tsx의 return 부분만 교체
return (
  <>
    <div className="modal_backdrop" onClick={onClose} />
    <div className="modal" role="dialog" aria-modal="true" aria-label="이벤트 안내">
      <div className="modal_box">
        <button className="modal_close" aria-label="팝업 닫기" onClick={onClose}>✕</button>
        <div className="modal_image">
          <Image src="/images/promo.jpg" alt="AIRABBIT 머그컵 프로모션" width={960} height={480}/>
        </div>
        <div className="modal_title">2026 대입논술 이벤트</div>
        <div className="modal_text">
          프리미엄 이상 가입 시 논술노트 & 머그컵 증정(선착순).<br />
          AI첨삭 이용 합격 인증 시 도서문화상품권 5만원 지급(무료도👌)
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