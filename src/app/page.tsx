'use client'

import GlassCard from '@/components/GlassCard'

const stats = [
  { label: 'Gateway Status', value: 'Online', icon: '🟢', detail: 'Uptime: 14d 6h 32m' },
  { label: 'Modelo Activo', value: 'Claude Opus 4', icon: '🧠', detail: 'anthropic/claude-opus-4' },
  { label: 'Sesiones Activas', value: '3', icon: '🔌', detail: '2 Telegram · 1 Discord' },
  { label: 'Canales Conectados', value: '5', icon: '💬', detail: '3 Telegram · 2 Discord' },
]

const recentActivity = [
  { time: '2 min ago', event: 'Task completed: Deploy v2.1', type: 'success' },
  { time: '15 min ago', event: 'New session started (Telegram)', type: 'info' },
  { time: '1h ago', event: 'Cron job executed: daily-backup', type: 'info' },
  { time: '3h ago', event: 'Memory updated: SOUL.md', type: 'warning' },
  { time: '6h ago', event: 'Channel disconnected: WhatsApp', type: 'danger' },
]

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-[#8e8e93]">Overview de tu instancia OpenClaw</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <GlassCard key={stat.label}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#8e8e93] mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-[#8e8e93] mt-2">{stat.detail}</p>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <GlassCard>
          <h2 className="text-lg font-semibold text-white mb-4">Actividad Reciente</h2>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <div className={`w-2 h-2 rounded-full ${
                  item.type === 'success' ? 'bg-[#30d158]' :
                  item.type === 'warning' ? 'bg-[#ffd60a]' :
                  item.type === 'danger' ? 'bg-[#ff453a]' : 'bg-[#7c5cfc]'
                }`} />
                <span className="text-sm text-white flex-1">{item.event}</span>
                <span className="text-xs text-[#8e8e93]">{item.time}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Restart Gateway', icon: '🔄' },
              { label: 'Clear Logs', icon: '🗑️' },
              { label: 'New Task', icon: '➕' },
              { label: 'Run Backup', icon: '💾' },
            ].map((action) => (
              <button
                key={action.label}
                className="glass-card p-4 text-left hover:bg-white/8 transition-all duration-200 cursor-pointer"
              >
                <span className="text-xl block mb-2">{action.icon}</span>
                <span className="text-sm text-[#8e8e93]">{action.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
