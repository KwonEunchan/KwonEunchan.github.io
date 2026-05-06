"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { PostData } from '@/lib/posts';
import styles from './PostList.module.scss';

interface PostListProps {
  posts: PostData[];
}

export default function PostList({ posts }: PostListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(8);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showOnlyTroubleshooting, setShowOnlyTroubleshooting] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsSelectOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredPosts = posts.filter((post) => {
    const keyword = searchQuery.toLowerCase();
    const targetText = [post.title || '', post.description || ''].join(' ').toLowerCase();
    const matchesSearch = targetText.includes(keyword);
    const isTroubleshooting = post.tags?.some(tag => tag === '트러블슈팅');
    return showOnlyTroubleshooting ? matchesSearch && isTroubleshooting : matchesSearch;
  });

  const startIndex = (currentPage - 1) * postsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePerPageChange = (value: number) => {
    setPostsPerPage(value);
    setCurrentPage(1);
    setIsSelectOpen(false);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setShowOnlyTroubleshooting(false);
    setCurrentPage(1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.listHeader}>
        <div className={styles.titleArea}>
          <h2>기록하며 성장하는 공간</h2>
          <p>Troubleshoot, Learn, and Grow</p>
        </div>
        <div className={styles.controls}>
          <div className={styles.controlRow}>
            <Link href="/pages/write" className={styles.writeBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              새 포스트 작성
            </Link>
            <button 
              className={`${styles.filterBtn} ${showOnlyTroubleshooting ? styles.active : ''}`}
              onClick={() => { setShowOnlyTroubleshooting(!showOnlyTroubleshooting); setCurrentPage(1); }}
            >
              <svg className={styles.wrenchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              트러블 슈팅만 보기
            </button>
            <div className={styles.viewToggles}>
              <button onClick={() => setViewMode('grid')} className={`${styles.toggleBtn} ${viewMode === 'grid' ? styles.active : ''}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              </button>
              <button onClick={() => setViewMode('list')} className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.active : ''}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
              </button>
            </div>
            <div className={styles.customSelect} ref={selectRef}>
              <div className={`${styles.selectTrigger} ${isSelectOpen ? styles.open : ''}`} onClick={() => setIsSelectOpen(!isSelectOpen)}>
                <span>{postsPerPage}개씩</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
              {isSelectOpen && (
                <ul className={styles.selectOptions}>
                  {[4, 8, 12, 16].map((num) => (
                    <li key={num} className={postsPerPage === num ? styles.selected : ''} onClick={() => handlePerPageChange(num)}>
                      {num}개씩 보기
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className={styles.searchContainer}>
              <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" placeholder="검색어 입력..." value={searchQuery} onChange={handleSearch} className={styles.searchInput} />
            </div>
          </div>
        </div>
      </div>

      {currentPosts.length === 0 ? (
        <div className={styles.noResult}>
          <div className={styles.noResultContent}>
            <div className={styles.noResultIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <h3>검색 결과가 없습니다</h3>
            <p>단어를 확인하시거나 필터를 초기화해보세요.</p>
            <button onClick={resetFilters} className={styles.resetBtn}>전체 보기</button>
          </div>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? styles.grid : styles.listView}>
          {currentPosts.map((post) => (
            <Link href={`/pages/posts/${post.id}`} key={post.id} className={styles.card}>
              <div className={styles.thumbnailArea}>
                <img 
                  src={post.thumbnail || '/favicon.ico'} 
                  alt={post.title} 
                  className={post.thumbnail ? styles.thumbnailImage : styles.faviconPlaceholder} 
                />
                {post.tags?.includes("트러블슈팅") && (
                  <div className={styles.troubleBadge}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                    </svg>
                    <span>트러블슈팅</span>
                  </div>
                )}
              </div>
              <div className={styles.content}>
                <h3 className={styles.title}>{post.title}</h3>
                <div className={styles.descriptionWrapper}>
                  <p className={styles.description}>{post.description || '기록된 내용이 없습니다.'}</p>
                </div>
                <div className={styles.meta}>
                  <div className={styles.author}>
                    <div className={styles.avatar}></div>
                    <span>권은찬</span>
                  </div>
                  <span className={styles.date}>{post.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} className={styles.pageButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <button key={number} onClick={() => handlePageChange(number)} className={`${styles.pageButton} ${currentPage === number ? styles.activePage : ''}`}>{number}</button>
          ))}
          <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} className={styles.pageButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}