import { create } from 'zustand'
import type { FocusSession } from '../../electron/preload'

interface FocusStore {
  sessions: FocusSession[]
  activeSession: FocusSession | null
  loading: boolean
  error: string | null
  
  fetchSessions: (filter?: { startDate?: string; endDate?: string }) => Promise<void>
  startSession: (session: Omit<FocusSession, 'id'>) => Promise<void>
  completeSession: (id: string, endTime: string) => Promise<void>
  getStats: (startDate: string, endDate: string) => Promise<any>
}

export const useFocusStore = create<FocusStore>((set, get) => ({
  sessions: [],
  activeSession: null,
  loading: false,
  error: null,

  fetchSessions: async (filter) => {
    set({ loading: true, error: null })
    try {
      const result = await window.api.focus.list(filter)
      if (result.success) {
        set({ sessions: result.data, loading: false })
      } else {
        set({ error: result.error, loading: false })
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  startSession: async (session) => {
    set({ loading: true, error: null })
    try {
      const result = await window.api.focus.create(session)
      if (result.success) {
        set({ 
          activeSession: result.data,
          sessions: [result.data, ...get().sessions],
          loading: false 
        })
      } else {
        set({ error: result.error, loading: false })
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  completeSession: async (_id, _endTime) => {
    set({ loading: true, error: null })
    try {
      // In a real app, you'd have an update endpoint
      set({ 
        activeSession: null,
        loading: false 
      })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  getStats: async (startDate, endDate) => {
    try {
      const result = await window.api.focus.stats(startDate, endDate)
      if (result.success) {
        return result.data
      }
      return null
    } catch (error) {
      return null
    }
  }
}))
