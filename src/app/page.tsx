// app/page.tsx
import Link from "next/link";
import Image from "next/image";
import Testimonials from "@/components/Testimonials";

const UNIVERSITIES = [
  { name: "가톨릭대", slug: "catholic" },
  { name: "건국대", slug: "konkuk" },
  { name: "경기대", slug: "kyonggi" },
  { name: "경희대", slug: "kyunghee" },
  { name: "고려대", slug: "korea" },
  { name: "광운대", slug: "kw" },
  { name: "단국대", slug: "dankook" },
  { name: "덕성여대", slug: "duksung" },
  { name: "동국대", slug: "dongguk" },
  { name: "동덕여대", slug: "dongduk" },
  { name: "부산대", slug: "pusan" },
  { name: "서강대", slug: "sogang" },
  { name: "서울여대", slug: "swu" },
  { name: "성균관대", slug: "skku" },
  { name: "성신여대", slug: "sungshin" },
  { name: "세종대", slug: "sejong" },
  { name: "숙명여대", slug: "sookmyung" },
  { name: "숭실대", slug: "soongsil" },
  { name: "아주대", slug: "ajou" },
  { name: "이화여대", slug: "ewha" },
  { name: "인하대", slug: "inha" },
  { name: "연세대", slug: "yonsei" },
  { name: "중앙대", slug: "cau" },
  { name: "한국외대", slug: "hufs" },
  { name: "한양대", slug: "hanyang" },
  { name: "홍익대", slug: "hongik" },
  { name: "ALL대", slug: "all" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8 sm:p-16">
      <div className="mx-auto max-w-5xl">
        {/* 로고 */}
        <div className="mb-10 flex flex-col items-center text-center">
          <Image
            src="/logo.png"
            alt="Dr-phyllis 로고"
            width={192}
            height={192}
            priority
            className="mb-3 h-44 sm:h-48 w-auto"
          />
          <p className="mt-2 text-sm sm:text-base opacity-90">
            에어래빗에서 만든 학교별 채점기준 코딩 AI첨삭기
          </p>
        </div>

        {/* 대학 리스트 */}
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          {UNIVERSITIES.map((u) => (
            <li key={u.slug}>
              <Link
                href={`/u/${u.slug}`}
                className="block rounded-lg border border-[var(--line)] bg-[var(--card)] text-[var(--card-foreground)]
                           px-6 py-5 text-center shadow transition hover:opacity-95 hover:border-indigo-400"
              >
                {u.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* 후기 슬라이드 */}
        <Testimonials />

        {/* 푸터 */}
        <footer className="mt-20 border-t border-[var(--line)] pt-8 text-center text-sm">
          <p className="mb-2 opacity-90">“지금 쓰는 한 줄이, 당신의 미래를 만든다.”</p>
          <p className="mb-2 opacity-90">순간의 글을 미래로 이어주는 AI 첨삭.</p>
          <p className="italic text-indigo-500">누구에게나 열려있는 대입논술 이제 편하게 공부하세요.</p>

          {/* 사업자 정보 (심사용) */}
          <div className="mt-6 text-xs leading-5 opacity-70">
            <p>닥터필리스 대입논술AI첨삭</p>
            <p>·사업자명/ 주식회사 에어래빗 AIrabbit Inc.</p>
            <p>·사업자등록번호/ 536-86-03683 ·대표자명/ 주헌영 ·사업장 주소/ 광주광역시 남구 행암도동길 43-11 1층 ·대표번호/ 062-651-0922</p>
          </div>

          <div className="mt-4 text-xs opacity-60">
            © 2025 주식회사 에어래빗 AIrabbit Inc. All Rights Reserved.
          </div>
        </footer>
      </div>
    </main>
  );
}
