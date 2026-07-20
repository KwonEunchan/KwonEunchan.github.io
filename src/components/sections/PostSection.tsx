"use client";

import { useState, useMemo, Suspense } from "react";
import { Post } from "@/components/elements/PostCard";
import CategoryBar from "@/components/elements/CategoryBar";
import PostListContainer from "@/components/elements/PostListContainer";

function PostSectionContent({ initialPosts }: { initialPosts: Post[] }) {
  const [isTroubleShootingOnly, setIsTroubleShootingOnly] = useState(false);
  const [activeCategories, setActiveCategories] = useState<string[]>(["전체"]);
  
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      const matchesTroubleshooting = !isTroubleShootingOnly || post.isTroubleShooting === true;
      const matchesCategory = 
        activeCategories.includes("전체") || 
        post.categories.some((cat) => activeCategories.includes(cat));

      const lowerSearchTerm = searchTerm.toLowerCase();
      const matchesSearch = 
        searchTerm === "" || 
        post.title.toLowerCase().includes(lowerSearchTerm) ||
        (post.summary && post.summary.toLowerCase().includes(lowerSearchTerm)) ||
        (post.content && post.content.toLowerCase().includes(lowerSearchTerm));

      return matchesTroubleshooting && matchesCategory && matchesSearch;
    });
  }, [initialPosts, isTroubleShootingOnly, activeCategories, searchTerm]); 

  const handleCategoryClick = (category: string) => {
    setActiveCategories((prev) => {
      if (category === "전체") return ["전체"];
      const next = prev.includes("전체") ? [] : [...prev];
      if (next.includes(category)) {
        const updated = next.filter((c) => c !== category);
        return updated.length === 0 ? ["전체"] : updated;
      }
      return [...next, category];
    });
  };

  return (
    <div className="flex flex-col md:grid md:grid-cols-12 gap-6 lg:gap-8 items-start">
      <div className="w-full order-1 md:order-1 md:col-span-4 lg:col-span-3 md:sticky md:top-28">
        <CategoryBar 
          isTroubleShootingOnly={isTroubleShootingOnly}
          onToggleTroubleShooting={setIsTroubleShootingOnly}
          activeCategories={activeCategories}
          onCategoryClick={handleCategoryClick}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>

      <div className="w-full order-2 md:order-2 space-y-6 md:col-span-8 lg:col-span-9">
        <PostListContainer allPosts={filteredPosts} postsPerPage={15} />
      </div>
    </div>
  );
}

export default function PostSection({ initialPosts }: { initialPosts: Post[] }) {
  return (
    <Suspense fallback={<div className="w-full p-12 text-center text-slate-400 font-bold">블로그 데이터를 불러오는 중입니다...</div>}>
      <PostSectionContent initialPosts={initialPosts} />
    </Suspense>
  );
}