declare global {
  interface Window {
    electron: {
      tasks: {
        create: (task: any) => Promise<{ success: boolean; data?: any; error?: string }>
        list: () => Promise<{ success: boolean; data?: any[]; error?: string }>
        get: (id: string) => Promise<{ success: boolean; data?: any; error?: string }>
        update: (id: string, updates: any) => Promise<{ success: boolean; data?: any; error?: string }>
        delete: (id: string) => Promise<{ success: boolean; error?: string }>
        search: (query: string) => Promise<{ success: boolean; data?: any[]; error?: string }>
      }
      notes: {
        create: (note: any) => Promise<{ success: boolean; data?: any; error?: string }>
        list: () => Promise<{ success: boolean; data?: any[]; error?: string }>
        get: (id: string) => Promise<{ success: boolean; data?: any; error?: string }>
        update: (id: string, updates: any) => Promise<{ success: boolean; data?: any; error?: string }>
        delete: (id: string) => Promise<{ success: boolean; error?: string }>
      }
      habits: {
        create: (habit: any) => Promise<{ success: boolean; data?: any; error?: string }>
        list: () => Promise<{ success: boolean; data?: any[]; error?: string }>
        update: (id: string, updates: any) => Promise<{ success: boolean; data?: any; error?: string }>
        delete: (id: string) => Promise<{ success: boolean; error?: string }>
        log: (habitId: string, date: string) => Promise<{ success: boolean; error?: string }>
        logs: (habitId: string, startDate: string, endDate: string) => Promise<{ success: boolean; data?: any[]; error?: string }>
      }
      focus: {
        create: (session: any) => Promise<{ success: boolean; data?: any; error?: string }>
        list: (filter?: any) => Promise<{ success: boolean; data?: any[]; error?: string }>
        stats: (startDate: string, endDate: string) => Promise<{ success: boolean; data?: any; error?: string }>
      }
      goals: {
        getAll: () => Promise<{ success: boolean; data?: any[]; error?: string }>
        create: (goal: any) => Promise<{ success: boolean; data?: any; error?: string }>
        update: (id: string, updates: any) => Promise<{ success: boolean; data?: any; error?: string }>
        delete: (id: string) => Promise<{ success: boolean; error?: string }>
        addStep: (goalId: string, step: { title: string; order: number }) => Promise<{ success: boolean; data?: any; error?: string }>
        updateStep: (stepId: string, updates: any) => Promise<{ success: boolean; data?: any; error?: string }>
        deleteStep: (stepId: string) => Promise<{ success: boolean; error?: string }>
      }
    }
  }
}

export {}
