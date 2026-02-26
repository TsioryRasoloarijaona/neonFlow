import { describe, it, expect } from 'vitest'
import { SmartInboxParser } from './SmartInboxParser'
import { isToday, isTomorrow } from 'date-fns'

describe('SmartInboxParser', () => {
  const parser = new SmartInboxParser()

  describe('tags extraction', () => {
    it('should extract single tag', () => {
      const result = parser.parse('Buy groceries #shopping')
      expect(result.title).toBe('Buy groceries')
      expect(result.tags).toEqual(['shopping'])
    })

    it('should extract multiple tags', () => {
      const result = parser.parse('Meeting notes #work #meeting #important')
      expect(result.title).toBe('Meeting notes')
      expect(result.tags).toEqual(['work', 'meeting', 'important'])
    })

    it('should handle no tags', () => {
      const result = parser.parse('Simple task')
      expect(result.title).toBe('Simple task')
      expect(result.tags).toEqual([])
    })
  })

  describe('project extraction', () => {
    it('should extract project', () => {
      const result = parser.parse('Finish report @work')
      expect(result.title).toBe('Finish report')
      expect(result.project).toBe('work')
    })

    it('should handle tags and project together', () => {
      const result = parser.parse('Review PR #code @opensource #review')
      expect(result.title).toBe('Review PR')
      expect(result.project).toBe('opensource')
      expect(result.tags).toEqual(['code', 'review'])
    })
  })

  describe('priority extraction', () => {
    it('should extract high priority', () => {
      const result = parser.parse('Critical bug !high')
      expect(result.title).toBe('Critical bug')
      expect(result.priority).toBe('high')
    })

    it('should extract medium priority', () => {
      const result = parser.parse('Update docs !med')
      expect(result.title).toBe('Update docs')
      expect(result.priority).toBe('medium')
    })

    it('should extract low priority', () => {
      const result = parser.parse('Clean desk !low')
      expect(result.title).toBe('Clean desk')
      expect(result.priority).toBe('low')
    })

    it('should default to medium priority', () => {
      const result = parser.parse('Normal task')
      expect(result.priority).toBe('medium')
    })
  })

  describe('date parsing', () => {
    it('should parse "today"', () => {
      const result = parser.parse('Meeting today')
      expect(result.title).toBe('Meeting')
      expect(result.dueDate).toBeDefined()
      expect(isToday(result.dueDate!)).toBe(true)
    })

    it('should parse "tomorrow"', () => {
      const result = parser.parse('Call client tomorrow')
      expect(result.title).toBe('Call client')
      expect(result.dueDate).toBeDefined()
      expect(isTomorrow(result.dueDate!)).toBe(true)
    })

    it('should parse "demain" (French)', () => {
      const result = parser.parse('Appeler demain')
      expect(result.title).toBe('Appeler')
      expect(result.dueDate).toBeDefined()
      expect(isTomorrow(result.dueDate!)).toBe(true)
    })

    it('should parse date with time', () => {
      const result = parser.parse('Meeting today 16:30')
      expect(result.title).toBe('Meeting')
      expect(result.dueDate).toBeDefined()
      expect(result.dueDate!.getHours()).toBe(16)
      expect(result.dueDate!.getMinutes()).toBe(30)
    })

    it('should parse DD/MM format', () => {
      const result = parser.parse('Dentist appointment 24/02')
      expect(result.title).toBe('Dentist appointment')
      expect(result.dueDate).toBeDefined()
      expect(result.dueDate!.getDate()).toBe(24)
      expect(result.dueDate!.getMonth()).toBe(1) // February (0-indexed)
    })

    it('should parse DD/MM/YYYY format', () => {
      const result = parser.parse('Conference 15/06/2026')
      expect(result.title).toBe('Conference')
      expect(result.dueDate).toBeDefined()
      expect(result.dueDate!.getDate()).toBe(15)
      expect(result.dueDate!.getMonth()).toBe(5) // June
      expect(result.dueDate!.getFullYear()).toBe(2026)
    })
  })

  describe('complex inputs', () => {
    it('should parse complete task with all elements', () => {
      const result = parser.parse('Deploy new feature @backend #urgent #deploy !high tomorrow 10:00')
      
      expect(result.title).toBe('Deploy new feature')
      expect(result.project).toBe('backend')
      expect(result.tags).toEqual(['urgent', 'deploy'])
      expect(result.priority).toBe('high')
      expect(result.dueDate).toBeDefined()
      expect(isTomorrow(result.dueDate!)).toBe(true)
      expect(result.dueDate!.getHours()).toBe(10)
      expect(result.dueDate!.getMinutes()).toBe(0)
    })

    it('should handle mixed order of elements', () => {
      const result = parser.parse('!high #important Write documentation @docs 24/02 16h')
      
      expect(result.title).toBe('Write documentation')
      expect(result.priority).toBe('high')
      expect(result.tags).toEqual(['important'])
      expect(result.project).toBe('docs')
      expect(result.dueDate).toBeDefined()
    })
  })
})
