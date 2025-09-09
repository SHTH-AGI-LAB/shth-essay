 // src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ 대학 페이지만 보호 (/u/*)
  if (!pathname.startsWith("/u/")) return NextResponse.next();

  // ✅ 1) 로그인 체크: next-auth / authjs 모든 세션 쿠키 허용
  const sessionCookie =
    req.cookies.get("__Secure-next-auth.session-token") ??
    req.cookies.get("next-auth.session-token") ??
    req.cookies.get("__Secure-authjs.session-token") ??
    req.cookies.get("authjs.session-token");

  if (!sessionCookie?.value) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname); // 로그인 후 원래 페이지로 복귀
    return NextResponse.redirect(url);
  }

  // ✅ 2) 결제 여부
  const paid = req.cookies.get("paid")?.value === "true";
  if (paid) return NextResponse.next();

  // ✅ 3) 무료 사용 횟수(최대 3회)
  const freeUses = parseInt(req.cookies.get("free_uses")?.value ?? "0", 10);
  if (freeUses >= 3) {
    const url = req.nextUrl.clone();
    url.pathname = "/checkout";
    url.searchParams.set("reason", "free_limit");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// ✅ 보호 경로만 명확히 지정 (홈 /, 로그인 /login, auth 경로 제외)
export const config = {
  matcher: ["/u/:path*"],
};