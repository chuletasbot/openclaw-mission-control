import GlassCard from '@/components/GlassCard'

export default function LogsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Logs</h1>
        <p className="text-[#8e8e93]">System logs and event history</p>
      </div>

      <GlassCard>
        <div className="py-20 text-center">
          <span className="text-7xl block mb-6">📝</span>
          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#ffd60a]/15 text-[#ffd60a] font-medium mb-4">
            🚧 Under Development
          </span>
          <h2 className="text-2xl font-bold text-white mb-3">System Logs</h2>
          <p className="text-sm text-[#8e8e93] max-w-md mx-auto leading-relaxed">
            Real-time log viewer with filtering, search, and log level highlighting. 
            Stream gateway logs, session events, and error traces — all in one place.
          </p>
        </div>
      </GlassCard>
    </div>
  )
}
