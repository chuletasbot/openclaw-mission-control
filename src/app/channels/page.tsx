'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import GlassCard from '@/components/GlassCard'
import { getStatus, hasToken } from '@/lib/api'

const channelIcons: Record<string, string> = {
  telegram: '✈️', whatsapp: '📱', discord: '🎮', signal: '🔒',
  slack: '💼', webchat: '🌐', irc: '📡', matrix: '🔗',
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tokenSet, setTokenSet] = useState(false)

  useEffect(() => {
    const has = hasToken()
    setTokenSet(has)
    if (!has) { setLoading(false); return }
    getStatus()
      .then(data => {
        const ch = data.channels as Record<string, unknown>[] | undefined
        if (Array.isArray(ch)) setChannels(ch)
        else if (data.plugins && Array.isArray(data.plugins)) {
          setChannels((data.plugins as Record<string, unknown>[]).map(p => ({
            name: p.name || p.type,
            type: p.type,
            connected: p.connected ?? p.enabled ?? true,
            ...p,
          })))
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Canales</h1>
        <p className="text-[#8e8e93]">Gestión de canales conectados</p>
      </div>

      {!tokenSet && (
        <div className="glass-card p-4 border border-[#ffd60a]/20 flex items-center gap-3">
          <span className="text-xl">🔑</span>
          <div className="flex-1">
            <p className="text-sm text-[#ffd60a] font-medium">Gateway Token Required</p>
            <p className="text-xs text-[#8e8e93]">Configure your token in Settings to view channels.</p>
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
        <div className="py-12 text-center text-[#8e8e93]">Loading channels...</div>
      ) : channels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {channels.map((ch, i) => {
            const name = String(ch.name || ch.type || `Channel ${i + 1}`)
            const type = String(ch.type || ch.name || '').toLowerCase()
            const icon = channelIcons[type] || '💬'
            const connected = ch.connected !== false && ch.enabled !== false
            return (
              <GlassCard key={i}>
                <div className="text-center">
                  <span className="text-4xl block mb-3">{icon}</span>
                  <h3 className="text-lg font-semibold text-white mb-2">{name}</h3>
                  <span className={`inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full ${
                    connected ? 'bg-[#30d158]/15 text-[#30d158]' : 'bg-white/5 text-[#8e8e93]'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-[#30d158]' : 'bg-[#8e8e93]'}`} />
                    {connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </GlassCard>
            )
          })}
        </div>
      ) : tokenSet ? (
        <GlassCard>
          <div className="py-16 text-center">
            <span className="text-5xl block mb-4">💬</span>
            <h2 className="text-xl font-semibold text-white mb-2">No channels found</h2>
            <p className="text-sm text-[#8e8e93]">Channel information will appear here based on your Gateway configuration.</p>
          </div>
        </GlassCard>
      ) : null}
    </div>
  )
}
