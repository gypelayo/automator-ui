import { useState } from 'react'
import { TripForm } from '@/components/layout/TripForm'
import { ResultsPanel } from '@/components/results/ResultsPanel'
import { useThemeStore } from '@/store/theme'
import { useRunStore } from '@/store/run'
import { useTripStore } from '@/store/trip'
import { cn } from '@/lib/utils'
import { Plane, Sun, Moon, ChevronLeft, ChevronRight, History } from 'lucide-react'
import { Button } from '@/components/ui/button'

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { dark, toggle } = useThemeStore()
  const { panelOpen, status } = useRunStore()

  return (
    <aside
      className={cn(
        'shrink-0 border-r border-border bg-muted/30 flex flex-col h-screen sticky top-0 transition-all duration-200',
        collapsed ? 'w-14' : 'w-52',
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          'flex items-center border-b border-border h-14',
          collapsed ? 'justify-center px-0' : 'px-4 gap-2.5',
        )}
      >
        {!collapsed && (
          <>
            <Plane size={16} className="text-primary shrink-0" />
            <span className="text-sm font-semibold text-foreground truncate">Trip Planner</span>
          </>
        )}
        <button
          onClick={onToggle}
          className={cn(
            'rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors',
            collapsed ? '' : 'ml-auto',
          )}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        <button
          className={cn(
            'w-full flex items-center rounded-md text-left transition-colors',
            collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
            'bg-primary/10 text-primary',
          )}
          title={collapsed ? 'Planner' : undefined}
        >
          <Plane size={15} className="shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Planner</span>}
        </button>

        {(panelOpen || status !== 'idle') && (
          <button
            className={cn(
              'w-full flex items-center rounded-md text-left transition-colors',
              collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
              'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
            title={collapsed ? 'Results' : undefined}
            onClick={() => { if (!useRunStore.getState().panelOpen) useRunStore.setState({ panelOpen: true }) }}
          >
            <History size={15} className="shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Results</span>}
          </button>
        )}
      </nav>

      {/* Footer: dark mode toggle */}
      <div
        className={cn(
          'border-t border-border flex items-center h-12',
          collapsed ? 'justify-center' : 'px-3 gap-2',
        )}
      >
        <button
          onClick={toggle}
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        {!collapsed && (
          <span className="text-xs text-muted-foreground">{dark ? 'Light mode' : 'Dark mode'}</span>
        )}
      </div>
    </aside>
  )
}

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((c) => !c)} />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Plane size={16} className="text-primary shrink-0" />
            <span className="text-sm font-semibold text-foreground">Trip Planner</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              — real flights & hotels, AI-curated itinerary
            </span>
          </div>
          <RunButton />
        </div>

        {/* Form */}
        <div className="max-w-xl mx-auto px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Plan your trip</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure your preferences, hit run, and get real flight + hotel options with a day-by-day itinerary.
            </p>
          </div>
          <TripForm />
        </div>
      </main>

      {/* Results slide-in */}
      <ResultsPanel />
    </div>
  )
}

/** Floating Run button shown in the top bar (mirrors the one in TripForm) */
function RunButton() {
  const { status, panelOpen } = useRunStore()
  const { compile } = useTripStore()
  const { destination, origin, departureDate } = useTripStore((s) => s.config)

  const running = status === 'running'
  const ready = destination.trim() && origin.trim() && departureDate

  if (panelOpen && status !== 'idle') return null

  return (
    <Button
      size="sm"
      className="gap-2"
      disabled={running || !ready}
      onClick={() => useRunStore.getState().startRun(compile())}
    >
      {running ? (
        <>
          <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full" />
          Running
        </>
      ) : (
        <>
          <Plane size={13} />
          Find Flights & Hotels
        </>
      )}
    </Button>
  )
}

