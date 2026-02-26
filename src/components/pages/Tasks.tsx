import { useState, useEffect } from 'react'
import { useTaskStore } from '../../stores/taskStore'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { Tabs } from '../ui/Tabs'
import { Modal } from '../ui/Modal'
import { toast } from '../ui/Toast'
import { motion, AnimatePresence } from 'framer-motion'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Search, Trash2, Edit, Calendar, Plus, CheckCircle } from 'lucide-react'

interface TasksProps {
  selectedTaskId?: string | null
  triggerNewTask?: boolean
  onNewTaskHandled?: () => void
}

export default function Tasks({ selectedTaskId, triggerNewTask, onNewTaskHandled }: TasksProps) {
  const { tasks, loading, fetchTasks, createTask, updateTask, deleteTask } = useTaskStore()
  const [view, setView] = useState<'list' | 'kanban'>('list')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [showAllTasks, setShowAllTasks] = useState(false)
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    tags: '',
    projectId: '',
    dueDate: '',
    deadline: '',
    estimateMinutes: ''
  })

  useEffect(() => {
    fetchTasks()
  }, [])

  // Handle selected task from search
  useEffect(() => {
    if (selectedTaskId) {
      const task = tasks.find(t => t.id === selectedTaskId)
      if (task) {
        setHighlightedTaskId(selectedTaskId)
        setSearchQuery(task.title)
        setShowAllTasks(true)
        
        // Remove highlight after 3 seconds
        setTimeout(() => setHighlightedTaskId(null), 3000)
      }
    }
  }, [selectedTaskId, tasks])

  // Handle trigger new task from command palette
  useEffect(() => {
    if (triggerNewTask) {
      setIsModalOpen(true)
      if (onNewTaskHandled) {
        onNewTaskHandled()
      }
    }
  }, [triggerNewTask, onNewTaskHandled])

  const handleEditTask = (task: any) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      tags: task.tags.join(', '),
      projectId: task.projectId || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
      estimateMinutes: task.estimateMinutes?.toString() || ''
    })
    setIsModalOpen(true)
  }

  const handleCreateTask = async () => {
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }

    if (!formData.dueDate) {
      toast.error('Due date is required')
      return
    }

    try {
      if (editingTask) {
        await updateTask(editingTask.id, {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
          projectId: formData.projectId || undefined,
          dueDate: new Date(formData.dueDate).toISOString(),
          estimateMinutes: formData.estimateMinutes ? parseInt(formData.estimateMinutes) : undefined,
        })
        toast.success('Task updated!')
        setEditingTask(null)
      } else {
        await createTask({
        title: formData.title,
        description: formData.description,
        status: 'todo',
        priority: formData.priority,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        projectId: formData.projectId || undefined,
        dueDate: new Date(formData.dueDate).toISOString(),
        estimateMinutes: formData.estimateMinutes ? parseInt(formData.estimateMinutes) : undefined,
      })

        toast.success('Task created!')
      }
      setIsModalOpen(false)
      setEditingTask(null)
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        tags: '',
        projectId: '',
        dueDate: '',
        deadline: '',
        estimateMinutes: ''
      })
    } catch (error) {
      toast.error(editingTask ? 'Failed to update task' : 'Failed to create task')
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: 'todo' | 'doing' | 'done') => {
    await updateTask(taskId, { status: newStatus })
    toast.success('Task updated!')
  }

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newStatus = destination.droppableId as 'todo' | 'doing' | 'done'
    await handleStatusChange(draggableId, newStatus)
  }

  const handleDeleteAllTasks = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer TOUTES les tâches ? Cette action est irréversible.')) {
      return
    }

    try {
      await Promise.all(tasks.map(task => deleteTask(task.id!)))
      toast.success('Toutes les tâches ont été supprimées')
    } catch (error) {
      toast.error('Erreur lors de la suppression des tâches')
    }
  }

  // Filter by status
  let filteredTasks = filterStatus === 'all' 
    ? tasks 
    : tasks.filter(t => t.status === filterStatus)

  // Filter by date if not showing all tasks (apply BEFORE search)
  if (!showAllTasks && selectedDate) {
    filteredTasks = filteredTasks.filter(t => {
      if (!t.dueDate) return false
      const taskDate = new Date(t.dueDate).toISOString().split('T')[0]
      return taskDate === selectedDate
    })
  }

  // Filter by search query (apply AFTER date filter, but search across ALL tasks if searching)
  if (searchQuery.trim()) {
    // When searching, ignore date filter and search all tasks with the current status filter
    const searchBase = filterStatus === 'all' ? tasks : tasks.filter(t => t.status === filterStatus)
    filteredTasks = searchBase.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // Sort tasks by due date (most recent first when showAllTasks is true)
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    const comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    return showAllTasks ? -comparison : comparison
  })

  // Apply same filters to kanban columns
  const filterKanbanTasks = (statusTasks: typeof tasks) => {
    let filtered = statusTasks

    // If searching, search across all tasks regardless of date
    if (searchQuery.trim()) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    } else if (!showAllTasks && selectedDate) {
      // Only apply date filter when NOT searching
      filtered = filtered.filter(t => {
        if (!t.dueDate) return false
        const taskDate = new Date(t.dueDate).toISOString().split('T')[0]
        return taskDate === selectedDate
      })
    }

    return filtered.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      const comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      return showAllTasks ? -comparison : comparison
    })
  }

  const todoTasks = filterKanbanTasks(tasks.filter(t => t.status === 'todo'))
  const doingTasks = filterKanbanTasks(tasks.filter(t => t.status === 'doing'))
  const doneTasks = filterKanbanTasks(tasks.filter(t => t.status === 'done'))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Tasks</h1>
          <p className="text-text-muted">Manage your tasks efficiently</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
          New Task
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1F2937] dark:text-[#E6EDF3] mb-2">
              Rechercher
            </label>
            <Input
              placeholder="Chercher par nom ou description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search size={16} className="text-[#6B7280] dark:text-[#9CA3AF]" />}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F2937] dark:text-[#E6EDF3] mb-2">
              Filtrer par date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              disabled={showAllTasks}
              className="w-full h-[40px] px-3 bg-white dark:bg-[#161B22] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-md text-[#1F2937] dark:text-[#E6EDF3] focus:outline-none focus:ring-2 focus:ring-[rgba(37,99,235,0.4)] dark:focus:ring-[rgba(59,130,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F2937] dark:text-[#E6EDF3] mb-2">
              Options
            </label>
            <label className="flex items-center gap-2 cursor-pointer h-[40px]">
              <input
                type="checkbox"
                checked={showAllTasks}
                onChange={(e) => setShowAllTasks(e.target.checked)}
                className="w-4 h-4 rounded border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#2563EB] focus:ring-2 focus:ring-[rgba(37,99,235,0.4)] cursor-pointer"
              />
              <span className="text-sm text-[#1F2937] dark:text-[#E6EDF3]">
                Afficher toutes les tâches
              </span>
            </label>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <Tabs
          tabs={[
            { id: 'all', label: 'All' },
            { id: 'todo', label: 'To Do' },
            { id: 'doing', label: 'Doing' },
            { id: 'done', label: 'Done' },
          ]}
          activeTab={filterStatus}
          onTabChange={setFilterStatus}
        />
        
        <div className="flex gap-2">
          <Button
            variant={view === 'list' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setView('list')}
          >
            List
          </Button>
          <Button
            variant={view === 'kanban' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setView('kanban')}
          >
            Kanban
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDeleteAllTasks}
            disabled={tasks.length === 0}
            className="flex items-center gap-1.5"
          >
            <Trash2 size={14} /> Tout supprimer
          </Button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin text-4xl">⚡</div>
          <p className="text-text-muted mt-4">Loading tasks...</p>
        </div>
      )}

      {/* List View */}
      {!loading && view === 'list' && (
        <div className="space-y-3">
          <AnimatePresence>
            {sortedTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`p-4 hover:shadow-neon-green transition-all ${
                  highlightedTaskId === task.id 
                    ? 'ring-2 ring-[#3B82F6] dark:ring-[#60A5FA] shadow-lg' 
                    : ''
                }`}>
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={task.status === 'done'}
                      onChange={() => handleStatusChange(
                        task.id!,
                        task.status === 'done' ? 'todo' : 'done'
                      )}
                      className="mt-1 w-5 h-5 rounded border-border bg-surface"
                    />
                    
                    <div className="flex-1">
                      <h3 className={`text-lg font-medium ${task.status === 'done' ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-text-muted mt-1">{task.description}</p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <Badge variant={
                          task.priority === 'high' ? 'danger' :
                          task.priority === 'medium' ? 'warning' : 'info'
                        }>
                          {task.priority}
                        </Badge>
                        
                        {task.tags.map(tag => (
                          <Badge key={tag} variant="default">#{tag}</Badge>
                        ))}
                        
                        {task.dueDate && (
                          <Badge variant="info">
                            <Calendar size={12} className="inline mr-1" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {task.status === 'todo' && (
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handleStatusChange(task.id!, 'doing')}
                        >
                          Start →
                        </Button>
                      )}
                      {task.status === 'doing' && (
                        <Button 
                          variant="primary" 
                          size="sm" 
                          onClick={() => handleStatusChange(task.id!, 'done')}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle size={14} /> Complete
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)}>
                        <Edit size={14} className="text-[#6B7280] dark:text-[#9CA3AF]" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id!)}>
                        <Trash2 size={14} className="text-[#6B7280] dark:text-[#9CA3AF]" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {sortedTasks.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-4xl mb-4">✨</p>
              <p className="text-text-muted">No tasks here!</p>
            </Card>
          )}
        </div>
      )}

      {/* Kanban View */}
      {!loading && view === 'kanban' && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-3 gap-6">
            {/* To Do Column */}
            <div>
              <h3 className="text-lg font-semibold text-[#1F2937] dark:text-[#E6EDF3] mb-4 flex items-center gap-2">
                📝 To Do <Badge variant="default" size="sm">{todoTasks.length}</Badge>
              </h3>
              <Droppable droppableId="todo">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-[200px] p-3 rounded-lg transition-colors ${
                      snapshot.isDraggingOver 
                        ? 'bg-[#EFF6FF] dark:bg-[rgba(59,130,246,0.1)] border-2 border-dashed border-[#2563EB] dark:border-[#3B82F6]' 
                        : 'bg-transparent'
                    }`}
                  >
                    {todoTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id!} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <Card className={`p-4 cursor-grab active:cursor-grabbing ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}`}>
                              <h4 className="font-medium text-[#1F2937] dark:text-[#E6EDF3] mb-2">{task.title}</h4>
                              {task.description && (
                                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-2 line-clamp-2">{task.description}</p>
                              )}
                              <div className="flex flex-wrap gap-1 mb-2">
                                <Badge variant={
                                  task.priority === 'high' ? 'danger' :
                                  task.priority === 'medium' ? 'warning' : 'info'
                                } size="sm">
                                  {task.priority}
                                </Badge>
                                {task.tags.map(tag => (
                                  <Badge key={tag} variant="default" size="sm">#{tag}</Badge>
                                ))}
                              </div>
                              <div className="space-y-1">
                                {task.dueDate && (
                                  <p className="text-xs text-[#9CA3AF] dark:text-[#6B7280]">
                                    📅 {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                                  </p>
                                )}
                                {task.estimateMinutes && (
                                  <p className="text-xs text-[#9CA3AF] dark:text-[#6B7280]">
                                    ⏱️ {task.estimateMinutes} min
                                  </p>
                                )}
                                {task.projectId && (
                                  <p className="text-xs text-[#9CA3AF] dark:text-[#6B7280]">
                                    📁 {task.projectId}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2 mt-3">
                                <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)}>
                                  ✏️
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id!)}>
                                  🗑️
                                </Button>
                              </div>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            {/* Doing Column */}
            <div>
              <h3 className="text-lg font-semibold text-[#1F2937] dark:text-[#E6EDF3] mb-4 flex items-center gap-2">
                ⚡ Doing <Badge variant="warning" size="sm">{doingTasks.length}</Badge>
              </h3>
              <Droppable droppableId="doing">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-[200px] p-3 rounded-lg transition-colors ${
                      snapshot.isDraggingOver 
                        ? 'bg-[#FFFBEB] dark:bg-[rgba(251,191,36,0.1)] border-2 border-dashed border-[#F59E0B] dark:border-[#FBBF24]' 
                        : 'bg-transparent'
                    }`}
                  >
                    {doingTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id!} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <Card className={`p-4 cursor-grab active:cursor-grabbing ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}`}>
                              <h4 className="font-medium text-[#1F2937] dark:text-[#E6EDF3] mb-2">{task.title}</h4>
                              {task.description && (
                                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-2 line-clamp-2">{task.description}</p>
                              )}
                              <div className="flex flex-wrap gap-1 mb-2">
                                <Badge variant={
                                  task.priority === 'high' ? 'danger' :
                                  task.priority === 'medium' ? 'warning' : 'info'
                                } size="sm">
                                  {task.priority}
                                </Badge>
                                {task.tags.map(tag => (
                                  <Badge key={tag} variant="default" size="sm">#{tag}</Badge>
                                ))}
                              </div>
                              <div className="space-y-1">
                                {task.dueDate && (
                                  <p className="text-xs text-[#9CA3AF] dark:text-[#6B7280]">
                                    📅 {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                                  </p>
                                )}
                                {task.estimateMinutes && (
                                  <p className="text-xs text-[#9CA3AF] dark:text-[#6B7280]">
                                    ⏱️ {task.estimateMinutes} min
                                  </p>
                                )}
                                {task.projectId && (
                                  <p className="text-xs text-[#9CA3AF] dark:text-[#6B7280]">
                                    📁 {task.projectId}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2 mt-3">
                                <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)}>
                                  ✏️
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id!)}>
                                  🗑️
                                </Button>
                              </div>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            {/* Done Column */}
            <div>
              <h3 className="text-lg font-semibold text-[#1F2937] dark:text-[#E6EDF3] mb-4 flex items-center gap-2">
                ✓ Done <Badge variant="success" size="sm">{doneTasks.length}</Badge>
              </h3>
              <Droppable droppableId="done">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-[200px] p-3 rounded-lg transition-colors ${
                      snapshot.isDraggingOver 
                        ? 'bg-[#F0FDF4] dark:bg-[rgba(34,197,94,0.1)] border-2 border-dashed border-[#16A34A] dark:border-[#22C55E]' 
                        : 'bg-transparent'
                    }`}
                  >
                    {doneTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id!} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <Card className={`p-4 cursor-grab active:cursor-grabbing opacity-70 ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}`}>
                              <h4 className="font-medium text-[#1F2937] dark:text-[#E6EDF3] line-through mb-2">{task.title}</h4>
                              {task.description && (
                                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-2 line-clamp-2 line-through">{task.description}</p>
                              )}
                              <div className="flex flex-wrap gap-1 mb-2">
                                <Badge variant={
                                  task.priority === 'high' ? 'danger' :
                                  task.priority === 'medium' ? 'warning' : 'info'
                                } size="sm">
                                  {task.priority}
                                </Badge>
                                {task.tags.map(tag => (
                                  <Badge key={tag} variant="default" size="sm">#{tag}</Badge>
                                ))}
                              </div>
                              <div className="space-y-1">
                                {task.dueDate && (
                                  <p className="text-xs text-[#9CA3AF] dark:text-[#6B7280]">
                                    📅 {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                                  </p>
                                )}
                                {task.estimateMinutes && (
                                  <p className="text-xs text-[#9CA3AF] dark:text-[#6B7280]">
                                    ⏱️ {task.estimateMinutes} min
                                  </p>
                                )}
                                {task.projectId && (
                                  <p className="text-xs text-[#9CA3AF] dark:text-[#6B7280]">
                                    📁 {task.projectId}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2 mt-3">
                                <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)}>
                                  ✏️
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id!)}>
                                  🗑️
                                </Button>
                              </div>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </DragDropContext>
      )}

      {/* Task Creation Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Task"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1F2937] dark:text-[#E6EDF3] mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Task title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F2937] dark:text-[#E6EDF3] mb-2">
              Description
            </label>
            <textarea
              placeholder="Task description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full h-24 px-3 py-2 bg-white dark:bg-[#161B22] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-md text-[#1F2937] dark:text-[#E6EDF3] focus:outline-none focus:ring-2 focus:ring-[rgba(37,99,235,0.4)] dark:focus:ring-[rgba(59,130,246,0.4)] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] dark:text-[#E6EDF3] mb-2">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full h-[40px] px-3 bg-white dark:bg-[#161B22] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-md text-[#1F2937] dark:text-[#E6EDF3] focus:outline-none focus:ring-2 focus:ring-[rgba(37,99,235,0.4)] dark:focus:ring-[rgba(59,130,246,0.4)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F2937] dark:text-[#E6EDF3] mb-2">
                Deadline (Optional)
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full h-[40px] px-3 bg-white dark:bg-[#161B22] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-md text-[#1F2937] dark:text-[#E6EDF3] focus:outline-none focus:ring-2 focus:ring-[rgba(37,99,235,0.4)] dark:focus:ring-[rgba(59,130,246,0.4)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F2937] dark:text-[#E6EDF3] mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
              className="w-full h-[40px] px-3 bg-white dark:bg-[#161B22] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-md text-[#1F2937] dark:text-[#E6EDF3] focus:outline-none focus:ring-2 focus:ring-[rgba(37,99,235,0.4)] dark:focus:ring-[rgba(59,130,246,0.4)]"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F2937] dark:text-[#E6EDF3] mb-2">
              Project
            </label>
            <Input
              placeholder="Project name..."
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F2937] dark:text-[#E6EDF3] mb-2">
              Tags
            </label>
            <Input
              placeholder="Comma-separated tags (e.g., work, urgent, meeting)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F2937] dark:text-[#E6EDF3] mb-2">
              Estimate (minutes)
            </label>
            <Input
              type="number"
              placeholder="Estimated time in minutes..."
              value={formData.estimateMinutes}
              onChange={(e) => setFormData({ ...formData, estimateMinutes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)]">
            <Button variant="ghost" onClick={() => {
              setIsModalOpen(false)
              setEditingTask(null)
              setFormData({
                title: '',
                description: '',
                priority: 'medium',
                tags: '',
                projectId: '',
                dueDate: '',
                deadline: '',
                estimateMinutes: ''
              })
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask}>
              {editingTask ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
