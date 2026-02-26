import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Sidebar from './components/layout/Sidebar'
import { Topbar } from './components/layout/Topbar'
import Dashboard from './components/pages/Dashboard'
import Tasks from './components/pages/Tasks'
import Focus from './components/pages/Focus.tsx'
import Notes from './components/pages/Notes.tsx'
import Habits from './components/pages/Habits.tsx'
import Automations from './components/pages/Automations.tsx'
import Settings from './components/pages/Settings.tsx'
import { CommandPalette } from './components/ui/CommandPalette.tsx'
import { ToastContainer } from './components/ui/Toast'
import ErrorBoundary from './components/ErrorBoundary.tsx'

type Page = 'dashboard' | 'tasks' | 'focus' | 'notes' | 'habits' | 'automations' | 'settings'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [commandOpen, setCommandOpen] = useState(false)
  const [isDark, setIsDark] = useState(true)
  const [triggerNewTask, setTriggerNewTask] = useState(false)
  const [triggerStartFocus, setTriggerStartFocus] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    document.body.classList.toggle('dark', isDark)
    document.body.classList.toggle('light', !isDark)
  }, [isDark])

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'tasks':
        return <Tasks selectedTaskId={selectedItemId} triggerNewTask={triggerNewTask} onNewTaskHandled={() => setTriggerNewTask(false)} />
      case 'focus':
        return <Focus triggerStart={triggerStartFocus} onStartHandled={() => setTriggerStartFocus(false)} />
      case 'notes':
        return <Notes selectedNoteId={selectedItemId} />
      case 'habits':
        return <Habits selectedHabitId={selectedItemId} />
      case 'automations':
        return <Automations />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const isMod = e.metaKey || e.ctrlKey

    if (isMod && e.key === 'k') {
      e.preventDefault()
      setCommandOpen(true)
    }

    if (isMod && e.shiftKey && e.key === 'F') {
      e.preventDefault()
      setCurrentPage('focus')
    }
  }

  return (
    <ErrorBoundary>
      <div 
        className={`
          w-screen h-screen flex overflow-hidden 
          transition-colors duration-200
          ${isDark ? 'bg-[#0D1117]' : 'bg-[#F7F8FA]'}
        `}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <Sidebar 
          currentPage={currentPage} 
          onNavigate={(page) => {
            setCurrentPage(page as Page)
            setSelectedItemId(null)
          }}
          isDark={isDark}
        />
        
        <div className="flex-1 flex flex-col">
          <Topbar 
            onCommandOpen={() => setCommandOpen(true)}
            isDark={isDark}
            onToggleTheme={() => setIsDark(!isDark)}
          />
          
          <motion.main
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="flex-1 overflow-auto p-6"
          >
            {renderPage()}
          </motion.main>
        </div>

        <CommandPalette
          open={commandOpen}
          onClose={() => setCommandOpen(false)}
          onNavigate={(page: string, itemId?: string) => {
            setCurrentPage(page as Page)
            setSelectedItemId(itemId || null)
            setCommandOpen(false)
          }}
          onNewTask={() => {
            setCurrentPage('tasks')
            setSelectedItemId(null)
            setTriggerNewTask(true)
          }}
          onStartFocus={() => {
            setCurrentPage('focus')
            setSelectedItemId(null)
            setTriggerStartFocus(true)
          }}
        />

        <ToastContainer />
      </div>
    </ErrorBoundary>
  )
}

export default App
