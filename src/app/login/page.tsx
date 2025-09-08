// app/login/page.tsx
"use client";

import { useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const search = useSearchParams();
  const redirect = search.get("redirect") ?? "/";

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(redirect); // 로그인되면 이동
    }
  }, [status, redirect, router]);

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh"}}>
      <h1 style={{fontSize:"2rem",marginBottom:"1rem"}}>로그인</h1>
      <button
        onClick={() => signIn("google", { callbackUrl: redirect })}
        style={{padding:"10px 20px", margin:"5px", border:"1px solid #ccc", borderRadius:"6px"}}
      >
        구글 로그인
      </button>
      <button
        onClick={() => signIn("naver", { callbackUrl: redirect })}
        style={{padding:"10px 20px", margin:"5px", border:"1px solid #ccc", borderRadius:"6px"}}
      >
        네이버 로그인
      </button>
      <button
        onClick={() => signIn("kakao", { callbackUrl: redirect })}
        style={{padding:"10px 20px", margin:"5px", border:"1px solid #ccc", borderRadius:"6px"}}
      >
        카카오 로그인
      </button>
    </div>
  );
}
