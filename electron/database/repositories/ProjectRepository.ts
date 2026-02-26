import Database from 'better-sqlite3'
import { randomUUID } from 'crypto'

export type Project = {
  id: string
  name: string
  color?: string
  createdAt: string
}

export class ProjectRepository {
  constructor(private db: Database.Database) {}

  create(project: Omit<Project, 'id' | 'createdAt'>): Project {
    const id = randomUUID()
    const now = new Date().toISOString()

    const stmt = this.db.prepare(`
      INSERT INTO projects (id, name, color, created_at)
      VALUES (?, ?, ?, ?)
    `)

    stmt.run(id, project.name, project.color || null, now)

    return { id, ...project, createdAt: now }
  }

  list(): Project[] {
    const stmt = this.db.prepare('SELECT * FROM projects ORDER BY created_at DESC')
    return stmt.all() as Project[]
  }

  getById(id: string): Project | null {
    const stmt = this.db.prepare('SELECT * FROM projects WHERE id = ?')
    return stmt.get(id) as Project | null
  }

  update(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): void {
    const fields: string[] = []
    const values: unknown[] = []

    if (updates.name !== undefined) {
      fields.push('name = ?')
      values.push(updates.name)
    }
    if (updates.color !== undefined) {
      fields.push('color = ?')
      values.push(updates.color)
    }

    if (fields.length === 0) return

    values.push(id)
    const stmt = this.db.prepare(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`)
    stmt.run(...values)
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM projects WHERE id = ?').run(id)
  }
}
