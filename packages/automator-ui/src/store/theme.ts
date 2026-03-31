import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeStore {
  dark: boolean
  toggle: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      dark: window.matchMedia('(prefers-color-scheme: dark)').matches,
      toggle: () => {
        const next = !get().dark
        set({ dark: next })
        document.documentElement.classList.toggle('dark', next)
      },
    }),
    {
      name: 'automator-ui-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.classList.toggle('dark', state.dark)
        }
      },
    },
  ),
)

/** Call once on app boot to sync the DOM class with persisted state */
export function initTheme() {
  const raw = localStorage.getItem('automator-ui-theme')
  if (raw) {
    try {
      const { state } = JSON.parse(raw) as { state: { dark: boolean } }
      document.documentElement.classList.toggle('dark', state.dark)
    } catch {
      // ignore
    }
  } else {
    // default to system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.classList.toggle('dark', prefersDark)
  }
}
