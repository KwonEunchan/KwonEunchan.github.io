'use client'

import { useEffect, useRef } from 'react'
import { openAuthDialog } from '@/lib/credentials'
import { useAdmin } from '@/lib/useAdmin'
import WriteStudio from './WriteStudio'

export default function WriteGate() {
  const { session, ready } = useAdmin()
  const prompted = useRef(false)

  useEffect(() => {
    if (!ready || prompted.current) return
    prompted.current = true
    if (!session) openAuthDialog()
  }, [ready, session])

  if (!ready) return <div className="container write-loading" />

  if (!session) {
    return (
      <div className="container gate">
        <button type="button" className="button button--primary" onClick={openAuthDialog}>
          관리자 인증
        </button>
      </div>
    )
  }

  return <WriteStudio creds={session.creds} login={session.login} />
}
