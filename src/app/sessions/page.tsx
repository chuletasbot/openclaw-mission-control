'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import GlassCard from '@/components/GlassCard'
import { getSessions, getSessionHistory, sendToSession, spawnSession, hasToken } from '@/lib/api'

interface Session {
  id?: string
  sessionKey?: string
  label?: string
  channel?: string
  type?: string
  model?: string
  active?: boolean
  kind?: string
  lastMessages?: Array<{ role?: string; content?: string; timestamp?: string }>
  [key: string]: unknown
}

interface HistoryMessage {
  role?: string
  content?: string
  timestamp?: string
  [key: string]: unknown
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tokenSet, setTokenSet] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  // Detail panel
  const [selected, setSelected] = useState<Session | null>(null)
  const [history, setHistory] = useState<HistoryMessage[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // Send message
  const [sendMsg, setSendMsg] = useState('')
  const [sending, setSending] = useState(false)

  // Spawn
  const [showSpawn, setShowSpawn] = useState(false)
  const [spawnTask, setSpawnTask] = useState('')
  const [spawnLabel, setSpawnLabel] = useState('')
  const [spawning, setSpawning] = useState(false)

  const loadSessions = useCallback(() => {
    setLoading(true)
    getSessions(50)
      .then(data => setSessions(Array.isArray(data) ? data : []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const has = hasToken()
    setTokenSet(has)
    if (!has) { setLoading(false); return }
    loadSessions()
  }, [loadSessions])

  const filteredSessions = sessions.filter(s => {
    if (filter === 'active') return s.active
    if (filter === 'completed') return !s.active
    return true
  })

  const openSession = async (s: Session) => {
    setSelected(s)
    setHistory([])
    const key = s.sessionKey || s.id
    if (!key) return
    setHistoryLoading(true)
    try {
      const data = await getSessionHistory(key, 30)
      setHistory(Array.isArray(data) ? data : data?.messages || [])
    } catch {
      setHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleSend = async () => {
    if (!sendMsg.trim() || !selected) return
    const key = selected.sessionKey || selected.id
    if (!key) return
    setSending(true)
    try {
      await sendToSession(key, sendMsg)
      setSendMsg('')
      // Refresh history
      const data = await getSessionHistory(key, 30)
      setHistory(Array.isArray(data) ? data : data?.messages || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Send failed')
    } finally {
      setSending(false)
    }
  }

  const handleSpawn = async () => {
    if (!spawnTask.trim()) return
    setSpawning(true)
    try {
      await spawnSession(spawnTask, spawnLabel || undefined)
      setShowSpawn(false)
      setSpawnTask('')
      setSpawnLabel('')
      setTimeout(loadSessions, 2000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Spawn failed')
    } finally {
      setSpawning(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Sesiones</h1>
          <p className="text-[#8e8e93]">Monitor de sesiones activas y sub-agentes</p>
        </div>
        <div className="flex gap-2">
          {tokenSet && (
            <>
              <button onClick={() => setShowSpawn(true)} className="px-4 py-2 rounded-xl bg-[#7c5cfc] text-white text-sm font-medium hover:bg-[#6b4ce6] transition-colors">
                + Spawn
              </button>
              <button onClick={loadSessions} className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/15 transition-colors">
                ↻
              </button>
            </>
          )}
        </div>
      </div>

      {!tokenSet && (
        <div className="glass-card p-4 border border-[#ffd60a]/20 flex items-center gap-3">
          <span className="text-xl">🔑</span>
          <div className="flex-1">
            <p className="text-sm text-[#ffd60a] font-medium">Gateway Token Required</p>
            <p className="text-xs text-[#8e8e93]">Configure your token in Settings to view sessions.</p>
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
          <button onClick={() => setError('')} className="text-[#ff453a] text-xs ml-auto">✕</button>
        </div>
      )}

      {/* Filter tabs */}
      {tokenSet && !loading && sessions.length > 0 && (
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit">
          {(['all', 'active', 'completed'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-[#7c5cfc] text-white' : 'text-[#8e8e93] hover:text-white'}`}>
              {f === 'all' ? `All (${sessions.length})` : f === 'active' ? `Active (${sessions.filter(s => s.active).length})` : `Done (${sessions.filter(s => !s.active).length})`}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-6">
        {/* Session list */}
        <div className={`space-y-3 ${selected ? 'w-1/2' : 'w-full'} transition-all`}>
          {loading ? (
            <div className="py-12 text-center text-[#8e8e93]">Loading sessions...</div>
          ) : filteredSessions.length > 0 ? (
            filteredSessions.map((s, i) => (
              <GlassCard key={i} className={`p-4 cursor-pointer hover:bg-white/5 transition-colors ${selected?.id === s.id ? 'ring-1 ring-[#7c5cfc]' : ''}`}
                onClick={() => openSession(s)}>
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${s.active ? 'bg-[#30d158] animate-pulse' : 'bg-[#8e8e93]'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {String(s.label || s.id || `Session ${i + 1}`)}
                    </p>
                    <p className="text-xs text-[#8e8e93]">
                      {[s.channel, s.kind, s.model].filter(Boolean).join(' · ') || 'Unknown'}
                    </p>
                    {s.lastMessages?.[0]?.content && (
                      <p className="text-xs text-[#8e8e93]/60 mt-1 truncate">
                        {String(s.lastMessages[0].content).slice(0, 80)}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full flex-shrink-0 ${s.active ? 'bg-[#30d158]/15 text-[#30d158]' : 'bg-white/5 text-[#8e8e93]'}`}>
                    {s.active ? 'Active' : 'Done'}
                  </span>
                </div>
              </GlassCard>
            ))
          ) : tokenSet ? (
            <GlassCard><div className="py-16 text-center">
              <span className="text-5xl block mb-4">🔌</span>
              <h2 className="text-xl font-semibold text-white mb-2">No sessions found</h2>
            </div></GlassCard>
          ) : null}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-1/2 space-y-4">
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-white truncate">{String(selected.label || selected.id)}</h2>
                <button onClick={() => setSelected(null)} className="text-[#8e8e93] hover:text-white text-sm">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-[#8e8e93]">Key</div><div className="text-white font-mono truncate">{String(selected.sessionKey || selected.id || '—')}</div>
                <div className="text-[#8e8e93]">Channel</div><div className="text-white">{String(selected.channel || '—')}</div>
                <div className="text-[#8e8e93]">Kind</div><div className="text-white">{String(selected.kind || '—')}</div>
                <div className="text-[#8e8e93]">Model</div><div className="text-white truncate">{String(selected.model || '—')}</div>
              </div>
            </GlassCard>

            {/* History */}
            <GlassCard className="p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Historial</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {historyLoading ? (
                  <p className="text-xs text-[#8e8e93] text-center py-4">Loading...</p>
                ) : history.length > 0 ? (
                  history.map((m, i) => (
                    <div key={i} className={`text-xs p-2 rounded-lg ${m.role === 'assistant' ? 'bg-[#7c5cfc]/10 text-[#c4b5fd]' : m.role === 'user' ? 'bg-white/5 text-white' : 'bg-[#ffd60a]/10 text-[#ffd60a]'}`}>
                      <span className="font-medium opacity-60">{m.role || 'system'}: </span>
                      <span className="break-words">{String(m.content || '').slice(0, 500)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#8e8e93] text-center py-4">No history available</p>
                )}
              </div>
            </GlassCard>

            {/* Send message */}
            <GlassCard className="p-4">
              <h3 className="text-sm font-semibold text-white mb-2">Enviar mensaje</h3>
              <div className="flex gap-2">
                <input value={sendMsg} onChange={e => setSendMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#8e8e93] focus:outline-none focus:border-[#7c5cfc]" />
                <button onClick={handleSend} disabled={sending || !sendMsg.trim()}
                  className="px-4 py-2 rounded-lg bg-[#7c5cfc] text-white text-sm font-medium hover:bg-[#6b4ce6] transition-colors disabled:opacity-50">
                  {sending ? '...' : 'Send'}
                </button>
              </div>
            </GlassCard>
          </div>
        )}
      </div>

      {/* Spawn modal */}
      {showSpawn && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowSpawn(false)}>
          <div className="glass-card p-6 w-full max-w-lg mx-4 border border-white/10" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">Spawn Sub-Agent</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#8e8e93] block mb-1">Task *</label>
                <textarea value={spawnTask} onChange={e => setSpawnTask(e.target.value)} rows={3}
                  placeholder="Describe the task for the sub-agent..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#8e8e93] focus:outline-none focus:border-[#7c5cfc] resize-none" />
              </div>
              <div>
                <label className="text-xs text-[#8e8e93] block mb-1">Label (optional)</label>
                <input value={spawnLabel} onChange={e => setSpawnLabel(e.target.value)}
                  placeholder="e.g. research-task"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#8e8e93] focus:outline-none focus:border-[#7c5cfc]" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowSpawn(false)} className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/15">Cancel</button>
                <button onClick={handleSpawn} disabled={spawning || !spawnTask.trim()}
                  className="px-4 py-2 rounded-lg bg-[#7c5cfc] text-white text-sm font-medium hover:bg-[#6b4ce6] disabled:opacity-50">
                  {spawning ? 'Spawning...' : 'Spawn'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
