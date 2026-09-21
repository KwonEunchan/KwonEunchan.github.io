import type { Category } from '@/lib/types'

export default function TroubleBadge({ category }: { category: Category }) {
  if (category !== 'troubleshooting') return null
  return <span className="trouble-badge">트러블슈팅</span>
}
