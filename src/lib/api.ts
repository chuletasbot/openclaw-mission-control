// OpenClaw Gateway API Client
// Proxied via /api/proxy to avoid CORS

export interface ApiConfig {
  baseUrl: string
  token: string
}

export function getConfig(): ApiConfig {
  if (typeof window === 'undefined') return { baseUrl: '', token: '' }
  return {
    baseUrl: localStorage.getItem('oc-gateway-url') || '',
    token: localStorage.getItem('oc-gateway-token') || ''
  }
}

export function saveConfig(config: Partial<ApiConfig>) {
  if (config.baseUrl !== undefined) localStorage.setItem('oc-gateway-url', config.baseUrl)
  if (config.token !== undefined) localStorage.setItem('oc-gateway-token', config.token)
}

export function isConfigured(): boolean {
  const { token } = getConfig()
  return token.length > 0
}

export function hasToken(): boolean {
  return isConfigured()
}

async function toolInvoke(tool: string, args: Record<string, unknown> = {}) {
  const { baseUrl, token } = getConfig()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (baseUrl) headers['x-gateway-url'] = baseUrl
  if (token) headers['x-gateway-token'] = token

  const res = await fetch('/api/proxy', {
    method: 'POST',
    headers,
    body: JSON.stringify({ tool, args })
  })
  if (!res.ok) throw new Error(`API ${res.status}`)
  const data = await res.json()
  if (!data.ok) throw new Error(data.result?.error || data.error || 'API error')
  return data.result?.details ?? data.result
}

export async function getStatus() {
  return toolInvoke('session_status', {})
}

export async function getSessions(limit = 20) {
  return toolInvoke('sessions_list', { limit, messageLimit: 1 })
}

export async function getCronJobs() {
  return toolInvoke('cron', { action: 'list' })
}

export async function runCronJob(jobId: string) {
  return toolInvoke('cron', { action: 'run', jobId })
}

export async function testConnection(): Promise<{ ok: boolean; status?: string; error?: string }> {
  try {
    const result = await getStatus()
    return { ok: true, status: result?.statusText || 'Connected' }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}
