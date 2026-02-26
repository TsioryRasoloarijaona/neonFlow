import { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { useFocusStore } from '../../stores/focusStore'
import { useTaskStore } from '../../stores/taskStore'
import { toast } from '../ui/Toast'
import { motion } from 'framer-motion'

interface FocusProps {
  triggerStart?: boolean
  onStartHandled?: () => void
}

export default function Focus({ triggerStart, onStartHandled }: FocusProps) {
  const { startSession, fetchSessions } = useFocusStore()
  const { tasks, fetchTasks } = useTaskStore()
  const [selectedTask, setSelectedTask] = useState<string>()
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes
  const [isRunning, setIsRunning] = useState(false)
  const [config, setConfig] = useState({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15
  })

  // Play completion sound using Web Audio API
  const playCompletionSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    // const duration = 5 // 5 seconds
    
    // Create oscillators for a pleasant notification sound
    const playTone = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = frequency
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime)
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + startTime + 0.1)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + duration)
      
      oscillator.start(audioContext.currentTime + startTime)
      oscillator.stop(audioContext.currentTime + startTime + duration)
    }
    
    // Play a pleasant melody
    playTone(523.25, 0, 0.3) // C5
    playTone(659.25, 0.3, 0.3) // E5
    playTone(783.99, 0.6, 0.5) // G5
    playTone(523.25, 1.5, 0.3) // C5
    playTone(659.25, 1.8, 0.3) // E5
    playTone(783.99, 2.1, 0.5) // G5
    playTone(1046.50, 3.0, 1.5) // C6 (final long note)
  }

  // Restore timer state from localStorage on mount
  useEffect(() => {
    fetchTasks()
    fetchSessions()

    const savedTimer = localStorage.getItem('focusTimer')
    if (savedTimer) {
      const { endTime, selectedTaskId, type } = JSON.parse(savedTimer)
      const now = Date.now()
      const remaining = Math.floor((endTime - now) / 1000)

      if (remaining > 0) {
        setTimeLeft(remaining)
        setIsRunning(true)
        setSelectedTask(selectedTaskId)
        toast.success(`Timer restored: ${type} session`)
      } else {
        // Timer expired while away
        localStorage.removeItem('focusTimer')
      }
    }

    // Clean up timer on app close
    const handleBeforeUnload = () => {
      localStorage.removeItem('focusTimer')
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeLeft > 0) {
      // Use real-time calculation instead of simple countdown
      const savedTimer = localStorage.getItem('focusTimer')
      if (savedTimer) {
        interval = setInterval(() => {
          const { endTime } = JSON.parse(localStorage.getItem('focusTimer') || '{}')
          const remaining = Math.floor((endTime - Date.now()) / 1000)
          
          if (remaining <= 0) {
            setTimeLeft(0)
          } else {
            setTimeLeft(remaining)
          }
        }, 1000)
      }
    } else if (timeLeft === 0 && isRunning) {
      handleSessionComplete()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft])

  const handleStart = async (type: 'pomodoro' | 'break' | 'long-break') => {
    const duration = type === 'pomodoro' 
      ? config.pomodoro 
      : type === 'break' 
        ? config.shortBreak 
        : config.longBreak

    const seconds = duration * 60
    const endTime = Date.now() + (seconds * 1000)

    // Save timer state to localStorage
    localStorage.setItem('focusTimer', JSON.stringify({
      endTime,
      selectedTaskId: selectedTask,
      type,
      duration
    }))

    setTimeLeft(seconds)
    setIsRunning(true)

    await startSession({
      taskId: selectedTask,
      type,
      duration,
      startTime: new Date().toISOString(),
      completed: false
    })

    toast.success(`${type} session started!`)
  }

  const handleSessionComplete = () => {
    setIsRunning(false)
    localStorage.removeItem('focusTimer')
    playCompletionSound()
    toast.success('Session completed!')
  }

  const handlePause = () => {
    setIsRunning(false)
    localStorage.removeItem('focusTimer')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Handle trigger start focus from command palette
  useEffect(() => {
    if (triggerStart && !isRunning) {
      handleStart('pomodoro')
      if (onStartHandled) {
        onStartHandled()
      }
    }
  }, [triggerStart])

  const todoTasks = tasks.filter(t => t.status === 'todo' || t.status === 'doing')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Focus Mode</h1>
        <p className="text-text-muted">Deep work with Pomodoro technique</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer */}
        <div className="lg:col-span-2">
          <Card className="p-8 text-center">
            <motion.div
              animate={isRunning ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl font-bold text-neon-green mb-8"
            >
              {formatTime(timeLeft)}
            </motion.div>

            <div className="flex justify-center gap-4 mb-8">
              {!isRunning ? (
                <>
                  <Button
                    onClick={() => handleStart('pomodoro')}
                    variant="primary"
                    size="md"
                  >
                    Start Pomodoro
                  </Button>
                  <Button
                    onClick={() => handleStart('break')}
                    variant="secondary"
                    size="md"
                  >
                    Short Break
                  </Button>
                  <Button
                    onClick={() => handleStart('long-break')}
                    variant="secondary"
                    size="md"
                  >
                    Long Break
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handlePause} variant="secondary" size="md">
                    Pause
                  </Button>
                  <Button onClick={handleSessionComplete} variant="danger" size="md">
                    Stop
                  </Button>
                </>
              )}
            </div>

            {/* Selected Task */}
            {selectedTask && (
              <div className="mt-6">
                <p className="text-sm text-text-muted mb-2">Working on:</p>
                <Card className="p-4 inline-block">
                  <p className="text-text-primary font-medium">
                    {tasks.find(t => t.id === selectedTask)?.title}
                  </p>
                </Card>
              </div>
            )}

            {/* Progress */}
            <div className="mt-8">
              <div className="h-2 bg-[rgba(0,0,0,0.08)] dark:bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6]"
                  animate={{ width: `${isRunning ? ((config.pomodoro * 60 - timeLeft) / (config.pomodoro * 60)) * 100 : 0}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </Card>

          {/* Settings */}
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">Timer Settings</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-[#6B7280] dark:text-[#9CA3AF] block mb-2">Pomodoro (min)</label>
                <input
                  type="number"
                  value={config.pomodoro}
                  onChange={(e) => setConfig({ ...config, pomodoro: parseInt(e.target.value) })}
                  className="w-full h-[40px] px-3 bg-white dark:bg-[#161B22] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-md text-[#1F2937] dark:text-[#E6EDF3] focus:outline-none focus:ring-2 focus:ring-[rgba(37,99,235,0.4)] dark:focus:ring-[rgba(59,130,246,0.4)] disabled:opacity-50"
                  disabled={isRunning}
                />
              </div>
              <div>
                <label className="text-sm text-[#6B7280] dark:text-[#9CA3AF] block mb-2">Short Break (min)</label>
                <input
                  type="number"
                  value={config.shortBreak}
                  onChange={(e) => setConfig({ ...config, shortBreak: parseInt(e.target.value) })}
                  className="w-full h-[40px] px-3 bg-white dark:bg-[#161B22] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-md text-[#1F2937] dark:text-[#E6EDF3] focus:outline-none focus:ring-2 focus:ring-[rgba(37,99,235,0.4)] dark:focus:ring-[rgba(59,130,246,0.4)] disabled:opacity-50"
                  disabled={isRunning}
                />
              </div>
              <div>
                <label className="text-sm text-[#6B7280] dark:text-[#9CA3AF] block mb-2">Long Break (min)</label>
                <input
                  type="number"
                  value={config.longBreak}
                  onChange={(e) => setConfig({ ...config, longBreak: parseInt(e.target.value) })}
                  className="w-full h-[40px] px-3 bg-white dark:bg-[#161B22] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-md text-[#1F2937] dark:text-[#E6EDF3] focus:outline-none focus:ring-2 focus:ring-[rgba(37,99,235,0.4)] dark:focus:ring-[rgba(59,130,246,0.4)] disabled:opacity-50"
                  disabled={isRunning}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Task Selection */}
        <div>
          <Card className="p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">Select Task</h3>
            <div className="space-y-2">
              {todoTasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => setSelectedTask(task.id)}
                  disabled={isRunning}
                  className={`
                    w-full p-3 text-left rounded-md border transition-all duration-200
                    ${selectedTask === task.id 
                      ? 'border-[#2563EB] dark:border-[#3B82F6] bg-[#EFF6FF] dark:bg-[rgba(59,130,246,0.15)] shadow-sm' 
                      : 'border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#161B22] hover:border-[#2563EB] dark:hover:border-[#3B82F6]'
                    }
                    ${isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <p className="text-sm font-medium text-[#1F2937] dark:text-[#E6EDF3]">{task.title}</p>
                  {task.estimateMinutes && (
                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">
                      Est. {task.estimateMinutes} min
                    </p>
                  )}
                  {task.dueDate && (
                    <p className="text-xs text-[#9CA3AF] dark:text-[#6B7280] mt-1">
                      📅 {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </button>
              ))}

              {todoTasks.length === 0 && (
                <p className="text-center text-text-muted py-8 text-sm">
                  No tasks available
                </p>
              )}
            </div>
          </Card>

          {/* Stats */}
          <Card className="p-6 mt-4">
            <h3 className="text-lg font-bold text-text-primary mb-4">Today's Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-text-muted">🎯 Sessions</span>
                <span className="text-xl font-bold text-neon-green">4</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">⏱️ Focus Time</span>
                <span className="text-xl font-bold text-neon-cyan">100m</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">✓ Tasks Done</span>
                <span className="text-xl font-bold text-neon-purple">6</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
