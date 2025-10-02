"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type SuccessParams = {
  paymentType?: string;
  orderId?: string;
  paymentKey?: string;
  amount?: string;
};

export default function SuccessPage() {
  const sp = useSearchParams();
  const router = useRouter();

  const paymentType = sp.get("paymentType") ?? undefined;
  const orderId     = sp.get("orderId")     ?? undefined;
  const paymentKey  = sp.get("paymentKey")  ?? undefined;
  const amount      = sp.get("amount")      ?? undefined;

  const [status, setStatus] = useState<"idle"|"confirming"|"ok"|"error">("idle");
  const [message, setMessage] = useState("");

  // ✅ 성공 페이지에 진입하면 1회만 승인(confirm) 호출
  useEffect(() => {
    if (!paymentKey || !orderId || !amount) return;

    // 같은 주문 중복 승인 방지(새로고침 등)
    const dedupKey = `confirmed:${orderId}`;
    if (sessionStorage.getItem(dedupKey)) return;

    (async () => {
      try {
        setStatus("confirming");
        const res = await fetch("/api/toss/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentKey, orderId, amount }),
        });
        const data = await res.json();

        if (!res.ok || data?.ok === false) {
          setStatus("error");
          setMessage(data?.error?.message ?? "승인에 실패했습니다.");
          return;
        }

        // 서버에서 paid 쿠키 세팅 성공
        sessionStorage.setItem(dedupKey, "1");
        setStatus("ok");
      } catch (e: any) {
        setStatus("error");
        setMessage(e?.message ?? "네트워크 오류");
      }
    })();
  }, [paymentKey, orderId, amount]);

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-2">결제 성공</h1>

      <ul className="space-y-1 text-sm">
        <li>paymentType: {paymentType}</li>
        <li>orderId: {orderId}</li>
        <li>paymentKey: {paymentKey}</li>
        <li>amount: {amount}</li>
      </ul>

      <div className="mt-4 text-sm">
        {status === "confirming" && <p>결제 승인 중입니다…</p>}
        {status === "ok" && <p className="text-green-600">승인이 완료되었습니다. 이제 첨삭을 이용할 수 있어요!</p>}
        {status === "error" && (
          <p className="text-red-600">
            승인 실패: {message} <br />
            문제가 지속되면 문의해주세요.
          </p>
        )}
      </div>
    </main>
  );
} 