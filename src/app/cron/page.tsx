'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import GlassCard from '@/components/GlassCard'
import { getCronJobs, runCronJob, hasToken } from '@/lib/api'

export default function CronPage() {
  const [jobs, setJobs] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tokenSet, setTokenSet] = useState(false)
  const [running, setRunning] = useState<string | null>(null)

  useEffect(() => {
    const has = hasToken()
    setTokenSet(has)
    if (!has) { setLoading(false); return }
    loadJobs()
  }, [])

  const loadJobs = () => {
    setLoading(true)
    getCronJobs()
      .then(data => setJobs(Array.isArray(data) ? data : []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  const handleRun = async (jobId: string) => {
    setRunning(jobId)
    try {
      await runCronJob(jobId)
      loadJobs()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to run job')
    } finally {
      setRunning(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Cron Jobs</h1>
          <p className="text-[#8e8e93]">Tareas programadas</p>
        </div>
        {tokenSet && !loading && (
          <button onClick={loadJobs} className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/15 transition-colors">
            ↻ Refresh
          </button>
        )}
      </div>

      {!tokenSet && (
        <div className="glass-card p-4 border border-[#ffd60a]/20 flex items-center gap-3">
          <span className="text-xl">🔑</span>
          <div className="flex-1">
            <p className="text-sm text-[#ffd60a] font-medium">Gateway Token Required</p>
            <p className="text-xs text-[#8e8e93]">Configure your token in Settings to manage cron jobs.</p>
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
        <div className="py-12 text-center text-[#8e8e93]">Loading cron jobs...</div>
      ) : jobs.length > 0 ? (
        <div className="space-y-3">
          {jobs.map((job, i) => {
            const id = String(job.id || job.name || i)
            const enabled = job.enabled !== false
            return (
              <GlassCard key={i} className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${enabled ? 'bg-[#30d158]' : 'bg-[#8e8e93]'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {String(job.name || job.label || job.id || `Job ${i + 1}`)}
                    </p>
                    <p className="text-xs text-[#8e8e93] font-mono">
                      {String(job.schedule || job.cron || '—')}
                    </p>
                    {job.description ? (
                      <p className="text-xs text-[#8e8e93]/60 mt-1">{String(job.description)}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${
                      enabled ? 'bg-[#30d158]/15 text-[#30d158]' : 'bg-white/5 text-[#8e8e93]'
                    }`}>
                      {enabled ? 'Active' : 'Disabled'}
                    </span>
                    <button
                      onClick={() => handleRun(id)}
                      disabled={running === id}
                      className="px-3 py-1.5 rounded-lg bg-[#7c5cfc]/20 text-[#7c5cfc] text-xs font-medium hover:bg-[#7c5cfc]/30 transition-colors disabled:opacity-50"
                    >
                      {running === id ? 'Running...' : '▶ Run Now'}
                    </button>
                  </div>
                </div>
              </GlassCard>
            )
          })}
        </div>
      ) : tokenSet ? (
        <GlassCard>
          <div className="py-16 text-center">
            <span className="text-5xl block mb-4">⏰</span>
            <h2 className="text-xl font-semibold text-white mb-2">No cron jobs configured</h2>
            <p className="text-sm text-[#8e8e93]">Scheduled tasks will appear here once configured through the Gateway.</p>
          </div>
        </GlassCard>
      ) : null}
    </div>
  )
}
