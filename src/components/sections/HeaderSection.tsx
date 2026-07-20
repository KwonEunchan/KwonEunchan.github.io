// src/components/Header.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // const searchParams = useSearchParams();
  // const currentSection = searchParams.get("section") || "posts";

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled || isOpen ? "bg-white text-gray-800 shadow-sm" : "bg-transparent text-white"
    }`}>
      <div className="max-w-7xl mx-auto px-5 h-12 sm:h-16 flex items-center justify-between relative z-50">
        
        <Link href="/" onClick={closeMenu} className="flex items-center font-black text-xl sm:text-2xl tracking-tight font-sans select-none">
          <span className="text-orange-500">Kwon</span>
          <span className={isScrolled || isOpen ? "text-gray-800" : "text-white"}>EunChan</span>
        </Link>

        {/* <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold tracking-wide">
          <Link href="/?section=posts" className={`transition-colors hover:text-orange-500`}>
            Posts
          </Link>
          <span className={`text-xs ${isScrolled ? "text-gray-200" : "text-gray-600"}`}>|</span>
          <Link href="/?section=projects" className={`transition-colors hover:text-orange-500`}>
            Projects
          </Link>
          <span className={`text-xs ${isScrolled ? "text-gray-200" : "text-gray-600"}`}>|</span>
          <Link href="/?section=skills" className={`transition-colors hover:text-orange-500`}>
            Skills
          </Link>
        </nav> */}

        {/* <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-1 flex flex-col justify-center items-center w-8 h-8 space-y-1.5 focus:outline-none"
        >
          <span className={`block w-5 h-0.5 bg-current transition-all duration-300 transform ${isOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${isOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-current transition-all duration-300 transform ${isOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button> */}
      </div>

      {/* <div className={`absolute top-0 left-0 right-0 bg-white border-b border-gray-100 shadow-md transition-all duration-300 ease-in-out md:hidden overflow-hidden ${
        isOpen ? "opacity-100 translate-y-0 pt-12 pb-4 pointer-events-auto" : "opacity-0 -translate-y-5 pointer-events-none h-0"
      }`}>
        <nav className="flex flex-col px-6 pt-4 space-y-4 text-sm font-semibold text-gray-700">
          <Link href="/?section=posts" onClick={closeMenu} className={`pb-2 border-b border-gray-50 transition-colors flex justify-between items-center hover:text-orange-500`}>
            <span>포스트</span>
            <span className={`text-xs font-normal text-gray-400`}>Posts</span>
          </Link>
          <Link href="/?section=projects" onClick={closeMenu} className={`pb-2 border-b border-gray-50 transition-colors flex justify-between items-center hover:text-orange-500`}>
            <span>프로젝트</span>
            <span className={`text-xs font-normal text-gray-400`}>Projects</span>
          </Link>
          <Link href="/?section=skills" onClick={closeMenu} className={`pb-2 border-b border-gray-50 transition-colors flex justify-between items-center hover:text-orange-500`}>
            <span>스킬</span>
            <span className={`text-xs font-normal text-gray-400`}>Skills</span>
          </Link>
        </nav>
      </div> */}
    </header>
  );
}