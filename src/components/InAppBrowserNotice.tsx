"use client";
import { useEffect, useState } from "react";

const INAPP_RE = /(KAKAOTALK|NAVER|Instagram|FBAN|FBAV)/i;

export default function InAppBrowserNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(INAPP_RE.test(navigator.userAgent));
  }, []);

  if (!show) return null;

  const url =
    typeof window !== "undefined" ? window.location.href : "https://dr-phyllis.com";
  const androidChrome = `googlechrome://navigate?url=${encodeURIComponent(url)}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-yellow-100 border-t border-yellow-300 p-3 text-sm text-yellow-900">
      인앱 브라우저에서는 Google 로그인이 막혀요.{" "}
      <button
        className="underline font-semibold"
        onClick={() => {
          const a = document.createElement("a");
          a.href = androidChrome;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => (window.location.href = url), 200);
        }}
      >
        크롬/Safari로 열기
      </button>
      를 눌러주세요.
    </div>
  );
}