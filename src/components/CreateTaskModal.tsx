'use client'

import { useState } from 'react'
import { Priority } from '@/types/task'

interface Props {
  onClose: () => void
  onCreate: (title: string, description: string, priority: Priority, deadline: string) => void
}

export default function CreateTaskModal({ onClose, onCreate }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [deadline, setDeadline] = useState('')

  const handleSubmit = () => {
    if (!title.trim()) return
    onCreate(title.trim(), description.trim(), priority, deadline || new Date().toISOString().split('T')[0])
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Nueva Tarea</h2>
          <button onClick={onClose} className="text-[#8e8e93] hover:text-white text-xl">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#8e8e93] mb-1 block">Título</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Título de la tarea..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#8e8e93] outline-none focus:border-[#7c5cfc]/50"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs text-[#8e8e93] mb-1 block">Descripción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe la tarea..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#8e8e93] outline-none focus:border-[#7c5cfc]/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#8e8e93] mb-1 block">Prioridad</label>
              <div className="flex gap-2">
                {(['high', 'medium', 'low'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`flex-1 text-xs py-2 rounded-lg border transition-all ${
                      priority === p
                        ? p === 'high' ? 'bg-[#ff453a]/20 border-[#ff453a]/50 text-[#ff453a]'
                        : p === 'medium' ? 'bg-[#ffd60a]/20 border-[#ffd60a]/50 text-[#ffd60a]'
                        : 'bg-[#30d158]/20 border-[#30d158]/50 text-[#30d158]'
                        : 'border-white/10 text-[#8e8e93] hover:bg-white/5'
                    }`}
                  >
                    {p === 'high' ? 'Alta' : p === 'medium' ? 'Media' : 'Baja'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-[#8e8e93] mb-1 block">Fecha límite</label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#7c5cfc]/50 [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="text-sm text-[#8e8e93] hover:text-white px-4 py-2 rounded-lg">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="bg-[#7c5cfc] text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-[#6b4be0] transition-all disabled:opacity-30"
          >
            Crear Tarea
          </button>
        </div>
      </div>
    </div>
  )
}
