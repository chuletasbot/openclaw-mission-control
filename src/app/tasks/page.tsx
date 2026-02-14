'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useTasks } from '@/hooks/useTasks'
import { Task, Status, Priority, COLUMNS } from '@/types/task'
import TaskDetail from '@/components/TaskDetail'

const priorityBorderColors: Record<Priority, string> = {
  high: 'border-l-[#ff453a]',
  medium: 'border-l-[#ffd60a]',
  low: 'border-l-[#30d158]',
}

const priorityBadgeColors: Record<Priority, string> = {
  high: 'bg-[#ff453a]/20 text-[#ff453a]',
  medium: 'bg-[#ffd60a]/20 text-[#ffd60a]',
  low: 'bg-[#30d158]/20 text-[#30d158]',
}

const nextPriority: Record<Priority, Priority> = { low: 'medium', medium: 'high', high: 'low' }

function InlineAddTask({ onAdd, onCancel }: { onAdd: (title: string) => void; onCancel: () => void }) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { ref.current?.focus() }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const val = ref.current?.value.trim()
      if (val) onAdd(val)
    }
    if (e.key === 'Escape') onCancel()
  }

  return (
    <div className="glass-card p-3 border-l-4 border-l-[#7c5cfc]">
      <textarea
        ref={ref}
        rows={2}
        placeholder="Task title..."
        onKeyDown={handleKeyDown}
        className="w-full bg-transparent text-sm text-white placeholder-[#8e8e93] outline-none resize-none"
      />
      <div className="flex gap-2 mt-1">
        <button
          onClick={() => { const val = ref.current?.value.trim(); if (val) onAdd(val) }}
          className="px-3 py-1 rounded-lg bg-[#7c5cfc] text-white text-xs font-medium hover:bg-[#6b4be0] transition-all"
        >
          Add
        </button>
        <button onClick={onCancel} className="px-3 py-1 rounded-lg text-[#8e8e93] text-xs hover:text-white transition-all">
          Cancel
        </button>
      </div>
    </div>
  )
}

function InlineEditTitle({ value, onSave, onCancel }: { value: string; onSave: (v: string) => void; onCancel: () => void }) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.focus()
      ref.current.select()
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const val = ref.current?.value.trim()
      if (val) onSave(val)
    }
    if (e.key === 'Escape') onCancel()
  }

  return (
    <textarea
      ref={ref}
      defaultValue={value}
      rows={1}
      onKeyDown={handleKeyDown}
      onBlur={() => { const val = ref.current?.value.trim(); if (val) onSave(val); else onCancel() }}
      className="w-full bg-white/5 text-sm text-white outline-none resize-none rounded px-1 py-0.5 border border-[#7c5cfc]/50"
    />
  )
}

