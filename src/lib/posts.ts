import fs from 'node:fs'
import path from 'node:path'
import { normalizeFrontmatter, parseFrontmatter } from './frontmatter'
import { renderMarkdown } from './markdown'
import type { Heading, PostMeta } from './types'

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')

export function getPostSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return []
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.replace(/\.md$/, ''))
}

function readPost(slug: string): { meta: PostMeta; body: string } | null {
  const file = path.join(POSTS_DIR, `${slug}.md`)
  if (!fs.existsSync(file)) return null
  const { data, body } = parseFrontmatter(fs.readFileSync(file, 'utf8'))
  const fm = normalizeFrontmatter(data)
  return { meta: { ...fm, slug }, body }
}

export function getAllPosts(): PostMeta[] {
  return getPostSlugs()
    .map((slug) => readPost(slug)?.meta)
    .filter((meta): meta is PostMeta => Boolean(meta))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title)))
}

export async function getPost(
  slug: string,
): Promise<{ meta: PostMeta; html: string; headings: Heading[] } | null> {
  const post = readPost(slug)
  if (!post) return null
  const { html, headings } = await renderMarkdown(post.body)
  return { meta: post.meta, html, headings }
}

export function getAdjacent(slug: string): { newer: PostMeta | null; older: PostMeta | null } {
  const posts = getAllPosts()
  const index = posts.findIndex((p) => p.slug === slug)
  if (index < 0) return { newer: null, older: null }
  return { newer: posts[index - 1] ?? null, older: posts[index + 1] ?? null }
}
