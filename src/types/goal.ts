export interface GoalStep {
  id: string
  goalId: string
  title: string
  completed: boolean
  order: number
  createdAt: string
}

export interface Goal {
  id: string
  title: string
  description?: string
  deadline?: string
  steps: GoalStep[]
  createdAt: string
  updatedAt: string
}

export interface GoalStore {
  goals: Goal[]
  loading: boolean
  currentGoal: Goal | null
  fetchGoals: () => Promise<void>
  createGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'steps'>) => Promise<void>
  updateGoal: (id: string, goal: Partial<Goal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  addStep: (goalId: string, title: string) => Promise<void>
  updateStep: (stepId: string, updates: Partial<GoalStep>) => Promise<void>
  deleteStep: (stepId: string) => Promise<void>
  toggleStepCompletion: (stepId: string) => Promise<void>
  setCurrentGoal: (goal: Goal | null) => void
}
