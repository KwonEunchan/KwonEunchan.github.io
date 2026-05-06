import { getPostData, getSortedPostsData } from '@/lib/posts';
import PostNavigation from '@/app/components/post/PostNavigation/PostNavigation';
import PostActions from './PostActions';

export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    const posts = getSortedPostsData();
    
    if (!posts || posts.length === 0) {
      return [];
    }

    return posts.map((post) => ({
      slug: post.slug,
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
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <PostNavigation />
        <p>게시글을 찾을 수 없거나 아직 작성된 글이 없습니다.</p>
      </div>
    );
  }

  return (
    <article style={{ padding: '32px 16px', maxWidth: '1600px', margin: '0 auto' }}>
      <PostNavigation />
      
      <PostActions slug={decodedSlug} title={postData.title} />

      <h1 style={{ fontFamily: "'Noto Sans KR', sans-serif", color: '#24292f', marginBottom: '8px' }}>
        {postData.title}
      </h1>

      <p style={{ color: '#57606a', borderBottom: '1px solid #d0d7de', paddingBottom: '16px', fontSize: '14px', marginBottom: '32px' }}>
        작성일: {postData.date}
      </p>

      <div 
        className="markdown-body" 
        dangerouslySetInnerHTML={{ __html: postData.contentHtml }} 
      />
    </article>
  );
}