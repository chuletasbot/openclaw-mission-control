'use client'

import GlassCard from '@/components/GlassCard'

export default function SessionsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Sesiones</h1>
        <p className="text-[#8e8e93]">Monitor de sesiones activas y completadas</p>
      </div>

      <div className="glass-card p-4 border border-[#ffd60a]/20 flex items-center gap-3">
        <span className="text-xl">🔌</span>
        <div>
          <p className="text-sm text-[#ffd60a] font-medium">Pending Integration</p>
          <p className="text-xs text-[#8e8e93]">Sessions will appear here once the Gateway API is connected.</p>
        </div>
      </div>

      <GlassCard>
        <div className="py-16 text-center">
          <span className="text-5xl block mb-4">🔌</span>
          <h2 className="text-xl font-semibold text-white mb-2">No active sessions</h2>
          <p className="text-sm text-[#8e8e93]">Active and completed sessions will be listed here once connected to the Gateway.</p>
        </div>
      </GlassCard>
    </div>
  )
}
