'use client'

import GlassCard from '@/components/GlassCard'

const stats = [
  { label: 'Gateway Status', value: '—', icon: '🟡', detail: 'Pending API integration' },
  { label: 'Modelo Activo', value: '—', icon: '🧠', detail: 'Pending API integration' },
  { label: 'Sesiones Activas', value: '—', icon: '🔌', detail: 'Pending API integration' },
  { label: 'Tokens Hoy', value: '—', icon: '🔢', detail: 'Pending API integration' },
  { label: 'Canales', value: '—', icon: '💬', detail: 'Pending API integration' },
]

const emptyActivityData = Array.from({ length: 12 }, (_, i) => ({
  hour: String(i).padStart(2, '0'),
  value: 0,
}))

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-[#8e8e93]">Overview de tu instancia OpenClaw</p>
      </div>

      {/* API Integration Banner */}
      <div className="glass-card p-4 border border-[#ffd60a]/20 flex items-center gap-3">
        <span className="text-xl">🔌</span>
        <div>
          <p className="text-sm text-[#ffd60a] font-medium">Pending API Integration</p>
          <p className="text-xs text-[#8e8e93]">Dashboard stats will show real data once the OpenClaw Gateway API is connected.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <GlassCard key={stat.label} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[#8e8e93] mb-1">{stat.label}</p>
                <p className="text-xl font-bold text-[#8e8e93]" title="Pending API integration">{stat.value}</p>
                <p className="text-xs text-[#8e8e93]/60 mt-1">{stat.detail}</p>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard>
        <h2 className="text-lg font-semibold text-white mb-4">Actividad — Últimas 12 horas</h2>
        <div className="flex items-end gap-2 h-40">
          {emptyActivityData.map((d) => (
            <div key={d.hour} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full relative flex-1 flex items-end">
                <div className="w-full rounded-t bg-white/5" style={{ height: '4px' }} />
              </div>
              <span className="text-[10px] text-[#8e8e93]">{d.hour}h</span>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-[#8e8e93] mt-4">No data yet — activity will appear once the API is connected</p>
      </GlassCard>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <GlassCard>
          <h2 className="text-lg font-semibold text-white mb-4">Actividad Reciente</h2>
          <div className="py-8 text-center">
            <span className="text-3xl block mb-2">📭</span>
            <p className="text-sm text-[#8e8e93]">No recent activity</p>
            <p className="text-xs text-[#8e8e93]/60 mt-1">Events will appear here once connected</p>
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
