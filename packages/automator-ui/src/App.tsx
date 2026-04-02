import { useEffect } from 'react'
import { registerAllTemplates } from '@/templates'
import { getAllTemplates as getCoreTemplates, getTemplate as getCoreTemplate } from '@automator/core'
import { useConfigStore } from '@/store/config'
import { useTemplateStore } from '@/store/templates'
import { LandingPage } from '@/components/layout/LandingPage'
import { TemplateForm } from '@/components/builder/TemplateForm'
import { TemplateBuilder } from '@/components/builder/TemplateBuilder'
import { OutputPanel } from '@/components/output/OutputPanel'
import { ChevronLeft } from 'lucide-react'

// Register templates once at module level
registerAllTemplates()

// Helper to get template (checks both core and custom)
function getTemplate(id: string) {
  const customTemplates = useTemplateStore.getState().getAllTemplates()
  return getCoreTemplate(id, customTemplates)
}

function getAllTemplates() {
  const customTemplates = useTemplateStore.getState().getAllTemplates()
  return getCoreTemplates(customTemplates)
}

export default function App() {
  const { activeTemplateId, setActiveTemplate, goHome, isEditMode, editingTemplateId, setEditMode } = useConfigStore()
  useTemplateStore((state) => state.templates)

  // Clear stale activeTemplateId from localStorage if the template no longer exists
  useEffect(() => {
    if (activeTemplateId) {
      const template = getTemplate(activeTemplateId)
      if (!template) {
        setActiveTemplate('')
      }
    }
  }, [])

  const handleEditSave = () => {
    setEditMode(false)
    const templates = getAllTemplates()
    if (templates.length > 0) {
      setActiveTemplate(templates[templates.length - 1].id)
    }
  }

  const handleEditCancel = () => {
    setEditMode(false)
    if (editingTemplateId) {
      setActiveTemplate(editingTemplateId)
    }
    // If creating new was cancelled and no template was active, go back to landing
  }

  // Edit mode: full-screen builder, no sidebar
  if (isEditMode) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <TemplateBuilder
            templateId={editingTemplateId || undefined}
            onSave={handleEditSave}
            onCancel={handleEditCancel}
          />
        </main>
      </div>
    )
  }

  const template = activeTemplateId ? getTemplate(activeTemplateId) : null

  // No template selected → show landing page
  if (!template) {
    return <LandingPage />
  }

  // Template selected → full-width layout, no sidebar
  return (
    <div className="flex min-h-screen bg-background text-foreground">

      <main className="flex-1 min-w-0 flex flex-col">
        {/* Sticky top bar */}
        <header
          className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 h-12 shrink-0"
          style={{
            backgroundColor: 'hsl(var(--background))',
            borderBottom: '1px solid hsl(var(--border) / 0.6)',
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={goHome}
              className="shrink-0 flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-foreground transition-colors"
              title="Back to home"
            >
              <ChevronLeft size={13} />
              Home
            </button>
            <span className="text-border/50 text-xs">/</span>
            {template.icon && (
              <span className="text-lg leading-none shrink-0">{template.icon}</span>
            )}
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-foreground leading-tight truncate">
                {template.name}
              </h1>
              {template.description && (
                <p className="text-[11px] text-muted-foreground/70 truncate leading-tight">
                  {template.description}
                </p>
              )}
            </div>
          </div>

          <div className="shrink-0">
            <OutputPanel />
          </div>
        </header>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-2xl mx-auto">
            <TemplateForm
              sections={template.sections}
              templateId={template.id}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
