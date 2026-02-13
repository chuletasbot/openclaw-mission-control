'use client'

import { useState } from 'react'
import { Task, Status, COLUMNS } from '@/types/task'

interface Props {
  task: Task
  onClose: () => void
  onDelete: (id: string) => void
  onAddSubtask: (taskId: string, title: string) => void
  onToggleSubtask: (taskId: string, subtaskId: string) => void
  onAddComment: (taskId: string, text: string) => void
  onMove: (id: string, status: Status) => void
}

const priorityColors = { high: 'text-[#ff453a]', medium: 'text-[#ffd60a]', low: 'text-[#30d158]' }

export default function TaskDetail({ task, onClose, onDelete, onAddSubtask, onToggleSubtask, onAddComment, onMove }: Props) {
  const [newSubtask, setNewSubtask] = useState('')
  const [newComment, setNewComment] = useState('')
  const [tab, setTab] = useState<'subtasks' | 'comments' | 'activity'>('subtasks')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">{task.title}</h2>
            <p className="text-sm text-[#8e8e93]">{task.description}</p>
          </div>
          <button onClick={onClose} className="text-[#8e8e93] hover:text-white text-xl">✕</button>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <span className={`text-xs font-medium ${priorityColors[task.priority]}`}>● {task.priority} priority</span>
          <span className="text-xs text-[#8e8e93]">📅 {task.deadline}</span>
          <span className="text-xs text-[#8e8e93]">Created: {new Date(task.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="flex gap-2 mb-4">
          {COLUMNS.map(col => (
            <button
              key={col.id}
              onClick={() => onMove(task.id, col.id)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                task.status === col.id ? 'bg-[#7c5cfc]/20 text-[#7c5cfc]' : 'bg-white/5 text-[#8e8e93] hover:bg-white/10'
              }`}
            >
              {col.icon} {col.label}
            </button>
          ))}
        </div>

        <div className="flex gap-4 mb-4 border-b border-white/5">
          {(['subtasks', 'comments', 'activity'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-2 text-sm font-medium transition-all ${
                tab === t ? 'text-white border-b-2 border-[#7c5cfc]' : 'text-[#8e8e93]'
              }`}
            >
              {t === 'subtasks' ? `Subtareas (${task.subtasks.length})` : t === 'comments' ? `Comentarios (${task.comments.length})` : `Actividad (${task.activity.length})`}
            </button>
          ))}
        </div>

        {tab === 'subtasks' && (
          <div className="space-y-2">
            {task.subtasks.map(s => (
              <div key={s.id} className="flex items-center gap-3 py-2">
                <button
                  onClick={() => onToggleSubtask(task.id, s.id)}
                  className={`w-5 h-5 rounded border flex items-center justify-center text-xs ${
                    s.completed ? 'bg-[#30d158] border-[#30d158] text-black' : 'border-white/20'
                  }`}
                >
                  {s.completed && '✓'}
                </button>
                <span className={`text-sm ${s.completed ? 'line-through text-[#8e8e93]' : 'text-white'}`}>{s.title}</span>
              </div>
            ))}
            <div className="flex gap-2 mt-3">
              <input
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && newSubtask.trim()) { onAddSubtask(task.id, newSubtask.trim()); setNewSubtask('') } }}
                placeholder="Nueva subtarea..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#8e8e93] outline-none focus:border-[#7c5cfc]/50"
              />
              <button
                onClick={() => { if (newSubtask.trim()) { onAddSubtask(task.id, newSubtask.trim()); setNewSubtask('') } }}
                className="bg-[#7c5cfc]/20 text-[#7c5cfc] px-4 py-2 rounded-lg text-sm hover:bg-[#7c5cfc]/30"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {tab === 'comments' && (
          <div className="space-y-3">
            {task.comments.map(c => (
              <div key={c.id} className="bg-white/3 rounded-lg p-3">
                <p className="text-sm text-white">{c.text}</p>
                <p className="text-[10px] text-[#8e8e93] mt-1">{new Date(c.createdAt).toLocaleString()}</p>
              </div>
            ))}
            <div className="flex gap-2 mt-3">
              <input
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && newComment.trim()) { onAddComment(task.id, newComment.trim()); setNewComment('') } }}
                placeholder="Agregar comentario..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#8e8e93] outline-none focus:border-[#7c5cfc]/50"
              />
              <button
                onClick={() => { if (newComment.trim()) { onAddComment(task.id, newComment.trim()); setNewComment('') } }}
                className="bg-[#7c5cfc]/20 text-[#7c5cfc] px-4 py-2 rounded-lg text-sm hover:bg-[#7c5cfc]/30"
              >
                Send
              </button>
            </div>
          </div>
        )}

        {tab === 'activity' && (
          <div className="space-y-2">
            {[...task.activity].reverse().map(a => (
              <div key={a.id} className="flex items-center gap-3 py-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-[#7c5cfc]" />
                <span className="text-white">{a.action}</span>
                <span className="text-[#8e8e93] text-xs ml-auto">{new Date(a.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
          <button
            onClick={() => onDelete(task.id)}
            className="text-xs text-[#ff453a] hover:bg-[#ff453a]/10 px-4 py-2 rounded-lg transition-all"
          >
            🗑️ Eliminar tarea
          </button>
        </div>
      </div>
    </div>
  )
}
