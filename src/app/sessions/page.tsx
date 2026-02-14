'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import GlassCard from '@/components/GlassCard'
import { getSessions, hasToken } from '@/lib/api'

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tokenSet, setTokenSet] = useState(false)

  useEffect(() => {
    const has = hasToken()
    setTokenSet(has)
    if (!has) { setLoading(false); return }
    getSessions()
      .then(data => setSessions(Array.isArray(data) ? data : []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Sesiones</h1>
        <p className="text-[#8e8e93]">Monitor de sesiones activas y completadas</p>
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
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-[#8e8e93]">Loading sessions...</div>
      ) : sessions.length > 0 ? (
        <div className="space-y-3">
          {sessions.map((s, i) => (
            <GlassCard key={i} className="p-4">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${s.active ? 'bg-[#30d158] animate-pulse' : 'bg-[#8e8e93]'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {String(s.label || s.id || `Session ${i + 1}`)}
                  </p>
                  <p className="text-xs text-[#8e8e93]">
                    {[s.channel, s.type, s.model].filter(Boolean).join(' · ') || 'Unknown'}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
                    s.active ? 'bg-[#30d158]/15 text-[#30d158]' : 'bg-white/5 text-[#8e8e93]'
                  }`}>
                    {s.active ? 'Active' : 'Completed'}
                  </span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : tokenSet ? (
        <GlassCard>
          <div className="py-16 text-center">
            <span className="text-5xl block mb-4">🔌</span>
            <h2 className="text-xl font-semibold text-white mb-2">No active sessions</h2>
            <p className="text-sm text-[#8e8e93]">Sessions will appear here when the agent is active.</p>
          </div>
        </GlassCard>
      ) : null}
    </div>
  )
}
