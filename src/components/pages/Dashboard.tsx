import { useEffect } from 'react'
import { Card } from '../ui/Card'
import { useTaskStore } from '../../stores/taskStore'
import { useFocusStore } from '../../stores/focusStore'
import { useHabitStore } from '../../stores/habitStore'
import { Badge } from '../ui/Badge'
import { PageContainer } from '../ui/PageContainer'
import { format } from 'date-fns'
import { FileText, Zap, CheckCircle, Target, Flame, Coffee } from 'lucide-react'

export default function Dashboard() {
  const { tasks, fetchTasks } = useTaskStore()
  const { sessions, fetchSessions } = useFocusStore()
  const { habits, fetchHabits } = useHabitStore()

  useEffect(() => {
    fetchTasks()
    fetchSessions()
    fetchHabits()
  }, [])

  const todoTasks = tasks.filter(t => t.status === 'todo')
  const doingTasks = tasks.filter(t => t.status === 'doing')
  const doneTasks = tasks.filter(t => t.status === 'done')
  const todaySessions = sessions.filter(s => 
    format(new Date(s.startTime), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  )

  return (
    <PageContainer
      title="Dashboard"
      subtitle="Welcome back! Here's your productivity overview."
      maxWidth="xl"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">To Do</p>
              <p className="text-2xl font-semibold text-[#1F2937] dark:text-[#E6EDF3] mt-1">
                {todoTasks.length}
              </p>
            </div>
            <FileText size={32} className="text-[#3B82F6] dark:text-[#60A5FA]" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">In Progress</p>
              <p className="text-2xl font-semibold text-[#1F2937] dark:text-[#E6EDF3] mt-1">
                {doingTasks.length}
              </p>
            </div>
            <Zap size={32} className="text-[#F59E0B] dark:text-[#FBBF24]" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Completed</p>
              <p className="text-2xl font-semibold text-[#1F2937] dark:text-[#E6EDF3] mt-1">
                {doneTasks.length}
              </p>
            </div>
            <CheckCircle size={32} className="text-[#22C55E] dark:text-[#4ADE80]" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Focus Today</p>
              <p className="text-2xl font-semibold text-[#1F2937] dark:text-[#E6EDF3] mt-1">
                {todaySessions.length}
              </p>
            </div>
            <Target size={32} className="text-[#A855F7] dark:text-[#C084FC]" />
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold text-[#1F2937] dark:text-[#E6EDF3] mb-4">
            Today's Tasks
          </h2>
          <div className="space-y-2">
            {todoTasks.slice(0, 5).map(task => (
              <div
                key={task.id}
                className="p-3 bg-[#F9FAFB] dark:bg-[#1C2128] rounded-md border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] hover:border-[#2563EB] dark:hover:border-[#3B82F6] transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1F2937] dark:text-[#E6EDF3]">
                      {task.title}
                    </p>
                    {task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.tags.map(tag => (
                          <Badge key={tag} variant="default" size="sm">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Badge 
                    variant={
                      task.priority === 'high' ? 'danger' :
                      task.priority === 'medium' ? 'warning' : 'info'
                    }
                    size="sm"
                  >
                    {task.priority}
                  </Badge>
                </div>
              </div>
            ))}
            {todoTasks.length === 0 && (
              <p className="text-center text-[#6B7280] dark:text-[#9CA3AF] py-8">
                No tasks for today! 🎉
              </p>
            )}
          </div>
        </Card>

        {/* Habits */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold text-[#1F2937] dark:text-[#E6EDF3] mb-4">
            Habits
          </h2>
          <div className="space-y-2">
            {habits.slice(0, 5).map(habit => (
              <div
                key={habit.id}
                className="p-3 bg-[#F9FAFB] dark:bg-[#1C2128] rounded-md border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-[#1F2937] dark:text-[#E6EDF3]">
                    {habit.name}
                  </p>
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
                    {habit.frequency}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Flame size={20} className="text-[#F59E0B]" />
                  <span className="text-lg font-semibold text-[#F59E0B]">{habit.streak}</span>
                </div>
              </div>
            ))}
            {habits.length === 0 && (
              <p className="text-center text-[#6B7280] dark:text-[#9CA3AF] py-8">
                No habits yet
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold text-[#1F2937] dark:text-[#E6EDF3] mb-4">
          Recent Activity
        </h2>
        <div className="space-y-2">
          {sessions.slice(0, 5).map(session => (
            <div
              key={session.id}
              className="flex items-center gap-3 p-2 hover:bg-[#F9FAFB] dark:hover:bg-[#1C2128] rounded-md transition-colors duration-200"
            >
              {session.type === 'pomodoro' ? (
                <Target size={20} className="text-[#EF4444] dark:text-[#F87171]" />
              ) : (
                <Coffee size={20} className="text-[#8B5CF6] dark:text-[#A78BFA]" />
              )}
              <div className="flex-1">
                <p className="text-sm text-[#1F2937] dark:text-[#E6EDF3]">
                  {session.type} session - {session.duration} minutes
                </p>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                  {format(new Date(session.startTime), 'MMM d, HH:mm')}
                </p>
              </div>
              {session.completed && (
                <Badge variant="success" size="sm">Completed</Badge>
              )}
            </div>
          ))}
        </div>
      </Card>
    </PageContainer>
  )
}

