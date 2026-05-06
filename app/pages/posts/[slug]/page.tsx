import { getPostData, getSortedPostsData } from '@/lib/posts';
import PostNavigation from '@/app/components/post/PostNavigation/PostNavigation';
import PostActions from './PostActions';
import styles from './PostDetail.module.scss';

export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    const posts = getSortedPostsData();
    
    if (!posts || posts.length === 0) {
      return [];
    }

    return posts.map((post) => ({
      slug: String(post.slug),
    }));
  } catch (error) {
    return [];
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const decodedSlug = decodeURIComponent(slug);
  
  let postData = null;
  try {
    postData = await getPostData(decodedSlug);
  } catch (error) {
    postData = null;
  }

  if (!postData) {
    return (
      <div className={styles.notFound}>
        <PostNavigation />
        <p>게시글을 찾을 수 없거나 아직 작성된 글이 없습니다.</p>
      </div>
    );
  }

  return (
    <article className={styles.container}>
      <PostNavigation />
      
      <div className={styles.actionsContainer}>
        <PostActions slug={decodedSlug} title={postData.title} />
      </div>

      <header className={styles.header}>
        <h1 className={styles.title}>{postData.title}</h1>
        <div className={styles.meta}>
          <span>작성일: {postData.date}</span>
        </div>
        <hr className={styles.divider} />
      </header>

      <div 
        className={styles.editorContent} 
        dangerouslySetInnerHTML={{ __html: postData.contentHtml }} 
      />
    </article>
  );
}