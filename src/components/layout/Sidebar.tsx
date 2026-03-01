import { motion } from 'framer-motion'
import { LayoutDashboard, CheckSquare, Target, FileText, Flame, Zap, Settings, Flag } from 'lucide-react'

interface SidebarProps {
  currentPage: string
  onNavigate: (page: string) => void
  isDark: boolean
}

const menuItems = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'focus', label: 'Focus', icon: Target },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'habits', label: 'Habits', icon: Flame },
  { id: 'goals', label: 'Goals', icon: Flag },
  { id: 'automations', label: 'Auto', icon: Zap },
  { id: 'settings', label: 'Settings', icon: Settings }
]

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside className={`
      w-20 flex flex-col items-center py-4
      border-r border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)]
      bg-white dark:bg-[#161B22]
      transition-colors duration-200
    `}>
      {/* Logo */}
      <div className="mb-6">
        <img 
          src="./assets/neonFlowLogo_med.png" 
          alt="NeonFlow Logo" 
          className="w-12 h-12 rounded-lg object-contain"
        />
      </div>

      {/* Menu Items */}
      <nav className="flex-1 flex flex-col gap-4 w-full px-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate(item.id)}
              className={`
                relative w-full h-[44px] rounded-md
                flex flex-col items-center justify-center gap-1
                transition-all duration-200 text-xs
                ${
                  currentPage === item.id
                    ? 'bg-[#EFF6FF] dark:bg-[rgba(59,130,246,0.15)] text-[#2563EB] dark:text-[#60A5FA] font-medium'
                    : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1F2937] dark:hover:text-[#E6EDF3] hover:bg-[#F9FAFB] dark:hover:bg-[#1C2128]'
                }
              `}
              title={item.label}
            >
              <Icon size={20} strokeWidth={2} />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
              
              {currentPage === item.id && (
                <motion.div
                  layoutId="activePage"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-7 rounded-r bg-[#2563EB] dark:bg-[#3B82F6]"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="w-10 h-[1px] bg-[rgba(0,0,0,0.06)] dark:bg-[rgba(255,255,255,0.06)] my-3" />

      {/* User Avatar */}
      <div className={`
        w-10 h-10 rounded-full 
        flex items-center justify-center 
        text-sm font-semibold
        bg-[#EFF6FF] dark:bg-[rgba(59,130,246,0.15)]
        text-[#2563EB] dark:text-[#60A5FA]
        cursor-pointer
        hover:bg-[#DBEAFE] dark:hover:bg-[rgba(59,130,246,0.2)]
        transition-colors duration-200
      `}>
        U
      </div>
    </aside>
  )
}

