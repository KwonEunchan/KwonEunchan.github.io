'use client'

import { useEffect, useRef } from 'react'
import { siteConfig } from '@/site.config'

export default function Giscus() {
  const ref = useRef<HTMLDivElement>(null)
  const { repo, repoId, category, categoryId } = siteConfig.giscus
  const enabled = Boolean(repo && repoId && category && categoryId)

  useEffect(() => {
    if (!enabled || !ref.current) return
    const container = ref.current
    const theme = document.documentElement.dataset.theme === 'dark' ? 'dark_dimmed' : 'light'
    const script = document.createElement('script')
    const attrs: Record<string, string> = {
      src: 'https://giscus.app/client.js',
      'data-repo': repo,
      'data-repo-id': repoId,
      'data-category': category,
      'data-category-id': categoryId,
      'data-mapping': 'pathname',
      'data-reactions-enabled': '1',
      'data-emit-metadata': '0',
      'data-input-position': 'top',
      'data-theme': theme,
      'data-lang': 'ko',
      'data-loading': 'lazy',
      crossorigin: 'anonymous',
    }
    Object.entries(attrs).forEach(([k, v]) => script.setAttribute(k, v))
    script.async = true
    container.appendChild(script)

    const onTheme = (event: Event) => {
      const next = (event as CustomEvent<string>).detail === 'dark' ? 'dark_dimmed' : 'light'
      const frame = container.querySelector<HTMLIFrameElement>('iframe.giscus-frame')
      frame?.contentWindow?.postMessage({ giscus: { setConfig: { theme: next } } }, 'https://giscus.app')
    }
    window.addEventListener('blog:theme', onTheme)
    return () => {
      window.removeEventListener('blog:theme', onTheme)
      container.innerHTML = ''
    }
  }, [enabled, repo, repoId, category, categoryId])

  if (!enabled) return null
  return <div ref={ref} className="comments" />
}
