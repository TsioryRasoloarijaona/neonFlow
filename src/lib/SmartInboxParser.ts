import { z } from 'zod'
import { addDays, setHours, setMinutes, nextMonday, nextTuesday, nextWednesday, nextThursday, nextFriday, nextSaturday, nextSunday, isValid } from 'date-fns'

export const TaskInputSchema = z.object({
  title: z.string().min(1),
  tags: z.array(z.string()).default([]),
  project: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.date().optional(),
})

export type ParsedTaskInput = z.infer<typeof TaskInputSchema>

export class SmartInboxParser {
  parse(input: string): ParsedTaskInput {
    let remaining = input.trim()
    const tags: string[] = []
    let project: string | undefined
    let priority: 'low' | 'medium' | 'high' = 'medium'
    let dueDate: Date | undefined

    // Extract tags (#tag)
    const tagMatches = remaining.matchAll(/#(\w+)/g)
    for (const match of tagMatches) {
      tags.push(match[1])
      remaining = remaining.replace(match[0], '').trim()
    }

    // Extract project (@project)
    const projectMatch = remaining.match(/@(\w+)/)
    if (projectMatch) {
      project = projectMatch[1]
      remaining = remaining.replace(projectMatch[0], '').trim()
    }

    // Extract priority (!high, !med, !low)
    const priorityMatch = remaining.match(/!(high|med|medium|low)/i)
    if (priorityMatch) {
      const priorityStr = priorityMatch[1].toLowerCase()
      if (priorityStr === 'high') priority = 'high'
      else if (priorityStr === 'med' || priorityStr === 'medium') priority = 'medium'
      else if (priorityStr === 'low') priority = 'low'
      remaining = remaining.replace(priorityMatch[0], '').trim()
    }

    // Extract dates
    dueDate = this.parseDate(remaining)
    if (dueDate) {
      // Remove date references from title
      remaining = this.removeDateStrings(remaining)
    }

    const title = remaining.trim()

    return {
      title,
      tags,
      project,
      priority,
      dueDate,
    }
  }

  private parseDate(text: string): Date | undefined {
    const now = new Date()
    const lowerText = text.toLowerCase()

    // "today"
    if (lowerText.includes('today') || lowerText.includes('aujourd\'hui')) {
      return this.extractTime(text, now)
    }

    // "tomorrow" or "demain"
    if (lowerText.includes('tomorrow') || lowerText.includes('demain')) {
      return this.extractTime(text, addDays(now, 1))
    }

    // Days of week
    const dayMap: Record<string, (date: Date) => Date> = {
      'monday': nextMonday,
      'lundi': nextMonday,
      'tuesday': nextTuesday,
      'mardi': nextTuesday,
      'wednesday': nextWednesday,
      'mercredi': nextWednesday,
      'thursday': nextThursday,
      'jeudi': nextThursday,
      'friday': nextFriday,
      'vendredi': nextFriday,
      'saturday': nextSaturday,
      'samedi': nextSaturday,
      'sunday': nextSunday,
      'dimanche': nextSunday,
    }

    for (const [day, fn] of Object.entries(dayMap)) {
      if (lowerText.includes(day)) {
        return this.extractTime(text, fn(now))
      }
    }

    // DD/MM or DD/MM/YYYY
    const dateMatch = text.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/)
    if (dateMatch) {
      const day = parseInt(dateMatch[1])
      const month = parseInt(dateMatch[2]) - 1 // 0-indexed
      const year = dateMatch[3] ? (dateMatch[3].length === 2 ? 2000 + parseInt(dateMatch[3]) : parseInt(dateMatch[3])) : now.getFullYear()
      
      const date = new Date(year, month, day)
      if (isValid(date)) {
        return this.extractTime(text, date)
      }
    }

    return undefined
  }

  private extractTime(text: string, baseDate: Date): Date {
    // HH:MM or HHhMM
    const timeMatch = text.match(/(\d{1,2})[h:](\d{2})/)
    if (timeMatch) {
      const hours = parseInt(timeMatch[1])
      const minutes = parseInt(timeMatch[2])
      
      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        return setMinutes(setHours(baseDate, hours), minutes)
      }
    }

    // HHh without minutes
    const hourMatch = text.match(/(\d{1,2})h(?!\d)/)
    if (hourMatch) {
      const hours = parseInt(hourMatch[1])
      if (hours >= 0 && hours < 24) {
        return setHours(baseDate, hours)
      }
    }

    return baseDate
  }

  private removeDateStrings(text: string): string {
    return text
      .replace(/\b(today|tomorrow|demain|aujourd'hui)\b/gi, '')
      .replace(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, '')
      .replace(/\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b/gi, '')
      .replace(/\d{1,2}\/\d{1,2}(?:\/\d{2,4})?/g, '')
      .replace(/\d{1,2}[h:]\d{2}/g, '')
      .replace(/\d{1,2}h(?!\d)/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }
}

export const smartInboxParser = new SmartInboxParser()
