// app/login/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic"; // ✅ 미리 렌더하지 말고 동적 처리

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">로그인 페이지 불러오는 중…</div>}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const { status } = useSession();
  const router = useRouter();
  const search = useSearchParams();
  const redirect = (search?.get("redirect") ?? "/") as string;

  // ✅ 필수 동의 체크박스 상태
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(redirect);
    }
  }, [status, redirect, router]);

  // ✅ 동의 안 했으면 signIn 막기
  const guardedSignIn = (provider: string, cbUrl: string) => {
    if (!agreed) {
      alert("이용약관 및 개인정보 처리방침에 동의해야 로그인할 수 있습니다.");
      return;
    }
    void signIn(provider, { callbackUrl: cbUrl });
  };

  // 버튼 공통 클래스
  const btn = (enabled: boolean) =>
    `w-full h-11 rounded-lg border transition ${
      enabled ? "bg-white hover:bg-gray-50 cursor-pointer" : "bg-gray-200 cursor-not-allowed"
    }`;

  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-5 text-center">
          <h1 className="text-2xl font-extrabold text-blue-700">닥터필리스</h1>
          <p className="mt-2 text-sm text-gray-600">로그인 후 첨삭/결제 기능을 이용할 수 있어요.</p>
        </div>

        {/* 소셜/테스트 로그인 버튼들 */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => guardedSignIn("google", redirect)}
            disabled={!agreed}
            className={btn(agreed)}
          >
            Google로 계속하기
          </button>
          <button
            type="button"
            onClick={() => guardedSignIn("naver", redirect)}
            disabled={!agreed}
            className={btn(agreed)}
          >
            네이버로 계속하기
          </button>
          <button
            type="button"
            onClick={() => guardedSignIn("kakao", redirect)}
            disabled={!agreed}
            className={btn(agreed)}
          >
            카카오로 계속하기
          </button>
          
        </div>

        {/* ✅ 필수 동의 체크박스 + 링크 */}
        <div className="mt-6 flex items-start gap-2">
          <input
            id="agree"
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="agree" className="text-sm text-gray-700">
            <a href="/terms" target="_blank" className="text-blue-600 underline">
              이용약관
            </a>{" "}
            및{" "}
            <a href="/privacy" target="_blank" className="text-blue-600 underline">
              개인정보 처리방침
            </a>
            에 동의합니다. (필수)
          </label>
        </div>

        <p className="mt-4 text-xs text-gray-500 text-center">
          로그인은 암호를 저장하지 않으며, 승인된 OAuth 제공자만 사용합니다.
        </p>
      </div>
    </main>
  );
}