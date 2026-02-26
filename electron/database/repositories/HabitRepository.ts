import Database from 'better-sqlite3'
import { randomUUID } from 'crypto'

export type Habit = {
  id: string
  name: string
  frequency: 'daily' | 'weekly' | 'monthly'
  streak: number
  createdAt: string
}

export type HabitLog = {
  id: string
  habitId: string
  date: string
  createdAt: string
}

export class HabitRepository {
  constructor(private db: Database.Database) {}

  create(habit: Omit<Habit, 'id' | 'createdAt'>): Habit {
    const id = randomUUID()
    const now = new Date().toISOString()

    const stmt = this.db.prepare(`
      INSERT INTO habits (id, name, frequency, streak, created_at)
      VALUES (?, ?, ?, ?, ?)
    `)

    stmt.run(id, habit.name, habit.frequency, habit.streak || 0, now)

    return { id, ...habit, streak: habit.streak || 0, createdAt: now }
  }

  list(): Habit[] {
    const stmt = this.db.prepare('SELECT * FROM habits ORDER BY created_at DESC')
    return stmt.all() as Habit[]
  }

  getById(id: string): Habit | null {
    const stmt = this.db.prepare('SELECT * FROM habits WHERE id = ?')
    return stmt.get(id) as Habit | null
  }

  update(id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>): void {
    const fields: string[] = []
    const values: unknown[] = []

    if (updates.name !== undefined) {
      fields.push('name = ?')
      values.push(updates.name)
    }
    if (updates.frequency !== undefined) {
      fields.push('frequency = ?')
      values.push(updates.frequency)
    }
    if (updates.streak !== undefined) {
      fields.push('streak = ?')
      values.push(updates.streak)
    }

    if (fields.length === 0) return

    values.push(id)
    const stmt = this.db.prepare(`UPDATE habits SET ${fields.join(', ')} WHERE id = ?`)
    stmt.run(...values)
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM habits WHERE id = ?').run(id)
  }

  logCompletion(habitId: string, date: string): void {
    const id = randomUUID()
    const now = new Date().toISOString()

    try {
      const stmt = this.db.prepare(`
        INSERT INTO habit_logs (id, habit_id, date, created_at)
        VALUES (?, ?, ?, ?)
      `)
      stmt.run(id, habitId, date, now)

      // Update streak
      this.updateStreak(habitId)
    } catch {
      // Duplicate entry, ignore
    }
  }

  getLogs(habitId: string, startDate: string, endDate: string): HabitLog[] {
    const stmt = this.db.prepare(`
      SELECT * FROM habit_logs 
      WHERE habit_id = ? AND date >= ? AND date <= ?
      ORDER BY date DESC
    `)
    return stmt.all(habitId, startDate, endDate) as HabitLog[]
  }

  private updateStreak(habitId: string): void {
    const logs = this.db.prepare(`
      SELECT date FROM habit_logs 
      WHERE habit_id = ?
      ORDER BY date DESC
      LIMIT 30
    `).all(habitId) as { date: string }[]

    if (logs.length === 0) {
      this.db.prepare('UPDATE habits SET streak = 0 WHERE id = ?').run(habitId)
      return
    }

    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < logs.length; i++) {
      const logDate = new Date(logs[i].date)
      logDate.setHours(0, 0, 0, 0)

      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - i)

      if (logDate.getTime() === expectedDate.getTime()) {
        streak++
      } else {
        break
      }
    }

    this.db.prepare('UPDATE habits SET streak = ? WHERE id = ?').run(streak, habitId)
  }
}
