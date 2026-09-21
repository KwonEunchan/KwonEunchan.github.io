import type { Category } from './types'

export interface TemplateSection {
  heading: string
  guide: string
  starter?: string
}

export interface PostTemplate {
  id: string
  name: string
  summary: string
  category: Category
  descriptionHint: string
  sections: TemplateSection[]
}

export const GUIDE_PREFIX = '> 작성 가이드:'

export const TEMPLATES: PostTemplate[] = [
  {
    id: 'troubleshooting',
    name: '트러블슈팅',
    summary: '문제, 원인, 해결, 결과 순서로 남기는 장애와 버그 기록',
    category: 'troubleshooting',
    descriptionHint: '어떤 문제를 어떻게 풀었는지 한 줄로',
    sections: [
      {
        heading: '문제 상황',
        guide: '어떤 환경에서 무엇이 어떻게 깨졌는지 적습니다. 에러 메시지와 재현 조건을 함께 남기세요.',
        starter: '```text\n\n```',
      },
      {
        heading: '원인 분석',
        guide: '세운 가설과 확인한 방법을 순서대로 적습니다. 틀렸던 가설도 남기면 좋습니다.',
      },
      {
        heading: '해결 방법',
        guide: '적용한 수정과 그렇게 고친 이유를 적습니다.',
        starter: '```ts\n\n```',
      },
      {
        heading: '결과',
        guide: '수정 전후를 비교합니다. 수치가 있으면 함께 적으세요.',
      },
      {
        heading: '배운 점',
        guide: '다음에 같은 문제를 만나면 무엇을 먼저 확인할지 적습니다.',
      },
    ],
  },
  {
    id: 'experience',
    name: '경험 회고',
    summary: '프로젝트나 도입 경험을 배경부터 회고까지 정리하는 글',
    category: 'experience',
    descriptionHint: '이 경험에서 가장 중요했던 것을 한 줄로',
    sections: [
      { heading: '배경', guide: '왜 이 일을 시작했는지, 당시 상황이 어땠는지 적습니다.' },
      { heading: '목표', guide: '무엇을 이루려고 했는지 적습니다. 가능하면 측정할 수 있는 기준으로 적으세요.' },
      { heading: '진행 과정', guide: '시도한 방법과 부딪힌 문제, 내린 결정을 시간 순서로 적습니다.' },
      { heading: '결과', guide: '목표와 비교해 무엇이 달라졌는지 적습니다.' },
      { heading: '회고', guide: '잘한 점, 아쉬운 점, 다음에 바꿀 점을 적습니다.' },
    ],
  },
]

export function findTemplate(id: string | undefined): PostTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id)
}

export function buildTemplateBody(template: PostTemplate): string {
  return template.sections
    .map((s) => [`## ${s.heading}`, `${GUIDE_PREFIX} ${s.guide}`, s.starter].filter(Boolean).join('\n\n'))
    .join('\n\n')
    .concat('\n')
}

export function isPristine(body: string): boolean {
  if (!body.trim()) return true
  return TEMPLATES.some((t) => buildTemplateBody(t).trim() === body.trim())
}

export function stripGuides(body: string): string {
  return body
    .split('\n')
    .filter((line) => !line.startsWith(GUIDE_PREFIX))
    .join('\n')
    .replace(/```[a-z]*\n\s*```\n?/g, '')
    .replace(/^- \[문서 제목\]\(https:\/\/\)\n?/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export type SectionState = 'filled' | 'empty' | 'missing'

export interface SectionCheck {
  heading: string
  state: SectionState
  offset: number
}

export function checkSections(template: PostTemplate, body: string): SectionCheck[] {
  const lines = body.split('\n')
  const headingIndex = new Map<string, number>()
  lines.forEach((line, i) => {
    const match = line.match(/^##\s+(.+?)\s*$/)
    if (match && !headingIndex.has(match[1])) headingIndex.set(match[1], i)
  })

  return template.sections.map((section) => {
    const start = headingIndex.get(section.heading)
    if (start === undefined) return { heading: section.heading, state: 'missing', offset: -1 }
    let end = lines.length
    for (let i = start + 1; i < lines.length; i += 1) {
      if (/^##\s+/.test(lines[i])) {
        end = i
        break
      }
    }
    const content = lines
      .slice(start + 1, end)
      .filter((line) => !line.startsWith(GUIDE_PREFIX))
      .join('\n')
      .replace(/```[a-z]*\n\s*```/g, '')
      .replace(/- \[문서 제목\]\(https:\/\/\)/g, '')
      .trim()
    const offset = lines.slice(0, start).reduce((sum, line) => sum + line.length + 1, 0)
    return { heading: section.heading, state: content ? 'filled' : 'empty', offset }
  })
}
