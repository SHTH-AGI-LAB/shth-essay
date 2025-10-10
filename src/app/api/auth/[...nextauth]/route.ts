import NextAuth, { type NextAuthOptions } from "next-auth"; 
import GoogleProvider from "next-auth/providers/google";
import NaverProvider from "next-auth/providers/naver";
import KakaoProvider from "next-auth/providers/kakao";

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

  // 1) App Router에선 jwt 전략을 권장
  session: { strategy: "jwt" },

  // 2) 최초 로그인 때 토큰에 이메일을 확실히 심고,
  //    클라이언트로 넘어가는 session.user.email에 실어준다.
  callbacks: {
    async jwt({ token, user, account }) {
      // 첫 로그인 시
      if (user?.email) token.email = user.email;
      // (필요하면) provider 정보나 access_token도 실을 수 있어요
      if (account?.provider) (token as any).provider = account.provider;
      if (account?.access_token) (token as any).accessToken = account.access_token;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.email) {
        session.user.email = token.email as string;
      }
      // (선택) 클라이언트에서 필요하면 accessToken도 노출
      if ((token as any).accessToken) (session as any).accessToken = (token as any).accessToken;
      return session;
    },
  },

  // NextAuth 암호
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };