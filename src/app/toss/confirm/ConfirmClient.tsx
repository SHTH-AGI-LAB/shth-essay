// src/app/toss/confirm/ConfirmClient.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type ConfirmResponse = {
  ok: boolean;
  plan?: "standard" | "premium" | "vip";
  qty?: number;
  error?: string;
  status?: number;
  tossCode?: string;
  tossMessage?: string;
  echo?: any;
};

export default function ConfirmClient() {
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
        const amountNum = Number(amount);
        if (Number.isNaN(amountNum)) {
          setStatus("fail");
          setMsg("결제 금액이 올바르지 않아요.");
          return;
        }

        const res = await fetch("/api/toss/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentKey, orderId, amount: amountNum }),
        });

        const json = (await res.json()) as ConfirmResponse;

        if (res.ok && json?.ok) {
  setStatus("ok");
  setMsg("결제가 완료되었어요. 이용권이 충전되었습니다.");
} else {
  const lines = [
    json?.error ?? "결제 확인 중 오류가 발생했어요.",
    json?.tossCode ? `code: ${json.tossCode}` : "",
    json?.tossMessage ? `message: ${json.tossMessage}` : "",
    typeof json?.status === "number" ? `status: ${json.status}` : "",
  ].filter(Boolean);
  setStatus("fail");
  setMsg(lines.join("\n"));
}
      } catch (e: unknown) {
        const message =
          e instanceof Error
            ? e.message
            : typeof e === "string"
            ? e
            : "네트워크 오류가 발생했어요.";
        setStatus("fail");
        setMsg(message);
      }
    };

    run();
  }, [paymentKey, orderId, amount]);

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-xl font-bold">결제 확인</h1>

      {status === "pending" && <p className="text-gray-600">{msg}</p>}

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