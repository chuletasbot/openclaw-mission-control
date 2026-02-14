'use client'

import GlassCard from '@/components/GlassCard'

const stats = [
  { label: 'Gateway Status', value: 'Online', icon: '🟢', detail: 'Uptime: 14d 6h 32m' },
  { label: 'Modelo Activo', value: 'claude-opus-4-6', icon: '🧠', detail: 'anthropic/claude-opus-4-6' },
  { label: 'Sesiones Activas', value: '5', icon: '🔌', detail: '3 Telegram · 2 Webchat' },
  { label: 'Tokens Hoy', value: '45.2k in', icon: '🔢', detail: '12.1k out' },
  { label: 'Canales', value: '2 conectados', icon: '💬', detail: 'Telegram · Webchat' },
]

const activityData = [
  { hour: '00', value: 5 }, { hour: '01', value: 2 }, { hour: '02', value: 1 },
  { hour: '03', value: 0 }, { hour: '04', value: 3 }, { hour: '05', value: 8 },
  { hour: '06', value: 15 }, { hour: '07', value: 25 }, { hour: '08', value: 40 },
  { hour: '09', value: 60 }, { hour: '10', value: 85 }, { hour: '11', value: 72 },
]

const recentActivity = [
  { time: '2 min ago', event: '💬 Mensaje recibido en Telegram de @eduardo', type: 'info' },
  { time: '15 min ago', event: '⏰ Cron ejecutado: Noticias matutinas', type: 'success' },
  { time: '1h ago', event: '🚀 Deploy completado: v2.1.3', type: 'success' },
  { time: '3h ago', event: '🧠 Memoria actualizada: SOUL.md', type: 'warning' },
  { time: '6h ago', event: '🔌 Canal desconectado: WhatsApp', type: 'danger' },
]

export default function Dashboard() {
  const maxVal = Math.max(...activityData.map(d => d.value))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-[#8e8e93]">Overview de tu instancia OpenClaw</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <GlassCard key={stat.label} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[#8e8e93] mb-1">{stat.label}</p>
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-[#8e8e93] mt-1">{stat.detail}</p>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard>
        <h2 className="text-lg font-semibold text-white mb-4">Actividad — Últimas 12 horas</h2>
        <div className="flex items-end gap-2 h-40">
          {activityData.map((d) => (
            <div key={d.hour} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full relative flex-1 flex items-end">
                <div
                  className="w-full rounded-t bg-gradient-to-t from-[#7c5cfc] to-[#5c3cdc] transition-all"
                  style={{ height: `${maxVal ? (d.value / maxVal) * 100 : 0}%`, minHeight: d.value > 0 ? '4px' : '0' }}
                />
              </div>
              <span className="text-[10px] text-[#8e8e93]">{d.hour}h</span>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <GlassCard>
          <h2 className="text-lg font-semibold text-white mb-4">Actividad Reciente</h2>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  item.type === 'success' ? 'bg-[#30d158]' :
                  item.type === 'warning' ? 'bg-[#ffd60a]' :
                  item.type === 'danger' ? 'bg-[#ff453a]' : 'bg-[#7c5cfc]'
                }`} />
                <span className="text-sm text-white flex-1">{item.event}</span>
                <span className="text-xs text-[#8e8e93] shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Nueva Tarea', icon: '➕', href: '/tasks' },
              { label: 'Ver Sesiones', icon: '🔌', href: '/sessions' },
              { label: 'Restart Gateway', icon: '🔄' },
              { label: 'Ver Logs', icon: '📝', href: '/logs' },
            ].map((action) => (
              <button
                key={action.label}
                className="glass-card p-4 text-left hover:bg-white/10 transition-all duration-200 cursor-pointer"
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
