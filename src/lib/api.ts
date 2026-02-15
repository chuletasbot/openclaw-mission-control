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

export async function getMemoryFiles() {
  return toolInvoke('exec', { command: 'find /home/node/.openclaw/workspace -maxdepth 3 -name "*.md" -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/.git/*" | sort' })
}

export async function readFile(path: string) {
  return toolInvoke('Read', { file_path: path })
}

export async function writeFile(path: string, content: string) {
  return toolInvoke('Write', { file_path: path, content })
}

// --- Session actions ---

export async function getSessionHistory(sessionKey: string, limit = 50) {
  return toolInvoke('sessions_history', { sessionKey, limit })
}

export async function sendToSession(sessionKey: string, message: string) {
  return toolInvoke('sessions_send', { sessionKey, message })
}

export async function spawnSession(task: string, label?: string) {
  const args: Record<string, unknown> = { task }
  if (label) args.label = label
  return toolInvoke('sessions_spawn', args)
}

// --- Cron CRUD ---

export async function addCronJob(job: Record<string, unknown>) {
  return toolInvoke('cron', { action: 'add', job })
}

export async function updateCronJob(jobId: string, patch: Record<string, unknown>) {
  return toolInvoke('cron', { action: 'update', jobId, patch })
}

export async function removeCronJob(jobId: string) {
  return toolInvoke('cron', { action: 'remove', jobId })
}

// --- Gateway logs ---

export async function getGatewayLogs(lines = 200) {
  return toolInvoke('exec', { command: `journalctl -u openclaw --no-pager -n ${lines} 2>/dev/null || tail -n ${lines} /tmp/openclaw*.log 2>/dev/null || echo "No logs available"` })
}

export async function listSkills() {
  return toolInvoke('exec', { command: 'ls -1 /app/skills/ 2>/dev/null && echo "---user---" && ls -1 /home/node/.openclaw/workspace/skills/ 2>/dev/null || true' })
}

export async function testConnection(): Promise<{ ok: boolean; status?: string; error?: string }> {
  try {
    const result = await getStatus()
    return { ok: true, status: result?.statusText || 'Connected' }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}
