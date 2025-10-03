"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const goLogin = () => {
    setOpen(false);
    router.push("/login");
  };

  // 여기서 남은 체험 횟수를 props나 상태로 받아와야 할 수도 있음
  const remaining = 3; // 예시로 하드코딩

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <nav className="max-w-4xl mx-auto flex items-center justify-between p-4">
        {/* 홈 버튼 */}
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight text-blue-700">
            닥터필리스
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            논술전문
          </span>
        </Link>

        {/* 데스크톱 메뉴 */}
        <div className="hidden md:flex items-center gap-5 text-sm">
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
              <span className="ml-2 inline-block rounded-full bg-blue-100 px-2 py-0.5 
                               text-xs font-medium text-blue-700 border border-blue-300">
                남은 체험 {remaining}회
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
              >
                로그아웃
              </button>
            </>
          ) : (
            <button
              onClick={goLogin}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              로그인
            </button>
          )}
        </div>

        {/* 모바일 햄버거 버튼 */}
        <button
          aria-label="메뉴 열기"
          className="md:hidden p-2 border rounded"
          onClick={() => setOpen(v => !v)}
        >
          ☰
        </button>
      </nav>

      {/* 모바일 드로어 메뉴 */}
      {open && (
        <div className="md:hidden border-t bg-white shadow text-sm">
          <div className="max-w-4xl mx-auto flex flex-col p-3 gap-2">
            <Link href="/about" onClick={() => setOpen(false)}>소개</Link>
            <Link href="/payment" onClick={() => setOpen(false)}>결제방식</Link>
            <Link href="/refund" onClick={() => setOpen(false)}>환불정책</Link>
            <Link href="/terms" onClick={() => setOpen(false)}>이용약관</Link>
            <Link href="/privacy" onClick={() => setOpen(false)}>개인정보</Link>

            {status === "authenticated" ? (
              <>
                <span className="text-gray-700">
                  안녕하세요, {session?.user?.name ?? "회원"}님~
                </span>
                <span className="ml-2 inline-block rounded-full bg-blue-100 px-2 py-0.5 
                                 text-xs font-medium text-blue-700 border border-blue-300">
                  남은 체험 {remaining}회
                </span>
                <button
                  onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                  className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <button
                onClick={() => { setOpen(false); goLogin(); }}
                className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
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