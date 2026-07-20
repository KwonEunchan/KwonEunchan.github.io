"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation"; 
import { User, X, AlertCircle, SquarePen } from "lucide-react";

export default function ResumeCard() {
  const router = useRouter(); 
  const [careerTitleText, setCareerTitleText] = useState("3년 차 엔지니어");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const startDate = new Date("2022-11-07");
    const today = new Date();

    let years = today.getFullYear() - startDate.getFullYear();
    let months = today.getMonth() - startDate.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    if (months === 0) {
      setCareerTitleText(`${years + 1}년 `);
    } else {
      setCareerTitleText(`${years}년 ${months}개월`);
    }
  }, []);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const masterTargetCode = process.env.NEXT_PUBLIC_BLOG_AUTH_CODE;

    if (authCode === masterTargetCode) {
      alert("인증에 성공했습니다. 글쓰기 페이지로 이동합니다.");
      setIsAuthModalOpen(false);
      setAuthCode("");
      router.push("/write"); 
    } else {
      alert("인증번호가 일치하지 않습니다.");
    }
  };

  const ResumeContent = () => (
    <div className="relative">
      <div className="flex items-center gap-3.5 mb-3.5 pr-10"> 
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-blue-500/10">
          <User className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-black text-gray-900 tracking-tight">권은찬</h2>
          <p className="text-[12px] font-bold text-blue-600 uppercase tracking-wider mt-0.5">
            {careerTitleText}
          </p>
        </div>
      </div>

      <button
        onClick={() => setIsAuthModalOpen(true)}
        className="absolute top-1 right-0 w-8 h-8 rounded-lg border border-gray-200 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center bg-white text-gray-400 shadow-sm transition-all duration-200 active:scale-95 cursor-pointer z-10"
        title="글쓰기"
      >
        <SquarePen className="w-4 h-4" />
      </button>

      <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
        ...
      </p>
    </div>
  );

  return (
    <>
      <div className="hidden md:block w-full bg-white border border-gray-200/80 rounded-2xl p-5 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.07)] transition-all duration-300">
        <ResumeContent />
      </div>

      {isAuthModalOpen && mounted && createPortal(
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[999999] animate-fadeIn">
          <div className="bg-white rounded-2xl p-7 w-full max-w-sm mx-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100/80 transform scale-100 transition-all z-[1000000]">
            
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-[15px] font-black text-gray-900 tracking-tight">관리자 인증</h3>
                <p className="text-[11px] text-gray-400 font-semibold mt-0.5">게시물 작성을 위해서는 관리자 권한이 필요합니다.</p>
              </div>
              <button 
                onClick={() => { setIsAuthModalOpen(false); setAuthCode(""); }}
                className="text-gray-400 hover:text-gray-700 hover:bg-gray-50 p-1.5 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <input
                  type="password"
                  placeholder="패스워드를 입력하세요"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 tracking-widest text-center font-bold transition-all bg-gray-50/50 focus:bg-white text-gray-800 placeholder:tracking-normal placeholder:font-medium placeholder:text-gray-300"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <p className="text-[11px] text-gray-400 font-medium leading-none break-keep">
                  게시물 작성은 블로그 관리자의 권한입니다.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all duration-200 cursor-pointer shadow-md shadow-blue-500/10 active:scale-[0.99]"
              >
                인 증
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}