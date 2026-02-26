import { create } from 'zustand'
import type { Note } from '../../electron/preload'

interface NoteStore {
  notes: Note[]
  currentNote: Note | null
  loading: boolean
  error: string | null
  
  fetchNotes: () => Promise<void>
  createNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  setCurrentNote: (note: Note | null) => void
}

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: [],
  currentNote: null,
  loading: false,
  error: null,

  fetchNotes: async () => {
    set({ loading: true, error: null })
    try {
      const result = await window.api.notes.list()
      if (result.success) {
        set({ notes: result.data, loading: false })
      } else {
        set({ error: result.error, loading: false })
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  createNote: async (note) => {
    set({ loading: true, error: null })
    try {
      const result = await window.api.notes.create(note)
      if (result.success) {
        set({ notes: [result.data, ...get().notes], loading: false })
      } else {
        set({ error: result.error, loading: false })
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  updateNote: async (id, updates) => {
    set({ loading: true, error: null })
    try {
      const result = await window.api.notes.update(id, updates)
      if (result.success) {
        set({
          notes: get().notes.map(n => n.id === id ? { ...n, ...updates } : n),
          currentNote: get().currentNote?.id === id 
            ? { ...get().currentNote!, ...updates } 
            : get().currentNote,
          loading: false
        })
      } else {
        set({ error: result.error, loading: false })
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  deleteNote: async (id) => {
    set({ loading: true, error: null })
    try {
      const result = await window.api.notes.delete(id)
      if (result.success) {
        set({ 
          notes: get().notes.filter(n => n.id !== id),
          currentNote: get().currentNote?.id === id ? null : get().currentNote,
          loading: false 
        })
      } else {
        set({ error: result.error, loading: false })
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  setCurrentNote: (note) => {
    set({ currentNote: note })
  }
}))
