'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import GlassCard from '@/components/GlassCard'
import { getStatus, getSessions, hasToken } from '@/lib/api'

export default function Dashboard() {
  const [tokenSet, setTokenSet] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<Record<string, unknown> | null>(null)
  const [sessions, setSessions] = useState<Record<string, unknown>[] | null>(null)

  useEffect(() => {
    const has = hasToken()
    setTokenSet(has)
    if (!has) { setLoading(false); return }

    Promise.all([
      getStatus().catch(() => null),
      getSessions().catch(() => null),
    ]).then(([s, sess]) => {
      if (s) setStatus(s)
      else setError('Could not connect to Gateway')
      if (Array.isArray(sess)) setSessions(sess)
    }).finally(() => setLoading(false))
  }, [])

  const gwOnline = !!status
  const version = status?.version as string || '—'
  const model = (status?.defaultModel || status?.model) as string || '—'
  const uptime = status?.uptime as string || '—'
  const sessionCount = sessions?.length ?? 0
  const channels = status?.channels as Record<string, unknown>[] | undefined
  const channelCount = channels?.length ?? (status?.channelCount as number ?? '—')

  const stats = [
    { label: 'Gateway Status', value: gwOnline ? 'Online' : '—', icon: gwOnline ? '🟢' : '🟡', detail: gwOnline ? `v${version}` : 'Not connected' },
    { label: 'Modelo Activo', value: model, icon: '🧠', detail: gwOnline ? 'Default model' : '—' },
    { label: 'Sesiones Activas', value: gwOnline ? String(sessionCount) : '—', icon: '🔌', detail: gwOnline ? 'Active sessions' : '—' },
    { label: 'Uptime', value: typeof uptime === 'number' ? `${Math.floor(uptime / 3600)}h` : uptime, icon: '⏱️', detail: gwOnline ? 'Gateway uptime' : '—' },
    { label: 'Canales', value: String(channelCount), icon: '💬', detail: gwOnline ? 'Connected channels' : '—' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-[#8e8e93]">Overview de tu instancia OpenClaw</p>
      </div>

      {!tokenSet && (
        <div className="glass-card p-4 border border-[#ffd60a]/20 flex items-center gap-3">
          <span className="text-xl">🔑</span>
          <div className="flex-1">
            <p className="text-sm text-[#ffd60a] font-medium">Gateway Token Required</p>
            <p className="text-xs text-[#8e8e93]">Configure your Gateway token in Settings to see real data.</p>
          </div>
          <Link href="/settings" className="px-4 py-2 rounded-xl bg-[#7c5cfc] text-white text-sm font-medium hover:bg-[#6b4ce6] transition-colors">
            Settings
          </Link>
        </div>
      )}

      {error && tokenSet && (
        <div className="glass-card p-4 border border-[#ff453a]/20 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="text-sm text-[#ff453a] font-medium">Connection Error</p>
            <p className="text-xs text-[#8e8e93]">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-[#8e8e93]">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            {stats.map((stat) => (
              <GlassCard key={stat.label} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-[#8e8e93] mb-1">{stat.label}</p>
                    <p className="text-xl font-bold text-white truncate">{stat.value}</p>
                    <p className="text-xs text-[#8e8e93]/60 mt-1">{stat.detail}</p>
                  </div>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
              </GlassCard>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <GlassCard>
              <h2 className="text-lg font-semibold text-white mb-4">Recent Sessions</h2>
              {sessions && sessions.length > 0 ? (
                <div className="space-y-2">
                  {sessions.slice(0, 5).map((s, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                      <div className="w-2 h-2 rounded-full bg-[#30d158]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{String(s.label || s.id || s.channel || `Session ${i + 1}`)}</p>
                        <p className="text-xs text-[#8e8e93]">{String(s.channel || s.type || '—')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <span className="text-3xl block mb-2">📭</span>
                  <p className="text-sm text-[#8e8e93]">No active sessions</p>
                </div>
              )}
            </GlassCard>

            <GlassCard>
              <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Nueva Tarea', icon: '➕', href: '/tasks' },
                  { label: 'Ver Sesiones', icon: '🔌', href: '/sessions' },
                  { label: 'Cron Jobs', icon: '⏰', href: '/cron' },
                  { label: 'Ver Logs', icon: '📝', href: '/logs' },
                ].map((action) => (
                  <Link key={action.label} href={action.href || '#'}>
                    <div className="glass-card p-4 text-left hover:bg-white/10 transition-all duration-200 cursor-pointer">
                      <span className="text-xl block mb-2">{action.icon}</span>
                      <span className="text-sm text-[#8e8e93]">{action.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </GlassCard>
          </div>
        </>
      )}
    </div>
  )
}
