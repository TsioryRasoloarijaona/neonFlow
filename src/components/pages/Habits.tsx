import { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { useHabitStore } from '../../stores/habitStore'
import { toast } from '../ui/Toast'
import { Flame, Plus, Check } from 'lucide-react'
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, 
  subMonths, addMonths, startOfWeek, eachWeekOfInterval,
  startOfYear, endOfYear, eachMonthOfInterval, isSameWeek, isSameMonth
} from 'date-fns'

interface HabitsProps {
  selectedHabitId?: string | null
}

export default function Habits({ selectedHabitId }: HabitsProps) {
  const { habits, fetchHabits, createHabit, deleteHabit, logHabit } = useHabitStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null)
  const [highlightedHabitId, setHighlightedHabitId] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [habitLogs, setHabitLogs] = useState<Record<string, string[]>>({})
  const [newHabit, setNewHabit] = useState({
    name: '',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly'
  })

  useEffect(() => {
    fetchHabits()
  }, [])

  // Handle selected habit from search
  useEffect(() => {
    if (selectedHabitId && habits.length > 0) {
      const habit = habits.find(h => h.id === selectedHabitId)
      if (habit) {
        setSelectedHabit(selectedHabitId)
        setHighlightedHabitId(selectedHabitId)
        
        // Remove highlight after 3 seconds
        setTimeout(() => setHighlightedHabitId(null), 3000)
      }
    }
  }, [selectedHabitId, habits])

  useEffect(() => {
    if (selectedHabit) {
      loadHabitLogs(selectedHabit)
    }
  }, [selectedHabit, currentMonth])

  const loadHabitLogs = async (habitId: string) => {
    const habit = habits.find(h => h.id === habitId)
    if (!habit) return

    let startDate, endDate
    
    if (habit.frequency === 'monthly') {
      startDate = format(startOfYear(currentMonth), 'yyyy-MM-dd')
      endDate = format(endOfYear(currentMonth), 'yyyy-MM-dd')
    } else if (habit.frequency === 'weekly') {
      startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
      endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd')
    } else {
      startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
      endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd')
    }
    
    try {
      const result = await window.api.habits.logs(habitId, startDate, endDate)
      if (result.success) {
        setHabitLogs(prev => ({
          ...prev,
          [habitId]: result.data.map((log: any) => log.date)
        }))
      }
    } catch (error) {
      console.error('Failed to load habit logs:', error)
    }
  }

  const handleCreate = async () => {
    if (!newHabit.name.trim()) {
      toast.error('Name is required')
      return
    }

    try {
      await createHabit({ ...newHabit, streak: 0 })
      toast.success('Habit created!')
      setModalOpen(false)
      setNewHabit({ name: '', frequency: 'daily' })
    } catch (error) {
      toast.error('Failed to create habit')
    }
  }

  const handleLog = async (habitId: string, date: Date) => {
    const habit = habits.find(h => h.id === habitId)
    if (!habit) return

    let dateStr
    if (habit.frequency === 'monthly') {
      dateStr = format(date, 'yyyy-MM-01') // Premier jour du mois
    } else if (habit.frequency === 'weekly') {
      dateStr = format(startOfWeek(date), 'yyyy-MM-dd') // Premier jour de la semaine
    } else {
      dateStr = format(date, 'yyyy-MM-dd')
    }
    
    const logs = habitLogs[habitId] || []
    
    // Toggle log
    if (logs.includes(dateStr)) {
      // Remove log (uncheck)
      setHabitLogs(prev => ({
        ...prev,
        [habitId]: logs.filter(d => d !== dateStr)
      }))
    } else {
      await logHabit(habitId, dateStr)
      toast.success('Habit logged! 🔥')
      // Update local state immediately
      setHabitLogs(prev => ({
        ...prev,
        [habitId]: [...logs, dateStr]
      }))
      // Refresh habits to update streak in real-time
      await fetchHabits()
    }
  }

  const isDateLogged = (habitId: string, date: Date) => {
    const habit = habits.find(h => h.id === habitId)
    if (!habit) return false

    const logs = habitLogs[habitId] || []
    
    if (habit.frequency === 'monthly') {
      return logs.some(logDate => isSameMonth(new Date(logDate), date))
    } else if (habit.frequency === 'weekly') {
      return logs.some(logDate => isSameWeek(new Date(logDate), date))
    } else {
      return logs.some(logDate => isSameDay(new Date(logDate), date))
    }
  }

  const getTimeBlocks = (habit: any) => {
    if (habit.frequency === 'monthly') {
      return eachMonthOfInterval({
        start: startOfYear(currentMonth),
        end: endOfYear(currentMonth)
      })
    } else if (habit.frequency === 'weekly') {
      return eachWeekOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
      })
    } else {
      return eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1F2937] dark:text-[#E6EDF3] mb-2">Habits</h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF]">Build better habits, track your streaks</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
          New Habit
        </Button>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {habits.map(habit => (
          <Card 
            key={habit.id} 
            className={`p-6 cursor-pointer transition-all ${
              selectedHabit === habit.id ? 'ring-2 ring-[#2563EB] dark:ring-[#3B82F6]' : ''
            } ${
              highlightedHabitId === habit.id ? 'ring-2 ring-[#3B82F6] dark:ring-[#60A5FA] shadow-lg animate-pulse' : ''
            }`}
            hover
            onClick={() => setSelectedHabit(habit.id!)}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-[#1F2937] dark:text-[#E6EDF3]">{habit.name}</h3>
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1 capitalize">{habit.frequency}</p>
              </div>
              <div className="flex items-center gap-2">
                <Flame size={32} className="text-[#F59E0B] dark:text-[#FBBF24]" />
                <span className="text-2xl font-bold text-[#16A34A] dark:text-[#22C55E]">{habit.streak}</span>
              </div>
            </div>

            <Button
              onClick={(e) => {
                e.stopPropagation()
                handleLog(habit.id!, new Date())
              }}
              variant="primary"
              className="w-full mb-3"
            >
              Log Today
            </Button>

            <Button
              onClick={(e) => {
                e.stopPropagation()
                deleteHabit(habit.id!)
              }}
              variant="ghost"
              size="sm"
              className="w-full text-[#DC2626] dark:text-[#EF4444] hover:bg-[#FEF2F2] dark:hover:bg-[rgba(239,68,68,0.1)]"
            >
              Delete
            </Button>
          </Card>
        ))}

        {habits.length === 0 && (
          <Card className="col-span-full p-12 text-center">
            <Flame size={48} className="text-[#F59E0B] dark:text-[#FBBF24] mx-auto mb-4" />
            <p className="text-[#6B7280] dark:text-[#9CA3AF]">No habits yet. Create one to get started!</p>
          </Card>
        )}
      </div>

      {/* Calendar View with Checkboxes */}
      {selectedHabit && habits.find(h => h.id === selectedHabit) && (() => {
        const habit = habits.find(h => h.id === selectedHabit)!
        const timeBlocks = getTimeBlocks(habit)
        
        return (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(habit.frequency === 'monthly' ? subMonths(currentMonth, 12) : subMonths(currentMonth, 1))}
              >
                ← Previous
              </Button>
              
              <h2 className="text-lg font-bold text-[#1F2937] dark:text-[#E6EDF3]">
                {habit.name} - {habit.frequency === 'monthly' ? format(currentMonth, 'yyyy') : format(currentMonth, 'MMMM yyyy')}
              </h2>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(habit.frequency === 'monthly' ? addMonths(currentMonth, 12) : addMonths(currentMonth, 1))}
                disabled={habit.frequency === 'monthly' 
                  ? isSameMonth(startOfYear(currentMonth), startOfYear(new Date()))
                  : isSameDay(startOfMonth(currentMonth), startOfMonth(new Date()))
                }
              >
                Next →
              </Button>
            </div>

            {/* Calendar Grid */}
            {habit.frequency === 'daily' && (
              <>
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-center text-[10px] font-semibold text-[#6B7280] dark:text-[#9CA3AF] h-6 flex items-center justify-center">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {timeBlocks.map(day => {
                    const isLogged = isDateLogged(selectedHabit, day)
                    const isToday = isSameDay(day, new Date())
                    const isFuture = day > new Date()
                    
                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => !isFuture && handleLog(selectedHabit, day)}
                        disabled={isFuture}
                        className={`
                          w-8 h-8 flex items-center justify-center
                          rounded-md text-[10px] font-medium transition-all duration-200
                          border
                          ${isLogged 
                            ? 'bg-[#F0FDF4] dark:bg-[rgba(34,197,94,0.15)] text-[#16A34A] dark:text-[#22C55E] border-[#16A34A] dark:border-[#22C55E] hover:bg-[#DCFCE7] dark:hover:bg-[rgba(34,197,94,0.2)]' 
                            : 'bg-white dark:bg-[#161B22] text-[#6B7280] dark:text-[#9CA3AF] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] hover:border-[#2563EB] dark:hover:border-[#3B82F6]'
                          }
                          ${isToday ? 'ring-2 ring-[#2563EB] dark:ring-[#3B82F6]' : ''}
                          ${isFuture ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        {isLogged ? (
                          <Check size={12} className="text-[#16A34A] dark:text-[#22C55E]" strokeWidth={3} />
                        ) : (
                          format(day, 'd')
                        )}
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            {habit.frequency === 'weekly' && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {timeBlocks.map((week, index) => {
                  const isLogged = isDateLogged(selectedHabit, week)
                  const isCurrentWeek = isSameWeek(week, new Date())
                  const isFuture = week > new Date()
                  
                  return (
                    <button
                      key={week.toISOString()}
                      onClick={() => !isFuture && handleLog(selectedHabit, week)}
                      disabled={isFuture}
                      className={`
                        p-3 flex flex-col items-center justify-center
                        rounded-md transition-all duration-200
                        border
                        ${isLogged 
                          ? 'bg-[#F0FDF4] dark:bg-[rgba(34,197,94,0.15)] text-[#16A34A] dark:text-[#22C55E] border-[#16A34A] dark:border-[#22C55E] hover:bg-[#DCFCE7] dark:hover:bg-[rgba(34,197,94,0.2)]' 
                          : 'bg-white dark:bg-[#161B22] text-[#6B7280] dark:text-[#9CA3AF] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] hover:border-[#2563EB] dark:hover:border-[#3B82F6]'
                        }
                        ${isCurrentWeek ? 'ring-2 ring-[#2563EB] dark:ring-[#3B82F6]' : ''}
                        ${isFuture ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <span className="text-xs font-semibold">Week {index + 1}</span>
                      <span className="text-[10px] mt-1">
                        {format(week, 'MMM d')}
                      </span>
                      {isLogged && <Check size={18} className="text-[#16A34A] dark:text-[#22C55E] mt-1" strokeWidth={3} />}
                    </button>
                  )
                })}
              </div>
            )}

            {habit.frequency === 'monthly' && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {timeBlocks.map(month => {
                  const isLogged = isDateLogged(selectedHabit, month)
                  const isCurrentMonth = isSameMonth(month, new Date())
                  const isFuture = month > new Date()
                  
                  return (
                    <button
                      key={month.toISOString()}
                      onClick={() => !isFuture && handleLog(selectedHabit, month)}
                      disabled={isFuture}
                      className={`
                        p-4 flex flex-col items-center justify-center
                        rounded-md transition-all duration-200
                        border
                        ${isLogged 
                          ? 'bg-[#F0FDF4] dark:bg-[rgba(34,197,94,0.15)] text-[#16A34A] dark:text-[#22C55E] border-[#16A34A] dark:border-[#22C55E] hover:bg-[#DCFCE7] dark:hover:bg-[rgba(34,197,94,0.2)]' 
                          : 'bg-white dark:bg-[#161B22] text-[#6B7280] dark:text-[#9CA3AF] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] hover:border-[#2563EB] dark:hover:border-[#3B82F6]'
                        }
                        ${isCurrentMonth ? 'ring-2 ring-[#2563EB] dark:ring-[#3B82F6]' : ''}
                        ${isFuture ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <span className="text-sm font-semibold">{format(month, 'MMM')}</span>
                      {isLogged && <Check size={20} className="text-[#16A34A] dark:text-[#22C55E] mt-1" strokeWidth={3} />}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Stats Summary */}
            <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)]">
              <div className="text-center">
                <p className="text-xl font-bold text-[#16A34A] dark:text-[#22C55E]">
                  {habitLogs[selectedHabit]?.length || 0}
                </p>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Logged</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-[#2563EB] dark:text-[#3B82F6]">
                  {habit.streak || 0}
                </p>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Streak</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-[#7C3AED] dark:text-[#A78BFA]">
                  {timeBlocks.length > 0 
                    ? Math.round(((habitLogs[selectedHabit]?.length || 0) / timeBlocks.length) * 100)
                    : 0}%
                </p>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Rate</p>
              </div>
            </div>
          </Card>
        )
      })()}

      {/* Create Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Habit"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Habit Name"
            placeholder="e.g., Morning Meditation"
            value={newHabit.name}
            onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
          />

          <div>
            <label className="text-sm text-[#1F2937] dark:text-[#E6EDF3] font-medium block mb-2">
              Frequency
            </label>
            <div className="flex gap-2">
              {['daily', 'weekly', 'monthly'].map(freq => (
                <Button
                  key={freq}
                  variant={newHabit.frequency === freq ? 'primary' : 'secondary'}
                  onClick={() => setNewHabit({ ...newHabit, frequency: freq as any })}
                  className="flex-1 capitalize"
                  size="md"
                >
                  {freq}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
