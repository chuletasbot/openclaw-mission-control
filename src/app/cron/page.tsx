'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import GlassCard from '@/components/GlassCard'
import { getCronJobs, runCronJob, addCronJob, updateCronJob, removeCronJob, hasToken } from '@/lib/api'

interface CronJob {
  id?: string
  jobId?: string
  name?: string
  label?: string
  description?: string
  schedule?: string | Record<string, unknown>
  payload?: Record<string, unknown>
  sessionTarget?: string
  enabled?: boolean
  [key: string]: unknown
}

function scheduleToString(s: unknown): string {
  if (!s) return '—'
  if (typeof s === 'string') return s
  const obj = s as Record<string, unknown>
  if (obj.kind === 'cron') return String(obj.expr || '')
  if (obj.kind === 'every') return `Every ${Math.round(Number(obj.everyMs || 0) / 60000)}m`
  if (obj.kind === 'at') return `At ${String(obj.at || '').slice(0, 16)}`
  return JSON.stringify(s)
}

export default function CronPage() {
  const [jobs, setJobs] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tokenSet, setTokenSet] = useState(false)
  const [running, setRunning] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Create/Edit modal
  const [showModal, setShowModal] = useState(false)
  const [editJob, setEditJob] = useState<CronJob | null>(null)
  const [formName, setFormName] = useState('')
  const [formScheduleKind, setFormScheduleKind] = useState<'cron' | 'every' | 'at'>('cron')
  const [formCronExpr, setFormCronExpr] = useState('')
  const [formEveryMin, setFormEveryMin] = useState('30')
  const [formAtTime, setFormAtTime] = useState('')
  const [formPayloadKind, setFormPayloadKind] = useState<'agentTurn' | 'systemEvent'>('agentTurn')
  const [formMessage, setFormMessage] = useState('')
  const [formSessionTarget, setFormSessionTarget] = useState<'isolated' | 'main'>('isolated')
  const [saving, setSaving] = useState(false)

  const loadJobs = useCallback(() => {
    setLoading(true)
    getCronJobs()
      .then(data => setJobs(Array.isArray(data) ? data : []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const has = hasToken()
    setTokenSet(has)
    if (!has) { setLoading(false); return }
    loadJobs()
  }, [loadJobs])

  const getJobId = (job: CronJob) => String(job.jobId || job.id || '')

  const handleRun = async (jobId: string) => {
    setRunning(jobId)
    try { await runCronJob(jobId); loadJobs() }
    catch (e) { setError(e instanceof Error ? e.message : 'Run failed') }
    finally { setRunning(null) }
  }

  const handleToggle = async (job: CronJob) => {
    const id = getJobId(job)
    try { await updateCronJob(id, { enabled: !job.enabled }); loadJobs() }
    catch (e) { setError(e instanceof Error ? e.message : 'Toggle failed') }
  }

  const handleDelete = async (jobId: string) => {
    if (!confirm('Delete this cron job?')) return
    setDeleting(jobId)
    try { await removeCronJob(jobId); loadJobs() }
    catch (e) { setError(e instanceof Error ? e.message : 'Delete failed') }
    finally { setDeleting(null) }
  }

  const openCreate = () => {
    setEditJob(null)
    setFormName(''); setFormScheduleKind('cron'); setFormCronExpr(''); setFormEveryMin('30'); setFormAtTime('')
    setFormPayloadKind('agentTurn'); setFormMessage(''); setFormSessionTarget('isolated')
    setShowModal(true)
  }

  const openEdit = (job: CronJob) => {
    setEditJob(job)
    setFormName(String(job.name || ''))
    const sched = job.schedule as Record<string, unknown> | undefined
    if (sched?.kind === 'every') { setFormScheduleKind('every'); setFormEveryMin(String(Math.round(Number(sched.everyMs || 0) / 60000))) }
    else if (sched?.kind === 'at') { setFormScheduleKind('at'); setFormAtTime(String(sched.at || '')) }
    else { setFormScheduleKind('cron'); setFormCronExpr(String(sched?.expr || '')) }
    const payload = job.payload as Record<string, unknown> | undefined
    setFormPayloadKind(payload?.kind === 'systemEvent' ? 'systemEvent' : 'agentTurn')
    setFormMessage(String(payload?.message || payload?.text || ''))
    setFormSessionTarget(job.sessionTarget === 'main' ? 'main' : 'isolated')
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formMessage.trim()) return
    setSaving(true)
    try {
      const schedule: Record<string, unknown> = formScheduleKind === 'cron'
        ? { kind: 'cron', expr: formCronExpr }
        : formScheduleKind === 'every'
        ? { kind: 'every', everyMs: parseInt(formEveryMin) * 60000 }
        : { kind: 'at', at: formAtTime }

      const payload: Record<string, unknown> = formPayloadKind === 'agentTurn'
        ? { kind: 'agentTurn', message: formMessage }
        : { kind: 'systemEvent', text: formMessage }

      if (editJob) {
        await updateCronJob(getJobId(editJob), { name: formName || undefined, schedule, payload, sessionTarget: formSessionTarget })
      } else {
        await addCronJob({ name: formName || undefined, schedule, payload, sessionTarget: formSessionTarget, enabled: true })
      }
      setShowModal(false)
      loadJobs()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Cron Jobs</h1>
          <p className="text-[#8e8e93]">Tareas programadas</p>
        </div>
        {tokenSet && !loading && (
          <div className="flex gap-2">
            <button onClick={openCreate} className="px-4 py-2 rounded-xl bg-[#7c5cfc] text-white text-sm font-medium hover:bg-[#6b4ce6] transition-colors">
              + New Job
            </button>
            <button onClick={loadJobs} className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/15 transition-colors">
              ↻
            </button>
          </div>
        )}
      </div>

      {!tokenSet && (
        <div className="glass-card p-4 border border-[#ffd60a]/20 flex items-center gap-3">
          <span className="text-xl">🔑</span>
          <div className="flex-1">
            <p className="text-sm text-[#ffd60a] font-medium">Gateway Token Required</p>
            <p className="text-xs text-[#8e8e93]">Configure your token in Settings to manage cron jobs.</p>
          </div>
          <Link href="/settings" className="px-4 py-2 rounded-xl bg-[#7c5cfc] text-white text-sm font-medium hover:bg-[#6b4ce6] transition-colors">Settings</Link>
        </div>
      )}

      {error && (
        <div className="glass-card p-4 border border-[#ff453a]/20 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <p className="text-sm text-[#ff453a]">{error}</p>
          <button onClick={() => setError('')} className="text-[#ff453a] text-xs ml-auto">✕</button>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-[#8e8e93]">Loading cron jobs...</div>
      ) : jobs.length > 0 ? (
        <div className="space-y-3">
          {jobs.map((job, i) => {
            const id = getJobId(job)
            const enabled = job.enabled !== false
            return (
              <GlassCard key={i} className="p-4">
                <div className="flex items-center gap-4">
                  {/* Toggle */}
                  <button onClick={() => handleToggle(job)} title={enabled ? 'Disable' : 'Enable'}
                    className={`w-10 h-5 rounded-full relative transition-colors ${enabled ? 'bg-[#30d158]' : 'bg-[#48484a]'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${enabled ? 'left-5' : 'left-0.5'}`} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {String(job.name || job.label || id || `Job ${i + 1}`)}
                    </p>
                    <p className="text-xs text-[#8e8e93] font-mono">
                      {scheduleToString(job.schedule)}
                    </p>
                    {(job.payload as Record<string, unknown>)?.message ? (
                      <p className="text-xs text-[#8e8e93]/60 mt-1 truncate">
                        {String((job.payload as Record<string, unknown>).message).slice(0, 80)}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      job.sessionTarget === 'main' ? 'bg-[#ffd60a]/15 text-[#ffd60a]' : 'bg-[#7c5cfc]/15 text-[#c4b5fd]'
                    }`}>
                      {job.sessionTarget || 'isolated'}
                    </span>
                    <button onClick={() => openEdit(job)} title="Edit"
                      className="p-1.5 rounded-lg text-[#8e8e93] hover:text-white hover:bg-white/10 transition-colors text-sm">✏️</button>
                    <button onClick={() => handleRun(id)} disabled={running === id} title="Run now"
                      className="p-1.5 rounded-lg text-[#7c5cfc] hover:bg-[#7c5cfc]/20 transition-colors text-sm disabled:opacity-50">
                      {running === id ? '⏳' : '▶️'}
                    </button>
                    <button onClick={() => handleDelete(id)} disabled={deleting === id} title="Delete"
                      className="p-1.5 rounded-lg text-[#ff453a] hover:bg-[#ff453a]/20 transition-colors text-sm disabled:opacity-50">
                      {deleting === id ? '⏳' : '🗑️'}
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
            <h2 className="text-xl font-semibold text-white mb-2">No cron jobs</h2>
            <p className="text-sm text-[#8e8e93] mb-4">Create your first scheduled task.</p>
            <button onClick={openCreate} className="px-4 py-2 rounded-xl bg-[#7c5cfc] text-white text-sm font-medium hover:bg-[#6b4ce6]">+ New Job</button>
          </div>
        </GlassCard>
      ) : null}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="glass-card p-6 w-full max-w-lg mx-4 border border-white/10 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">{editJob ? 'Edit Job' : 'New Cron Job'}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#8e8e93] block mb-1">Name</label>
                <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="My task"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#8e8e93] focus:outline-none focus:border-[#7c5cfc]" />
              </div>

              <div>
                <label className="text-xs text-[#8e8e93] block mb-1">Schedule Type</label>
                <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
                  {(['cron', 'every', 'at'] as const).map(k => (
                    <button key={k} onClick={() => setFormScheduleKind(k)}
                      className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${formScheduleKind === k ? 'bg-[#7c5cfc] text-white' : 'text-[#8e8e93] hover:text-white'}`}>
                      {k === 'cron' ? 'Cron Expr' : k === 'every' ? 'Interval' : 'One-shot'}
                    </button>
                  ))}
                </div>
              </div>

              {formScheduleKind === 'cron' && (
                <div>
                  <label className="text-xs text-[#8e8e93] block mb-1">Cron Expression</label>
                  <input value={formCronExpr} onChange={e => setFormCronExpr(e.target.value)} placeholder="0 9 * * 1-5"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder:text-[#8e8e93] focus:outline-none focus:border-[#7c5cfc]" />
                </div>
              )}
              {formScheduleKind === 'every' && (
                <div>
                  <label className="text-xs text-[#8e8e93] block mb-1">Every (minutes)</label>
                  <input type="number" value={formEveryMin} onChange={e => setFormEveryMin(e.target.value)} min="1"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#8e8e93] focus:outline-none focus:border-[#7c5cfc]" />
                </div>
              )}
              {formScheduleKind === 'at' && (
                <div>
                  <label className="text-xs text-[#8e8e93] block mb-1">Run at (ISO timestamp)</label>
                  <input type="datetime-local" value={formAtTime} onChange={e => setFormAtTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7c5cfc]" />
                </div>
              )}

              <div>
                <label className="text-xs text-[#8e8e93] block mb-1">Session Target</label>
                <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
                  {(['isolated', 'main'] as const).map(t => (
                    <button key={t} onClick={() => { setFormSessionTarget(t); setFormPayloadKind(t === 'main' ? 'systemEvent' : 'agentTurn') }}
                      className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${formSessionTarget === t ? 'bg-[#7c5cfc] text-white' : 'text-[#8e8e93] hover:text-white'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-[#8e8e93] block mb-1">
                  {formPayloadKind === 'agentTurn' ? 'Agent Message' : 'System Event Text'}
                </label>
                <textarea value={formMessage} onChange={e => setFormMessage(e.target.value)} rows={3}
                  placeholder={formPayloadKind === 'agentTurn' ? 'What should the agent do?' : 'System event message...'}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#8e8e93] focus:outline-none focus:border-[#7c5cfc] resize-none" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/15">Cancel</button>
                <button onClick={handleSave} disabled={saving || !formMessage.trim()}
                  className="px-4 py-2 rounded-lg bg-[#7c5cfc] text-white text-sm font-medium hover:bg-[#6b4ce6] disabled:opacity-50">
                  {saving ? 'Saving...' : editJob ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
