"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-[var(--foreground)]">로그인 페이지 불러오는 중…</div>}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const { status } = useSession();
  const router = useRouter();
  const search = useSearchParams();
  const redirect = (search?.get("redirect") ?? "/") as string;

  const [agreed, setAgreed] = useState(false);
  const [inApp, setInApp] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || "";
    const INAPP_PATTERNS = /(KAKAOTALK|KAKAOSTORY|NAVER|DaumApps|FBAN|FBAV|Instagram|Line|FB_IAB)/i;
    setInApp(INAPP_PATTERNS.test(ua));
    setIsIOS(/iPhone|iPad|iPod/i.test(ua));
  }, []);

  const openExternally = () => {
    const url = window.location.href;
    if (isIOS) {
      alert("iPhone·iPad에서는 오른쪽 상단 ••• 메뉴 → ‘Safari로 열기’를 눌러주세요.");
    } else {
      const intent = `intent://${location.host}${location.pathname}${location.search}#Intent;scheme=https;package=com.android.chrome;end;`;
      window.location.href = intent;
      setTimeout(() => {
        alert("Chrome이 열리지 않는다면 ••• 메뉴 → ‘브라우저에서 열기’를 선택해주세요.");
      }, 1000);
    }
  };

  const guardedSignIn = () => {
    if (!agreed) {
      alert("이용약관 및 개인정보 처리방침에 동의해야 로그인할 수 있습니다.");
      return;
    }
    if (inApp) {
      openExternally();
      return;
    }
    void signIn("google", { callbackUrl: redirect });
  };

  const btn = (enabled: boolean) =>
    `w-full h-11 rounded-lg border border-[var(--line)] transition font-medium ${
      enabled
        ? "bg-[var(--card)] text-[var(--card-foreground)] hover:opacity-90 cursor-pointer"
        : "bg-[var(--line)] text-[var(--muted)] cursor-not-allowed"
    }`;

  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-[var(--background)] text-[var(--foreground)]">
      <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 shadow">
        <div className="mb-5 text-center">
          <h1 className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">닥터필리스</h1>
          <p className="mt-3 text-lg sm:text-xl font-semibold opacity-100">
            🔐 로그인하면 AI 논술 첨삭을 바로 시작할 수 있어요!
          </p>
        </div>

        {/* 인앱 경고 */}
        {inApp && (
          <div className="mb-4 rounded-lg border border-[var(--line)] bg-yellow-50 text-gray-800 p-3 text-sm">
            <b>⚠️ 휴대폰·패드에서 앱(카톡·인스타·네이버 등)으로 열면 로그인 오류가 발생합니다.</b>
            <div className="mt-1">
              반드시 <b>외부 브라우저(Chrome 또는 Safari)</b>로 열어주세요.
            </div>
            <button
              onClick={openExternally}
              className="mt-2 w-full rounded-md border border-gray-300 bg-white py-2 text-sm font-medium hover:bg-gray-100"
            >
              브라우저에서 열기
            </button>
          </div>
        )}

        {/* ✅ 구글 로그인 */}
        <div className="space-y-3">
          <button type="button" onClick={guardedSignIn} disabled={!agreed} className={btn(agreed)}>
            Google로 계속하기
          </button>
        </div>

        {/* 필수 동의 */}
        <div className="mt-6 flex items-start gap-2">
          <input
            id="agree"
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 accent-blue-600"
          />
          <label htmlFor="agree" className="text-sm opacity-90">
            <Link href="/terms" target="_blank" className="text-blue-600 underline dark:text-blue-400">
              이용약관
            </Link>{" "}
            및{" "}
            <Link href="/privacy" target="_blank" className="text-blue-600 underline dark:text-blue-400">
              개인정보 처리방침
            </Link>
            에 동의합니다. (필수)
          </label>
        </div>

        <p className="mt-4 text-xs text-center opacity-70">
          로그인은 암호를 저장하지 않으며, 승인된 OAuth 제공자만 사용합니다.
        </p>
      </div>
    </main>
  );
}