import Link from 'next/link'
import { siteConfig } from '@/site.config'
import { cx } from '@/lib/utils'

/** 파란 타일 위의 K. 접힌 종이처럼 세로 획은 흰색, 두 대각선은 한 톤씩 옅다. 세 획의 굵기는 같다(9.5) */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg className="logo__mark" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="15" fill="#3B5BFD" />
      <path d="M13.64 13H23.14V51H13.64Z" fill="#fff" />
      <path d="M23.14 26.78 36.92 13H50.36L31.36 32H23.14Z" fill="#E1E8FF" />
      <path d="M23.14 32H31.36L50.36 51H36.92L23.14 37.22Z" fill="#9FB3FF" />
    </svg>
  )
}

export default function Logo({ className }: { className?: string }) {
  const { name, suffix } = siteConfig.brand
  return (
    <Link href="/" className={cx('logo', className)} aria-label={`${siteConfig.title} 홈`}>
      <LogoMark />
      <span className="logo__text">
        <span className="logo__name">{name}</span>
        <span className="logo__suffix">{suffix}</span>
      </span>
    </Link>
  )
}
