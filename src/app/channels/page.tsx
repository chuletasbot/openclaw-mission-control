'use client'

import GlassCard from '@/components/GlassCard'

const channels = [
  { name: 'Telegram', icon: '✈️', connected: false, detail: 'Not configured' },
  { name: 'WhatsApp', icon: '📱', connected: false, detail: 'Not configured' },
  { name: 'Discord', icon: '🎮', connected: false, detail: 'Not configured' },
  { name: 'Signal', icon: '🔒', connected: false, detail: 'Not configured' },
]

export default function ChannelsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Canales</h1>
        <p className="text-[#8e8e93]">Gestión de canales conectados</p>
      </div>

      <div className="glass-card p-4 border border-[#ffd60a]/20 flex items-center gap-3">
        <span className="text-xl">🔌</span>
        <div>
          <p className="text-sm text-[#ffd60a] font-medium">Pending Integration</p>
          <p className="text-xs text-[#8e8e93]">Channel status will update automatically once the Gateway API is connected.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {channels.map(ch => (
          <GlassCard key={ch.name}>
            <div className="text-center">
              <span className="text-4xl block mb-3">{ch.icon}</span>
              <h3 className="text-lg font-semibold text-white mb-2">{ch.name}</h3>
              <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full bg-white/5 text-[#8e8e93]">
                ⭘ Not connected
              </span>
              <p className="text-xs text-[#8e8e93] mt-2">{ch.detail}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard>
        <h2 className="text-lg font-semibold text-white mb-4">Pairing Requests</h2>
        <div className="py-8 text-center">
          <span className="text-3xl block mb-2">📭</span>
          <p className="text-sm text-[#8e8e93]">No hay solicitudes pendientes</p>
        </div>
      </GlassCard>
    </div>
  )
}
