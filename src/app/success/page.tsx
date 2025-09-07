"use client";
import { useEffect, useState } from "react";

export default function SuccessPage({ searchParams }: any) {
  const { paymentKey, orderId, amount } = searchParams;
  const [msg, setMsg] = useState("확인 중...");

  useEffect(() => {
    const confirm = async () => {
      try {
        const res = await fetch("/api/toss/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "결제 확인 실패");
        setMsg("결제가 정상적으로 완료되었습니다.");
        // TODO: 쿠키에 paid=true 설정 등 후처리
      } catch (e: any) {
        setMsg(`오류: ${e.message}`);
      }
    };
    if (paymentKey && orderId && amount) confirm();
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