import Database from 'better-sqlite3'
import { randomUUID } from 'crypto'

export type FocusSession = {
  id: string
  taskId?: string
  type: 'pomodoro' | 'break' | 'long-break'
  duration: number
  startTime: string
  endTime?: string
  completed: boolean
}

export class FocusSessionRepository {
  constructor(private db: Database.Database) {}

  create(session: Omit<FocusSession, 'id'>): FocusSession {
    const id = randomUUID()

    const stmt = this.db.prepare(`
      INSERT INTO focus_sessions (id, task_id, type, duration, start_time, end_time, completed)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      session.taskId || null,
      session.type,
      session.duration,
      session.startTime,
      session.endTime || null,
      session.completed ? 1 : 0
    )

    return { id, ...session }
  }

  list(filter?: { startDate?: string; endDate?: string }): FocusSession[] {
    let query = 'SELECT * FROM focus_sessions WHERE 1=1'
    const params: unknown[] = []

    if (filter?.startDate) {
      query += ' AND start_time >= ?'
      params.push(filter.startDate)
    }

    if (filter?.endDate) {
      query += ' AND start_time <= ?'
      params.push(filter.endDate)
    }

    query += ' ORDER BY start_time DESC'

    const stmt = this.db.prepare(query)
    const rows = stmt.all(...params) as unknown[]

    return rows.map(row => this.mapRowToSession(row))
  }

  getStats(startDate: string, endDate: string): {
    totalSessions: number
    totalMinutes: number
    completedSessions: number
    byType: Record<string, number>
  } {
    const sessions = this.list({ startDate, endDate })

    const stats = {
      totalSessions: sessions.length,
      totalMinutes: sessions.reduce((sum, s) => sum + s.duration, 0),
      completedSessions: sessions.filter(s => s.completed).length,
      byType: {} as Record<string, number>
    }

    for (const session of sessions) {
      stats.byType[session.type] = (stats.byType[session.type] || 0) + 1
    }

    return stats
  }

  private mapRowToSession(row: unknown): FocusSession {
    const r = row as {
      id: string
      task_id: string | null
      type: 'pomodoro' | 'break' | 'long-break'
      duration: number
      start_time: string
      end_time: string | null
      completed: number
    }

    return {
      id: r.id,
      taskId: r.task_id || undefined,
      type: r.type,
      duration: r.duration,
      startTime: r.start_time,
      endTime: r.end_time || undefined,
      completed: r.completed === 1
    }
  }
}
