"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const sp = useSearchParams();

  const paymentType = sp.get("paymentType") ?? undefined;
  const orderId     = sp.get("orderId")     ?? undefined;
  const paymentKey  = sp.get("paymentKey")  ?? undefined;
  const amountStr   = sp.get("amount")      ?? undefined;

  const [status, setStatus] = useState<"idle"|"confirming"|"ok"|"error">("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!paymentKey || !orderId || !amountStr) return;

    const amountNum = Number(amountStr);
    if (!Number.isFinite(amountNum)) return;

    const dedupKey = `confirmed:${orderId}`;
    if (sessionStorage.getItem(dedupKey)) return;

    (async () => {
      try {
        setStatus("confirming");
        const res = await fetch("/api/toss/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentKey, orderId, amount: amountNum }),
        });
        const data = await res.json();

        if (!res.ok || data.ok === false) {
          setStatus("error");
          setMessage(data?.error?.message ?? "승인에 실패했습니다.");
          return;
        }

        sessionStorage.setItem(dedupKey, "1");
        setStatus("ok");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "네트워크 오류";
        setStatus("error");
        setMessage(msg);
      }
    })();
  }, [paymentKey, orderId, amountStr]);

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">결제 성공</h1>

      <ul className="space-y-1 text-sm">
        <li>paymentType: {paymentType}</li>
        <li>orderId: {orderId}</li>
        <li>paymentKey: {paymentKey}</li>
        <li>amount: {amountStr}</li>
      </ul>

      <div className="mt-4 text-sm">
        {status === "confirming" && <p>결제 승인 중입니다…</p>}
        {status === "ok" && <p className="text-green-600">승인 완료! 이제 첨삭을 이용할 수 있어요 ✨</p>}
        {status === "error" && <p className="text-red-600">승인 실패: {message}</p>}
      </div>

      <p className="mt-4 text-gray-500">※ 이 화면을 캡처해서 PPT에 넣어주세요.</p>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<main className="max-w-xl mx-auto p-6">로딩 중…</main>}>
      <SuccessContent />
    </Suspense>
  );
}