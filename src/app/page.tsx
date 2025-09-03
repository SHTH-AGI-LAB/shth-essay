// app/page.tsx
import Link from "next/link";
import Testimonials from "@/components/Testimonials";

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
  { name: "숙명여대", slug: "sookmyung" },
  { name: "숭실대", slug: "soongsil" },
  { name: "아주대", slug: "ajou" },
  { name: "이화여대", slug: "ewha" },
  { name: "연세대", slug: "yonsei" },
  { name: "중앙대", slug: "cau" },
  { name: "한국외대", slug: "hufs" },
  { name: "한양대", slug: "hanyang" },
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
            논술 1타강사, 직접 학교별 문제유형과 채점기준까지 반영 🖋️ PDF까지 한번에
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

        {/* 후기 슬라이드 */}
        <Testimonials />

        {/* 푸터 */}
        <footer className="mt-20 border-t pt-8 text-center text-gray-600 text-sm">
          <p className="mb-2">
            “지금 쓰는 한 줄이, 당신의 미래를 만든다.”
          </p>
          <p className="mb-2">
            순간의 글을 미래로 이어주는 AI 첨삭.
          </p>
          <p className="italic text-indigo-500">
            논술은 입시의 '희망'입니다, 이제 첨삭은 누구에게나 열려있습니다  
          </p>
          <div className="mt-4 text-xs text-gray-400">
            © 2025 시하·태하 AGI 연구소. All Rights Reserved.
          </div>
        </footer>
      </div>
    </main>
  );
}