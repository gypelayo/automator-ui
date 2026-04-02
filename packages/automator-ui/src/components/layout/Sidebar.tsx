import { useRef, useState } from 'react'
import { getAllTemplates as getCoreTemplates } from '@automator/core'
import { createTemplateRender } from '@automator/core'
import { useConfigStore } from '@/store/config'
import { useTemplateStore } from '@/store/templates'
import { useThemeStore, THEMES } from '@/store/theme'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Palette,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Download,
} from 'lucide-react'
import type { Template } from '@automator/core'

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const coreTemplates = getCoreTemplates()
  const { templates: customTemplates, addTemplate, deleteTemplate } = useTemplateStore()
  void customTemplates // subscribe so list re-renders on changes
  const allTemplates = [...coreTemplates, ...useTemplateStore.getState().getAllTemplates()]
  const { activeTemplateId, setActiveTemplate, setEditMode } = useConfigStore()
  const { theme, setTheme } = useThemeStore()

  const activeTheme = THEMES.find((t) => t.id === theme) ?? THEMES[0]

  function handleDelete(templateId: string) {
    if (!confirm('Delete this template? This cannot be undone.')) return
    deleteTemplate(templateId)
    // If the deleted template was active, fall back to the first remaining one
    if (activeTemplateId === templateId) {
      const remaining = [...coreTemplates, ...useTemplateStore.getState().getAllTemplates()]
      setActiveTemplate(remaining[0]?.id ?? '')
    }
  }

  // --- Import from JSON file ---
  function handleImportClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const raw = ev.target?.result as string
        const def = JSON.parse(raw) as Omit<Template, 'render'>
        if (!def.id || !def.name || !Array.isArray(def.sections)) {
          alert('Invalid template file: missing id, name, or sections.')
          return
        }
        const template: Template = { ...def, render: createTemplateRender(def as Template) }
        addTemplate(template)
        setActiveTemplate(template.id)
      } catch {
        alert('Could not parse JSON file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // --- Export template as JSON ---
  function handleExport(templateId: string) {
    const all = [...coreTemplates, ...useTemplateStore.getState().getAllTemplates()]
    const template = all.find((t) => t.id === templateId)
    if (!template) return
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { render: _render, ...def } = template
    const blob = new Blob([JSON.stringify(def, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${template.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

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
            <div key={t.id}>
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
                {t.icon && <span className="text-base leading-none shrink-0">{t.icon}</span>}
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{t.name}</p>
                    <p className="text-[11px] truncate opacity-60 mt-0.5">{t.description}</p>
                  </div>
                )}
              </button>

              {/* Always-visible action row for custom templates */}
              {isCustom && !collapsed && (
                <div className="flex items-center gap-1 px-3 pb-1.5 -mt-1">
                  <button
                    onClick={() => handleExport(t.id)}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Download size={10} /> Export
                  </button>
                  <span className="text-muted-foreground/30">·</span>
                  <button
                    onClick={() => setEditMode(true, t.id)}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Pencil size={10} /> Edit
                  </button>
                  <span className="text-muted-foreground/30">·</span>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={10} /> Delete
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {/* Actions */}
        {!collapsed && (
          <div className="pt-2 space-y-0.5">
            <button
              onClick={() => setEditMode(true, null)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-left text-muted-foreground hover:bg-accent hover:text-foreground border border-dashed border-muted-foreground/30 transition-colors"
            >
              <Plus size={13} />
              <span className="text-xs font-medium">Create template</span>
            </button>

            <button
              onClick={handleImportClick}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-left text-muted-foreground hover:bg-accent hover:text-foreground border border-dashed border-muted-foreground/30 transition-colors"
            >
              <Upload size={13} />
              <span className="text-xs font-medium">Import from JSON</span>
            </button>
          </div>
        )}
      </nav>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Footer */}
      <div
        className="border-t"
        style={{ borderColor: 'hsl(var(--sidebar-border))' }}
      >
        {/* Theme list */}
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
                <span className="flex shrink-0 gap-0.5 rounded overflow-hidden w-7 h-4 border border-border/50">
                  <span className="flex-1" style={{ background: t.swatches[0] }} />
                  <span className="flex-1" style={{ background: t.swatches[1] }} />
                </span>
                <span className="text-xs font-medium">{t.name}</span>
                {theme === t.id && <span className="ml-auto text-[10px] text-primary font-mono">●</span>}
              </button>
            ))}
          </div>
        )}

        {/* Theme button */}
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
