// src/app/toss/confirm/page.tsx
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function TossConfirmPage() {
  const params = useSearchParams();
  const paymentKey = params.get("paymentKey");
  const orderId = params.get("orderId");
  const amount = params.get("amount");

  const [status, setStatus] = useState<"pending" | "ok" | "fail">("pending");
  const [msg, setMsg] = useState<string>("결제 확인 중…");

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setStatus("fail");
      setMsg("필수 파라미터가 누락되었어요.");
      return;
    }

    const run = async () => {
      try {
        const res = await fetch("/api/toss/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
          }),
        });

        const json = await res.json();

        if (res.ok && json?.success) {
          setStatus("ok");
          setMsg("결제가 완료되었어요. 이용권이 충전되었습니다.");
        } else {
          setStatus("fail");
          setMsg(json?.error ?? "결제 확인 중 오류가 발생했어요.");
        }
      } catch (e: any) {
        setStatus("fail");
        setMsg(e?.message ?? "네트워크 오류가 발생했어요.");
      }
    };

    run();
  }, [paymentKey, orderId, amount]);

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">결제 확인</h1>

      {status === "pending" && (
        <p className="text-gray-600">{msg}</p>
      )}

      {status === "ok" && (
        <div className="rounded border border-green-200 bg-green-50 p-4">
          <p className="font-medium text-green-700">{msg}</p>
          <Link href="/" className="mt-4 inline-block text-blue-600 underline">
            홈으로 가기
          </Link>
        </div>
      )}

      {status === "fail" && (
        <div className="rounded border border-red-200 bg-red-50 p-4">
          <p className="font-medium text-red-700">{msg}</p>
          <Link href="/payment" className="mt-4 inline-block text-blue-600 underline">
            결제 다시 시도하기
          </Link>
        </div>
      )}
    </main>
  );
}