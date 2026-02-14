import GlassCard from '@/components/GlassCard'

export default function LabPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Lab</h1>
        <p className="text-[#8e8e93]">Experimental features and sandbox</p>
      </div>

      <GlassCard>
        <div className="py-20 text-center">
          <span className="text-7xl block mb-6">🧪</span>
          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#ffd60a]/15 text-[#ffd60a] font-medium mb-4">
            🚧 Under Development
          </span>
          <h2 className="text-2xl font-bold text-white mb-3">Experimental Lab</h2>
          <p className="text-sm text-[#8e8e93] max-w-md mx-auto leading-relaxed">
            A sandbox for testing prompts, experimenting with model settings, 
            trying new skills, and running one-off agent tasks before deploying them.
          </p>
        </div>
      </GlassCard>
    </div>
  )
}
