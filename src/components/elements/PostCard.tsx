"use client";

import { useState } from "react";
import Image from "next/image";
import { Wrench } from "lucide-react";

export interface Post {
  id: number | string;
  title: string;
  description?: string; // (기존 코드 호환성 유지)
  summary?: string;     // 💡 작성 화면에서 넘겨주는 요약본 필드 추가
  content?: string;     // 💡 요약본이 없을 때 본문을 파싱하기 위해 추가
  date: string;
  categories: string[];
  skills: string[];
  isTroubleShooting?: boolean;
  thumbnail?: string | null;
}

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [imgError, setImgError] = useState(false);
  const previewText = post.summary 
    ? post.summary 
    : post.description 
      ? post.description 
      : post.content 
        ? post.content.replace(/<[^>]+>/g, '').substring(0, 150) + '...'
        : '요약이 없습니다.';

  return (
    <div className="flex justify-between gap-6 pb-8 border-b border-gray-100 group cursor-pointer">
      <div className="flex-1 min-w-0">
        
        {/* 제목 */}
        <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 group-hover:text-sky-600 transition-colors">
          {post.title}
        </h3>
        
        <p className="text-xs md:text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
          {previewText}
        </p>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400 font-medium">
          {/* 날짜 */}
          <span>{post.date}</span>
          
          <span className="text-gray-300">|</span>
          
          <div className="flex items-center text-sky-600">
            {post.categories && post.categories.length > 0 ? (
              post.categories.map((cat, idx) => (
                <span key={cat}>
                  {cat}
                  {idx < post.categories.length - 1 && <span className="text-gray-400 mx-1">·</span>}
                </span>
              ))
            ) : (
              <span>Uncategorized</span>
            )}
          </div>

          {post.isTroubleShooting && (
            <>
              <span className="text-gray-300">|</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-600 font-bold rounded-md">
                <Wrench className="w-3 h-3" /> Solved
              </span>
            </>
          )}
        </div>
      </div>
      
      <div className="hidden md:flex w-[140px] h-[85px] md:w-[160px] md:h-[100px] bg-gray-50 border border-gray-100 rounded-lg flex-shrink-0 items-center justify-center text-xs text-gray-400 font-medium overflow-hidden relative">
        {post.thumbnail && !imgError ? (
          <Image
            src={post.thumbnail}
            alt={`${post.title} thumbnail`}
            fill
            sizes="(max-width: 768px) 140px, 160px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <span>Thumbnail</span>
        )}
      </div>
    </div>
  );
}