import { create } from 'zustand'
import type { Habit } from '../../electron/preload'

interface HabitStore {
  habits: Habit[]
  loading: boolean
  error: string | null
  
  fetchHabits: () => Promise<void>
  createHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => Promise<void>
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>
  deleteHabit: (id: string) => Promise<void>
  logHabit: (habitId: string, date: string) => Promise<void>
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  loading: false,
  error: null,

  fetchHabits: async () => {
    set({ loading: true, error: null })
    try {
      const result = await window.api.habits.list()
      if (result.success) {
        set({ habits: result.data, loading: false })
      } else {
        set({ error: result.error, loading: false })
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  createHabit: async (habit) => {
    set({ loading: true, error: null })
    try {
      const result = await window.api.habits.create(habit)
      if (result.success) {
        set({ habits: [result.data, ...get().habits], loading: false })
      } else {
        set({ error: result.error, loading: false })
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  updateHabit: async (id, updates) => {
    set({ loading: true, error: null })
    try {
      const result = await window.api.habits.update(id, updates)
      if (result.success) {
        set({
          habits: get().habits.map(h => h.id === id ? { ...h, ...updates } : h),
          loading: false
        })
      } else {
        set({ error: result.error, loading: false })
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  deleteHabit: async (id) => {
    set({ loading: true, error: null })
    try {
      const result = await window.api.habits.delete(id)
      if (result.success) {
        set({ habits: get().habits.filter(h => h.id !== id), loading: false })
      } else {
        set({ error: result.error, loading: false })
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  logHabit: async (habitId, date) => {
    try {
      const result = await window.api.habits.log(habitId, date)
      if (result.success) {
        // Refresh habit to update streak
        await get().fetchHabits()
      }
    } catch (error) {
      console.error('Failed to log habit:', error)
    }
  }
}))
