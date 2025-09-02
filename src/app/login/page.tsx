// app/login/page.tsx
"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh"}}>
      <h1 style={{fontSize:"2rem",marginBottom:"1rem"}}>로그인</h1>
      <button 
        onClick={() => signIn("google")} 
        style={{padding:"10px 20px", margin:"5px", border:"1px solid #ccc", borderRadius:"6px"}}
      >
        구글 로그인
      </button>
      <button 
        onClick={() => signIn("naver")} 
        style={{padding:"10px 20px", margin:"5px", border:"1px solid #ccc", borderRadius:"6px"}}
      >
        네이버 로그인
      </button>
      <button 
        onClick={() => signIn("kakao")} 
        style={{padding:"10px 20px", margin:"5px", border:"1px solid #ccc", borderRadius:"6px"}}
      >
        카카오 로그인
      </button>
    </div>
  );
}