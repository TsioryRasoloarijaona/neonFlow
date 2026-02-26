import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1F2937] dark:text-[#E6EDF3] mb-2">Settings</h1>
        <p className="text-[#6B7280] dark:text-[#9CA3AF]">Customize your NeonFlow experience</p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-[#1F2937] dark:text-[#E6EDF3] mb-4">Appearance</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-medium block mb-2">
              Theme
            </label>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] text-sm">Dark mode only in V1</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-[#1F2937] dark:text-[#E6EDF3] mb-4">Pomodoro</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-medium block mb-2">
              Focus Duration
            </label>
            <input
              type="number"
              defaultValue={25}
              className="w-full h-[40px] px-3 bg-white dark:bg-[#161B22] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-md text-[#1F2937] dark:text-[#E6EDF3] focus:outline-none focus:ring-2 focus:ring-[rgba(37,99,235,0.4)] dark:focus:ring-[rgba(59,130,246,0.4)] transition-all duration-200"
            />
          </div>
          <div>
            <label className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-medium block mb-2">
              Short Break
            </label>
            <input
              type="number"
              defaultValue={5}
              className="w-full h-[40px] px-3 bg-white dark:bg-[#161B22] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-md text-[#1F2937] dark:text-[#E6EDF3] focus:outline-none focus:ring-2 focus:ring-[rgba(37,99,235,0.4)] dark:focus:ring-[rgba(59,130,246,0.4)] transition-all duration-200"
            />
          </div>
          <div>
            <label className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-medium block mb-2">
              Long Break
            </label>
            <input
              type="number"
              defaultValue={15}
              className="w-full h-[40px] px-3 bg-white dark:bg-[#161B22] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-md text-[#1F2937] dark:text-[#E6EDF3] focus:outline-none focus:ring-2 focus:ring-[rgba(37,99,235,0.4)] dark:focus:ring-[rgba(59,130,246,0.4)] transition-all duration-200"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-[#1F2937] dark:text-[#E6EDF3] mb-4">Notifications</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              defaultChecked 
              className="w-5 h-5 rounded border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#2563EB] focus:ring-2 focus:ring-[rgba(37,99,235,0.4)] dark:focus:ring-[rgba(59,130,246,0.4)] bg-white dark:bg-[#161B22] cursor-pointer" 
            />
            <span className="text-[#1F2937] dark:text-[#E6EDF3]">Task due date reminders</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              defaultChecked 
              className="w-5 h-5 rounded border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#2563EB] focus:ring-2 focus:ring-[rgba(37,99,235,0.4)] dark:focus:ring-[rgba(59,130,246,0.4)] bg-white dark:bg-[#161B22] cursor-pointer" 
            />
            <span className="text-[#1F2937] dark:text-[#E6EDF3]">Focus session completion</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              defaultChecked 
              className="w-5 h-5 rounded border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#2563EB] focus:ring-2 focus:ring-[rgba(37,99,235,0.4)] dark:focus:ring-[rgba(59,130,246,0.4)] bg-white dark:bg-[#161B22] cursor-pointer" 
            />
            <span className="text-[#1F2937] dark:text-[#E6EDF3]">Habit streak milestones</span>
          </label>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-[#1F2937] dark:text-[#E6EDF3] mb-4">About</h2>
        <div className="space-y-2 text-sm">
          <p className="text-[#6B7280] dark:text-[#9CA3AF]">
            <strong className="text-[#1F2937] dark:text-[#E6EDF3]">Version:</strong> 1.0.0
          </p>
          <p className="text-[#6B7280] dark:text-[#9CA3AF]">
            <strong className="text-[#1F2937] dark:text-[#E6EDF3]">License:</strong> MIT
          </p>
          <p className="text-[#6B7280] dark:text-[#9CA3AF]">
            <strong className="text-[#1F2937] dark:text-[#E6EDF3]">Built with:</strong> Electron + React + TypeScript
          </p>
        </div>
        <Button variant="secondary" className="mt-4">
          Check for Updates
        </Button>
      </Card>
    </div>
  )
}
