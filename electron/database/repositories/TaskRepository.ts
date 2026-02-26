import Database from 'better-sqlite3'
import { randomUUID } from 'crypto'

export type Task = {
  id: string
  title: string
  description?: string
  status: 'todo' | 'doing' | 'done'
  priority: 'low' | 'medium' | 'high'
  tags: string[]
  projectId?: string
  dueDate?: string
  estimateMinutes?: number
  recurrence?: {
    type: 'daily' | 'weekly' | 'monthly'
    nextRun?: string
  }
  createdAt: string
  updatedAt: string
}

export class TaskRepository {
  constructor(private db: Database.Database) {}

  create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const id = randomUUID()
    const now = new Date().toISOString()

    const stmt = this.db.prepare(`
      INSERT INTO tasks (id, title, description, status, priority, project_id, 
                        due_date, estimate_minutes, recurrence_type, recurrence_next_run, 
                        created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      task.title,
      task.description || null,
      task.status,
      task.priority,
      task.projectId || null,
      task.dueDate || null,
      task.estimateMinutes || null,
      task.recurrence?.type || null,
      task.recurrence?.nextRun || null,
      now,
      now
    )

    // Insert tags
    if (task.tags && task.tags.length > 0) {
      const tagStmt = this.db.prepare('INSERT INTO task_tags (task_id, tag) VALUES (?, ?)')
      for (const tag of task.tags) {
        tagStmt.run(id, tag)
      }
    }

    return this.getById(id)!
  }

  list(filter?: { status?: string; projectId?: string }): Task[] {
    let query = 'SELECT * FROM tasks WHERE 1=1'
    const params: unknown[] = []

    if (filter?.status) {
      query += ' AND status = ?'
      params.push(filter.status)
    }

    if (filter?.projectId) {
      query += ' AND project_id = ?'
      params.push(filter.projectId)
    }

    query += ' ORDER BY created_at DESC'

    const stmt = this.db.prepare(query)
    const rows = stmt.all(...params) as unknown[]

    return rows.map(row => this.mapRowToTask(row))
  }

  getById(id: string): Task | null {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE id = ?')
    const row = stmt.get(id)

    if (!row) return null
    return this.mapRowToTask(row)
  }

  update(id: string, updates: Partial<Task>): void {
    const now = new Date().toISOString()
    const fields: string[] = []
    const values: unknown[] = []

    if (updates.title !== undefined) {
      fields.push('title = ?')
      values.push(updates.title)
    }
    if (updates.description !== undefined) {
      fields.push('description = ?')
      values.push(updates.description)
    }
    if (updates.status !== undefined) {
      fields.push('status = ?')
      values.push(updates.status)
    }
    if (updates.priority !== undefined) {
      fields.push('priority = ?')
      values.push(updates.priority)
    }
    if (updates.projectId !== undefined) {
      fields.push('project_id = ?')
      values.push(updates.projectId)
    }
    if (updates.dueDate !== undefined) {
      fields.push('due_date = ?')
      values.push(updates.dueDate)
    }
    if (updates.estimateMinutes !== undefined) {
      fields.push('estimate_minutes = ?')
      values.push(updates.estimateMinutes)
    }
    if (updates.recurrence !== undefined) {
      fields.push('recurrence_type = ?', 'recurrence_next_run = ?')
      values.push(updates.recurrence?.type || null, updates.recurrence?.nextRun || null)
    }

    fields.push('updated_at = ?')
    values.push(now)
    values.push(id)

    const stmt = this.db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`)
    stmt.run(...values)

    // Update tags
    if (updates.tags !== undefined) {
      this.db.prepare('DELETE FROM task_tags WHERE task_id = ?').run(id)
      if (updates.tags.length > 0) {
        const tagStmt = this.db.prepare('INSERT INTO task_tags (task_id, tag) VALUES (?, ?)')
        for (const tag of updates.tags) {
          tagStmt.run(id, tag)
        }
      }
    }
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM tasks WHERE id = ?').run(id)
  }

  search(query: string): Task[] {
    const stmt = this.db.prepare(`
      SELECT DISTINCT t.* FROM tasks t
      LEFT JOIN task_tags tt ON t.id = tt.task_id
      WHERE t.title LIKE ? 
         OR t.description LIKE ?
         OR tt.tag LIKE ?
      ORDER BY t.created_at DESC
    `)

    const searchPattern = `%${query}%`
    const rows = stmt.all(searchPattern, searchPattern, searchPattern) as unknown[]

    return rows.map(row => this.mapRowToTask(row))
  }

  private mapRowToTask(row: unknown): Task {
    const r = row as {
      id: string
      title: string
      description: string | null
      status: 'todo' | 'doing' | 'done'
      priority: 'low' | 'medium' | 'high'
      project_id: string | null
      due_date: string | null
      estimate_minutes: number | null
      recurrence_type: string | null
      recurrence_next_run: string | null
      created_at: string
      updated_at: string
    }

    // Get tags
    const tagStmt = this.db.prepare('SELECT tag FROM task_tags WHERE task_id = ?')
    const tags = (tagStmt.all(r.id) as { tag: string }[]).map(t => t.tag)

    return {
      id: r.id,
      title: r.title,
      description: r.description || undefined,
      status: r.status,
      priority: r.priority,
      tags,
      projectId: r.project_id || undefined,
      dueDate: r.due_date || undefined,
      estimateMinutes: r.estimate_minutes || undefined,
      recurrence: r.recurrence_type ? {
        type: r.recurrence_type as 'daily' | 'weekly' | 'monthly',
        nextRun: r.recurrence_next_run || undefined
      } : undefined,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }
  }
}
