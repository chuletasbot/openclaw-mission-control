'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import GlassCard from '@/components/GlassCard'
import { hasToken } from '@/lib/api'

// Uses toolInvoke directly for lab-specific calls
async function toolInvoke(tool: string, args: Record<string, unknown> = {}) {
  const baseUrl = localStorage.getItem('oc-gateway-url') || ''
  const token = localStorage.getItem('oc-gateway-token') || ''
  const res = await fetch(`${baseUrl}/tools/invoke`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ tool, args })
  })
  if (!res.ok) throw new Error(`API ${res.status}`)
  const data = await res.json()
  if (!data.ok) throw new Error(data.result?.error || 'API error')
  return data.result?.details ?? data.result
}

interface SpawnedTask {
  id: string
  task: string
  status: 'running' | 'done' | 'error'
  result?: string
  startedAt: number
}

export default function LabPage() {
  const [tokenSet, setTokenSet] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('')
  const [sending, setSending] = useState(false)
  const [tasks, setTasks] = useState<SpawnedTask[]>([])
  const [sessions, setSessions] = useState<Record<string, unknown>[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setTokenSet(hasToken())
  }, [])

  const loadSessions = async () => {
    setLoadingSessions(true)
    try {
      const data = await toolInvoke('sessions_list', { limit: 20, kinds: ['isolated'], messageLimit: 2 })
      setSessions(Array.isArray(data) ? data : (data?.sessions || []))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoadingSessions(false)
    }
  }

  useEffect(() => {
    if (tokenSet) loadSessions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenSet])

  const spawnTask = async () => {
    if (!prompt.trim()) return
    setSending(true)
    setError('')
    const taskText = prompt.trim()
    setPrompt('')
    const taskId = Date.now().toString()
    const newTask: SpawnedTask = { id: taskId, task: taskText, status: 'running', startedAt: Date.now() }
    setTasks(prev => [newTask, ...prev])

    try {
      const args: Record<string, unknown> = { task: taskText }
      if (model.trim()) args.model = model.trim()
      const result = await toolInvoke('sessions_spawn', args)
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'done' as const, result: JSON.stringify(result, null, 2) } : t))
      loadSessions()
    } catch (e) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'error' as const, result: (e as Error).message } : t))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Lab</h1>
          <p className="text-[#8e8e93]">Sandbox de tareas y sub-agentes aislados</p>
        </div>
        {tokenSet && (
          <button onClick={loadSessions} className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/15 transition-colors">
            ↻ Refresh
          </button>
        )}
      </div>

      {!tokenSet && (
        <div className="glass-card p-4 border border-[#ffd60a]/20 flex items-center gap-3">
          <span className="text-xl">🔑</span>
          <div className="flex-1">
            <p className="text-sm text-[#ffd60a] font-medium">Gateway Token Required</p>
            <p className="text-xs text-[#8e8e93]">Configure your token in Settings.</p>
          </div>
          <Link href="/settings" className="px-4 py-2 rounded-xl bg-[#7c5cfc] text-white text-sm font-medium hover:bg-[#6b4ce6] transition-colors">
            Settings
          </Link>
        </div>
      )}

      {error && (
        <div className="glass-card p-4 border border-[#ff453a]/20 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <p className="text-sm text-[#ff453a]">{error}</p>
          <button onClick={() => setError('')} className="text-xs text-[#8e8e93] hover:text-white ml-auto">✕</button>
        </div>
      )}

      {tokenSet && (
        <>
          {/* Spawn task */}
          <GlassCard className="p-5">
            <h2 className="text-sm font-semibold text-white mb-3">🚀 Spawn Sub-Agent Task</h2>
            <div className="space-y-3">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the task for the sub-agent..."
                className="w-full h-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#8e8e93]/50 resize-none focus:outline-none focus:border-[#7c5cfc]/50 transition-colors"
                onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) spawnTask() }}
              />
              <div className="flex items-center gap-3">
                <input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Model override (optional)"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-[#8e8e93]/50 focus:outline-none focus:border-[#7c5cfc]/50 transition-colors"
                />
                <button
                  onClick={spawnTask}
                  disabled={sending || !prompt.trim()}
                  className="px-5 py-2 rounded-xl bg-[#7c5cfc] text-white text-sm font-medium hover:bg-[#6b4ce6] transition-colors disabled:opacity-50 shrink-0"
                >
                  {sending ? '⏳ Spawning...' : '🧪 Run'}
                </button>
              </div>
              <p className="text-xs text-[#8e8e93]">⌘+Enter to run. Task runs in an isolated session.</p>
            </div>
          </GlassCard>

          {/* Recent spawned tasks */}
          {tasks.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-white">Recent Tasks</h2>
              {tasks.map(task => (
                <GlassCard key={task.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">
                      {task.status === 'running' ? '⏳' : task.status === 'done' ? '✅' : '❌'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{task.task}</p>
                      {task.result && (
                        <pre className="mt-2 text-xs text-[#8e8e93] bg-white/5 rounded-lg p-3 overflow-auto max-h-40 font-mono whitespace-pre-wrap">
                          {task.result}
                        </pre>
                      )}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {/* Isolated sessions */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-white">Isolated Sessions</h2>
            {loadingSessions ? (
              <div className="py-8 text-center text-[#8e8e93] text-sm">Loading sessions...</div>
            ) : sessions.length > 0 ? (
              sessions.map((s, i) => {
                const key = String(s.sessionKey || s.key || i)
                const label = String(s.label || s.kind || 'isolated')
                const msgs = Array.isArray(s.messages) ? s.messages : []
                const lastMsg = msgs.length > 0 ? String((msgs[msgs.length - 1] as Record<string, unknown>)?.content || '').slice(0, 120) : ''
                return (
                  <GlassCard key={key} className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🧪</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{label}</p>
                        <p className="text-xs text-[#8e8e93] font-mono truncate">{key}</p>
                        {lastMsg && <p className="text-xs text-[#8e8e93]/60 mt-1 truncate">{lastMsg}</p>}
                      </div>
                    </div>
                  </GlassCard>
                )
              })
            ) : (
              <GlassCard>
                <div className="py-10 text-center">
                  <span className="text-4xl block mb-3">🧪</span>
                  <p className="text-sm text-[#8e8e93]">No isolated sessions running</p>
                </div>
              </GlassCard>
            )}
          </div>
        </>
      )}
    </div>
  )
}
