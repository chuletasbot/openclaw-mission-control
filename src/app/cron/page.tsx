'use client'

import { useState } from 'react'
import GlassCard from '@/components/GlassCard'

interface CronJob {
  id: string
  name: string
  schedule: string
  scheduleHuman: string
  lastRun: string
  nextRun: string
  status: 'active' | 'paused'
}

const initialJobs: CronJob[] = [
  {
    id: '1', name: 'Noticias matutinas', schedule: '0 8 30 * * *',
    scheduleHuman: 'Daily at 8:30 AM', lastRun: 'Hace 3h', nextRun: 'En 5h', status: 'active',
  },
  {
    id: '2', name: 'Revisión issues GitHub', schedule: '0 9,17 * * *',
    scheduleHuman: '2x daily (9 AM, 5 PM)', lastRun: 'Hace 6h', nextRun: 'En 2h', status: 'active',
  },
  {
    id: '3', name: 'Backup memoria', schedule: '0 0 * * 0',
    scheduleHuman: 'Weekly (Sunday midnight)', lastRun: 'Hace 2d', nextRun: 'En 5d', status: 'paused',
  },
]

export default function CronPage() {
  const [jobs, setJobs] = useState(initialJobs)
  const [showModal, setShowModal] = useState(false)

  const toggleStatus = (id: string) => {
    setJobs(prev => prev.map(j =>
      j.id === id ? { ...j, status: j.status === 'active' ? 'paused' as const : 'active' as const } : j
    ))
  }

  const deleteJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id))
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Cron Jobs</h1>
          <p className="text-[#8e8e93]">Tareas programadas</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-[#7c5cfc] text-white text-sm font-medium hover:bg-[#6b4ee0] transition-all"
        >
          + New Job
        </button>
      </div>

      <div className="space-y-3">
        {jobs.map(job => (
          <GlassCard key={job.id}>
            <div className="flex items-center gap-4">
              <span className="text-2xl">{job.status === 'active' ? '⏰' : '⏸️'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium">{job.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    job.status === 'active'
                      ? 'bg-[#30d158]/15 text-[#30d158]'
                      : 'bg-white/5 text-[#8e8e93]'
                  }`}>
                    {job.status === 'active' ? 'Active' : 'Paused'}
                  </span>
                </div>
                <p className="text-sm text-[#8e8e93]">{job.scheduleHuman}</p>
              </div>
              <div className="text-right text-sm shrink-0 hidden sm:block">
                <p className="text-[#8e8e93]">Last: <span className="text-white">{job.lastRun}</span></p>
                <p className="text-[#8e8e93]">Next: <span className="text-white">{job.nextRun}</span></p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="px-3 py-1.5 rounded-lg bg-[#7c5cfc]/15 text-[#7c5cfc] text-xs font-medium hover:bg-[#7c5cfc]/25 transition-all">
                  Run Now
                </button>
                <button
                  onClick={() => toggleStatus(job.id)}
                  className="px-3 py-1.5 rounded-lg bg-[#ffd60a]/15 text-[#ffd60a] text-xs font-medium hover:bg-[#ffd60a]/25 transition-all"
                >
                  {job.status === 'active' ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={() => deleteJob(job.id)}
                  className="px-3 py-1.5 rounded-lg bg-[#ff453a]/15 text-[#ff453a] text-xs font-medium hover:bg-[#ff453a]/25 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </GlassCard>
        ))}

        {jobs.length === 0 && (
          <div className="glass-card p-12 text-center">
            <span className="text-4xl block mb-3">⏰</span>
            <p className="text-[#8e8e93]">No cron jobs configured</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="glass-card p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-semibold text-white">New Cron Job</h2>
            <div>
              <label className="text-sm text-[#8e8e93] block mb-1">Name</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#7c5cfc]" placeholder="e.g. Daily report" />
            </div>
            <div>
              <label className="text-sm text-[#8e8e93] block mb-1">Schedule (cron expression)</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#7c5cfc] font-mono" placeholder="0 9 * * *" />
            </div>
            <div>
              <label className="text-sm text-[#8e8e93] block mb-1">Task / Prompt</label>
              <textarea className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#7c5cfc] h-20 resize-none" placeholder="What should this job do?" />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm text-[#8e8e93] hover:text-white transition-all">
                Cancel
              </button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-[#7c5cfc] text-white text-sm font-medium hover:bg-[#6b4ee0] transition-all">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
