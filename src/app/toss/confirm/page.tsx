"use client";

import { Suspense } from "react";
import ConfirmClient from "./ConfirmClient";
import Head from "next/head";

// 프리렌더 대신 런타임에서 처리 (SSR/CSR)
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <>
      <Head>
        {/* Google Ads 전환 추적 코드 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17631027936"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-17631027936');
            `,
          }}
        />
      </Head>

      <Suspense
        fallback={
          <main className="mx-auto max-w-xl p-6">
            <p className="text-gray-600">결제 정보를 불러오는 중…</p>
          </main>
        }
      >
        <ConfirmClient />
      </Suspense>
    </>
  );
}