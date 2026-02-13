export type Priority = 'high' | 'medium' | 'low'
export type Status = 'pending' | 'in-progress' | 'completed'

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface Comment {
  id: string
  text: string
  createdAt: string
}

export interface ActivityEntry {
  id: string
  action: string
  timestamp: string
}

export interface Task {
  id: string
  title: string
  description: string
  priority: Priority
  status: Status
  deadline: string
  subtasks: Subtask[]
  comments: Comment[]
  activity: ActivityEntry[]
  createdAt: string
}

export const COLUMNS: { id: Status; label: string; icon: string }[] = [
  { id: 'pending', label: 'Pendiente', icon: '⏳' },
  { id: 'in-progress', label: 'En Proceso', icon: '🔄' },
  { id: 'completed', label: 'Completada', icon: '✅' },
]
