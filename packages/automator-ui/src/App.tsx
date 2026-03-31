import { useEffect } from 'react'
import { registerAllTemplates } from '@/templates'
import { getAllTemplates, getTemplate } from '@automator/core'
import { useConfigStore } from '@/store/config'
import { Sidebar } from '@/components/layout/Sidebar'
import { TemplateForm } from '@/components/builder/TemplateForm'
import { OutputPanel } from '@/components/output/OutputPanel'

// Register templates once at module level
registerAllTemplates()

export default function App() {
  const { activeTemplateId, setActiveTemplate } = useConfigStore()

  useEffect(() => {
    if (!activeTemplateId) {
      const templates = getAllTemplates()
      if (templates[0]) setActiveTemplate(templates[0].id)
    }
  }, [activeTemplateId, setActiveTemplate])

  const template = activeTemplateId ? getTemplate(activeTemplateId) : null

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />

      <main className="flex-1 overflow-y-auto px-6 py-6 min-w-0">
        {template ? (
          <>
            {/* Template header + export actions */}
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                {template.icon && (
                  <span className="text-2xl leading-none">{template.icon}</span>
                )}
                <div>
                  <h1 className="text-xl font-semibold text-foreground">{template.name}</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">{template.description}</p>
                </div>
              </div>
              <div className="shrink-0">
                <OutputPanel />
              </div>
            </div>

            <TemplateForm
              sections={template.sections}
              templateId={template.id}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Select a template from the sidebar to get started
          </div>
        )}
      </main>
    </div>
  )
}
