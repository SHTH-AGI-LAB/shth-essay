// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header";
import PromoPopup from "@/components/PromoPopup"; // ✅ [추가] 팝업 컴포넌트 불러오기

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dr-phyllis",
  description: "AI 논술 첨삭 서비스",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          <PromoPopup /> {/* ✅ [추가] 헤더 아래에 팝업 삽입 */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}