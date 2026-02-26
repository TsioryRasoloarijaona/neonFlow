import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Command } from 'cmdk'
import { LayoutDashboard, CheckSquare, Target, FileText, Flame, Zap, Settings, Plus, Clock, Search } from 'lucide-react'
import { useTaskStore } from '../../stores/taskStore'
import { useNoteStore } from '../../stores/noteStore'
import { useHabitStore } from '../../stores/habitStore'
import { Badge } from './Badge'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  onNavigate: (page: string, itemId?: string) => void
  onNewTask?: () => void
  onStartFocus?: () => void
}

const pages = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'focus', label: 'Focus Mode', icon: Target },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'habits', label: 'Habits', icon: Flame },
  { id: 'automations', label: 'Automations', icon: Zap },
  { id: 'settings', label: 'Settings', icon: Settings }
]

export function CommandPalette({ open, onClose, onNavigate, onNewTask, onStartFocus }: CommandPaletteProps) {
  const [search, setSearch] = useState('')
  const { tasks } = useTaskStore()
  const { notes } = useNoteStore()
  const { habits } = useHabitStore()

  // Filter results based on search query
  const filteredTasks = search.trim() 
    ? tasks.filter(task => 
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description?.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 5)
    : []

  const filteredNotes = search.trim()
    ? notes.filter(note =>
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.content?.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 5)
    : []

  const filteredHabits = search.trim()
    ? habits.filter(habit =>
        habit.name.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 5)
    : []

  const hasSearchResults = filteredTasks.length > 0 || filteredNotes.length > 0 || filteredHabits.length > 0

  const handleTaskClick = (taskId: string) => {
    onNavigate('tasks', taskId)
    onClose()
  }

  const handleNoteClick = (noteId: string) => {
    onNavigate('notes', noteId)
    onClose()
  }

  const handleHabitClick = (habitId: string) => {
    onNavigate('habits', habitId)
    onClose()
  }

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [onClose])

  if (!open) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/20 dark:bg-black/40 h-screen w-screen"
        />

        {/* Command Palette */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
          >
            <Command
              className="bg-white dark:bg-[#161B22] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-xl shadow-2xl overflow-hidden"
              label="Command Menu"
            >
              <div className="flex items-center border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] px-4">
                <span className="text-[#6B7280] dark:text-[#9CA3AF] mr-2">⌘</span>
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Type a command or search..."
                  className="w-full py-4 bg-transparent text-[#1F2937] dark:text-[#E6EDF3] placeholder-[#9CA3AF] dark:placeholder-[#6B7280] outline-none"
                />
              </div>

              <Command.List className="max-h-96 overflow-auto p-2">
                <Command.Empty className="py-6 text-center text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                  No results found.
                </Command.Empty>

                {/* Search Results */}
                {hasSearchResults && (
                  <>
                    {/* Tasks Results */}
                    {filteredTasks.length > 0 && (
                      <Command.Group heading="Tasks" className="text-[#6B7280] dark:text-[#9CA3AF] text-xs font-semibold px-2 py-1.5">
                        {filteredTasks.map((task) => (
                          <Command.Item
                            key={task.id}
                            value={`task-${task.id}-${task.title}`}
                            onSelect={() => handleTaskClick(task.id!)}
                            className="flex items-start gap-3 px-3 py-2.5 rounded-md cursor-pointer data-[selected=true]:bg-[#F3F4F6] dark:data-[selected=true]:bg-[#1C2128] data-[selected=true]:text-[#2563EB] dark:data-[selected=true]:text-[#60A5FA] transition-colors text-[#1F2937] dark:text-[#E6EDF3]"
                          >
                            <CheckSquare size={18} strokeWidth={2} className="text-[#3B82F6] dark:text-[#60A5FA] mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium truncate">{task.title}</span>
                                <Badge variant="info" size="sm">Task</Badge>
                              </div>
                              {task.description && (
                                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 truncate">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </Command.Item>
                        ))}
                      </Command.Group>
                    )}

                    {/* Notes Results */}
                    {filteredNotes.length > 0 && (
                      <Command.Group heading="Notes" className="text-[#6B7280] dark:text-[#9CA3AF] text-xs font-semibold px-2 py-1.5 mt-2">
                        {filteredNotes.map((note) => (
                          <Command.Item
                            key={note.id}
                            value={`note-${note.id}-${note.title}`}
                            onSelect={() => handleNoteClick(note.id!)}
                            className="flex items-start gap-3 px-3 py-2.5 rounded-md cursor-pointer data-[selected=true]:bg-[#F3F4F6] dark:data-[selected=true]:bg-[#1C2128] data-[selected=true]:text-[#2563EB] dark:data-[selected=true]:text-[#60A5FA] transition-colors text-[#1F2937] dark:text-[#E6EDF3]"
                          >
                            <FileText size={18} strokeWidth={2} className="text-[#8B5CF6] dark:text-[#A78BFA] mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium truncate">{note.title}</span>
                                <Badge variant="default" size="sm">Note</Badge>
                              </div>
                              {note.content && (
                                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 truncate">
                                  {note.content.replace(/<[^>]*>/g, '').substring(0, 100)}
                                </p>
                              )}
                            </div>
                          </Command.Item>
                        ))}
                      </Command.Group>
                    )}

                    {/* Habits Results */}
                    {filteredHabits.length > 0 && (
                      <Command.Group heading="Habits" className="text-[#6B7280] dark:text-[#9CA3AF] text-xs font-semibold px-2 py-1.5 mt-2">
                        {filteredHabits.map((habit) => (
                          <Command.Item
                            key={habit.id}
                            value={`habit-${habit.id}-${habit.name}`}
                            onSelect={() => handleHabitClick(habit.id!)}
                            className="flex items-start gap-3 px-3 py-2.5 rounded-md cursor-pointer data-[selected=true]:bg-[#F3F4F6] dark:data-[selected=true]:bg-[#1C2128] data-[selected=true]:text-[#2563EB] dark:data-[selected=true]:text-[#60A5FA] transition-colors text-[#1F2937] dark:text-[#E6EDF3]"
                          >
                            <Flame size={18} strokeWidth={2} className="text-[#F59E0B] dark:text-[#FBBF24] mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium truncate">{habit.name}</span>
                                <Badge variant="warning" size="sm">Habit</Badge>
                              </div>
                              <div className="flex items-center gap-3 mt-0.5">
                                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                                  {habit.frequency}
                                </p>
                                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                                  Streak: {habit.streak} days
                                </p>
                              </div>
                            </div>
                          </Command.Item>
                        ))}
                      </Command.Group>
                    )}
                  </>
                )}

                {/* Navigation - Show when no search or no results */}
                {!hasSearchResults && (
                  <Command.Group heading="Navigation" className="text-[#6B7280] dark:text-[#9CA3AF] text-xs font-semibold px-2 py-1.5">
                    {pages.map((page) => {
                      const Icon = page.icon
                      return (
                        <Command.Item
                          key={page.id}
                          value={page.label}
                          onSelect={() => {
                            onNavigate(page.id)
                            onClose()
                          }}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer data-[selected=true]:bg-[#F3F4F6] dark:data-[selected=true]:bg-[#1C2128] data-[selected=true]:text-[#2563EB] dark:data-[selected=true]:text-[#60A5FA] transition-colors text-[#1F2937] dark:text-[#E6EDF3]"
                        >
                          <Icon size={18} strokeWidth={2} className="text-[#6B7280] dark:text-[#9CA3AF]" />
                          <span className="flex-1 text-sm">{page.label}</span>
                        </Command.Item>
                      )
                    })}
                  </Command.Group>
                )}

                {/* Actions - Show when no search or no results */}
                {!hasSearchResults && (
                  <Command.Group heading="Actions" className="text-[#6B7280] dark:text-[#9CA3AF] text-xs font-semibold px-2 py-1.5 mt-2">
                    <Command.Item
                      value="New Task"
                      onSelect={() => {
                        if (onNewTask) {
                          onNewTask()
                        } else {
                          onNavigate('tasks')
                        }
                        onClose()
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer data-[selected=true]:bg-[#F3F4F6] dark:data-[selected=true]:bg-[#1C2128] data-[selected=true]:text-[#2563EB] dark:data-[selected=true]:text-[#60A5FA] transition-colors text-[#1F2937] dark:text-[#E6EDF3]"
                    >
                      <Plus size={18} strokeWidth={2} className="text-[#6B7280] dark:text-[#9CA3AF]" />
                      <span className="flex-1 text-sm">New Task</span>
                      <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">⌘N</span>
                    </Command.Item>

                    <Command.Item
                      value="Start Focus"
                      onSelect={() => {
                        if (onStartFocus) {
                          onStartFocus()
                        } else {
                          onNavigate('focus')
                        }
                        onClose()
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer data-[selected=true]:bg-[#F3F4F6] dark:data-[selected=true]:bg-[#1C2128] data-[selected=true]:text-[#2563EB] dark:data-[selected=true]:text-[#60A5FA] transition-colors text-[#1F2937] dark:text-[#E6EDF3]"
                    >
                      <Clock size={18} strokeWidth={2} className="text-[#6B7280] dark:text-[#9CA3AF]" />
                      <span className="flex-1 text-sm">Start Focus Session</span>
                      <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">⌘⇧F</span>
                    </Command.Item>

                    <Command.Item
                      value="Search Tasks"
                      onSelect={() => {
                        onNavigate('tasks')
                        onClose()
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer data-[selected=true]:bg-[#F3F4F6] dark:data-[selected=true]:bg-[#1C2128] data-[selected=true]:text-[#2563EB] dark:data-[selected=true]:text-[#60A5FA] transition-colors text-[#1F2937] dark:text-[#E6EDF3]"
                    >
                      <Search size={18} strokeWidth={2} className="text-[#6B7280] dark:text-[#9CA3AF]" />
                      <span className="flex-1 text-sm">Search Tasks</span>
                      <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">⌘F</span>
                    </Command.Item>
                  </Command.Group>
                )}
              </Command.List>
            </Command>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}
