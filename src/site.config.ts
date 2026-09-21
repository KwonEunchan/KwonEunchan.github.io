export const siteConfig = {
  title: '권은찬의 기술 블로그',
  brand: {
    name: 'KwonEunchan',
    suffix: '’s tech',
  },
  // 홈 상단 문구
  headline: '오늘의 경험이 내일의 발판이 됩니다',
  subline: '문제를 해결하며 배운 점을 나누는 IT 엔지니어의 업무 일지입니다.',
  // 검색·공유 미리보기용 한 줄 설명
  description: 'IT 엔지니어의 개발·운영 업무 일지',
  url: 'https://kwoneunchan.github.io',
  locale: 'ko_KR',
  author: {
    name: 'KwonEunchan',
    email: '',
  },
  github: {
    owner: 'KwonEunchan',
    repo: 'KwonEunchan.github.io',
    branch: 'main',
    postsDir: 'content/posts',
  },
  giscus: {
    repo: '',
    repoId: '',
    category: '',
    categoryId: '',
  },
}

export type SiteConfig = typeof siteConfig
