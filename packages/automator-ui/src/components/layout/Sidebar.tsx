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
  void customTemplates
  const allTemplates = [...coreTemplates, ...useTemplateStore.getState().getAllTemplates()]
  const customIds = new Set(useTemplateStore.getState().getAllTemplates().map((t) => t.id))
  const { activeTemplateId, setActiveTemplate, setEditMode } = useConfigStore()
  const { theme, setTheme } = useThemeStore()

  const activeTheme = THEMES.find((t) => t.id === theme) ?? THEMES[0]

  function handleDelete(templateId: string) {
    if (!confirm('Delete this template? This cannot be undone.')) return
    deleteTemplate(templateId)
    if (activeTemplateId === templateId) {
      const remaining = [...coreTemplates, ...useTemplateStore.getState().getAllTemplates()]
      setActiveTemplate(remaining[0]?.id ?? '')
    }
  }

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
        collapsed ? 'w-12' : 'w-56',
      )}
      style={{
        backgroundColor: 'hsl(var(--sidebar-bg))',
        borderColor: 'hsl(var(--sidebar-border))',
      }}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center h-12 border-b shrink-0',
          collapsed ? 'justify-center' : 'px-3 gap-2',
        )}
        style={{ borderColor: 'hsl(var(--sidebar-border))' }}
      >
        {!collapsed && (
          <>
            <div
              className="w-5 h-5 rounded flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'hsl(var(--primary))' }}
            >
              <LayoutDashboard size={11} style={{ color: 'hsl(var(--primary-foreground))' }} />
            </div>
            <span className="text-xs font-semibold tracking-widest uppercase text-foreground/70 truncate">
              Automator
            </span>
          </>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            'rounded p-1 text-muted-foreground hover:text-foreground transition-colors',
            collapsed ? '' : 'ml-auto',
          )}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-1.5 space-y-px">
        {!collapsed && (
          <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-[0.12em] px-2 pt-1 pb-2">
            Templates
          </p>
        )}

        {allTemplates.map((t) => {
          const active = activeTemplateId === t.id
          const isCustom = customIds.has(t.id)
          return (
            <div key={t.id}>
              <button
                onClick={() => setActiveTemplate(t.id)}
                title={collapsed ? t.name : undefined}
                className={cn(
                  'w-full flex items-center gap-2.5 rounded-md text-left transition-all duration-100',
                  collapsed ? 'justify-center p-2.5' : 'px-2.5 py-2',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/60',
                )}
                style={
                  active
                    ? { backgroundColor: 'hsl(var(--primary) / 0.1)' }
                    : {}
                }
              >
                {t.icon
                  ? <span className="text-sm leading-none shrink-0">{t.icon}</span>
                  : <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: active ? 'hsl(var(--primary))' : 'hsl(var(--border))' }} />
                }
                {!collapsed && (
                  <span className="text-[13px] font-medium truncate leading-snug">{t.name}</span>
                )}
              </button>

              {/* Action row — custom templates only */}
              {isCustom && !collapsed && (
                <div className="flex items-center gap-2.5 px-2.5 pb-1.5">
                  <button
                    onClick={() => handleExport(t.id)}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground/70 hover:text-foreground transition-colors"
                  >
                    <Download size={9} />Export
                  </button>
                  <span className="text-border">·</span>
                  <button
                    onClick={() => setEditMode(true, t.id)}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground/70 hover:text-foreground transition-colors"
                  >
                    <Pencil size={9} />Edit
                  </button>
                  <span className="text-border">·</span>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground/70 hover:text-destructive transition-colors"
                  >
                    <Trash2 size={9} />Delete
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {/* Actions */}
        {!collapsed && (
          <div className="pt-3 space-y-px">
            <div
              className="h-px w-full mb-2"
              style={{ backgroundColor: 'hsl(var(--sidebar-border))' }}
            />
            <button
              onClick={() => setEditMode(true, null)}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
            >
              <Plus size={12} />
              <span className="text-xs">New template</span>
            </button>
            <button
              onClick={handleImportClick}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
            >
              <Upload size={12} />
              <span className="text-xs">Import JSON</span>
            </button>
          </div>
        )}
      </nav>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Footer */}
      <div
        className="border-t shrink-0"
        style={{ borderColor: 'hsl(var(--sidebar-border))' }}
      >
        {/* Theme picker */}
        {themeOpen && !collapsed && (
          <div
            className="px-1.5 py-2 border-b"
            style={{ borderColor: 'hsl(var(--sidebar-border))' }}
          >
            <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-[0.12em] px-2 pb-2">
              Theme
            </p>
            <div className="space-y-px">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTheme(t.id); setThemeOpen(false) }}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-left transition-colors',
                    theme === t.id
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/60',
                  )}
                  style={theme === t.id ? { backgroundColor: 'hsl(var(--primary) / 0.1)' } : {}}
                >
                  <span className="flex shrink-0 gap-px rounded-sm overflow-hidden w-6 h-3.5">
                    <span className="flex-1" style={{ background: t.swatches[0] }} />
                    <span className="flex-1" style={{ background: t.swatches[1] }} />
                  </span>
                  <span className="text-xs font-medium">{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setThemeOpen((o) => !o)}
          title="Change theme"
          className={cn(
            'w-full flex items-center h-10 transition-colors hover:bg-accent/60',
            collapsed ? 'justify-center' : 'px-3 gap-2.5',
            themeOpen ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Palette size={13} className="shrink-0" />
          {!collapsed && (
            <>
              <span className="text-xs truncate">{activeTheme.name}</span>
              <span
                className="ml-auto w-2 h-2 rounded-full shrink-0"
                style={{ background: activeTheme.swatches[1] }}
              />
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
