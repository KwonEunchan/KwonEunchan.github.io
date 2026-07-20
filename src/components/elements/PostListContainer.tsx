// src/components/PostListContainer.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PostCard, { Post } from "@/components/elements/PostCard";
import Pagination from "@/components/elements/Pagination";

interface PostListContainerProps {
  allPosts: Post[];
  postsPerPage: number;
}

export default function PostListContainer({ allPosts, postsPerPage }: PostListContainerProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // 페이지 변경 시 최상단으로 스크롤 이동
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // 상위에서 필터링된 allPosts가 변경되면 첫 페이지로 리셋 (선택 사항)
  useEffect(() => {
    setCurrentPage(1);
  }, [allPosts]);

  // 페이지네이션 계산 로직
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = allPosts.slice(indexOfFirstPost, indexOfLastPost);

  // 데이터가 없는 경우 처리
  if (allPosts.length === 0) {
    return (
      <div className="text-center py-24 text-gray-400 italic text-sm">
        조건에 맞는 포스트가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* 포스트 리스트 영역 */}
      <div className="space-y-12">
        {currentPosts.map((post) => (
          <Link 
            href={`/posts/${post.id}`} 
            key={post.id} 
            className="block transition-transform duration-200"
          >
            <PostCard post={post} />
          </Link>
        ))}
      </div>

      {/* 페이지네이션 영역 */}
      {allPosts.length > postsPerPage && (
        <Pagination
          totalItems={allPosts.length}
          itemsPerPage={postsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}