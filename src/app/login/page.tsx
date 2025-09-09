// app/login/page.tsx
"use client";

import { Suspense, useEffect } from "react";
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

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(redirect);
    }
  }, [status, redirect, router]);

  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-5 text-center">
          <h1 className="text-2xl font-extrabold text-blue-700">닥터필리스</h1>
          <p className="mt-2 text-sm text-gray-600">로그인 후 첨삭/결제 기능을 이용할 수 있어요.</p>
        </div>

        <div className="space-y-3">
          <button onClick={() => signIn("google", { callbackUrl: redirect })} className="w-full h-11 rounded-lg border hover:bg-gray-50 transition">
            Google로 계속하기
          </button>
          <button onClick={() => signIn("naver", { callbackUrl: redirect })} className="w-full h-11 rounded-lg border hover:bg-gray-50 transition">
            네이버로 계속하기
          </button>
          <button onClick={() => signIn("kakao", { callbackUrl: redirect })} className="w-full h-11 rounded-lg border hover:bg-gray-50 transition">
            카카오로 계속하기
          </button>
        </div>

        <p className="mt-4 text-xs text-gray-500 text-center">
          로그인은 암호를 저장하지 않으며, 승인된 OAuth 제공자만 사용합니다.
        </p>
      </div>
    </main>
  );
}