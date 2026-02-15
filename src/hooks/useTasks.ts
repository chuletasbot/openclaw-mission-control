'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Task, Status, Priority } from '@/types/task'

const STORAGE_KEY = 'openclaw-tasks'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function timestamp(): string {
  return new Date().toISOString()
}

const defaultTasks: Task[] = [
  {
    id: 'demo-1', title: 'Configurar Gateway', description: 'Setup inicial del gateway de OpenClaw con los canales necesarios',
    priority: 'high', status: 'completed', deadline: '2026-02-15',
    subtasks: [{ id: 's1', title: 'Instalar dependencias', completed: true }, { id: 's2', title: 'Configurar env vars', completed: true }],
    comments: [{ id: 'c1', text: 'Gateway funcionando correctamente', createdAt: '2026-02-10T10:00:00Z' }],
    activity: [{ id: 'a1', action: 'Task created', timestamp: '2026-02-08T09:00:00Z' }, { id: 'a2', action: 'Moved to Completada', timestamp: '2026-02-10T10:00:00Z' }],
    createdAt: '2026-02-08T09:00:00Z',
  },
  {
    id: 'demo-2', title: 'Diseñar Mission Control UI', description: 'Crear la interfaz del dashboard con efecto Liquid Glass',
    priority: 'high', status: 'in-progress', deadline: '2026-02-14',
    subtasks: [{ id: 's3', title: 'Layout base', completed: true }, { id: 's4', title: 'Dashboard cards', completed: true }, { id: 's5', title: 'Task Board', completed: false }],
    comments: [], activity: [{ id: 'a3', action: 'Task created', timestamp: '2026-02-12T14:00:00Z' }],
    createdAt: '2026-02-12T14:00:00Z',
  },
  {
    id: 'demo-3', title: 'Conectar API de OpenClaw', description: 'Integrar datos reales del gateway',
    priority: 'medium', status: 'pending', deadline: '2026-02-20',
    subtasks: [], comments: [], activity: [{ id: 'a4', action: 'Task created', timestamp: '2026-02-13T08:00:00Z' }],
    createdAt: '2026-02-13T08:00:00Z',
  },
]

async function fetchTasks(): Promise<Task[] | null> {
  try {
    const res = await fetch('/api/tasks')
    if (!res.ok) return null
    const data = await res.json()
    return data.tasks ?? null
  } catch {
    return null
  }
}

async function saveTasks(tasks: Task[]): Promise<boolean> {
  try {
    const res = await fetch('/api/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks }),
    })
    return res.ok
  } catch {
    return false
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loaded, setLoaded] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load: try server first, fallback to localStorage, then defaults
  useEffect(() => {
    ;(async () => {
      const serverTasks = await fetchTasks()
      if (serverTasks && serverTasks.length > 0) {
        setTasks(serverTasks)
      } else {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            setTasks(parsed)
            // Migrate localStorage data to server
            saveTasks(parsed)
          } catch {
            setTasks(defaultTasks)
          }
        } else {
          setTasks(defaultTasks)
          saveTasks(defaultTasks)
        }
      }
      setLoaded(true)
    })()
  }, [])

  // Save: debounced write to server + localStorage fallback
  useEffect(() => {
    if (!loaded) return
    // Always keep localStorage as fallback
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    // Debounce server save (300ms)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveTasks(tasks)
    }, 300)
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [tasks, loaded])

  const addTask = useCallback((title: string, description: string, priority: Priority, deadline: string) => {
    const id = generateId()
    const now = timestamp()
    setTasks(prev => [...prev, {
      id, title, description, priority, status: 'pending' as Status, deadline,
      subtasks: [], comments: [],
      activity: [{ id: generateId(), action: 'Task created', timestamp: now }],
      createdAt: now,
    }])
  }, [])

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }, [])

  const moveTask = useCallback((id: string, newStatus: Status) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id || t.status === newStatus) return t
      return {
        ...t, status: newStatus,
        activity: [...t.activity, { id: generateId(), action: `Moved to ${newStatus}`, timestamp: timestamp() }],
      }
    }))
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }, [])

  const addSubtask = useCallback((taskId: string, title: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t
      return { ...t, subtasks: [...t.subtasks, { id: generateId(), title, completed: false }] }
    }))
  }, [])

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t
      return { ...t, subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s) }
    }))
  }, [])

  const addComment = useCallback((taskId: string, text: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t
      return {
        ...t,
        comments: [...t.comments, { id: generateId(), text, createdAt: timestamp() }],
        activity: [...t.activity, { id: generateId(), action: 'Comment added', timestamp: timestamp() }],
      }
    }))
  }, [])

  return { tasks, loaded, addTask, updateTask, moveTask, deleteTask, addSubtask, toggleSubtask, addComment }
}
