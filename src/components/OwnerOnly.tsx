'use client'

import type { ReactNode } from 'react'
import { useAdmin } from '@/lib/useAdmin'

export default function OwnerOnly({ children }: { children: ReactNode }) {
  const { session } = useAdmin()
  return session ? <>{children}</> : null
}
