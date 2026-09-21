# KwonEunchan's tech

https://kwoneunchan.github.io

## 로컬 실행

```bash
npm install
npm run dev
```

## 배포

`main` 브랜치에 푸시되면 `.github/workflows/deploy.yml`이 빌드 후 GitHub Pages에 배포합니다.

- Settings → Pages → Source: **GitHub Actions**
- 수동 배포: Actions → Deploy → Run workflow

## 글쓰기

헤더의 관리자 버튼에서 토큰으로 인증한 뒤 글쓰기에서 작성합니다. 발행하면 글과 이미지가 하나의 커밋으로 `main`에 푸시되고, 배포가 자동으로 실행됩니다.

토큰: Fine-grained token, 이 저장소만 선택, Contents Read and write

## 글 파일

`content/posts/{slug}.md`

```yaml
---
title: "제목"
description: "요약"
date: "2026-09-17"
updated: "2026-09-20"   # 수정해서 발행하면 자동으로 들어갑니다
category: troubleshooting
template: troubleshooting
tags:
  - Next.js
---
```

- `updated`: 수정한 날. 글 위쪽에 "○○ 수정"으로 표시됩니다. 없으면 표시하지 않습니다.
- `category`: `troubleshooting` 또는 `experience`
- `template`: `troubleshooting`, `experience`
