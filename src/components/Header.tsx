"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const goLogin = () => {
    setOpen(false);          // 모바일 메뉴 닫기
    router.push("/login");   // 명시적 라우팅 (클릭 막힘 이슈 우회)
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <nav className="max-w-4xl mx-auto flex items-center justify-between p-4">
        {/* 홈 버튼 - 뱃지 스타일 */}
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight text-blue-700">
            닥터필리스
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            논술전문
          </span>
        </Link>

        {/* 데스크탑 메뉴 */}
        <div className="hidden md:flex items-center gap-5">
          <Link href="/about" className="hover:underline">소개</Link>
          <Link href="/payment" className="hover:underline">결제방식</Link>
          <Link href="/refund" className="hover:underline">환불정책</Link>
          <Link href="/terms" className="hover:underline">이용약관</Link>
          <Link href="/privacy" className="hover:underline">개인정보</Link>
          <button
            onClick={goLogin}
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            aria-label="로그인 페이지로 이동"
          >
            로그인
          </button>
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
        <div className="md:hidden border-t bg-white shadow">
          <div className="max-w-4xl mx-auto flex flex-col p-3 gap-2">
            <Link href="/about" onClick={() => setOpen(false)}>소개</Link>
            <Link href="/payment" onClick={() => setOpen(false)}>결제방식</Link>
            <Link href="/refund" onClick={() => setOpen(false)}>환불정책</Link>
            <Link href="/terms" onClick={() => setOpen(false)}>이용약관</Link>
            <Link href="/privacy" onClick={() => setOpen(false)}>개인정보</Link>
            <button
              onClick={goLogin}
              className="mt-1 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              로그인
            </button>
          </div>
        </div>
      )}
    </header>
  );
} 