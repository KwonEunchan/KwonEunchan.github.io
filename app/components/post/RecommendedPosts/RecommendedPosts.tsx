import React from 'react';
import Link from 'next/link';
import { getPostsByIds, PostData } from '@/lib/posts';
import styles from './RecommendedPosts.module.scss';

interface RecommendedPostsProps {
  postIds: string[];
}

export default function RecommendedPosts({ postIds }: RecommendedPostsProps) {
  const limitedIds = postIds.slice(0, 4);
  const recommendedPosts: PostData[] = getPostsByIds(limitedIds);

  if (recommendedPosts.length === 0) return null;

  return (
    <section className={styles.recContainer}>
      <div className={styles.recHeader}>
        <div className={styles.recTitleArea}>
          <h2>추천 게시물</h2>
        </div>
        <Link href="/pages/posts" className={styles.recMoreLink}>
          전체보기
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.recArrowIcon}>
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>

      <div className={styles.recGrid}>
        {recommendedPosts.map((post) => (
          <Link href={`/pages/posts/${post.id}`} key={post.id} className={styles.recCard}>
            <div className={styles.recThumbnail}>
              {post.thumbnail ? (
                <img src={post.thumbnail} alt={post.title} className={styles.recImage} />
              ) : (
                <div className={styles.recPlaceholder}>
                  <img src="/favicon.ico" alt="icon" width="32" height="32" />
                </div>
              )}
            </div>
            <div className={styles.recContent}>
              <h3 className={styles.recTitle}>{post.title}</h3>
              <p className={styles.recSummary}>{post.description}</p>
              <div className={styles.recMeta}>
                <div className={styles.recAuthor}>
                  <div className={styles.recAvatar} />
                  <span>권은찬</span>
                </div>
                <span className={styles.recDate}>{post.date}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}