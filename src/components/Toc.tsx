'use client'

import { useEffect, useState } from 'react'
import type { Heading } from '@/lib/types'
import { cx } from '@/lib/utils'

export default function Toc({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string | null>(headings[0]?.id ?? null)

  useEffect(() => {
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => Boolean(el))
    if (elements.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-80px 0px -70% 0px' },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav className="toc" aria-label="목차">
      <p className="toc__title">이 글의 흐름</p>
      <ul>
        {headings.map((h) => (
          <li key={h.id} className={cx(h.depth === 3 && 'toc__sub')}>
            <a href={`#${h.id}`} className={cx(active === h.id && 'is-active')}>
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
