'use client'

import { useState } from 'react'
import { useTasks } from '@/hooks/useTasks'
import { Task, Status, Priority, COLUMNS } from '@/types/task'
import GlassCard from '@/components/GlassCard'
import TaskDetail from '@/components/TaskDetail'
import CreateTaskModal from '@/components/CreateTaskModal'

const priorityColors: Record<Priority, string> = {
  high: 'bg-[#ff453a]/20 text-[#ff453a]',
  medium: 'bg-[#ffd60a]/20 text-[#ffd60a]',
  low: 'bg-[#30d158]/20 text-[#30d158]',
}

export default function TaskBoard() {
  const { tasks, loaded, addTask, moveTask, deleteTask, addSubtask, toggleSubtask, addComment } = useTasks()
  const [draggedTask, setDraggedTask] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [dragOverCol, setDragOverCol] = useState<Status | null>(null)

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Task Board</h1>
          <p className="text-[#8e8e93]">Panel Kanban de tareas</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="glass-card px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition-all flex items-center gap-2"
        >
          <span>➕</span> Nueva Tarea
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter(t => t.status === col.id)
          return (
            <div
              key={col.id}
              className={`glass-card p-4 kanban-column transition-all duration-200 ${dragOverCol === col.id ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(col.id)}
            >
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
                <span className="text-lg">{col.icon}</span>
                <h2 className="text-sm font-semibold text-white">{col.label}</h2>
                <span className="ml-auto text-xs text-[#8e8e93] bg-white/5 px-2 py-1 rounded-full">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    onClick={() => setSelectedTask(task)}
                    className={`glass-card p-4 cursor-grab active:cursor-grabbing hover:border-[#7c5cfc]/30 transition-all duration-200 ${
                      draggedTask === task.id ? 'opacity-50 scale-95' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-medium text-white leading-tight">{task.title}</h3>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-[#8e8e93] mb-3 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-[#8e8e93]">
                      <span>📅 {task.deadline}</span>
                      {task.subtasks.length > 0 && (
                        <span>
                          ✅ {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
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

      {showCreate && (
        <CreateTaskModal
          onClose={() => setShowCreate(false)}
          onCreate={(title, desc, priority, deadline) => { addTask(title, desc, priority, deadline); setShowCreate(false) }}
        />
      )}
    </div>
  )
}
