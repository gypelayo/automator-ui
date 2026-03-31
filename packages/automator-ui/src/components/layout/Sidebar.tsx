import { useState } from 'react'
import { getAllTemplates } from '@automator/core'
import { useConfigStore } from '@/store/config'
import { useThemeStore } from '@/store/theme'
import { cn } from '@/lib/utils'
import { LayoutDashboard, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react'

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const templates = getAllTemplates()
  const { activeTemplateId, setActiveTemplate } = useConfigStore()
  const { dark, toggle: toggleTheme } = useThemeStore()

  return (
    <aside
      className={cn(
        'shrink-0 border-r border-border bg-muted/30 flex flex-col h-screen sticky top-0 transition-all duration-200',
        collapsed ? 'w-14' : 'w-60',
      )}
    >
      {/* Header */}
      <div className={cn('flex items-center border-b border-border h-14', collapsed ? 'justify-center px-0' : 'px-4 gap-2.5')}>
        {!collapsed && (
          <>
            <LayoutDashboard size={17} className="text-primary shrink-0" />
            <span className="text-sm font-semibold text-foreground truncate">Automator UI</span>
          </>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            'rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors',
            collapsed ? '' : 'ml-auto',
          )}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {!collapsed && (
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
            Templates
          </p>
        )}
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTemplate(t.id)}
            title={collapsed ? t.name : undefined}
            className={cn(
              'w-full flex items-center rounded-md text-left transition-colors',
              collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
              activeTemplateId === t.id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            {t.icon && <span className="text-base leading-none shrink-0">{t.icon}</span>}
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{t.name}</p>
                <p className="text-xs truncate opacity-70">{t.description}</p>
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Footer: dark mode toggle */}
      <div className={cn('border-t border-border flex items-center h-12', collapsed ? 'justify-center' : 'px-3 gap-2')}>
        <button
          onClick={toggleTheme}
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
