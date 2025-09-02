"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import AssessClient from "@/components/AssessClient";
import { UNIVERSITIES } from "@/data/universities";

export default function UniversityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { data: session, status } = useSession();
  const { slug } = use(params);

  const uni = UNIVERSITIES.find((u) => u.slug === slug);

  if (!uni) return notFound();

  if (status === "loading") {
    return <p className="p-6">로그인 상태 확인 중...</p>;
  }

  if (!session) {
    return (
      <main className="max-w-3xl mx-auto p-8 text-center">
        <h1 className="text-xl font-bold mb-4">{uni.name} 채점</h1>
        <p className="text-gray-600 mb-4">
          채점기를 사용하려면 로그인이 필요합니다.
        </p>
        <Link
          href={`/login?redirect=/u/${slug}`}
          className="px-4 py-2 border rounded bg-blue-500 text-white hover:bg-blue-600"
        >
          로그인하러 가기
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">{uni.name} 채점</h1>
      <p className="text-gray-600 mb-4">
        {uni.gradingType} · {uni.scale}점 만점 기준
      </p>
      <AssessClient
        slug={slug}
        data={{
          gradingScale: [], // TODO: 기본 스케일 함수 연결 가능
          criteria: Object.fromEntries(
            Object.entries(uni.criteria).map(([k, v]) => [k, v.weight])
          ),
          scale: uni.scale,
          problemWeights: { "1": 50, "2": 50 },
        }}
      />
    </main>
  );
}