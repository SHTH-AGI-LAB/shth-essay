// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header";
import InAppBrowserNotice from "@/components/InAppBrowserNotice";

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
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          <InAppBrowserNotice />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}