// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions, type Session } from "next-auth";
import { type JWT } from "next-auth/jwt";

import GoogleProvider from "next-auth/providers/google";
import NaverProvider from "next-auth/providers/naver";
import KakaoProvider from "next-auth/providers/kakao";

/**
 * NOTE:
 * - 콜백 파라미터에 명시적 타입(Session, JWT)을 지정해서
 *   no-explicit-any 에러를 없앰.
 * - 세션에 email을 확실히 넣어 클라이언트에서 사용 가능하게 함.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    NaverProvider({
      clientId: process.env.NAVER_CLIENT_ID ?? "",
      clientSecret: process.env.NAVER_CLIENT_SECRET ?? "",
    }),
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID ?? "",
      clientSecret: process.env.KAKAO_CLIENT_SECRET ?? "",
    }),
  ],

  callbacks: {
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }): Promise<Session> {
      if (session.user && typeof token.email === "string") {
        // next-auth 기본 타입 정의에 email이 선택 속성이라 안전하게 대입
        session.user.email = token.email;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

// Next.js App Router handler
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };