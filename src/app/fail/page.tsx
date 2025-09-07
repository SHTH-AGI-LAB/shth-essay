type FailSearchParams = {
  message?: string;
};

export default function FailPage({
  searchParams,
}: {
  searchParams?: FailSearchParams;
}) {
  const reason = searchParams?.message ?? "사용자 취소/오류";

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-xl font-bold mb-4">결제 실패</h1>
      <p className="mb-2">사유: {reason}</p>
      <p className="text-sm text-gray-600">다시 시도해 주세요.</p>
    </main>
  );
}