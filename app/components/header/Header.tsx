"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.scss';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.navTop}>
        <div className={styles.inner}>
          <div className={styles.navLeft}>
            <span>KwonEunchan</span>
            <span style={{ color: '#8b949e' }}>/</span>
            <Link href="/" className={styles.blogName} style={{ textDecoration: 'none' }}>
              tech-blog
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.tabWrapper}>
        <div className={styles.tabInner}>
          <div className={styles.tabContainer}>
            <Link 
              href="/" 
              className={`${styles.tabItem} ${pathname === '/' ? styles.active : ''}`}
            >
              Home
            </Link>
            <Link 
              href="/pages/posts" 
              className={`${styles.tabItem} ${pathname.startsWith('/pages/posts') ? styles.active : ''}`}
            >
              Posts
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}