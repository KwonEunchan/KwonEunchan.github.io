"use client"; // 클라이언트 컴포넌트로 지정

import dynamic from "next/dynamic";

const BlogCanvas = dynamic(() => import("@/features/canvas/BlogCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-slate-900 text-white">
      Loading 3D World...
    </div>
  ),
});

export default function ClientCanvas() {
  return <BlogCanvas />;
}