// app/page.tsx
import Link from "next/link";
import Image from "next/image";
import Testimonials from "@/components/Testimonials";
import PayButton from "@/components/PayButton";
 
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
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8 sm:p-16">
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
          <p className="mt-2 text-gray-700 text-sm sm:text-base">
            대입논술 첨삭 채점 총평 PDF 인쇄까지
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

        {/* 테스트 상품 (토스 심사용) */}
        <section className="mt-20 max-w-2xl mx-auto rounded-lg bg-white shadow p-8 text-center border border-indigo-300">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-indigo-600">
            대입논술 AI 첨삭 1회권 (테스트용)
          </h2>
          <p className="text-gray-600 mb-6">
            본 상품은 토스페이먼츠 입점 심사를 위한 테스트 상품입니다.<br />
            실제 결제가 이루어지지 않습니다.
          </p>

          {/* 가격 표시 */}
          <div className="text-lg font-semibold text-indigo-600 mb-6">
            1,000원
          </div>

          {/* 결제 버튼 */}
          <PayButton
            amount={1000}
            orderName="대입논술 AI 첨삭 1회권 (테스트)"
          />
        </section>

        {/* 푸터 */}
        <footer className="mt-20 border-t pt-8 text-center text-gray-600 text-sm">
          <p className="mb-2">
            “지금 쓰는 한 줄이, 당신의 미래를 만든다.”
          </p>
          <p className="mb-2">
            순간의 글을 미래로 이어주는 AI 첨삭.
          </p>
          <p className="italic text-indigo-500">
            누구에게나 열려있는 대입논술 이제 편하게 공부하세요.
          </p>

          {/* 사업자 정보 (심사용) */}
          <div className="mt-6 text-xs text-gray-500 leading-5">
            <p>상호명: 닥터필리스</p>
            <p>사업자등록번호: 159-91-00334</p>
            <p>대표자명: 김명화</p>
            <p>사업장 주소: 광주광역시 남구 행암도동길 43-11</p>
            <p>대표번호: 062-651-0922 / 010-2734-5261</p>
          </div>

          <div className="mt-4 text-xs text-gray-400">
            © 2025 Dr-Phyllis. All Rights Reserved.
          </div>
        </footer>
      </div>
    </main>
  );
}
