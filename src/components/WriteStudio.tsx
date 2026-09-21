'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { siteConfig } from '@/site.config'
import type { Category, PostFrontmatter } from '@/lib/types'
import { renderMarkdown } from '@/lib/markdown'
import { normalizeFrontmatter, parseFrontmatter, stringifyPost } from '@/lib/frontmatter'
import { commitFiles, explainError, fetchFile, GitHubError, textToBase64, type FileChange } from '@/lib/github'
import { clearSession, openAuthDialog, type Credentials } from '@/lib/credentials'
import {
  buildTemplateBody,
  checkSections,
  findTemplate,
  isPristine,
  stripGuides,
  type PostTemplate,
} from '@/lib/templates'
import { cx, formatDate, timestampSlug, todayISO, withBase } from '@/lib/utils'
import TroubleBadge from './TroubleBadge'
import TemplatePicker from './TemplatePicker'

interface Draft {
  title: string
  description: string
  date: string
  category: Category
  tags: string
  template: string
  body: string
}

interface Notice {
  tone: 'info' | 'error' | 'success'
  text: string
}

interface PublishResult {
  kind: 'published' | 'deleted'
  commitUrl: string
  postUrl: string
  slug: string
}

type Busy = null | 'loading' | 'publishing' | 'deleting'

const emptyDraft = (): Draft => ({
  title: '',
  description: '',
  date: todayISO(),
  category: 'experience',
  tags: '',
  template: '',
  body: '',
})

const draftKey = (slug: string | null) => `blog:draft:${slug ?? 'new'}`

function fromFrontmatter(fm: PostFrontmatter, body: string): Draft {
  return {
    title: fm.title,
    description: fm.description,
    date: fm.date || todayISO(),
    category: fm.category,
    tags: fm.tags.join(', '),
    template: fm.template ?? '',
    body: body.trim(),
  }
}

function toFrontmatter(d: Draft, updated?: string): PostFrontmatter {
  const fm: PostFrontmatter = {
    title: d.title.trim(),
    description: d.description.trim(),
    date: d.date,
    ...(updated ? { updated } : {}),
    category: d.category,
    tags: d.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
  }
  if (findTemplate(d.template)) fm.template = d.template
  return fm
}

const SECTION_LABEL = { filled: '작성함', empty: '비어 있음', missing: '제목 없음' } as const

