import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Plus, Trash2, Calendar, Clock, CheckCircle, Circle, Edit2, Flag } from 'lucide-react'
import { useGoalStore } from '../../stores/goalStore'
import { Goal } from '../../types/goal'
import { format, differenceInDays } from 'date-fns'

export default function Goals() {
  const { goals, loading, fetchGoals, createGoal, updateGoal, deleteGoal, addStep, updateStep, deleteStep, toggleStepCompletion } = useGoalStore()
  const [showModal, setShowModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [newGoal, setNewGoal] = useState({ title: '', description: '', deadline: '' })
  const [newGoalSteps, setNewGoalSteps] = useState<string[]>([])
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null)
  const [newStepTitle, setNewStepTitle] = useState('')
  const [editingStep, setEditingStep] = useState<{ id: string; title: string } | null>(null)

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  const handleCreateGoal = async () => {
    if (!newGoal.title.trim()) return
    try {
      const response = await window.electron.goals.create({
        title: newGoal.title,
        description: newGoal.description || undefined,
        deadline: newGoal.deadline || undefined
      })
      
      // Add steps to the newly created goal if any
      if (response.success && response.data && newGoalSteps.length > 0) {
        const createdGoalId = response.data.id
        
        // Wait for each step to be created sequentially
        for (let i = 0; i < newGoalSteps.length; i++) {
          if (newGoalSteps[i].trim()) {
            await window.electron.goals.addStep(createdGoalId, {
              title: newGoalSteps[i].trim(),
              order: i
            })
          }
        }
      }
      
      // Refresh goals to get the updated list with all steps
      await fetchGoals()
      
      setNewGoal({ title: '', description: '', deadline: '' })
      setNewGoalSteps([])
      setShowModal(false)
    } catch (error) {
      console.error('Failed to create goal:', error)
    }
  }

  const handleUpdateGoal = async () => {
    if (!editingGoal || !newGoal.title.trim()) return
    try {
      await updateGoal(editingGoal.id, {
        title: newGoal.title,
        description: newGoal.description || undefined,
        deadline: newGoal.deadline || undefined
      })
      setEditingGoal(null)
      setNewGoal({ title: '', description: '', deadline: '' })
      setNewGoalSteps([])
      setShowModal(false)
    } catch (error) {
      console.error('Failed to update goal:', error)
    }
  }

  const handleDeleteGoal = async (id: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      await deleteGoal(id)
    }
  }

  const handleAddStep = async (goalId: string) => {
    if (!newStepTitle.trim()) return
    try {
      await addStep(goalId, newStepTitle)
      setNewStepTitle('')
    } catch (error) {
      console.error('Failed to add step:', error)
    }
  }

  const handleUpdateStep = async () => {
    if (!editingStep || !editingStep.title.trim()) return
    try {
      await updateStep(editingStep.id, { title: editingStep.title })
      setEditingStep(null)
    } catch (error) {
      console.error('Failed to update step:', error)
    }
  }

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal)
    setNewGoal({
      title: goal.title,
      description: goal.description || '',
      deadline: goal.deadline || ''
    })
    setNewGoalSteps([])
    setShowModal(true)
  }

  const openCreateModal = () => {
    setEditingGoal(null)
    setNewGoal({ title: '', description: '', deadline: '' })
    setNewGoalSteps([])
    setShowModal(true)
  }

  const addStepToNewGoal = () => {
    setNewGoalSteps([...newGoalSteps, ''])
  }

  const updateNewGoalStep = (index: number, value: string) => {
    const updated = [...newGoalSteps]
    updated[index] = value
    setNewGoalSteps(updated)
  }

  const removeNewGoalStep = (index: number) => {
    setNewGoalSteps(newGoalSteps.filter((_, i) => i !== index))
  }

  const getDaysLeft = (deadline?: string) => {
    if (!deadline) return null
    const days = differenceInDays(new Date(deadline), new Date())
    return days
  }

  const getProgressPercentage = (goal: Goal) => {
    if (goal.steps.length === 0) return 0
    const completed = goal.steps.filter(s => s.completed).length
    return Math.round((completed / goal.steps.length) * 100)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-[#9CA3AF] dark:text-[#6B7280]">Loading goals...</div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F9FAFB] dark:bg-[#0D1117]">
      {/* Header */}
      <header className="border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#161B22] px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] dark:bg-[rgba(59,130,246,0.15)] flex items-center justify-center">
              <Target className="text-[#3B82F6] dark:text-[#60A5FA]" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1F2937] dark:text-[#E6EDF3]">Goals</h1>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Track your objectives and milestones</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium transition-colors"
          >
            <Plus size={18} />
            New Goal
          </motion.button>
        </div>
      </header>

      {/* Goals List */}
      <div className="flex-1 overflow-y-auto p-8">
        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Target size={64} className="text-[#D1D5DB] dark:text-[#374151] mb-4" />
            <h3 className="text-lg font-semibold text-[#1F2937] dark:text-[#E6EDF3] mb-2">No Goals Yet</h3>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] mb-6">Create your first goal to start tracking your progress</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium"
            >
              <Plus size={18} />
              Create Goal
            </motion.button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl">
            {goals.map((goal) => {
              const daysLeft = getDaysLeft(goal.deadline)
              const progress = getProgressPercentage(goal)
              const isExpanded = expandedGoal === goal.id

              return (
                <motion.div
                  key={goal.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-[#161B22] rounded-lg border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] overflow-hidden"
                >
                  {/* Goal Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[#1F2937] dark:text-[#E6EDF3] mb-2">
                          {goal.title}
                        </h3>
                        {goal.description && (
                          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-3">
                            {goal.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openEditModal(goal)}
                          className="p-2 rounded-lg hover:bg-[#F3F4F6] dark:hover:bg-[#1C2128] text-[#6B7280] dark:text-[#9CA3AF]"
                        >
                          <Edit2 size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="p-2 rounded-lg hover:bg-[#FEE2E2] dark:hover:bg-[rgba(239,68,68,0.1)] text-[#EF4444] dark:text-[#F87171]"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </div>

                    {/* Deadline Info */}
                    {goal.deadline && (
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar size={16} className="text-[#6B7280] dark:text-[#9CA3AF]" />
                          <span className="text-[#6B7280] dark:text-[#9CA3AF]">
                            {format(new Date(goal.deadline), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        {daysLeft !== null && (
                          <div className="flex items-center gap-2">
                            <Clock size={16} className={daysLeft < 7 ? 'text-[#EF4444]' : 'text-[#3B82F6]'} />
                            <span className={`text-sm font-medium ${daysLeft < 7 ? 'text-[#EF4444] dark:text-[#F87171]' : 'text-[#3B82F6] dark:text-[#60A5FA]'}`}>
                              {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : daysLeft === 0 ? 'Due today' : `${daysLeft} days left`}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">Progress</span>
                        <span className="text-xs font-semibold text-[#3B82F6] dark:text-[#60A5FA]">{progress}%</span>
                      </div>
                      <div className="h-2 bg-[#F3F4F6] dark:bg-[#1C2128] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5 }}
                          className="h-full bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] rounded-full"
                        />
                      </div>
                    </div>

                    {/* Steps Summary */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flag size={16} className="text-[#6B7280] dark:text-[#9CA3AF]" />
                        <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                          {goal.steps.filter(s => s.completed).length} of {goal.steps.length} steps completed
                        </span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                        className="text-sm font-medium text-[#3B82F6] dark:text-[#60A5FA] hover:underline"
                      >
                        {isExpanded ? 'Hide Steps' : 'View Steps'}
                      </motion.button>
                    </div>
                  </div>

                  {/* Steps Section */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#F9FAFB] dark:bg-[#0D1117]"
                      >
                        <div className="p-6 space-y-3">
                          {goal.steps.map((step) => (
                            <motion.div
                              key={step.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center gap-3 group"
                            >
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => toggleStepCompletion(step.id)}
                                className="flex-shrink-0"
                              >
                                {step.completed ? (
                                  <CheckCircle size={20} className="text-[#22C55E] dark:text-[#4ADE80]" />
                                ) : (
                                  <Circle size={20} className="text-[#D1D5DB] dark:text-[#374151]" />
                                )}
                              </motion.button>
                              
                              {editingStep?.id === step.id ? (
                                <input
                                  type="text"
                                  value={editingStep.title}
                                  onChange={(e) => setEditingStep({ ...editingStep, title: e.target.value })}
                                  onBlur={handleUpdateStep}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleUpdateStep()
                                    if (e.key === 'Escape') setEditingStep(null)
                                  }}
                                  autoFocus
                                  className="flex-1 px-3 py-2 bg-white dark:bg-[#161B22] border border-[#3B82F6] dark:border-[#60A5FA] rounded-lg text-sm text-[#1F2937] dark:text-[#E6EDF3] focus:outline-none"
                                />
                              ) : (
                                <span
                                  className={`flex-1 text-sm ${
                                    step.completed
                                      ? 'line-through text-[#9CA3AF] dark:text-[#6B7280]'
                                      : 'text-[#1F2937] dark:text-[#E6EDF3]'
                                  }`}
                                >
                                  {step.title}
                                </span>
                              )}
                              
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => setEditingStep({ id: step.id, title: step.title })}
                                  className="p-1.5 rounded hover:bg-[#F3F4F6] dark:hover:bg-[#1C2128] text-[#6B7280] dark:text-[#9CA3AF]"
                                >
                                  <Edit2 size={14} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => deleteStep(step.id)}
                                  className="p-1.5 rounded hover:bg-[#FEE2E2] dark:hover:bg-[rgba(239,68,68,0.1)] text-[#EF4444] dark:text-[#F87171]"
                                >
                                  <Trash2 size={14} />
                                </motion.button>
                              </div>
                            </motion.div>
                          ))}

                          {/* Add Step Input */}
                          <div className="flex items-center gap-2 pt-2">
                            <Plus size={20} className="text-[#9CA3AF] dark:text-[#6B7280]" />
                            <input
                              type="text"
                              placeholder="Add a new step..."
                              value={newStepTitle}
                              onChange={(e) => setNewStepTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddStep(goal.id)
                              }}
                              className="flex-1 px-3 py-2 bg-white dark:bg-[#161B22] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-[#1F2937] dark:text-[#E6EDF3] placeholder-[#9CA3AF] dark:placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] dark:focus:border-[#60A5FA]"
                            />
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleAddStep(goal.id)}
                              disabled={!newStepTitle.trim()}
                              className="px-3 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Add
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#161B22] rounded-lg shadow-2xl w-full max-w-md"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-[#1F2937] dark:text-[#E6EDF3] mb-6">
                  {editingGoal ? 'Edit Goal' : 'Create New Goal'}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#374151] dark:text-[#D1D5DB] mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      placeholder="Enter goal title..."
                      className="w-full px-3 py-2 bg-[#F9FAFB] dark:bg-[#0D1117] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-lg text-[#1F2937] dark:text-[#E6EDF3] placeholder-[#9CA3AF] dark:placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] dark:focus:border-[#60A5FA]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#374151] dark:text-[#D1D5DB] mb-2">
                      Description
                    </label>
                    <textarea
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                      placeholder="Add a description..."
                      rows={3}
                      className="w-full px-3 py-2 bg-[#F9FAFB] dark:bg-[#0D1117] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-lg text-[#1F2937] dark:text-[#E6EDF3] placeholder-[#9CA3AF] dark:placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] dark:focus:border-[#60A5FA] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#374151] dark:text-[#D1D5DB] mb-2">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                      className="w-full px-3 py-2 bg-[#F9FAFB] dark:bg-[#0D1117] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-lg text-[#1F2937] dark:text-[#E6EDF3] focus:outline-none focus:border-[#3B82F6] dark:focus:border-[#60A5FA]"
                    />
                  </div>

                  {!editingGoal && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">
                          Steps (Optional)
                        </label>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={addStepToNewGoal}
                          type="button"
                          className="flex items-center gap-1 text-xs text-[#3B82F6] dark:text-[#60A5FA] hover:underline"
                        >
                          <Plus size={14} />
                          Add Step
                        </motion.button>
                      </div>
                      
                      {newGoalSteps.length > 0 && (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {newGoalSteps.map((step, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={step}
                                onChange={(e) => updateNewGoalStep(index, e.target.value)}
                                placeholder={`Step ${index + 1}...`}
                                className="flex-1 px-3 py-2 bg-[#F9FAFB] dark:bg-[#0D1117] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-[#1F2937] dark:text-[#E6EDF3] placeholder-[#9CA3AF] dark:placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] dark:focus:border-[#60A5FA]"
                              />
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removeNewGoalStep(index)}
                                type="button"
                                className="p-2 rounded-lg hover:bg-[#FEE2E2] dark:hover:bg-[rgba(239,68,68,0.1)] text-[#EF4444] dark:text-[#F87171]"
                              >
                                <Trash2 size={16} />
                              </motion.button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {newGoalSteps.length === 0 && (
                        <p className="text-xs text-[#9CA3AF] dark:text-[#6B7280] italic">
                          Click "Add Step" to add steps to your goal
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowModal(false)}
                    type="button"
                    className="flex-1 px-4 py-2 rounded-lg border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F9FAFB] dark:hover:bg-[#1C2128] font-medium"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={editingGoal ? handleUpdateGoal : handleCreateGoal}
                    type="button"
                    disabled={!newGoal.title.trim()}
                    className="flex-1 px-4 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingGoal ? 'Update Goal' : 'Create Goal'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
