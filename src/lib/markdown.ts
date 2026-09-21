import { unified, type Plugin } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import { visit } from 'unist-util-visit'
import { toString } from 'hast-util-to-string'
import type { Element, Root } from 'hast'
import type { Heading } from './types'
import { withBase } from './utils'

interface RenderOptions {
  resolveSrc?: (src: string) => string
}

function createEnhancer(headings: Heading[], resolveSrc: (src: string) => string): Plugin<[], Root> {
  return () => (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      const props = node.properties
      if ((node.tagName === 'h2' || node.tagName === 'h3') && typeof props.id === 'string') {
        headings.push({ id: props.id, text: toString(node), depth: node.tagName === 'h2' ? 2 : 3 })
      }
      if (node.tagName === 'img' && typeof props.src === 'string') {
        props.src = resolveSrc(props.src)
        props.loading = 'lazy'
        props.decoding = 'async'
      }
      if (node.tagName === 'a' && typeof props.href === 'string') {
        if (/^https?:\/\//.test(props.href)) {
          props.target = '_blank'
          props.rel = ['noopener', 'noreferrer']
        } else {
          props.href = withBase(props.href)
        }
      }
    })
  }
}

export async function renderMarkdown(
  markdown: string,
  options: RenderOptions = {},
): Promise<{ html: string; headings: Heading[] }> {
  const headings: Heading[] = []
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeHighlight)
    .use(createEnhancer(headings, options.resolveSrc ?? withBase))
    .use(rehypeStringify)
    .process(markdown)
  return { html: String(file), headings }
}
