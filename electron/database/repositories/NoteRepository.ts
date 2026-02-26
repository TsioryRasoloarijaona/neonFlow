import Database from 'better-sqlite3'
import { randomUUID } from 'crypto'

export type Note = {
  id: string
  title: string
  content: string
  tags: string[]
  linkedTaskIds?: string[]
  createdAt: string
  updatedAt: string
}

export class NoteRepository {
  constructor(private db: Database.Database) {}

  create(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note {
    const id = randomUUID()
    const now = new Date().toISOString()

    const stmt = this.db.prepare(`
      INSERT INTO notes (id, title, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `)

    stmt.run(id, note.title, note.content, now, now)

    // Insert tags
    if (note.tags && note.tags.length > 0) {
      const tagStmt = this.db.prepare('INSERT INTO note_tags (note_id, tag) VALUES (?, ?)')
      for (const tag of note.tags) {
        tagStmt.run(id, tag)
      }
    }

    // Link tasks
    if (note.linkedTaskIds && note.linkedTaskIds.length > 0) {
      const linkStmt = this.db.prepare('INSERT INTO note_tasks (note_id, task_id) VALUES (?, ?)')
      for (const taskId of note.linkedTaskIds) {
        linkStmt.run(id, taskId)
      }
    }

    // Extract and create wiki links
    this.updateWikiLinks(id, note.content)

    return this.getById(id)!
  }

  list(): Note[] {
    const stmt = this.db.prepare('SELECT * FROM notes ORDER BY updated_at DESC')
    const rows = stmt.all() as unknown[]
    return rows.map(row => this.mapRowToNote(row))
  }

  getById(id: string): Note | null {
    const stmt = this.db.prepare('SELECT * FROM notes WHERE id = ?')
    const row = stmt.get(id)
    if (!row) return null
    return this.mapRowToNote(row)
  }

  update(id: string, updates: Partial<Note>): void {
    const now = new Date().toISOString()
    const fields: string[] = []
    const values: unknown[] = []

    if (updates.title !== undefined) {
      fields.push('title = ?')
      values.push(updates.title)
    }
    if (updates.content !== undefined) {
      fields.push('content = ?')
      values.push(updates.content)
      this.updateWikiLinks(id, updates.content)
    }

    fields.push('updated_at = ?')
    values.push(now)
    values.push(id)

    const stmt = this.db.prepare(`UPDATE notes SET ${fields.join(', ')} WHERE id = ?`)
    stmt.run(...values)

    // Update tags
    if (updates.tags !== undefined) {
      this.db.prepare('DELETE FROM note_tags WHERE note_id = ?').run(id)
      if (updates.tags.length > 0) {
        const tagStmt = this.db.prepare('INSERT INTO note_tags (note_id, tag) VALUES (?, ?)')
        for (const tag of updates.tags) {
          tagStmt.run(id, tag)
        }
      }
    }

    // Update linked tasks
    if (updates.linkedTaskIds !== undefined) {
      this.db.prepare('DELETE FROM note_tasks WHERE note_id = ?').run(id)
      if (updates.linkedTaskIds.length > 0) {
        const linkStmt = this.db.prepare('INSERT INTO note_tasks (note_id, task_id) VALUES (?, ?)')
        for (const taskId of updates.linkedTaskIds) {
          linkStmt.run(id, taskId)
        }
      }
    }
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM notes WHERE id = ?').run(id)
  }

  getBacklinks(noteId: string): Note[] {
    const stmt = this.db.prepare(`
      SELECT n.* FROM notes n
      INNER JOIN note_links nl ON n.id = nl.source_note_id
      WHERE nl.target_note_id = ?
    `)
    const rows = stmt.all(noteId) as unknown[]
    return rows.map(row => this.mapRowToNote(row))
  }

  private updateWikiLinks(noteId: string, content: string): void {
    // Delete existing links
    this.db.prepare('DELETE FROM note_links WHERE source_note_id = ?').run(noteId)

    // Extract [[Note Title]] patterns
    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g
    const matches = content.matchAll(wikiLinkRegex)

    for (const match of matches) {
      const targetTitle = match[1].trim()
      
      // Find note by title
      const targetNote = this.db.prepare('SELECT id FROM notes WHERE title = ?').get(targetTitle) as { id: string } | undefined
      
      if (targetNote) {
        try {
          this.db.prepare('INSERT INTO note_links (source_note_id, target_note_id) VALUES (?, ?)')
            .run(noteId, targetNote.id)
        } catch {
          // Ignore duplicate links
        }
      }
    }
  }

  private mapRowToNote(row: unknown): Note {
    const r = row as {
      id: string
      title: string
      content: string
      created_at: string
      updated_at: string
    }

    // Get tags
    const tagStmt = this.db.prepare('SELECT tag FROM note_tags WHERE note_id = ?')
    const tags = (tagStmt.all(r.id) as { tag: string }[]).map(t => t.tag)

    // Get linked tasks
    const taskStmt = this.db.prepare('SELECT task_id FROM note_tasks WHERE note_id = ?')
    const linkedTaskIds = (taskStmt.all(r.id) as { task_id: string }[]).map(t => t.task_id)

    return {
      id: r.id,
      title: r.title,
      content: r.content,
      tags,
      linkedTaskIds: linkedTaskIds.length > 0 ? linkedTaskIds : undefined,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }
  }
}
