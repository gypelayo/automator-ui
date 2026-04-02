import { useRef, useState } from 'react'
import { getAllTemplates, getTemplate } from '@/core/registry'
import { useConfigStore } from '@/store/config'
import { useImportedTemplatesStore } from '@/store/importedTemplates'
import { useThemeStore } from '@/store/theme'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Upload,
  Download,
  Trash2,
} from 'lucide-react'
import type { TemplateDefinition } from '@/core/types'

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { activeTemplateId, setActiveTemplate } = useConfigStore()
  const { dark, toggle: toggleTheme } = useThemeStore()
  const { definitions, addDefinition, removeDefinition } = useImportedTemplatesStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)

  // Always read from registry so newly imported templates appear immediately.
  // Referencing `definitions` makes this re-run when imports change.
  void definitions
  const templates = getAllTemplates()
  const importedIds = new Set(definitions.map((d) => d.id))

  function handleImportClick() {
    setImportError(null)
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const raw = ev.target?.result as string
        const def = JSON.parse(raw) as TemplateDefinition
        if (!def.id || !def.name || !Array.isArray(def.sections)) {
          setImportError('Invalid template file')
          return
        }
        addDefinition(def)
        setActiveTemplate(def.id)
      } catch {
        setImportError('Could not parse JSON file')
      }
    }
    reader.readAsText(file)
    // Reset so the same file can be re-imported after deletion
    e.target.value = ''
  }

  function handleExport(templateId: string) {
    const template = getTemplate(templateId)
    if (!template) return
    const def: TemplateDefinition = {
      id: template.id,
      name: template.name,
      description: template.description,
      icon: template.icon,
      sections: template.sections,
    }
    const blob = new Blob([JSON.stringify(def, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${template.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleDelete(id: string) {
    removeDefinition(id)
    if (activeTemplateId === id) {
      const remaining = templates.find((t) => t.id !== id)
      if (remaining) setActiveTemplate(remaining.id)
    }
  }

  return (
    <aside
      className={cn(
        'shrink-0 border-r border-border bg-muted/30 flex flex-col h-screen sticky top-0 transition-all duration-200',
        collapsed ? 'w-14' : 'w-64',
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
          <div
            key={t.id}
            className={cn(
              'group flex items-center rounded-md transition-colors',
              collapsed ? 'justify-center' : 'gap-1',
              activeTemplateId === t.id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            {/* Main button */}
            <button
              onClick={() => setActiveTemplate(t.id)}
              title={collapsed ? t.name : undefined}
              className={cn(
                'flex-1 flex items-center text-left min-w-0',
                collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
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

            {/* Action icons (only when expanded) */}
            {!collapsed && (
              <div className="flex items-center gap-0.5 pr-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => handleExport(t.id)}
                  title="Export as JSON"
                  className="rounded p-1 hover:bg-accent hover:text-foreground transition-colors"
                >
                  <Download size={12} />
                </button>
                {importedIds.has(t.id) && (
                  <button
                    onClick={() => handleDelete(t.id)}
                    title="Remove imported template"
                    className="rounded p-1 hover:bg-destructive/20 hover:text-destructive transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Import error */}
      {importError && !collapsed && (
        <div className="mx-2 mb-2 px-3 py-2 rounded-md bg-destructive/10 text-destructive text-xs">
          {importError}
        </div>
      )}

      {/* Import button */}
      <div className={cn('border-t border-border px-2 py-2')}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={handleImportClick}
          title="Import template from JSON"
          className={cn(
            'w-full flex items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors text-xs',
            collapsed ? 'justify-center py-2' : 'gap-2 px-3 py-2',
          )}
        >
          <Upload size={14} className="shrink-0" />
          {!collapsed && <span>Import template</span>}
        </button>
      </div>

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
