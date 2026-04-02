import { useEffect, useRef } from 'react'
import { useAgentStore } from '@/store/agent'
import { useTemplateStore } from '@/store/templates'
import { createTemplateRender } from '@automator/core'
import type { Template } from '@automator/core'

type TemplateDefinition = Omit<Template, 'render'>

/**
 * Polls the configured agent URL for templates and merges them into
 * the local template store. New templates are added; existing ones
 * (matched by id) are updated if the definition has changed.
 *
 * Mount this once at the app root.
 */
export function useAgentSync() {
  const { agentUrl, pollInterval } = useAgentStore()
  const { templates, addTemplate, updateTemplate } = useTemplateStore()
  // Keep a stable ref so the interval closure always sees the latest templates
  const templatesRef = useRef(templates)
  useEffect(() => { templatesRef.current = templates }, [templates])

  useEffect(() => {
    if (!agentUrl || pollInterval <= 0) return

    async function poll() {
      try {
        const res = await fetch(`${agentUrl}/templates`, { signal: AbortSignal.timeout(4000) })
        if (!res.ok) return
        const defs = await res.json() as TemplateDefinition[]
        if (!Array.isArray(defs)) return

        for (const def of defs) {
          if (!def.id || !def.name || !Array.isArray(def.sections)) continue
          const existing = templatesRef.current.find((t) => t.id === def.id)
          if (!existing) {
            addTemplate({ ...def, render: createTemplateRender(def as Template) })
          } else {
            // Only update if something actually changed (avoid churn)
            const changed =
              existing.name !== def.name ||
              existing.description !== def.description ||
              existing.icon !== def.icon ||
              JSON.stringify(existing.sections) !== JSON.stringify(def.sections)
            if (changed) {
              updateTemplate(def.id, {
                name: def.name,
                description: def.description,
                icon: def.icon,
                sections: def.sections,
              })
            }
          }
        }
      } catch {
        // Silently ignore network errors — agent may not be running
      }
    }

    poll() // run immediately on mount / config change
    const id = setInterval(poll, pollInterval)
    return () => clearInterval(id)
  }, [agentUrl, pollInterval, addTemplate, updateTemplate])
}
