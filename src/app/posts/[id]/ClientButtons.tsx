"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Share2, Edit3 } from "lucide-react";
import { Post } from "@/components/elements/PostCard";
import AuthModal from "@/components/elements/AuthModal";

export default function ClientButtons({ post }: { post: Post }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      alert("포스트 주소가 복사되었습니다!");
    }
  };

  const handleVerify = (code: string) => {
    if (code === process.env.NEXT_PUBLIC_BLOG_AUTH_CODE) {
      sessionStorage.setItem("editPostData", JSON.stringify(post));
      router.push(`/write?edit=${post.id}`);
    } else {
      alert("인증 코드가 일치하지 않습니다.");
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button 
          type="button"
          onClick={handleShare}
          className="w-8 h-8 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
          title="주소 공유하기"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
        <button 
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
        >
          <Edit3 className="w-3 h-3" /> 수정하기
        </button>
      </div>

      {/* 모달 추가 */}
      <AuthModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onVerify={handleVerify} 
      />
    </>
  );
}