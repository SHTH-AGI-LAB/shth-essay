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

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(redirect);
    }
  }, [status, redirect, router]);

  const guardedSignIn = () => {
    if (!agreed) {
      alert("이용약관 및 개인정보 처리방침에 동의해야 로그인할 수 있습니다.");
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
          <p className="mt-2 text-sm opacity-80">로그인 후 첨삭/결제 기능을 이용할 수 있어요.</p>
        </div>

        {/* ✅ 지금은 구글만 노출 */}
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