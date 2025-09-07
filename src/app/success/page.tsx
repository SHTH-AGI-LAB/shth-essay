"use client";
import { useEffect, useState } from "react";

type SuccessSearchParams = {
  paymentKey?: string;
  orderId?: string;
  amount?: string;
};

export default function SuccessPage({
  searchParams,
}: {
  searchParams: SuccessSearchParams;
}) {
  const { paymentKey, orderId, amount } = searchParams;
  const [msg, setMsg] = useState("확인 중...");

  useEffect(() => {
    const confirm = async () => {
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

        const data = (await res.json()) as { ok?: boolean; message?: string };
        if (!res.ok) throw new Error(data.message || "결제 확인 실패");
        setMsg("결제가 정상적으로 완료되었습니다.");
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "알 수 없는 오류";
        setMsg(`오류: ${message}`);
      }
    };

    if (paymentKey && orderId && amount) {
      confirm();
    }
  }, [paymentKey, orderId, amount]);

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-xl font-bold mb-4">결제 결과</h1>
      <p>{msg}</p>
      <div className="mt-4 text-sm text-gray-600">
        <div>orderId: {orderId}</div>
        <div>amount: {amount}</div>
      </div>
    </main>
  );
}