export default function WriteStudio({ creds, login }: { creds: Credentials; login: string }) {
  const params = useSearchParams()
  const editSlug = params.get('slug')

  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [previewHtml, setPreviewHtml] = useState('')
  const [pane, setPane] = useState<'write' | 'preview'>('write')
  const [picking, setPicking] = useState(false)
  const [templateDialog, setTemplateDialog] = useState(false)
  const [busy, setBusy] = useState<Busy>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [result, setResult] = useState<PublishResult | null>(null)
  const [ready, setReady] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [restored, setRestored] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const credsRef = useRef(creds)
  credsRef.current = creds

  const { postsDir } = siteConfig.github

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const handleError = useCallback((error: unknown) => {
    if (error instanceof GitHubError && error.status === 401) {
      clearSession()
      openAuthDialog()
      return
    }
    setNotice({ tone: 'error', text: explainError(error) })
  }, [])

  const loadRemote = useCallback(
    async (slug: string, target: Credentials) => {
      setBusy('loading')
      try {
        const raw = await fetchFile(target, `${postsDir}/${slug}.md`)
        if (raw === null) {
          setNotice({ tone: 'error', text: `저장소에서 "${slug}" 글을 찾을 수 없습니다. 새 글로 작성합니다.` })
          setDraft(emptyDraft())
          return
        }
        const { data, body } = parseFrontmatter(raw)
        setDraft(fromFrontmatter(normalizeFrontmatter(data), body))
        setRestored(false)
        setNotice(null)
      } catch (error) {
        handleError(error)
      } finally {
        setBusy(null)
      }
    },
    [postsDir, handleError],
  )

  useEffect(() => {
    let local: Draft | null = null
    try {
      const raw = localStorage.getItem(draftKey(editSlug))
      if (raw) local = { ...emptyDraft(), ...JSON.parse(raw) }
    } catch {}

    if (local && (local.title || local.body)) {
      setDraft(local)
      setRestored(true)
      setReady(true)
      return
    }
    if (editSlug) {
      loadRemote(editSlug, credsRef.current).finally(() => setReady(true))
    } else {
      setPicking(true)
      setReady(true)
    }
  }, [editSlug, loadRemote])

  useEffect(() => {
    if (!ready || result) return
    const timer = window.setTimeout(() => {
      try {
        if (draft.title || draft.body) {
          localStorage.setItem(draftKey(editSlug), JSON.stringify(draft))
          setSavedAt(new Date())
        }
      } catch {}
    }, 600)
    return () => window.clearTimeout(timer)
  }, [draft, ready, editSlug, result])

  useEffect(() => {
    let cancelled = false
    const timer = window.setTimeout(async () => {
      try {
        const { html } = await renderMarkdown(stripGuides(draft.body || ''))
        if (!cancelled) setPreviewHtml(html)
      } catch {
        if (!cancelled) setPreviewHtml('<p>미리보기를 만들 수 없습니다. 마크다운 문법을 확인하세요.</p>')
      }
    }, 200)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [draft.body])

  const replaceBody = (next: string, selStart: number, selEnd: number) => {
    set('body', next)
    requestAnimationFrame(() => {
      const ta = textareaRef.current
      if (!ta) return
      ta.focus()
      ta.setSelectionRange(selStart, selEnd)
    })
  }

  const surround = (before: string, after: string, placeholder: string) => {
    const ta = textareaRef.current
    if (!ta) return
    const { selectionStart: s, selectionEnd: e, value } = ta
    const selected = value.slice(s, e) || placeholder
    const next = value.slice(0, s) + before + selected + after + value.slice(e)
    replaceBody(next, s + before.length, s + before.length + selected.length)
  }

  const prefixLines = (prefix: string) => {
    const ta = textareaRef.current
    if (!ta) return
    const { selectionStart: s, selectionEnd: e, value } = ta
    const lineStart = value.lastIndexOf('\n', s - 1) + 1
    const block = value.slice(lineStart, e)
    const prefixed = block
      .split('\n')
      .map((line) => (line.startsWith(prefix) ? line.slice(prefix.length) : prefix + line))
      .join('\n')
    const next = value.slice(0, lineStart) + prefixed + value.slice(e)
    replaceBody(next, lineStart, lineStart + prefixed.length)
  }

  const insertAtCursor = (text: string) => {
    const ta = textareaRef.current
    const value = draft.body
    const s = ta ? ta.selectionStart : value.length
    const e = ta ? ta.selectionEnd : value.length
    const next = value.slice(0, s) + text + value.slice(e)
    replaceBody(next, s + text.length, s + text.length)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Tab' && !event.nativeEvent.isComposing) {
      event.preventDefault()
      insertAtCursor('  ')
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'b') {
      event.preventDefault()
      surround('**', '**', '강조할 내용')
    }
  }

  const applyTemplate = (template: PostTemplate) => {
    if (!isPristine(draft.body) && draft.template !== template.id) {
      const ok = window.confirm(`지금까지 쓴 본문을 "${template.name}" 양식으로 바꿀까요? 작성한 내용은 사라집니다.`)
      if (!ok) return
    }
    if (draft.template === template.id && !isPristine(draft.body)) {
      setPicking(false)
      setTemplateDialog(false)
      return
    }
    setDraft((d) => ({
      ...d,
      template: template.id,
      category: template.category,
      body: buildTemplateBody(template),
    }))
    setPicking(false)
    setTemplateDialog(false)
    requestAnimationFrame(() => document.querySelector<HTMLInputElement>('.studio__title')?.focus())
  }

  const startBlank = () => {
    setDraft((d) => ({ ...d, template: '' }))
    setPicking(false)
    setTemplateDialog(false)
  }

  const template = findTemplate(draft.template)
  const sections = useMemo(() => (template ? checkSections(template, draft.body) : []), [template, draft.body])

  const jumpTo = (offset: number) => {
    const ta = textareaRef.current
    if (!ta || offset < 0) return
    setPane('write')
    const lineEnd = draft.body.indexOf('\n', offset)
    const pos = lineEnd < 0 ? draft.body.length : lineEnd
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(pos, pos)
      const ratio = offset / Math.max(1, draft.body.length)
      ta.scrollTop = ratio * (ta.scrollHeight - ta.clientHeight)
    })
  }

  const validate = (): string | null => {
    if (!draft.title.trim()) return '제목을 입력하세요.'
    if (!draft.body.trim()) return '본문을 입력하세요.'
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date)) return '작성일을 YYYY-MM-DD 형식으로 입력하세요.'
    return null
  }

  const pickNewSlug = async (): Promise<string> => {
    const base = timestampSlug()
    for (let i = 1; i <= 20; i += 1) {
      const candidate = i === 1 ? base : `${base}-${i}`
      if ((await fetchFile(creds, `${postsDir}/${candidate}.md`)) === null) return candidate
    }
    throw new Error('글 주소를 만들지 못했습니다. 잠시 뒤 다시 시도하세요.')
  }

  const publish = async () => {
    const problem = validate()
    if (problem) {
      setNotice({ tone: 'error', text: problem })
      return
    }
    const unfinished = sections.filter((sec) => sec.state !== 'filled').map((sec) => sec.heading)
    if (unfinished.length > 0) {
      const ok = window.confirm(
        `양식에서 아직 채우지 않은 항목이 있습니다.\n${unfinished.join(', ')}\n\n이대로 발행할까요?`,
      )
      if (!ok) return
    }

    const body = stripGuides(draft.body)
    // 수정해서 발행하면 수정한 날짜를 남긴다 (작성일과 글 주소는 그대로)
    const markdown = stringifyPost(toFrontmatter(draft, editSlug ? todayISO() : undefined), body)

    setBusy('publishing')
    setNotice(null)
    try {
      // 새 글은 발행 시각으로 주소를 만들고, 수정은 기존 주소를 그대로 쓴다
      const slug = editSlug ?? (await pickNewSlug())
      const changes: FileChange[] = [{ path: `${postsDir}/${slug}.md`, content: textToBase64(markdown) }]
      const verb = editSlug ? 'update' : 'publish'
      const commit = await commitFiles(creds, changes, `post(${verb}): ${draft.title.trim()}`)
      try {
        localStorage.removeItem(draftKey(editSlug))
      } catch {}
      setResult({
        kind: 'published',
        commitUrl: commit.url,
        postUrl: `${siteConfig.url.replace(/\/$/, '')}${withBase(`/posts/${slug}/`)}`,
        slug,
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      handleError(error)
    } finally {
      setBusy(null)
    }
  }

  const removePost = async () => {
    if (!editSlug) return
    const ok = window.confirm(`"${draft.title || editSlug}" 글을 삭제할까요? 저장소에서 파일이 지워집니다.`)
    if (!ok) return
    setBusy('deleting')
    setNotice(null)
    try {
      const commit = await commitFiles(
        creds,
        [{ path: `${postsDir}/${editSlug}.md`, remove: true }],
        `post(delete): ${editSlug}`,
      )
      try {
        localStorage.removeItem(draftKey(editSlug))
      } catch {}
      setResult({ kind: 'deleted', commitUrl: commit.url, postUrl: '', slug: editSlug })
    } catch (error) {
      handleError(error)
    } finally {
      setBusy(null)
    }
  }

  const discardDraft = () => {
    try {
      localStorage.removeItem(draftKey(editSlug))
    } catch {}
    setRestored(false)
    if (editSlug) {
      loadRemote(editSlug, creds)
    } else {
      setDraft(emptyDraft())
      setPicking(true)
    }
  }

  const startNew = () => {
    setResult(null)
    setDraft(emptyDraft())
    setNotice(null)
    setPicking(true)
    if (editSlug) window.history.replaceState(null, '', withBase('/write/'))
  }

  const chars = useMemo(() => draft.body.replace(/\s/g, '').length, [draft.body])

  const actionsUrl = `https://github.com/${creds.owner}/${creds.repo}/actions`

  if (result) {
    return (
      <div className="container write-result">
        <div className="write-result__card">
          <p className="write-result__title">
            {result.kind === 'published' ? '발행했습니다' : '삭제했습니다'}
          </p>
          <p className="write-result__desc">배포가 끝나면 사이트에 반영됩니다.</p>
          <div className="write-result__actions">
            <a href={actionsUrl} target="_blank" rel="noopener noreferrer" className="button button--primary">
              배포 진행 상황 보기
            </a>
            <a href={result.commitUrl} target="_blank" rel="noopener noreferrer" className="button button--ghost">
              커밋 보기
            </a>
            {result.kind === 'published' && (
              <a href={result.postUrl} className="button button--ghost">
                배포된 글 열기
              </a>
            )}
            <button type="button" className="button button--ghost" onClick={startNew}>
              새 글 쓰기
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (picking && ready) {
    return (
      <div className="container picker-page">
        <h1 className="picker-page__title">어떤 글을 쓰나요?</h1>
        <TemplatePicker onPick={applyTemplate} onBlank={startBlank} />
      </div>
    )
  }

  return (
    <div className="studio">
      <div className="studio__bar">
        <div className="container studio__bar-inner">
          <div className="studio__status">
            <span className="dot dot--on" aria-hidden="true" />
            <span className="studio__repo">
              {login}
            </span>
            <span className="studio__saved">
              {busy === 'loading'
                ? '글을 불러오는 중'
                : savedAt
                  ? `${savedAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 임시 저장됨`
                  : editSlug
                    ? '수정 중'
                    : '새 글'}
            </span>
          </div>
          <div className="studio__actions">
            {editSlug && (
              <button type="button" className="button button--danger" onClick={removePost} disabled={busy !== null}>
                {busy === 'deleting' ? '삭제하는 중' : '삭제'}
              </button>
            )}
            <button type="button" className="button button--ghost" onClick={() => setTemplateDialog(true)}>
              {template ? `양식: ${template.name}` : '양식 고르기'}
            </button>
            <button type="button" className="button button--primary" onClick={publish} disabled={busy !== null}>
              {busy === 'publishing' ? (editSlug ? '수정하는 중' : '발행하는 중') : editSlug ? '수정' : '발행'}
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        {notice && (
          <div className={cx('notice', `notice--${notice.tone}`)} role={notice.tone === 'error' ? 'alert' : 'status'}>
            <p>{notice.text}</p>
            <button type="button" className="notice__close" onClick={() => setNotice(null)} aria-label="알림 닫기">
              ×
            </button>
          </div>
        )}
        {restored && (
          <div className="notice notice--info" role="status">
            <p>이 브라우저에 남아 있던 임시 저장본을 불러왔습니다.</p>
            <button type="button" className="text-link" onClick={discardDraft}>
              {editSlug ? '임시 저장본 버리고 원본 불러오기' : '임시 저장본 버리기'}
            </button>
          </div>
        )}

        <section className="studio__meta">
          <input
            className="studio__title"
            value={draft.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="제목을 입력하세요"
            aria-label="제목"
          />
          <input
            className="studio__desc"
            value={draft.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder={template ? template.descriptionHint : '목록에 보일 한 줄 요약'}
            aria-label="요약"
          />

          <div className="fields">
            <div className="field">
              <span className="field__label">카테고리</span>
              <div className="segmented" role="radiogroup" aria-label="카테고리">
                {(['experience', 'troubleshooting'] as Category[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={draft.category === c}
                    className={cx('segmented__item', draft.category === c && 'is-active')}
                    onClick={() => set('category', c)}
                  >
                    {c === 'experience' ? '경험' : '트러블슈팅'}
                  </button>
                ))}
              </div>
            </div>
            <label className="field">
              <span className="field__label">작성일</span>
              <input type="date" className="input" value={draft.date} onChange={(e) => set('date', e.target.value)} />
            </label>
            <label className="field field--grow">
              <span className="field__label">태그 (쉼표로 구분)</span>
              <input
                className="input"
                value={draft.tags}
                onChange={(e) => set('tags', e.target.value)}
                placeholder="Next.js, 배포, 성능"
              />
            </label>
          </div>
        </section>

        {template && (
          <div className="outline" aria-label="양식 점검">
            <div className="outline__head">
              <span className="outline__title">{template.name} 양식</span>
              <span className="outline__count">
                {sections.filter((sec) => sec.state === 'filled').length}/{sections.length} 작성
              </span>
            </div>
            <ol className="outline__list">
              {sections.map((sec) => (
                <li key={sec.heading}>
                  <button
                    type="button"
                    className={cx('outline__item', `is-${sec.state}`)}
                    onClick={() => jumpTo(sec.offset)}
                    disabled={sec.state === 'missing'}
                    title={SECTION_LABEL[sec.state]}
                  >
                    <span className="outline__mark" aria-hidden="true" />
                    {sec.heading}
                    <span className="visually-hidden">{SECTION_LABEL[sec.state]}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="pane-switch" role="tablist" aria-label="편집 화면">
          <button type="button" role="tab" aria-selected={pane === 'write'} className={cx('tab', pane === 'write' && 'is-active')} onClick={() => setPane('write')}>
            작성
          </button>
          <button type="button" role="tab" aria-selected={pane === 'preview'} className={cx('tab', pane === 'preview' && 'is-active')} onClick={() => setPane('preview')}>
            미리보기
          </button>
        </div>

        <section className={cx('editor', `editor--${pane}`)}>
          <div className="editor__pane editor__pane--write">
            <div className="toolbar" role="toolbar" aria-label="서식">
              <button type="button" onClick={() => prefixLines('## ')}>제목</button>
              <button type="button" onClick={() => prefixLines('### ')}>소제목</button>
              <button type="button" onClick={() => surround('**', '**', '강조할 내용')}>굵게</button>
              <button type="button" onClick={() => surround('`', '`', 'code')}>코드</button>
              <button type="button" onClick={() => surround('\n```ts\n', '\n```\n', '')}>코드 블록</button>
              <button type="button" onClick={() => prefixLines('> ')}>인용</button>
              <button type="button" onClick={() => prefixLines('- ')}>목록</button>
              <button type="button" onClick={() => surround('[', '](https://)', '링크 텍스트')}>링크</button>
            </div>
            <textarea
              ref={textareaRef}
              className="editor__textarea"
              value={draft.body}
              onChange={(e) => set('body', e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="마크다운으로 작성하세요."
              spellCheck={false}
              aria-label="본문"
            />
            <div className="editor__foot">
              <span>공백 제외 {chars.toLocaleString()}자</span>
            </div>
          </div>

          <div className="editor__pane editor__pane--preview">
            <div className="preview">
              <TroubleBadge category={draft.category} />
              <h1 className="post-head__title">{draft.title || '제목 없음'}</h1>
              {draft.description && <p className="post-head__desc">{draft.description}</p>}
              <div className="meta meta--post">
                <time dateTime={draft.date}>{formatDate(draft.date)}</time>
                {editSlug && <span className="meta__updated">{formatDate(todayISO())} 수정</span>}
              </div>
              {previewHtml ? (
                <div className="prose" dangerouslySetInnerHTML={{ __html: previewHtml }} />
              ) : (
                <p className="preview__empty">본문을 쓰면 여기에 실제 글처럼 보입니다.</p>
              )}
            </div>
          </div>
        </section>

        <p className="studio__back">
          <Link href="/" className="text-link">글 목록으로 돌아가기</Link>
        </p>
      </div>

      {templateDialog && (
        <div className="dialog-backdrop" onMouseDown={() => setTemplateDialog(false)}>
          <div
            className="dialog dialog--wide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="template-title"
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.key === 'Escape' && setTemplateDialog(false)}
          >
            <h2 id="template-title" className="dialog__title">양식 고르기</h2>
            <TemplatePicker current={draft.template} onPick={applyTemplate} onBlank={startBlank} />
            <div className="dialog__actions">
              <button type="button" className="button button--ghost" onClick={() => setTemplateDialog(false)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
