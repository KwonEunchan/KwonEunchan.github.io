'use client'

import { useEffect, useState } from 'react'
import { CREDENTIALS_EVENT, loadSession, type Session } from './credentials'

export function useAdmin(): { session: Session | null; ready: boolean } {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const sync = () => {
      setSession(loadSession())
      setReady(true)
    }
    sync()
    window.addEventListener(CREDENTIALS_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(CREDENTIALS_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return { session, ready }
}
