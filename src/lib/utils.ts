export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export function withBase(src: string): string {
  if (!src.startsWith('/') || src.startsWith('//')) return src
  if (basePath && src.startsWith(`${basePath}/`)) return src
  return `${basePath}${src}`
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return `${y}년 ${m}월 ${d}일`
}

export function todayISO(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

/** 글 주소로 쓰는 날짜-시간 값. 예: 20260921-143052 */
export function timestampSlug(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  return `${date}-${time}`
}

export function cx(...names: Array<string | false | null | undefined>): string {
  return names.filter(Boolean).join(' ')
}
