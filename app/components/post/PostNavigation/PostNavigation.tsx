"use client";

import { useRouter } from 'next/navigation';
import styles from './PostNavigation.module.scss';

export default function PostNavigation() {
  const router = useRouter();

  return (
    <div className={styles.navContainer}>
      <button onClick={() => router.back()} className={styles.backBtn}>
        ← 목록으로 돌아가기
      </button>
    </div>
  );
}