import { contextBridge, ipcRenderer } from 'electron'

export type Task = {
  id?: string
  title: string
  description?: string
  status: 'todo' | 'doing' | 'done'
  priority: 'low' | 'medium' | 'high'
  tags: string[]
  projectId?: string
  dueDate?: string
  estimateMinutes?: number
  recurrence?: {
    type: 'daily' | 'weekly' | 'monthly'
    nextRun?: string
  }
  createdAt?: string
  updatedAt?: string
}

export type Project = {
  id?: string
  name: string
  color?: string
  createdAt?: string
}

export type Note = {
  id?: string
  title: string
  content: string
  tags: string[]
  linkedTaskIds?: string[]
  createdAt?: string
  updatedAt?: string
}

export type FocusSession = {
  id?: string
  taskId?: string
  type: 'pomodoro' | 'break' | 'long-break'
  duration: number
  startTime: string
  endTime?: string
  completed: boolean
}

export type Habit = {
  id?: string
  name: string
  frequency: 'daily' | 'weekly' | 'monthly'
  streak: number
  createdAt?: string
}

export type Goal = {
  id?: string
  title: string
  description?: string
  deadline?: string
  steps: GoalStep[]
  createdAt?: string
  updatedAt?: string
}

export type GoalStep = {
  id?: string
  goalId: string
  title: string
  completed: boolean
  order: number
  createdAt?: string
}

export type Automation = {
  id?: string
  name: string
  enabled: boolean
  trigger: {
    type: 'tag' | 'status' | 'dueDate'
    condition: string
  }
  action: {
    type: 'notify' | 'move' | 'tag'
    params: Record<string, unknown>
  }
  createdAt?: string
}

const api = {
  tasks: {
    create: (task: Task) => ipcRenderer.invoke('tasks:create', task),
    list: (filter?: { status?: string; projectId?: string }) => 
      ipcRenderer.invoke('tasks:list', filter),
    get: (id: string) => ipcRenderer.invoke('tasks:get', id),
    update: (id: string, updates: Partial<Task>) => 
      ipcRenderer.invoke('tasks:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('tasks:delete', id),
    search: (query: string) => ipcRenderer.invoke('tasks:search', query),
  },
  projects: {
    create: (project: Project) => ipcRenderer.invoke('projects:create', project),
    list: () => ipcRenderer.invoke('projects:list'),
    update: (id: string, updates: Partial<Project>) => 
      ipcRenderer.invoke('projects:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('projects:delete', id),
  },
  notes: {
    create: (note: Note) => ipcRenderer.invoke('notes:create', note),
    list: () => ipcRenderer.invoke('notes:list'),
    get: (id: string) => ipcRenderer.invoke('notes:get', id),
    update: (id: string, updates: Partial<Note>) => 
      ipcRenderer.invoke('notes:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('notes:delete', id),
    getBacklinks: (noteId: string) => ipcRenderer.invoke('notes:getBacklinks', noteId),
  },
  focus: {
    create: (session: FocusSession) => ipcRenderer.invoke('focus:create', session),
    list: (filter?: { startDate?: string; endDate?: string }) => 
      ipcRenderer.invoke('focus:list', filter),
    stats: (startDate: string, endDate: string) => 
      ipcRenderer.invoke('focus:stats', startDate, endDate),
  },
  habits: {
    create: (habit: Habit) => ipcRenderer.invoke('habits:create', habit),
    list: () => ipcRenderer.invoke('habits:list'),
    update: (id: string, updates: Partial<Habit>) => 
      ipcRenderer.invoke('habits:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('habits:delete', id),
    log: (habitId: string, date: string) => 
      ipcRenderer.invoke('habits:log', habitId, date),
    logs: (habitId: string, startDate: string, endDate: string) => 
      ipcRenderer.invoke('habits:logs', habitId, startDate, endDate),
  },
  automations: {
    create: (automation: Automation) => 
      ipcRenderer.invoke('automations:create', automation),
    list: () => ipcRenderer.invoke('automations:list'),
    update: (id: string, updates: Partial<Automation>) => 
      ipcRenderer.invoke('automations:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('automations:delete', id),
  },
  goals: {
    getAll: () => ipcRenderer.invoke('goals:getAll'),
    create: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'steps'>) => 
      ipcRenderer.invoke('goals:create', goal),
    update: (id: string, updates: Partial<Goal>) => 
      ipcRenderer.invoke('goals:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('goals:delete', id),
    addStep: (goalId: string, step: { title: string; order: number }) => 
      ipcRenderer.invoke('goals:addStep', goalId, step),
    updateStep: (stepId: string, updates: Partial<GoalStep>) => 
      ipcRenderer.invoke('goals:updateStep', stepId, updates),
    deleteStep: (stepId: string) => ipcRenderer.invoke('goals:deleteStep', stepId),
  },
  notification: {
    show: (title: string, body: string) => 
      ipcRenderer.invoke('notification:show', { title, body }),
  }
}

contextBridge.exposeInMainWorld('electron', api)

export type API = typeof api
