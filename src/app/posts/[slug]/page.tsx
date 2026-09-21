import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdjacent, getPost, getPostSlugs } from '@/lib/posts'
import { formatDate } from '@/lib/utils'
import TroubleBadge from '@/components/TroubleBadge'
import Toc from '@/components/Toc'
import Giscus from '@/components/Giscus'
import OwnerOnly from '@/components/OwnerOnly'

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

const EMPTY_SLUG = '_'

export function generateStaticParams() {
  const slugs = getPostSlugs()
  return (slugs.length > 0 ? slugs : [EMPTY_SLUG]).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  return {
    title: post.meta.title,
    description: post.meta.description,
    openGraph: {
      type: 'article',
      title: post.meta.title,
      description: post.meta.description,
      publishedTime: post.meta.date,
      ...(post.meta.updated ? { modifiedTime: post.meta.updated } : {}),
      tags: post.meta.tags,
    },
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()
  const { meta, html, headings } = post
  const { newer, older } = getAdjacent(slug)

  return (
    <div className="container post-layout">
      <article className="post">
        <header className="post-head">
          <TroubleBadge category={meta.category} />
          <h1 className="post-head__title">{meta.title}</h1>
          {meta.description && <p className="post-head__desc">{meta.description}</p>}
          <div className="meta meta--post">
            <time dateTime={meta.date}>{formatDate(meta.date)}</time>
            {meta.updated && (
              <span className="meta__updated">
                <time dateTime={meta.updated}>{formatDate(meta.updated)}</time> 수정
              </span>
            )}
            <OwnerOnly>
              <Link href={`/write?slug=${meta.slug}`} className="meta__edit">
                수정
              </Link>
            </OwnerOnly>
          </div>
        </header>

        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

        {meta.tags.length > 0 && (
          <ul className="post-tags" aria-label="태그">
            {meta.tags.map((tag) => (
              <li key={tag}>
                <Link href={`/?tag=${encodeURIComponent(tag)}`} className="chip">
                  {tag}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <nav className="pager" aria-label="다른 글">
          {older ? (
            <Link href={`/posts/${older.slug}`} className="pager__item">
              <span className="pager__label">이전 글</span>
              <span className="pager__title">{older.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {newer ? (
            <Link href={`/posts/${newer.slug}`} className="pager__item pager__item--next">
              <span className="pager__label">다음 글</span>
              <span className="pager__title">{newer.title}</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>

        <Giscus />
      </article>

      <aside className="post-aside">
        <Toc headings={headings} />
      </aside>
    </div>
  )
}
