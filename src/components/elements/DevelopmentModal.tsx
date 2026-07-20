"use client";

import { useRouter } from "next/navigation";

export default function DevelopmentModal({ isOpen }: { isOpen: boolean }) {
  const router = useRouter();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white border border-gray-200 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">개발 중인 페이지입니다</h2>
        <p className="text-gray-600 mb-8">준비가 완료되면 다시 방문해주세요!</p>
        <button 
          onClick={() => router.back()}
          className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition shadow-lg"
        >
          확인
        </button>
      </div>
    </div>
  );
}