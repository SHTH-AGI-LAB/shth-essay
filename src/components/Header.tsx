// src/components/Header.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

type Usage = {
  email: string;
  // API는 현재 'free' | 'paid' 만 반환 → 타입 정리
  plan: "free" | "paid";
  usageCount: number;
  freeLimit: number;
  freeRemaining: number;
  standardCount: number;
  premiumCount: number;
  vipCount: number;
  windowEnd: string | null;
};

function Badge({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "blue" | "emerald" | "amber" | "purple";
}) {
  const palette: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${palette[tone]}`}
    >
      {label} {value}회
    </span>
  );
}

export default function Header() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [usage, setUsage] = useState<Usage | null>(null); 
  const [open, setOpen] = useState(false); // 모바일 메뉴 토글

  // 로그인 상태에서만 호출
  useEffect(() => {
    if (status !== "authenticated") {
      setUsage(null);
      return;
    }
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/me/usage", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as Usage;
        if (alive) setUsage(data);
      } catch {
        /* noop */
      }
    })();
    return () => {
      alive = false;
    };
  }, [status]);

  const goLogin = () => router.push("/login");

  const Badges = () =>
    usage ? (
      <div className="flex items-center gap-2">
        {usage.freeRemaining > 0 && (
          <Badge label="무료" value={usage.freeRemaining} tone="blue" />
        )}
        {usage.standardCount > 0 && (
          <Badge label="스탠다드" value={usage.standardCount} tone="emerald" />
        )}
        {usage.premiumCount > 0 && (
          <Badge label="프리미어" value={usage.premiumCount} tone="amber" />
        )}
        {usage.vipCount > 0 && <Badge label="VIP" value={usage.vipCount} tone="purple" />}
      </div>
    ) : null;

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-4xl items-center justify-between p-4">
        {/* 홈 */}
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight text-blue-700">
            닥터필리스
          </span>
          <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] text-blue-700">
            논술전문
          </span>
        </Link>

        {/* 데스크톱 메뉴 */}
        <div className="hidden items-center gap-5 text-sm md:flex">
          <Link href="/about" className="hover:underline">소개</Link>
          <Link href="/payment" className="hover:underline">결제방식</Link>
          <Link href="/refund" className="hover:underline">환불정책</Link>
          <Link href="/terms" className="hover:underline">이용약관</Link>
          <Link href="/privacy" className="hover:underline">개인정보</Link>

          {status === "authenticated" ? (
            <>
              <span className="text-gray-700">
                안녕하세요, {session?.user?.name ?? "회원"}님~
              </span>
              <Badges />
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

        {/* 모바일: 햄버거 → 메뉴 토글 */}
        <button
          type="button"
          aria-label="메뉴 열기"
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="rounded p-2 md:hidden border"
          onClick={() => setOpen((v) => !v)}
          onTouchStart={() => setOpen((v) => !v)} // Android 보조
        >
          ☰
        </button>
      </nav>

      {/* 모바일 메뉴 패널 */}
      <div
        id="mobile-menu"
        className={`${open ? "block" : "hidden"} md:hidden border-t bg-white px-4 pb-4`}
      >
        <div className="flex flex-col gap-3 py-3 text-sm">
          {status === "authenticated" ? (
            <>
              <span className="text-gray-700">
                안녕하세요, {session?.user?.name ?? "회원"}님~
              </span>
              <Badges />
              <div className="h-px bg-gray-200" />
              <Link href="/about" className="py-1">소개</Link>
              <Link href="/payment" className="py-1">결제방식</Link>
              <Link href="/refund" className="py-1">환불정책</Link>
              <Link href="/terms" className="py-1">이용약관</Link>
              <Link href="/privacy" className="py-1">개인정보</Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="mt-2 w-full rounded-lg bg-gray-200 py-2 font-medium"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/about" className="py-1">소개</Link>
              <Link href="/payment" className="py-1">결제방식</Link>
              <Link href="/refund" className="py-1">환불정책</Link>
              <Link href="/terms" className="py-1">이용약관</Link>
              <Link href="/privacy" className="py-1">개인정보</Link>
              <button
                onClick={goLogin}
                className="mt-2 w-full rounded-lg bg-blue-600 py-2 font-medium text-white"
              >
                로그인
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
