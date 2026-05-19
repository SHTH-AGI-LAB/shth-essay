export default function CustomerPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-10 text-3xl font-bold text-center">
          고객안내
        </h1>

        <div className="space-y-4">

          <a
            href="/refund"
            className="block rounded-2xl border p-6 text-lg font-medium hover:bg-gray-50 transition"
          >
            환불정책
          </a>

          <a
            href="/terms"
            className="block rounded-2xl border p-6 text-lg font-medium hover:bg-gray-50 transition"
          >
            이용약관
          </a>

          <a
            href="/privacy"
            className="block rounded-2xl border p-6 text-lg font-medium hover:bg-gray-50 transition"
          >
            개인정보처리방침
          </a>

        </div>
      </div>
    </main>
  );
}