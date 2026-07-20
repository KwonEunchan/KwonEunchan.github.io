"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Search, Lightbulb, Check, X, SquarePen, AlertCircle } from "lucide-react";
import { CATEGORIES } from "@/constants/categories";

interface CategoryBarProps {
  isTroubleShootingOnly: boolean;
  onToggleTroubleShooting: (isOnly: boolean) => void;
  activeCategories: string[];
  onCategoryClick: (category: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function CategoryBar({ 
  isTroubleShootingOnly, 
  onToggleTroubleShooting, 
  activeCategories, 
  onCategoryClick,
  searchTerm,
  onSearchChange
}: CategoryBarProps) {
  
  const navRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClearSearch = () => {
    onSearchChange("");
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const masterTargetCode = process.env.NEXT_PUBLIC_BLOG_AUTH_CODE;

    if (authCode === masterTargetCode) {
      setIsAuthModalOpen(false);
      setAuthCode("");
      router.push("/write");
    } else {
      alert("인증번호가 일치하지 않습니다.");
    }
  };

  return (
    <aside className="w-full md:w-[240px] flex-shrink-0">
      <div className="mb-3 relative group">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="제목 또는 내용 검색"
          className="w-full pl-10 pr-10 py-3 text-xs bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-blue-400 focus:bg-white transition-all placeholder:text-gray-400 text-gray-800 shadow-sm font-bold"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
        
        {searchTerm && (
          <button 
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-all cursor-pointer"
          >
            <X className="w-3 h-3 stroke-[3]" />
          </button>
        )}
      </div>

      <div className="mb-6 md:mb-8 space-y-2">
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-900 text-white text-xs font-bold transition-all hover:bg-black cursor-pointer shadow-md active:scale-[0.98]"
        >
          <SquarePen className="w-4 h-4" />
          <span>새 포스트 작성하기</span>
        </button>

        <button
          onClick={() => onToggleTroubleShooting(!isTroubleShootingOnly)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-bold transition-all duration-250 cursor-pointer ${
            isTroubleShootingOnly
              ? "bg-blue-50/60 border-blue-200 text-blue-700 shadow-sm"
              : "bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100/70 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <Lightbulb className={`w-4 h-4 ${isTroubleShootingOnly ? "text-blue-600" : "text-gray-400"}`} />
            <span>트러블 슈팅만 보기</span>
          </div>
          <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
            isTroubleShootingOnly ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 text-transparent"
          }`}>
            <Check className="w-2.5 h-2.5 stroke-[4]" />
          </div>
        </button>
      </div>

      <div className="text-xs font-bold text-gray-900 mb-3 px-3 tracking-wider uppercase">
        카테고리
      </div>

      <nav 
        ref={navRef}
        className="flex flex-row md:flex-col gap-0.5 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 scrollbar-none whitespace-nowrap md:whitespace-normal px-0 scroll-smooth"
      >
        {CATEGORIES.map((category) => {
          const isActive = activeCategories.includes(category);
          return (
            <button
              key={category}
              onClick={() => onCategoryClick(category)}
              className={`text-left px-3 py-2 rounded-md text-xs font-bold transition-all duration-150 inline-block md:block flex-shrink-0 cursor-pointer ${
                isActive
                  ? "bg-blue-50/80 text-blue-700 font-black"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {category}
            </button>
          );
        })}
      </nav>

      {isAuthModalOpen && mounted && createPortal(
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[999999] p-4">
          <div className="bg-white rounded-2xl p-7 w-full max-w-sm shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100/80">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-[15px] font-black text-gray-900 tracking-tight">관리자 인증</h3>
                <p className="text-[11px] text-gray-400 font-semibold mt-0.5">게시물 작성을 위해서는 권한이 필요합니다.</p>
              </div>
              <button 
                onClick={() => { setIsAuthModalOpen(false); setAuthCode(""); }}
                className="text-gray-400 hover:text-gray-700 hover:bg-gray-50 p-1.5 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <input
                type="password"
                placeholder="패스워드를 입력하세요"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 tracking-widest text-center font-bold transition-all bg-gray-50/50 focus:bg-white text-gray-800"
                autoFocus
              />
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <p className="text-[11px] text-gray-400 font-medium leading-none">게시물 작성은 관리자 전용입니다.</p>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gray-900 hover:bg-black text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-md active:scale-[0.98]"
              >
                인 증
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </aside>
  );
}