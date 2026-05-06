"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './PostActions.module.scss';

export default function PostActions({ slug, title }: { slug: string; title: string }) {
  const [token, setToken] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;
    
    setIsProcessing(true);
    
    try {
      const owner = 'KwonEunchan';
      const repo = 'KwonEunchan.github.io';
      const path = `contents/posts/${slug}.md`;

      const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!getRes.ok) {
        alert('토큰이 올바르지 않거나 권한이 없습니다.');
        setIsProcessing(false);
        return;
      }

      const fileData = await getRes.json();
      
      const delRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `docs: 포스트 삭제 - ${title}`,
          sha: fileData.sha
        })
      });

      if (delRes.ok) {
        alert('삭제되었습니다. 반영까지 1~2분 정도 소요될 수 있습니다.');
        router.push('/');
      } else {
        const errorData = await delRes.json();
        alert(`삭제 실패: ${errorData.message}`);
      }
    } catch (error) {
      alert('오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = () => {
    router.push(`/pages/write?edit=${encodeURIComponent(slug)}`);
  };

  return (
    <div className={styles.actionsContainer}>
      <div className={styles.tokenWrapper}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
        <input 
          type="password"
          placeholder="GitHub Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className={styles.tokenInput}
          disabled={isProcessing}
        />
      </div>
      <button 
        className={styles.editBtn} 
        onClick={handleEdit} 
        disabled={!token.trim() || isProcessing}
      >
        수정
      </button>
      <button 
        className={styles.deleteBtn} 
        onClick={handleDelete} 
        disabled={!token.trim() || isProcessing}
      >
        삭제
      </button>
    </div>
  );
}