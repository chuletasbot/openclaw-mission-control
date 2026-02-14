'use client'

import { useState } from 'react'
import GlassCard from '@/components/GlassCard'

type Status = 'active' | 'idle' | 'completed'

interface SubAgent {
  label: string
  status: 'running' | 'completed' | 'failed'
  runtime: string
}

interface Session {
  id: string
  name: string
  channel: string
  channelEmoji: string
  lastMessage: string
  tokens: string
  status: Status
  startedAt: string
  subAgents: SubAgent[]
}

const sessions: Session[] = [
  {
    id: '1', name: 'Main Session', channel: 'Telegram', channelEmoji: '💬',
    lastMessage: 'Construir las páginas del Mission Control que quedaron como placeholder...',
    tokens: '12.4k', status: 'active', startedAt: '10:32 AM',
    subAgents: [
      { label: 'mc-features-v2', status: 'running', runtime: '4m 22s' },
      { label: 'git-sync', status: 'completed', runtime: '1m 05s' },
    ],
  },
  {
    id: '2', name: 'Chat Eduardo', channel: 'Telegram', channelEmoji: '💬',
    lastMessage: 'Dame un resumen de las noticias de hoy sobre AI...',
    tokens: '8.1k', status: 'active', startedAt: '09:15 AM',
    subAgents: [{ label: 'web-search', status: 'completed', runtime: '32s' }],
  },
  {
    id: '3', name: 'Webchat Debug', channel: 'Webchat', channelEmoji: '🌐',
    lastMessage: 'Testing the new dashboard layout with glass cards...',
    tokens: '3.2k', status: 'idle', startedAt: '08:00 AM',
    subAgents: [],
  },
  {
    id: '4', name: 'Deploy Pipeline', channel: 'Webchat', channelEmoji: '🌐',
    lastMessage: 'Pipeline completed successfully. All tests passed.',
    tokens: '15.7k', status: 'completed', startedAt: 'Yesterday',
    subAgents: [
      { label: 'test-runner', status: 'completed', runtime: '2m 41s' },
      { label: 'docker-build', status: 'failed', runtime: '5m 12s' },
    ],
  },
  {
    id: '5', name: 'Cron: Noticias', channel: 'Telegram', channelEmoji: '💬',
    lastMessage: 'Resumen enviado correctamente a las 8:30 AM.',
    tokens: '2.0k', status: 'completed', startedAt: '08:30 AM',
    subAgents: [],
  },
]

const statusConfig: Record<Status, { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: 'text-[#30d158]', bg: 'bg-[#30d158]/15' },
  idle: { label: 'Idle', color: 'text-[#ffd60a]', bg: 'bg-[#ffd60a]/15' },
  completed: { label: 'Completed', color: 'text-[#8e8e93]', bg: 'bg-white/5' },
}

type Filter = 'all' | Status

export default function SessionsPage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = filter === 'all' ? sessions : sessions.filter(s => s.status === filter)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Sesiones</h1>
        <p className="text-[#8e8e93]">Monitor de sesiones activas y completadas</p>
      </div>

      <div className="flex gap-2">
        {(['all', 'active', 'idle', 'completed'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? 'bg-[#7c5cfc] text-white'
                : 'glass-card text-[#8e8e93] hover:text-white'
            }`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ml-2 text-xs opacity-60">
              {f === 'all' ? sessions.length : sessions.filter(s => s.status === f).length}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(session => {
          const sc = statusConfig[session.status]
          const isOpen = expanded === session.id
          return (
            <GlassCard
              key={session.id}
              className="cursor-pointer hover:bg-white/5 transition-all"
              onClick={() => setExpanded(isOpen ? null : session.id)}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{session.channelEmoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">{session.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>{sc.label}</span>
                  </div>
                  <p className="text-sm text-[#8e8e93] truncate">{session.lastMessage}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm text-white">{session.tokens} tokens</p>
                  <p className="text-xs text-[#8e8e93]">{session.startedAt}</p>
                </div>
                <span className={`text-[#8e8e93] transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
              </div>

              {isOpen && (
                <div className="mt-4 pt-4 border-t border-white/5 space-y-4" onClick={e => e.stopPropagation()}>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div><span className="text-[#8e8e93]">Canal</span><p className="text-white">{session.channelEmoji} {session.channel}</p></div>
                    <div><span className="text-[#8e8e93]">Tokens</span><p className="text-white">{session.tokens}</p></div>
                    <div><span className="text-[#8e8e93]">Inicio</span><p className="text-white">{session.startedAt}</p></div>
                  </div>

                  {session.subAgents.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-2">Sub-agentes</h3>
                      <div className="space-y-2">
                        {session.subAgents.map((sa, i) => (
                          <div key={i} className="flex items-center gap-3 glass-card p-3 text-sm">
                            <span>
                              {sa.status === 'running' ? '🔄' : sa.status === 'completed' ? '✅' : '❌'}
                            </span>
                            <span className="text-white flex-1">{sa.label}</span>
                            <span className="text-[#8e8e93]">{sa.runtime}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="glass-card p-3">
                    <p className="text-xs text-[#8e8e93] mb-1">Último mensaje</p>
                    <p className="text-sm text-white">{session.lastMessage}</p>
                  </div>
                </div>
              )}
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
