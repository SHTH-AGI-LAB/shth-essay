// src/components/Header.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

type UsageResp = {
  email: string;
  plan: string;
  usageCount: number;
  freeLimit: number;
  freeRemaining: number;
  standardCount: number; // 스탠다드 남은 회수
  premiumCount: number;  // 프리미어 남은 회수
  vipCount: number;      // VIP 남은 회수
  windowEnd: string | null;
};

export default function Header() {
  const [open, setOpen] = useState(false);
  const [usage, setUsage] = useState<UsageResp | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // 로그인 버튼
  const goLogin = () => {
    setOpen(false);
    router.push("/login");
  };

  // 로그인 상태일 때만 사용량 조회
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (status !== "authenticated") {
        setUsage(null);
        return;
      }
      setLoadingUsage(true);
      try {
        const res = await fetch("/api/me/usage", { cache: "no-store" });
        if (!res.ok) throw new Error("failed");
        const data: UsageResp = await res.json();
        if (!cancelled) setUsage(data);
      } catch {
        if (!cancelled) setUsage(null);
      } finally {
        if (!cancelled) setLoadingUsage(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [status]);

  const Badge = ({
    label,
    value,
    tone = "blue",
  }: {
    label: string;
    value: number | string;
    tone?: "blue" | "emerald" | "amber" | "purple";
  }) => {
    const tones: Record<string, string> = {
      blue:
        "bg-blue-50 text-blue-700 border-blue-200",
      emerald:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
      amber:
        "bg-amber-50 text-amber-800 border-amber-200",
      purple:
        "bg-purple-50 text-purple-700 border-purple-200",
    };
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${tones[tone]} whitespace-nowrap`}
        title={label}
      >
        {label} {value}회
      </span>
    );
  };

  // 데스크톱 상단 네비
  const DesktopRight = (
    <div className="hidden md:flex items-center gap-4 text-[13px]">
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

          {/* 배지 모음 */}
          {loadingUsage ? (
            <span className="animate-pulse text-gray-400 text-xs">사용량 불러오는 중…</span>
          ) : usage ? (
            <div className="flex items-center gap-2">
              <Badge label="무료" value={usage.freeRemaining} tone="blue" />
              <Badge label="스탠다드" value={usage.standardCount ?? 0} tone="emerald" />
              <Badge label="프리미어" value={usage.premiumCount ?? 0} tone="amber" />
              <Badge label="VIP" value={usage.vipCount ?? 0} tone="purple" />
            </div>
          ) : (
            <span className="text-xs text-gray-500">사용량 정보를 불러오지 못했어요</span>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="ml-2 rounded-lg bg-gray-200 px-3 py-1.5 text-[13px] hover:bg-gray-300 transition"
          >
            로그아웃
          </button>
        </>
      ) : (
        <button
          onClick={goLogin}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-[13px] text-white hover:bg-blue-700 transition"
        >
          로그인
        </button>
      )}
    </div>
  );

  // 모바일 드로어 메뉴
  const MobileDrawer = open && (
    <div className="md:hidden border-t bg-white shadow text-sm">
      <div className="mx-auto flex max-w-4xl flex-col gap-2 p-3">
        <Link href="/about" onClick={() => setOpen(false)}>소개</Link>
        <Link href="/payment" onClick={() => setOpen(false)}>결제방식</Link>
        <Link href="/refund" onClick={() => setOpen(false)}>환불정책</Link>
        <Link href="/terms" onClick={() => setOpen(false)}>이용약관</Link>
        <Link href="/privacy" onClick={() => setOpen(false)}>개인정보</Link>

        {status === "authenticated" ? (
          <>
            <span className="mt-1 text-gray-700">
              안녕하세요, {session?.user?.name ?? "회원"}님~
            </span>

            {loadingUsage ? (
              <span className="text-xs text-gray-400">사용량 불러오는 중…</span>
            ) : usage ? (
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge label="무료" value={usage.freeRemaining} tone="blue" />
                <Badge label="스탠다드" value={usage.standardCount ?? 0} tone="emerald" />
                <Badge label="프리미어" value={usage.premiumCount ?? 0} tone="amber" />
                <Badge label="VIP" value={usage.vipCount ?? 0} tone="purple" />
              </div>
            ) : (
              <span className="text-xs text-gray-500">사용량 정보를 불러오지 못했어요</span>
            )}

            <button
              onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
              className="mt-2 rounded-lg bg-gray-200 px-3 py-2 hover:bg-gray-300 transition"
            >
              로그아웃
            </button>
          </>
        ) : (
          <button
            onClick={() => { setOpen(false); goLogin(); }}
            className="mt-2 rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 transition"
          >
            로그인
          </button>
        )}
      </div>
    </div>
  );

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
        {DesktopRight}

        {/* 모바일 햄버거 */}
        <button
          aria-label="메뉴 열기"
          className="md:hidden rounded border p-2"
          onClick={() => setOpen(v => !v)}
        >
          ☰
        </button>
      </nav>

      {/* 모바일 드로어 */}
      {MobileDrawer}
    </header>
  );
}