import yaml from 'js-yaml'
import type { Category, PostFrontmatter } from './types'

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

export function parseFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
  const match = raw.match(FRONTMATTER)
  if (!match) return { data: {}, body: raw }
  const loaded = yaml.load(match[1])
  const data = loaded && typeof loaded === 'object' ? (loaded as Record<string, unknown>) : {}
  return { data, body: raw.slice(match[0].length) }
}

function asString(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return String(value)
  return ''
}

export function normalizeFrontmatter(data: Record<string, unknown>): PostFrontmatter {
  const category: Category = data.category === 'troubleshooting' ? 'troubleshooting' : 'experience'
  const tags = Array.isArray(data.tags)
    ? data.tags.map(asString).filter(Boolean)
    : asString(data.tags)
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

  const result: PostFrontmatter = {
    title: asString(data.title) || '제목 없음',
    description: asString(data.description),
    date: asString(data.date),
    category,
    tags,
  }
  const updated = asString(data.updated)
  if (updated) result.updated = updated
  const template = asString(data.template)
  if (template) result.template = template
  return result
}

export function stringifyPost(frontmatter: PostFrontmatter, body: string): string {
  const clean = Object.fromEntries(
    Object.entries(frontmatter).filter(([, v]) => {
      if (v === undefined || v === null) return false
      if (typeof v === 'string') return v.trim().length > 0
      return true
    }),
  )
  const header = yaml.dump(clean, { lineWidth: -1, quotingType: '"' })
  return `---\n${header}---\n\n${body.trim()}\n`
}
