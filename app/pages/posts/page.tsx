import { getSortedPostsData } from '@/lib/posts';
import PostList from '@/app/components/post/PostList/PostList';
import styles from '@/app/styles/page.module.scss';

export default function PostsPage() {
  const allPostsData = getSortedPostsData();

  return (
    <main className={styles.mainContent}>
      <div className={styles.recentSection}>
        <PostList posts={allPostsData} />
      </div>
    </main>
  );
}