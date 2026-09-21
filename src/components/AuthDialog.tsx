'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { defaultCredentials, saveSession } from '@/lib/credentials'
import { explainError, verifyAccess } from '@/lib/github'

interface Props {
  reason?: string
  onClose: () => void
  onSuccess: (login: string) => void
}

export default function AuthDialog({ reason, onClose, onSuccess }: Props) {
  const [token, setToken] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(reason ?? '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [onClose])

  const submit = async () => {
    if (!token || busy) return
    setBusy(true)
    setError('')
    try {
      const creds = { ...defaultCredentials(), token }
      const { login } = await verifyAccess(creds)
      saveSession(creds, login, true)
      onSuccess(login)
    } catch (err) {
      setError(explainError(err))
    } finally {
      setBusy(false)
    }
  }

  // 헤더의 backdrop-filter가 fixed 요소의 기준을 헤더로 바꾸기 때문에 body로 꺼내서 그린다
  return createPortal(
    <div className="dialog-backdrop" onMouseDown={onClose}>
      <div
        className="dialog auth"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="auth-title" className="dialog__title">
          관리자
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <input
            ref={inputRef}
            className="input input--lg auth__input"
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={token}
            onChange={(e) => setToken(e.target.value.trim())}
            placeholder="Token"
            aria-label="Token"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'auth-error' : undefined}
          />
          {error && (
            <p id="auth-error" className="auth__error" role="alert">
              {error}
            </p>
          )}
          <div className="dialog__actions">
            <button type="button" className="button button--ghost" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="button button--primary" disabled={busy || !token}>
              {busy ? '확인 중' : '확인'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
