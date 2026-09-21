export type Category = 'experience' | 'troubleshooting'

export interface PostFrontmatter {
  title: string
  description: string
  date: string
  /** 수정한 날. 한 번도 고치지 않은 글에는 없다 */
  updated?: string
  category: Category
  tags: string[]
  template?: string
}

export interface PostMeta extends PostFrontmatter {
  slug: string
}

export interface Heading {
  id: string
  text: string
  depth: number
}
