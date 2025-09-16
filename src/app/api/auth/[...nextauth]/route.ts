import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import NaverProvider from "next-auth/providers/naver";
import KakaoProvider from "next-auth/providers/kakao";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    NaverProvider({
      clientId: process.env.NAVER_CLIENT_ID!,
      clientSecret: process.env.NAVER_CLIENT_SECRET!,
    }),
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
    // ✅ Toss 심사용 테스트 계정 (필요할 때만 발동)
    process.env.REVIEW_MODE === "true" &&
      (CredentialsProvider({
        name: "TestAccount",
        credentials: {
          email: { label: "Email", type: "text" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials: any) {
          if (
            credentials?.email === process.env.TEST_USER_EMAIL &&
            credentials?.password === process.env.TEST_USER_PASSWORD
          ) {
            return { id: "reviewer", name: "Toss Reviewer", email: credentials.email };
          }
          return null;
        },
      }) as any),
  ].filter(Boolean), // 🚨 undefined 방지
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };