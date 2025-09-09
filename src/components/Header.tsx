"use client";
import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b bg-white">
      <nav className="max-w-4xl mx-auto flex items-center justify-between p-4">
        {/* 홈 버튼 */}
        <Link href="/" className="text-xl font-bold text-blue-600">
          닥터필리스
        </Link>

        {/* 데스크톱 메뉴 */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/about">소개</Link>
          <Link href="/payment">결제방식</Link>
          <Link href="/refund">환불정책</Link>
          <Link href="/terms">이용약관</Link>
          <Link href="/privacy">개인정보</Link>
          <Link
            href="/login"
            className="px-3 py-1 rounded bg-blue-500 text-white"
          >
            로그인
          </Link>
        </div>

        {/* 모바일 햄버거 버튼 */}
        <button
          aria-label="메뉴 열기"
          className="md:hidden p-2 border rounded"
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>
      </nav>

      {/* 모바일 드로어 메뉴 */}
      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="max-w-4xl mx-auto flex flex-col p-3 gap-2">
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
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded bg-blue-500 text-white"
            >
              로그인
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
