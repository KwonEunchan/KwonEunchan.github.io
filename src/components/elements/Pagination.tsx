"use client";

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ totalItems, itemsPerPage, currentPage, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 py-12 select-none text-sm">
      
      {/* 1. 처음으로 가기 버튼 (<<) */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className={`w-9 h-9 flex items-center justify-center rounded-md transition-colors ${
          currentPage === 1 
            ? "bg-[#e5e7eb]/60 text-gray-400/70" 
            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        {/* 🛠️ 원래 w-4 h-4였던 크기를 w-5 h-5로 키우고 선도 strokeWidth={3}으로 더 두껍게 보정 */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>

      {/* 2. 이전 페이지 버튼 (<) */}
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className={`w-9 h-9 flex items-center justify-center rounded-md transition-colors ${
          currentPage === 1 
            ? "bg-[#e5e7eb]/60 text-gray-400/70" 
            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* 3. 숫자 영역 */}
      <div className="flex items-center space-x-6 px-4">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          const isActive = currentPage === page;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`h-9 flex items-center justify-center tracking-tight transition-all duration-150 ${
                isActive
                  ? "text-black font-bold pointer-events-none"
                  : "text-gray-400 font-bold cursor-pointer hover:text-gray-400 hover:font-bold hover:underline underline-offset-4"
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* 4. 다음 페이지 버튼 (>) */}
      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className={`w-9 h-9 flex items-center justify-center rounded-md transition-colors ${
          currentPage === totalPages 
            ? "bg-[#e5e7eb]/60 text-gray-400/70" 
            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* 5. 끝으로 가기 버튼 (>>) */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className={`w-9 h-9 flex items-center justify-center rounded-md transition-colors ${
          currentPage === totalPages 
            ? "bg-[#e5e7eb]/60 text-gray-400/70" 
            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}