"use client";

import { useState } from "react";
import { X, Lock } from "lucide-react";

// TODO: 나중에 전역이나 다른 컴포넌트에서 쓸 때 타입 참고용
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => void;
}

export default function AuthModal({ isOpen, onClose, onVerify }: AuthModalProps) {
  const [inputCode, setInputCode] = useState("");

  // 모달 닫혀있으면 렌더링 스킵
  if (!isOpen) return null;

  // 한글 입력 차단
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g, "");
    setInputCode(value);
  };

  return (
  
    <div className="fixed inset-0 z-[9999] flex items-center justify-center w-screen h-screen bg-black/40 backdrop-blur-sm p-4">
      <div 
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* 헤더 영역 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-slate-800 font-black">
            <Lock className="w-4 h-4" /> 인증 확인
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* 인증 코드 입력 폼 */}
        <input
          type="password"
          value={inputCode}
          onChange={handleInputChange}
          placeholder="인증 코드를 입력하세요 (영어/숫자 전용)"
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 text-sm font-bold focus:outline-none focus:border-blue-500"
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && onVerify(inputCode)}
        />
        
        {/* 제출 버튼 */}
        <button 
          onClick={() => onVerify(inputCode)}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl transition-all cursor-pointer shadow-md"
        >
          확인
        </button>
      </div>
    </div>
  );
}