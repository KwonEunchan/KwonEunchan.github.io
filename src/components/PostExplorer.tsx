'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PostMeta } from '@/lib/types'
import { cx } from '@/lib/utils'
import PostRow from './PostRow'
import Pagination from './Pagination'

type Filter = 'all' | 'experience' | 'troubleshooting'

const PAGE_SIZE = 10

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'experience', label: '경험' },
  { value: 'troubleshooting', label: '트러블슈팅' },
]

function isFilter(value: string | null): value is Filter {
  return value === 'experience' || value === 'troubleshooting'
}

export default function PostExplorer({ posts }: { posts: PostMeta[] }) {
  const [filter, setFilter] = useState<Filter>('all')
  const [tag, setTag] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [synced, setSynced] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const type = params.get('type')
    if (isFilter(type)) setFilter(type)
    setTag(params.get('tag'))
    setQuery(params.get('q') ?? '')
    const requested = Number.parseInt(params.get('page') ?? '', 10)
    if (Number.isFinite(requested) && requested > 1) setPage(requested)
    setSynced(true)
  }, [])

  const counts = useMemo(
    () => ({
      all: posts.length,
      experience: posts.filter((p) => p.category === 'experience').length,
      troubleshooting: posts.filter((p) => p.category === 'troubleshooting').length,
    }),
    [posts],
  )

  const tags = useMemo(() => {
    const map = new Map<string, number>()
    posts
      .filter((p) => filter === 'all' || p.category === filter)
      .forEach((p) => p.tags.forEach((t) => map.set(t, (map.get(t) ?? 0) + 1)))
    return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  }, [posts, filter])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter((p) => {
      if (filter !== 'all' && p.category !== filter) return false
      if (tag && !p.tags.includes(tag)) return false
      if (!q) return true
      const haystack = [p.title, p.description, ...p.tags]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [posts, filter, tag, query])

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const pagePosts = useMemo(
    () => visible.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE),
    [visible, current],
  )

  useEffect(() => {
    if (!synced) return
    const params = new URLSearchParams()
    if (filter !== 'all') params.set('type', filter)
    if (tag) params.set('tag', tag)
    if (query.trim()) params.set('q', query.trim())
    if (current > 1) params.set('page', String(current))
    const search = params.toString()
    const url = `${window.location.pathname}${search ? `?${search}` : ''}`
    window.history.replaceState(window.history.state, '', url)
  }, [filter, tag, query, current, synced])

  const goToPage = useCallback((next: number) => {
    setPage(next)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    sectionRef.current?.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' })
  }, [])

  const reset = () => {
    setFilter('all')
    setTag(null)
    setQuery('')
    setPage(1)
  }

  if (posts.length === 0) {
    return (
      <div className="empty">
        <p className="empty__title">아직 글이 없습니다</p>
      </div>
    )
  }

  return (
    <section ref={sectionRef} className="explorer" aria-labelledby="explorer-title">
      <h2 id="explorer-title" className="visually-hidden">글 목록</h2>
      <div className="explorer__head">
        <div className="tabs" role="tablist" aria-label="카테고리">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={filter === f.value}
              className={cx('tab', filter === f.value && 'is-active')}
              onClick={() => {
                setFilter(f.value)
                setTag(null)
                setPage(1)
              }}
            >
              {f.label}
              <span className="tab__count">{counts[f.value]}</span>
            </button>
          ))}
        </div>
        <label className="search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            placeholder="제목, 태그, 에러 내용으로 찾기"
            aria-label="글 검색"
          />
        </label>
      </div>

      {tags.length > 0 && (
        <div className="chips" aria-label="태그">
          {tags.map(([name, count]) => (
            <button
              key={name}
              type="button"
              className={cx('chip', tag === name && 'is-active')}
              aria-pressed={tag === name}
              onClick={() => {
                setTag(tag === name ? null : name)
                setPage(1)
              }}
            >
              {name}
              <span>{count}</span>
            </button>
          ))}
        </div>
      )}

      {visible.length > 0 ? (
        <>
          <ul className="post-list">
            {pagePosts.map((post) => (
              <PostRow key={post.slug} post={post} />
            ))}
          </ul>
          <Pagination page={current} totalPages={totalPages} onChange={goToPage} />
        </>
      ) : (
        <div className="empty">
          <p className="empty__title">조건에 맞는 글이 없습니다</p>
          <p className="empty__desc">검색어를 줄이거나 필터를 해제해 보세요.</p>
          <button type="button" className="button button--ghost" onClick={reset}>
            필터 초기화
          </button>
        </div>
      )}
    </section>
  )
}
