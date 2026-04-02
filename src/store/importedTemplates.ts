import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TemplateDefinition } from '@/core/types'
import { registerTemplate } from '@/core/registry'
import { templateFromDefinition } from '@/core/compiler'

interface ImportedTemplatesStore {
  definitions: TemplateDefinition[]
  addDefinition: (def: TemplateDefinition) => void
  removeDefinition: (id: string) => void
}

export const useImportedTemplatesStore = create<ImportedTemplatesStore>()(
  persist(
    (set) => ({
      definitions: [],

      addDefinition: (def: TemplateDefinition) => {
        // Register into the live registry immediately
        registerTemplate(templateFromDefinition(def))
        set((state) => {
          const filtered = state.definitions.filter((d) => d.id !== def.id)
          return { definitions: [...filtered, def] }
        })
      },

      removeDefinition: (id: string) => {
        set((state) => ({
          definitions: state.definitions.filter((d) => d.id !== id),
        }))
      },
    }),
    {
      name: 'automator-ui-imported-templates',
      // Re-register all persisted definitions into the live registry on hydration
      onRehydrateStorage: () => (state) => {
        if (!state) return
        for (const def of state.definitions) {
          registerTemplate(templateFromDefinition(def))
        }
      },
    },
  ),
)
