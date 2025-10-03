// src/components/Header.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

function QuotaBadge({ remaining }: { remaining: number }) {
  return (
    <span
      className="ml-2 rounded-full border px-2 py-0.5 text-xs
                 border-blue-200 bg-blue-50 text-blue-700"
      title="무료 체험 잔여 횟수"
    >
      남은 체험 {remaining}회
    </span>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  // 로그인 시 잔여 횟수 가져오기
  useEffect(() => {
    let cancelled = false;
    const fetchRemain = async () => {
      try {
        if (status !== "authenticated") {
          if (!cancelled) setRemaining(null);
          return;
        }
        const res = await fetch("/api/me/usage", { credentials: "include" });
        if (!res.ok) return; // 세션 만료 등은 표시하지 않음
        const data = await res.json();
        if (!cancelled) setRemaining(Number(data?.remaining ?? 0));
      } catch {
        /* 네트워크 에러는 무시 */
      }
    };
    fetchRemain();
    return () => {
      cancelled = true;
    };
  }, [status]);

  const goLogin = () => {
    setOpen(false);
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-4xl items-center justify-between p-4">
        {/* 홈 버튼 */}
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight text-blue-700">
            닥터필리스
          </span>
          <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] text-blue-700">
            논술전문
          </span>
        </Link>

        {/* 데스크톱 메뉴 */}
        <div className="hidden items-center gap-5 md:flex">
          <Link href="/about" className="hover:underline">
            소개
          </Link>
          <Link href="/payment" className="hover:underline">
            결제방식
          </Link>
          <Link href="/refund" className="hover:underline">
            환불정책
          </Link>
          <Link href="/terms" className="hover:underline">
            이용약관
          </Link>
          <Link href="/privacy" className="hover:underline">
            개인정보
          </Link>

          {status === "authenticated" ? (
            <>
              <span className="text-gray-700">
                안녕하세요, {session?.user?.name ?? "회원"}님~
              </span>
              {/* 잔여 횟수 뱃지 (로그인 상태에서만) */}
              {remaining !== null && <QuotaBadge remaining={remaining} />}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-lg bg-gray-200 px-3 py-1.5 transition hover:bg-gray-300"
              >
                로그아웃
              </button>
            </>
          ) : (
            <button
              onClick={goLogin}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-white transition hover:bg-blue-700"
            >
              로그인
            </button>
          )}
        </div>

        {/* 모바일 햄버거 버튼 */}
        <button
          aria-label="메뉴 열기"
          className="md:hidden rounded border p-2"
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>
      </nav>

      {/* 모바일 드로어 메뉴 */}
      {open && (
        <div className="md:hidden border-t bg-white shadow">
          <div className="mx-auto flex max-w-4xl flex-col gap-2 p-3">
            <Link href="/about" onClick={() => setOpen(false)}>
              소개
            </Link>
            <Link href="/payment" onClick={() => setOpen(false)}>
              결제방식
            </Link>
            <Link href="/refund" onClick={() => setOpen(false)}>
              환불정책
            </Link>
            <Link href="/terms" onClick={() => setOpen(false)}>
              이용약관
            </Link>
            <Link href="/privacy" onClick={() => setOpen(false)}>
              개인정보
            </Link>

            {status === "authenticated" ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">
                    안녕하세요, {session?.user?.name ?? "회원"}님~
                  </span>
                  {remaining !== null && <QuotaBadge remaining={remaining} />}
                </div>
                <button
                  onClick={() => {
                    setOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="rounded-lg bg-gray-200 px-3 py-2 transition hover:bg-gray-300"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setOpen(false);
                  goLogin();
                }}
                className="rounded-lg bg-blue-600 px-3 py-2 text-white transition hover:bg-blue-700"
              >
                로그인
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}