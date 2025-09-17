type SuccessParams = {
  paymentType?: string;
  orderId?: string;
  paymentKey?: string;
  amount?: string;
};

export default function SuccessPage({ searchParams }: { searchParams?: SuccessParams }) {
  const { paymentType, orderId, paymentKey, amount } = searchParams || {};

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">결제 성공</h1>
      <ul className="space-y-1 text-sm">
        <li>paymentType: {paymentType}</li>
        <li>orderId: {orderId}</li>
        <li>paymentKey: {paymentKey}</li>
        <li>amount: {amount}</li>
      </ul>
      <p className="mt-4 text-gray-500">※ 이 화면을 캡처해서 PPT에 넣어주세요.</p>
    </main>
  );
}
