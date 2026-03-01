import Database from 'better-sqlite3'
import { v4 as uuidv4 } from 'uuid'

interface Goal {
  id: string
  title: string
  description?: string
  deadline?: string
  createdAt: string
  updatedAt: string
}

interface GoalStep {
  id: string
  goalId: string
  title: string
  completed: boolean
  order: number
  createdAt: string
}

export class GoalRepository {
  constructor(private db: Database.Database) {}

  getAll(): (Goal & { steps: GoalStep[] })[] {
    const goals = this.db.prepare(`
      SELECT * FROM goals ORDER BY createdAt DESC
    `).all() as Goal[]

    return goals.map(goal => ({
      ...goal,
      steps: this.getStepsByGoalId(goal.id)
    }))
  }

  getById(id: string): (Goal & { steps: GoalStep[] }) | null {
    const goal = this.db.prepare(`
      SELECT * FROM goals WHERE id = ?
    `).get(id) as Goal | undefined

    if (!goal) return null

    return {
      ...goal,
      steps: this.getStepsByGoalId(goal.id)
    }
  }

  create(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Goal & { steps: GoalStep[] } {
    const id = uuidv4()
    const now = new Date().toISOString()

    this.db.prepare(`
      INSERT INTO goals (id, title, description, deadline, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, goal.title, goal.description || null, goal.deadline || null, now, now)

    return this.getById(id)!
  }

  update(id: string, updates: Partial<Goal>): Goal & { steps: GoalStep[] } {
    const now = new Date().toISOString()
    const fields: string[] = []
    const values: any[] = []

    if (updates.title !== undefined) {
      fields.push('title = ?')
      values.push(updates.title)
    }
    if (updates.description !== undefined) {
      fields.push('description = ?')
      values.push(updates.description || null)
    }
    if (updates.deadline !== undefined) {
      fields.push('deadline = ?')
      values.push(updates.deadline || null)
    }

    if (fields.length > 0) {
      fields.push('updatedAt = ?')
      values.push(now)
      values.push(id)

      this.db.prepare(`
        UPDATE goals SET ${fields.join(', ')} WHERE id = ?
      `).run(...values)
    }

    return this.getById(id)!
  }

  delete(id: string): void {
    // Delete all steps first
    this.db.prepare('DELETE FROM goal_steps WHERE goalId = ?').run(id)
    // Delete the goal
    this.db.prepare('DELETE FROM goals WHERE id = ?').run(id)
  }

  // Goal Steps Methods
  getStepsByGoalId(goalId: string): GoalStep[] {
    return this.db.prepare(`
      SELECT * FROM goal_steps WHERE goalId = ? ORDER BY \`order\` ASC
    `).all(goalId) as GoalStep[]
  }

  addStep(goalId: string, step: { title: string; order: number }): GoalStep {
    const id = uuidv4()
    const now = new Date().toISOString()

    this.db.prepare(`
      INSERT INTO goal_steps (id, goalId, title, completed, \`order\`, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, goalId, step.title, 0, step.order, now)

    return this.db.prepare('SELECT * FROM goal_steps WHERE id = ?').get(id) as GoalStep
  }

  updateStep(stepId: string, updates: Partial<GoalStep>): GoalStep {
    const fields: string[] = []
    const values: any[] = []

    if (updates.title !== undefined) {
      fields.push('title = ?')
      values.push(updates.title)
    }
    if (updates.completed !== undefined) {
      fields.push('completed = ?')
      values.push(updates.completed ? 1 : 0)
    }
    if (updates.order !== undefined) {
      fields.push('`order` = ?')
      values.push(updates.order)
    }

    if (fields.length > 0) {
      values.push(stepId)
      this.db.prepare(`
        UPDATE goal_steps SET ${fields.join(', ')} WHERE id = ?
      `).run(...values)
    }

    return this.db.prepare('SELECT * FROM goal_steps WHERE id = ?').get(stepId) as GoalStep
  }

  deleteStep(stepId: string): void {
    this.db.prepare('DELETE FROM goal_steps WHERE id = ?').run(stepId)
  }
}
