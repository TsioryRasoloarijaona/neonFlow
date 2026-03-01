import { create } from 'zustand'
import { GoalStore } from '../types/goal'

export const useGoalStore = create<GoalStore>((set, get) => ({
  goals: [],
  loading: false,
  currentGoal: null,

  fetchGoals: async () => {
    set({ loading: true })
    try {
      const response = await window.electron.goals.getAll()
      if (response.success && response.data) {
        set({ goals: response.data, loading: false })
      } else {
        throw new Error(response.error || 'Failed to fetch goals')
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error)
      set({ loading: false })
    }
  },

  createGoal: async (goalData) => {
    try {
      const response = await window.electron.goals.create({
        ...goalData,
        steps: []
      })
      if (response.success && response.data) {
        set((state) => ({ goals: [...state.goals, response.data] }))
      } else {
        throw new Error(response.error || 'Failed to create goal')
      }
    } catch (error) {
      console.error('Failed to create goal:', error)
      throw error
    }
  },

  updateGoal: async (id, updates) => {
    try {
      const response = await window.electron.goals.update(id, updates)
      if (response.success && response.data) {
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? response.data : g)),
          currentGoal: state.currentGoal?.id === id ? response.data : state.currentGoal
        }))
      } else {
        throw new Error(response.error || 'Failed to update goal')
      }
    } catch (error) {
      console.error('Failed to update goal:', error)
      throw error
    }
  },

  deleteGoal: async (id) => {
    try {
      const response = await window.electron.goals.delete(id)
      if (response.success) {
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
          currentGoal: state.currentGoal?.id === id ? null : state.currentGoal
        }))
      } else {
        throw new Error(response.error || 'Failed to delete goal')
      }
    } catch (error) {
      console.error('Failed to delete goal:', error)
      throw error
    }
  },

  addStep: async (goalId, title) => {
    try {
      const goal = get().goals.find((g) => g.id === goalId)
      if (!goal) throw new Error('Goal not found')
      
      const response = await window.electron.goals.addStep(goalId, {
        title,
        order: goal.steps.length
      })
      
      if (response.success && response.data) {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === goalId ? { ...g, steps: [...g.steps, response.data] } : g
          ),
          currentGoal: state.currentGoal?.id === goalId
            ? { ...state.currentGoal, steps: [...state.currentGoal.steps, response.data] }
            : state.currentGoal
        }))
      } else {
        throw new Error(response.error || 'Failed to add step')
      }
    } catch (error) {
      console.error('Failed to add step:', error)
      throw error
    }
  },

  updateStep: async (stepId, updates) => {
    try {
      const response = await window.electron.goals.updateStep(stepId, updates)
      if (response.success && response.data) {
        set((state) => ({
          goals: state.goals.map((g) => ({
            ...g,
            steps: g.steps.map((s) => (s.id === stepId ? response.data : s))
          })),
          currentGoal: state.currentGoal
            ? {
                ...state.currentGoal,
                steps: state.currentGoal.steps.map((s) => (s.id === stepId ? response.data : s))
              }
            : null
        }))
      } else {
        throw new Error(response.error || 'Failed to update step')
      }
    } catch (error) {
      console.error('Failed to update step:', error)
      throw error
    }
  },

  deleteStep: async (stepId) => {
    try {
      const response = await window.electron.goals.deleteStep(stepId)
      if (response.success) {
        set((state) => ({
          goals: state.goals.map((g) => ({
            ...g,
            steps: g.steps.filter((s) => s.id !== stepId)
          })),
          currentGoal: state.currentGoal
            ? {
                ...state.currentGoal,
                steps: state.currentGoal.steps.filter((s) => s.id !== stepId)
              }
            : null
        }))
      } else {
        throw new Error(response.error || 'Failed to delete step')
      }
    } catch (error) {
      console.error('Failed to delete step:', error)
      throw error
    }
  },

  toggleStepCompletion: async (stepId) => {
    try {
      const goal = get().goals.find((g) => g.steps.some((s) => s.id === stepId))
      const step = goal?.steps.find((s) => s.id === stepId)
      if (!step) throw new Error('Step not found')
      
      await get().updateStep(stepId, { completed: !step.completed })
    } catch (error) {
      console.error('Failed to toggle step:', error)
      throw error
    }
  },

  setCurrentGoal: (goal) => set({ currentGoal: goal })
}))
