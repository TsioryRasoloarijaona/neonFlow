import { Button } from '../ui/Button'
import { Search } from 'lucide-react'

interface TopbarProps {
  onCommandOpen: () => void
  isDark: boolean
  onToggleTheme: () => void
}

export function Topbar({ onCommandOpen, isDark, onToggleTheme }: TopbarProps) {

  return (
    <header className={`
      h-14 flex items-center justify-between px-4 
      border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)]
      bg-white dark:bg-[#161B22]
      transition-colors duration-200
    `}>
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <button
            onClick={onCommandOpen}
            className={`
              w-full h-[40px] px-3 rounded-md 
              border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)]
              bg-[#F9FAFB] dark:bg-[#1C2128]
              hover:border-[#2563EB] dark:hover:border-[#3B82F6]
              transition-all duration-200
              text-left text-sm 
              flex items-center gap-2
              text-[#6B7280] dark:text-[#9CA3AF]
              focus:outline-none focus:ring-2 focus:ring-[rgba(37,99,235,0.4)] dark:focus:ring-[rgba(59,130,246,0.4)]
            `}
          >
            <Search size={16} strokeWidth={2} />
            <span>Search...</span>
            <kbd className={`
              ml-auto px-1.5 py-0.5 text-xs rounded 
              bg-white dark:bg-[#161B22]
              border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)]
              text-[#6B7280] dark:text-[#9CA3AF]
            `}>
              ⌘K
            </kbd>
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-4">
        <Button
          variant="ghost"
          size="md"
          onClick={onToggleTheme}
          className="h-[40px] w-[40px] p-0"
        >
          {isDark ? '☀️' : '🌙'}
        </Button>
      </div>
    </header>
  )
}

