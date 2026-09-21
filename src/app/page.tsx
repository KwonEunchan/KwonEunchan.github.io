import { getAllPosts } from '@/lib/posts'
import HomeHead from '@/components/HomeHead'
import PostExplorer from '@/components/PostExplorer'

export default function HomePage() {
  const posts = getAllPosts()

  return (
    <div className="container">
      <HomeHead />
      <PostExplorer posts={posts} />
    </div>
  )
}
