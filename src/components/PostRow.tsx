import Link from 'next/link'
import type { PostMeta } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import TroubleBadge from './TroubleBadge'
import Thumbnail from './Thumbnail'

export default function PostRow({ post }: { post: PostMeta }) {
  return (
    <li className="post-row">
      <Link href={`/posts/${post.slug}`} className="post-row__link">
        <div className="post-row__body">
          <h3 className="post-row__title">{post.title}</h3>
          {post.description && <p className="post-row__desc">{post.description}</p>}
          <div className="meta">
            <TroubleBadge category={post.category} />
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </div>
        </div>
        <Thumbnail seed={post.slug} />
      </Link>
    </li>
  )
}
