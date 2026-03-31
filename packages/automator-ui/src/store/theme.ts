import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeId =
  | 'default'
  | 'gruvbox'
  | 'nord'
  | 'dracula'
  | 'tokyo'
  | 'catppuccin'
  | 'solarized'

export interface ThemeDefinition {
  id: ThemeId
  name: string
  /** Swatch colors [bg, primary] */
  swatches: [string, string]
}

export const THEMES: ThemeDefinition[] = [
  { id: 'default',    name: 'Default',    swatches: ['#141720', '#8b5cf6'] },
  { id: 'gruvbox',    name: 'Gruvbox',    swatches: ['#282828', '#d79921'] },
  { id: 'nord',       name: 'Nord',       swatches: ['#2e3440', '#88c0d0'] },
  { id: 'dracula',    name: 'Dracula',    swatches: ['#282a36', '#bd93f9'] },
  { id: 'tokyo',      name: 'Tokyo Night',swatches: ['#1a1b26', '#bb9af7'] },
  { id: 'catppuccin', name: 'Catppuccin', swatches: ['#1e1e2e', '#cba6f7'] },
  { id: 'solarized',  name: 'Solarized',  swatches: ['#002b36', '#2aa198'] },
]

interface ThemeStore {
  theme: ThemeId
  setTheme: (id: ThemeId) => void
}

function applyTheme(id: ThemeId) {
  document.documentElement.setAttribute('data-theme', id)
  // All themes are dark; keep .dark on root so Tailwind dark: utilities still work
  document.documentElement.classList.add('dark')
  console.log('Theme applied:', id)
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'default',
      setTheme: (id) => {
        set({ theme: id })
        applyTheme(id)
      },
    }),
    {
      name: 'automator-ui-theme',
      onRehydrateStorage: () => (state) => {
        applyTheme(state?.theme ?? 'default')
      },
    },
  ),
)

/** Call once on app boot before React mounts */
export function initTheme() {
  const raw = localStorage.getItem('automator-ui-theme')
  let id: ThemeId = 'default'
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { state?: { theme?: ThemeId } }
      id = parsed.state?.theme ?? 'default'
    } catch {
      // ignore
    }
  }
  applyTheme(id)
}
