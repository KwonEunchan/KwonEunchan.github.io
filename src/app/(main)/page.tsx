// src/app/(main)/page.tsx
import { Suspense } from "react";
import { getSortedPostsData } from "@/lib/posts";
import PostSection from "@/components/sections/PostSection";

export default function Home() {
  const posts = getSortedPostsData();
  
  return (
    <div className="w-full pb-12">
      <Suspense fallback={<div className="p-12 text-center text-slate-400 font-bold tracking-tight">블로그 글을 불러오는 중입니다...</div>}>
        <PostSection initialPosts={posts} />
      </Suspense>
    </div>
  );
}