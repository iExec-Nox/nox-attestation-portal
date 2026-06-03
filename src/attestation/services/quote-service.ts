import type { CvmInfo, QuoteApiResponse, AppInfoApiResponse } from '../types/index.ts'

const CVMS_URL = (import.meta.env.VITE_CVMS_URL as string) ?? '/api/cvms'

function cvmFetch(cvmUrl: string, path: string): Promise<Response> {
  return fetch(`${cvmUrl}${path}`)
}

export async function fetchCvms(): Promise<CvmInfo[]> {
  const res = await fetch(CVMS_URL)
  if (!res.ok) throw new Error(`Failed to fetch CVMs: ${res.status} ${res.statusText}`)
  return res.json() as Promise<CvmInfo[]>
}

export async function fetchQuote(cvmUrl: string, challenge: string): Promise<QuoteApiResponse> {
  const res = await cvmFetch(cvmUrl, `/quote?data=${challenge}`)
  if (!res.ok) throw new Error(`Failed to fetch quote: ${res.status} ${res.statusText}`)
  return res.json() as Promise<QuoteApiResponse>
}

function hasComposeShape(payload: unknown): boolean {
  if (typeof payload !== 'object' || payload === null) return false
  const keys = new Set(Object.keys(payload as Record<string, unknown>))
  return [
    'manifest_version',
    'name',
    'runner',
    'services',
    'docker_compose_file',
    'app_compose',
  ].some((k) => keys.has(k))
}

function looksLikeComposeText(value: string): boolean {
  const t = value.trim()
  if (!t) return false
  if (t.startsWith('{') || t.startsWith('[')) {
    try {
      if (hasComposeShape(JSON.parse(t))) return true
    } catch {
      /* continue */
    }
  }
  return /\n|^version:|^services:|image:|manifest_version|docker_compose_file/i.test(t)
}

function findAppCompose(payload: unknown): string | undefined {
  if (typeof payload === 'string') return looksLikeComposeText(payload) ? payload : undefined
  if (typeof payload !== 'object' || payload === null) return undefined
  const entry = payload as Record<string, unknown>

  for (const key of ['docker_compose_file', 'app_compose', 'appCompose']) {
    const val = entry[key]
    if (typeof val === 'string' && val.trim()) return val
  }
  if (entry.tcb_info) {
    const nested = findAppCompose(entry.tcb_info)
    if (nested) return nested
  }
  for (const key of ['compose', 'manifest', 'compose_content', 'composeContent']) {
    const val = entry[key]
    if (typeof val === 'string' && val.trim()) return val
  }
  for (const value of Object.values(entry)) {
    const candidate = findAppCompose(value)
    if (candidate) return candidate
  }
  return undefined
}

export async function fetchAppInfo(cvmUrl: string): Promise<AppInfoApiResponse> {
  const res = await cvmFetch(cvmUrl, '/info')
  if (!res.ok) throw new Error(`Failed to fetch info: ${res.status} ${res.statusText}`)

  const text = await res.text()
  if (!text.trim()) return { app_compose: '' }

  try {
    const body = JSON.parse(text)
    const app_compose = findAppCompose(body)
    if (app_compose !== undefined) return { app_compose }
    if (hasComposeShape(body)) return { app_compose: text }
  } catch {
    /* not JSON */
  }

  if (looksLikeComposeText(text)) return { app_compose: text }
  return { app_compose: '' }
}
