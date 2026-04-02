import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FieldValues, FieldValue } from '@automator/core'
import { getTemplate as getCoreTemplate, getAllTemplates as getCoreTemplates } from '@automator/core'
import { getDefaultValues } from '@automator/core'
import { useTemplateStore } from './templates'

interface ConfigStore {
  // Active template
  activeTemplateId: string | null
  
  // Edit mode
  isEditMode: boolean
  editingTemplateId: string | null

  // Per-template values keyed by templateId
  templateValues: Record<string, FieldValues>

  // Actions
  setActiveTemplate: (templateId: string) => void
  goHome: () => void
  setFieldValue: (templateId: string, fieldId: string, value: FieldValue) => void
  resetTemplate: (templateId: string) => void
  setEditMode: (isEditing: boolean, templateId?: string | null) => void

  // Derived
  getActiveValues: () => FieldValues
  getCompiledMarkdown: () => string
}

// Helper to get template (checks both core and custom)
function getTemplate(id: string): ReturnType<typeof getCoreTemplate> {
  const customTemplates = useTemplateStore.getState().getAllTemplates()
  return getCoreTemplate(id, customTemplates) ?? undefined
}

function getAllTemplates(): ReturnType<typeof getCoreTemplates> {
  const customTemplates = useTemplateStore.getState().getAllTemplates()
  return getCoreTemplates(customTemplates)
}

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set, get) => ({
      activeTemplateId: null,
      isEditMode: false,
      editingTemplateId: null,
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

      goHome: () => {
        set({ activeTemplateId: null, isEditMode: false, editingTemplateId: null })
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

      setEditMode: (isEditing: boolean, templateId: string | null = null) => {
        set({ isEditMode: isEditing, editingTemplateId: templateId })
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
          state.activeTemplateId = null
        }
      },
    },
  ),
)
