import { useState, useRef, useEffect } from "react";
import "../../styles/CategoryPanel.scss";

export default function CategoryPanel({ onSelect, onSearch }) {
  const categories = [
    { id: "전체", label: "전체" },
    { id: "문제해결", label: "문제해결" },
    { id: "설계", label: "설계" },
    { id: "운영", label: "운영" },
    { id: "프로젝트", label: "프로젝트" },
    { id: "인사이트", label: "인사이트" },
    { id: "학습", label: "학습" },
    { id: "커리어", label: "커리어" },
    { id: "데브옵스", label: "데브옵스" }
  ];

  const [active, setActive] = useState("전체");
  const [isFixed, setIsFixed] = useState(false);
  const [placeholderHeight, setPlaceholderHeight] = useState(0);

  const panelRef = useRef(null);
  const originalAbsoluteTop = useRef(null);

  const itemRefs = useRef([]);

  const handleClick = (id, index) => {
    setActive(id);
    onSelect?.(id);

    itemRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };


  useEffect(() => {
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      originalAbsoluteTop.current = rect.top + window.scrollY;
      setPlaceholderHeight(panelRef.current.offsetHeight);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!panelRef.current || originalAbsoluteTop.current == null) return;

      const scrollY = window.scrollY;
      const headerHeight = 64;

      // fixed 진입
      if (!isFixed && scrollY + headerHeight >= originalAbsoluteTop.current) {
        setIsFixed(true);
      }

      // fixed 해제 (완전 복구)
      if (isFixed && scrollY + headerHeight < originalAbsoluteTop.current) {
        setIsFixed(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isFixed]);

  return (
    <section id="category-panel">
      <div
        className="category-placeholder"
        style={{ height: isFixed ? placeholderHeight : 0 }}
      />

      <div ref={panelRef} className={`floating-bar ${isFixed ? "fixed" : ""}`}>
        <div className="search-box">
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <div className="scroll-area">
          {categories.map((c, index) => (
            <button
              key={c.id}
              ref={(el) => (itemRefs.current[index] = el)}
              className={`category-item ${active === c.id ? "active" : ""}`}
              onClick={() => handleClick(c.id, index)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
