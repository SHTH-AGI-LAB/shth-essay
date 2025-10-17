// src/components/Header.tsx
"use client";
import { useEffect, useState } from "react";
import type React from "react";   
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

type Usage = {
  email: string;
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
  const [open, setOpen] = useState(false);

  // ✅ 안드로이드 “두 번 토글” 방지: 단일 포인터 이벤트 핸들러
  const toggleMenu = (e: React.PointerEvent<HTMLButtonElement>) => {
  e.preventDefault();
  e.stopPropagation();
  setOpen(v => !v);
  };

  // (옵션) 열려 있을 때 바깥 클릭하면 닫기
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("click", close, { once: true });
    return () => window.removeEventListener("click", close);
  }, [open]);

  // 로그인 상태에서만 usage 호출
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
    <header className="sticky top-0 z-50 w-full border-b border-[var(--line)] bg-[var(--background)] backdrop-blur text-[var(--foreground)]">
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
          <Link href="/about" className="text-[var(--foreground)] hover:opacity-80">소개</Link>
          <Link href="/payment" className="text-[var(--foreground)] hover:opacity-80">결제방식</Link>
          <Link href="/refund" className="text-[var(--foreground)] hover:opacity-80">환불정책</Link>
          <Link href="/terms" className="text-[var(--foreground)] hover:opacity-80">이용약관</Link>
          <Link href="/privacy" className="text-[var(--foreground)] hover:opacity-80">개인정보</Link>

          {status === "authenticated" ? (
            <>
              <span className="text-[var(--foreground)]">
                안녕하세요, {session?.user?.name ?? "회원"}님~
              </span>
              <Badges />
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-lg border border-[var(--line)] bg-[var(--card)] px-3 py-1.5 text-[var(--card-foreground)] transition hover:opacity-90"
              >
                로그아웃
              </button>
            </>
          ) : (
            <button
              onClick={goLogin}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-white transition hover:brightness-110"
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
          onPointerUp={toggleMenu} // ← 단일 이벤트로 통합
          className="rounded border border-[var(--line)] p-2 md:hidden select-none active:opacity-80 [touch-action:manipulation]"
        >
          ☰
        </button>
      </nav>

      {/* 모바일 메뉴 패널 */}
      <div
        id="mobile-menu"
        className={`${open ? "block" : "hidden"} md:hidden border-t border-[var(--line)] bg-[var(--background)] px-4 pb-4`}
      >
        <div className="flex flex-col gap-3 py-3 text-sm">
          {status === "authenticated" ? (
            <>
              <span className="text-[var(--foreground)]">
                안녕하세요, {session?.user?.name ?? "회원"}님~
              </span>
              <Badges />
              <div className="h-px bg-[var(--line)]" />
              <Link href="/about" className="py-1 text-[var(--foreground)]">소개</Link>
              <Link href="/payment" className="py-1 text-[var(--foreground)]">결제방식</Link>
              <Link href="/refund" className="py-1 text-[var(--foreground)]">환불정책</Link>
              <Link href="/terms" className="py-1 text-[var(--foreground)]">이용약관</Link>
              <Link href="/privacy" className="py-1 text-[var(--foreground)]">개인정보</Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="mt-2 w-full rounded-lg border border-[var(--line)] bg-[var(--card)] py-2 font-medium text-[var(--card-foreground)] hover:opacity-90"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/about" className="py-1 text-[var(--foreground)]">소개</Link>
              <Link href="/payment" className="py-1 text-[var(--foreground)]">결제방식</Link>
              <Link href="/refund" className="py-1 text-[var(--foreground)]">환불정책</Link>
              <Link href="/terms" className="py-1 text-[var(--foreground)]">이용약관</Link>
              <Link href="/privacy" className="py-1 text-[var(--foreground)]">개인정보</Link>
              <button
                onClick={goLogin}
                className="mt-2 w-full rounded-lg bg-blue-600 py-2 font-medium text-white hover:brightness-110"
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