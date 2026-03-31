import type { Template } from './types'

const registry = new Map<string, Template>()

export function registerTemplate(template: Template): void {
  registry.set(template.id, template)
}

export function getTemplate(id: string, customTemplates: Template[] = []): Template | undefined {
  return registry.get(id) ?? customTemplates.find((t) => t.id === id)
}

export function getAllTemplates(customTemplates: Template[] = []): Template[] {
  return [...Array.from(registry.values()), ...customTemplates]
}
