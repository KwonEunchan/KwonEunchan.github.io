'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { clearSession, OPEN_AUTH_EVENT } from '@/lib/credentials'
import { checkToken } from '@/lib/github'
import { useAdmin } from '@/lib/useAdmin'
import { cx } from '@/lib/utils'
import AuthDialog from './AuthDialog'

const CHECKED_KEY = 'blog:admin-checked'

export default function AdminMenu() {
  const { session, ready } = useAdmin()
  const pathname = usePathname() || '/'
  const [dialog, setDialog] = useState<{ reason?: string } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const open = () => setDialog({})
    window.addEventListener(OPEN_AUTH_EVENT, open)
    return () => window.removeEventListener(OPEN_AUTH_EVENT, open)
  }, [])

  useEffect(() => {
    if (!session) return
    try {
      if (sessionStorage.getItem(CHECKED_KEY) === session.login) return
    } catch {}
    let cancelled = false
    checkToken(session.creds).then((valid) => {
      if (cancelled) return
      if (valid) {
        try {
          sessionStorage.setItem(CHECKED_KEY, session.login)
        } catch {}
        return
      }
      clearSession()
      setDialog({ reason: '토큰이 만료되었습니다.' })
    })
    return () => {
      cancelled = true
    }
  }, [session])

  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  const closeDialog = useCallback(() => setDialog(null), [])
  const onSuccess = useCallback((login: string) => {
    setDialog(null)
    try {
      sessionStorage.setItem(CHECKED_KEY, login)
    } catch {}
    setToast(`${login}`)
  }, [])

  const logout = () => {
    clearSession()
    try {
      sessionStorage.removeItem(CHECKED_KEY)
    } catch {}
    setMenuOpen(false)
    setToast('로그아웃')
  }

  if (!ready) return <span className="admin-slot" aria-hidden="true" />

  return (
    <>
      {session ? (
        <div className="admin" ref={menuRef}>
          <Link href="/write" className={cx('write-button', pathname.startsWith('/write') && 'is-active')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            <span>글쓰기</span>
          </Link>
          <button
            type="button"
            className="avatar-button"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`${session.login} 관리자 메뉴`}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <img src={`https://github.com/${session.login}.png?size=64`} alt="" width={30} height={30} />
          </button>
          {menuOpen && (
            <div className="admin-menu" role="menu">
              <div className="admin-menu__who">
                <strong>{session.login}</strong>
                <span>
                  {session.creds.owner}/{session.creds.repo}
                </span>
              </div>
              <Link href="/write" role="menuitem" className="admin-menu__item" onClick={() => setMenuOpen(false)}>
                새 글 쓰기
              </Link>
              <a
                href={`https://github.com/${session.creds.owner}/${session.creds.repo}/actions`}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                className="admin-menu__item"
              >
                배포 상태 보기
              </a>
              <button type="button" role="menuitem" className="admin-menu__item admin-menu__item--danger" onClick={logout}>
                로그아웃
              </button>
            </div>
          )}
        </div>
      ) : (
        <button type="button" className="admin-button" onClick={() => setDialog({})}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="4" y="10" width="16" height="11" rx="2.5" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
          <span>관리자</span>
        </button>
      )}

      {dialog && <AuthDialog reason={dialog.reason} onClose={closeDialog} onSuccess={onSuccess} />}

      {createPortal(
        <div className="toast-region" role="status" aria-live="polite">
          {toast && <div className="toast">{toast}</div>}
        </div>,
        document.body,
      )}
    </>
  )
}
