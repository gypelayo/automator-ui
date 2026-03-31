import { useEffect } from 'react'
import { registerAllTemplates } from '@/templates'
import { getAllTemplates as getCoreTemplates, getTemplate as getCoreTemplate } from '@automator/core'
import { useConfigStore } from '@/store/config'
import { useTemplateStore } from '@/store/templates'
import { Sidebar } from '@/components/layout/Sidebar'
import { TemplateForm } from '@/components/builder/TemplateForm'
import { TemplateBuilder } from '@/components/builder/TemplateBuilder'
import { OutputPanel } from '@/components/output/OutputPanel'

// Register templates once at module level
console.log('registerAllTemplates called')
registerAllTemplates()
console.log('templates registered')

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
  const { activeTemplateId, setActiveTemplate, isEditMode, editingTemplateId, setEditMode } = useConfigStore()
  const customTemplates = useTemplateStore((state) => state.templates)

  useEffect(() => {
    const templates = getAllTemplates()
    console.log('Templates found:', templates.length, templates.map(t => t.id))
    if (!activeTemplateId && templates[0]) {
      setActiveTemplate(templates[0].id)
    }
  }, [activeTemplateId, customTemplates])

  const handleEditSave = () => {
    setEditMode(false)
    // Switch to the template we just created/edited
    const templates = getAllTemplates()
    if (templates.length > 0) {
      setActiveTemplate(templates[templates.length - 1].id)
    }
  }

  const handleEditCancel = () => {
    setEditMode(false)
    // If we were editing an existing template, go back to it
    if (editingTemplateId) {
      setActiveTemplate(editingTemplateId)
    } else if (activeTemplateId) {
      // Stay on current template if creating new was cancelled
    } else {
      const templates = getAllTemplates()
      if (templates[0]) setActiveTemplate(templates[0].id)
    }
  }

  if (isEditMode) {
    return (
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar />
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

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col">
        {template ? (
          <>
            {/* Sticky top bar */}
            <header
              className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 h-14 border-b shrink-0"
              style={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                {template.icon && (
                  <span className="text-xl leading-none shrink-0">{template.icon}</span>
                )}
                <div className="min-w-0">
                  <h1 className="text-sm font-semibold text-foreground leading-tight truncate">
                    {template.name}
                  </h1>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {template.description}
                  </p>
                </div>
              </div>

              {/* Output actions inline in header */}
              <div className="shrink-0">
                <OutputPanel />
              </div>
            </header>

            {/* Scrollable form body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <TemplateForm
                sections={template.sections}
                templateId={template.id}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Select a template from the sidebar to get started
          </div>
        )}
      </main>
    </div>
  )
}
