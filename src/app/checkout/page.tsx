// app/checkout/page.tsx
"use client";

export default function CheckoutPage() {
  function mockPay() {
    document.cookie = `paid=true; path=/; max-age=31536000; samesite=lax`;
    alert("✅ 결제 완료 처리! 이제 무제한 사용 가능합니다.");
    window.location.href = "/";
  }

  return (
    <main className="max-w-lg mx-auto p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">결제 필요</h1>
      <p className="mb-6 text-gray-600">
        무료 3회 체험이 끝났습니다. 계속 이용하시려면 결제가 필요합니다.
      </p>
      <button
        onClick={mockPay}
        className="px-6 py-3 bg-blue-500 text-white font-bold rounded hover:bg-blue-600"
      >
        (임시) 결제 완료 처리
      </button>
    </main>
  );
}
