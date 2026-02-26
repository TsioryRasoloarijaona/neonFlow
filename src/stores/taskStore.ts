import { create } from 'zustand'
import type { Task } from '../../electron/preload'

interface TaskStore {
  tasks: Task[]
  loading: boolean
  error: string | null
  
  fetchTasks: (filter?: { status?: string; projectId?: string }) => Promise<void>
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  searchTasks: (query: string) => Promise<void>
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async (filter) => {
    set({ loading: true, error: null })
    try {
      const result = await window.api.tasks.list(filter)
      if (result.success) {
        set({ tasks: result.data, loading: false })
      } else {
        set({ error: result.error, loading: false })
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  createTask: async (task) => {
    set({ loading: true, error: null })
    try {
      console.log('Creating task:', task)
      console.log('window.api available:', !!window.api)
      const result = await window.api.tasks.create(task)
      console.log('Create result:', result)
      if (result.success) {
        set({ tasks: [result.data, ...get().tasks], loading: false })
      } else {
        set({ error: result.error, loading: false })
      }
    } catch (error) {
      console.error('Create task error:', error)
      set({ error: (error as Error).message, loading: false })
    }
  },

  updateTask: async (id, updates) => {
    set({ loading: true, error: null })
    try {
      const result = await window.api.tasks.update(id, updates)
      if (result.success) {
        set({
          tasks: get().tasks.map(t => t.id === id ? { ...t, ...updates } : t),
          loading: false
        })
      } else {
        set({ error: result.error, loading: false })
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  deleteTask: async (id) => {
    set({ loading: true, error: null })
    try {
      const result = await window.api.tasks.delete(id)
      if (result.success) {
        set({ tasks: get().tasks.filter(t => t.id !== id), loading: false })
      } else {
        set({ error: result.error, loading: false })
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  searchTasks: async (query) => {
    set({ loading: true, error: null })
    try {
      const result = await window.api.tasks.search(query)
      if (result.success) {
        set({ tasks: result.data, loading: false })
      } else {
        set({ error: result.error, loading: false })
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  }
}))
