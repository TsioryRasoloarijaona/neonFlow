import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeStore {
  isDark: boolean
  toggle: () => void
  setTheme: (isDark: boolean) => void
}

export const useTheme = create<ThemeStore>()(
  persist(
    (set) => ({
      isDark: true,
      toggle: () => set((state) => {
        const newIsDark = !state.isDark
        document.documentElement.classList.toggle('dark', newIsDark)
        document.body.classList.toggle('dark', newIsDark)
        document.body.classList.toggle('light', !newIsDark)
        return { isDark: newIsDark }
      }),
      setTheme: (isDark) => set(() => {
        document.documentElement.classList.toggle('dark', isDark)
        document.body.classList.toggle('dark', isDark)
        document.body.classList.toggle('light', !isDark)
        return { isDark }
      }),
    }),
    {
      name: 'theme-storage',
    }
  )
)
