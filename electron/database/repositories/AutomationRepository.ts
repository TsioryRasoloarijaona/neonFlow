import Database from 'better-sqlite3'
import { randomUUID } from 'crypto'

export type Automation = {
  id: string
  name: string
  enabled: boolean
  trigger: {
    type: 'tag' | 'status' | 'dueDate'
    condition: string
  }
  action: {
    type: 'notify' | 'move' | 'tag'
    params: Record<string, unknown>
  }
  createdAt: string
}

export class AutomationRepository {
  constructor(private db: Database.Database) {}

  create(automation: Omit<Automation, 'id' | 'createdAt'>): Automation {
    const id = randomUUID()
    const now = new Date().toISOString()

    const stmt = this.db.prepare(`
      INSERT INTO automations (id, name, enabled, trigger_type, trigger_condition, 
                              action_type, action_params, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      automation.name,
      automation.enabled ? 1 : 0,
      automation.trigger.type,
      automation.trigger.condition,
      automation.action.type,
      JSON.stringify(automation.action.params),
      now
    )

    return { id, ...automation, createdAt: now }
  }

  list(): Automation[] {
    const stmt = this.db.prepare('SELECT * FROM automations ORDER BY created_at DESC')
    const rows = stmt.all() as unknown[]
    return rows.map(row => this.mapRowToAutomation(row))
  }

  getById(id: string): Automation | null {
    const stmt = this.db.prepare('SELECT * FROM automations WHERE id = ?')
    const row = stmt.get(id)
    if (!row) return null
    return this.mapRowToAutomation(row)
  }

  update(id: string, updates: Partial<Omit<Automation, 'id' | 'createdAt'>>): void {
    const fields: string[] = []
    const values: unknown[] = []

    if (updates.name !== undefined) {
      fields.push('name = ?')
      values.push(updates.name)
    }
    if (updates.enabled !== undefined) {
      fields.push('enabled = ?')
      values.push(updates.enabled ? 1 : 0)
    }
    if (updates.trigger !== undefined) {
      fields.push('trigger_type = ?', 'trigger_condition = ?')
      values.push(updates.trigger.type, updates.trigger.condition)
    }
    if (updates.action !== undefined) {
      fields.push('action_type = ?', 'action_params = ?')
      values.push(updates.action.type, JSON.stringify(updates.action.params))
    }

    if (fields.length === 0) return

    values.push(id)
    const stmt = this.db.prepare(`UPDATE automations SET ${fields.join(', ')} WHERE id = ?`)
    stmt.run(...values)
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM automations WHERE id = ?').run(id)
  }

  private mapRowToAutomation(row: unknown): Automation {
    const r = row as {
      id: string
      name: string
      enabled: number
      trigger_type: 'tag' | 'status' | 'dueDate'
      trigger_condition: string
      action_type: 'notify' | 'move' | 'tag'
      action_params: string
      created_at: string
    }

    return {
      id: r.id,
      name: r.name,
      enabled: r.enabled === 1,
      trigger: {
        type: r.trigger_type,
        condition: r.trigger_condition
      },
      action: {
        type: r.action_type,
        params: JSON.parse(r.action_params)
      },
      createdAt: r.created_at
    }
  }
}
