"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Header() {
  const { data: session } = useSession();
  const [left, setLeft] = useState<number>(3);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const m = document.cookie.match(/(?:^|; )free_uses=(\d+)/);
    const used = m ? parseInt(m[1], 10) : 0;

    const paid = document.cookie.includes("paid=true");
    if (paid) {
      setLeft(Infinity);
    } else {
      setLeft(Math.max(0, 3 - used));
    }
  }, [session]);

  return (
    <header
      style={{
        padding: "10px",
        borderBottom: "1px solid #ddd",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
      }}
    >
      {/* Left: Logo + Nav */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Link href="/" style={{ fontWeight: 700 }}>
          학교별 맞춤 첨삭앱 Dr-phyllis
        </Link>

        <Link
          href="/about"
          style={{ padding: "6px 12px", border: "1px solid #ccc", borderRadius: 6 }}
        >
          소개
        </Link>

        <Link
          href="/payment"
          style={{ padding: "6px 12px", border: "1px solid #ccc", borderRadius: 6 }}
        >
          결제방식
        </Link>

        <Link
          href="/refund"
          style={{ padding: "6px 12px", border: "1px solid #ccc", borderRadius: 6 }}
        >
          환불정책
        </Link>

        <Link
          href="/terms"
          style={{ padding: "6px 12px", border: "1px solid #ccc", borderRadius: 6 }}
        >
          이용약관
        </Link>

        <Link
          href="/privacy"
          style={{ padding: "6px 12px", border: "1px solid #ccc", borderRadius: 6 }}
        >
          개인정보처리방침
        </Link>
      </div>

      {/* Right: Auth */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {session ? (
          <>
            <span>안녕하세요, {session.user?.name}님 👋</span>
            {left !== Infinity && <span>무료 남은 횟수: {left}회</span>}
            <button
              onClick={() => signOut()}
              style={{ padding: "6px 12px", border: "1px solid #ccc", borderRadius: 6 }}
            >
              로그아웃
            </button>
          </>
        ) : (
          <Link
            href="/login"
            style={{ padding: "6px 12px", border: "1px solid #ccc", borderRadius: 6 }}
          >
            로그인
          </Link>
        )}
      </div>
    </header>
  );
}