import type { Metadata } from 'next'
import { Suspense } from 'react'
import WriteGate from '@/components/WriteGate'

export const metadata: Metadata = {
  title: '글쓰기',
  robots: { index: false, follow: false },
}

export default function WritePage() {
  return (
    <Suspense fallback={<div className="container write-loading" />}>
      <WriteGate />
    </Suspense>
  )
}
