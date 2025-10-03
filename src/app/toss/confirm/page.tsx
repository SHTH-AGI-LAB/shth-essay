// src/app/toss/confirm/page.tsx
import { Suspense } from "react";
import ConfirmClient from "./ConfirmClient";

// 프리렌더 대신 런타임에서 처리 (SSR/CSR)
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-xl p-6">
          <p className="text-gray-600">결제 정보를 불러오는 중…</p>
        </main>
      }
    >
      <ConfirmClient />
    </Suspense>
  );
}