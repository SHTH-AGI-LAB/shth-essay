// app/page.tsx
import Link from "next/link";

const UNIVERSITIES = [
  { name: "가톨릭대", slug: "catholic" },
  { name: "건국대", slug: "konkuk" },
  { name: "경기대", slug: "kyonggi" },
  { name: "경희대", slug: "kyunghee" },
  { name: "고려대", slug: "korea" },
  { name: "광운대", slug: "kw" },
  { name: "단국대", slug: "dankook" },
  { name: "부산대", slug: "pusan" },
  { name: "서강대", slug: "sogang" },
  { name: "서울여대", slug: "swu" },
  { name: "성균관대", slug: "skku" },
  { name: "성신여대", slug: "sungshin" },
  { name: "세종대", slug: "sejong" },
  { name: "서울시립대", slug: "uos" },
  { name: "숙명여대", slug: "sookmyung" },
  { name: "숭실대", slug: "soongsil" },
  { name: "아주대", slug: "ajou" },
  { name: "이화여대", slug: "ewha" },
  { name: "연세대", slug: "yonsei" },
  { name: "중앙대", slug: "cau" },
  { name: "한국외대", slug: "hufs" },
  { name: "한양대", slug: "hanyang" },
  { name: "항공대", slug: "kau" },
  { name: "홍익대", slug: "hongik" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8 sm:p-16">
      <div className="mx-auto max-w-5xl">
        {/* 로고 */}
        <div className="mb-10 flex flex-col items-center text-center">
          <img
            src="/logo.png"
            alt="Dr-phyllis 로고"
            className="h-44 sm:h-48 mb-3"
          />
          
          <p className="mt-2 text-gray-700 text-sm sm:text-base">
            대학별 첨삭 가이드, 총평, PDF까지 한 번에
          </p>
        </div>

        {/* 대학 리스트 */}
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {UNIVERSITIES.map((u) => (
            <li key={u.slug}>
              <Link
                href={`/u/${u.slug}`}
                className="block rounded-lg border border-gray-300 bg-white px-6 py-5 text-center
                           shadow hover:shadow-md transition hover:border-indigo-400 hover:bg-indigo-50"
              >
                {u.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}