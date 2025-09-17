type FailParams = {
  code?: string;
  message?: string;
  orderId?: string;
};

export default function FailPage({ searchParams }: { searchParams?: FailParams }) {
  const { code, message, orderId } = searchParams || {};

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">결제 실패</h1>
      <ul className="space-y-1 text-sm">
        <li>code: {code}</li>
        <li>message: {message}</li>
        <li>orderId: {orderId}</li>
      </ul>
      <p className="mt-4 text-gray-500">※ 이 화면도 캡처해서 PPT에 넣어주세요.</p>
    </main>
  );
}
