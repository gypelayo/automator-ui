import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Template, FieldSchema, SectionSchema, FieldValues, FieldValue } from '@automator/core'

interface TemplateStore {
  templates: Template[]
  
  // CRUD operations
  addTemplate: (template: Template) => void
  updateTemplate: (id: string, updates: Partial<Omit<Template, 'id' | 'render'>>) => void
  deleteTemplate: (id: string) => void
  getTemplate: (id: string) => Template | undefined
  getAllTemplates: () => Template[]
  
  // Section operations
  addSection: (templateId: string, section: SectionSchema) => void
  updateSection: (templateId: string, sectionId: string, updates: Partial<SectionSchema>) => void
  deleteSection: (templateId: string, sectionId: string) => void
  reorderSections: (templateId: string, sectionIds: string[]) => void
  
  // Field operations
  addField: (templateId: string, sectionId: string, field: FieldSchema) => void
  updateField: (templateId: string, sectionId: string, fieldId: string, updates: Partial<FieldSchema>) => void
  deleteField: (templateId: string, sectionId: string, fieldId: string) => void
  reorderFields: (templateId: string, sectionId: string, fieldIds: string[]) => void
}

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set, get) => ({
      templates: [],

      addTemplate: (template) => {
        set((state) => ({
          templates: [...state.templates, template],
        }))
      },

      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }))
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }))
      },

      getTemplate: (id) => {
        return get().templates.find((t) => t.id === id)
      },

      getAllTemplates: () => {
        return get().templates
      },

      addSection: (templateId, section) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === templateId
              ? { ...t, sections: [...t.sections, section] }
              : t
          ),
        }))
      },

      updateSection: (templateId, sectionId, updates) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === templateId
              ? {
                  ...t,
                  sections: t.sections.map((s) =>
                    s.id === sectionId ? { ...s, ...updates } : s
                  ),
                }
              : t
          ),
        }))
      },

      deleteSection: (templateId, sectionId) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === templateId
              ? { ...t, sections: t.sections.filter((s) => s.id !== sectionId) }
              : t
          ),
        }))
      },

      reorderSections: (templateId, sectionIds) => {
        set((state) => ({
          templates: state.templates.map((t) => {
            if (t.id !== templateId) return t
            const sectionMap = new Map(t.sections.map((s) => [s.id, s]))
            const reordered = sectionIds.map((id) => sectionMap.get(id)!).filter(Boolean)
            return { ...t, sections: reordered }
          }),
        }))
      },

      addField: (templateId, sectionId, field) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === templateId
              ? {
                  ...t,
                  sections: t.sections.map((s) =>
                    s.id === sectionId
                      ? { ...s, fields: [...s.fields, field] }
                      : s
                  ),
                }
              : t
          ),
        }))
      },

      updateField: (templateId, sectionId, fieldId, updates) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === templateId
              ? {
                  ...t,
                  sections: t.sections.map((s) =>
                    s.id === sectionId
                      ? {
                          ...s,
                          fields: s.fields.map((f) =>
                            f.id === fieldId ? { ...f, ...updates } : f
                          ),
                        }
                      : s
                  ),
                }
              : t
          ),
        }))
      },

      deleteField: (templateId, sectionId, fieldId) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === templateId
              ? {
                  ...t,
                  sections: t.sections.map((s) =>
                    s.id === sectionId
                      ? { ...s, fields: s.fields.filter((f) => f.id !== fieldId) }
                      : s
                  ),
                }
              : t
          ),
        }))
      },

      reorderFields: (templateId, sectionId, fieldIds) => {
        set((state) => ({
          templates: state.templates.map((t) => {
            if (t.id !== templateId) return t
            return {
              ...t,
              sections: t.sections.map((s) => {
                if (s.id !== sectionId) return s
                const fieldMap = new Map(s.fields.map((f) => [f.id, f]))
                const reordered = fieldIds.map((id) => fieldMap.get(id)!).filter(Boolean)
                return { ...s, fields: reordered }
              }),
            }
          }),
        }))
      },
    }),
    {
      name: 'automator-templates',
    }
  )
)

// Helper to get default value for a field
export function getFieldDefaultValue(field: FieldSchema): FieldValue {
  switch (field.type) {
    case 'slider':
      return field.default
    case 'toggle':
      return field.default
    case 'text':
    case 'textarea':
      return field.default
    case 'select':
      return field.default
    case 'multi-select':
      return field.default
    case 'budget-split':
      return field.default ?? []
    default:
      return ''
  }
}

// Helper to get all default values for a template
export function getTemplateDefaultValues(template: Template): FieldValues {
  const defaults: FieldValues = {}
  for (const section of template.sections) {
    for (const field of section.fields) {
      defaults[field.id] = getFieldDefaultValue(field)
    }
  }
  return defaults
}
