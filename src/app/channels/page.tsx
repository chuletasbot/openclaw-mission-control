'use client'

import GlassCard from '@/components/GlassCard'

const channels = [
  { name: 'Telegram', icon: '✈️', connected: true, users: 1, detail: 'Bot @chuletas_bot' },
  { name: 'WhatsApp', icon: '📱', connected: false, users: 0, detail: 'Not configured' },
  { name: 'Discord', icon: '🎮', connected: false, users: 0, detail: 'Not configured' },
  { name: 'Signal', icon: '🔒', connected: false, users: 0, detail: 'Not configured' },
]

const pairingRequests = [
  { user: 'eduardo_m', code: 'AX7K-2M9P', date: '2026-02-14 14:32', status: 'pending' },
  { user: 'maria_dev', code: 'BF3L-8N1Q', date: '2026-02-14 12:05', status: 'pending' },
]

export default function ChannelsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Canales</h1>
        <p className="text-[#8e8e93]">Gestión de canales conectados</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {channels.map(ch => (
          <GlassCard key={ch.name}>
            <div className="text-center">
              <span className="text-4xl block mb-3">{ch.icon}</span>
              <h3 className="text-lg font-semibold text-white mb-2">{ch.name}</h3>
              <span className={`inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full ${
                ch.connected
                  ? 'bg-[#30d158]/15 text-[#30d158]'
                  : 'bg-white/5 text-[#8e8e93]'
              }`}>
                {ch.connected ? '✅ Connected' : '⭘ Disconnected'}
              </span>
              <p className="text-sm text-[#8e8e93] mt-2">{ch.users} user{ch.users !== 1 ? 's' : ''}</p>
              <p className="text-xs text-[#8e8e93] mt-1">{ch.detail}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard>
        <h2 className="text-lg font-semibold text-white mb-4">Pairing Requests</h2>
        {pairingRequests.length === 0 ? (
          <p className="text-[#8e8e93] text-sm">No pending requests</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#8e8e93] border-b border-white/5">
                  <th className="text-left py-3 font-medium">User</th>
                  <th className="text-left py-3 font-medium">Code</th>
                  <th className="text-left py-3 font-medium">Date</th>
                  <th className="text-right py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pairingRequests.map((req, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0">
                    <td className="py-3 text-white">{req.user}</td>
                    <td className="py-3 font-mono text-[#7c5cfc]">{req.code}</td>
                    <td className="py-3 text-[#8e8e93]">{req.date}</td>
                    <td className="py-3 text-right space-x-2">
                      <button className="px-3 py-1.5 rounded-lg bg-[#30d158]/15 text-[#30d158] text-xs font-medium hover:bg-[#30d158]/25 transition-all">
                        Approve
                      </button>
                      <button className="px-3 py-1.5 rounded-lg bg-[#ff453a]/15 text-[#ff453a] text-xs font-medium hover:bg-[#ff453a]/25 transition-all">
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
