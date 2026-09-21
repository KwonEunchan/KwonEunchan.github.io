import type { Credentials } from './credentials'

const API = 'https://api.github.com'

export class GitHubError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function gh<T>(creds: Credentials, path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (creds.token) headers.Authorization = `Bearer ${creds.token}`
  if (init.body) headers['Content-Type'] = 'application/json'
  const res = await fetch(`${API}${path}`, { ...init, headers, cache: 'no-store' })
  if (!res.ok) {
    let message = res.statusText
    try {
      const json = await res.json()
      if (json?.message) message = json.message
    } catch {}
    throw new GitHubError(res.status, message)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

const repoPath = (c: Credentials) => `/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}`

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

export function textToBase64(text: string): string {
  return bytesToBase64(new TextEncoder().encode(text))
}

export function base64ToText(base64: string): string {
  const binary = atob(base64.replace(/\s/g, ''))
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export async function checkToken(creds: Credentials): Promise<boolean> {
  try {
    await gh(creds, '/user')
    return true
  } catch (error) {
    if (error instanceof GitHubError && error.status === 401) return false
    return true
  }
}

export async function verifyAccess(creds: Credentials): Promise<{ login: string }> {
  const user = await gh<{ login: string }>(creds, '/user')
  const repo = await gh<{ permissions?: { push?: boolean } }>(creds, repoPath(creds))
  if (!repo.permissions?.push) {
    throw new GitHubError(403, 'no-push')
  }
  await gh(creds, `${repoPath(creds)}/branches/${encodeURIComponent(creds.branch)}`)
  return { login: user.login }
}

export async function fetchFile(creds: Credentials, filePath: string): Promise<string | null> {
  const encoded = filePath.split('/').map(encodeURIComponent).join('/')
  try {
    const file = await gh<{ content: string }>(
      creds,
      `${repoPath(creds)}/contents/${encoded}?ref=${encodeURIComponent(creds.branch)}`,
    )
    return base64ToText(file.content)
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) return null
    throw error
  }
}

export interface FileChange {
  path: string
  content?: string
  remove?: boolean
}

export async function commitFiles(
  creds: Credentials,
  changes: FileChange[],
  message: string,
): Promise<{ sha: string; url: string }> {
  const base = repoPath(creds)
  const branch = encodeURIComponent(creds.branch)
  const ref = await gh<{ object: { sha: string } }>(creds, `${base}/git/ref/heads/${branch}`)
  const parent = await gh<{ tree: { sha: string } }>(creds, `${base}/git/commits/${ref.object.sha}`)

  const tree = await Promise.all(
    changes.map(async (change) => {
      if (change.remove) {
        return { path: change.path, mode: '100644', type: 'blob', sha: null }
      }
      const blob = await gh<{ sha: string }>(creds, `${base}/git/blobs`, {
        method: 'POST',
        body: JSON.stringify({ content: change.content ?? '', encoding: 'base64' }),
      })
      return { path: change.path, mode: '100644', type: 'blob', sha: blob.sha }
    }),
  )

  const newTree = await gh<{ sha: string }>(creds, `${base}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({ base_tree: parent.tree.sha, tree }),
  })
  const commit = await gh<{ sha: string; html_url: string }>(creds, `${base}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({ message, tree: newTree.sha, parents: [ref.object.sha] }),
  })
  await gh(creds, `${base}/git/refs/heads/${branch}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha }),
  })
  return { sha: commit.sha, url: commit.html_url }
}

export function explainError(error: unknown): string {
  if (error instanceof GitHubError) {
    if (error.message === 'no-push') return '쓰기 권한이 없는 토큰입니다.'
    switch (error.status) {
      case 401:
        return '유효하지 않은 토큰입니다.'
      case 403:
        return '요청이 거부되었습니다.'
      case 404:
        return '저장소를 찾을 수 없습니다.'
      case 409:
      case 422:
        return '저장소가 변경되었습니다. 다시 시도하세요.'
      default:
        return `요청에 실패했습니다. (${error.status})`
    }
  }
  if (error instanceof TypeError) return '네트워크 연결을 확인하세요.'
  return error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
}
