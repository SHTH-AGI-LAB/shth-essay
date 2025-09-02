"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();
  const [left, setLeft] = useState<number>(3); // ✅ 기본값 3회

  useEffect(() => {
    if (typeof document === "undefined") return;

    const m = document.cookie.match(/(?:^|; )free_uses=(\d+)/);
    const used = m ? parseInt(m[1], 10) : 0;

    const paid = document.cookie.includes("paid=true");
    if (paid) {
      setLeft(Infinity); // 무제한이면 표시 안 함
    } else {
      setLeft(Math.max(0, 3 - used));
    }
  }, [session]); // 세션 바뀔 때마다 다시 계산
  

  return (
    <header style={{
      padding: "10px",
      borderBottom: "1px solid #ddd",
      display: "flex",
      gap: 12,
      alignItems: "center"
    }}>
      <a href="/" style={{ fontWeight: 700 }}>시하·태하 연구소</a>

      {session ? (
        <>
          <span>안녕하세요, {session.user?.name}님 👋</span>
          {left !== Infinity && <span>무료 남은 횟수: {left}회</span>}
          <button
            onClick={() => signOut()}
            style={{ padding:"6px 12px", border:"1px solid #ccc", borderRadius:6 }}
          >
            로그아웃
          </button>
        </>
      ) : (
        <a
          href="/login"
          style={{ padding:"6px 12px", border:"1px solid #ccc", borderRadius:6 }}
        >
          로그인
        </a>
      )}
    </header>
  );
}
