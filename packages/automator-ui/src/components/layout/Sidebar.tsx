import { useState } from 'react'
import { getAllTemplates as getCoreTemplates } from '@automator/core'
import { useConfigStore } from '@/store/config'
import { useTemplateStore } from '@/store/templates'
import { useThemeStore, THEMES } from '@/store/theme'
import { cn } from '@/lib/utils'
import { LayoutDashboard, ChevronLeft, ChevronRight, Palette, Plus, Pencil } from 'lucide-react'

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const coreTemplates = getCoreTemplates()
  const customTemplates = useTemplateStore.getState().getAllTemplates()
  const allTemplates = [...coreTemplates, ...customTemplates]
  const { activeTemplateId, setActiveTemplate, setEditMode } = useConfigStore()
  const { theme, setTheme } = useThemeStore()

  const activeTheme = THEMES.find((t) => t.id === theme) ?? THEMES[0]

  return (
    <aside
      className={cn(
        'shrink-0 flex flex-col h-screen sticky top-0 transition-all duration-200',
        'border-r',
        collapsed ? 'w-14' : 'w-60',
      )}
      style={{
        backgroundColor: 'hsl(var(--sidebar-bg))',
        borderColor: 'hsl(var(--sidebar-border))',
      }}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center h-14 border-b',
          collapsed ? 'justify-center px-0' : 'px-4 gap-2.5',
        )}
        style={{ borderColor: 'hsl(var(--sidebar-border))' }}
      >
        {!collapsed && (
          <>
            <LayoutDashboard size={16} className="text-primary shrink-0" />
            <span className="text-sm font-semibold text-foreground tracking-tight truncate">
              Automator
            </span>
          </>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            'rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors',
            collapsed ? '' : 'ml-auto',
          )}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-2">
            Templates
          </p>
        )}
        {allTemplates.map((t) => {
          const active = activeTemplateId === t.id
          const isCustom = t.id.startsWith('custom-')
          return (
            <div key={t.id} className="group relative">
              <button
                onClick={() => setActiveTemplate(t.id)}
                title={collapsed ? t.name : undefined}
                className={cn(
                  'w-full flex items-center rounded text-left transition-all duration-150',
                  collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
                  active
                    ? 'bg-primary/15 text-primary border-l-2 border-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground border-l-2 border-transparent',
                )}
              >
                {t.icon && (
                  <span className="text-base leading-none shrink-0">{t.icon}</span>
                )}
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{t.name}</p>
                    <p className="text-[11px] truncate opacity-60 mt-0.5">{t.description}</p>
                  </div>
                )}
              </button>
              {/* Edit button for custom templates */}
              {isCustom && !collapsed && (
                <button
                  onClick={(e) => { e.stopPropagation(); setEditMode(true, t.id) }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
                  title="Edit template"
                >
                  <Pencil size={12} />
                </button>
              )}
            </div>
          )
        })}
        
        {/* Create new template button */}
        {!collapsed && (
          <button
            onClick={() => setEditMode(true, null)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-left text-muted-foreground hover:bg-accent hover:text-foreground border border-dashed border-muted-foreground/30 transition-colors"
          >
            <Plus size={14} />
            <span className="text-sm font-medium">Create Template</span>
          </button>
        )}
      </nav>

      {/* Footer: theme picker */}
      <div
        className="border-t"
        style={{ borderColor: 'hsl(var(--sidebar-border))' }}
      >
        {/* Theme list (shown above footer when open) */}
        {themeOpen && !collapsed && (
          <div
            className="px-2 py-2 space-y-0.5 border-b"
            style={{ borderColor: 'hsl(var(--sidebar-border))' }}
          >
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-2">
              Theme
            </p>
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id); setThemeOpen(false) }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-2 py-1.5 rounded text-left transition-colors',
                  theme === t.id
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                {/* Swatch */}
                <span className="flex shrink-0 gap-0.5 rounded overflow-hidden w-7 h-4 border border-border/50">
                  <span className="flex-1" style={{ background: t.swatches[0] }} />
                  <span className="flex-1" style={{ background: t.swatches[1] }} />
                </span>
                <span className="text-xs font-medium">{t.name}</span>
                {theme === t.id && (
                  <span className="ml-auto text-[10px] text-primary font-mono">●</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Toggle button */}
        <button
          onClick={() => setThemeOpen((o) => !o)}
          title="Change theme"
          className={cn(
            'w-full flex items-center h-11 transition-colors hover:bg-accent hover:text-foreground',
            collapsed ? 'justify-center px-0' : 'px-3 gap-2.5',
            themeOpen ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          <Palette size={14} className="shrink-0" />
          {!collapsed && (
            <>
              <span className="text-xs font-medium truncate">{activeTheme.name}</span>
              {/* swatch dot */}
              <span
                className="ml-auto w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-border"
                style={{ background: activeTheme.swatches[1] }}
              />
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
