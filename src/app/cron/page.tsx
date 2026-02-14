'use client'

import GlassCard from '@/components/GlassCard'

export default function CronPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Cron Jobs</h1>
          <p className="text-[#8e8e93]">Tareas programadas</p>
        </div>
      </div>

      <div className="glass-card p-4 border border-[#ffd60a]/20 flex items-center gap-3">
        <span className="text-xl">🔌</span>
        <div>
          <p className="text-sm text-[#ffd60a] font-medium">Pending Integration</p>
          <p className="text-xs text-[#8e8e93]">Cron jobs will be managed here once the Gateway API is connected.</p>
        </div>
      </div>

      <GlassCard>
        <div className="py-16 text-center">
          <span className="text-5xl block mb-4">⏰</span>
          <h2 className="text-xl font-semibold text-white mb-2">No cron jobs configured</h2>
          <p className="text-sm text-[#8e8e93]">Scheduled tasks will appear here once you configure them through the Gateway.</p>
        </div>
      </GlassCard>
    </div>
  )
}
