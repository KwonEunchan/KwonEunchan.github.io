import { siteConfig } from '@/site.config'

export interface Credentials {
  owner: string
  repo: string
  branch: string
  token: string
}

export interface Session {
  creds: Credentials
  login: string
  remembered: boolean
}

const KEY = 'blog:admin'
export const CREDENTIALS_EVENT = 'blog:credentials'
export const OPEN_AUTH_EVENT = 'blog:open-auth'

export function defaultCredentials(): Credentials {
  return {
    owner: siteConfig.github.owner,
    repo: siteConfig.github.repo,
    branch: siteConfig.github.branch,
    token: '',
  }
}

export function loadSession(): Session | null {
  if (typeof window === 'undefined') return null
  try {
    const local = window.localStorage.getItem(KEY)
    const raw = local ?? window.sessionStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { creds?: Partial<Credentials>; login?: string }
    const creds = { ...defaultCredentials(), ...parsed.creds }
    if (!creds.token || !parsed.login) return null
    return { creds, login: parsed.login, remembered: Boolean(local) }
  } catch {
    return null
  }
}

export function saveSession(creds: Credentials, login: string, remember: boolean): void {
  try {
    const value = JSON.stringify({ creds, login })
    if (remember) {
      window.localStorage.setItem(KEY, value)
      window.sessionStorage.removeItem(KEY)
    } else {
      window.sessionStorage.setItem(KEY, value)
      window.localStorage.removeItem(KEY)
    }
    window.dispatchEvent(new Event(CREDENTIALS_EVENT))
  } catch {}
}

export function clearSession(): void {
  try {
    window.localStorage.removeItem(KEY)
    window.sessionStorage.removeItem(KEY)
    window.dispatchEvent(new Event(CREDENTIALS_EVENT))
  } catch {}
}

export function openAuthDialog(): void {
  window.dispatchEvent(new Event(OPEN_AUTH_EVENT))
}
