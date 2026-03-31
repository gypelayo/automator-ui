import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FieldValues, FieldValue } from '@automator/core'
import { getTemplate, getAllTemplates } from '@automator/core'
import { getDefaultValues } from '@automator/core'

interface ConfigStore {
  // Active template
  activeTemplateId: string | null

  // Per-template values keyed by templateId
  templateValues: Record<string, FieldValues>

  // Actions
  setActiveTemplate: (templateId: string) => void
  setFieldValue: (templateId: string, fieldId: string, value: FieldValue) => void
  resetTemplate: (templateId: string) => void

  // Derived
  getActiveValues: () => FieldValues
  getCompiledMarkdown: () => string
}

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set, get) => ({
      activeTemplateId: null,
      templateValues: {},

      setActiveTemplate: (templateId: string) => {
        const template = getTemplate(templateId)
        if (!template) return

        set((state) => {
          // Compute full defaults for this template
          const defaults: FieldValues = {}
          for (const section of template.sections) {
            Object.assign(defaults, getDefaultValues(section.fields))
          }

          // Merge: existing values win, but any missing keys get their default
          // This handles new fields added to a template after first use
          const existing = state.templateValues[templateId] ?? {}
          const merged = { ...defaults, ...existing }

          return {
            activeTemplateId: templateId,
            templateValues: { ...state.templateValues, [templateId]: merged },
          }
        })
      },

      setFieldValue: (templateId, fieldId, value) => {
        set((state) => ({
          templateValues: {
            ...state.templateValues,
            [templateId]: {
              ...(state.templateValues[templateId] ?? {}),
              [fieldId]: value,
            },
          },
        }))
      },

      resetTemplate: (templateId) => {
        const template = getTemplate(templateId)
        if (!template) return

        const defaults: FieldValues = {}
        for (const section of template.sections) {
          Object.assign(defaults, getDefaultValues(section.fields))
        }

        set((state) => ({
          templateValues: { ...state.templateValues, [templateId]: defaults },
        }))
      },

      getActiveValues: () => {
        const { activeTemplateId, templateValues } = get()
        if (!activeTemplateId) return {}
        return templateValues[activeTemplateId] ?? {}
      },

      getCompiledMarkdown: () => {
        const { activeTemplateId } = get()
        if (!activeTemplateId) return ''
        const template = getTemplate(activeTemplateId)
        if (!template) return ''
        const values = get().getActiveValues()
        return template.render(values)
      },
    }),
    {
      name: 'automator-ui-config',
      partialize: (state) => ({
        activeTemplateId: state.activeTemplateId,
        templateValues: state.templateValues,
      }),
      // After rehydration, ensure the active template still exists
      onRehydrateStorage: () => (state) => {
        if (!state) return
        const templates = getAllTemplates()
        if (
          state.activeTemplateId &&
          !templates.find((t) => t.id === state.activeTemplateId)
        ) {
          state.activeTemplateId = templates[0]?.id ?? null
        }
      },
    },
  ),
)
