'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import GlassCard from '@/components/GlassCard'
import { getMemoryFiles, readFile, writeFile, listSkills, hasToken } from '@/lib/api'

interface FileEntry {
  path: string
  name: string
  category: 'core' | 'memory' | 'skill' | 'other'
}

function categorize(path: string): FileEntry['category'] {
  const name = path.split('/').pop() || ''
  if (['MEMORY.md', 'SOUL.md', 'USER.md', 'IDENTITY.md', 'AGENTS.md', 'TOOLS.md', 'HEARTBEAT.md'].includes(name)) return 'core'
  if (path.includes('/memory/')) return 'memory'
  if (path.includes('/skills/')) return 'skill'
  return 'other'
}

const categoryLabels: Record<string, { label: string; emoji: string; color: string }> = {
  core: { label: 'Core Files', emoji: '⚙️', color: '#7c5cfc' },
  memory: { label: 'Daily Memory', emoji: '📝', color: '#30d158' },
  skill: { label: 'Skills', emoji: '🧩', color: '#ff9f0a' },
  other: { label: 'Other', emoji: '📄', color: '#8e8e93' },
}

export default function MemoryPage() {
  const [tokenSet, setTokenSet] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [files, setFiles] = useState<FileEntry[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState('')
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('core')

  const loadFiles = useCallback(() => {
    setLoading(true)
    Promise.all([getMemoryFiles(), listSkills()])
      .then(([filesRes, skillsRes]) => {
        const raw = typeof filesRes === 'string' ? filesRes : (filesRes?.output || filesRes?.stdout || '')
        const lines = String(raw).split('\n').filter(l => l.trim().endsWith('.md'))
        const entries: FileEntry[] = lines.map(p => ({
          path: p.trim(),
          name: p.trim().split('/').pop() || p.trim(),
          category: categorize(p.trim()),
        }))
        setFiles(entries)

        const skillRaw = typeof skillsRes === 'string' ? skillsRes : (skillsRes?.output || skillsRes?.stdout || '')
        const skillLines = String(skillRaw).split('\n').filter(l => l.trim() && l.trim() !== '---user---')
        setSkills(skillLines.map(s => s.trim()).filter(Boolean))
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const has = hasToken()
    setTokenSet(has)
    if (!has) { setLoading(false); return }
    loadFiles()
  }, [loadFiles])

  const openFile = async (path: string) => {
    setSelectedFile(path)
    setEditing(false)
    try {
      const res = await readFile(path)
      const content = typeof res === 'string' ? res : (res?.output || res?.content || JSON.stringify(res, null, 2))
      setFileContent(String(content))
      setEditContent(String(content))
    } catch (e) {
      setFileContent(`Error reading file: ${(e as Error).message}`)
    }
  }

  const saveFile = async () => {
    if (!selectedFile) return
    setSaving(true)
    try {
      await writeFile(selectedFile, editContent)
      setFileContent(editContent)
      setEditing(false)
    } catch (e) {
      setError(`Save failed: ${(e as Error).message}`)
    } finally {
      setSaving(false)
    }
  }

  const filtered = files.filter(f => f.category === activeCategory)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Memoria & Skills</h1>
          <p className="text-[#8e8e93]">Archivos de conocimiento y personalidad del agente</p>
        </div>
        {tokenSet && !loading && (
          <button onClick={loadFiles} className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/15 transition-colors">
            ↻ Refresh
          </button>
        )}
      </div>

      {!tokenSet && (
        <div className="glass-card p-4 border border-[#ffd60a]/20 flex items-center gap-3">
          <span className="text-xl">🔑</span>
          <div className="flex-1">
            <p className="text-sm text-[#ffd60a] font-medium">Gateway Token Required</p>
            <p className="text-xs text-[#8e8e93]">Configure your token in Settings.</p>
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
          <button onClick={() => setError('')} className="text-xs text-[#8e8e93] hover:text-white ml-auto">✕</button>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-[#8e8e93]">Cargando archivos...</div>
      ) : tokenSet ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - file browser */}
          <div className="space-y-4">
            {/* Category tabs */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryLabels).map(([key, { label, emoji }]) => {
                const count = files.filter(f => f.category === key).length
                if (count === 0 && key !== 'skill') return null
                return (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeCategory === key
                        ? 'bg-[#7c5cfc] text-white'
                        : 'bg-white/5 text-[#8e8e93] hover:bg-white/10'
                    }`}
                  >
                    {emoji} {label} ({count})
                  </button>
                )
              })}
            </div>

            {/* File list */}
            <div className="space-y-1.5">
              {activeCategory === 'skill' && skills.length > 0 ? (
                <>
                  {skills.map(skill => (
                    <GlassCard
                      key={skill}
                      className="p-3 cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => openFile(`/app/skills/${skill}/SKILL.md`)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">🧩</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{skill}</p>
                          <p className="text-xs text-[#8e8e93]">SKILL.md</p>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                  {filtered.map(f => (
                    <GlassCard
                      key={f.path}
                      className={`p-3 cursor-pointer transition-colors ${
                        selectedFile === f.path ? 'border border-[#7c5cfc]/50 bg-[#7c5cfc]/10' : 'hover:bg-white/10'
                      }`}
                      onClick={() => openFile(f.path)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">📄</span>
                        <p className="text-sm text-white truncate">{f.name}</p>
                      </div>
                    </GlassCard>
                  ))}
                </>
              ) : filtered.length > 0 ? (
                filtered.map(f => (
                  <GlassCard
                    key={f.path}
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedFile === f.path ? 'border border-[#7c5cfc]/50 bg-[#7c5cfc]/10' : 'hover:bg-white/10'
                    }`}
                    onClick={() => openFile(f.path)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{categoryLabels[f.category]?.emoji || '📄'}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{f.name}</p>
                        <p className="text-xs text-[#8e8e93] truncate">{f.path.replace('/home/node/.openclaw/workspace/', '')}</p>
                      </div>
                    </div>
                  </GlassCard>
                ))
              ) : (
                <p className="text-sm text-[#8e8e93] py-4 text-center">No files in this category</p>
              )}
            </div>
          </div>

          {/* Content viewer/editor */}
          <div className="lg:col-span-2">
            {selectedFile ? (
              <GlassCard className="p-0 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{selectedFile.split('/').pop()}</p>
                    <p className="text-xs text-[#8e8e93] truncate">{selectedFile.replace('/home/node/.openclaw/workspace/', '')}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {editing ? (
                      <>
                        <button
                          onClick={() => setEditing(false)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 text-[#8e8e93] text-xs hover:bg-white/10 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveFile}
                          disabled={saving}
                          className="px-3 py-1.5 rounded-lg bg-[#30d158] text-white text-xs font-medium hover:bg-[#28b84d] transition-colors disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : '💾 Save'}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => { setEditContent(fileContent); setEditing(true) }}
                        className="px-3 py-1.5 rounded-lg bg-[#7c5cfc]/20 text-[#7c5cfc] text-xs font-medium hover:bg-[#7c5cfc]/30 transition-colors"
                      >
                        ✏️ Edit
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-4 max-h-[70vh] overflow-auto">
                  {editing ? (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full h-[60vh] bg-transparent text-[#e5e5ea] text-sm font-mono leading-relaxed resize-none focus:outline-none"
                      spellCheck={false}
                    />
                  ) : (
                    <pre className="text-sm text-[#e5e5ea] font-mono whitespace-pre-wrap leading-relaxed">{fileContent}</pre>
                  )}
                </div>
              </GlassCard>
            ) : (
              <GlassCard>
                <div className="py-20 text-center">
                  <span className="text-5xl block mb-4">🧠</span>
                  <h2 className="text-xl font-semibold text-white mb-2">Select a file</h2>
                  <p className="text-sm text-[#8e8e93]">Choose a file from the left panel to view or edit its contents.</p>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
