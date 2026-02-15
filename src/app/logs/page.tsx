'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import GlassCard from '@/components/GlassCard'
import { getGatewayLogs, hasToken } from '@/lib/api'

type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'unknown'

interface LogLine {
  raw: string
  level: LogLevel
  timestamp?: string
  message: string
}

function parseLine(raw: string): LogLine {
  const lower = raw.toLowerCase()
  let level: LogLevel = 'unknown'
  if (lower.includes('error') || lower.includes('err ')) level = 'error'
  else if (lower.includes('warn')) level = 'warn'
  else if (lower.includes('debug') || lower.includes('trace')) level = 'debug'
  else if (lower.includes('info') || lower.includes(' inf ')) level = 'info'

  // Try to extract timestamp
  const tsMatch = raw.match(/^(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}[\w.:+-]*)/)
  return { raw, level, timestamp: tsMatch?.[1], message: raw }
}

const levelColors: Record<LogLevel, string> = {
  error: 'text-[#ff453a]',
  warn: 'text-[#ffd60a]',
  info: 'text-[#30d158]',
  debug: 'text-[#8e8e93]',
  unknown: 'text-[#ebebf5]/60'
}

const levelBg: Record<LogLevel, string> = {
  error: 'bg-[#ff453a]/10',
  warn: 'bg-[#ffd60a]/5',
  info: '',
  debug: '',
  unknown: ''
}

export default function LogsPage() {
  const [lines, setLines] = useState<LogLine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tokenSet, setTokenSet] = useState(false)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all')
  const [autoScroll, setAutoScroll] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const loadLogs = useCallback(() => {
    setLoading(true)
    getGatewayLogs(300)
      .then(data => {
        const text = typeof data === 'string' ? data : data?.stdout || data?.output || String(data)
        const parsed = text.split('\n').filter(Boolean).map(parseLine)
        setLines(parsed)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const has = hasToken()
    setTokenSet(has)
    if (!has) { setLoading(false); return }
    loadLogs()
    const interval = setInterval(loadLogs, 15000)
    return () => clearInterval(interval)
  }, [loadLogs])

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines, autoScroll])

  const filtered = lines.filter(l => {
    if (levelFilter !== 'all' && l.level !== levelFilter) return false
    if (search && !l.raw.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const counts = {
    error: lines.filter(l => l.level === 'error').length,
    warn: lines.filter(l => l.level === 'warn').length,
    info: lines.filter(l => l.level === 'info').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Logs</h1>
          <p className="text-[#8e8e93]">Gateway logs en tiempo real</p>
        </div>
        {tokenSet && (
          <div className="flex gap-2 items-center">
            <div className="flex gap-3 text-xs mr-4">
              {counts.error > 0 && <span className="text-[#ff453a]">● {counts.error} errors</span>}
              {counts.warn > 0 && <span className="text-[#ffd60a]">● {counts.warn} warnings</span>}
            </div>
            <button onClick={() => setAutoScroll(!autoScroll)}
              className={`px-3 py-2 rounded-xl text-xs transition-colors ${autoScroll ? 'bg-[#30d158]/20 text-[#30d158]' : 'bg-white/10 text-[#8e8e93]'}`}>
              {autoScroll ? '⏬ Auto-scroll' : '⏸ Paused'}
            </button>
            <button onClick={loadLogs} className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/15 transition-colors">↻</button>
          </div>
        )}
      </div>

      {!tokenSet && (
        <div className="glass-card p-4 border border-[#ffd60a]/20 flex items-center gap-3">
          <span className="text-xl">🔑</span>
          <div className="flex-1">
            <p className="text-sm text-[#ffd60a] font-medium">Gateway Token Required</p>
          </div>
          <Link href="/settings" className="px-4 py-2 rounded-xl bg-[#7c5cfc] text-white text-sm font-medium hover:bg-[#6b4ce6]">Settings</Link>
        </div>
      )}

      {error && (
        <div className="glass-card p-4 border border-[#ff453a]/20 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <p className="text-sm text-[#ff453a]">{error}</p>
          <button onClick={() => setError('')} className="text-[#ff453a] text-xs ml-auto">✕</button>
        </div>
      )}

      {tokenSet && (
        <div className="flex gap-2 items-center">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#8e8e93] focus:outline-none focus:border-[#7c5cfc]" />
          <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
            {(['all', 'error', 'warn', 'info', 'debug'] as const).map(l => (
              <button key={l} onClick={() => setLevelFilter(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${levelFilter === l ? 'bg-[#7c5cfc] text-white' : 'text-[#8e8e93] hover:text-white'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && lines.length === 0 ? (
        <div className="py-12 text-center text-[#8e8e93]">Loading logs...</div>
      ) : (
        <GlassCard className="p-0 overflow-hidden">
          <div ref={scrollRef} className="max-h-[600px] overflow-y-auto p-4 font-mono text-xs leading-5"
            onScroll={e => {
              const el = e.currentTarget
              const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20
              if (!atBottom && autoScroll) setAutoScroll(false)
            }}>
            {filtered.length > 0 ? filtered.map((l, i) => (
              <div key={i} className={`py-0.5 px-2 rounded ${levelBg[l.level]} ${levelColors[l.level]} hover:bg-white/5`}>
                {l.raw}
              </div>
            )) : (
              <div className="text-center text-[#8e8e93] py-8">
                {search || levelFilter !== 'all' ? 'No matching logs' : 'No logs available'}
              </div>
            )}
          </div>
        </GlassCard>
      )}
    </div>
  )
}
