import { getAllTemplates } from '@/core/registry'
import { useConfigStore } from '@/store/config'
import { cn } from '@/lib/utils'
import { LayoutDashboard } from 'lucide-react'

export function Sidebar() {
  const templates = getAllTemplates()
  const { activeTemplateId, setActiveTemplate } = useConfigStore()

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-muted/30 flex flex-col h-screen sticky top-0">
      <div className="px-4 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <LayoutDashboard size={18} className="text-primary" />
          <span className="text-sm font-semibold text-foreground">Automator UI</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Context builder for orchestrators</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">Templates</p>
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTemplate(t.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors',
              activeTemplateId === t.id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            {t.icon && <span className="text-base leading-none">{t.icon}</span>}
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{t.name}</p>
              <p className="text-xs truncate opacity-70">{t.description}</p>
            </div>
          </button>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-border">
        <p className="text-xs text-muted-foreground">Output: markdown context file</p>
      </div>
    </aside>
  )
}
