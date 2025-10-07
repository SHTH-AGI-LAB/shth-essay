"use client";
import React from "react";

type Props = {
  open: boolean;
  message?: string;
  sub?: string;
};

export default function LoadingPopup({ open, message, sub }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55"
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-[92%] max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        {/* 닫기 불가: 결제/채점 중 중복 액션 방지 */}
        <div className="mx-auto mb-4 h-12 w-12">
          {/* 심플 스피너 */}
          <svg
            className="h-12 w-12 animate-spin"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-20"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-90"
              d="M22 12a10 10 0 0 1-10 10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h3 className="mb-1 text-center text-lg font-semibold text-gray-900">
          {message ?? "처리 중입니다…"}
        </h3>
        <p className="text-center text-xs text-gray-500">
          {sub ?? "창을 닫지 말고 잠시만 기다려 주세요 (약 10–25초)"} 
        </p>

        {/* 파동 라인 */}
        <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-indigo-100">
          <div className="h-full w-1/2 animate-[wave_1.6s_ease-in-out_infinite] bg-indigo-500" />
        </div>

        <style jsx>{`
          @keyframes wave {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(25%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    </div>
  );
}