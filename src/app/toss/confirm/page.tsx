// src/app/toss/confirm/page.tsx
import Link from "next/link";

type Props = {
  searchParams: {
    paymentKey?: string;
    orderId?: string;
    amount?: string;
  };
};

export default function TossConfirmPage({ searchParams }: Props) {
  const paymentKey = searchParams.paymentKey ?? "";
  const orderId = searchParams.orderId ?? "";
  const amount = searchParams.amount ?? "";

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">결제 확인 중…</h1>

      {!paymentKey || !orderId || !amount ? (
        <ErrorBox title="필수 정보 누락">
          결제 확인에 필요한 매개변수가 없어요.
          <div className="mt-4">
            <Link href="/" className="text-blue-600 underline">홈으로</Link>
          </div>
        </ErrorBox>
      ) : (
        <ConfirmClient paymentKey={paymentKey} orderId={orderId} amount={amount} />
      )}
    </main>
  );
}

/* ---------- Client side fetcher ---------- */
"use client";

import { useEffect, useState } from "react";

function ConfirmClient(props: { paymentKey: string; orderId: string; amount: string }) {
  const { paymentKey, orderId, amount } = props;
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setStatus("loading");
        const res = await fetch("/api/toss/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentKey, orderId, amount }),
        });

        const json = await res.json().catch(() => ({}));
        if (!mounted) return;

        if (res.ok && json?.success) {
          setStatus("success");
          setMessage("결제가 정상적으로 완료되었고 이용권이 충전되었습니다.");
        } else {
          setStatus("error");
          setMessage(json?.error ?? "결제 확인 처리 중 오류가 발생했습니다.");
        }
      } catch (err: any) {
        if (!mounted) return;
        setStatus("error");
        setMessage(err?.message ?? "네트워크 오류가 발생했습니다.");
      }
    })();

    return () => { mounted = false; };
  }, [paymentKey, orderId, amount]);

  if (status === "loading" || status === "idle") {
    return <InfoBox>결제 내역을 확인하고 있어요… 잠시만요.</InfoBox>;
  }

  if (status === "success") {
    return (
      <SuccessBox title="결제 완료">
        {message}
        <div className="mt-4 flex gap-3">
          <Link href="/" className="px-3 py-1.5 rounded bg-blue-600 text-white">홈으로</Link>
        </div>
      </SuccessBox>
    );
  }

  return (
    <ErrorBox title="결제 확인 실패">
      {message || "결제 확인에 실패했어요."}
      <div className="mt-4">
        <Link href="/" className="text-blue-600 underline">홈으로</Link>
      </div>
    </ErrorBox>
  );
}

/* ---------- 작은 UI 박스들 ---------- */
function InfoBox({ children }: { children: React.ReactNode }) {
  return <div className="rounded border p-4 bg-blue-50 text-blue-800">{children}</div>;
}
function SuccessBox({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded border p-4 bg-green-50 text-green-800">
      <div className="font-semibold mb-2">{title}</div>
      {children}
    </div>
  );
}
function ErrorBox({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded border p-4 bg-red-50 text-red-800">
      <div className="font-semibold mb-2">{title}</div>
      {children}
    </div>
  );
}