export default function TaskBoard() {
  const { tasks, loaded, addTask, updateTask, moveTask, deleteTask, addSubtask, toggleSubtask, addComment } = useTasks()
  const [draggedTask, setDraggedTask] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [dragOverCol, setDragOverCol] = useState<Status | null>(null)
  const [addingToCol, setAddingToCol] = useState<Status | null>(null)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)

  const handleQuickAdd = useCallback((status: Status, title: string) => {
    addTask(title, '', 'medium', new Date().toISOString().split('T')[0])
    // Move to correct column if not pending
    if (status !== 'pending') {
      // We need to get the latest task id - it was just added
      setTimeout(() => {
        const stored = localStorage.getItem('openclaw-tasks')
        if (stored) {
          const all = JSON.parse(stored) as Task[]
          const last = all[all.length - 1]
          if (last && last.status !== status) {
            moveTask(last.id, status)
          }
        }
      }, 50)
    }
    setAddingToCol(null)
  }, [addTask, moveTask])

  if (!loaded) return <div className="text-[#8e8e93]">Loading...</div>

  const handleDragStart = (taskId: string) => setDraggedTask(taskId)
  const handleDragOver = (e: React.DragEvent, col: Status) => { e.preventDefault(); setDragOverCol(col) }
  const handleDragLeave = () => setDragOverCol(null)
  const handleDrop = (status: Status) => {
    if (draggedTask) moveTask(draggedTask, status)
    setDraggedTask(null)
    setDragOverCol(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Task Board</h1>
        <p className="text-[#8e8e93]">Panel Kanban de tareas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter(t => t.status === col.id)
          return (
            <div
              key={col.id}
              className={`glass-card p-4 transition-all duration-200 ${dragOverCol === col.id ? 'ring-2 ring-[#7c5cfc]/50' : ''}`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(col.id)}
            >
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
                <span className="text-lg">{col.icon}</span>
                <h2 className="text-sm font-semibold text-white">{col.label} ({colTasks.length})</h2>
              </div>

              <div className="space-y-3">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    className={`glass-card p-4 cursor-grab active:cursor-grabbing hover:border-[#7c5cfc]/30 transition-all duration-200 border-l-4 ${priorityBorderColors[task.priority]} group relative ${
                      draggedTask === task.id ? 'opacity-50 scale-95' : ''
                    }`}
                  >
                    {/* Quick actions on hover */}
                    <div className="absolute top-2 right-2 hidden group-hover:flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); updateTask(task.id, { priority: nextPriority[task.priority] }) }}
                        className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs transition-all"
                        title={`Priority: ${task.priority} → ${nextPriority[task.priority]}`}
                      >
                        🔄
                      </button>
                      {COLUMNS.filter(c => c.id !== task.status).map(c => (
                        <button
                          key={c.id}
                          onClick={(e) => { e.stopPropagation(); moveTask(task.id, c.id) }}
                          className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs transition-all"
                          title={`Move to ${c.label}`}
                        >
                          {c.icon}
                        </button>
                      ))}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteTask(task.id) }}
                        className="w-6 h-6 rounded bg-[#ff453a]/20 hover:bg-[#ff453a]/30 flex items-center justify-center text-xs transition-all"
                        title="Delete"
                      >
                        🗑
                      </button>
                    </div>

                    <div className="flex items-start justify-between mb-2 pr-8">
                      {editingTaskId === task.id ? (
                        <InlineEditTitle
                          value={task.title}
                          onSave={(v) => { updateTask(task.id, { title: v }); setEditingTaskId(null) }}
                          onCancel={() => setEditingTaskId(null)}
                        />
                      ) : (
                        <h3
                          className="text-sm font-medium text-white leading-tight cursor-text hover:text-[#7c5cfc] transition-colors"
                          onClick={(e) => { e.stopPropagation(); setEditingTaskId(task.id) }}
                        >
                          {task.title}
                        </h3>
                      )}
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${priorityBadgeColors[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-[#8e8e93] mb-3 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-[#8e8e93]">
                      <span>📅 {task.deadline}</span>
                      <div className="flex items-center gap-2">
                        {task.subtasks.length > 0 && (
                          <span>✅ {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}</span>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedTask(task) }}
                          className="text-[#7c5cfc] hover:underline"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Inline add task */}
                {addingToCol === col.id ? (
                  <InlineAddTask
                    onAdd={(title) => handleQuickAdd(col.id, title)}
                    onCancel={() => setAddingToCol(null)}
                  />
                ) : (
                  <button
                    onClick={() => setAddingToCol(col.id)}
                    className="w-full py-2 text-sm text-[#8e8e93] hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center justify-center gap-1"
                  >
                    <span>+</span> Add task
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {selectedTask && (
        <TaskDetail
          task={tasks.find(t => t.id === selectedTask.id) || selectedTask}
          onClose={() => setSelectedTask(null)}
          onDelete={(id) => { deleteTask(id); setSelectedTask(null) }}
          onAddSubtask={addSubtask}
          onToggleSubtask={toggleSubtask}
          onAddComment={addComment}
          onMove={moveTask}
        />
      )}
    </div>
  )
}
